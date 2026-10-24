import {useRef,useState} from 'react';
import ToolDialog from './ToolDialog';
import {socialReportRequest} from '../services/friendships';
export const REPORT_REASONS={spam:'Spam ou publicité',harassment:'Harcèlement',offensive:'Contenu offensant',other:'Autre problème'};
export default function SocialReportDialog({target,onClose}){
 const [reason,setReason]=useState('spam'),[details,setDetails]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[sent,setSent]=useState(false);
 const lock=useRef(false);
 return <ToolDialog title={target.type==='activity'?'Signaler cette publication':'Signaler ce profil'} onClose={onClose} busy={busy}>
  {sent?<><p role="status">Signalement envoyé. Il sera examiné par le propriétaire de Checkpoint.</p><button type="button" className="option-pill" onClick={onClose}>Fermer</button></>:<form className="rendezvous-form" onSubmit={async e=>{e.preventDefault();if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await socialReportRequest('report',{handle:target.handle,type:target.type,activityId:target.activityId,reason,details});setSent(true);}catch(err){setError(err.message);}finally{lock.current=false;setBusy(false);}}}>
   <p>Le contenu signalé, ton message et ton identifiant seront transmis au propriétaire de Checkpoint. Le joueur signalé ne reçoit pas ton signalement.</p>
   {error&&<p role="alert">{error}</p>}
   <label>Motif<select value={reason} disabled={busy} onChange={e=>setReason(e.target.value)}>{Object.entries(REPORT_REASONS).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
   <label>Précisions (facultatif)<textarea maxLength={1500} value={details} disabled={busy} onChange={e=>setDetails(e.target.value)} placeholder="Explique ce qui pose problème…"/></label>
   <button type="submit" className="option-pill" disabled={busy}>{busy?'Envoi…':'Envoyer le signalement'}</button>
  </form>}
 </ToolDialog>;
}
