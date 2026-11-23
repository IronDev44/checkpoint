import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedValue } from "../i18n/Localized";import { useState } from 'react';
import { DISCOVERY_FEELINGS, getGameExperience } from '../services/gameExperience';

export default function GameExperiencePanel({ game, onChange }) {useLanguage();
  const [showAll, setShowAll] = useState(false);
  const experience = getGameExperience(game);
  const feelings = Array.isArray(game.discoveryFeelings) ? game.discoveryFeelings : [];
  const visibleFeelings = showAll ? DISCOVERY_FEELINGS : DISCOVERY_FEELINGS.filter((item, index) => index < 5 || feelings.includes(item.id));
  if (experience !== 'tried') return null;
  return (
    <section className="game-detail-section game-experience-panel">{
      experience === 'tried' &&
      <div className="game-discovery-feelings">
          <h3><LocalizedMessage source={"Ton ressenti après cette découverte ?"} values={[]} /></h3>
          <p><LocalizedMessage source={"Plusieurs choix possibles, ou aucun : c’est toi qui vois."} values={[]} /></p>
          <div className="choice-grid">{
          visibleFeelings.map((item) =>
          <button key={item.id} type="button" className={`choice-pill small ${feelings.includes(item.id) ? 'active' : ''}`} aria-pressed={feelings.includes(item.id)} onClick={() => onChange(game.id, { discoveryFeelings: feelings.includes(item.id) ? feelings.filter((id) => id !== item.id) : [...feelings, item.id] })}><LocalizedValue value={item.label} /></button>
          )}
        </div>
          <button className="profile-toggle-btn" type="button" aria-expanded={showAll} onClick={() => setShowAll(!showAll)}><LocalizedValue value={showAll ? 'Voir moins de ressentis' : 'Voir plus de ressentis'} /></button>
        </div>}

    </section>);

}
