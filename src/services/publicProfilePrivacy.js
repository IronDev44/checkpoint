// Shared by the React preview and the account API (copied by prebuild).
export function publicProfileView(profile={},authority){
 const keys=['displayName','photoURL','handle','bio','platform','visibility','publicSections','featuredBadge','selectedBadges','level','totalGames','finishedGames','hardwareCount','averageRating','platformStrengths','setupPhotos','collectionPhotos','identityTitle','playerAnalysis','gamingTimeline','showcase','identityGames','essentialTops','favoriteGames','currentHardware','sanctuaryGames','sanctuaryHardware','recentActivity','updatedAt','ownerUid'];
 const result=Object.fromEntries(keys.filter(key=>Object.hasOwn(profile,key)).map(key=>[key,profile[key]]));
 const sections=Object.fromEntries(['photos','essential','identityGames','hardware','activity'].map(key=>[key,profile.publicSections?.[key]!==false&&authority?.publicSections?.[key]!==false]));
 result.publicSections=sections;
 if(!sections.photos){delete result.setupPhotos;delete result.collectionPhotos;}
 if(!sections.identityGames){delete result.identityGames;delete result.identityTitle;}
 if(!sections.essential){for(const key of ['showcase','essentialTops','favoriteGames','sanctuaryGames','sanctuaryHardware','platformStrengths','playerAnalysis'])delete result[key];}
 if(!sections.hardware){delete result.currentHardware;delete result.sanctuaryHardware;delete result.hardwareCount;if(result.showcase)result.showcase={...result.showcase,hardwareHighlights:[]};}
 if(!sections.essential||!sections.hardware||!sections.identityGames)delete result.playerAnalysis;
 if(!sections.activity){delete result.recentActivity;delete result.gamingTimeline;}
 else{
  if(!sections.hardware)result.recentActivity=(result.recentActivity||[]).filter(item=>item.source!=='hardware'&&!/mat[ée]riel|hardware/i.test(item.type||''));
  if(result.gamingTimeline)result.gamingTimeline=result.gamingTimeline.filter(event=>event.type==='checkpoint'||(event.type==='hardware'?sections.hardware:event.type==='identity'?sections.identityGames:['game','goty'].includes(event.type)?sections.essential:false));
 }
 return result;
}
