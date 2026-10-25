export function matchesLibraryShortcut(game,key,ratingGetter,now=Date.now()){
 if(key==='unrated')return !(Number(ratingGetter(game))>0);
 if(key==='paused')return game.progressStatus==='paused';
 if(key==='recent'){
  const at=libraryAddedTime(game);
  return Number.isFinite(at)&&at<=now&&at>=now-30*86400000;
 }
 return true;
}
import {libraryAddedTime} from './libraryOrder';
