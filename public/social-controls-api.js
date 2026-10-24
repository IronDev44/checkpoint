import {readSocialDocument as read,socialPreferences,socialPairId,confirmedFriends} from './social-access.js';
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const view=data=>({preferences:socialPreferences(data),blocked:Object.values(data?.blocked||{}),muted:Object.values(data?.muted||{})});
export async function handleSocialControls(request,env,uid){
 const db=env.ACCOUNT_DB;
 try{
  const row=await db.prepare("SELECT data FROM documents WHERE owner=? AND collection='socialControls' AND id='main'").bind(uid).first();
  const old=row?JSON.parse(row.data):{preferences:socialPreferences(),blocked:{}};
  if(request.method==='GET')return reply(view(old));
  if(request.method!=='POST')return reply({error:'Méthode non autorisée.'},405);
  const raw=await request.text();if(raw.length>2000)return reply({error:'Demande trop volumineuse.'},413);
  let input;try{input=JSON.parse(raw);}catch{return reply({error:'Demande invalide.'},400);}
  if(!input||typeof input!=='object')return reply({error:'Demande invalide.'},400);
  let next={...old,blocked:{...old.blocked},muted:{...old.muted}},otherUid,otherIdentity;
  if(input.action==='preferences'){
   if(!input.preferences||Object.keys(input.preferences).some(key=>!Object.hasOwn(socialPreferences(),key)||typeof input.preferences[key]!=='boolean'))return reply({error:'Réglages invalides.'},400);
   next.preferences={...socialPreferences(old),...input.preferences};
  }else if(['block','unblock','mute','unmute'].includes(input.action)){
   const handle=typeof input.handle==='string'?input.handle:'';
   const mute=['mute','unmute'].includes(input.action),map=mute?'muted':'blocked';
   if(['block','mute'].includes(input.action)){
    const knownRow=await db.prepare("SELECT data FROM documents WHERE owner='__shared__' AND collection='friendships' AND (json_extract(data,'$.sender')=? OR json_extract(data,'$.recipient')=?) AND (json_extract(data,'$.senderProfile.handle')=? OR json_extract(data,'$.recipientProfile.handle')=?) LIMIT 1").bind(uid,uid,handle,handle).first();
    const known=knownRow?JSON.parse(knownRow.data):null;
    const knownIdentity=known?(known.sender===uid?known.recipientProfile:known.senderProfile):null;
    const profile=await read(db,'__shared__','publicProfiles',handle);
    const settings=profile?.ownerUid?await read(db,profile.ownerUid,'playerPrivateSettings','main'):null;
    if(known&&knownIdentity?.handle===handle){otherUid=known.sender===uid?known.recipient:known.sender;otherIdentity=knownIdentity;}
    else{
     if(!profile?.ownerUid||profile.ownerUid===uid||!['public','friends'].includes(profile.visibility)||(settings?.socialProfile?.visibility&&!['public','friends'].includes(settings.socialProfile.visibility)))return reply({error:'Ce joueur est indisponible.'},400);
     otherUid=profile.ownerUid;otherIdentity={handle,displayName:String(profile.displayName||handle).slice(0,80)};
    }
    if(input.action==='mute'&&!await confirmedFriends(db,uid,otherUid))return reply({error:'Choisis un ami confirmé pour masquer ses activités.'},403);
    if(Object.keys(next[map]).length>=200&&!next[map][otherUid])return reply({error:'Cette liste est pleine.'},400);
    next[map][otherUid]={handle,displayName:otherIdentity.displayName||handle};
   }else{
    otherUid=Object.keys(next[map]).find(key=>next[map][key].handle===handle);
    otherIdentity=next[map][otherUid];
    if(otherUid)delete next[map][otherUid];
   }
  }else return reply({error:'Action invalide.'},400);
  const saved=row?await db.prepare("UPDATE documents SET data=? WHERE owner=? AND collection='socialControls' AND id='main' AND data=?").bind(JSON.stringify(next),uid,row.data).run():await db.prepare("INSERT OR IGNORE INTO documents(owner,collection,id,data) VALUES(?,'socialControls','main',?)").bind(uid,JSON.stringify(next)).run();
  if(!saved.meta.changes)return reply({error:'Les réglages ont changé sur un autre appareil. Actualise puis réessaie.'},409);
  if(otherUid&&['block','unblock'].includes(input.action)){
   const id=await socialPairId(uid,otherUid),now=new Date().toISOString();
   const own=await read(db,uid,'playerPrivateSettings','main');
   const removed={sender:uid,recipient:otherUid,senderProfile:{handle:own?.socialProfile?.handle||'',displayName:own?.socialProfile?.displayName||'Joueur'},recipientProfile:otherIdentity,status:'removed',createdAt:now,updatedAt:now};
   await db.prepare("INSERT INTO documents(owner,collection,id,data) VALUES('__shared__','friendships',?,?) ON CONFLICT(owner,collection,id) DO UPDATE SET data=json_set(documents.data,'$.status','removed','$.updatedAt',?)").bind(id,JSON.stringify(removed),now).run();
  }
  return reply(view(next));
 }catch{return reply({error:'Impossible de charger les réglages sociaux.'},503);}
}
