import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {handleAccountApi} from '../public/account-api.js';
const sqlite=new DatabaseSync(':memory:');sqlite.exec(fs.readFileSync('migrations/0001_documents.sql','utf8'));
const env={ACCOUNT_OWNER_UID:'owner',ACCOUNT_DB:{prepare(sql){
 return {bind(...args){
  const stmt=sqlite.prepare(sql);
  return {async first(){return stmt.get(...args)||null;},async all(){return {results:stmt.all(...args)};},async run(){return {meta:{changes:Number(stmt.run(...args).changes)}};}};
 }};
}}};
function seed(owner,collection,id,data){sqlite.prepare('INSERT OR REPLACE INTO documents VALUES(?,?,?,?)').run(owner,collection,id,JSON.stringify(data));}
function profile(handle,visibility='public'){seed('__shared__','publicProfiles',handle,{handle,ownerUid:handle,displayName:'Player '+handle,visibility,bio:'Private detail',email:'hidden@example.test',photoURL:'photo.jpg'});seed(handle,'playerPrivateSettings','main',{socialProfile:{handle,visibility}});}
async function search(q,uid='reader'){return handleAccountApi(new Request('https://checkpoint.test/api/account-data?collection=publicProfiles&search='+encodeURIComponent(q),{headers:uid?{Authorization:'Bearer '+uid}:{}}),env,async token=>token);}
profile('alice');profile('al-private','prive');profile('al-friends','friends');profile('al-blocked');profile('al-stale');profile('al-reader');
seed('al-blocked','socialControls','main',{blocked:{reader:true}});seed('al-stale','playerPrivateSettings','main',{socialProfile:{visibility:'prive'}});
assert.equal((await search('al',null)).status,401);assert.equal((await search('a')).status,400);assert.equal((await search('a'.repeat(61))).status,400);
let result=await (await search('AL')).json();assert.deepEqual(result.profiles.map(p=>p.handle),['al-reader','alice']);
assert.deepEqual(Object.keys(result.profiles[0]).sort(),['displayName','handle','photoURL']);
assert.deepEqual((await (await search('@alice')).json()).profiles.map(p=>p.handle),['alice']);
assert.deepEqual((await (await search('Player alice')).json()).profiles.map(p=>p.handle),['alice']);
assert.deepEqual((await (await search('alice','alice')).json()).profiles,[]);
assert.deepEqual((await (await search('al%')).json()).profiles,[]);
for(let i=0;i<25;i++)profile('many-'+String(i).padStart(2,'0'));
result=await (await search('many-')).json();assert.equal(result.profiles.length,20);assert.equal(result.limited,true);
console.log('Recherche profils : authentification, pseudo/identifiant, profils privés, amis uniquement, blocages, données minimales et limite vérifiés.');
