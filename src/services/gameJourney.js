export const JOURNEY_STATES={not_started:'Non commencé',in_progress:'En cours',paused:'En pause',abandoned:'Abandonné',completed:'Terminé'};
export const isStoppedGame=game=>['paused','abandoned'].includes(game?.progressStatus);
export function journeyPatch(game,progressStatus,note){
 if(!Object.hasOwn(JOURNEY_STATES,progressStatus)&&!['playing','deep_play','tried'].includes(progressStatus))return null;
 const completed=progressStatus==='completed';
 const playing=['in_progress','playing','deep_play'].includes(progressStatus);
 return {progressStatus,completed,status:completed||isStoppedGame({progressStatus})?'collection':playing?'en cours':game?.status==='wishlist'?'wishlist':'collection',ratingExperience:completed?'completed':progressStatus==='tried'?'tried':progressStatus==='not_started'?'':'partial',...(note===undefined?{}:{progressNote:String(note).trim().slice(0,500)})};
}
