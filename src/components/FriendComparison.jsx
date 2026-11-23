import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedValue, LocalizedElement } from "../i18n/Localized";import React, { useState } from 'react';
import { compareFriendGames, socialCompletion } from '../services/friendComparison';
import { multiplayerInfo } from '../services/playTogether';
import FriendTogether from './FriendTogether';
import './DailyTools.css';
const oneFinished = (row) => socialCompletion(row.ownGame) !== null && socialCompletion(row.game) !== null && socialCompletion(row.ownGame) !== socialCompletion(row.game);
const coop = (row) => multiplayerInfo(row.ownGame).kind === 'coop' || multiplayerInfo(row.game).kind === 'coop';
const completion = (game, own) => socialCompletion(game) === null ? own ? 'statut non renseigné' : 'statut non partagé' : socialCompletion(game) ? 'terminé' : 'non terminé';
export default function FriendComparison({ games, profile, onOpenGame, onDiscover, ratingGetter, embedded = false }) {useLanguage();
  const { common, discover, visibleCount } = compareFriendGames(games, profile, ratingGetter);
  const [filter, setFilter] = useState('all'),[limit, setLimit] = useState(8);
  const shared = profile.sharedLibrary === true;
  const filters = shared ? [['all', 'Tous les jeux'], ['one-finished', 'Terminé par un seul'], ['coop', 'Coop']] : [['all', 'Tous les jeux'], ['close', 'Même ressenti'], ['different', 'Avis différents'], ['one-finished', 'Terminé par un seul'], ['coop', 'Coop']];
  const shown = common.filter((row) => filter === 'all' || (filter === 'close' ? row.agreement : filter === 'one-finished' ? oneFinished(row) : filter === 'coop' ? coop(row) : row.gap !== null && row.gap > 1)).sort((a, b) => filter === 'different' ? (b.gap || 0) - (a.gap || 0) : a.game.name.localeCompare(b.game.name, 'fr'));
  return <LocalizedElement __as={"section"} className={`search-panel friend-comparison ${embedded ? 'friend-comparison-embedded' : ''}`} aria-label="Vos jeux en commun">{
    !embedded && <h2><LocalizedMessage source={"Vos jeux en commun"} values={[]} /></h2>}
    <p><LocalizedValue value={shared ? `Comparaison avec les ${visibleCount} jeux de sa collection partagée. Les notes et avis privés restent masqués.` : `Comparaison de ${visibleCount} jeux visibles sur ce profil. Seule la sélection publique est comparée, pas sa bibliothèque entière.`} /></p>
  <div className="comparison-summary">
   <span><strong><LocalizedValue value={common.length} /></strong><LocalizedMessage source={"en commun"} values={[]} /></span>
   <span><strong><LocalizedValue value={shared ? common.filter(oneFinished).length : common.filter((row) => row.agreement).length} /></strong><LocalizedValue value={shared ? 'terminés par un seul' : 'notes proches'} /></span>
   <span><strong><LocalizedValue value={shared ? common.filter(coop).length : common.filter((row) => row.gap !== null && row.gap > 1).length} /></strong><LocalizedValue value={shared ? 'avec de la coop renseignée' : 'avis différents'} /></span>
  </div>
  <LocalizedElement __as={"div"} className="tool-filter-buttons" role="group" aria-label="Comparer vos jeux">{filters.map(([key, label]) => <button type="button" key={key} aria-pressed={filter === key} onClick={() => {setFilter(key);setLimit(8);}}><LocalizedValue value={label} /></button>)}</LocalizedElement>{
    !shown.length && <p><LocalizedValue value={!visibleCount ? 'Aucun jeu partagé à comparer.' : !common.length ? 'Aucun jeu en commun parmi les titres partagés.' : 'Aucun jeu dans cette catégorie.'} /></p>}
    <div className="friend-comparison-games">{shown.slice(0, limit).map(({ game, ownGame, ownRating, friendRating, gap, agreement }) => <article key={`${game.name}:${game.released || ''}`}>
   <strong>{game.name}</strong>
   <p><LocalizedMessage source={"Toi : "} values={[]} /><LocalizedValue value={completion(ownGame, true)} /> · {profile.displayName || 'Ton ami'} : <LocalizedValue value={completion(game, false)} /></p>
   {!shared && <><div className="comparison-ratings"><span><LocalizedMessage source={"Toi"} values={[]} /><strong><LocalizedValue value={ownRating ? `${ownRating}/10` : 'Non noté'} /></strong></span><span>{profile.displayName || 'Ton ami'}<strong><LocalizedValue value={friendRating ? `${friendRating}/10` : 'Non noté'} /></strong></span></div>{gap !== null && <small><LocalizedValue value={agreement ? 'Vous avez un ressenti proche' : `${gap.toFixed(1).replace('.0', '')} point(s) d’écart`} /></small>}</>}
   {onOpenGame && <button type="button" className="option-pill" onClick={() => onOpenGame(ownGame)}><LocalizedMessage source={"Voir ma fiche"} values={[]} /></button>}
  </article>)}</div>
  {shown.length > limit && <button type="button" className="option-pill" onClick={() => setLimit((n) => n + 12)}><LocalizedMessage source={"Voir les autres jeux en commun"} values={[]} /></button>}
  {!!discover.length && <><h3><LocalizedMessage source={"Ses coups de cœur à découvrir"} values={[]} /></h3><div className="friend-comparison-games">{discover.map((game) => <article key={`${game.name}:${game.released || ''}`}><strong>{game.name}</strong><span><LocalizedMessage source={"{{0}}" + (game.inWishlist ? ' · déjà dans ta wishlist' : '')} values={[game.rating ? `${game.rating}/10` : 'Un de ses favoris']} /></span>{onDiscover && <button type="button" className="option-pill" onClick={() => onDiscover(game)}><LocalizedMessage source={"Rechercher ce jeu"} values={[]} /></button>}</article>)}</div></>}
  <FriendTogether common={common} onOpenGame={onOpenGame} profileKey={profile.handle || profile.displayName} />
 </LocalizedElement>;
}
