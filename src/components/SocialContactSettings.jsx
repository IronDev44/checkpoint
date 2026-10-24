import {useState} from 'react';
import ToolDialog from './ToolDialog';
import './FriendRequests.css';
export function BlockPlayerDialog({player,controls,onClose,onBlocked}){
 const [error,setError]=useState('');
 if(!player)return null;
 return <ToolDialog title={`Bloquer ${player.displayName||player.handle} ?`} busy={controls.busy} onClose={onClose}>
  <p>Ce joueur ne pourra plus t’envoyer d’invitation, de recommandation, de défi ni réagir à tes activités. Vos profils et vos échanges seront masqués l’un pour l’autre. Il sera retiré de tes amis.</p>
  <p>Tu pourras le débloquer dans Social → Amis → Contacts et confidentialité.</p>
  {error&&<p role="alert">{error}</p>}
  <div className="friend-request-actions"><button type="button" className="option-pill" disabled={controls.busy} onClick={onClose}>Annuler</button><button type="button" className="option-pill" disabled={controls.busy} onClick={async()=>{try{await controls.act('block',{handle:player.handle});onBlocked?.();onClose();}catch(e){setError(e.message);}}}>Bloquer ce joueur</button></div>
 </ToolDialog>;
}
export default function SocialContactSettings({controls}){
 const {data,error,busy,refresh,act}=controls;
 return <details className="friend-requests social-contact-settings"><summary>Contacts et confidentialité</summary>
  <p>Les recommandations, défis et réactions sont réservés aux amis confirmés. Tu peux désactiver chaque type de contact.</p>
  {error&&<p role="alert">{error}</p>}
  {!data?<button type="button" disabled={busy} onClick={refresh}>Charger les réglages</button>:<>
   {Object.entries({invitations:'Recevoir des invitations d’amis',recommendations:'Recevoir des recommandations',challenges:'Recevoir des défis',reactions:'Recevoir des réactions',sharedLibrary:'Partager ma collection avec mes amis pour comparer nos jeux'}).map(([key,label])=><label className="social-contact-choice" key={key}><input type="checkbox" checked={!!data.preferences[key]} disabled={busy} onChange={async e=>{try{await act('preferences',{preferences:{[key]:e.target.checked}});}catch{/* Shown above. */}}}/>{label}</label>)}
   <p>Le partage de collection est désactivé au départ. Si tu l’actives, seuls tes amis confirmés voient les titres, plateformes, modes de jeu et statuts. Tes notes, avis et souvenirs privés ne sont pas partagés.</p>
   <h4>Joueurs bloqués · {data.blocked.length}</h4>
   {!data.blocked.length&&<p>Aucun joueur bloqué.</p>}
   {data.blocked.map(player=><div className="friend-request" key={player.handle}><strong>{player.displayName} · @{player.handle}</strong><button type="button" disabled={busy} onClick={async()=>{try{await act('unblock',{handle:player.handle});}catch{/* Shown above. */}}}>Débloquer</button></div>)}
   <p>Débloquer un joueur ne le rajoute pas à tes amis.</p>
   <h4>Amis masqués dans le fil · {(data.muted||[]).length}</h4>
   <p>Ces joueurs restent tes amis et peuvent toujours échanger avec toi.</p>
   {(data.muted||[]).map(player=><div className="friend-request" key={player.handle}><strong>{player.displayName} · @{player.handle}</strong><button type="button" disabled={busy} onClick={async()=>{try{await act('unmute',{handle:player.handle});}catch{/* Shown above. */}}}>Réafficher dans le fil</button></div>)}
  </>}
 </details>;
}
