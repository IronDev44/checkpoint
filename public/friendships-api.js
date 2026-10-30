import {canContact,socialBlocked,canReadSocialProfile} from './social-access.js';
import {socialQuota} from './social-reliability.js';
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const identity=(handle,p)=>({handle,displayName:String(p.displayName||handle).slice(0,80),photoURL:p.photoURL||'',platform:String(p.platform||'').slice(0,120),level:Number(p.level)||1});

// One record per pair: acceptance is reciprocal and never depends on a client-supplied friend list.
export async function handleFriendships(request,env,uid){
 const db=env.ACCOUNT_DB;
 const read=async(owner,collection,id)=>{const row=await db.prepare('SELECT data FROM documents WHERE owner=? AND collection=? AND id=?').bind(owner,collection,id).first();return row?JSON.parse(row.data):null;};
 const publicIdentity=async handle=>{
  const profile=await read('__shared__','publicProfiles',handle);
  if(!profile?.ownerUid||!['public','friends'].includes(profile.visibility))return null;
  const settings=await read(profile.ownerUid,'playerPrivateSettings','main');
  if(settings?.socialProfile?.visibility&&!['public','friends'].includes(settings.socialProfile.visibility))return null;
  const limited=profile.visibility==='friends'||settings?.socialProfile?.visibility==='friends';
  return {uid:profile.ownerUid,profile:limited?{handle,displayName:String(profile.displayName||handle).slice(0,80)}:identity(handle,profile)};
 };
 try{
  if(request.method==='GET'){
   const rows=await db.prepare("SELECT id,data FROM documents WHERE owner='__shared__' AND collection='friendships' AND (json_extract(data,'$.sender')=? OR json_extract(data,'$.recipient')=?) ORDER BY json_extract(data,'$.updatedAt') DESC").bind(uid,uid).all();
   const connections=await Promise.all(rows.results.map(async row=>{
    const data=JSON.parse(row.data),sent=data.sender===uid,blocked=await socialBlocked(db,uid,sent?data.recipient:data.sender),snapshot=sent?data.recipientProfile:data.senderProfile;
    const profile=await read('__shared__','publicProfiles',snapshot.handle);
    const visible=profile&&!blocked&&await canReadSocialProfile(db,uid,profile);
    return {id:row.id,status:blocked?'blocked':data.status,direction:sent?'sent':'received',profile:visible?identity(snapshot.handle,profile):{handle:snapshot.handle,displayName:snapshot.displayName||snapshot.handle},createdAt:data.createdAt,updatedAt:data.updatedAt};
   }));
   return reply({connections});
  }
  if(request.method!=='POST')return reply({error:'Méthode non autorisée.'},405);
  const raw=await request.text();if(raw.length>2000)return reply({error:'Demande trop volumineuse.'},413);
  let body;try{body=JSON.parse(raw);}catch{return reply({error:'Demande invalide.'},400);}
  if(!body||!['send','accept','decline','cancel','remove'].includes(body.action))return reply({error:'Action invalide.'},400);
  let id=body.id,previous,row,next;
  const now=new Date().toISOString();
  if(body.action==='send'){
   const handle=typeof body.handle==='string'?body.handle.trim().toLowerCase().replace(/^@/,''):'';
   if(!/^[a-z0-9_-]{3,32}$/.test(handle))return reply({error:'Identifiant invalide.'},400);
   const target=await publicIdentity(handle);
   if(!target)return reply({error:'Ce profil public est indisponible.'},404);
   if(target.uid===uid)return reply({error:'Tu ne peux pas t’ajouter toi-même.'},400);
   if(!await canContact(db,uid,target.uid,'invitations'))return reply({error:'Ce joueur n’accepte pas les invitations pour le moment.'},403);
   const ownSettings=await read(uid,'playerPrivateSettings','main');
   const own=await publicIdentity(ownSettings?.socialProfile?.handle||'');
   if(!own||own.uid!==uid)return reply({error:'Active et enregistre ton profil public avant d’envoyer une invitation.'},400);
   const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([uid,target.uid].sort())));
   id=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
   row=await db.prepare("SELECT data FROM documents WHERE owner='__shared__' AND collection='friendships' AND id=?").bind(id).first();previous=row?JSON.parse(row.data):null;
   if(previous?.status==='accepted')return reply({ok:true,status:'accepted'});
   if(previous?.status==='pending')return reply({ok:true,status:'pending',direction:previous.sender===uid?'sent':'received'});
   const refusal=(previous?.refusals||{})[uid];
   if(refusal?.count>=3)return reply({error:'Ce joueur a refusé plusieurs fois tes demandes. Laisse-le reprendre contact s’il le souhaite.'},403);
   const delay=refusal?.count>=2?7*86400000:86400000;
   if(refusal&&Date.now()-Date.parse(refusal.at)<delay)return reply({error:refusal.count>=2?'Attends sept jours après ce nouveau refus.':'Cette invitation a été refusée récemment. Réessaie demain.'},429);
   if(!refusal&&previous?.status==='declined'&&Date.now()-Date.parse(previous.updatedAt)<86400000)return reply({error:'Cette invitation a été refusée récemment. Réessaie demain.'},429);
   if(previous?.status==='cancelled'&&previous.sender===uid&&Date.now()-Date.parse(previous.updatedAt)<3600000)return reply({error:'Attends une heure avant de renvoyer cette invitation annulée.'},429);
   const count=await db.prepare("SELECT COUNT(*) AS total FROM documents WHERE owner='__shared__' AND collection='friendships' AND json_extract(data,'$.sender')=? AND json_extract(data,'$.status')='pending'").bind(uid).first();
   if(count.total>=50)return reply({error:'Tu as déjà 50 invitations en attente.'},429);
   const since=new Date(Date.now()-86400000).toISOString();
   const daily=await db.prepare("SELECT COUNT(*) AS total FROM documents,json_each(documents.data,'$.sentHistory') AS history,json_each(history.value) AS sent WHERE owner='__shared__' AND collection='friendships' AND history.key=? AND sent.value>?").bind(uid,since).first();
   if(daily.total>=20)return reply({error:'Tu as déjà envoyé vingt invitations aujourd’hui. Réessaie demain.'},429);
   if(!await socialQuota(db,uid,'invitations',20,86400000))return reply({error:'Tu as déjà envoyé vingt invitations aujourd’hui. Réessaie demain.'},429);
   const sentHistory=Object.fromEntries(Object.entries(previous?.sentHistory||{}).map(([member,dates])=>[member,dates.filter(date=>date>since)]));
   sentHistory[uid]=[...(sentHistory[uid]||[]),now];
   next={sender:uid,recipient:target.uid,senderProfile:own.profile,recipientProfile:target.profile,status:'pending',createdAt:now,updatedAt:now,refusals:previous?.refusals||{},sentHistory};
  }else{
   if(typeof id!=='string'||!/^[a-f0-9]{64}$/.test(id))return reply({error:'Invitation invalide.'},400);
   row=await db.prepare("SELECT data FROM documents WHERE owner='__shared__' AND collection='friendships' AND id=?").bind(id).first();previous=row?JSON.parse(row.data):null;
   if(!previous||![previous.sender,previous.recipient].includes(uid))return reply({error:'Invitation indisponible.'},403);
   if(body.action==='accept'&&await socialBlocked(db,previous.sender,previous.recipient))return reply({error:'Cette invitation est indisponible.'},403);
   if(['accept','decline'].includes(body.action)&&previous.recipient!==uid)return reply({error:'Seul le destinataire peut répondre.'},403);
   if(body.action==='cancel'&&previous.sender!==uid)return reply({error:'Seul l’expéditeur peut annuler.'},403);
   const status={accept:'accepted',decline:'declined',cancel:'cancelled',remove:'removed'}[body.action];
   if(previous.status===status)return reply({ok:true,status});
   if(previous.status!==(body.action==='remove'?'accepted':'pending'))return reply({error:'Cette invitation a changé. Actualise la liste.'},409);
   next={...previous,status,updatedAt:now};
   if(body.action==='decline')next.refusals={...previous.refusals,[previous.sender]:{count:(previous.refusals?.[previous.sender]?.count||0)+1,at:now}};
   if(body.action==='accept')next.refusals={};
  }
  const cap=body.action==='send'?" AND (SELECT COUNT(*) FROM documents WHERE owner='__shared__' AND collection='friendships' AND json_extract(data,'$.sender')=? AND json_extract(data,'$.status')='pending')<50":'';
  const result=row?await db.prepare("UPDATE documents SET data=? WHERE owner='__shared__' AND collection='friendships' AND id=? AND data=?"+cap).bind(JSON.stringify(next),id,row.data,...(cap?[uid]:[])).run():await db.prepare("INSERT OR IGNORE INTO documents(owner,collection,id,data) SELECT '__shared__','friendships',?,? WHERE 1=1"+cap).bind(id,JSON.stringify(next),...(cap?[uid]:[])).run();
  if(!result.meta.changes){
   const latest=await db.prepare("SELECT data FROM documents WHERE owner='__shared__' AND collection='friendships' AND id=?").bind(id).first();
   if(latest){const data=JSON.parse(latest.data);if(data.status===next.status&&data.sender===next.sender&&data.recipient===next.recipient)return reply({ok:true,status:data.status});}
   return reply({error:'La demande a changé. Actualise puis réessaie.'},409);
  }
  return reply({ok:true,status:next.status});
 }catch{return reply({error:'Impossible de charger les invitations. Réessaie.'},503);}
}
