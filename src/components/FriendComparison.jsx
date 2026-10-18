import {compareFriendGames} from '../services/friendComparison';
export default function FriendComparison({games,profile}){
 const {common,discover}=compareFriendGames(games,profile);
 return <section className="search-panel friend-comparison" aria-labelledby="friend-comparison-title">
  <h2 id="friend-comparison-title">Vos jeux se croisent</h2>
  <p>Comparaison avec les jeux visibles sur ce profil.</p>
  <h3>{common.length} jeu{common.length>1?'x':''} en commun</h3>
  {!common.length&&<p>Aucun jeu en commun parmi cette sélection publique.</p>}
  <div className="friend-comparison-games">{common.slice(0,8).map(({game,ownRating,friendRating,agreement})=><article key={game.name}><strong>{game.name}</strong><span>Toi : {ownRating?`${ownRating}/10`:'pas encore noté'} · {profile.displayName||'Ton ami'} : {friendRating?`${friendRating}/10`:'pas encore noté'}</span>{agreement&&<small>Vous avez le même ressenti</small>}</article>)}</div>
  {!!discover.length&&<><h3>Ses coups de cœur à découvrir</h3><div className="friend-comparison-games">{discover.map(game=><article key={game.name}><strong>{game.name}</strong><span>{game.rating?`${game.rating}/10`:'Un de ses favoris'}</span></article>)}</div></>}
 </section>;
}
