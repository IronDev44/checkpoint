import {useState} from 'react';
import './ExternalVideo.css';
// No iframe, thumbnail or connection to YouTube exists before this choice.
export default function ExternalVideo({videoId,title,className=''}){
 const [allowed,setAllowed]=useState(false);
 if(!/^[a-zA-Z0-9_-]{1,64}$/.test(videoId||''))return null;
 return <div className={`external-video ${className}`}>
  {allowed?<><iframe src={`https://www.youtube-nocookie.com/embed/${videoId}`} title={title} referrerPolicy="no-referrer" allow="encrypted-media; picture-in-picture" allowFullScreen/><button className="external-video-stop" type="button" onClick={()=>setAllowed(false)}>Arrêter et retirer le lecteur</button></>:<div className="external-video-choice"><strong>{title||'Vidéo YouTube'}</strong><p>Charger ce lecteur autorise une connexion à YouTube (Google), qui reçoit notamment ton adresse IP et peut utiliser des traceurs. Ton choix vaut pour ce lecteur uniquement.</p><button type="button" onClick={()=>setAllowed(true)}>Autoriser et charger YouTube</button><a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noreferrer">Ouvrir sur YouTube</a><a href="/legal/confidentialite.html" target="_blank" rel="noreferrer">En savoir plus sur tes données</a></div>}
  {allowed&&<small>Le retrait arrête le lecteur ; il n’efface pas les données déjà reçues par YouTube.</small>}
 </div>;
}
