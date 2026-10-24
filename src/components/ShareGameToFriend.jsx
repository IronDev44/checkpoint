import {useRef,useState} from 'react';
import ToolDialog from './ToolDialog';
import {recommendationRequest} from '../services/rendezvousRequest';
import {newExperienceId} from '../services/experiences';
export default function ShareGameToFriend({game,friends=[]}){
 const [draft,setDraft]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const pending=useRef(false);
 if(!game||game.status==='wishlist')return null;
 return <><button type="button" className="option-pill" onClick={()=>{setDraft({id:newExperienceId(),handle:friends[0]?.handle||'',message:''});setError('');setMessage('');}}>Partager à un ami</button>
  {message&&<p role="status">{message}</p>}
  {draft&&<ToolDialog title="Partager ce jeu à un ami" busy={busy} onClose={()=>setDraft(null)}>
   <h3>{game.name}</h3><p>Seuls le titre et ton message seront envoyés. Tes notes et ton avis privé restent dans ton espace.</p>
   {!friends.length?<p>Invite d’abord un joueur dans Social → Amis.</p>:<form className="rendezvous-form" onSubmit={async e=>{
    e.preventDefault();if(pending.current)return;pending.current=true;setBusy(true);setError('');
    try{await recommendationRequest('create',{...draft,gameId:String(game.id)});setDraft(null);setMessage('Jeu partagé. Retrouve cet échange dans Social → Recommandations.');window.dispatchEvent(new Event('checkpoint-rendezvous-changed'));}
    catch(err){setError(err.message);}finally{pending.current=false;setBusy(false);}
   }}>
    {error&&<p role="alert">{error}</p>}
    <label>À qui ?<select value={draft.handle} disabled={busy} onChange={e=>setDraft({...draft,handle:e.target.value})}>{friends.map(friend=><option value={friend.handle} key={friend.handle}>{friend.displayName||friend.handle}</option>)}</select></label>
    <label>Ton petit mot<textarea required maxLength={500} value={draft.message} disabled={busy} onChange={e=>setDraft({...draft,message:e.target.value})} placeholder="Pourquoi ce jeu pourrait lui plaire…"/></label>
    <button type="submit" className="option-pill" disabled={busy||!draft.handle||!draft.message.trim()}>{busy?'Envoi…':'Envoyer à mon ami'}</button>
   </form>}
  </ToolDialog>}
 </>;
}
