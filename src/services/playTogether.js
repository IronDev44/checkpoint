import {GameService} from './gameService';
import {sameSocialGame} from './friendComparison';
const list=value=>Array.isArray(value)?value:[];
const name=value=>typeof value==='string'?value:value?.platform?.name||value?.name||'';
const key=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const platformKey=value=>{const v=key(value);return {pc:'pc',windows:'pc',microsoftwindows:'pc',pcwindows:'pc',pcmicrosoftwindows:'pc',ps1:'playstation',ps2:'playstation2',ps3:'playstation3',ps4:'playstation4',ps5:'playstation5',xboxseriesx:'xboxseries',xboxseriess:'xboxseries',xboxseriesxs:'xboxseries',xboxseriessx:'xboxseries'}[v]||v;};
function platforms(game){const values=list(game.playedPlatforms).length?game.playedPlatforms:list(game.platformNames).length?game.platformNames:game.platforms;return list(values).map(name).filter(Boolean);}
export function sharedGamePlatforms(ownGame,friendGame){const theirs=new Set(platforms(friendGame).map(platformKey));return [...new Set(platforms(ownGame).filter(platform=>theirs.has(platformKey(platform))))];}
export function multiplayerInfo(game={}){
 const modes=list(game.game_modes||game.gameModes||game.normalized?.gameModes).map(name).map(key);
 const details=list(game.multiplayer_modes||game.multiplayerModes).filter(row=>row&&typeof row==='object');
 const coop=modes.some(mode=>['cooperative','coop','cooperation'].includes(mode))||details.some(row=>row.offlinecoop===true||row.onlinecoop===true||row.lancoop===true||row.campaigncoop===true);
 const multi=coop||modes.some(mode=>['multiplayer','massivelymultiplayeronlinemmo','splitscreen'].includes(mode))||details.some(row=>Number(row.onlinemax)>1||Number(row.offlinemax)>1||row.splitscreen===true);
 const labels=[];if(coop)labels.push('Coopération');if(details.some(row=>row.onlinecoop===true))labels.push('Coop en ligne');if(details.some(row=>row.offlinecoop===true))labels.push('Coop locale');if(details.some(row=>row.lancoop===true))labels.push('Coop en réseau local');if(!coop&&multi)labels.push('Multijoueur');
 const capacity={local:Math.max(0,...details.map(row=>Number(coop?row.offlinecoopmax:row.offlinemax)||0)),online:Math.max(0,...details.map(row=>Number(coop?row.onlinecoopmax:row.onlinemax)||0))};
 return {capacity,kind:coop?'coop':multi?'multi':modes.length&&modes.every(mode=>mode==='singleplayer')?'solo':'unknown',labels};
}
export async function loadMultiplayerInfo(game,request=GameService.igdb,options={}){
 const known=multiplayerInfo(game);if(known.kind!=='unknown'&&(!options.requireCapacity||known.kind==='solo'||known.capacity?.local||known.capacity?.online))return known;
 const explicit=game.sourceIds?.igdb||game.normalized?.sourceIds?.igdb||game.igdbId||[game.rawgId,game.canonicalId,game.id].map(value=>String(value||'').match(/^igdb:(\d+)$/)?.[1]).find(Boolean);
 let id=/^[1-9]\d*$/.test(String(explicit||''))?String(explicit):'';
 if(!id){if(!/^\d{4}/.test(String(game.released||game.releaseDate||'')))return {kind:'unknown',labels:[]};const payload=await request('/games',{search:game.name,page_size:20},{normalize:false,timeout:6000});const matches=list(payload.results).filter(item=>item.first_release_date||/^\d{4}/.test(String(item.released||''))).filter(item=>sameSocialGame(game,{...item,released:item.first_release_date?new Date(Number(item.first_release_date)*1000).toISOString().slice(0,10):item.released}));if(matches.length!==1)return {kind:'unknown',labels:[]};id=String(matches[0].id);if(!/^[1-9]\d*$/.test(id))return {kind:'unknown',labels:[]};}
 const detail=await request(`/games/${id}`,{},{normalize:false,timeout:6000});
 if(String(detail?.id)!==id)return {kind:'unknown',labels:[]};
 return multiplayerInfo(detail);
}
