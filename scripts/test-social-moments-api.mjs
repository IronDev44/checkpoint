import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {handleAccountApi} from '../public/account-api.js';
import {handleRecommendations,handlePredictions} from '../public/social-moments-api.js';
const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync('migrations/0001_documents.sql','utf8'));
const env={ACCOUNT_OWNER_UID:'owner',ACCOUNT_DB:{prepare(sql){return {bind(...values){const stmt=db.prepare(sql);return {first:async()=>stmt.get(...values)||null,all:async()=>({results:stmt.all(...values)}),run:async()=>({meta:{changes:Number(stmt.run(...values).changes)}})};}};}}};
const now=new Date('2026-10-23T12:00:00Z');
const seed=(owner,collection,id,data)=>db.prepare('INSERT INTO documents(owner,collection,id,data) VALUES(?,?,?,?)').run(owner,collection,id,JSON.stringify(data));
const call=(handler,collection,uid,id,body,date=now)=>{const request=new Request(`https://checkpoint.test/api/account-data?collection=${collection}&id=${id}`,{method:body?'POST':'GET',...(body?{body:JSON.stringify(body)}:{})});return handler(request,env,uid,new URL(request.url),date);};
const rec=(uid,id,body,date)=>call(handleRecommendations,'gameRecommendations',uid,id,body,date);
const predict=(uid,id,body,date)=>call(handlePredictions,'gamingPredictions',uid,id,body,date);
seed('alice','playerPrivateSettings','main',{socialFriends:[{handle:'bob'},{handle:'private'}],socialProfile:{displayName:'Alice'}});
seed('__shared__','publicProfiles','bob',{ownerUid:'bob',displayName:'Bob',visibility:'public'});
seed('__shared__','publicProfiles','private',{ownerUid:'private',visibility:'prive'});
seed('alice','games','halo',{name:'Halo',review:'DO_NOT_SHARE',rating:8});seed('alice','games','wish',{name:'Wish',status:'wishlist'});
const draft={action:'create',handle:'bob',gameId:'halo',message:'Je pense que ça te plairait.'};
assert.equal((await rec('eve','r',draft)).status,403);
assert.equal((await rec('alice','r',{...draft,handle:'private'})).status,403);
assert.equal((await rec('alice','r',{...draft,gameId:'wish'})).status,400);
let r=await(await rec('alice','r',draft)).json();assert.equal(r.recommendation.isSender,true);assert.equal(JSON.stringify(r).includes('DO_NOT_SHARE'),false);assert.equal(JSON.stringify(r).includes('rating'),false);
assert.equal((await rec('alice','r',draft)).status,200); // retry does not duplicate
assert.equal((await(await rec('eve','')).json()).recommendations.length,0);
assert.equal((await rec('eve','r',{action:'save',saved:true})).status,403);
assert.equal((await rec('alice','r',{action:'respond',response:'fake'})).status,403);
r=await(await rec('bob','r',{action:'save',saved:true})).json();assert.equal(r.recommendation.saved,true);
assert.equal(db.prepare("SELECT COUNT(*) AS n FROM documents WHERE owner='bob' AND collection='games'").get().n,0);
await rec('bob','r',{action:'respond',response:'Merci pour la découverte !'});
r=await(await rec('alice','')).json();assert.equal(r.recommendations[0].response,'Merci pour la découverte !');
await rec('alice','r',{action:'archive'});r=await(await rec('bob','')).json();assert.equal(r.recommendations[0].archived,false);
for(let i=0;i<9;i++)assert.equal((await rec('alice',`r${i}`,draft)).status,200);
assert.equal((await rec('alice','too-many',draft)).status,429);
const question={action:'create',title:'Quelle annonce sera confirmée ?',event:'Événement de test',options:['Nouvelle console','Nouvelle manette'],source:'https://example.test/event',closesAt:'2026-10-24T12:00:00Z'};
assert.equal((await predict('alice','p',question)).status,403);
assert.equal((await predict('owner','p',{...question,source:'javascript:alert(1)'})).status,400);
assert.equal((await predict('owner','p',{...question,options:['Même','même']})).status,400);
assert.equal((await predict('owner','p',question)).status,200);
assert.equal((await predict('alice','p',{action:'vote',choice:0})).status,200);
await predict('alice','p',{action:'vote',choice:1});await predict('bob','p',{action:'vote',choice:0});
let p=(await(await predict('alice','')).json()).predictions[0];assert.equal(p.myVote,1);assert.equal(p.counts,null);assert.equal(p.total,null);assert.equal(p.result,null);
assert.equal((await predict('owner','p',{action:'resolve',result:0,resultSource:'https://example.test/result'})).status,400);
const after=new Date('2026-10-24T12:00:00Z');
assert.equal((await predict('bob','p',{action:'vote',choice:1},after)).status,410);
assert.equal((await predict('bob','p',{action:'resolve',result:0,resultSource:'https://example.test/result'},after)).status,403);
assert.equal((await predict('owner','p',{action:'resolve',result:0,resultSource:'https://example.test/result'},after)).status,200);
p=(await(await predict('bob','',null,after)).json()).predictions[0];assert.deepEqual(p.counts,[1,1]);assert.equal(p.correct,true);assert.equal(p.total,2);
assert.equal((await predict('owner','p',{action:'resolve',result:1,resultSource:'https://example.test/changed'},after)).status,400);
assert.equal((await predict('owner','cancel',question)).status,200);await predict('owner','cancel',{action:'cancel'});assert.equal((await predict('alice','cancel',{action:'vote',choice:0})).status,410);
for(const collection of ['gameRecommendations','gamingPredictions']){
 assert.equal((await handleAccountApi(new Request(`https://checkpoint.test/api/account-data?collection=${collection}`),env,async()=> 'alice')).status,401);
}
for(const collection of ['predictionVotes']){
 assert.equal((await handleAccountApi(new Request(`https://checkpoint.test/api/account-data?collection=${collection}&id=fake`,{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify({data:{choice:0}})}),env,async()=> 'alice')).status,400);
}
const originalPrepare=env.ACCOUNT_DB.prepare;
env.ACCOUNT_DB.prepare=sql=>sql.startsWith('UPDATE documents')?{bind:()=>({run:async()=>({meta:{changes:0}})})}:originalPrepare(sql);
assert.equal((await rec('bob','r',{action:'respond',response:'Conflict'})).status,409);env.ACCOUNT_DB.prepare=originalPrepare;
console.log('Social moments API: auth, private recommendations, saved items, replies, archives, retries, limits, owner tools, sealed predictions, deadline, immutable results and races passed.');
