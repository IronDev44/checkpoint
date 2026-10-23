import {useEffect,useState} from 'react';
import CommunitySelections from './CommunitySelections';
import Expeditions from './Expeditions';
import PersonalMemories from './PersonalMemories';
import GamingPredictions from './GamingPredictions';
import './Rendezvous.css';
export default function RendezvousHub({games=[],value,onChange,onOpenGame,onChallenges,initialView='selections'}) {
 const [view,setView]=useState(initialView);
 const [now,setNow]=useState(new Date());useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),60000);return()=>clearInterval(timer);},[]);
 return <section className="rendezvous-hub"><header><span className="home-kicker">À retrouver dans Checkpoint</span><h2>Les rendez-vous</h2><p>Une sélection à départager, un événement à suivre ou un souvenir à retrouver.</p></header><nav className="rendezvous-tabs" aria-label="Choisir un rendez-vous">{[['selections','Sélections'],['predictions','Pronostics'],['expeditions','Expéditions'],['memories','Souvenirs']].map(([id,label])=><button type="button" key={id} aria-pressed={view===id} onClick={()=>setView(id)}>{label}</button>)}</nav>{view==='selections'&&<CommunitySelections/>}{view==='predictions'&&<GamingPredictions/>}{view==='expeditions'&&<Expeditions value={value} onChange={onChange} now={now}/>} {view==='memories'&&<PersonalMemories games={games} value={value} onChange={onChange} onOpenGame={onOpenGame} now={now}/>} {onChallenges&&<button className="rendezvous-text-button" type="button" onClick={onChallenges}>Proposer un choix caché à un ami →</button>}</section>;
}
