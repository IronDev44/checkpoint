import {useEffect,useState} from 'react';
import ToolDialog from './ToolDialog';
import FriendComparison from './FriendComparison';
import {friendshipRequest} from '../services/friendships';
export default function FriendCommonGames({friend,games,onClose,onOpenGame}){
 const [data,setData]=useState(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;setData(null);setError('');friendshipRequest('list',{handle:friend.handle},'sharedGames').then(value=>{if(active)setData(value);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[friend.handle,retry]);
 return <ToolDialog title={`Nos jeux en commun · ${friend.displayName||friend.handle}`} onClose={onClose}>
  {!data&&!error&&<p role="status">Comparaison des collections…</p>}
  {error&&<><p role="alert">{error}</p><button type="button" className="option-pill" onClick={()=>setRetry(n=>n+1)}>Réessayer</button></>}
  {data&&!data.shared&&<p>Ton ami n’a pas activé le partage de sa collection. Il peut le faire dans Social → Amis → Contacts et confidentialité. Sa vitrine publique reste consultable depuis son profil.</p>}
  {data?.shared&&<FriendComparison embedded games={games} profile={{...friend,visibility:'public',sharedLibrary:true,sharedGames:data.games}} onOpenGame={game=>{onClose();onOpenGame?.(game);}}/>}
 </ToolDialog>;
}
