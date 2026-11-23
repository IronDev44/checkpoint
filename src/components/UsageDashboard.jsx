import { useLanguage, getIntlLocale } from "../i18n/language";import { LocalizedMessage, LocalizedValue, LocalizedElement } from "../i18n/Localized";import { useEffect, useRef, useState } from 'react';
import { usageRequest } from '../services/appUsage';
import './UsageDashboard.css';
export default function UsageDashboard() {useLanguage();
  const [data, setData] = useState(null),[error, setError] = useState(''),[busy, setBusy] = useState(false);
  const alive = useRef(false),locked = useRef(false);
  async function load(payload) {
    if (locked.current) return;locked.current = true;setBusy(true);setError('');
    try {if (payload) await usageRequest(payload);const result = await usageRequest();if (!result.summary || !Array.isArray(result.accounts)) throw Error('Réponse indisponible.');if (alive.current) setData(result);}
    catch (e) {if (alive.current) setError(e.name === 'AbortError' ? 'Le chargement prend trop de temps. Réessaie.' : e.message);} finally
    {locked.current = false;if (alive.current) setBusy(false);}
  }
  useEffect(() => {alive.current = true;load();return () => {alive.current = false;};}, []);
  const summary = data?.summary;
  return <LocalizedElement __as={"section"} className="usage-dashboard" aria-label="Statistiques d’utilisation" aria-busy={busy}>
  <header><div><h2><LocalizedMessage source={"Utilisation de Checkpoint"} values={[]} /></h2><p><LocalizedMessage source={"Des comptes distincts, même sur plusieurs appareils. L’activité est mesurée uniquement avec un accord facultatif."} values={[]} /></p></div><button type="button" className="option-pill" disabled={busy} onClick={() => load()}><LocalizedValue value={busy ? 'Chargement…' : 'Actualiser'} /></button></header>
  {error && <p role="alert"><LocalizedValue value={error} /></p>}
  {data?.trackingAvailable === false && <p><LocalizedMessage source={"La mesure individuelle d’activité est suspendue. Les relevés encore affichés sont historiques ; le compteur de comptes connus reste disponible."} values={[]} /></p>}
  {summary && <><dl className="usage-metrics">{[['total', 'Comptes connus'], ['active1', 'Actifs · 24 h'], ['active7', 'Actifs · 7 jours'], ['active30', 'Actifs · 30 jours'], ['new7', 'Premières visites · 7 jours']].map(([key, label]) => <div key={key}><dt><LocalizedValue value={label} /></dt><dd><LocalizedValue value={summary[key].toLocaleString(getIntlLocale())} /></dd></div>)}</dl>
   <p><LocalizedMessage source={"Ton compte et les comptes de test exclus ne sont pas comptés. « Actif » signifie avoir ouvert ou utilisé l’application pendant la période, avec l’onglet visible."} values={[]} /></p>
   <p><LocalizedMessage source={"Les comptes connus sont ceux présents dans les données de Checkpoint ou ayant ouvert l’application depuis ce suivi. Ce compteur n’est pas la liste complète des inscriptions Firebase. Les premières visites ne sont pas des nouvelles inscriptions."} values={[]} /></p>
   <p><LocalizedMessage source={"{{0}} Les relevés sans accord et ceux inactifs depuis plus de 30 jours sont purgés à cette consultation. Les visites antérieures ne peuvent pas être reconstituées. Aucune adresse e-mail ni adresse IP n’est enregistrée pour ces statistiques."} values={[summary.since ? `Première activité mesurée le ${new Date(summary.since).toLocaleDateString(getIntlLocale())}.` : 'Aucune activité mesurée pour les comptes inclus.']} /></p>
   <details><summary><LocalizedMessage source={"Exclure les comptes de test"} values={[]} /></summary><p><LocalizedMessage source={"Les 100 comptes les plus récemment actifs sont proposés ici, avec les comptes exclus en premier."} values={[]} /></p><ul className="usage-accounts">{data.accounts.map((account) => <li key={account.uid}><span><code>{account.uid}</code><small><LocalizedValue value={account.lastSeen ? `Dernière activité : ${new Date(account.lastSeen).toLocaleString(getIntlLocale())}` : 'Activité pas encore mesurée'} /></small></span><LocalizedElement __as={"button"} type="button" className="option-pill" disabled={busy} onClick={() => load({ action: 'exclude', uid: account.uid, excluded: !account.excluded })} __messages={{ "aria-label": { source: "{{0}} le compte {{1}}", values: [account.excluded ? 'Inclure' : 'Exclure', account.uid], preserve: [] } }}><LocalizedValue value={account.excluded ? 'Réinclure' : 'Exclure'} /></LocalizedElement></li>)}</ul></details>
   <small><LocalizedMessage source={"Actualisé le {{0}} · activité actualisée au maximum toutes les 5 minutes."} values={[new Date(data.updatedAt).toLocaleString(getIntlLocale())]} /></small>
  </>}
 </LocalizedElement>;
}
