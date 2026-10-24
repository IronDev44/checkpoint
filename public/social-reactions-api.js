import {readSocialDocument as read,canContact,socialBlocked,socialPairId,canReadSocialProfile} from './social-access.js';
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const VALUES=['well-played','interested','great-choice'];
export async function handleSocialReactions(request,env,uid,url){
 const db=env.ACCOUNT_DB;
 try{
  let input={};
  if(request.method==='POST'){const raw=await request.text();if(raw.length>2000)return reply({error:'Réaction invalide.'},400);try{input=JSON.parse(raw);}catch{return reply({error:'Réaction invalide.'},400);}}
  else if(request.method!=='GET')return reply({error:'Méthode non autorisée.'},405);
  const handle=request.method==='GET'?url.searchParams.get('handle'):input?.handle;
  const profile=typeof handle==='string'?await read(db,'__shared__','publicProfiles',handle):null;
  const author=profile?.ownerUid,settings=author?await read(db,author,'playerPrivateSettings','main'):null;
  if(!author||!await canReadSocialProfile(db,uid,profile,settings?.socialProfile)||profile.publicSections?.activity===false||settings?.socialProfile?.publicSections?.activity===false)return reply({error:'Activité indisponible.'},403);
  const own=author===uid;
  if(!own&&!await canContact(db,uid,author,'reactions'))return reply({error:'Les réactions sont réservées aux amis et dépendent des réglages du joueur.'},403);
  const activities=(profile.recentActivity||[]).filter(item=>item.id!=null).slice(0,40);
  if(request.method==='POST'){
   if(own||!activities.some(item=>String(item.id)===input.activityId)||!(input.value===null||VALUES.includes(input.value)))return reply({error:'Réaction invalide.'},400);
   const id=await socialPairId(`reaction-author:${author}`,`activity:${input.activityId}`);
   if(input.value===null)await db.prepare("DELETE FROM documents WHERE owner=? AND collection='socialReactions' AND id=?").bind(uid,id).run();
   else await db.prepare("INSERT INTO documents(owner,collection,id,data) VALUES(?,'socialReactions',?,?) ON CONFLICT(owner,collection,id) DO UPDATE SET data=excluded.data").bind(uid,id,JSON.stringify({author,activityId:input.activityId,value:input.value,at:new Date().toISOString()})).run();
  }
  const rows=await db.prepare("SELECT owner,data FROM documents WHERE collection='socialReactions' AND json_extract(data,'$.author')=?").bind(author).all();
  const visible=[];
  for(const row of rows.results)if(!await socialBlocked(db,author,row.owner))visible.push({owner:row.owner,...JSON.parse(row.data)});
  const reactions=Object.fromEntries(activities.map(item=>{const id=String(item.id),votes=visible.filter(row=>row.activityId===id);return [id,{mine:votes.find(row=>row.owner===uid)?.value||null,counts:Object.fromEntries(VALUES.map(value=>[value,votes.filter(row=>row.value===value).length]))}];}));
  return reply({reactions,canReact:!own});
 }catch{return reply({error:'Impossible de charger les réactions. Réessaie.'},503);}
}
