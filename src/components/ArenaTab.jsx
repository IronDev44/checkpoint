import {ArrowRight} from 'lucide-react';
import SoloDuel from './SoloDuel';
import {accountStorage} from '../services/accountData';
import {DUEL_STORAGE_KEY,validDuel} from '../services/soloDuel';
import './ArenaTab.css';
import {ArenaCrest} from './ArenaPresentation';

export default function ArenaTab(props){
 return <div className="arena-page"><SoloDuel {...props} embedded/></div>;
}
export function ArenaShortcut({onOpen,storage=accountStorage}){
 let tournament=null;
 try{const saved=JSON.parse(storage.getItem(DUEL_STORAGE_KEY)||'null');tournament=validDuel(saved?.tournament,saved?.tournament?.roster||[]);}catch{/* The arena remains accessible if the local save cannot be read. */}
 const ongoing=tournament&&!tournament.winner;
 return <section className="arena-shortcut home-library-card"><div className="arena-shortcut-heading"><ArenaCrest small/><div><span className="arena-eyebrow">TES JEUX. TES CHAMPIONS.</span><h3>L’Arène</h3></div></div><p>{ongoing?`${tournament.choices} choix sur ${tournament.roster.length-1} · ${tournament.roster.length-tournament.choices} jeux encore en lice.`:'Toute ta collection entre en lice. Un seul jeu au sommet.'}</p><button type="button" className="option-pill checkpoint-primary-action" onClick={onOpen}>{ongoing?'Reprendre mon tournoi':'Entrer dans L’Arène'}<ArrowRight size={17} aria-hidden="true"/></button></section>;
}
