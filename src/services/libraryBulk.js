export function buildBulkGamePatch(game,changes){
 const patch={};
 if(changes.status){
   if(!['wishlist','en cours','collection','completed'].includes(changes.status))throw new Error('Statut invalide.');
   const finished=changes.status==='completed'||(changes.status==='collection'&&(game.completed===true||game.progressStatus==='completed'));
   patch.status=changes.status==='completed'?'collection':changes.status;
   patch.completed=finished;
   patch.progressStatus=finished?'completed':changes.status==='en cours'?'in_progress':'not_started';
   patch.ratingExperience=finished?'completed':changes.status==='en cours'?'partial':game.ratingExperience||'';
 }
 if(changes.platform)patch.playedPlatforms=[changes.platform];
 if(changes.format){
   if(!['physical','digital'].includes(changes.format))throw new Error('Format invalide.');
   patch.physicalOwned=changes.format==='physical';
 }
 return patch;
}
