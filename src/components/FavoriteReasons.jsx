import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedValue } from "../i18n/Localized";import CatalogImage from './CatalogImage';
import { useEffect, useState } from 'react';
import { favoriteReason, FAVORITE_REASON_MAX } from '../services/rediscovery';
import SpoilerText from './SpoilerText';
import './Rediscovery.css';
export function FavoriteReasonEditor({ game, onSave }) {useLanguage();
  const [text, setText] = useState(game.favoriteReason || ''),[shared, setShared] = useState(game.favoriteReasonShared === true),[busy, setBusy] = useState(false),[notice, setNotice] = useState('');
  useEffect(() => {setText(game.favoriteReason || '');setShared(game.favoriteReasonShared === true);setNotice('');}, [game.id]);
  const save = async () => {setBusy(true);setNotice('');try {const saved = await onSave(game.id, { favoriteReason: favoriteReason(text), favoriteReasonShared: shared });if (saved === false) {setNotice('La phrase n’a pas pu être enregistrée. Tu peux réessayer.');return;}setNotice(saved?.queued ? 'Phrase conservée sur cet appareil, synchronisation en attente.' : 'Phrase enregistrée.');} catch {setNotice('La phrase n’a pas pu être enregistrée. Tu peux réessayer.');} finally {setBusy(false);}};
  return <div className="favorite-reason-editor"><h3><LocalizedMessage source={"Pourquoi ce coup de cœur ?"} values={[]} /></h3><label><LocalizedMessage source={"Ta phrase pour {{0}}"} values={[game.name]} /><textarea maxLength={FAVORITE_REASON_MAX} value={text} disabled={busy} onChange={(e) => {setText(e.target.value);setNotice('');}} placeholder="Pour son ambiance, celui qui m’a remis au jeu…" /></label><small><LocalizedMessage source={"{{0}}/{{1}} caractères"} values={[text.length, FAVORITE_REASON_MAX]} /></small><label className="rediscovery-check"><input type="checkbox" checked={shared} disabled={busy} onChange={(e) => setShared(e.target.checked)} /><LocalizedMessage source={"Afficher cette phrase dans ma vitrine"} values={[]} /></label><p><LocalizedMessage source={"Elle accompagne ce jeu dans tes coups de cœur si ton profil et la rubrique Vitrine sont publics. Tu peux la garder privée ou l’effacer. La vitrine met en avant jusqu’à trois phrases publiques, les plus récentes d’abord."} values={[]} /></p>{text.trim() && <blockquote><SpoilerText text={text} /></blockquote>}<button type="button" className="option-pill" disabled={busy || !onSave} onClick={save}><LocalizedValue value={busy ? 'Enregistrement…' : 'Enregistrer ma phrase'} /></button>{notice && <p role="status"><LocalizedValue value={notice} /></p>}</div>;
}
export function FavoriteReasons({ games = [] }) {useLanguage();
  const chosen = games.filter((g) => favoriteReason(g.favoriteReason)).slice(0, 3);
  if (!chosen.length) return null;
  return <section className="favorite-reasons-public"><h3><LocalizedMessage source={"Ses coups de cœur, avec ses mots"} values={[]} /></h3>{chosen.map((game) => <article key={game.id || game.name}>{game.image && <CatalogImage src={game.image} alt="" loading="lazy" />}<div><strong>{game.name}</strong><blockquote><SpoilerText text={favoriteReason(game.favoriteReason)} /></blockquote></div></article>)}</section>;
}

export function FavoriteReasonPicker({ games = [], onSave }) {useLanguage();
  const favorites = games.filter((g) => g.favorite && g.name && g.status !== 'wishlist').sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  const [selected, setSelected] = useState('');const game = favorites.find((g) => String(g.id) === selected) || favorites[0];
  return <section className="favorite-reasons-editor-list"><h2 className="panel-title"><LocalizedMessage source={"Tes coups de cœur, avec tes mots"} values={[]} /></h2><p><LocalizedMessage source={"Une phrase personnelle suffit pour expliquer ce qui te plaît dans un jeu."} values={[]} /></p>{game ? <><label><LocalizedMessage source={"Choisir un coup de cœur"} values={[]} /><select value={String(game.id)} onChange={(e) => setSelected(e.target.value)}>{favorites.map((g) => <option key={g.id} value={String(g.id)}><LocalizedValue value={g.name} /></option>)}</select></label><FavoriteReasonEditor key={game.id} game={game} onSave={onSave} /></> : <p><LocalizedMessage source={"Ajoute un jeu à tes coups de cœur avec le bouton cœur de sa fiche pour écrire ta première phrase."} values={[]} /></p>}</section>;
}
