import { useLanguage, getIntlLocale } from "../i18n/language";import { LocalizedMessage, LocalizedValue, LocalizedElement } from "../i18n/Localized";import { useEffect, useRef, useState } from 'react';
import { socialReportRequest } from '../services/friendships';
import { REPORT_REASONS } from './SocialReportDialog';
import './TesterFeedback.css';
const statuses = { new: 'Nouveau', progress: 'En cours', resolved: 'Traité', dismissed: 'Classé sans suite' };
export default function SocialReportsInbox() {useLanguage();
  const [items, setItems] = useState([]),[cursor, setCursor] = useState(null),[filter, setFilter] = useState('new'),[busy, setBusy] = useState(false),[error, setError] = useState(''),[loaded, setLoaded] = useState(false);
  const active = useRef(false),lock = useRef(false);
  const load = async (more) => {
    if (lock.current) return;lock.current = true;setBusy(true);setError('');
    try {const data = await socialReportRequest('list', more ? { cursor } : {});if (!Array.isArray(data.items)) throw Error('Réponse indisponible.');if (active.current) {setItems((old) => more ? [...old, ...data.items] : data.items);setCursor(data.cursor);setLoaded(true);}}
    catch (e) {if (active.current) setError(e.message);} finally {if (active.current) {lock.current = false;setBusy(false);}}
  };
  useEffect(() => {active.current = true;load(false);return () => {active.current = false;};}, []);
  const update = async (item, status) => {
    if (lock.current) return;lock.current = true;setBusy(true);setError('');
    try {await socialReportRequest('status', { id: item.id, status });if (active.current) setItems((old) => old.map((row) => row.id === item.id ? { ...row, status } : row));}
    catch (e) {if (active.current) setError(e.message);} finally {if (active.current) {lock.current = false;setBusy(false);}}
  };
  const shown = items.filter((item) => filter === 'all' || item.status === filter);
  return <section className="tester-feedback"><h2><LocalizedMessage source={"Signalements sociaux"} values={[]} /></h2><p><LocalizedMessage source={"Examine les profils et publications signalés. Changer le suivi ne supprime pas le contenu du joueur."} values={[]} /></p>
  <div className="feedback-inbox-tools"><LocalizedElement __as={"select"} aria-label="Filtrer les signalements" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all"><LocalizedMessage source={"Tous"} values={[]} /></option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}><LocalizedValue value={label} /></option>)}</LocalizedElement><button type="button" disabled={busy} onClick={() => load(false)}><LocalizedMessage source={"Actualiser"} values={[]} /></button></div>
  {error && <p role="alert"><LocalizedValue value={error} /></p>}{loaded && !shown.length && <p><LocalizedMessage source={"Aucun signalement avec ce statut dans les pages chargées."} values={[]} /></p>}
  {shown.map((item) => <article className="feedback-inbox-card" key={item.id}><strong><LocalizedMessage source={"" + (item.target.type === 'activity' ? 'Publication' : 'Profil') + " · @" + "{{0}}"} values={[item.target.handle]} /></strong><small><LocalizedValue value={new Date(item.createdAt).toLocaleString(getIntlLocale())} /> · <LocalizedValue value={REPORT_REASONS[item.reason]} /></small><p><LocalizedValue value={item.target.title} /></p><p><LocalizedValue value={item.target.snapshot} /></p>{item.details && <p><strong><LocalizedMessage source={"Précisions : "} values={[]} /></strong><LocalizedValue value={item.details} /></p>}<small><LocalizedMessage source={"Signalé par {{0}}{{1}}"} values={[item.reporter.displayName, item.reporter.handle ? ` · @${item.reporter.handle}` : '']} /></small><label><LocalizedMessage source={"Suivi du signalement"} values={[]} /><select disabled={busy} value={item.status} onChange={(e) => update(item, e.target.value)}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}><LocalizedValue value={label} /></option>)}</select></label></article>)}
  {cursor && <button type="button" className="option-pill" disabled={busy} onClick={() => load(true)}><LocalizedMessage source={"Charger les signalements suivants"} values={[]} /></button>}
 </section>;
}
