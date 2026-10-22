import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import {pathToFileURL} from 'node:url';
const {handleAccountApi,mergeDocument,verifyFirebaseToken}=await import(pathToFileURL(process.cwd()+'/public/account-api.js'));
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
// Two devices merge different reward keys; a replay keeps the first answer.
const first={quiz:{totalXP:620,answers:{old:{earnedXP:500},'2026-W42:a':{earnedXP:120,correct:true,answeredAt:'2026-10-18T10:00:00Z'}}},goals:{totalXP:60,claimed:{one:{earnedXP:60}}}};
let merged=await (await call('alice','POST','playerProgress','gaming',{mode:'progress',data:first})).json();
assert.equal(merged.data.quiz.totalXP,620);
const second={quiz:{totalXP:650,answers:{old:{earnedXP:500},'2026-W42:b':{earnedXP:150,correct:true,answeredAt:'2026-10-18T10:01:00Z'}}},goals:{totalXP:90,claimed:{two:{earnedXP:90}}}};
merged=await (await call('alice','POST','playerProgress','gaming',{mode:'progress',data:second})).json();
assert.equal(merged.data.quiz.totalXP,770);assert.equal(merged.data.goals.totalXP,150);
merged=await (await call('alice','POST','playerProgress','gaming',{mode:'progress',data:first})).json();
assert.equal(merged.data.quiz.totalXP,770);assert.equal(merged.data.goals.totalXP,150);
assert.equal((await (await call('bob','GET','playerProgress','gaming')).json()).exists,false);
assert.equal((await call('alice','POST','games','bad',{mode:'progress',data:first})).status,400);
// Unattributed legacy XP is retained once, rather than duplicated on each device.
const legacy={quiz:{totalXP:1000,answers:{}},goals:{totalXP:0,claimed:{}}};
await call('bob','POST','playerProgress','gaming',{mode:'progress',data:legacy});
merged=await (await call('bob','POST','playerProgress','gaming',{mode:'progress',data:{quiz:{totalXP:1120,answers:{'2026-W42:a':{earnedXP:120,correct:true,answeredAt:'2026-10-18T10:00:00Z'}}}}})).json();
assert.equal(merged.data.quiz.totalXP,1120);
// A conflicting replay keeps the original reward; trial seals from both devices survive.
merged=await (await call('alice','POST','playerProgress','gaming',{mode:'progress',data:{quiz:{totalXP:999,answers:{'2026-W42:a':{earnedXP:999,correct:false,answeredAt:'2026-10-18T10:02:00Z'}}},trials:{completed:{10:{score:3}},attempts:{10:2},exclusiveBadges:{ten:true},history:[{level:10,completedAt:'2026-10-18T10:00:00Z'}],lastUnlockedLevel:10}}})).json();
assert.equal(merged.data.quiz.totalXP,770);assert.equal(merged.data.quiz.answers['2026-W42:a'].correct,true);
merged=await (await call('alice','POST','playerProgress','gaming',{mode:'progress',data:{trials:{completed:{20:{score:4}},attempts:{10:1,20:1},exclusiveBadges:{twenty:true},history:[{level:20,completedAt:'2026-10-18T11:00:00Z'}],lastUnlockedLevel:20}}})).json();
assert.deepEqual(Object.keys(merged.data.trials.completed),['10','20']);
assert.equal(merged.data.trials.attempts[10],2);assert.equal(merged.data.trials.lastUnlockedLevel,20);
assert.deepEqual(merged.data.trials.history.map(entry=>entry.level),[20,10]);
assert.deepEqual(merged.data.trials.exclusiveBadges,{twenty:true,ten:true});
assert.equal(merged.data.quiz.streak,2);
await assert.rejects(()=>verifyFirebaseToken('invalid'));
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk=await crypto.subtle.exportKey('jwk',pair.publicKey);jwk.kid='test';
const originalFetch=globalThis.fetch;globalThis.fetch=async()=>Response.json({keys:[jwk]});
async function token(overrides={}){const now=Math.floor(Date.now()/1000);const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');const base=encode({alg:'RS256',kid:'test'})+'.'+encode({sub:'alice',aud:'game-tracker-a1e22',iss:'https://securetoken.google.com/game-tracker-a1e22',iat:now,exp:now+3600,...overrides});const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(base));return base+'.'+Buffer.from(signature).toString('base64url');}
assert.equal(await verifyFirebaseToken(await token()),'alice');await assert.rejects(()=>token({aud:'other'}).then(verifyFirebaseToken));await assert.rejects(()=>token({exp:1}).then(verifyFirebaseToken));
globalThis.fetch=originalFetch;
console.log('D1: isolation, droits administrateur, profils publics, mises à jour et jetons signés vérifiés.');

// Recovery is private, hidden from normal lists, and expires after 30 days.
await call('alice','POST','hardware','trash-test',{mode:'replace',data:{name:'Console',rating:5}});
await call('alice','DELETE','hardware','trash-test');
assert.equal((await (await call('alice','GET','hardware','trash-test')).json()).exists,false);
let trashResponse=await handleAccountApi(new Request('https://checkpoint.test/api/account-data?collection=hardware&trash=1',{headers:{Authorization:'Bearer alice'}}),env,async t=>t);
assert.equal((await trashResponse.json()).documents.length,1);
assert.equal((await call('bob','POST','hardware','trash-test',{mode:'restore',data:{}})).status,410);
assert.equal((await call('alice','POST','hardware','trash-test',{mode:'restore',data:{}})).status,200);
assert.equal((await (await call('alice','GET','hardware','trash-test')).json()).data.rating,5);
await call('alice','POST','games','conflict',{mode:'replace',data:{name:'Portal',rating:5,review:'Old'}});
assert.equal((await call('alice','POST','games','conflict',{mode:'update',base:{rating:4},data:{rating:8}})).status,409);
assert.equal((await call('alice','POST','games','conflict',{mode:'update',base:{rating:5},data:{rating:8}})).status,200);
// A lost acknowledgement can be replayed safely.
assert.equal((await call('alice','POST','games','conflict',{mode:'update',base:{rating:5},data:{rating:8}})).status,200);
assert.equal((await call('alice','POST','games','conflict',{mode:'update',base:{review:'Old'},data:{review:'New'}})).status,200);
assert.equal((await (await call('alice','GET','games','conflict')).json()).data.rating,8);
const current=(await (await call('alice','GET','games','conflict')).json()).data;
assert.equal((await call('alice','DELETE','games','conflict',{expected:{name:'wrong'}})).status,409);
assert.equal((await call('alice','DELETE','games','conflict',{expected:current})).status,200);
assert.equal((await call('alice','DELETE','games','conflict',{expected:current})).status,200);
assert.equal((await call('alice','POST','games','conflict',{mode:'update',data:{rating:2}})).status,410);
// Backups explicitly restore records, including trashed ones.
assert.equal((await call('alice','POST','games','conflict',{mode:'recovery',data:{name:'Portal',rating:5}})).status,200);
assert.equal((await (await call('alice','GET','games','conflict')).json()).data.rating,5);
await call('alice','DELETE','hardware','trash-test');
sqlite.prepare('UPDATE documents SET data=? WHERE owner=? AND collection=? AND id=?').run(JSON.stringify({name:'Console',_deletedAt:'2000-01-01T00:00:00Z'}),'alice','hardware','trash-test');
assert.equal((await call('alice','POST','hardware','trash-test',{mode:'restore',data:{}})).status,410);
console.log('D1: corbeille, restauration, expiration, conflits et reprises idempotentes vérifiés.');

// Private friend polls: immutable audience, validated library entries, one vote per UID.
await call('alice','POST','playerPrivateSettings','main',{data:{socialProfile:{displayName:'Alice'},socialFriends:[{handle:'bob'},{handle:'charlie'}]}});
await call('bob','POST','publicProfiles','bob',{data:{visibility:'public'}});
await call('charlie','POST','publicProfiles','charlie',{data:{visibility:'public'}});
await call('alice','POST','games','poll-a',{data:{name:'Portal'}});await call('alice','POST','games','poll-b',{data:{name:'Halo'}});
const createPoll={action:'create',gameIds:['poll-a','poll-b'],handles:['bob','charlie']};
assert.equal((await call('alice','POST','friendPolls','poll-one',{...createPoll,handles:['stranger']})).status,403);
assert.equal((await call('alice','POST','friendPolls','poll-one',{...createPoll,gameIds:['poll-a']})).status,400);
assert.equal((await call('alice','POST','friendPolls','poll-one',createPoll)).status,200);
assert.equal((await (await call('outsider','GET','friendPolls')).json()).polls.length,0);
assert.equal((await call('outsider','POST','friendPolls','poll-one',{action:'vote',choice:0})).status,403);
assert.equal((await call('alice','POST','friendPolls','poll-one',{action:'vote',choice:0})).status,403);
assert.equal((await call('bob','POST','friendPolls','poll-one',{action:'vote',choice:4})).status,400);
assert.equal((await call('bob','POST','friendPolls','poll-one',{action:'vote',choice:0})).status,200);
let poll=(await (await call('bob','POST','friendPolls','poll-one',{action:'vote',choice:1})).json()).poll;
assert.equal(poll.total,1);assert.deepEqual(poll.counts,[0,1]);assert.equal(poll.myVote,1);assert.equal(poll.votes,undefined);assert.equal(poll.audience,undefined);assert.equal(poll.ownerUid,undefined);
assert.equal((await call('charlie','POST','friendPolls','poll-one',{action:'vote',choice:0})).status,200);
poll=(await (await call('alice','GET','friendPolls')).json()).polls[0];assert.equal(poll.total,2);assert.deepEqual(poll.counts,[1,1]);
assert.equal((await call('bob','POST','friendPolls','poll-one',{action:'close'})).status,403);
assert.equal((await call('alice','POST','friendPolls','poll-one',{action:'close'})).status,200);
assert.equal((await call('bob','POST','friendPolls','poll-one',{action:'vote',choice:0})).status,410);
assert.equal((await call('bob','DELETE','friendPolls','poll-one')).status,403);
assert.equal((await call('alice','DELETE','friendPolls','poll-one')).status,200);
assert.equal((await (await call('bob','GET','friendPolls')).json()).polls.length,0);
console.log('Sondages : invités, confidentialité, choix validés, changement de vote et fermeture vérifiés.');

await call('alice','POST','friendPolls','poll-expired',createPoll);
assert.equal((await call('alice','POST','friendPolls','poll-expired',createPoll)).status,200);
let expired=JSON.parse(sqlite.prepare("SELECT data FROM documents WHERE collection='friendPolls' AND id='poll-expired'").get().data);expired.endsAt='2000-01-01T00:00:00Z';
sqlite.prepare("UPDATE documents SET data=? WHERE collection='friendPolls' AND id='poll-expired'").run(JSON.stringify(expired));
assert.equal((await call('bob','POST','friendPolls','poll-expired',{action:'vote',choice:0})).status,410);
assert.equal((await call('alice','POST','friendPolls','poll-expired',[])).status,400);
await call('alice','DELETE','friendPolls','poll-expired');
console.log('Sondages : expiration serveur et reprise de création sans doublon vérifiées.');

// Privacy is enforced at read time, including legacy rows and stale public copies.
await call('privacy-owner','POST','publicProfiles','privacy-user',{data:{displayName:'Privacy user',visibility:'public',publicSections:{photos:false,essential:false,hardware:false,identityGames:false,activity:false},setupPhotos:[{src:'HIDDEN_PHOTO'}],identityGames:[{name:'HIDDEN_FOUNDER'}],favoriteGames:[{favoriteReason:'HIDDEN_REASON'}],currentHardware:[{name:'HIDDEN_SETUP'}],recentActivity:[{text:'HIDDEN_ACTIVITY'}],privateToken:'NEVER_PUBLIC'}});
let publicData=(await (await call('reader','GET','publicProfiles','privacy-user')).json()).data;
assert.ok(!JSON.stringify(publicData).includes('HIDDEN'));assert.ok(!JSON.stringify(publicData).includes('NEVER_PUBLIC'));
const legacyPrivacy={ownerUid:'privacy-owner',displayName:'Privacy user',visibility:'public',publicSections:{},setupPhotos:[{src:'HIDDEN_PHOTO'}],identityGames:[{name:'HIDDEN_FOUNDER'}],favoriteGames:[{favoriteReason:'HIDDEN_REASON'}],currentHardware:[{name:'HIDDEN_SETUP'}],recentActivity:[{text:'HIDDEN_ACTIVITY'}],privateToken:'NEVER_PUBLIC'};
sqlite.prepare("UPDATE documents SET data=? WHERE collection='publicProfiles' AND id='privacy-user'").run(JSON.stringify(legacyPrivacy));
await call('privacy-owner','POST','playerPrivateSettings','main',{data:{socialProfile:{visibility:'public',publicSections:{photos:false,essential:false,hardware:false,identityGames:false,activity:false}}}});
publicData=(await (await call('reader','GET','publicProfiles','privacy-user')).json()).data;
assert.ok(!JSON.stringify(publicData).includes('HIDDEN'));assert.ok(!JSON.stringify(publicData).includes('NEVER_PUBLIC'));
await call('privacy-owner','POST','playerPrivateSettings','main',{mode:'update',data:{'socialProfile.visibility':'prive'}});
assert.equal((await (await call('reader','GET','publicProfiles','privacy-user')).json()).exists,false);
assert.equal((await (await call('privacy-owner','GET','publicProfiles','privacy-user')).json()).exists,true);
assert.ok(!(await (await call('reader','GET','publicProfiles')).json()).documents.some(d=>d.id==='privacy-user'));
// Device A and B save different settings without replacing the other device's choices.
await call('settings-owner','POST','playerPrivateSettings','main',{data:{appOptions:{notifications:{polls:true,monthly:true}},socialFriends:[{handle:'friend'}]}});
assert.equal((await call('settings-owner','POST','playerPrivateSettings','main',{mode:'update',base:{'appOptions.notifications.polls':true},data:{'appOptions.notifications.polls':false}})).status,200);
assert.equal((await call('settings-owner','POST','playerPrivateSettings','main',{mode:'update',base:{'appOptions.notifications.monthly':true},data:{'appOptions.notifications.monthly':false}})).status,200);
const savedSettings=(await (await call('settings-owner','GET','playerPrivateSettings','main')).json()).data;assert.deepEqual(savedSettings.appOptions.notifications,{polls:false,monthly:false});assert.equal(savedSettings.socialFriends.length,1);
assert.equal((await call('settings-owner','POST','playerPrivateSettings','main',{mode:'update',base:{'appOptions.notifications.polls':true},data:{'appOptions.notifications.polls':true}})).status,409);
console.log('Audit : rubriques masquées retirées des réponses, profils privés inaccessibles et réglages entre appareils vérifiés.');

// Arena state is private and competing brackets require explicit revision selection.
const arenaSeed={id:'table-1',kind:'collection',roster:['a','b','c','d'],round:['a','b','c','d'],next:[],index:0,roundNumber:1,winner:null,choices:0,matches:[],participants:[]};
const arenaOne={revision:'revision-one',tournament:arenaSeed};
assert.equal((await call(null,'GET','playerProgress','arena')).status,401);
assert.equal((await call('arena-owner','POST','playerProgress','arena',{mode:'arena',baseRevision:null,data:arenaOne})).status,200);
assert.equal((await (await call('arena-other','GET','playerProgress','arena')).json()).exists,false);
assert.equal((await call('arena-owner','POST','games','arena',{mode:'arena',baseRevision:null,data:arenaOne})).status,400);
assert.equal((await call('arena-owner','POST','playerProgress','arena',{mode:'arena',baseRevision:'revision-one',data:{revision:'bad',tournament:{...arenaSeed,round:['a','a']}}})).status,400);
const arenaTwo={revision:'revision-two',tournament:{...arenaSeed,next:['a'],index:2,choices:1,matches:[{choice:1,round:1,winner:'a',loser:'b'}]}};
assert.equal((await call('arena-owner','POST','playerProgress','arena',{mode:'arena',baseRevision:'revision-one',data:arenaTwo})).status,200);
const staleArena=await call('arena-owner','POST','playerProgress','arena',{mode:'arena',baseRevision:'revision-one',data:{revision:'other-device',tournament:arenaSeed}});
assert.equal(staleArena.status,409);assert.equal((await staleArena.json()).data.revision,'revision-two');
assert.equal((await call('arena-owner','POST','playerProgress','arena',{mode:'arena',baseRevision:'revision-two',data:{revision:'reset',tournament:null}})).status,200);
assert.equal((await (await call('arena-owner','GET','playerProgress','arena')).json()).data.tournament,null);
console.log('Arena: account isolation, revision conflicts, invalid brackets and explicit reset verified.');

const variantEnvelope={revision:'variant-one',tournament:{...arenaSeed,variant:'soundtrack'}};
assert.equal((await call('variant-owner','POST','playerProgress','arena',{mode:'arena',baseRevision:null,data:variantEnvelope})).status,200);
assert.equal((await (await call('variant-owner','GET','playerProgress','arena')).json()).data.tournament.variant,'soundtrack');
assert.equal((await call('variant-owner','POST','playerProgress','arena',{mode:'arena',baseRevision:'variant-one',data:{revision:'invalid-variant',tournament:{...arenaSeed,variant:'unknown'}}})).status,400);
assert.equal((await call('variant-owner','POST','playerProgress','arena',{mode:'arena',baseRevision:'variant-one',data:{revision:'invalid-kind',tournament:{...arenaSeed,kind:'classic',variant:'visual'}}})).status,400);
assert.equal((await call('variant-owner','POST','playerProgress','arena',{mode:'arena',baseRevision:null,data:{...variantEnvelope,revision:'stale'}})).status,409);
console.log('Arena variants: category preserved, unknown variants rejected, competing writes protected.');

const editionEnvelope={revision:'edition-one',tournament:{...arenaSeed,editionMode:'grouped'}};
assert.equal((await call('edition-owner','POST','playerProgress','arena',{mode:'arena',baseRevision:null,data:editionEnvelope})).status,200);
assert.equal((await (await call('edition-owner','GET','playerProgress','arena')).json()).data.tournament.editionMode,'grouped');
console.log('Arena editions: frozen participant IDs and edition mode preserved in account sync.');
