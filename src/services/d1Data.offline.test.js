const mockRecords=new Map();
import {auth as mockAuth} from '../firebase';
jest.mock('../firebase',()=>({auth:{currentUser:{uid:'alice',getIdToken:async()=> 'token'}}}));
jest.mock('./accountConfig',()=>({d1Enabled:true}));
jest.mock('./deviceStore',()=>({deviceRead:async(owner,key)=>JSON.parse(JSON.stringify(mockRecords.get(`${owner}:${key}`)??null)),deviceWrite:async(owner,key,value)=>mockRecords.set(`${owner}:${key}`,JSON.parse(JSON.stringify(value)))}));
import {onSnapshot,updateDoc,setDoc,deleteDoc,doc,syncOffline,offlineState,discardConflict,keepLocalConflict,getDoc,listTrash,serverTimestamp} from './d1Data';
import {deviceRead,deviceWrite} from './deviceStore';
beforeEach(async()=>{
 mockRecords.clear();mockAuth.currentUser={uid:'alice',getIdToken:async()=> 'token'};
 Object.defineProperty(navigator,'onLine',{configurable:true,value:false});
 Object.defineProperty(global,'crypto',{configurable:true,value:{randomUUID:()=>Math.random().toString(36)}});
 global.fetch=jest.fn(async()=>({ok:true,json:async()=>({ok:true})}));
 await deviceWrite('alice','cache:games',{documents:[{id:'one',data:{name:'Portal',rating:7}}]});
});
afterEach(()=>jest.restoreAllMocks());
test('offline edits are durable, ordered, and compare only the fields actually edited',async()=>{
 await updateDoc(doc(null,'games','one'),{rating:8});await updateDoc(doc(null,'games','one'),{rating:9});
 const state=await offlineState();expect(state.jobs).toHaveLength(2);expect(state.jobs.map(j=>j.body.base)).toEqual([{rating:7},{rating:8}]);expect(fetch).not.toHaveBeenCalled();
 Object.defineProperty(navigator,'onLine',{value:true});await syncOffline();
 expect((await offlineState()).jobs).toHaveLength(0);expect(fetch).toHaveBeenCalledTimes(2);expect((await deviceRead('alice','cache:games')).documents[0].data.rating).toBe(9);
});
test('cached collection overlays pending changes and deletions',async()=>{
 await updateDoc(doc(null,'games','one'),{rating:8});
 const callback=jest.fn();const stop=onSnapshot({collection:'games'},callback);await new Promise(r=>setTimeout(r,10));
 expect(callback.mock.calls[0][0].docs[0].data().rating).toBe(8);stop();
 await deleteDoc(doc(null,'games','one'));expect((await offlineState()).jobs[1].body.expected.rating).toBe(8);
});
test('an offline first addition can be displayed without an existing collection cache',async()=>{
 await setDoc(doc(null,'hardware','new'),{name:'Console'});
 const callback=jest.fn();const stop=onSnapshot({collection:'hardware'},callback);await new Promise(r=>setTimeout(r,10));
 expect(callback.mock.calls[0][0].docs[0].data().name).toBe('Console');stop();
});
test('a conflict retains the local changes and does not block another document',async()=>{
 await updateDoc(doc(null,'games','one'),{rating:8});await setDoc(doc(null,'hardware','new'),{name:'Console'});
 fetch.mockImplementation(async url=>({ok:!url.includes('id=one'),status:409,json:async()=>({error:'Conflit'})}));
 Object.defineProperty(navigator,'onLine',{value:true});await syncOffline();
 const state=await offlineState();expect(state.jobs).toHaveLength(1);expect(state.jobs[0].conflict).toBe(true);
 await discardConflict('games','one');expect((await offlineState()).jobs).toHaveLength(0);
});
test('a server error keeps the queue for retry',async()=>{
 await updateDoc(doc(null,'games','one'),{rating:8});fetch.mockRejectedValue(new TypeError('Network failed'));
 Object.defineProperty(navigator,'onLine',{value:true});await syncOffline();expect((await offlineState()).jobs).toHaveLength(1);
});
test('signing into another account never replays the previous account queue',async()=>{
 await updateDoc(doc(null,'games','one'),{rating:8});mockAuth.currentUser={uid:'bob',getIdToken:async()=> 'bob-token'};
 Object.defineProperty(navigator,'onLine',{value:true});await syncOffline();expect(fetch).not.toHaveBeenCalled();expect((await offlineState()).jobs).toEqual([]);expect((await deviceRead('alice','jobs'))).toHaveLength(1);
});

test('choosing the local changes keeps unrelated remote fields and checks the fetched version',async()=>{
 await updateDoc(doc(null,'games','one'),{rating:8});
 Object.defineProperty(navigator,'onLine',{value:true});
 fetch.mockImplementation(async(url,options)=>options.method==='GET'?{ok:true,json:async()=>({id:'one',exists:true,data:{name:'Portal',rating:6,review:'Remote review'}})}:{ok:false,status:409,json:async()=>({error:'Conflict'})});
 await syncOffline();await keepLocalConflict('games','one');
 const job=(await offlineState()).jobs[0];expect(job.body.data).toEqual({name:'Portal',rating:8,review:'Remote review'});expect(job.body.expected.rating).toBe(6);
});


test('offline settings keep their base and pending choices survive an online read',async()=>{
 await deviceWrite('alice','doc:playerPrivateSettings/main',{id:'main',exists:true,data:{appOptions:{notifications:{polls:true,monthly:true}},socialFriends:[{handle:'bob'}]}});
 await updateDoc(doc(null,'playerPrivateSettings','main'),{'appOptions.notifications.polls':false});
 expect((await offlineState()).jobs[0].body.base).toEqual({'appOptions.notifications.polls':true});
 const local=await getDoc(doc(null,'playerPrivateSettings','main'));expect(local.data().appOptions.notifications.polls).toBe(false);expect(local.data().socialFriends).toHaveLength(1);
 Object.defineProperty(navigator,'onLine',{value:true});fetch.mockImplementation(async(_url,options)=>options.method==='POST'?{ok:false,status:409,json:async()=>({error:'Changed remotely'})}:{ok:true,json:async()=>({id:'main',exists:true,data:{appOptions:{notifications:{polls:true,monthly:false}},socialFriends:[{handle:'bob'}]}})});
 const conflicted=await getDoc(doc(null,'playerPrivateSettings','main'));expect(conflicted.data().appOptions.notifications).toEqual({polls:false,monthly:false});expect((await offlineState()).jobs[0].conflict).toBe(true);
});
test('settings replay before a fresh read, with no leakage into the trash',async()=>{
 await deviceWrite('alice','doc:playerPrivateSettings/main',{id:'main',exists:true,data:{appOptions:{startTab:'home'}}});await updateDoc(doc(null,'playerPrivateSettings','main'),{'appOptions.startTab':'library'});
 Object.defineProperty(navigator,'onLine',{value:true});let saved=false;
 fetch.mockImplementation(async(url,options)=>{if(options.method==='POST'){saved=true;return {ok:true,json:async()=>({data:{appOptions:{startTab:'library'}}})};}return {ok:true,json:async()=>url.includes('trash=1')?{documents:[]}:{id:'main',exists:true,data:{appOptions:{startTab:saved?'library':'home'}}}};});
 expect((await getDoc(doc(null,'playerPrivateSettings','main'))).data().appOptions.startTab).toBe('library');expect((await offlineState()).jobs).toHaveLength(0);await listTrash();expect(fetch.mock.calls.filter(([url])=>url.includes('trash=1')).map(([url])=>url)).toHaveLength(2);
});
test('a changed account cannot receive an already requested document',async()=>{
 Object.defineProperty(navigator,'onLine',{value:true});let finish;
 fetch.mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));const task=getDoc(doc(null,'publicProfiles','alice'));await Promise.resolve();await Promise.resolve();
 mockAuth.currentUser={uid:'bob',getIdToken:async()=> 'bob-token'};finish({ok:true,json:async()=>({id:'alice',exists:true,data:{name:'Alice'}})});await expect(task).rejects.toThrow('Compte changé');
});
test('a synchronization burst refreshes the collection once instead of once per saved game',async()=>{
 await updateDoc(doc(null,'games','one'),{rating:8});await updateDoc(doc(null,'games','one'),{rating:9});Object.defineProperty(navigator,'onLine',{value:true});
 const callback=jest.fn();fetch.mockImplementation(async(_url,options)=>({ok:true,json:async()=>options.method==='GET'?{documents:[{id:'one',data:{name:'Portal',rating:9}}]}:{data:{name:'Portal',rating:JSON.parse(options.body).data.rating}}}));
 const stop=onSnapshot({collection:'games'},callback);await new Promise(resolve=>setTimeout(resolve,25));stop();expect(fetch.mock.calls.filter(([,options])=>options.method==='GET').length).toBeLessThanOrEqual(2);
});

test('server bookkeeping timestamps do not create false conflicts between independent setting edits',async()=>{
 await deviceWrite('alice','doc:playerPrivateSettings/main',{id:'main',exists:true,data:{appOptions:{startTab:'home'},updatedAt:'old'}});await updateDoc(doc(null,'playerPrivateSettings','main'),{'appOptions.startTab':'library',updatedAt:serverTimestamp()});expect((await offlineState()).jobs[0].body.base).toEqual({'appOptions.startTab':'home'});
});
