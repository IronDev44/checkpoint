import {normalizeArenaEnvelope} from './arena-state.js';
import {handleSelections,handleChallenges} from './engagement-api.js';
import {handleRecommendations,handlePredictions} from './social-moments-api.js';
import {handleBarcodeLookup} from './barcode-api.js';
import { publicProfileView } from "./profile-privacy.js";
import {handleFriendships} from './friendships-api.js';
import {handleSocialControls} from './social-controls-api.js';
import {handleSocialReactions} from './social-reactions-api.js';
import {handleSharedGames} from './shared-games-api.js';
import {handleSocialReports} from './social-reports-api.js';
import {socialBlocked,canContact,canReadSocialProfile} from './social-access.js';
import {handleUsage} from './usage-api.js';
const PRIVATE = new Set(['games','hardware','gameCollections','playerProgress','playerPrivateSettings']);
const SHARED = new Set(['news','events','publicProfiles']);
let keyCache;
let newsRefreshAfter=0;
async function refreshNews(env){
  if(env.NEWS_FEED_ENABLED!=='true'||Date.now()<newsRefreshAfter)return;
  newsRefreshAfter=Date.now()+300000;
  try{
    const latest=await env.ACCOUNT_DB.prepare("SELECT json_extract(data,'$.importedAt') AS importedAt FROM documents WHERE owner='__shared__' AND collection='news' ORDER BY json_extract(data,'$.importedAt') DESC LIMIT 1").first();
    if(latest&&Date.now()-Date.parse(latest.importedAt)<6*3600000){newsRefreshAfter=Date.now()+3600000;return;}
    const r=await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.jeuxvideo.com/rss/rss.xml',{signal:AbortSignal.timeout(8000)});if(!r.ok)return;
    const feed=await r.json();if(!Array.isArray(feed.items))return;
    const statements=feed.items.slice(0,10).filter(item=>item.link&&item.title).map(item=>{
      const data={title:item.title,summary:item.description||'',url:item.link,date:item.pubDate||new Date().toISOString(),source:'JeuxVideo.com',category:'Gaming',image:item.thumbnail||item.enclosure?.link||'',importedAt:new Date().toISOString()};
      return env.ACCOUNT_DB.prepare("INSERT INTO documents(owner,collection,id,data) VALUES('__shared__','news',?,?) ON CONFLICT(owner,collection,id) DO UPDATE SET data=excluded.data").bind(encodeURIComponent(item.link),JSON.stringify(data));
    });
    if(statements.length)await env.ACCOUNT_DB.batch(statements);
    newsRefreshAfter=Date.now()+3600000;
  }catch{/* Previously loaded news remain available if the feed fails. */}
}
function response(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});}
function decode(value){return Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));}
export async function verifyFirebaseToken(token, project='game-tracker-a1e22') {
  const parts=token.split('.');if(parts.length!==3)throw new Error('Unauthorized');
  const header=JSON.parse(new TextDecoder().decode(decode(parts[0])));
  const claims=JSON.parse(new TextDecoder().decode(decode(parts[1])));
  const now=Date.now()/1000;
  if(header.alg!=='RS256'||!header.kid||claims.aud!==project||claims.iss!==`https://securetoken.google.com/${project}`||typeof claims.sub!=='string'||!claims.sub||claims.sub.length>128||!Number.isFinite(claims.exp)||!Number.isFinite(claims.iat)||claims.exp<=now||claims.iat>now+60)throw new Error('Unauthorized');
  if(!keyCache||keyCache.expires<Date.now()){
    const r=await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');if(!r.ok)throw new Error('Authentication unavailable');
    keyCache={keys:(await r.json()).keys,expires:Date.now()+300000};
  }
  const jwk=keyCache.keys.find(k=>k.kid===header.kid);if(!jwk)throw new Error('Unauthorized');
  const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(parts[2]),new TextEncoder().encode(`${parts[0]}.${parts[1]}`)))throw new Error('Unauthorized');
  return claims.sub;
}
function plainObject(value){return value && typeof value==='object' && !Array.isArray(value);}
function transform(value,previous){
  if(plainObject(value)&&value.__checkpointOperation==='timestamp')return new Date().toISOString();
  if(plainObject(value)&&value.__checkpointOperation==='union'){
    const list=Array.isArray(previous)?[...previous]:[];
    for(const item of value.values||[])if(!list.some(x=>JSON.stringify(x)===JSON.stringify(item)))list.push(item);
    return list;
  }
  if(Array.isArray(value))return value.map(v=>transform(v));
  if(plainObject(value)){const result={};for(const [k,v] of Object.entries(value)){if(['__proto__','constructor','prototype'].includes(k))throw new Error('Invalid field');result[k]=transform(v,previous?.[k]);}return result;}
  return value;
}
export function mergeDocument(previous, data, dotted=false){
  const next=structuredClone(previous||{});
  for(const [field,value] of Object.entries(data)){
    const parts=dotted?field.split('.'):[field];if(parts.some(p=>!p||['__proto__','constructor','prototype'].includes(p)))throw new Error('Invalid field');
    let target=next;for(const p of parts.slice(0,-1)){if(!plainObject(target[p]))target[p]={};target=target[p];}
    const k=parts.at(-1);target[k]=plainObject(value)&&!value.__checkpointOperation&&plainObject(target[k])&&!dotted?mergeDocument(target[k],value):transform(value,target[k]);
  }
  return next;
}
export function mergeGamingProgress(previous={}, incoming={}) {
  const amount=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;
  const mergeLedger=(old={}, local={}, field)=>{
    const oldEntries=plainObject(old[field])?old[field]:{};
    const localEntries=plainObject(local[field])?local[field]:{};
    // A reward key has one canonical record. A second device cannot replace it.
    const entries={...localEntries,...oldEntries};
    const sum=map=>Object.values(map).reduce((total,entry)=>total+amount(entry?.earnedXP),0);
    const baseline=Math.max(amount(old.totalXP)-sum(oldEntries),amount(local.totalXP)-sum(localEntries),0);
    return {...local,...old,[field]:entries,totalXP:baseline+sum(entries)};
  };
  const quiz=mergeLedger(previous.quiz,incoming.quiz,'answers');
  const dated=Object.entries(quiz.answers).filter(([key,a])=>/^\d{4}-W\d{2}/.test(key)&&Number.isFinite(Date.parse(a?.answeredAt))).sort((a,b)=>Date.parse(a[1].answeredAt)-Date.parse(b[1].answeredAt)||a[0].localeCompare(b[0]));
  let streak=0,best=0,lastWeek='',lastCorrect='';
  const weekTime=key=>{const m=/^(\d{4})-W(\d{2})/.exec(key);if(!m)return NaN;const d=new Date(Date.UTC(+m[1],0,4));d.setUTCDate(d.getUTCDate()-(d.getUTCDay()||7)+1+(+m[2]-1)*7);return d.getTime();};
  for(const [key,answer] of dated){const week=key.slice(0,8);const distance=(weekTime(week)-weekTime(lastWeek))/604800000;streak=answer.correct?((distance===0||distance===1)?streak:0)+1:0;best=Math.max(best,streak);lastWeek=week;if(answer.correct)lastCorrect=week;}
  const latest=dated.length?{streak,lastAnsweredWeek:lastWeek,lastCorrectWeek:lastCorrect}:{};
  Object.assign(quiz,latest,{bestStreak:Math.max(best,amount(previous.quiz?.bestStreak),amount(incoming.quiz?.bestStreak))});
  const oldTrials=previous.trials||{}, localTrials=incoming.trials||{};
  const attempts={...localTrials.attempts,...oldTrials.attempts};
  for(const key of Object.keys(attempts))attempts[key]=Math.max(amount(localTrials.attempts?.[key]),amount(oldTrials.attempts?.[key]));
  const history=[...(oldTrials.history||[]),...(localTrials.history||[])].filter((entry,index,list)=>list.findIndex(other=>String(other.level)===String(entry.level))===index).sort((a,b)=>(Date.parse(b.completedAt)||0)-(Date.parse(a.completedAt)||0)).slice(0,24);
  const trials={completed:{...localTrials.completed,...oldTrials.completed},exclusiveBadges:{...localTrials.exclusiveBadges,...oldTrials.exclusiveBadges},attempts,history,lastUnlockedLevel:Math.max(amount(oldTrials.lastUnlockedLevel),amount(localTrials.lastUnlockedLevel))};
  return {quiz,goals:mergeLedger(previous.goals,incoming.goals,'claimed'),trials};
}
export async function handleAccountApi(request,env,verify=verifyFirebaseToken){
  if(!env.ACCOUNT_DB)return response({error:'Le stockage des comptes n’est pas encore activé.'},503);
  let uid;try{const match=request.headers.get('Authorization')?.match(/^Bearer (.+)$/);if(!match)return response({error:'Connexion nécessaire.'},401);uid=await verify(match[1]);}catch{return response({error:'Reconnecte-toi pour ouvrir ton espace.'},401);}
  const url=new URL(request.url);const name=url.searchParams.get('collection');const id=url.searchParams.get('id');
  if(name==='appUsage')return handleUsage(request,env,uid);
  if(name==='friendPolls')return handleFriendPolls(request,env,uid,url);
  if(name==='friendships')return handleFriendships(request,env,uid);
  if(name==='socialControls')return handleSocialControls(request,env,uid);
  if(name==='socialReactions')return handleSocialReactions(request,env,uid,url);
  if(name==='sharedGames')return handleSharedGames(request,env,uid,url);
  if(name==='socialReports')return handleSocialReports(request,env,uid,url);
  if(name==='communitySelections')return handleSelections(request,env,uid);
  if(name==='friendChallenges')return handleChallenges(request,env,uid,url);
  if(name==='gameRecommendations')return handleRecommendations(request,env,uid,url);
  if(name==='gamingPredictions')return handlePredictions(request,env,uid,url);
  if(name==='barcodeLookup')return handleBarcodeLookup(request,env,uid,url);
  if(!PRIVATE.has(name)&&!SHARED.has(name))return response({error:'Collection inconnue.'},400);
  if(id!==null&&(!id||id.length>250||id.includes('/')))return response({error:'Identifiant invalide.'},400);
  const owner=PRIVATE.has(name)?uid:'__shared__';
  const recoverable=['games','hardware'].includes(name);
  const guarded=recoverable||name==='playerPrivateSettings';
  const inTrash=data=>recoverable&&!!data?._deletedAt;
  const restorable=data=>inTrash(data)&&Date.now()-Date.parse(data._deletedAt)<30*86400000;
  const db=env.ACCOUNT_DB;
  const profileForReader=async data=>{
    if(!data)return null;
    if(data.ownerUid===uid)return data;
    if(data.ownerUid&&await socialBlocked(db,uid,data.ownerUid))return null;
    const settings=data.ownerUid?await db.prepare("SELECT data FROM documents WHERE owner=? AND collection='playerPrivateSettings' AND id='main'").bind(data.ownerUid).first():null;
    const authority=settings?JSON.parse(settings.data).socialProfile:null;
    if(!await canReadSocialProfile(db,uid,data,authority))return null;
    return publicProfileView(data,authority);
  };
  try{
    if(request.method==='GET'){
      if(name==='news')await refreshNews(env);
      if(id){const row=await db.prepare('SELECT data FROM documents WHERE owner=? AND collection=? AND id=?').bind(owner,name,id).first();let data=row?JSON.parse(row.data):null;if(name==='publicProfiles')data=await profileForReader(data);const visible=!!data&&!inTrash(data);return response({exists:visible,data:visible?data:null,id});}
      const rows=await db.prepare('SELECT id,data FROM documents WHERE owner=? AND collection=? ORDER BY id').bind(owner,name).all();const documents=await Promise.all(rows.results.map(async r=>({id:r.id,data:name==='publicProfiles'?await profileForReader(JSON.parse(r.data)):JSON.parse(r.data)})));return response({documents:documents.filter(r=>r.data&&(url.searchParams.get('trash')==='1'?restorable(r.data):!inTrash(r.data)))});
    }
    if(!['POST','DELETE'].includes(request.method))return response({error:'Méthode non autorisée.'},405);
    if(!id)return response({error:'Identifiant requis.'},400);
    if(SHARED.has(name)&&name!=='publicProfiles'&&uid!==env.ACCOUNT_OWNER_UID)return response({error:'Accès réservé au propriétaire.'},403);
    const row=await db.prepare('SELECT data FROM documents WHERE owner=? AND collection=? AND id=?').bind(owner,name,id).first();
    const previous=row?JSON.parse(row.data):null;
    if(name==='publicProfiles'&&previous?.ownerUid!==uid&&previous)return response({error:'Ce profil appartient à un autre compte.'},403);
    if(request.method==='DELETE'){
      const raw=await request.text();const body=raw?JSON.parse(raw):{};
      if(recoverable&&inTrash(previous))return response({ok:true});
      if(guarded&&Object.hasOwn(body,'expected')&&JSON.stringify(body.expected)!==JSON.stringify(previous))return response({error:'Cette fiche a changé sur un autre appareil. Choisis la version à conserver.'},409);
      if(recoverable&&previous&&!inTrash(previous)){
        const data={...previous,_deletedAt:new Date().toISOString()};
        const result=await db.prepare('UPDATE documents SET data=? WHERE owner=? AND collection=? AND id=? AND data=?').bind(JSON.stringify(data),owner,name,id,row.data).run();
        if(!result.meta.changes)return response({error:'La fiche a changé. Réessaie.'},409);
      }else if(!recoverable){await db.prepare('DELETE FROM documents WHERE owner=? AND collection=? AND id=?').bind(owner,name,id).run();}
      return response({ok:true});
    }
    const raw=await request.text();if(raw.length>900000)return response({error:'Document trop volumineux.'},413);
    const body=JSON.parse(raw);if(!plainObject(body.data))return response({error:'Document invalide.'},400);
    if(recoverable&&body.mode==='restore'){
      if(!restorable(previous))return response({error:'Le délai de restauration de 30 jours est dépassé.'},410);
      const data={...previous};delete data._deletedAt;
      const result=await db.prepare('UPDATE documents SET data=? WHERE owner=? AND collection=? AND id=? AND data=?').bind(JSON.stringify(data),owner,name,id,row.data).run();
      return result.meta.changes?response({ok:true}):response({error:'La fiche a changé. Réessaie.'},409);
    }
    if(recoverable&&inTrash(previous)&&body.mode!=='recovery')return response({error:'Cette fiche a été supprimée. Restaure-la depuis la corbeille.'},410);
    if(guarded&&Object.hasOwn(body,'expected')&&JSON.stringify(body.expected)!==JSON.stringify(previous)&&JSON.stringify(transform(body.data))!==JSON.stringify(previous))return response({error:'La fiche a changé sur un autre appareil.'},409);
    if(guarded&&plainObject(body.base)){for(const [key,value] of Object.entries(body.base)){const current=key.split('.').reduce((v,k)=>v?.[k],previous)??null;const desired=transform(body.data[key],current);if(JSON.stringify(current)!==JSON.stringify(value)&&JSON.stringify(current)!==JSON.stringify(desired))return response({error:'Ce champ a changé sur un autre appareil. Ta modification reste sur cet appareil.'},409);}}
    if(Object.keys(body.data).some(key=>key.split('.')[0]==='_deletedAt'))return response({error:'Champ réservé à la corbeille.'},400);
    if(body.mode==='update'&&!previous)return response({error:'Document introuvable.'},404);
    if(body.mode==='arena'){
      if(name!=='playerProgress'||id!=='arena')return response({error:'Tournoi invalide.'},400);
      if(!normalizeArenaEnvelope(body.data))return response({error:'Sauvegarde du tournoi invalide.'},400);
      if(body.baseRevision!==(previous?.revision??null))return response({error:'Le tournoi a changé sur un autre appareil.',data:previous},409);
    }
    if(body.mode==='progress'&&(name!=='playerProgress'||id!=='gaming'))return response({error:'Progression invalide.'},400);
    let data=body.mode==='arena'?normalizeArenaEnvelope(body.data):body.mode==='progress'?mergeGamingProgress(previous||{},transform(body.data)):['replace','recovery'].includes(body.mode)?transform(body.data):mergeDocument(previous,body.data,body.mode==='update');
    if(name==='publicProfiles')data=publicProfileView({...data,ownerUid:uid});
    // Optimistic concurrency prevents silently overwriting another simultaneous change.
    if(row){const result=await db.prepare('UPDATE documents SET data=? WHERE owner=? AND collection=? AND id=? AND data=?').bind(JSON.stringify(data),owner,name,id,row.data).run();if(!result.meta.changes)return response({error:'Une modification simultanée a eu lieu. Réessaie.'},409);}
    else{const result=await db.prepare('INSERT OR IGNORE INTO documents(owner,collection,id,data) VALUES(?,?,?,?)').bind(owner,name,id,JSON.stringify(data)).run();if(!result.meta.changes)return response({error:'Ce document vient d’être créé. Réessaie.'},409);}
    return response({ok:true,data});
  }catch{return response({error:'Impossible de traiter la demande. Réessaie.'},503);}
}

// Polls use a dedicated contract: clients never write voters, counts or audience IDs.
async function handleFriendPolls(request,env,uid,url){
  const db=env.ACCOUNT_DB,id=url.searchParams.get('id');
  const read=async(owner,collection,key)=>{const row=await db.prepare('SELECT data FROM documents WHERE owner=? AND collection=? AND id=?').bind(owner,collection,key).first();return row?JSON.parse(row.data):null;};
  const allowed=p=>p&&(p.ownerUid===uid||p.audience.includes(uid));
  const visible=(id,p)=>({id,title:p.title,author:p.author,options:p.options,createdAt:p.createdAt,endsAt:p.endsAt,closed:p.closed||Date.now()>=Date.parse(p.endsAt),isOwner:p.ownerUid===uid,myVote:p.votes[uid]??null,total:Object.keys(p.votes).length,counts:p.options.map((_,i)=>Object.values(p.votes).filter(v=>v===i).length)});
  try{
    if(request.method==='GET'){
      const rows=await db.prepare("SELECT id,data FROM documents WHERE owner='__shared__' AND collection='friendPolls' AND (json_extract(data,'$.ownerUid')=? OR EXISTS (SELECT 1 FROM json_each(documents.data,'$.audience') WHERE value=?)) ORDER BY json_extract(data,'$.createdAt') DESC LIMIT 50").bind(uid,uid).all();
      const polls=await Promise.all(rows.results.map(async r=>{const data=JSON.parse(r.data);return data.ownerUid!==uid&&await socialBlocked(db,uid,data.ownerUid)?null:visible(r.id,data);}));
      return response({polls:polls.filter(Boolean)});
    }
    if(!id||!/^[a-zA-Z0-9_-]{1,100}$/.test(id))return response({error:'Sondage invalide.'},400);
    const row=await db.prepare("SELECT data FROM documents WHERE owner='__shared__' AND collection='friendPolls' AND id=?").bind(id).first();
    const previous=row?JSON.parse(row.data):null;
    if(request.method==='DELETE'){
      if(previous?.ownerUid!==uid)return response({error:'Sondage indisponible.'},403);
      await db.prepare("DELETE FROM documents WHERE owner='__shared__' AND collection='friendPolls' AND id=?").bind(id).run();return response({ok:true});
    }
    if(request.method!=='POST')return response({error:'Méthode non autorisée.'},405);
    const raw=await request.text();if(raw.length>12000)return response({error:'Sondage trop volumineux.'},413);
    let body;try{body=JSON.parse(raw);}catch{return response({error:'Sondage invalide.'},400);}
    if(!plainObject(body))return response({error:'Sondage invalide.'},400);
    let data;
    if(body.action==='create'){
      if(previous)return previous.ownerUid===uid?response({poll:visible(id,previous)}):response({error:'Ce sondage existe déjà.'},409);
      const ids=Array.isArray(body.gameIds)?[...new Set(body.gameIds)]:[];
      const handles=Array.isArray(body.handles)?[...new Set(body.handles)]:[];
      if(ids.length<2||ids.length>4||!ids.every(v=>typeof v==='string')||!handles.length||handles.length>50||!handles.every(v=>typeof v==='string'))return response({error:'Choisis deux à quatre jeux et au moins un ami (50 maximum).'},400);
      const settings=await read(uid,'playerPrivateSettings','main');
      const friends=settings?.socialFriends||[];
      if(handles.some(handle=>!friends.some(friend=>friend.handle===handle)))return response({error:'Choisis des amis enregistrés dans ton espace. Actualise si tu viens de les ajouter.'},403);
      const audience=[];
      for(const handle of handles){const profile=await read('__shared__','publicProfiles',handle);if(profile?.ownerUid&&profile.ownerUid!==uid&&await canReadSocialProfile(db,uid,profile))audience.push(profile.ownerUid);else return response({error:'Un des profils invités est indisponible.'},400);}
      const options=[];
      for(const key of ids){const game=await read(uid,'games',key);if(!game?.name||game._deletedAt)return response({error:'Un jeu sélectionné n’est plus disponible.'},400);options.push({name:String(game.name).slice(0,180)});}
      const count=await db.prepare("SELECT COUNT(*) AS total FROM documents WHERE owner='__shared__' AND collection='friendPolls' AND json_extract(data,'$.ownerUid')=?").bind(uid).first();
      if(count.total>=100)return response({error:'Supprime un ancien sondage avant d’en créer un autre.'},400);
      data={ownerUid:uid,audience:[...new Set(audience)],author:String(settings?.socialProfile?.displayName||'Un ami').slice(0,80),title:'Je commence lequel ?',options,votes:{},createdAt:new Date().toISOString(),endsAt:new Date(Date.now()+7*86400000).toISOString(),closed:false};
    }else{
      if(!allowed(previous))return response({error:'Sondage indisponible.'},403);
      if(previous.ownerUid!==uid&&await socialBlocked(db,uid,previous.ownerUid))return response({error:'Sondage indisponible.'},403);
      data=structuredClone(previous);
      if(body.action==='close'){
        if(data.ownerUid!==uid)return response({error:'Seul le créateur peut fermer ce sondage.'},403);
        data.closed=true;
      }else if(body.action==='vote'){
        if(data.ownerUid===uid)return response({error:'Laisse tes amis choisir.'},403);
        if(data.closed||Date.now()>=Date.parse(data.endsAt))return response({error:'Ce sondage est terminé.'},410);
        if(!Number.isInteger(body.choice)||body.choice<0||body.choice>=data.options.length)return response({error:'Choix invalide.'},400);
        data.votes={...data.votes,[uid]:body.choice};
      }else return response({error:'Action invalide.'},400);
    }
    const result=row?await db.prepare("UPDATE documents SET data=? WHERE owner='__shared__' AND collection='friendPolls' AND id=? AND data=?").bind(JSON.stringify(data),id,row.data).run():await db.prepare("INSERT OR IGNORE INTO documents(owner,collection,id,data) VALUES('__shared__','friendPolls',?,?)").bind(id,JSON.stringify(data)).run();
    if(!result.meta.changes)return response({error:'Le sondage a changé. Actualise puis réessaie.'},409);
    return response({poll:visible(id,data)});
  }catch{return response({error:'Impossible de charger les sondages. Réessaie.'},503);}
}
