import {useEffect,useState} from 'react';
import {auth} from '../firebase';
import {usageRequest} from '../services/appUsage';
import {accountsEnabled} from '../services/accountConfig';
import './LegalOptions.css';

export function LegalLinks(){
 return <nav className="checkpoint-legal-links" aria-label="Informations légales">
  <a href="/legal/mentions-legales.html" target="_blank" rel="noreferrer">Mentions légales</a>
  <a href="/legal/confidentialite.html" target="_blank" rel="noreferrer">Confidentialité</a>
  <a href="/legal/cgu.html" target="_blank" rel="noreferrer">Conditions d’utilisation</a>
  <a href="/legal/droits.html" target="_blank" rel="noreferrer">Contact et droits</a>
 </nav>;
}
export default function LegalOptions(){
 const [usage,setUsage]=useState(null),[available,setAvailable]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const uid=auth.currentUser?.uid;
 useEffect(()=>{let active=true;setUsage(null);setAvailable(false);if(accountsEnabled&&uid)usageRequest(undefined,'privacyPreferences').then(data=>{if(active){setUsage(data.usage);setAvailable(data.available===true);}}).catch(()=>{if(active)setMessage('Choix indisponible. Recharge la page pour réessayer.');});return()=>{active=false;};},[uid]);
 async function choose(value){
  setBusy(true);setMessage('');
  try{const data=await usageRequest({usage:value},'privacyPreferences');setUsage(data.usage);window.dispatchEvent(new Event('checkpoint-privacy-changed'));setMessage(value?'Statistiques facultatives activées.':'Statistiques désactivées et relevés d’activité supprimés.');}
  catch(error){setMessage(error.message);}finally{setBusy(false);}
 }
 return <section className="search-panel options-panel account-options checkpoint-legal-options">
  <h2 className="panel-title">Informations légales et données</h2>
  <LegalLinks/>
  <p>Une question, une demande d’accès ou de suppression de ton compte ? Écris à <a href="mailto:checkpoint.appgaming@gmail.com">checkpoint.appgaming@gmail.com</a>. La suppression est traitée sur demande ; ce lien prépare un e-mail, il n’efface pas ton compte.</p>
  {accountsEnabled&&uid&&<><h3>Statistiques d’activité facultatives</h3><p>Cette mesure utilise l’identifiant de compte et les dates de première et dernière activité. Elle ne comprend pas d’historique des clics. Son état et les choix disponibles sont indiqués ci-dessous ; ils ne changent pas l’accès à ta collection.</p>
   <p>État : <strong>{usage===null?'Chargement…':!available?'mesure suspendue':usage?'activées':'désactivées'}</strong></p>
   {!available&&usage!==null&&<p>La collecte est en pause. Tu peux toujours effacer les anciens relevés associés à ton compte.</p>}
   <div className="checkpoint-privacy-actions"><button type="button" disabled={!available||busy||usage===null||usage===true} onClick={()=>choose(true)}>Autoriser les statistiques</button><button type="button" disabled={busy||usage===null} onClick={()=>choose(false)}>{usage?'Retirer mon accord':'Refuser et effacer les relevés'}</button></div></>}
  {message&&<p role="status">{message}</p>}
 </section>;
}
