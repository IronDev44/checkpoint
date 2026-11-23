import { useLanguage, getIntlLocale } from "../i18n/language";import { LocalizedMessage, LocalizedValue } from "../i18n/Localized";import React, { useState } from 'react';
import { gameHistory, HISTORY_LABELS } from '../services/gameHistory';
import './CollectionTools.css';
export default function GameHistory({ game }) {useLanguage();
  const [limit, setLimit] = useState(8),events = gameHistory(game);
  return <details className="game-play-history"><summary><LocalizedMessage source={"Historique de ta partie"} values={[]} /></summary><p><LocalizedMessage source={"Ton historique reste privé. Les anciens changements sans date connue ne sont pas reconstitués."} values={[]} /></p>{!events.length ? <p><LocalizedMessage source={"Aucune date connue pour le moment. Les prochains changements apparaîtront ici."} values={[]} /></p> : <ol>{events.slice(0, limit).map((event) => <li key={event.id}><span><LocalizedValue value={HISTORY_LABELS[event.type]} /></span><time dateTime={event.at}><LocalizedValue value={new Date(event.at).toLocaleString(getIntlLocale(), { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} /></time></li>)}</ol>}{events.length > limit && <button type="button" className="option-pill" onClick={() => setLimit((value) => value + 20)}><LocalizedMessage source={"Voir les étapes précédentes"} values={[]} /></button>}</details>;
}
