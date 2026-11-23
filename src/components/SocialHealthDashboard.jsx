import { useLanguage, getIntlLocale } from "../i18n/language";import { LocalizedMessage, LocalizedValue, LocalizedElement } from "../i18n/Localized";import { useEffect, useRef, useState } from 'react';
import { friendshipRequest } from '../services/friendships';
import './UsageDashboard.css';
const request = (action = 'list') => friendshipRequest(action, {}, 'socialDiagnostics');
const labels = { search: 'Recherche', friendships: 'Invitations', socialControls: 'Confidentialité', socialReactions: 'Réactions', sharedGames: 'Jeux en commun', socialReports: 'Signalements', friendPolls: 'Sondages', friendChallenges: 'Défis', gameRecommendations: 'Recommandations', profile: 'Profil' };
const statusLabel = (status) => ({ 0: 'Erreur réseau', 408: 'Délai dépassé', 409: 'Modification simultanée', 429: 'Limite de requêtes atteinte' })[status] || 'Erreur du service';
export default function SocialHealthDashboard() {useLanguage();
  const [data, setData] = useState(null),[error, setError] = useState(''),[busy, setBusy] = useState(false),[progress, setProgress] = useState('');
  const alive = useRef(false),lock = useRef(false);
  async function load(prepare = false) {
    if (lock.current) return;lock.current = true;setBusy(true);setError('');setProgress('');
    try {
      if (prepare) {let more = true;for (let step = 0; step < 20 && more && alive.current; step++) {const result = await request('index');more = result.pending > 0;if (alive.current) setProgress(result.pending ? `${result.pending} profil${result.pending > 1 ? 's' : ''} à préparer.` : 'La recherche est prête.');}}
      const result = await request();if (!Array.isArray(result.issues)) throw Error('Le suivi est indisponible.');if (alive.current) setData(result);
    } catch (e) {if (alive.current) setError(e.message);} finally
    {lock.current = false;if (alive.current) setBusy(false);}
  }
  useEffect(() => {alive.current = true;load();return () => {alive.current = false;};}, []);
  return <LocalizedElement __as={"section"} className="usage-dashboard" aria-label="Fiabilité du social" aria-busy={busy}>
  <header><div><h2><LocalizedMessage source={"Fiabilité du social"} values={[]} /></h2><p><LocalizedMessage source={"Les incidents techniques des 30 derniers jours, regroupés par fonction."} values={[]} /></p></div><button type="button" className="option-pill" disabled={busy} onClick={() => load()}><LocalizedMessage source={"Actualiser"} values={[]} /></button></header>
  <p><LocalizedMessage source={"Des compteurs techniques, sans identité ni contenu privé. Les nombres correspondent à des incidents, pas à des personnes."} values={[]} /></p>
  <details><summary><LocalizedMessage source={"Quelles données sont enregistrées ?"} values={[]} /></summary><p><LocalizedMessage source={"Uniquement la fonction concernée, le type d’erreur, le nombre d’incidents et leur date. Aucun pseudo, message, contenu de publication, adresse e-mail ou adresse IP. Les erreurs réseau ne sont remontées que si la connexion le permet."} values={[]} /></p></details>
  {error && <p role="alert"><LocalizedValue value={error} /></p>}{progress && <p role="status"><LocalizedValue value={progress} /></p>}
  {data && <>
   <h3><LocalizedMessage source={"Recherche de profils"} values={[]} /></h3><p><LocalizedMessage source={"{{0}} profils indexés · {{1}} mises à jour en attente. Les recherches actualisent l’index automatiquement."} values={[data.directory.indexed, data.directory.pending]} /></p>
   {data.directory.pending > 0 && <button type="button" className="option-pill" disabled={busy} onClick={() => load(true)}><LocalizedMessage source={"Préparer l’index de recherche"} values={[]} /></button>}
   <h3><LocalizedMessage source={"Incidents observés"} values={[]} /></h3>{!data.issues.length ? <p><LocalizedMessage source={"Aucun incident enregistré sur la période."} values={[]} /></p> : <ul className="usage-accounts">{data.issues.map((issue, index) => <li key={`${issue.operation}-${issue.status}-${issue.lastSeen}-${index}`}><span><strong><LocalizedValue value={labels[issue.operation] || 'Social'} /> · <LocalizedValue value={statusLabel(issue.status)} /></strong><small><LocalizedMessage source={"" + (issue.source === 'client' ? 'Depuis l’appareil' : 'Depuis le serveur') + " · Dernier incident : " + "{{0}}"} values={[new Date(issue.lastSeen).toLocaleString(getIntlLocale())]} /></small></span><strong><LocalizedValue value={issue.count} /></strong></li>)}</ul>}
  </>}
 </LocalizedElement>;
}
