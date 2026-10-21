import {Fragment,useState} from 'react';
import {Crown,Swords,Trash2} from 'lucide-react';
import {duelChampions,duelHistoryForGroup} from '../services/soloDuel';
import ArenaGameCover from './ArenaGameCover';
const GROUPS=[{id:'collection',label:'Grand Tournoi',Icon:Crown,empty:'Le gagnant de ton Grand Tournoi apparaîtra ici.'},{id:'quick',label:'Duels rapides',Icon:Swords,empty:'Les gagnants de tes duels rapides apparaîtront ici.'}];
const resultName=kind=>kind==='ultimate'?'Le Trône Ultime':kind==='champions'?'La Couronne des Champions':kind==='collection'?'Grand Tournoi':'Duel rapide';
function PalmaresGroup({group,history,games,onRemove}){
 const [shown,setShown]=useState(12),[pending,setPending]=useState(null);
 const scoped=duelHistoryForGroup(history,group.id),champions=duelChampions(scoped,games),results=scoped.filter(entry=>!entry.revoked);
 const selected=champions.find(champion=>champion.id===pending);
 const confirmation=selected&&<div className="duel-restart arena-palmares-confirm" role="group" aria-label={`Retirer du palmarès ${group.label}`}><p>Retirer <strong>{selected.game?.name||selected.name}</strong> du palmarès « {group.label} » ?</p><p>{selected.wins} victoire{selected.wins>1?'s':''} et {selected.wins>1?'leurs entrées':'son entrée'} dans cet historique seront retirées. Le jeu reste dans ta bibliothèque et l’autre palmarès est conservé.</p><div><button type="button" className="option-pill" onClick={()=>{onRemove(selected.id,group.id,selected.game?.name||selected.name);setPending(null);}}>Confirmer le retrait</button><button type="button" className="option-pill" onClick={()=>setPending(null)}>Annuler</button></div></div>;
 return <section className="arena-palmares-group" aria-label={`Palmarès — ${group.label}`}><header className="arena-palmares-group-head"><group.Icon size={20} aria-hidden="true"/><h4>{group.label}</h4><span>{results.length} titre{results.length!==1?'s':''}</span></header>
 {!champions.length?<p className="arena-palmares-empty">{group.empty}</p>:<div className="duel-hall-grid">{champions.map(champion=>{const name=champion.game?.name||champion.name;return <Fragment key={champion.id}><article><ArenaGameCover game={champion.game||{name:champion.name,cover_image:champion.cover}} className="duel-hall-cover"/><div className="arena-champion-copy"><h4>{name}</h4><p>{champion.wins} victoire{champion.wins>1?'s':''}{champion.crowns>0?` · ${champion.crowns} couronne${champion.crowns>1?'s':''}`:''}{champion.ultimateTitles>0?` · ${champion.ultimateTitles} titre${champion.ultimateTitles>1?'s':''} ultime${champion.ultimateTitles>1?'s':''}`:''}</p>{!champion.game&&<small>Hors collection · souvenir conservé</small>}</div><button type="button" className="arena-palmares-remove" aria-label={`Retirer ${name} du palmarès ${group.label}`} onClick={()=>setPending(champion.id)}><Trash2 size={16} aria-hidden="true"/><span>Retirer</span></button></article>{selected?.id===champion.id&&confirmation}</Fragment>;})}</div>}

 {results.length>0&&<details className="duel-history arena-palmares-history"><summary>Historique — {group.label}</summary><ol>{results.slice(0,shown).map(result=><li key={result.id}><strong>{result.name}</strong><small>{resultName(result.kind)} · {result.participants} participants · {result.date?new Date(result.date).toLocaleDateString('fr-FR'):'Ancien duel'}</small></li>)}</ol>{results.length>shown&&<button type="button" className="option-pill" onClick={()=>setShown(current=>current+12)}>Voir les tournois précédents</button>}</details>}
 </section>;
}
export default function ArenaPalmares({history,games,onRemove}){
 return <section className="duel-hall"><h3>Tes champions</h3><div className="arena-palmares-groups">{GROUPS.map(group=><PalmaresGroup key={group.id} group={group} history={history} games={games} onRemove={onRemove}/>)}</div></section>;
}
