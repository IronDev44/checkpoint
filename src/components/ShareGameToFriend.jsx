import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedValue } from "../i18n/Localized";import { useRef, useState } from 'react';
import ToolDialog from './ToolDialog';
import { recommendationRequest } from '../services/rendezvousRequest';
import { newExperienceId } from '../services/experiences';
export default function ShareGameToFriend({ game, friends = [] }) {useLanguage();
  const [draft, setDraft] = useState(null),[busy, setBusy] = useState(false),[error, setError] = useState(''),[message, setMessage] = useState('');
  const pending = useRef(false);
  if (!game || game.status === 'wishlist') return null;
  return <><button type="button" className="option-pill" onClick={() => {setDraft({ id: newExperienceId(), handle: friends[0]?.handle || '', message: '' });setError('');setMessage('');}}><LocalizedMessage source={"Partager à un ami"} values={[]} /></button>
  {message && <p role="status"><LocalizedValue value={message} /></p>}
  {draft && <ToolDialog title="Partager ce jeu à un ami" busy={busy} onClose={() => setDraft(null)}>
   <h3>{game.name}</h3><p><LocalizedMessage source={"Seuls le titre et ton message seront envoyés. Tes notes et ton avis privé restent dans ton espace."} values={[]} /></p>
   {!friends.length ? <p><LocalizedMessage source={"Invite d’abord un joueur dans Social → Amis."} values={[]} /></p> : <form className="rendezvous-form" onSubmit={async (e) => {
        e.preventDefault();if (pending.current) return;pending.current = true;setBusy(true);setError('');
        try {await recommendationRequest('create', { ...draft, gameId: String(game.id) });setDraft(null);setMessage('Jeu partagé. Retrouve cet échange dans Social → Recommandations.');window.dispatchEvent(new Event('checkpoint-rendezvous-changed'));}
        catch (err) {setError(err.message);} finally {pending.current = false;setBusy(false);}
      }}>{
        error && <p role="alert"><LocalizedValue value={error} /></p>}
        <label><LocalizedMessage source={"À qui ?"} values={[]} /><select value={draft.handle} disabled={busy} onChange={(e) => setDraft({ ...draft, handle: e.target.value })}>{friends.map((friend) => <option value={friend.handle} key={friend.handle}>{friend.displayName || friend.handle}</option>)}</select></label>
    <label><LocalizedMessage source={"Ton petit mot"} values={[]} /><textarea required maxLength={500} value={draft.message} disabled={busy} onChange={(e) => setDraft({ ...draft, message: e.target.value })} placeholder="Pourquoi ce jeu pourrait lui plaire…" /></label>
    <button type="submit" className="option-pill" disabled={busy || !draft.handle || !draft.message.trim()}><LocalizedValue value={busy ? 'Envoi…' : 'Envoyer à mon ami'} /></button>
   </form>}
  </ToolDialog>}
 </>;
}
