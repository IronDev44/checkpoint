import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {handleAccountApi} from '../public/account-api.js';
const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync('migrations/0001_documents.sql','utf8'));
const env={ACCOUNT_OWNER_UID:'owner',ACCOUNT_DB:{prepare(sql){return {bind(...values){const stmt=db.prepare(sql);return {first:async()=>stmt.get(...values)||null,all:async()=>({results:stmt.all(...values)}),run:async()=>({meta:{changes:Number(stmt.run(...values).changes)}})};}};}}};
const seed=(owner,collection,id,data)=>db.prepare('INSERT INTO documents(owner,collection,id,data) VALUES(?,?,?,?) ON CONFLICT(owner,collection,id) DO UPDATE SET data=excluded.data').run(owner,collection,id,JSON.stringify(data));
const publicProfile=(uid,mode='public')=>({ownerUid:uid,handle:uid,displayName:uid,visibility:mode,bio:'Une bio',photoURL:'https://example.test/photo.jpg',publicSections:{activity:true},recentActivity:[{id:'post',type:'Post',title:'Une publication',text:'Un texte publié',date:'2026-10-24T10:00:00Z'}]});
for(const uid of ['alice','bob','eve']){seed('__shared__','publicProfiles',uid,publicProfile(uid,uid==='bob'?'friends':'public'));seed(uid,'playerPrivateSettings','main',{socialProfile:{handle:uid,visibility:uid==='bob'?'friends':'public'},socialFriends:[]});}
const call=(uid,collection,body,params='')=>handleAccountApi(new Request(`https://test.example/api/account-data?collection=${collection}${params}`,{method:body?'POST':'GET',headers:uid?{Authorization:`Bearer ${uid}`}:{},...(body?{body:JSON.stringify(body)}:{})}),env,async token=>token);
const profile=async(uid,handle)=>(await(await call(uid,'publicProfiles',null,`&id=${handle}`)).json());
assert.equal((await profile('eve','bob')).exists,false);assert.equal((await profile('bob','bob')).exists,true);
let list=await(await call('eve','publicProfiles')).json();assert.equal(list.documents.some(row=>row.id==='bob'),false);
assert.equal((await call('alice','friendships',{action:'send',handle:'bob'})).status,200);
let requests=(await(await call('alice','friendships')).json()).connections;const id=requests[0].id;
assert.equal(requests[0].profile.photoURL,undefined); // Pending is not permission to inspect a friends-only profile.
await call('bob','friendships',{action:'accept',id});
assert.equal((await profile('alice','bob')).exists,true);assert.equal((await profile('eve','bob')).exists,false);
await call('alice','socialControls',{action:'mute',handle:'bob'});
assert.equal((await(await call('alice','socialControls')).json()).muted[0].handle,'bob');
assert.equal((await profile('alice','bob')).exists,true);assert.equal((await(await call('alice','friendships')).json()).connections[0].status,'accepted');
await call('alice','socialControls',{action:'unmute',handle:'bob'});
assert.equal((await(await call('alice','socialControls')).json()).muted.length,0);
const report={action:'report',handle:'bob',type:'activity',activityId:'post',reason:'spam',details:'Un message de test'};
assert.equal((await call('eve','socialReports',report)).status,403);
assert.equal((await call('bob','socialReports',report)).status,403);
assert.equal((await call('alice','socialReports',{...report,activityId:'missing'})).status,404);
assert.equal((await call('alice','socialReports',report)).status,200);
assert.equal((await call('alice','socialReports',report)).status,200);
assert.equal((await call('alice','socialReports')).status,403);
let reports=(await(await call('owner','socialReports')).json()).items;assert.equal(reports.length,1);assert.equal(reports[0].target.snapshot,'Un texte publié');
assert.equal((await call('alice','socialReports',{action:'status',id:reports[0].id,status:'resolved'})).status,403);
await call('owner','socialReports',{action:'status',id:reports[0].id,status:'resolved'});
assert.equal((await(await call('owner','socialReports')).json()).items[0].status,'resolved');
await call('bob','friendships',{action:'remove',id});
assert.equal((await profile('alice','bob')).exists,false);assert.equal((await call('alice','socialReactions',null,'&handle=bob')).status,403);
// First refusal: 24h; second: 7 days; third stops new requests from that sender.
for(let count=1;count<=3;count++){
 if(count>1)db.prepare("UPDATE documents SET data=json_set(data,'$.refusals.alice.at','2020-01-01T00:00:00Z','$.updatedAt','2020-01-01T00:00:00Z') WHERE collection='friendships' AND id=?").run(id);
 assert.equal((await call('alice','friendships',{action:'send',handle:'bob'})).status,200);
 await call('bob','friendships',{action:'decline',id});
 assert.equal((await call('alice','friendships',{action:'send',handle:'bob'})).status,count===3?403:429);
}
// Cancelling, removing or reversing requests cannot erase the refusal ledger.
db.prepare("UPDATE documents SET data=json_set(data,'$.status','removed') WHERE collection='friendships' AND id=?").run(id);
assert.equal((await call('alice','friendships',{action:'send',handle:'bob'})).status,403);
assert.equal((await call(null,'socialReports')).status,401);
const model=reports[0];
for(let index=0;index<55;index++)seed('__shared__','socialReports',index.toString(16).padStart(64,'0'),{...model,status:'new',createdAt:'2020-01-01T00:00:00Z'});
let page=await(await call('owner','socialReports')).json();assert.equal(page.items.length,50);assert.ok(page.cursor);
const second=await(await call('owner','socialReports',null,`&cursor=${encodeURIComponent(page.cursor)}`)).json();
assert.equal(second.items.length,6);assert.equal(new Set([...page.items,...second.items].map(item=>item.id)).size,56);assert.equal(second.cursor,null);
assert.equal((await call('owner','socialReports',null,'&cursor=bad')).status,400);
console.log('Social community: friends-only access, revocation, muted friends, private reports, owner moderation, duplicate protection and progressive refusal limits passed.');
