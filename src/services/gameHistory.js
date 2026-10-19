import {activityDate} from './monthlyRecap';
export const HISTORY_LABELS={added:'Ajouté à la bibliothèque',started:'Partie commencée',resumed:'Partie reprise',paused:'Mis en pause',abandoned:'Partie abandonnée',completed:'Jeu terminé',reset:'Progression réinitialisée',tried:'Jeu essayé',wishlist:'Déplacé dans la wishlist'};
export function historyState(game={}){
 if(game.completed||game.progressStatus==='completed'||/^(terminé|termine|completed|finished)$/.test(game.status||''))return 'completed';
 if(['paused','abandoned','tried'].includes(game.progressStatus))return game.progressStatus;
 if(game.status==='en cours'||['playing','in_progress','deep_play'].includes(game.progressStatus))return 'playing';
 return game.status==='wishlist'?'wishlist':'not_started';
}
export function normalizeGameHistory(value){return (Array.isArray(value)?value:[]).filter(event=>event&&HISTORY_LABELS[event.type]&&activityDate(event.at)).slice(-200).map(event=>({id:String(event.id||`${event.type}:${activityDate(event.at).toISOString()}`),type:event.type,at:activityDate(event.at).toISOString()}));}
export function stampGameHistory(before,patch,at=new Date().toISOString()){
 if(Object.hasOwn(patch,'playHistory'))return patch;
 const from=historyState(before),to=historyState({...before,...patch});
 if(from===to)return patch;
 const type=to==='playing'?(from==='not_started'||from==='wishlist'?'started':'resumed'):to==='not_started'?'reset':to;
 return {...patch,playHistory:[...gameHistory(before).sort((a,b)=>a.at.localeCompare(b.at)).map(({id,type,at})=>({id,type,at})),{id:`${at}:${type}`,type,at}].slice(-200)};
}
export function gameHistory(game){
 const events=normalizeGameHistory(game.playHistory);
 for(const [type,value] of [['added',game.collectionAddedAt||game.createdAt],['completed',game.completedAt]]){const date=activityDate(value);if(date&&!events.some(event=>event.type===type&&event.at===date.toISOString()))events.push({id:`known-${type}`,type,at:date.toISOString(),knownDate:true});}
 return events.sort((a,b)=>b.at.localeCompare(a.at));
}
