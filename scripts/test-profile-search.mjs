import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {handleAccountApi} from '../public/account-api.js';
import {socialPairId} from '../public/social-access.js';
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
let result=await (await search('AL')).json();assert.deepEqual(result.profiles.map(p=>p.handle),['al-private','al-reader','al-stale','alice']);
assert.deepEqual(Object.keys(result.profiles.find(p=>p.handle==='alice')).sort(),['displayName','handle','photoURL']);
assert.deepEqual(result.profiles.find(p=>p.handle==='al-private'),{handle:'al-private',displayName:'Player al-private',photoURL:'',private:true});
assert.equal(result.profiles.find(p=>p.handle==='al-stale').private,true);
// A private account is discoverable before it has ever published a profile.
seed('never-public','playerPrivateSettings','main',{socialProfile:{displayName:'Nastasia',handle:'',visibility:'prive',photoURL:'secret-photo',bio:'secret bio'},email:'secret email'});
result=await (await search('Nastasia')).json();assert.equal(result.profiles.length,1);
const privateResult=result.profiles[0];assert.equal(privateResult.displayName,'Nastasia');assert.equal(privateResult.private,true);assert.equal(privateResult.photoURL,'');assert.match(privateResult.handle,/^private-[a-f0-9]{64}$/);
assert.equal(JSON.stringify(result).includes('secret'),false);assert.equal(JSON.stringify(result).includes('never-public'),false);
seed('never-public','socialControls','main',{blocked:{reader:true}});
assert.deepEqual((await (await search('Nastasia')).json()).profiles,[]);
seed('never-public','socialControls','main',{});seed('reader','socialControls','main',{blocked:{'never-public':true}});
assert.deepEqual((await (await search('Nastasia')).json()).profiles,[]);seed('reader','socialControls','main',{});
// Finding a private pseudo does not allow reading or inviting its owner.
const privateGet=await handleAccountApi(new Request('https://checkpoint.test/api/account-data?collection=publicProfiles&id=al-private',{headers:{Authorization:'Bearer reader'}}),env,async token=>token);
assert.equal((await privateGet.json()).exists,false);
const privateInvite=await handleAccountApi(new Request('https://checkpoint.test/api/account-data?collection=friendships',{method:'POST',headers:{Authorization:'Bearer reader','Content-Type':'application/json'},body:JSON.stringify({action:'send',handle:'al-private'})}),env,async token=>token);
assert.equal(privateInvite.status,404);
assert.deepEqual((await (await search('@alice')).json()).profiles.map(p=>p.handle),['alice']);
assert.deepEqual((await (await search('Player alice')).json()).profiles.map(p=>p.handle),['alice']);
assert.equal((await (await search('alice','alice')).json()).profiles[0].self,true);
assert.deepEqual((await (await search('al%')).json()).profiles,[]);
for(let i=0;i<25;i++)profile('many-'+String(i).padStart(2,'0'));
result=await (await search('many-')).json();assert.equal(result.profiles.length,20);assert.equal(result.limited,true);
profile('elodie');seed('__shared__','publicProfiles','elodie',{ownerUid:'elodie',displayName:'ÉLODIE D’Arc',visibility:'public'});
for(const query of ['elodie','Élodie','E\u0301lodie',"élodie d'arc"]){assert.equal((await (await search(query)).json()).profiles[0].handle,'elodie');}
assert.deepEqual((await (await search('@al-friends')).json()).profiles,[]);
seed('__shared__','friendships',await socialPairId('reader','al-friends'),{status:'accepted'});
assert.equal((await (await search('@al-friends')).json()).profiles[0].handle,'al-friends');
// A matching profile must not disappear behind an arbitrary first-page limit.
for(let i=0;i<510;i++)profile('crowd-'+String(i).padStart(3,'0'));
profile('z-last');seed('__shared__','publicProfiles','z-last',{ownerUid:'z-last',displayName:'Étoile recherchée',visibility:'public'});
assert.equal((await (await search('etoile recherchee')).json()).profiles[0].handle,'z-last');
// Exact nicknames outrank broad matches, even when there are many other names.
for(let i=0;i<60;i++)profile('match-'+String(i).padStart(2,'0'));
seed('__shared__','publicProfiles','z-last',{ownerUid:'z-last',displayName:'match',visibility:'public'});
assert.equal((await (await search('match')).json()).profiles[0].handle,'z-last');
console.log('Recherche profils : authentification, pseudo/identifiant, profils privés, amis uniquement, blocages, données minimales et limite vérifiés.');
