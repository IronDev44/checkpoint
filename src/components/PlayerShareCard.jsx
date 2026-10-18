import {useEffect,useRef,useState} from 'react';
import {playerCardContent,renderPlayerCard} from '../services/playerCard';
export default function PlayerShareCard({profile,games,level}){
 const [options,setOptions]=useState({photo:true,games:true,platforms:true});
 const [preview,setPreview]=useState('');const [blob,setBlob]=useState(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const root=useRef(null);const mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
 const create=async()=>{setBusy(true);setError('');try{const content=playerCardContent(profile,games,level,options);const accent=getComputedStyle(root.current).getPropertyValue('--accent-solid').trim()||'#d6b66f';const image=await renderPlayerCard(content,accent);if(mounted.current){setBlob(image);setPreview(URL.createObjectURL(image));}}catch(e){if(mounted.current)setError(e.message);}finally{if(mounted.current)setBusy(false);}};
 const file=blob?new File([blob],'mon-profil-checkpoint.png',{type:'image/png'}):null;
 const canShare=!!file&&!!navigator.canShare?.({files:[file]});
 return <section className="search-panel player-share-card" ref={root} aria-labelledby="player-share-title">
  <h2 id="player-share-title">Ta carte de joueur</h2><p>Une image à enregistrer ou à partager, aux couleurs de ton thème.</p>
  <div className="player-share-fields">{[['photo','Ma photo'],['games','Mes jeux fondateurs'],['platforms','Mes plateformes']].map(([key,label])=><label key={key}><input type="checkbox" checked={options[key]} disabled={busy} onChange={e=>{setOptions(o=>({...o,[key]:e.target.checked}));setPreview('');setBlob(null);}}/>{label}</label>)}</div>
  <button type="button" className="checkpoint-primary-action" onClick={create} disabled={busy}>{busy?'Création de l’image…':preview?'Actualiser ma carte':'Créer ma carte'}</button>
  {error&&<p role="alert">{error}</p>}
  {preview&&<><img className="player-share-preview" src={preview} alt="Aperçu de ta carte de joueur"/><div className="player-share-actions"><a href={preview} download="mon-profil-checkpoint.png">Enregistrer l’image</a>{canShare&&<button type="button" onClick={async()=>{try{await navigator.share({files:[file],title:'Mon profil Checkpoint'});}catch(e){if(e.name!=='AbortError')setError('Partage indisponible. Tu peux enregistrer l’image.');}}}>Partager</button>}</div></>}
  <small>La carte reste privée tant que tu ne la partages pas. Les photos indisponibles sont remplacées par un visuel simple.</small>
 </section>;
}
