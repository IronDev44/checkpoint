import {captureBackup,deviceRead} from './deviceStore';
const records=new Map();
beforeAll(()=>{
 Object.defineProperty(global,'crypto',{configurable:true,value:{randomUUID:()=>Math.random().toString(36)}});
 global.indexedDB={open:()=>{const request={};Promise.resolve().then(()=>{request.result={createObjectStore:()=>{},transaction:()=>{const tx={};tx.objectStore=()=>({get:key=>{const read={};Promise.resolve().then(()=>{read.result=records.get(key);read.onsuccess?.();});return read;},put:value=>{records.set(value.key,JSON.parse(JSON.stringify(value)));Promise.resolve().then(()=>tx.oncomplete?.());}});return tx;}};request.onupgradeneeded?.();request.onsuccess?.();});return request;}};
});
beforeEach(()=>records.clear());
test('copies are isolated by account and detached from subsequent edits',async()=>{
 const payload={games:[{id:'one',name:'Portal'}],hardware:[]};await captureBackup('alice',payload);payload.games[0].name='Changed';
 expect((await deviceRead('alice','backups'))[0].payload.games[0].name).toBe('Portal');expect(await deviceRead('bob','backups')).toBeUndefined();
});
test('only one automatic daily copy and at most twenty versions are kept',async()=>{
 const payload={games:[],hardware:[]};await captureBackup('alice',payload);await captureBackup('alice',payload);expect(await deviceRead('alice','backups')).toHaveLength(1);
 for(let i=0;i<22;i++)await captureBackup('alice',payload,`Manual ${i}`,true);
 const versions=await deviceRead('alice','backups');expect(versions).toHaveLength(20);expect(versions[0].reason).toBe('Manual 21');
});
test('concurrent safety copies cannot overwrite one another',async()=>{
 await Promise.all([captureBackup('alice',{games:[],hardware:[]},'Before import',true),captureBackup('alice',{games:[],hardware:[]},'Before restoration',true)]);
 expect((await deviceRead('alice','backups')).map(v=>v.reason)).toEqual(['Before restoration','Before import']);
});
