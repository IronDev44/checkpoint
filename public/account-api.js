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
  if(!PRIVATE.has(name)&&!SHARED.has(name))return response({error:'Collection inconnue.'},400);
  if(id!==null&&(!id||id.length>250||id.includes('/')))return response({error:'Identifiant invalide.'},400);
  const owner=PRIVATE.has(name)?uid:'__shared__';
  const db=env.ACCOUNT_DB;
  try{
    if(request.method==='GET'){
      if(name==='news')await refreshNews(env);
      if(id){const row=await db.prepare('SELECT data FROM documents WHERE owner=? AND collection=? AND id=?').bind(owner,name,id).first();return response({exists:!!row,data:row?JSON.parse(row.data):null,id});}
      const rows=await db.prepare('SELECT id,data FROM documents WHERE owner=? AND collection=? ORDER BY id').bind(owner,name).all();return response({documents:rows.results.map(r=>({id:r.id,data:JSON.parse(r.data)}))});
    }
    if(!['POST','DELETE'].includes(request.method))return response({error:'Méthode non autorisée.'},405);
    if(!id)return response({error:'Identifiant requis.'},400);
    if(SHARED.has(name)&&name!=='publicProfiles'&&uid!==env.ACCOUNT_OWNER_UID)return response({error:'Accès réservé au propriétaire.'},403);
    const row=await db.prepare('SELECT data FROM documents WHERE owner=? AND collection=? AND id=?').bind(owner,name,id).first();
    const previous=row?JSON.parse(row.data):null;
    if(name==='publicProfiles'&&previous?.ownerUid!==uid&&previous)return response({error:'Ce profil appartient à un autre compte.'},403);
    if(request.method==='DELETE'){await db.prepare('DELETE FROM documents WHERE owner=? AND collection=? AND id=?').bind(owner,name,id).run();return response({ok:true});}
    const raw=await request.text();if(raw.length>900000)return response({error:'Document trop volumineux.'},413);
    const body=JSON.parse(raw);if(!plainObject(body.data))return response({error:'Document invalide.'},400);
    if(body.mode==='update'&&!previous)return response({error:'Document introuvable.'},404);
    if(body.mode==='progress'&&(name!=='playerProgress'||id!=='gaming'))return response({error:'Progression invalide.'},400);
    const data=body.mode==='progress'?mergeGamingProgress(previous||{},transform(body.data)):body.mode==='replace'?transform(body.data):mergeDocument(previous,body.data,body.mode==='update');
    if(name==='publicProfiles')data.ownerUid=uid;
    // Optimistic concurrency prevents silently overwriting another simultaneous change.
    if(row){const result=await db.prepare('UPDATE documents SET data=? WHERE owner=? AND collection=? AND id=? AND data=?').bind(JSON.stringify(data),owner,name,id,row.data).run();if(!result.meta.changes)return response({error:'Une modification simultanée a eu lieu. Réessaie.'},409);}
    else{const result=await db.prepare('INSERT OR IGNORE INTO documents(owner,collection,id,data) VALUES(?,?,?,?)').bind(owner,name,id,JSON.stringify(data)).run();if(!result.meta.changes)return response({error:'Ce document vient d’être créé. Réessaie.'},409);}
    return response(body.mode==='progress'?{ok:true,data}:{ok:true});
  }catch{return response({error:'Impossible de traiter la demande. Réessaie.'},503);}
}
