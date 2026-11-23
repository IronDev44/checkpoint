import { useLanguage, getIntlLocale } from "../i18n/language";import { LocalizedMessage, LocalizedValue, LocalizedElement } from "../i18n/Localized";import { useState } from 'react';
import { SocialAvatar } from './ProfilePhoto';
import './FriendRequests.css';

export default function FriendRequests({ connections = [], busy = false, error = '', refresh, act, onOpen, onBlock }) {useLanguage();
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const respond = async (action, id) => {
    setMessage('');
    try {await act(action, { id });setMessage({ accept: 'Invitation acceptée. Vous êtes maintenant amis.', decline: 'Invitation refusée.', cancel: 'Invitation annulée.' }[action]);}
    catch {/* The shared error remains visible and the request can be retried. */}
  };
  return <LocalizedElement __as={"section"} className="friend-requests" aria-label="Invitations d’amis" aria-busy={busy}>
  <div className="friend-requests-heading"><h3><LocalizedMessage source={"Invitations d’amis"} values={[]} /></h3><button type="button" disabled={busy} onClick={refresh}><LocalizedMessage source={"Actualiser"} values={[]} /></button></div>{
    error && <p role="alert"><LocalizedValue value={error} /></p>}
    <p role="status"><LocalizedValue value={message} /></p>
  <label className="social-invitation-search"><LocalizedMessage source={"Rechercher une invitation"} values={[]} /><LocalizedElement __as={"input"} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nom ou identifiant…" /></label>
  {['received', 'sent'].map((direction) => {
      const items = connections.filter((item) => item.status === 'pending' && item.direction === direction && `${item.profile.displayName} ${item.profile.handle}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr'))).sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
      return <div key={direction}><h4><LocalizedMessage source={"" + (direction === 'received' ? 'Reçues' : 'Envoyées') + " · " + "{{0}}"} values={[items.length]} /></h4>
    {!items.length && <p><LocalizedValue value={direction === 'received' ? 'Aucune invitation reçue.' : 'Aucune invitation en attente de réponse.'} /></p>}
    {items.map((item) => <article key={item.id} className="friend-request">
     <div className="friend-request-person"><SocialAvatar name={item.profile.displayName} src={item.profile.photoURL} /><div><strong>{item.profile.displayName}</strong><small>@<LocalizedValue value={item.profile.handle} /></small></div></div>{
          item.createdAt && <small><LocalizedMessage source={"En attente depuis le {{0}}"} values={[new Date(item.createdAt).toLocaleDateString(getIntlLocale())]} /></small>}
          <div className="friend-request-actions">
      {onOpen && <button type="button" disabled={busy} onClick={async () => {try {await onOpen(item.profile.handle);} catch (e) {setMessage(e.message || 'Profil indisponible.');}}}><LocalizedMessage source={"Voir le profil"} values={[]} /></button>}
      {direction === 'received' ? <><button className="friend-request-accept" type="button" disabled={busy} onClick={() => respond('accept', item.id)}><LocalizedMessage source={"Accepter"} values={[]} /></button><button type="button" disabled={busy} onClick={() => respond('decline', item.id)}><LocalizedMessage source={"Refuser"} values={[]} /></button></> : <button type="button" disabled={busy} onClick={() => respond('cancel', item.id)}><LocalizedMessage source={"Annuler la demande"} values={[]} /></button>}
      {direction === 'received' && onBlock && <button type="button" disabled={busy} onClick={() => onBlock(item.profile)}><LocalizedMessage source={"Bloquer"} values={[]} /></button>}
     </div>
    </article>)}
   </div>;
    })}
 </LocalizedElement>;
}
