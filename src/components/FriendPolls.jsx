import {useEffect,useState} from 'react';
import ToolDialog from './ToolDialog';
import {pollRequest} from '../services/friendPolls';
import './MonthlySocial.css';
export default function FriendPolls({games=[],friends=[],request=pollRequest,targetId}){
 const [polls,setPolls]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[busy,setBusy]=useState(false),[creating,setCreating]=useState(false),[gameIds,setGameIds]=useState([]),[handles,setHandles]=useState([]),[query,setQuery]=useState(''),[removing,setRemoving]=useState(''),[draftId,setDraftId]=useState('');
 useEffect(()=>{let active=true;request().then(data=>{if(active){setPolls(data.polls||[]);setError('');}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[request]);
 useEffect(()=>{if(!targetId||loading)return;const article=document.getElementById(`friend-poll-${targetId}`);article?.scrollIntoView?.({block:'center'});article?.focus({preventScroll:true});},[targetId,loading,polls]);
 const refresh=async()=>{setLoading(true);setError('');try{setPolls((await request()).polls||[]);}catch(e){setError(e.message);}finally{setLoading(false);}};
 const mutate=async(action,payload)=>{setBusy(true);setError('');try{const data=await request(action,payload);setPolls(old=>action==='delete'?old.filter(p=>p.id!==payload.id):[data.poll,...old.filter(p=>p.id!==data.poll.id)]);window.dispatchEvent(new Event('checkpoint-polls-changed'));if(action==='create'){setCreating(false);setGameIds([]);setHandles([]);}setRemoving('');}catch(e){setError(e.message);}finally{setBusy(false);}};
 const toggle=(value,list,set)=>set(list.includes(value)?list.filter(v=>v!==value):[...list,value]);
 const candidates=games.filter(g=>g.name&&g.name.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr')));
 const errorNotice=error&&<p role="alert">{error}</p>;
 return <section className="friend-polls">
  <header><div><h3>Je commence lequel ?</h3><p>Deux à quatre jeux. Tes amis t’aident à choisir.</p></div><div className="monthly-actions"><button className="option-pill" disabled={loading||busy} onClick={refresh}>Actualiser</button><button className="option-pill active" onClick={()=>{setDraftId(crypto.randomUUID());setCreating(true);setError('');}} disabled={busy}>Créer un sondage</button></div></header>
  {!creating&&errorNotice}{loading&&<p role="status">Chargement des sondages…</p>}
  {!loading&&targetId&&!polls.some(p=>p.id===targetId)&&!error&&<p role="status">Ce sondage n’est plus disponible. Retrouve les autres ci-dessous.</p>}
  {!loading&&!polls.length&&!error&&<p>Ton prochain jeu hésite entre plusieurs titres ? Lance le premier vote avec tes amis.</p>}
  {polls.map(poll=><article className={`friend-poll ${targetId===poll.id?"poll-target":""}`} id={`friend-poll-${poll.id}`} tabIndex={-1} key={poll.id}><header><div><small>{poll.isOwner?'Ton sondage':poll.author}</small><h4>{poll.title}</h4></div><span>{poll.closed?'Terminé':`Jusqu’au ${new Date(poll.endsAt).toLocaleDateString('fr-FR')}`}</span></header>
   <div className="poll-choices">{poll.options.map((option,index)=>{const count=poll.counts[index]||0,percent=poll.total?Math.round(count/poll.total*100):0;return <button key={index} className="poll-choice" disabled={busy||poll.closed||poll.isOwner} aria-pressed={poll.myVote===index} onClick={()=>mutate('vote',{id:poll.id,choice:index})}><span className="poll-meter" style={{width:`${percent}%`}}/><span><strong>{poll.myVote===index?'✓ ':''}{option.name}</strong><small>{percent} % · {count} vote{count>1?'s':''}</small></span></button>;})}</div>
   <footer><small>{poll.total} participant{poll.total>1?'s':''}{!poll.isOwner&&!poll.closed?' · Tu peux changer ton vote.':''}</small>{poll.isOwner&&<div className="monthly-actions">{!poll.closed&&<button className="option-pill" disabled={busy} onClick={()=>mutate('close',{id:poll.id})}>Clore le vote</button>}<button className="option-pill" disabled={busy} onClick={()=>setRemoving(poll.id)}>Supprimer</button></div>}</footer>
   {removing===poll.id&&<div className="poll-delete"><p>Supprimer ce sondage et ses votes ?</p><button className="option-pill" disabled={busy} onClick={()=>mutate('delete',{id:poll.id})}>Confirmer la suppression</button><button className="option-pill" disabled={busy} onClick={()=>setRemoving('')}>Annuler</button></div>}
  </article>)}
  {creating&&<ToolDialog title="Demander à mes amis" onClose={()=>{if(!busy)setCreating(false);}} busy={busy} footer={<button className="option-pill active" disabled={busy||gameIds.length<2||!handles.length} onClick={()=>mutate('create',{id:draftId,gameIds,handles})}>{busy?'Envoi…':'Lancer le sondage pour 7 jours'}</button>}>
   <div className="poll-composer">{errorNotice}<p>Seuls les amis sélectionnés verront ce sondage. Les titres choisis leur seront montrés, même si ta collection est privée.</p><label>Rechercher dans mes jeux<input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label><h4>Choisir 2 à 4 jeux · {gameIds.length}/4</h4>
   {gameIds.length>0&&<p>Ta sélection : {gameIds.map(id=>games.find(g=>String(g.id)===id)?.name).filter(Boolean).join(' · ')}</p>}
   <div className="poll-selector">{candidates.map(game=><label key={game.id}><input type="checkbox" checked={gameIds.includes(String(game.id))} disabled={busy||(!gameIds.includes(String(game.id))&&gameIds.length>=4)} onChange={()=>toggle(String(game.id),gameIds,setGameIds)}/><span>{game.name}</span></label>)}</div>
   {!candidates.length&&<p>Aucun jeu trouvé. Ajoute d’abord des jeux à ta bibliothèque.</p>}<h4>Inviter mes amis · {handles.length}</h4><div className="poll-selector">{friends.map(friend=><label key={friend.handle}><input type="checkbox" checked={handles.includes(friend.handle)} disabled={busy||(!handles.includes(friend.handle)&&handles.length>=50)} onChange={()=>toggle(friend.handle,handles,setHandles)}/><span>{friend.displayName||friend.handle} <small>@{friend.handle}</small></span></label>)}</div>{!friends.length&&<p>Ajoute un ami dans le Social pour lui demander son avis.</p>}</div>
  </ToolDialog>}
 </section>;
}
