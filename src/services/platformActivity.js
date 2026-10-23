import {activityDate} from './monthlyRecap';
const numeric=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value))&&Number(value)>=0?Number(value):null;
const iso=value=>activityDate(value)?.toISOString()||null;
export function platformSyncPatch(provider,item,{profileId,now=new Date(),wishlist=false}={}){
 const patch={};
 if(provider==='steam'){
  if(item.steamAppId||item.appid)patch.steamAppId=item.steamAppId??item.appid;
  if(profileId)patch.steamProfileId=String(profileId);
  if(wishlist){
   patch.steamWishlistLastSyncedAt=now.toISOString();
   if(numeric(item.steamWishlistPriority)!==null)patch.steamWishlistPriority=numeric(item.steamWishlistPriority);
   if(iso(item.steamWishlistAddedAt))patch.steamWishlistAddedAt=iso(item.steamWishlistAddedAt);
  }else{
   patch.steamLastSyncedAt=now.toISOString();
   if(numeric(item.playtimeForever)!==null)patch.steamPlaytimeForever=numeric(item.playtimeForever);
   if(iso(item.steamLastPlayedAt))patch.steamLastPlayedAt=iso(item.steamLastPlayedAt);
   for(const field of ['steamCurrentAchievements','steamTotalAchievements'])if(numeric(item[field])!==null)patch[field]=numeric(item[field]);
  }
 }else if(provider==='xbox'){
  if(item.xboxTitleId||item.titleId)patch.xboxTitleId=String(item.xboxTitleId??item.titleId);
  if(profileId)patch.xboxProfileId=String(profileId);
  patch.xboxLastSyncedAt=now.toISOString();
  if(iso(item.xboxLastPlayedAt))patch.xboxLastPlayedAt=iso(item.xboxLastPlayedAt);
  for(const field of ['xboxCurrentGamerscore','xboxMaxGamerscore','xboxCurrentAchievements','xboxTotalAchievements'])if(numeric(item[field])!==null)patch[field]=numeric(item[field]);
 }
 return Object.fromEntries(Object.entries(patch).filter(([,value])=>value!==undefined));
}
const time=minutes=>{const value=numeric(minutes);if(value===null)return 'Non communiqué';const hours=Math.floor(value/60),rest=Math.round(value%60);return hours?`${hours} h${rest?` ${rest} min`:''}`:`${rest} min`;};
export function platformActivityRows(game,provider){
 const prefix=provider==='steam'?'steam':'xbox',unlocked=numeric(game[`${prefix}CurrentAchievements`]),total=numeric(game[`${prefix}TotalAchievements`]);
 const rows=provider==='steam'?[{label:'Temps de jeu Steam',value:time(game.steamPlaytimeForever)}]:[{label:'Gamerscore',value:numeric(game.xboxCurrentGamerscore)===null?'Non communiqué':`${game.xboxCurrentGamerscore}${numeric(game.xboxMaxGamerscore)!==null?` / ${game.xboxMaxGamerscore}`:''} G`}];
 rows.push({label:'Succès',value:unlocked===null?'Non communiqués':`${unlocked}${total!==null?` / ${total}`:''}`});
 const last=iso(game[`${prefix}LastPlayedAt`]);
 rows.push({label:provider==='xbox'?'Dernière activité de succès Xbox':'Dernière partie Steam',value:last?new Date(last).toLocaleDateString('fr-FR'):'Non communiquée'});
 return rows;
}
export function mergeXboxPages(previous,next){
 if(previous.profile?.xuid!==next.profile?.xuid)throw Error('Le compte Xbox a changé. Relance une analyse complète.');
 const token=next.continuationToken||null,seen=[...(previous.seenContinuations||[]),previous.continuationToken].filter(Boolean);
 if(token&&seen.includes(token))throw Error('Xbox a renvoyé la même page. Réessaie plus tard.');
 return {...next,seenContinuations:seen,games:[...new Map([...(previous.games||[]),...(next.games||[])].map(g=>[String(g.xboxTitleId),g])).values()]};
}
