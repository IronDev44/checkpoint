import {toPublicFounderGame} from './gameCovers';
import {activityDate} from './monthlyRecap';
export const FAVORITE_REASON_MAX=160;
export function favoriteReason(value){return typeof value==='string'?value.trim().slice(0,FAVORITE_REASON_MAX):'';}
export function publicFavoriteGames(games=[],rating=g=>Number(g.rating)||0,allowReasons=true){
 return games.filter(g=>g.favorite&&g.name&&g.status!=='wishlist').sort((a,b)=>{
  const aShared=allowReasons&&a.favoriteReasonShared===true&&Boolean(favoriteReason(a.favoriteReason)),bShared=allowReasons&&b.favoriteReasonShared===true&&Boolean(favoriteReason(b.favoriteReason));
  return Number(bShared)-Number(aShared)||(bShared&&aShared?(activityDate(b.favoriteReasonUpdatedAt)?.getTime()||0)-(activityDate(a.favoriteReasonUpdatedAt)?.getTime()||0):0);
 }).slice(0,3).map(g=>({id:g.id,name:g.name,image:g.image||'',sourceIds:toPublicFounderGame(g).sourceIds,platforms:toPublicFounderGame(g).platforms,released:g.released||'',rating:rating(g),favoriteReason:allowReasons&&g.favoriteReasonShared===true?favoriteReason(g.favoriteReason):''}));
}
export function rediscoveryCandidates(games=[],rating=g=>Number(g.rating)||0,now=new Date()){
 const active=new Set(['en cours','in_progress','playing','deep_play']);
 return games.filter(g=>{
  if(g.id==null||!g.name||g.status==='wishlist'||active.has(g.status)||active.has(g.progressStatus))return false;
  const finished=g.completed===true||g.progressStatus==='completed'||['terminé','termine','completed','finished'].includes(g.status);
  if(!finished||(!g.favorite&&rating(g)<8&&!g.rediscoverPinned))return false;
  const date=activityDate(g.completedAt);
  if(date&&date>now)return false;
  return g.rediscoverPinned||!date||now-date>=180*86400000;
 }).map(g=>{const date=activityDate(g.completedAt);return {game:g,date,reason:date?`Terminé en ${date.toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}`:'Date de fin non renseignée',score:Number(rating(g))||0};})
 .sort((a,b)=>Number(Boolean(b.game.rediscoverPinned))-Number(Boolean(a.game.rediscoverPinned))||Number(Boolean(b.date))-Number(Boolean(a.date))||(a.date&&b.date?a.date-b.date:0)||Number(Boolean(b.game.favorite))-Number(Boolean(a.game.favorite))||b.score-a.score||String(a.game.name).localeCompare(String(b.game.name),'fr'));
}
export function rediscoverySelection(candidates,offset=0,size=3){
 const pinned=candidates.filter(c=>c.game.rediscoverPinned),others=candidates.filter(c=>!c.game.rediscoverPinned),slots=Math.max(0,size-pinned.length);
 return [...pinned,...Array.from({length:Math.min(slots,others.length)},(_,i)=>others[(offset+i)%others.length])];
}
