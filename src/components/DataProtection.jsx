import React,{useEffect,useState,useRef} from 'react';
import {createPortal} from 'react-dom';
import {auth} from '../firebase';
import {captureBackup,deviceRead} from '../services/deviceStore';
import {d1Enabled,offlineState,setOfflineEnabled,syncOffline,discardConflict,keepLocalConflict,listTrash,restoreTrash} from '../services/d1Data';
import './DataProtection.css';
const owner=()=>auth.currentUser?.uid;
export function AutomaticBackup({ready,payload}){
  const [error,setError]=useState(false);
  useEffect(()=>{if(!ready||!owner())return;const timer=setTimeout(()=>captureBackup(owner(),payload).then(()=>setError(false)).catch(()=>setError(true)),1500);return()=>clearTimeout(timer);},[ready,payload]);
  return error?<p className="device-storage-warning" role="status">La sauvegarde automatique sur cet appareil est indisponible. Tu peux exporter un fichier dans Options → Données et sauvegardes.</p>:null;
}
function useDeviceStatus(){
  const [status,setStatus]=useState({jobs:[],enabled:true,online:navigator.onLine!==false});
  useEffect(()=>{let active=true;const load=()=>offlineState().then(s=>{if(active)setStatus({...s,online:navigator.onLine!==false});}).catch(()=>{if(active)setStatus(s=>({...s,unavailable:true,online:navigator.onLine!==false}));});load();window.addEventListener('checkpoint-device-change',load);window.addEventListener('online',load);window.addEventListener('offline',load);return()=>{active=false;window.removeEventListener('checkpoint-device-change',load);window.removeEventListener('online',load);window.removeEventListener('offline',load);};},[]);
  return status;
}
export function ConnectionStatus(){
  const state=useDeviceStatus();if(!d1Enabled||(!state.jobs.length&&state.online))return null;
  return <div className="connection-status" role="status">{!state.online?'Hors ligne':state.jobs.some(j=>j.conflict)?'Une modification est à vérifier dans les Options':`${state.jobs.length} modification(s) en attente de synchronisation`}{!state.online&&state.jobs.length>0?` · ${state.jobs.length} modification(s) conservée(s) sur cet appareil`:''}</div>;
}
export default function DataProtection({onCapture,onRestore}){
  const state=useDeviceStatus();const [versions,setVersions]=useState([]),[trash,setTrash]=useState([]),[trashLoaded,setTrashLoaded]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[confirmation,setConfirmation]=useState(null);
  const reload=async()=>{if(owner())setVersions(await deviceRead(owner(),'backups')||[]);};
  useEffect(()=>{reload().catch(()=>setMessage('Le stockage de cet appareil est indisponible. Utilise l’export JSON.'));const update=()=>reload().catch(()=>{});window.addEventListener('checkpoint-device-change',update);return()=>window.removeEventListener('checkpoint-device-change',update);},[]);
  const run=async action=>{setBusy(true);setMessage('');try{await action();}catch(error){setMessage(error.message||'Impossible de terminer. Réessaie.');}finally{setBusy(false);}};
  const conflicts=state.jobs.filter((job,index,jobs)=>job.conflict&&jobs.findIndex(j=>j.ref.path===job.ref.path)===index);
  return <div className="data-protection">
    <section className="protection-section"><h3>Corbeille</h3><p>Les jeux et le matériel supprimés peuvent être récupérés pendant 30 jours, sur tous tes appareils.</p>
      {!d1Enabled?<p>La corbeille nécessite le stockage Cloudflare de Checkpoint.</p>:<><button className="option-pill" disabled={busy||!state.online} onClick={()=>run(async()=>{setTrash(await listTrash());setTrashLoaded(true);})}>Voir la corbeille</button>
      {trashLoaded&&<div className="protection-list">{!trash.length?<p>Ta corbeille est vide.</p>:trash.map(item=><div className="protection-row" key={`${item.collection}:${item.id}`}><div><strong>{item.data.name||'Sans titre'}</strong><small>{item.collection==='games'?'Jeu':'Matériel'} · supprimé le {new Date(item.data._deletedAt).toLocaleDateString('fr-FR')}</small></div><button className="option-pill" disabled={busy||!state.online} onClick={()=>run(async()=>{await restoreTrash(item.collection,item.id);setTrash(await listTrash());setMessage('Fiche restaurée.');})}>Récupérer</button></div>)}</div>}</>}
    </section>
    <section className="protection-section"><h3>Sauvegardes automatiques</h3><p>Une copie par jour et avant les imports ou suppressions. Les 20 dernières versions restent sur cet appareil, pour ce compte. Exporte aussi un fichier pour les garder ailleurs.</p>
      <button className="option-pill" disabled={busy} onClick={()=>run(async()=>{await onCapture('Manuelle');await reload();setMessage('Copie créée sur cet appareil.');})}>Créer une sauvegarde</button>
      <div className="protection-list">{!versions.length?<p>La première copie apparaîtra après le chargement de ta collection.</p>:versions.map(v=><div className="protection-row" key={v.id}><div><strong>{v.reason}</strong><small>{new Date(v.createdAt).toLocaleString('fr-FR')} · {v.payload.games?.length||0} jeux · {v.payload.hardware?.length||0} matériels</small></div><button className="option-pill" disabled={busy} onClick={()=>setConfirmation({title:'Restaurer cette sauvegarde ?',message:'Les fiches correspondantes seront remplacées. Les ajouts plus récents seront conservés. Une copie de sécurité sera créée avant.',action:async()=>{await onRestore(v.payload);setMessage('Restauration préparée. Vérifie la synchronisation ci-dessous.');}})}>Restaurer</button></div>)}</div>
    </section>
    <section className="protection-section"><h3>Mode hors ligne</h3><p>Retrouve ta bibliothèque et ton matériel déjà chargés, puis ajoute ou modifie leurs fiches et tes réglages sans réseau. Les recherches en ligne, le social et la corbeille nécessitent une connexion. Pour rouvrir l’app hors ligne, garde ta session connectée et ouvre l’app au moins une fois avec Internet.</p>
      <label className="protection-toggle"><input type="checkbox" checked={state.enabled} disabled={busy||state.unavailable||state.jobs.length>0} onChange={e=>run(()=>setOfflineEnabled(e.target.checked))}/>Conserver les modifications hors ligne sur cet appareil</label>
      <p role="status">{state.unavailable?'Stockage local indisponible':!state.online?'Appareil hors ligne':state.jobs.length?`${state.jobs.length} modification(s) en attente`:'Tout est synchronisé'}</p>
      <button className="option-pill" disabled={busy||!state.online||!state.jobs.length} onClick={()=>run(()=>syncOffline())}>Synchroniser maintenant</button>
      {state.jobs.length>0&&<p>Ne vide pas les données de l’application avant la synchronisation. La désactivation sera disponible une fois les modifications envoyées.</p>}
      {state.jobs.some(j=>j.error)&&<p role="alert">{state.jobs.find(j=>j.error).error}</p>}
      {conflicts.map(job=><div className="protection-conflict" key={job.id}><strong>{job.ref.collection==='playerPrivateSettings'?'Réglages et profil':job.body?.data?.name||job.ref.id}</strong><p>La fiche a changé sur un autre appareil. Ton choix local reste conservé. Tu peux garder la fiche en ligne ; les modifications locales en attente pour cette fiche seront abandonnées.</p><button className="option-pill" disabled={busy||!state.online} onClick={()=>setConfirmation({title:'Garder la version en ligne ?',message:'Les modifications locales en attente pour cette fiche seront abandonnées.',action:async()=>{await onCapture?.("Avant résolution de conflit");await discardConflict(job.ref.collection,job.ref.id);}})}>Garder la version en ligne</button><button className="option-pill" disabled={busy||!state.online} onClick={()=>setConfirmation({title:"Appliquer tes changements locaux ?",message:"Tes modifications seront appliquées à la fiche en ligne. Les champs que tu n’as pas modifiés seront conservés. Une copie de sécurité sera créée avant.",action:async()=>{await onCapture?.("Avant résolution de conflit");await keepLocalConflict(job.ref.collection,job.ref.id);}})}>Appliquer mes changements</button></div>)}
    </section>
    {message&&<p className="protection-message" role="status">{message}</p>}
    {confirmation&&<ProtectionConfirmation {...confirmation} onCancel={()=>setConfirmation(null)} onConfirm={()=>{const action=confirmation.action;setConfirmation(null);run(action);}}/>}
  </div>;
}

function ProtectionConfirmation({title,message,onCancel,onConfirm}){
  const cancel=useRef(null),confirm=useRef(null);
  useEffect(()=>{const previous=document.activeElement;cancel.current?.focus();return()=>previous?.focus?.();},[]);
  return createPortal(<div className="protection-confirm-overlay"><div className="protection-confirm" role="alertdialog" aria-modal="true" aria-labelledby="protection-confirm-title" aria-describedby="protection-confirm-description" onKeyDown={event=>{if(event.key==='Escape')onCancel();if(event.key==='Tab'){event.preventDefault();(document.activeElement===cancel.current?confirm:cancel).current?.focus();}}}><h2 id="protection-confirm-title">{title}</h2><p id="protection-confirm-description">{message}</p><div><button ref={cancel} type="button" className="option-pill" onClick={onCancel}>Annuler</button><button ref={confirm} type="button" className="option-pill checkpoint-primary-action" onClick={onConfirm}>Confirmer</button></div></div></div>,document.body);
}
