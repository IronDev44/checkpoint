import './ProfileVisibilityChoices.css';
import {useRef,useState} from 'react';
export default function ProfileVisibilityChoices({value,onChange}){
 const [pending,setPending]=useState(''),[error,setError]=useState('');const lock=useRef(false);
 const current=['public','friends'].includes(value)?value:'prive';
 async function change(mode){
  if(lock.current||mode===current)return;lock.current=true;setPending(mode);setError('');
  try{const result=await onChange(mode);if(result?.ok===false)setError(result.message||'Le profil n’a pas pu être modifié. Réessaie.');}
  catch(e){setError(e.message||'Le profil n’a pas pu être modifié. Réessaie.');}
  finally{lock.current=false;setPending('');}
 }
 return <><div className="profile-visibility-choices" role="group" aria-label="Visibilité du profil" aria-busy={Boolean(pending)}>
  {[['prive','Privé'],['friends','Amis uniquement'],['public','Public']].map(([mode,label])=><button type="button" key={mode} disabled={Boolean(pending)} className={`option-pill ${current===mode?'active':''}`} aria-pressed={current===mode} onClick={()=>change(mode)}>{pending===mode?'Enregistrement…':label}</button>)}
 </div>{error&&<p role="alert" className="option-value">{error}</p>}</>;
}
