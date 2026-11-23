import { useLanguage } from "../i18n/language";import { LocalizedElement, LocalizedMessage, LocalizedValue } from "../i18n/Localized";import { useState } from 'react';
import './ExternalVideo.css';
// No iframe, thumbnail or connection to YouTube exists before this choice.
export default function ExternalVideo({ videoId, title, className = '' }) {useLanguage();
  const [allowed, setAllowed] = useState(false);
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(videoId || '')) return null;
  return <div className={`external-video ${className}`}>
  {allowed ? <><LocalizedElement __as={"iframe"} src={`https://www.youtube-nocookie.com/embed/${videoId}`} title={title} referrerPolicy="no-referrer" allow="encrypted-media; picture-in-picture" allowFullScreen /><button className="external-video-stop" type="button" onClick={() => setAllowed(false)}><LocalizedMessage source={"Arrêter et retirer le lecteur"} values={[]} /></button></> : <div className="external-video-choice"><strong><LocalizedValue value={title || 'Vidéo YouTube'} /></strong><p><LocalizedMessage source={"Charger ce lecteur autorise une connexion à YouTube (Google), qui reçoit notamment ton adresse IP et peut utiliser des traceurs. Ton choix vaut pour ce lecteur uniquement."} values={[]} /></p><button type="button" onClick={() => setAllowed(true)}><LocalizedMessage source={"Autoriser et charger YouTube"} values={[]} /></button><a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noreferrer"><LocalizedMessage source={"Ouvrir sur YouTube"} values={[]} /></a><a href="/legal/confidentialite.html" target="_blank" rel="noreferrer"><LocalizedMessage source={"En savoir plus sur tes données"} values={[]} /></a></div>}
  {allowed && <small><LocalizedMessage source={"Le retrait arrête le lecteur ; il n’efface pas les données déjà reçues par YouTube."} values={[]} /></small>}
 </div>;
}
