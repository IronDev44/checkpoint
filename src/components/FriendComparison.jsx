import React,{useState} from 'react';
import {compareFriendGames,socialCompletion} from '../services/friendComparison';
import {multiplayerInfo} from '../services/playTogether';
import FriendTogether from './FriendTogether';
import './DailyTools.css';
const oneFinished=row=>socialCompletion(row.ownGame)!==null&&socialCompletion(row.game)!==null&&socialCompletion(row.ownGame)!==socialCompletion(row.game);
const coop=row=>multiplayerInfo(row.ownGame).kind==='coop'||multiplayerInfo(row.game).kind==='coop';
const completion=(game,own)=>socialCompletion(game)===null?(own?'statut non renseigné':'statut non partagé'):socialCompletion(game)?'terminé':'non terminé';
export default function FriendComparison({games,profile,onOpenGame,onDiscover,ratingGetter,embedded=false}){
 const {common,discover,visibleCount}=compareFriendGames(games,profile,ratingGetter);
 const [filter,setFilter]=useState('all'),[limit,setLimit]=useState(8);
 const shared=profile.sharedLibrary===true;
 const filters=shared?[['all','Tous les jeux'],['one-finished','Terminé par un seul'],['coop','Coop']]:[['all','Tous les jeux'],['close','Même ressenti'],['different','Avis différents'],['one-finished','Terminé par un seul'],['coop','Coop']];
 const shown=common.filter(row=>filter==='all'||(filter==='close'?row.agreement:filter==='one-finished'?oneFinished(row):filter==='coop'?coop(row):row.gap!==null&&row.gap>1)).sort((a,b)=>filter==='different'?(b.gap||0)-(a.gap||0):a.game.name.localeCompare(b.game.name,'fr'));
 return <section className={`search-panel friend-comparison ${embedded?'friend-comparison-embedded':''}`} aria-label="Vos jeux en commun">
  {!embedded&&<h2>Vos jeux en commun</h2>}
  <p>{shared?`Comparaison avec les ${visibleCount} jeux de sa collection partagée. Les notes et avis privés restent masqués.`:`Comparaison de ${visibleCount} jeux visibles sur ce profil. Seule la sélection publique est comparée, pas sa bibliothèque entière.`}</p>
  <div className="comparison-summary">
   <span><strong>{common.length}</strong>en commun</span>
   <span><strong>{shared?common.filter(oneFinished).length:common.filter(row=>row.agreement).length}</strong>{shared?'terminés par un seul':'notes proches'}</span>
   <span><strong>{shared?common.filter(coop).length:common.filter(row=>row.gap!==null&&row.gap>1).length}</strong>{shared?'avec de la coop renseignée':'avis différents'}</span>
  </div>
  <div className="tool-filter-buttons" role="group" aria-label="Comparer vos jeux">{filters.map(([key,label])=><button type="button" key={key} aria-pressed={filter===key} onClick={()=>{setFilter(key);setLimit(8);}}>{label}</button>)}</div>
  {!shown.length&&<p>{!visibleCount?'Aucun jeu partagé à comparer.':!common.length?'Aucun jeu en commun parmi les titres partagés.':'Aucun jeu dans cette catégorie.'}</p>}
  <div className="friend-comparison-games">{shown.slice(0,limit).map(({game,ownGame,ownRating,friendRating,gap,agreement})=><article key={`${game.name}:${game.released||''}`}>
   <strong>{game.name}</strong>
   <p>Toi : {completion(ownGame,true)} · {profile.displayName||'Ton ami'} : {completion(game,false)}</p>
   {!shared&&<><div className="comparison-ratings"><span>Toi<strong>{ownRating?`${ownRating}/10`:'Non noté'}</strong></span><span>{profile.displayName||'Ton ami'}<strong>{friendRating?`${friendRating}/10`:'Non noté'}</strong></span></div>{gap!==null&&<small>{agreement?'Vous avez un ressenti proche':`${gap.toFixed(1).replace('.0','')} point(s) d’écart`}</small>}</>}
   {onOpenGame&&<button type="button" className="option-pill" onClick={()=>onOpenGame(ownGame)}>Voir ma fiche</button>}
  </article>)}</div>
  {shown.length>limit&&<button type="button" className="option-pill" onClick={()=>setLimit(n=>n+12)}>Voir les autres jeux en commun</button>}
  {!!discover.length&&<><h3>Ses coups de cœur à découvrir</h3><div className="friend-comparison-games">{discover.map(game=><article key={`${game.name}:${game.released||''}`}><strong>{game.name}</strong><span>{game.rating?`${game.rating}/10`:'Un de ses favoris'}{game.inWishlist?' · déjà dans ta wishlist':''}</span>{onDiscover&&<button type="button" className="option-pill" onClick={()=>onDiscover(game)}>Rechercher ce jeu</button>}</article>)}</div></>}
  <FriendTogether common={common} onOpenGame={onOpenGame} profileKey={profile.handle||profile.displayName}/>
 </section>;
}
