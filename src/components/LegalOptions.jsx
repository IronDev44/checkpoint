import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedElement, LocalizedValue } from "../i18n/Localized";import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { usageRequest } from '../services/appUsage';
import { accountsEnabled } from '../services/accountConfig';
import './LegalOptions.css';

export function LegalLinks() {useLanguage();
  return <><p className="checkpoint-legal-language"><LocalizedMessage source="Documents juridiques disponibles en français." values={[]}/></p><LocalizedElement __as={"nav"} className="checkpoint-legal-links" aria-label="Informations légales">
  <a href="/legal/mentions-legales.html" target="_blank" rel="noreferrer"><LocalizedMessage source={"Mentions légales"} values={[]} /></a>
  <a href="/legal/confidentialite.html" target="_blank" rel="noreferrer"><LocalizedMessage source={"Confidentialité"} values={[]} /></a>
  <a href="/legal/cgu.html" target="_blank" rel="noreferrer"><LocalizedMessage source={"Conditions d’utilisation"} values={[]} /></a>
  <a href="/legal/droits.html" target="_blank" rel="noreferrer"><LocalizedMessage source={"Contact et droits"} values={[]} /></a>
 </LocalizedElement></>;
}
export default function LegalOptions() {useLanguage();
  const [usage, setUsage] = useState(null),[available, setAvailable] = useState(false),[busy, setBusy] = useState(false),[message, setMessage] = useState('');
  const uid = auth.currentUser?.uid;
  useEffect(() => {let active = true;setUsage(null);setAvailable(false);if (accountsEnabled && uid) usageRequest(undefined, 'privacyPreferences').then((data) => {if (active) {setUsage(data.usage);setAvailable(data.available === true);}}).catch(() => {if (active) setMessage('Choix indisponible. Recharge la page pour réessayer.');});return () => {active = false;};}, [uid]);
  async function choose(value) {
    setBusy(true);setMessage('');
    try {const data = await usageRequest({ usage: value }, 'privacyPreferences');setUsage(data.usage);window.dispatchEvent(new Event('checkpoint-privacy-changed'));setMessage(value ? 'Statistiques facultatives activées.' : 'Statistiques désactivées et relevés d’activité supprimés.');}
    catch (error) {setMessage(error.message);} finally {setBusy(false);}
  }
  return <section className="search-panel options-panel account-options checkpoint-legal-options">
  <h2 className="panel-title"><LocalizedMessage source={"Informations légales et données"} values={[]} /></h2>
  <LegalLinks />
  <p><LocalizedMessage source={"Une question, une demande d’accès ou de suppression de ton compte ? Écris à "} values={[]} /><a href="mailto:checkpoint.appgaming@gmail.com"><LocalizedMessage source={"checkpoint.appgaming@gmail.com"} values={[]} /></a><LocalizedMessage source={". La suppression est traitée sur demande ; ce lien prépare un e-mail, il n’efface pas ton compte."} values={[]} /></p>
  {accountsEnabled && uid && <><h3><LocalizedMessage source={"Statistiques d’activité facultatives"} values={[]} /></h3><p><LocalizedMessage source={"Cette mesure utilise l’identifiant de compte et les dates de première et dernière activité. Elle ne comprend pas d’historique des clics. Son état et les choix disponibles sont indiqués ci-dessous ; ils ne changent pas l’accès à ta collection."} values={[]} /></p>
   <p><LocalizedMessage source={"État : "} values={[]} /><strong><LocalizedValue value={usage === null ? 'Chargement…' : !available ? 'mesure suspendue' : usage ? 'activées' : 'désactivées'} /></strong></p>
   {!available && usage !== null && <p><LocalizedMessage source={"La collecte est en pause. Tu peux toujours effacer les anciens relevés associés à ton compte."} values={[]} /></p>}
   <div className="checkpoint-privacy-actions"><button type="button" disabled={!available || busy || usage === null || usage === true} onClick={() => choose(true)}><LocalizedMessage source={"Autoriser les statistiques"} values={[]} /></button><button type="button" disabled={busy || usage === null} onClick={() => choose(false)}><LocalizedValue value={usage ? 'Retirer mon accord' : 'Refuser et effacer les relevés'} /></button></div></>}
  {message && <p role="status"><LocalizedValue value={message} /></p>}
 </section>;
}
