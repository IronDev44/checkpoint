import React,{useState} from 'react';
import {gameHistory,HISTORY_LABELS} from '../services/gameHistory';
import './CollectionTools.css';
export default function GameHistory({game}){
 const [limit,setLimit]=useState(8),events=gameHistory(game);
 return <details className="game-play-history"><summary>Historique de ta partie</summary><p>Ton historique reste privé. Les anciens changements sans date connue ne sont pas reconstitués.</p>{!events.length?<p>Aucune date connue pour le moment. Les prochains changements apparaîtront ici.</p>:<ol>{events.slice(0,limit).map(event=><li key={event.id}><span>{HISTORY_LABELS[event.type]}</span><time dateTime={event.at}>{new Date(event.at).toLocaleString('fr-FR',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}</time></li>)}</ol>}{events.length>limit&&<button type="button" className="option-pill" onClick={()=>setLimit(value=>value+20)}>Voir les étapes précédentes</button>}</details>;
}
