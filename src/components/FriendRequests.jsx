import {useState} from 'react';
import {SocialAvatar} from './ProfilePhoto';
import './FriendRequests.css';

export default function FriendRequests({connections=[],busy=false,error='',refresh,act,onOpen,onBlock}){
 const [message,setMessage]=useState('');
 const [query,setQuery]=useState('');
 const respond=async(action,id)=>{
  setMessage('');
  try{await act(action,{id});setMessage({accept:'Invitation acceptée. Vous êtes maintenant amis.',decline:'Invitation refusée.',cancel:'Invitation annulée.'}[action]);}
  catch{/* The shared error remains visible and the request can be retried. */}
 };
 return <section className="friend-requests" aria-label="Invitations d’amis" aria-busy={busy}>
  <div className="friend-requests-heading"><h3>Invitations d’amis</h3><button type="button" disabled={busy} onClick={refresh}>Actualiser</button></div>
  {error&&<p role="alert">{error}</p>}
  <p role="status">{message}</p>
  <label className="social-invitation-search">Rechercher une invitation<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nom ou identifiant…"/></label>
  {['received','sent'].map(direction=>{
   const items=connections.filter(item=>item.status==='pending'&&item.direction===direction&&`${item.profile.displayName} ${item.profile.handle}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr'))).sort((a,b)=>(Date.parse(b.createdAt)||0)-(Date.parse(a.createdAt)||0));
   return <div key={direction}><h4>{direction==='received'?'Reçues':'Envoyées'} · {items.length}</h4>
    {!items.length&&<p>{direction==='received'?'Aucune invitation reçue.':'Aucune invitation en attente de réponse.'}</p>}
    {items.map(item=><article key={item.id} className="friend-request">
     <div className="friend-request-person"><SocialAvatar name={item.profile.displayName} src={item.profile.photoURL}/><div><strong>{item.profile.displayName}</strong><small>@{item.profile.handle}</small></div></div>
     {item.createdAt&&<small>En attente depuis le {new Date(item.createdAt).toLocaleDateString('fr-FR')}</small>}
     <div className="friend-request-actions">
      {onOpen&&<button type="button" disabled={busy} onClick={async()=>{try{await onOpen(item.profile.handle);}catch(e){setMessage(e.message||'Profil indisponible.');}}}>Voir le profil</button>}
      {direction==='received'?<><button className="friend-request-accept" type="button" disabled={busy} onClick={()=>respond('accept',item.id)}>Accepter</button><button type="button" disabled={busy} onClick={()=>respond('decline',item.id)}>Refuser</button></>:<button type="button" disabled={busy} onClick={()=>respond('cancel',item.id)}>Annuler la demande</button>}
      {direction==='received'&&onBlock&&<button type="button" disabled={busy} onClick={()=>onBlock(item.profile)}>Bloquer</button>}
     </div>
    </article>)}
   </div>;
  })}
 </section>;
}
