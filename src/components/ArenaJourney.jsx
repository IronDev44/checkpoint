import {useState} from 'react';
import {duelGameJourney} from '../services/soloDuel';
export default function ArenaJourney({tournament,games}){
 const [selected,setSelected]=useState('');
 const id=games.some(g=>String(g.id)===selected)?selected:tournament.winner||String(games[0]?.id||'');
 const journey=duelGameJourney(tournament,id),name=key=>games.find(g=>String(g.id)===key)?.name||'Jeu indisponible';
 return <details className="arena-journey arena-rules"><summary>Parcours des jeux de ce tournoi</summary><label>Choisir un jeu<select value={id} onChange={e=>setSelected(e.target.value)}>{[...games].sort((a,b)=>a.name.localeCompare(b.name,'fr')).map(g=><option value={String(g.id)} key={g.id}>{g.name}</option>)}</select></label><p>{journey.status==='champion'?'Vainqueur du tournoi':journey.status==='eliminated'?'Éliminé':journey.status==='active'?'Encore en lice':'Éliminé avant l’enregistrement du parcours'}</p>{journey.partial&&<small>Parcours disponible depuis cette mise à jour. Les premiers adversaires ne sont pas connus.</small>}<ol>{journey.matches.map(m=><li key={m.choice}><small>Tour {m.round}</small><span>{m.winner===id?'Victoire contre ':'Éliminé par '}<strong>{name(m.winner===id?m.loser:m.winner)}</strong></span></li>)}</ol>{!journey.matches.length&&journey.status==='active'&&<p>Ce jeu n’a pas encore disputé de duel enregistré.</p>}</details>;
}
