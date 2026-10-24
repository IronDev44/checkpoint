import {useEffect,useRef,useState} from 'react';
import {socialReportRequest} from '../services/friendships';
import {REPORT_REASONS} from './SocialReportDialog';
import './TesterFeedback.css';
const statuses={new:'Nouveau',progress:'En cours',resolved:'Traité',dismissed:'Classé sans suite'};
export default function SocialReportsInbox(){
 const [items,setItems]=useState([]),[cursor,setCursor]=useState(null),[filter,setFilter]=useState('new'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[loaded,setLoaded]=useState(false);
 const active=useRef(false),lock=useRef(false);
 const load=async more=>{
  if(lock.current)return;lock.current=true;setBusy(true);setError('');
  try{const data=await socialReportRequest('list',more?{cursor}:{});if(!Array.isArray(data.items))throw Error('Réponse indisponible.');if(active.current){setItems(old=>more?[...old,...data.items]:data.items);setCursor(data.cursor);setLoaded(true);}}
  catch(e){if(active.current)setError(e.message);}finally{if(active.current){lock.current=false;setBusy(false);}}
 };
 useEffect(()=>{active.current=true;load(false);return()=>{active.current=false;};},[]);
 const update=async(item,status)=>{
  if(lock.current)return;lock.current=true;setBusy(true);setError('');
  try{await socialReportRequest('status',{id:item.id,status});if(active.current)setItems(old=>old.map(row=>row.id===item.id?{...row,status}:row));}
  catch(e){if(active.current)setError(e.message);}finally{if(active.current){lock.current=false;setBusy(false);}}
 };
 const shown=items.filter(item=>filter==='all'||item.status===filter);
 return <section className="tester-feedback"><h2>Signalements sociaux</h2><p>Examine les profils et publications signalés. Changer le suivi ne supprime pas le contenu du joueur.</p>
  <div className="feedback-inbox-tools"><select aria-label="Filtrer les signalements" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Tous</option>{Object.entries(statuses).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><button type="button" disabled={busy} onClick={()=>load(false)}>Actualiser</button></div>
  {error&&<p role="alert">{error}</p>}{loaded&&!shown.length&&<p>Aucun signalement avec ce statut dans les pages chargées.</p>}
  {shown.map(item=><article className="feedback-inbox-card" key={item.id}><strong>{item.target.type==='activity'?'Publication':'Profil'} · @{item.target.handle}</strong><small>{new Date(item.createdAt).toLocaleString('fr-FR')} · {REPORT_REASONS[item.reason]}</small><p>{item.target.title}</p><p>{item.target.snapshot}</p>{item.details&&<p><strong>Précisions : </strong>{item.details}</p>}<small>Signalé par {item.reporter.displayName}{item.reporter.handle?` · @${item.reporter.handle}`:''}</small><label>Suivi du signalement<select disabled={busy} value={item.status} onChange={e=>update(item,e.target.value)}>{Object.entries(statuses).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></article>)}
  {cursor&&<button type="button" className="option-pill" disabled={busy} onClick={()=>load(true)}>Charger les signalements suivants</button>}
 </section>;
}
