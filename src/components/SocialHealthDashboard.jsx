import {useEffect,useRef,useState} from 'react';
import {friendshipRequest} from '../services/friendships';
import './UsageDashboard.css';
const request=(action='list')=>friendshipRequest(action,{},'socialDiagnostics');
const labels={search:'Recherche',friendships:'Invitations',socialControls:'Confidentialité',socialReactions:'Réactions',sharedGames:'Jeux en commun',socialReports:'Signalements',friendPolls:'Sondages',friendChallenges:'Défis',gameRecommendations:'Recommandations',profile:'Profil'};
const statusLabel=status=>({0:'Erreur réseau',408:'Délai dépassé',409:'Modification simultanée',429:'Limite de requêtes atteinte'}[status]||'Erreur du service');
export default function SocialHealthDashboard(){
 const [data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[progress,setProgress]=useState('');
 const alive=useRef(false),lock=useRef(false);
 async function load(prepare=false){
  if(lock.current)return;lock.current=true;setBusy(true);setError('');setProgress('');
  try{
   if(prepare){let more=true;for(let step=0;step<20&&more&&alive.current;step++){const result=await request('index');more=result.pending>0;if(alive.current)setProgress(result.pending?`${result.pending} profil${result.pending>1?'s':''} à préparer.`:'La recherche est prête.');}}
   const result=await request();if(!Array.isArray(result.issues))throw Error('Le suivi est indisponible.');if(alive.current)setData(result);
  }catch(e){if(alive.current)setError(e.message);}
  finally{lock.current=false;if(alive.current)setBusy(false);}
 }
 useEffect(()=>{alive.current=true;load();return()=>{alive.current=false;};},[]);
 return <section className="usage-dashboard" aria-label="Fiabilité du social" aria-busy={busy}>
  <header><div><h2>Fiabilité du social</h2><p>Les incidents techniques des 30 derniers jours, regroupés par fonction.</p></div><button type="button" className="option-pill" disabled={busy} onClick={()=>load()}>Actualiser</button></header>
  <p>Des compteurs techniques, sans identité ni contenu privé. Les nombres correspondent à des incidents, pas à des personnes.</p>
  <details><summary>Quelles données sont enregistrées ?</summary><p>Uniquement la fonction concernée, le type d’erreur, le nombre d’incidents et leur date. Aucun pseudo, message, contenu de publication, adresse e-mail ou adresse IP. Les erreurs réseau ne sont remontées que si la connexion le permet.</p></details>
  {error&&<p role="alert">{error}</p>}{progress&&<p role="status">{progress}</p>}
  {data&&<>
   <h3>Recherche de profils</h3><p>{data.directory.indexed} profils indexés · {data.directory.pending} mises à jour en attente. Les recherches actualisent l’index automatiquement.</p>
   {data.directory.pending>0&&<button type="button" className="option-pill" disabled={busy} onClick={()=>load(true)}>Préparer l’index de recherche</button>}
   <h3>Incidents observés</h3>{!data.issues.length?<p>Aucun incident enregistré sur la période.</p>:<ul className="usage-accounts">{data.issues.map((issue,index)=><li key={`${issue.operation}-${issue.status}-${issue.lastSeen}-${index}`}><span><strong>{labels[issue.operation]||'Social'} · {statusLabel(issue.status)}</strong><small>{issue.source==='client'?'Depuis l’appareil':'Depuis le serveur'} · Dernier incident : {new Date(issue.lastSeen).toLocaleString('fr-FR')}</small></span><strong>{issue.count}</strong></li>)}</ul>}
  </>}
 </section>;
}
