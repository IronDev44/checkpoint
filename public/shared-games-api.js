import {readSocialDocument as read,confirmedFriends,canReadSocialProfile,socialPreferences} from './social-access.js';
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export async function handleSharedGames(request,env,uid,url){
 try{
  if(request.method!=='GET')return reply({error:'Méthode non autorisée.'},405);
  const db=env.ACCOUNT_DB,handle=url.searchParams.get('handle');
  const profile=handle?await read(db,'__shared__','publicProfiles',handle):null;
  const settings=profile?.ownerUid?await read(db,profile.ownerUid,'playerPrivateSettings','main'):null;
  if(!profile?.ownerUid||profile.ownerUid===uid||!await canReadSocialProfile(db,uid,profile,settings?.socialProfile)||!await confirmedFriends(db,uid,profile.ownerUid))return reply({error:'Cette comparaison est réservée aux amis confirmés disposant d’un profil accessible.'},403);
  const controls=await read(db,profile.ownerUid,'socialControls','main');
  if(!socialPreferences(controls).sharedLibrary)return reply({shared:false,games:[]});
  const rows=await db.prepare("SELECT data FROM documents WHERE owner=? AND collection='games'").bind(profile.ownerUid).all();
  const keys=['name','released','releaseDate','sourceIds','igdbId','platformNames','playedPlatforms','progressStatus','status','completed','experience','game_modes','gameModes','multiplayer_modes','multiplayerModes'];
  const games=rows.results.map(row=>JSON.parse(row.data)).filter(game=>!game._deletedAt&&game.status!=='wishlist'&&game.name).map(game=>Object.fromEntries(keys.filter(key=>Object.hasOwn(game,key)).map(key=>[key,game[key]])));
  return reply({shared:true,games});
 }catch{return reply({error:'Impossible de charger vos jeux en commun.'},503);}
}
