import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedElement, LocalizedValue } from "../i18n/Localized";import CatalogImage from './CatalogImage';
import { useEffect, useRef, useState, useId } from 'react';
import { searchPublicProfiles } from '../services/profileSearch';
import './ProfileSearch.css';
export default function ProfileSearch({ onOpen, onInvite, connections = [], canInvite = true }) {useLanguage();
  const [query, setQuery] = useState(''),[result, setResult] = useState(null),[busy, setBusy] = useState(false),[action, setAction] = useState(''),[error, setError] = useState(''),[message, setMessage] = useState('');
  const request = useRef(null),version = useRef(0),alive = useRef(true),acting = useRef(false),id = useId();
  useEffect(() => {alive.current = true;return () => {alive.current = false;request.current?.abort();version.current++;};}, []);
  const edit = (value) => {request.current?.abort();version.current++;setBusy(false);setQuery(value);setResult(null);setError('');setMessage('');};
  async function search(e) {e.preventDefault();const term = query.trim();if (term.replace(/^@/, '').length < 2) {setError('Entre au moins 2 caractères.');return;}
    request.current?.abort();const controller = new AbortController();request.current = controller;const current = ++version.current;setBusy(true);setError('');setResult(null);
    const timer = setTimeout(() => controller.abort(new DOMException('Délai dépassé', 'TimeoutError')), 15000);
    try {const data = await searchPublicProfiles(term, controller.signal);if (alive.current && version.current === current) setResult(data);}
    catch (e) {if (alive.current && version.current === current) setError(['AbortError', 'TimeoutError'].includes(e.name) ? 'La recherche prend trop de temps. Réessaie.' : e.message);} finally
    {clearTimeout(timer);if (alive.current && version.current === current) setBusy(false);}
  }
  async function act(profile, invite) {if (profile.private || acting.current) return;acting.current = true;setAction(profile.handle);setError('');setMessage('');
    try {if (invite) {const result = await onInvite(profile.handle);if (result?.ok === false) throw Error(result.message);if (alive.current) setMessage(result?.message || 'Invitation envoyée.');} else await onOpen(profile.handle);}
    catch (e) {if (alive.current) setError(e.message || 'Ce profil n’est plus disponible. Réessaie.');} finally
    {acting.current = false;if (alive.current) setAction('');}
  }
  return <LocalizedElement __as={"section"} className="profile-search" aria-label="Rechercher des profils"><h3><LocalizedMessage source={"Rechercher un profil"} values={[]} /></h3><p><LocalizedMessage source={"Retrouve un joueur avec son pseudo. Un profil privé affiche uniquement son pseudo : tu ne peux ni le consulter ni lui envoyer une invitation."} values={[]} /></p>
  <form onSubmit={search}><label htmlFor={id}><LocalizedMessage source={"Pseudo ou identifiant"} values={[]} /></label><div><LocalizedElement __as={"input"} id={id} type="search" value={query} maxLength={60} onChange={(e) => edit(e.target.value)} placeholder="Pseudo ou @identifiant" /><button type="submit" className="option-pill" disabled={busy}><LocalizedValue value={busy ? 'Recherche…' : 'Rechercher'} /></button></div></form>
  {error && <p role="alert"><LocalizedValue value={error} /></p>}{message && <p role="status"><LocalizedValue value={message} /></p>}
  {result && <><p role="status"><LocalizedValue value={result.profiles.length ? `${result.profiles.length} profil${result.profiles.length > 1 ? 's' : ''} trouvé${result.profiles.length > 1 ? 's' : ''}` : 'Aucun joueur trouvé. Vérifie le pseudo ou précise ta recherche.'} /></p>
   <ul>{result.profiles.map((profile) => {
          const relation = connections.find((c) => c.profile.handle === profile.handle),accepted = relation?.status === 'accepted',pending = relation?.status === 'pending';
          return <li key={profile.handle}>
     <div className="profile-search-identity">{
              !profile.private && profile.photoURL && <CatalogImage src={profile.photoURL} alt="" loading="lazy" />}
              <span><strong>{profile.displayName}</strong>{!profile.private && <small>@<LocalizedValue value={profile.handle} /></small>}</span>
     </div>
     <div className="profile-search-actions">{profile.private ? <span><LocalizedMessage source={"Profil privé · Consultation et invitations indisponibles" + (profile.self ? ' · Ton profil' : '')} values={[]} /></span> : <>
      <LocalizedElement __as={"button"} type="button" className="option-pill" disabled={Boolean(action)} onClick={() => act(profile, false)} __messages={{ "aria-label": { source: "Voir le profil de {{0}}", values: [profile.displayName], preserve: [0] } }}><LocalizedValue value={action === profile.handle ? 'Chargement…' : 'Voir le profil'} /></LocalizedElement>
      {profile.self || accepted || pending ? <span><LocalizedValue value={profile.self ? 'Ton profil' : accepted ? 'Déjà amis' : relation.direction === 'received' ? 'Invitation reçue' : 'Invitation envoyée'} /></span> : <LocalizedElement __as={"button"} type="button" className="option-pill" disabled={!canInvite || Boolean(action)} onClick={() => act(profile, true)} __messages={{ "aria-label": { source: "Inviter {{0}}", values: [profile.displayName], preserve: [0] } }}><LocalizedMessage source="Inviter" values={[]}/></LocalizedElement>}
     </>}</div>
    </li>;
        })}</ul>
   {result.limited && <p><LocalizedMessage source={"Les résultats sont limités. Précise le pseudo ou utilise son @identifiant exact."} values={[]} /></p>}
  </>}
 </LocalizedElement>;
}
