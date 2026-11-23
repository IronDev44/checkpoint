import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedValue } from "../i18n/Localized";import { useState } from 'react';
import ToolDialog from './ToolDialog';
import './FriendRequests.css';
export function BlockPlayerDialog({ player, controls, onClose, onBlocked }) {useLanguage();
  const [error, setError] = useState('');
  if (!player) return null;
  return <ToolDialog title={`Bloquer ${player.displayName || player.handle} ?`} busy={controls.busy} onClose={onClose}>
  <p><LocalizedMessage source={"Ce joueur ne pourra plus t’envoyer d’invitation, de recommandation, de défi ni réagir à tes activités. Vos profils et vos échanges seront masqués l’un pour l’autre. Il sera retiré de tes amis."} values={[]} /></p>
  <p><LocalizedMessage source={"Tu pourras le débloquer dans Social → Amis → Contacts et confidentialité."} values={[]} /></p>{
    error && <p role="alert"><LocalizedValue value={error} /></p>}
    <div className="friend-request-actions"><button type="button" className="option-pill" disabled={controls.busy} onClick={onClose}><LocalizedMessage source={"Annuler"} values={[]} /></button><button type="button" className="option-pill" disabled={controls.busy} onClick={async () => {try {await controls.act('block', { handle: player.handle });onBlocked?.();onClose();} catch (e) {setError(e.message);}}}><LocalizedMessage source={"Bloquer ce joueur"} values={[]} /></button></div>
 </ToolDialog>;
}
export default function SocialContactSettings({ controls }) {useLanguage();
  const { data, error, busy, refresh, act } = controls;
  return <details className="friend-requests social-contact-settings"><summary><LocalizedMessage source={"Contacts et confidentialité"} values={[]} /></summary>
  <p><LocalizedMessage source={"Les recommandations, défis et réactions sont réservés aux amis confirmés. Tu peux désactiver chaque type de contact."} values={[]} /></p>
  {error && <p role="alert"><LocalizedValue value={error} /></p>}
  {!data ? <button type="button" disabled={busy} onClick={refresh}><LocalizedMessage source={"Charger les réglages"} values={[]} /></button> : <>
   {Object.entries({ invitations: 'Recevoir des invitations d’amis', recommendations: 'Recevoir des recommandations', challenges: 'Recevoir des défis', reactions: 'Recevoir des réactions', sharedLibrary: 'Partager ma collection avec mes amis pour comparer nos jeux' }).map(([key, label]) => <label className="social-contact-choice" key={key}><input type="checkbox" checked={!!data.preferences[key]} disabled={busy} onChange={async (e) => {try {await act('preferences', { preferences: { [key]: e.target.checked } });} catch {/* Shown above. */}}} /><LocalizedValue value={label} /></label>)}
   <p><LocalizedMessage source={"Le partage de collection est désactivé au départ. Si tu l’actives, seuls tes amis confirmés voient les titres, plateformes, modes de jeu et statuts. Tes notes, avis et souvenirs privés ne sont pas partagés."} values={[]} /></p>
   <h4><LocalizedMessage source={"Joueurs bloqués · {{0}}"} values={[data.blocked.length]} /></h4>
   {!data.blocked.length && <p><LocalizedMessage source={"Aucun joueur bloqué."} values={[]} /></p>}
   {data.blocked.map((player) => <div className="friend-request" key={player.handle}><strong>{player.displayName} · @<LocalizedValue value={player.handle} /></strong><button type="button" disabled={busy} onClick={async () => {try {await act('unblock', { handle: player.handle });} catch {/* Shown above. */}}}><LocalizedMessage source={"Débloquer"} values={[]} /></button></div>)}
   <p><LocalizedMessage source={"Débloquer un joueur ne le rajoute pas à tes amis."} values={[]} /></p>
   <h4><LocalizedMessage source={"Amis masqués dans le fil · {{0}}"} values={[(data.muted || []).length]} /></h4>
   <p><LocalizedMessage source={"Ces joueurs restent tes amis et peuvent toujours échanger avec toi."} values={[]} /></p>
   {(data.muted || []).map((player) => <div className="friend-request" key={player.handle}><strong>{player.displayName} · @<LocalizedValue value={player.handle} /></strong><button type="button" disabled={busy} onClick={async () => {try {await act('unmute', { handle: player.handle });} catch {/* Shown above. */}}}><LocalizedMessage source={"Réafficher dans le fil"} values={[]} /></button></div>)}
  </>}
 </details>;
}
