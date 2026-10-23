import {activityDate} from './monthlyRecap';
export function normalizeEngagement(value={}) {
 const reflections=Object.fromEntries(Object.entries(value?.reflections||{}).filter(([key,item])=>key.length<=200&&item&&typeof item.text==='string').slice(-200).map(([key,item])=>[key,{text:item.text.slice(0,1000),at:activityDate(item.at)?.toISOString()||null,ratingAtReflection:Number.isFinite(Number(item.ratingAtReflection))?Math.max(0,Math.min(10,Number(item.ratingAtReflection))):null}]));
 const expeditions=Object.fromEntries(Object.entries(value?.expeditions||{}).filter(([key,item])=>key.length<=100&&item&&Array.isArray(item.answers)).slice(-50).map(([key,item])=>[key,{answers:item.answers.slice(0,2).map(v=>Number.isInteger(v)&&v>=0&&v<4?v:null),completedAt:activityDate(item.completedAt)?.toISOString()||null,score:Math.max(0,Math.min(2,Number(item.score)||0))}]));
 return {reflections,expeditions};
}
export function personalMemories(games=[],now=new Date(),all=false) {
 const today=new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())),year=today.getUTCFullYear(),items=[];
 for(const game of games.filter(g=>g.status!=='wishlist')){
  for(const [kind,label,raw] of [['completed','Tu terminais',game.completedAt],['added','Tu ajoutais',game.collectionAddedAt||game.createdAt],['favorite','Tu mettais en favori',game.favoriteAt]]){
   const date=activityDate(raw);if(!date||date>now||date.getUTCFullYear()<1980||date.getUTCFullYear()>=year)continue;
   const lastDay=new Date(Date.UTC(year,date.getUTCMonth()+1,0)).getUTCDate();
   let anniversary=new Date(Date.UTC(year,date.getUTCMonth(),Math.min(date.getUTCDate(),lastDay)));
   if(anniversary>today)anniversary=new Date(Date.UTC(year-1,date.getUTCMonth(),Math.min(date.getUTCDate(),new Date(Date.UTC(year-1,date.getUTCMonth()+1,0)).getUTCDate())));
   const days=Math.floor((today-anniversary)/86400000),years=anniversary.getUTCFullYear()-date.getUTCFullYear();
   if(years<1||(!all&&days>6))continue;
   items.push({id:`${String(game.id)}:${kind}:${date.toISOString().slice(0,10)}`,game,kind,label,at:date.toISOString(),years,days});
  }
 }
 return items.sort((a,b)=>a.days-b.days||b.years-a.years);
}
