import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedValue, LocalizedElement } from "../i18n/Localized";import { useEffect, useState } from 'react';
import CommunitySelections from './CommunitySelections';
import Expeditions from './Expeditions';
import PersonalMemories from './PersonalMemories';
import GamingPredictions from './GamingPredictions';
import './Rendezvous.css';
export default function RendezvousHub({ games = [], value, onChange, onOpenGame, onChallenges, initialView = 'selections' }) {useLanguage();
  const [view, setView] = useState(initialView);
  const [now, setNow] = useState(new Date());useEffect(() => {const timer = setInterval(() => setNow(new Date()), 60000);return () => clearInterval(timer);}, []);
  return <section className="rendezvous-hub"><header><span className="home-kicker"><LocalizedMessage source={"À retrouver dans Checkpoint"} values={[]} /></span><h2><LocalizedMessage source={"Les rendez-vous"} values={[]} /></h2><p><LocalizedMessage source={"Une sélection à départager, un événement à suivre ou un souvenir à retrouver."} values={[]} /></p></header><LocalizedElement __as={"nav"} className="rendezvous-tabs" aria-label="Choisir un rendez-vous">{[['selections', 'Sélections'], ['predictions', 'Pronostics'], ['expeditions', 'Expéditions'], ['memories', 'Souvenirs']].map(([id, label]) => <button type="button" key={id} aria-pressed={view === id} onClick={() => setView(id)}><LocalizedValue value={label} /></button>)}</LocalizedElement>{view === 'selections' && <CommunitySelections />}{view === 'predictions' && <GamingPredictions />}{view === 'expeditions' && <Expeditions value={value} onChange={onChange} now={now} />} {view === 'memories' && <PersonalMemories games={games} value={value} onChange={onChange} onOpenGame={onOpenGame} now={now} />} {onChallenges && <button className="rendezvous-text-button" type="button" onClick={onChallenges}><LocalizedMessage source={"Proposer un choix caché à un ami →"} values={[]} /></button>}</section>;
}
