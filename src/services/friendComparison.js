const nameKey=g=>String(g.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function sameSocialGame(a,b){
 const aIgdb=a.sourceIds?.igdb||a.igdbId, bIgdb=b.sourceIds?.igdb||b.igdbId;
 if(aIgdb&&bIgdb)return String(aIgdb)===String(bIgdb);
 if(!nameKey(a)||nameKey(a)!==nameKey(b))return false;
 const year=g=>String(g.released||g.releaseDate||'').slice(0,4);
 return !year(a)||!year(b)||year(a)===year(b);
}
export function compareFriendGames(ownGames,profile){
 if(profile.visibility&&profile.visibility!=='public')return {common:[],discover:[]};
 const sections=profile.publicSections||{};
 const visible=[
   ...(sections.identityGames!==false?profile.identityGames||[]:[]),
   ...(sections.essential!==false?[
     ...(profile.favoriteGames||[]).map(g=>({...g,favorite:true})),...(profile.sanctuaryGames||[]),
     ...(profile.showcase?.topScores||[]).filter(s=>s.key==='rating').map(s=>({...s.game,rating:s.game?.rating??s.game?.score})),
     ...(profile.essentialTops||[]).filter(s=>s.key==='rating').map(s=>({...s.game,rating:s.game?.rating??s.game?.score})),
   ]:[]),
 ].filter(g=>g?.name);
 const games=[];
 for(const game of visible){
   const existing=games.find(other=>sameSocialGame(game,other));
   if(!existing){games.push({...game});continue;}
   if(game.favorite)existing.favorite=true;
   if(!Number(existing.rating)&&Number(game.rating))existing.rating=game.rating;
 }
 const common=[],discover=[];
 for(const game of games){
   const own=ownGames.find(g=>sameSocialGame(g,game));
   if(own){
     const ownRating=Number(own.rating)||0,friendRating=Number(game.rating)||0;
     common.push({game,ownRating,friendRating,agreement:ownRating>0&&friendRating>0&&Math.abs(ownRating-friendRating)<=1});
   }else if(game.favorite||Number(game.rating)>=8)discover.push(game);
 }
 return {common,discover:discover.sort((a,b)=>(Number(b.rating)||0)-(Number(a.rating)||0)).slice(0,3)};
}
