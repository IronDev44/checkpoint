import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedValue } from "../i18n/Localized";import { useRef, useState } from 'react';
import ToolDialog from './ToolDialog';
import { socialReportRequest } from '../services/friendships';
export const REPORT_REASONS = { spam: 'Spam ou publicité', harassment: 'Harcèlement', offensive: 'Contenu offensant', other: 'Autre problème' };
export default function SocialReportDialog({ target, onClose }) {useLanguage();
  const [reason, setReason] = useState('spam'),[details, setDetails] = useState(''),[busy, setBusy] = useState(false),[error, setError] = useState(''),[sent, setSent] = useState(false);
  const lock = useRef(false);
  return <ToolDialog title={target.type === 'activity' ? 'Signaler cette publication' : 'Signaler ce profil'} onClose={onClose} busy={busy}>{
    sent ? <><p role="status"><LocalizedMessage source={"Signalement envoyé. Il sera examiné par le propriétaire de Checkpoint."} values={[]} /></p><button type="button" className="option-pill" onClick={onClose}><LocalizedMessage source={"Fermer"} values={[]} /></button></> : <form className="rendezvous-form" onSubmit={async (e) => {e.preventDefault();if (lock.current) return;lock.current = true;setBusy(true);setError('');try {await socialReportRequest('report', { handle: target.handle, type: target.type, activityId: target.activityId, reason, details });setSent(true);} catch (err) {setError(err.message);} finally {lock.current = false;setBusy(false);}}}>
   <p><LocalizedMessage source={"Le contenu signalé, ton message et ton identifiant seront transmis au propriétaire de Checkpoint. Le joueur signalé ne reçoit pas ton signalement."} values={[]} /></p>
   <p><a href="/legal/confidentialite.html" target="_blank" rel="noreferrer"><LocalizedMessage source={"Données personnelles et droits"} values={[]} /></a> · <a href="/legal/droits.html" target="_blank" rel="noreferrer"><LocalizedMessage source={"Contact et contestation"} values={[]} /></a></p>{
      error && <p role="alert"><LocalizedValue value={error} /></p>}
      <label><LocalizedMessage source={"Motif"} values={[]} /><select value={reason} disabled={busy} onChange={(e) => setReason(e.target.value)}>{Object.entries(REPORT_REASONS).map(([value, label]) => <option value={value} key={value}><LocalizedValue value={label} /></option>)}</select></label>
   <label><LocalizedMessage source={"Précisions (facultatif)"} values={[]} /><textarea maxLength={1500} value={details} disabled={busy} onChange={(e) => setDetails(e.target.value)} placeholder="Explique ce qui pose problème…" /></label>
   <button type="submit" className="option-pill" disabled={busy}><LocalizedValue value={busy ? 'Envoi…' : 'Envoyer le signalement'} /></button>
  </form>}
  </ToolDialog>;
}
