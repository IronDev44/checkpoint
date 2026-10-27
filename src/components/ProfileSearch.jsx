import {useEffect,useRef,useState,useId} from 'react';
import {searchPublicProfiles} from '../services/profileSearch';
import './ProfileSearch.css';
export default function ProfileSearch({onOpen,onInvite,connections=[],canInvite=true}){
 const [query,setQuery]=useState(''),[result,setResult]=useState(null),[busy,setBusy]=useState(false),[action,setAction]=useState(''),[error,setError]=useState(''),[message,setMessage]=useState('');
 const request=useRef(null),version=useRef(0),alive=useRef(true),acting=useRef(false),id=useId();
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;request.current?.abort();version.current++;};},[]);
 const edit=value=>{request.current?.abort();version.current++;setBusy(false);setQuery(value);setResult(null);setError('');setMessage('');};
 async function search(e){e.preventDefault();const term=query.trim();if(term.replace(/^@/,'').length<2){setError('Entre au moins 2 caractères.');return;}
  request.current?.abort();const controller=new AbortController();request.current=controller;const current=++version.current;setBusy(true);setError('');setResult(null);
  const timer=setTimeout(()=>controller.abort(),15000);
  try{const data=await searchPublicProfiles(term,controller.signal);if(alive.current&&version.current===current)setResult(data);}
  catch(e){if(alive.current&&version.current===current)setError(e.name==='AbortError'?'La recherche prend trop de temps. Réessaie.':e.message);}
  finally{clearTimeout(timer);if(alive.current&&version.current===current)setBusy(false);}
 }
 async function act(profile,invite){if(acting.current)return;acting.current=true;setAction(profile.handle);setError('');setMessage('');
  try{if(invite){const result=await onInvite(profile.handle);if(result?.ok===false)throw Error(result.message);if(alive.current)setMessage(result?.message||'Invitation envoyée.');}else await onOpen(profile.handle);}
  catch(e){if(alive.current)setError(e.message||'Ce profil n’est plus disponible. Réessaie.');}
  finally{acting.current=false;if(alive.current)setAction('');}
 }
 return <section className="profile-search" aria-label="Rechercher des profils"><h3>Rechercher un profil</h3><p>Entre un pseudo ou un identifiant pour découvrir les profils publics. Tu peux les consulter sans envoyer d’invitation.</p>
  <form onSubmit={search}><label htmlFor={id}>Pseudo ou identifiant</label><div><input id={id} type="search" value={query} maxLength={60} onChange={e=>edit(e.target.value)} placeholder="Pseudo ou @identifiant"/><button type="submit" className="option-pill" disabled={busy}>{busy?'Recherche…':'Rechercher'}</button></div></form>
  {error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
  {result&&<><p role="status">{result.profiles.length?`${result.profiles.length} profil${result.profiles.length>1?'s':''} trouvé${result.profiles.length>1?'s':''}`:'Aucun profil public trouvé. Vérifie le pseudo ou essaie son identifiant.'}</p>
   <ul>{result.profiles.map(profile=>{const relation=connections.find(c=>c.profile.handle===profile.handle),accepted=relation?.status==='accepted',pending=relation?.status==='pending';return <li key={profile.handle}><div className="profile-search-identity">{profile.photoURL&&<img src={profile.photoURL} alt="" loading="lazy"/>}<span><strong>{profile.displayName}</strong><small>@{profile.handle}</small></span></div><div className="profile-search-actions"><button type="button" className="option-pill" disabled={Boolean(action)} aria-label={`Voir le profil de ${profile.displayName}`} onClick={()=>act(profile,false)}>{action===profile.handle?'Chargement…':'Voir le profil'}</button>{accepted||pending?<span>{accepted?'Déjà amis':relation.direction==='received'?'Invitation reçue':'Invitation envoyée'}</span>:<button type="button" className="option-pill" disabled={!canInvite||Boolean(action)} aria-label={`Inviter ${profile.displayName}`} onClick={()=>act(profile,true)}>Inviter</button>}</div></li>;})}</ul>
   {result.limited&&<p>Précise ta recherche pour trouver d’autres profils.</p>}
  </>}
 </section>;
}
