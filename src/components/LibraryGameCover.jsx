import ArenaGameCover from './ArenaGameCover';
import {resolveGameCover} from '../services/gameCovers';

// Limit catalogue requests while covers enter the viewport.
let active=0;
const waiting=[];
function resolveLibraryCover(game){
 return new Promise(resolve=>{
  const start=()=>{
   active++;
   Promise.resolve().then(()=>resolveGameCover(game)).catch(()=>'').then(resolve).finally(()=>{active--;waiting.shift()?.();});
  };
  if(active<3)start();else waiting.push(start);
 });
}
export default function LibraryGameCover({game,fallback='',className='',alt=game.name}){
 return <ArenaGameCover game={game} resolveCover={resolveLibraryCover} className={className} alt={alt} fallback={fallback?<img src={fallback} alt={alt} loading="lazy" decoding="async"/>:null}/>;
}
