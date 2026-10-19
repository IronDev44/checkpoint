import {useMemo,useState} from 'react';
import {rediscoveryCandidates,rediscoverySelection} from '../services/rediscovery';
import {getKnownGameCover} from '../services/gameCovers';
import './Rediscovery.css';
export default function Rediscover({games=[],ratingGetter,onOpen,onPin}){
 const [offset,setOffset]=useState(0),[expanded,setExpanded]=useState(false),[busy,setBusy]=useState(''),[error,setError]=useState(''),[limit,setLimit]=useState(12);
 const candidates=useMemo(()=>rediscoveryCandidates(games,ratingGetter),[games,ratingGetter]);
 const shown=expanded?candidates.slice(0,limit):rediscoverySelection(candidates,offset),pinned=candidates.filter(c=>c.game.rediscoverPinned).length,others=candidates.length-pinned;
 const pin=async game=>{setBusy(String(game.id));setError('');try{const saved=await onPin(game.id,!game.rediscoverPinned);if(saved===false)setError('La sélection n’a pas pu être enregistrée. Réessaie.');}catch(e){setError(e.message||'La sélection n’a pas pu être enregistrée. Réessaie.');}finally{setBusy('');}};
 return <section className="rediscover home-library-card"><header><div><small>UN PLAISIR À RETROUVER</small><h3>À redécouvrir</h3></div>{!expanded&&pinned<3&&others>Math.max(0,3-pinned)&&<button className="option-pill" disabled={pinned>=3&&!expanded} onClick={()=>setOffset(n=>n+Math.max(1,3-pinned))}>Changer la sélection</button>}</header><p>Tes jeux terminés préférés, pour une nouvelle partie.</p>
 {error&&<p role="alert">{error}</p>}{!candidates.length&&<p className="rediscover-empty">Tes jeux terminés, notés au moins 8/10 ou marqués comme coups de cœur, pourront apparaître ici. Les jeux datés reviennent après environ six mois. Une partie reprise en cours est retirée de cette sélection.</p>}
 <div className="rediscover-grid">{shown.map(({game,reason,score})=>{const image=getKnownGameCover(game)||game.image;return <article className="rediscover-game" key={game.id}><button className="rediscover-open" type="button" onClick={()=>onOpen?.(game)} aria-label={`Retrouver ${game.name}`}><div className="rediscover-cover">{image?<img src={image} alt="" loading="lazy"/>:<span>{game.name.slice(0,1)}</span>}</div><div><strong>{game.name}</strong><small>{game.favorite?'Coup de cœur':`${Number(score.toFixed(1))}/10`}</small><small>{reason}</small>{game.rediscoverPinned&&<span className="rediscover-pinned">Gardé pour rejouer</span>}</div></button>{onPin&&<button className="option-pill rediscover-pin" type="button" aria-pressed={Boolean(game.rediscoverPinned)} disabled={Boolean(busy)||(!game.rediscoverPinned&&pinned>=3)} onClick={()=>pin(game)}>{busy===String(game.id)?'Enregistrement…':game.rediscoverPinned?'Retirer de ma sélection':'Garder pour rejouer'}</button>}</article>;})}</div>
 {pinned>=3&&<p className="rediscover-hint">Tes trois places sont prises. Retire un jeu pour en garder un autre.</p>}
 {candidates.length>3&&<button className="option-pill" onClick={()=>setExpanded(v=>!v)}>{expanded?'Réduire la liste':`Voir les ${candidates.length} jeux à redécouvrir`}</button>}{expanded&&candidates.length>limit&&<button className="option-pill" onClick={()=>setLimit(n=>n+12)}>Voir les suivants</button>}
 </section>;
}
