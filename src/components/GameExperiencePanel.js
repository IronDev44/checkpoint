import { useState } from 'react';
import { DISCOVERY_FEELINGS, getGameExperience } from '../services/gameExperience';

export default function GameExperiencePanel({ game, onChange }) {
  const [showAll, setShowAll] = useState(false);
  const experience = getGameExperience(game);
  const feelings = Array.isArray(game.discoveryFeelings) ? game.discoveryFeelings : [];
  const visibleFeelings = showAll ? DISCOVERY_FEELINGS : DISCOVERY_FEELINGS.filter((item, index) => index < 5 || feelings.includes(item.id));
  if(experience!=='tried')return null;
  return (
    <section className="game-detail-section game-experience-panel">
      {experience === 'tried' && (
        <div className="game-discovery-feelings">
          <h3>Ton ressenti après cette découverte ?</h3>
          <p>Plusieurs choix possibles, ou aucun : c’est toi qui vois.</p>
          <div className="choice-grid">
            {visibleFeelings.map((item) => (
              <button key={item.id} type="button" className={`choice-pill small ${feelings.includes(item.id) ? 'active' : ''}`} aria-pressed={feelings.includes(item.id)} onClick={() => onChange(game.id, { discoveryFeelings: feelings.includes(item.id) ? feelings.filter((id) => id !== item.id) : [...feelings, item.id] })}>{item.label}</button>
            ))}
          </div>
          <button className="profile-toggle-btn" type="button" aria-expanded={showAll} onClick={() => setShowAll(!showAll)}>{showAll ? 'Voir moins de ressentis' : 'Voir plus de ressentis'}</button>
        </div>
      )}
    </section>
  );
}
