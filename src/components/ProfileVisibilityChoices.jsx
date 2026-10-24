import './ProfileVisibilityChoices.css';
export default function ProfileVisibilityChoices({value,onChange}){
 return <div className="profile-visibility-choices" role="group" aria-label="Visibilité du profil">
  {[['prive','Privé'],['friends','Amis uniquement'],['public','Public']].map(([mode,label])=><button type="button" key={mode} className={`option-pill ${value===mode||(mode==='prive'&&!['public','friends'].includes(value))?'active':''}`} aria-pressed={value===mode||(mode==='prive'&&!['public','friends'].includes(value))} onClick={()=>onChange(mode)}>{label}</button>)}
 </div>;
}
