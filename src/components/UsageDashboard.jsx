import {useEffect,useRef,useState} from 'react';
import {usageRequest} from '../services/appUsage';
import './UsageDashboard.css';
export default function UsageDashboard(){
 const [data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const alive=useRef(false),locked=useRef(false);
 async function load(payload){
  if(locked.current)return;locked.current=true;setBusy(true);setError('');
  try{if(payload)await usageRequest(payload);const result=await usageRequest();if(!result.summary||!Array.isArray(result.accounts))throw Error('Réponse indisponible.');if(alive.current)setData(result);}
  catch(e){if(alive.current)setError(e.name==='AbortError'?'Le chargement prend trop de temps. Réessaie.':e.message);}
  finally{locked.current=false;if(alive.current)setBusy(false);}
 }
 useEffect(()=>{alive.current=true;load();return()=>{alive.current=false;};},[]);
 const summary=data?.summary;
 return <section className="usage-dashboard" aria-label="Statistiques d’utilisation" aria-busy={busy}>
  <header><div><h2>Utilisation de Checkpoint</h2><p>Des comptes distincts, même sur plusieurs appareils.</p></div><button type="button" className="option-pill" disabled={busy} onClick={()=>load()}>{busy?'Chargement…':'Actualiser'}</button></header>
  {error&&<p role="alert">{error}</p>}
  {summary&&<><dl className="usage-metrics">{[['total','Comptes connus'],['active1','Actifs · 24 h'],['active7','Actifs · 7 jours'],['active30','Actifs · 30 jours'],['new7','Premières visites · 7 jours']].map(([key,label])=><div key={key}><dt>{label}</dt><dd>{summary[key].toLocaleString('fr-FR')}</dd></div>)}</dl>
   <p>Ton compte et les comptes de test exclus ne sont pas comptés. « Actif » signifie avoir ouvert ou utilisé l’application pendant la période, avec l’onglet visible.</p>
   <p>Les comptes connus sont ceux présents dans les données de Checkpoint ou ayant ouvert l’application depuis ce suivi. Ce compteur n’est pas la liste complète des inscriptions Firebase. Les premières visites ne sont pas des nouvelles inscriptions.</p>
   <p>{summary.since?`Première activité mesurée le ${new Date(summary.since).toLocaleDateString('fr-FR')}.`:'Aucune activité mesurée pour les comptes inclus.'} Les visites antérieures ne peuvent pas être reconstituées. Aucune adresse e-mail ni adresse IP n’est enregistrée pour ces statistiques.</p>
   <details><summary>Exclure les comptes de test</summary><p>Les 100 comptes les plus récemment actifs sont proposés ici, avec les comptes exclus en premier.</p><ul className="usage-accounts">{data.accounts.map(account=><li key={account.uid}><span><code>{account.uid}</code><small>{account.lastSeen?`Dernière activité : ${new Date(account.lastSeen).toLocaleString('fr-FR')}`:'Activité pas encore mesurée'}</small></span><button type="button" className="option-pill" disabled={busy} aria-label={`${account.excluded?'Inclure':'Exclure'} le compte ${account.uid}`} onClick={()=>load({action:'exclude',uid:account.uid,excluded:!account.excluded})}>{account.excluded?'Réinclure':'Exclure'}</button></li>)}</ul></details>
   <small>Actualisé le {new Date(data.updatedAt).toLocaleString('fr-FR')} · activité actualisée au maximum toutes les 5 minutes.</small>
  </>}
 </section>;
}
