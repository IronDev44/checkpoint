export const DUEL_STORAGE_KEY='checkpoint-solo-favorite-duel-v1';
export function duelCandidates(games=[],filters={}){
 const names=value=>Array.isArray(value)?value.map(v=>typeof v==='string'?v:v?.name).filter(Boolean):[];
 return games.filter(g=>g.id!=null&&g.name&&g.status!=='wishlist'&&(!filters.favorites||g.favorite)&&(!filters.genre||names(g.genreNames||g.genres).includes(filters.genre))&&(!filters.platform||[...names(g.platformNames),...names(g.playedPlatforms)].includes(filters.platform))&&(!filters.seriesIds||filters.seriesIds.includes(String(g.id))));
}
export function drawDuelRoster(games,size=8,random=Math.random){
 const unique=[...new Map(games.map(g=>[String(g.id),g])).values()];
 for(let i=unique.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[unique[i],unique[j]]=[unique[j],unique[i]];}
 const count=[8,4,2].find(n=>n<=Math.min(Number(size)||8,unique.length))||0;return unique.slice(0,count).map(g=>String(g.id));
}
export function startDuel(ids){
 if(![2,4,8].includes(ids.length)||new Set(ids).size!==ids.length)return null;
 return {roster:[...ids],round:[...ids],next:[],index:0,roundNumber:1,winner:null,choices:0};
}
export function chooseDuel(state,id){
 if(!state||state.winner||!state.round.slice(state.index,state.index+2).includes(id))return state;
 const next=[...state.next,id],choices=state.choices+1;
 if(state.index+2<state.round.length)return {...state,next,index:state.index+2,choices};
 if(next.length===1)return {...state,next,winner:id,choices};
 return {...state,round:next,next:[],index:0,roundNumber:state.roundNumber+1,choices};
}
export function validDuel(value,ids){
 if(!value||!Array.isArray(value.roster)||!startDuel(value.roster)||!value.roster.every(id=>ids.includes(id))||!Array.isArray(value.round)||!Array.isArray(value.next))return null;
 const all=new Set(value.roster),round=value.round;
 if(![2,4,8].includes(round.length)||new Set(round).size!==round.length||!round.every(id=>all.has(id))||value.next.some(id=>!all.has(id))||!Number.isInteger(value.index)||value.index<0||value.index%2||value.index>=round.length||!Number.isInteger(value.choices)||value.choices<0||value.choices>value.roster.length-1||!Number.isInteger(value.roundNumber)||value.roundNumber<1||value.roundNumber>3)return null;
 if(value.winner){if(round.length!==2||value.next.length!==1||!round.includes(value.winner)||value.next[0]!==value.winner||value.choices!==value.roster.length-1)return null;}
 else if(value.next.length!==value.index/2||value.next.some((id,index)=>!round.slice(index*2,index*2+2).includes(id)))return null;
 return value;
}
