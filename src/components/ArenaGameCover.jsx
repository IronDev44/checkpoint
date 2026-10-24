import {useEffect,useRef,useState} from 'react';
import {Gamepad2} from 'lucide-react';
import {getGameCoverKey,getKnownGameCover,resolveGameCover} from '../services/gameCovers';

// Resolve only the artwork being shown, never an entire tournament roster.
export default function ArenaGameCover({game={},resolveCover=resolveGameCover,fallback,className='',alt=''}){
 const key=getGameCoverKey(game),known=getKnownGameCover(game),anchor=useRef(null);
 const [resolved,setResolved]=useState({key:'',url:'',done:false}),[failed,setFailed]=useState('');
 useEffect(()=>{
  if(known)return;
  let active=true,observer;
  const load=()=>{
   observer?.disconnect();
   Promise.resolve().then(()=>resolveCover(game)).then(url=>{
    if(active)setResolved({key,url:getKnownGameCover({cover_image:url}),done:true});
   }).catch(()=>{if(active)setResolved({key,url:'',done:true});});
  };
  if(typeof IntersectionObserver==='function'&&anchor.current){observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))load();},{rootMargin:'200px'});observer.observe(anchor.current);}else load();
  return()=>{active=false;observer?.disconnect();};
 // The key includes the title, source ID, year, platforms and existing cover.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[key,known,resolveCover]);
 const cover=known||(resolved.key===key?resolved.url:''),loading=!known&&(resolved.key!==key||!resolved.done);
 return <>{cover&&cover!==failed?<img className={className} src={cover} alt={alt} loading="lazy" decoding="async" onError={()=>setFailed(cover)}/>:<span ref={anchor} className={`arena-cover-unavailable ${className}`}>{fallback||<><Gamepad2 size={26} strokeWidth={1.3} aria-hidden="true"/><small>{loading?'Recherche de la jaquette…':'Jaquette indisponible'}</small></>}</span>}</>;
}
