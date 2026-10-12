import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
const {handleAccountApi,mergeDocument,verifyFirebaseToken}=await import('data:text/javascript;base64,'+fs.readFileSync('public/account-api.js').toString('base64'));
const sqlite=new DatabaseSync(':memory:');sqlite.exec(fs.readFileSync('migrations/0001_documents.sql','utf8'));
const env={
  ACCOUNT_OWNER_UID:'owner',
  ACCOUNT_DB:{prepare(sql){
    return {bind(...args){
      const stmt=sqlite.prepare(sql);
      return {
        async first(){return stmt.get(...args)||null;},
        async all(){return {results:stmt.all(...args)};},
        async run(){return {meta:{changes:Number(stmt.run(...args).changes)}};},
      };
    }};
  }},
};
async function call(uid,method,name,id,data){const request=new Request(`https://checkpoint.test/api/account-data?collection=${name}${id?`&id=${id}`:''}`,{method,headers:uid?{Authorization:`Bearer ${uid}`}:{},body:data?JSON.stringify(data):undefined});return handleAccountApi(request,env,async token=>token);}
assert.equal((await call(null,'GET','games')).status,401);
assert.equal((await call('alice','POST','games','one',{mode:'replace',data:{name:'Alice game'}})).status,200);
assert.equal((await (await call('bob','GET','games')).json()).documents.length,0);
assert.equal((await (await call('bob','GET','games','one')).json()).exists,false);
await call('bob','DELETE','games','one');assert.equal((await (await call('alice','GET','games','one')).json()).exists,true);
assert.equal((await call('alice','POST','news','one',{data:{name:'bad'}})).status,403);
assert.equal((await call('owner','POST','news','one',{data:{name:'News'}})).status,200);
assert.equal((await call('alice','POST','publicProfiles','alice',{data:{ownerUid:'bob'}})).status,200);
assert.equal((await (await call('bob','GET','publicProfiles','alice')).json()).data.ownerUid,'alice');
assert.equal((await call('bob','POST','publicProfiles','alice',{data:{name:'taken'}})).status,403);
assert.equal((await call('bob','DELETE','publicProfiles','alice')).status,403);
assert.deepEqual(mergeDocument({tags:['one'],nested:{a:1}},{tags:{__checkpointOperation:'union',values:['one','two']},'nested.b':2},true),{tags:['one','two'],nested:{a:1,b:2}});
await assert.rejects(()=>verifyFirebaseToken('invalid'));
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk=await crypto.subtle.exportKey('jwk',pair.publicKey);jwk.kid='test';
const originalFetch=globalThis.fetch;globalThis.fetch=async()=>Response.json({keys:[jwk]});
async function token(overrides={}){const now=Math.floor(Date.now()/1000);const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');const base=encode({alg:'RS256',kid:'test'})+'.'+encode({sub:'alice',aud:'game-tracker-a1e22',iss:'https://securetoken.google.com/game-tracker-a1e22',iat:now,exp:now+3600,...overrides});const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(base));return base+'.'+Buffer.from(signature).toString('base64url');}
assert.equal(await verifyFirebaseToken(await token()),'alice');await assert.rejects(()=>token({aud:'other'}).then(verifyFirebaseToken));await assert.rejects(()=>token({exp:1}).then(verifyFirebaseToken));
globalThis.fetch=originalFetch;
console.log('D1: isolation, droits administrateur, profils publics, mises à jour et jetons signés vérifiés.');
