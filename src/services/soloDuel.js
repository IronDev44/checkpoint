/* global globalThis */
import {arenaVariant} from './arenaVariants';
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
export function startDuel(ids,kind="classic",variant=null){
 if(variant!=null&&(!arenaVariant(variant)||kind!=='collection'))return null;
 if(!Array.isArray(ids)||(kind==="collection"?ids.length<2:![2,4,8].includes(ids.length))||new Set(ids).size!==ids.length||ids.some(id=>typeof id!=="string"||!id)||(["champions","ultimate"].includes(kind)&&ids.length<4))return null;
 const base=2**Math.floor(Math.log2(ids.length)),paired=kind==='collection'&&base!==ids.length?2*(ids.length-base):ids.length;
 return {id:newDuelId(),...(variant?{variant}:{}),kind:["champions","ultimate","collection"].includes(kind)?kind:"classic",roster:[...ids],round:ids.slice(0,paired),next:ids.slice(paired),index:0,roundNumber:1,winner:null,choices:0,matches:[],trackedFrom:0};
}
export function chooseDuel(state,id){
 if(!state||state.winner||!state.round.slice(state.index,state.index+2).includes(id))return state;
 const pair=state.round.slice(state.index,state.index+2),choices=state.choices+1;
 const match={choice:choices,round:state.roundNumber,winner:id,loser:pair.find(other=>other!==id)};
 const recorded={...state,trackedFrom:Number.isInteger(state.trackedFrom)?state.trackedFrom:state.choices,matches:[...(state.matches||[]),match]},next=[...state.next,id];
 if(state.index+2<state.round.length)return {...recorded,next,index:state.index+2,choices};
 if(next.length===1)return {...recorded,next,winner:id,choices,finishedAt:new Date().toISOString()};
 return {...recorded,round:next,next:[],index:0,roundNumber:state.roundNumber+1,choices};
}
export function validDuel(value,ids){
 if(!value||!Array.isArray(value.roster)||!startDuel(value.roster,value.kind,value.variant)||!value.roster.every(id=>ids.includes(id))||!Array.isArray(value.round)||!Array.isArray(value.next))return null;
 if(value.kind==='collection')return validCollectionDuel(value);
 const all=new Set(value.roster),round=value.round;
 if(![2,4,8].includes(round.length)||new Set(round).size!==round.length||!round.every(id=>all.has(id))||value.next.some(id=>!all.has(id))||!Number.isInteger(value.index)||value.index<0||value.index%2||value.index>=round.length||!Number.isInteger(value.choices)||value.choices<0||value.choices>value.roster.length-1||!Number.isInteger(value.roundNumber)||value.roundNumber<1||value.roundNumber>3)return null;
 if(value.roundNumber!==Math.log2(value.roster.length/round.length)+1||new Set(value.next).size!==value.next.length)return null;
 if(value.winner){if(round.length!==2||value.next.length!==1||!round.includes(value.winner)||value.next[0]!==value.winner||value.choices!==value.roster.length-1)return null;}
 else if(value.choices!==value.roster.length-round.length+value.index/2||value.next.length!==value.index/2||value.next.some((id,index)=>!round.slice(index*2,index*2+2).includes(id)))return null;
 return value;
}
function validCollectionDuel(value){
 const seed=startDuel(value.roster,'collection'),round=value.round,all=new Set(value.roster);
 const maxRounds=Math.ceil(Math.log2(value.roster.length));
 if(!Number.isInteger(value.roundNumber)||value.roundNumber<1||value.roundNumber>maxRounds)return null;
 const expectedSize=value.roundNumber===1?seed.round.length:2**(maxRounds-value.roundNumber+1);
 const byes=value.roundNumber===1?seed.next:[];
 if(round.length!==expectedSize||new Set(round).size!==round.length||!round.every(id=>all.has(id))||!Number.isInteger(value.index)||value.index<0||value.index%2||value.index>=round.length||new Set(value.next).size!==value.next.length)return null;
 if(value.roundNumber===1&&round.some(id=>!seed.round.includes(id)))return null;
 if(value.winner)return round.length===2&&value.next.length===1&&value.next[0]===value.winner&&round.includes(value.winner)&&value.choices===value.roster.length-1?value:null;
 const previousChoices=value.roundNumber===1?0:value.roster.length-round.length;
 if(value.choices!==previousChoices+value.index/2||value.next.length!==byes.length+value.index/2||byes.some((id,i)=>value.next[i]!==id)||value.next.slice(byes.length).some((id,i)=>!round.slice(i*2,i*2+2).includes(id)))return null;
 return value;
}
export function drawCollectionRoster(games,random=Math.random){
 const ids=[...new Set(duelCandidates(games).map(game=>String(game.id)))];
 for(let i=ids.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
 return ids;
}



export const CHAMPIONS_MINIMUM=4;
export function newDuelId(){return globalThis.crypto?.randomUUID?.()||`duel-${Date.now()}-${Math.random().toString(36).slice(2)}`;}
export function normalizeDuelHistory(value){
 const byId=new Map();
 for(const entry of Array.isArray(value)?value:[]){
  if(entry?.variant!=null&&(!arenaVariant(entry.variant)||entry.kind!=='collection'))continue;
  if(!entry||entry.winner==null||typeof entry.name!=='string'||!entry.name.trim()||(entry.kind==='collection'?(!Number.isSafeInteger(Number(entry.participants))||Number(entry.participants)<2):![2,4,8].includes(Number(entry.participants))))continue;
  const date=Number.isFinite(Date.parse(entry.date))?new Date(entry.date).toISOString():'';
  const id=typeof entry.id==='string'&&entry.id?entry.id:`legacy:${String(entry.winner)}:${date}:${entry.participants}`;
  const normalized={id,...(entry.variant?{variant:entry.variant}:{}),winner:String(entry.winner),name:entry.name.slice(0,200),date,participants:Number(entry.participants),kind:['champions','ultimate','collection'].includes(entry.kind)?entry.kind:'classic',cover:typeof entry.cover==='string'?entry.cover:'',revoked:entry.revoked===true,updatedAt:Number.isFinite(Date.parse(entry.updatedAt))?new Date(entry.updatedAt).toISOString():date};
  const previous=byId.get(id);
  if(!previous||(Date.parse(normalized.updatedAt)||0)>(Date.parse(previous.updatedAt)||0)||((Date.parse(normalized.updatedAt)||0)===(Date.parse(previous.updatedAt)||0)&&normalized.revoked&&!previous.revoked))byId.set(id,normalized);
 }
 return [...byId.values()].sort((a,b)=>(Date.parse(b.date)||0)-(Date.parse(a.date)||0)||a.id.localeCompare(b.id));
}
export function mergeDuelHistory(...sources){return normalizeDuelHistory(sources.flatMap(source=>Array.isArray(source)?source:[]));}
function nextDuelRevision(history,id,date){
 const previous=normalizeDuelHistory(history).find(entry=>entry.id===id),timestamp=Date.parse(date);
 if(!Number.isFinite(timestamp))return '';
 return new Date(Math.max(timestamp,(Date.parse(previous?.updatedAt)||0)+1)).toISOString();
}
export function recordDuelWinner(history,tournament,game,date=new Date().toISOString()){
 if(!tournament?.winner||!game||String(game.id)!==String(tournament.winner))return normalizeDuelHistory(history);
 return mergeDuelHistory(history,[{id:tournament.id,winner:tournament.winner,name:game.name,date,participants:tournament.roster.length,kind:tournament.kind,...(tournament.variant?{variant:tournament.variant}:{}),cover:game.cover_image||game.coverUrl||game.image||'',updatedAt:nextDuelRevision(history,tournament.id,date),revoked:false}]);
}
export function revokeDuelWinner(history,tournamentId,date=new Date().toISOString()){
 return normalizeDuelHistory(history).map(entry=>entry.id===tournamentId?{...entry,revoked:true,updatedAt:nextDuelRevision(history,tournamentId,date)}:entry);
}
export function duelChampions(history,games=[]){
 const owned=new Map(duelCandidates(games).map(game=>[String(game.id),game])),champions=new Map();
 for(const entry of normalizeDuelHistory(history).filter(entry=>!entry.revoked)){
  const champion=champions.get(entry.winner)||{id:entry.winner,name:entry.name,cover:entry.cover,wins:0,crowns:0,ultimateTitles:0,lastWon:entry.date,game:owned.get(entry.winner)||null};
  champion.wins+=1;if(entry.kind==='champions')champion.crowns+=1;if(['ultimate','collection'].includes(entry.kind)&&!entry.variant)champion.ultimateTitles+=1;champions.set(entry.winner,champion);
 }
 return [...champions.values()].sort((a,b)=>b.wins-a.wins||(Date.parse(b.lastWon)||0)-(Date.parse(a.lastWon)||0)||a.name.localeCompare(b.name,'fr'));
}
export function championCandidates(history,games){return duelChampions(duelHistoryForGroup(history,'quick'),games).filter(entry=>entry.game).map(entry=>entry.game);}

export function ultimateCandidates(history,games){return duelChampions(duelHistoryForGroup(history,'quick'),games).filter(entry=>entry.game&&entry.crowns>0).map(entry=>entry.game);}

export function duelPalmaresGroup(kind,variant){return kind==='collection'&&arenaVariant(variant)?`variant:${variant}`:kind==='collection'?'collection':'quick';}
export function duelHistoryForGroup(history,group){return normalizeDuelHistory(history).filter(entry=>duelPalmaresGroup(entry.kind,entry.variant)===group);}
export function removeDuelChampion(history,winner,group,date=new Date().toISOString()){
 return normalizeDuelHistory(history).map(entry=>!entry.revoked&&entry.winner===String(winner)&&duelPalmaresGroup(entry.kind,entry.variant)===group?{...entry,revoked:true,updatedAt:nextDuelRevision(history,entry.id,date)}:entry);
}

export function postponeDuel(state){
 if(!state||state.winner||state.round.length-state.index<=2)return state;
 return {...state,round:[...state.round.slice(0,state.index),...state.round.slice(state.index+2),...state.round.slice(state.index,state.index+2)]};
}
export function duelGameJourney(state,id){
 const matches=(state?.matches||[]).filter(match=>match.winner===String(id)||match.loser===String(id));
 const active=state?.winner?new Set([state.winner]):new Set([...(state?.next||[]),...(state?.round||[]).slice(state?.index||0)]);
 return {matches,status:state?.winner===String(id)?'champion':matches.some(match=>match.loser===String(id))?'eliminated':active.has(String(id))?'active':'earlier',partial:(state?.trackedFrom??(state?.choices||0))>0};
}
