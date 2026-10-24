import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {handleAccountApi} from '../public/account-api.js';
const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync('migrations/0001_documents.sql','utf8'));
const env={ACCOUNT_DB:{prepare(sql){return {bind(...values){const stmt=db.prepare(sql);return {first:async()=>stmt.get(...values)||null,all:async()=>({results:stmt.all(...values)}),run:async()=>({meta:{changes:Number(stmt.run(...values).changes)}})};}};}}};
const seed=(owner,collection,id,data)=>db.prepare('INSERT INTO documents(owner,collection,id,data) VALUES(?,?,?,?)').run(owner,collection,id,JSON.stringify(data));
for(const uid of ['alice','bob','eve','private']){
 seed('__shared__','publicProfiles',uid,{ownerUid:uid,handle:uid,displayName:uid.toUpperCase(),visibility:'public'});
 seed(uid,'playerPrivateSettings','main',{socialProfile:{handle:uid,visibility:uid==='private'?'private':'public'},socialFriends:[]});
}
const call=(uid,body,method=body?'POST':'GET')=>handleAccountApi(new Request('https://test.example/api/account-data?collection=friendships',{method,headers:uid?{Authorization:`Bearer ${uid}`}:{},...(body?{body:JSON.stringify(body)}:{})}),env,async token=>token);
const list=async uid=>(await(await call(uid)).json()).connections;
assert.equal((await call(null)).status,401);
assert.equal((await call('alice',{action:'send',handle:'alice'})).status,400);
assert.equal((await call('alice',{action:'send',handle:'private'})).status,404);
assert.equal((await call('private',{action:'send',handle:'alice'})).status,400);
assert.equal((await call('alice',{action:'send',handle:'missing'})).status,404);
assert.equal((await call('alice',{action:'send',handle:'bob'})).status,200);
let alice=await list('alice'),bob=await list('bob');const id=alice[0].id;
assert.equal(alice[0].direction,'sent');assert.equal(bob[0].direction,'received');assert.equal(bob[0].status,'pending');
assert.equal(bob[0].profile.handle,'alice');assert.equal(JSON.stringify(bob).includes('sender'),false);
assert.equal((await list('eve')).length,0);
assert.equal((await call('eve',{action:'accept',id})).status,403);
assert.equal((await call('alice',{action:'accept',id})).status,403);
assert.equal((await call('alice',{action:'decline',id})).status,403);
assert.equal((await call('bob',{action:'cancel',id})).status,403);
assert.equal((await call('bob',{action:'send',handle:'alice'})).status,200);
assert.equal((await list('alice')).length,1);assert.equal((await list('alice'))[0].status,'pending'); // Crossing invitations never accept automatically.
assert.equal((await call('bob',{action:'decline',id})).status,200);
assert.equal((await call('alice',{action:'send',handle:'bob'})).status,429);
assert.equal((await call('bob',{action:'accept',id})).status,409);
// Re-open after the refusal cooldown, then cancel and resend without duplicates.
const row=db.prepare("SELECT data FROM documents WHERE collection='friendships' AND id=?").get(id);
db.prepare("UPDATE documents SET data=? WHERE collection='friendships' AND id=?").run(JSON.stringify({...JSON.parse(row.data),updatedAt:'2020-01-01T00:00:00Z',refusals:{alice:{count:1,at:'2020-01-01T00:00:00Z'}}}),id);
await call('alice',{action:'send',handle:'bob'});await call('alice',{action:'cancel',id});
assert.equal((await list('bob'))[0].status,'cancelled');
assert.equal((await call('alice',{action:'send',handle:'bob'})).status,429);
db.prepare("UPDATE documents SET data=json_set(data,'$.updatedAt','2020-01-01T00:00:00Z') WHERE collection='friendships' AND id=?").run(id);
await call('alice',{action:'send',handle:'bob'});
assert.equal((await call('bob',{action:'accept',id})).status,200);
assert.equal((await call('bob',{action:'accept',id})).status,200); // Safe retry.
assert.equal((await list('bob'))[0].status,'accepted');assert.equal((await list('alice'))[0].status,'accepted');
assert.equal((await call('eve',{action:'remove',id})).status,403);
assert.equal((await call('alice',{action:'remove',id})).status,200);
assert.equal((await list('bob'))[0].status,'removed');
assert.equal((await call('bob',{action:'accept',id})).status,409);
assert.equal((await call('bob',{action:'accept',id:'bad'})).status,400);
assert.equal((await call('bob',null,'DELETE')).status,405);
console.log('Friendships API: authentication, privacy, reciprocal acceptance, refusal, cancellation, removal and safe retries passed.');
