import {readSocialDocument as read,canReadSocialProfile,socialPairId} from './social-access.js';
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const reasons=['spam','harassment','offensive','other'];
const view=(id,data)=>({id,reason:data.reason,details:data.details,status:data.status,createdAt:data.createdAt,target:data.target,reporter:data.reporter});
export async function handleSocialReports(request,env,uid,url){
 const db=env.ACCOUNT_DB,admin=!!env.ACCOUNT_OWNER_UID&&uid===env.ACCOUNT_OWNER_UID;
 try{
  if(request.method==='GET'){
   if(!admin)return reply({error:'Accès réservé au propriétaire.'},403);
   let cursor;try{const raw=url.searchParams.get('cursor');if(raw){if(raw.length>1000)throw Error();cursor=JSON.parse(atob(raw));if(!Number.isFinite(Date.parse(cursor.at))||!/^[a-f0-9]{64}$/.test(cursor.id))throw Error();}}catch{return reply({error:'Page invalide.'},400);}
   const rows=await db.prepare("SELECT id,data FROM documents WHERE owner='__shared__' AND collection='socialReports'"+(cursor?" AND (json_extract(data,'$.createdAt')<? OR (json_extract(data,'$.createdAt')=? AND id>?))":'')+" ORDER BY json_extract(data,'$.createdAt') DESC,id ASC LIMIT 51").bind(...(cursor?[cursor.at,cursor.at,cursor.id]:[])).all();
   const items=rows.results.slice(0,50).map(row=>view(row.id,JSON.parse(row.data))),last=items.at(-1);
   return reply({items,cursor:rows.results.length>50?btoa(JSON.stringify({at:last.createdAt,id:last.id})):null});
  }
  if(request.method!=='POST')return reply({error:'Méthode non autorisée.'},405);
  const raw=await request.text();if(raw.length>5000)return reply({error:'Signalement trop long.'},413);
  let input;try{input=JSON.parse(raw);}catch{return reply({error:'Signalement invalide.'},400);}
  if(!input||typeof input!=='object')return reply({error:'Signalement invalide.'},400);
  if(input.action==='status'){
   if(!admin)return reply({error:'Accès réservé au propriétaire.'},403);
   if(!/^[a-f0-9]{64}$/.test(input.id||'')||!['new','progress','resolved','dismissed'].includes(input.status))return reply({error:'Suivi invalide.'},400);
   const row=await db.prepare("SELECT data FROM documents WHERE owner='__shared__' AND collection='socialReports' AND id=?").bind(input.id).first();
   if(!row)return reply({error:'Signalement introuvable.'},404);
   const data={...JSON.parse(row.data),status:input.status,updatedAt:new Date().toISOString()};
   const saved=await db.prepare("UPDATE documents SET data=? WHERE owner='__shared__' AND collection='socialReports' AND id=? AND data=?").bind(JSON.stringify(data),input.id,row.data).run();
   return saved.meta.changes?reply({ok:true}):reply({error:'Ce signalement a changé. Actualise puis réessaie.'},409);
  }
  if(input.action!=='report'||!reasons.includes(input.reason)||typeof input.handle!=='string'||typeof input.details!=='string'||input.details.length>1500||!['profile','activity'].includes(input.type))return reply({error:'Choisis un motif et vérifie ton message.'},400);
  const profile=await read(db,'__shared__','publicProfiles',input.handle);
  if(!profile?.ownerUid||profile.ownerUid===uid||!await canReadSocialProfile(db,uid,profile))return reply({error:'Ce contenu est indisponible.'},403);
  const settings=await read(db,profile.ownerUid,'playerPrivateSettings','main');
  let snapshot=String(profile.bio||'').slice(0,2000),title=String(profile.displayName||input.handle).slice(0,120),activityId=null;
  if(input.type==='activity'){
   if(profile.publicSections?.activity===false||settings?.socialProfile?.publicSections?.activity===false)return reply({error:'Cette publication est indisponible.'},403);
   const activity=(profile.recentActivity||[]).find(item=>String(item.id)===input.activityId);
   if(!activity)return reply({error:'Cette publication n’est plus disponible.'},404);
   activityId=String(activity.id);title=String(activity.title||activity.type||'Publication').slice(0,180);
   snapshot=[activity.text,activity.detail,activity.reviewText].filter(value=>typeof value==='string').join('\n').slice(0,3000);
  }
  const id=await socialPairId(`reporter:${uid}`,`target:${profile.ownerUid}:${input.type}:${activityId||''}:${snapshot}`);
  if(await read(db,'__shared__','socialReports',id))return reply({ok:true,alreadyReported:true});
  const recent=await db.prepare("SELECT COUNT(*) AS total FROM documents WHERE owner='__shared__' AND collection='socialReports' AND json_extract(data,'$.reporterUid')=? AND json_extract(data,'$.createdAt')>?").bind(uid,new Date(Date.now()-86400000).toISOString()).first();
  if(recent.total>=20)return reply({error:'Tu as déjà envoyé vingt signalements aujourd’hui.'},429);
  const own=await read(db,uid,'playerPrivateSettings','main');
  const data={reporterUid:uid,targetUid:profile.ownerUid,reporter:{handle:own?.socialProfile?.handle||'',displayName:String(own?.socialProfile?.displayName||'Joueur').slice(0,80)},target:{type:input.type,handle:input.handle,displayName:String(profile.displayName||input.handle).slice(0,80),activityId,title,snapshot},reason:input.reason,details:input.details.trim(),status:'new',createdAt:new Date().toISOString()};
  await db.prepare("INSERT OR IGNORE INTO documents(owner,collection,id,data) VALUES('__shared__','socialReports',?,?)").bind(id,JSON.stringify(data)).run();
  return reply({ok:true});
 }catch{return reply({error:'Impossible de traiter le signalement. Réessaie.'},503);}
}
