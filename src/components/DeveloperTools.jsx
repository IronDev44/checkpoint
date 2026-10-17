import { useId, useState } from "react";
import { ownerUid } from "../services/accountConfig";
import "./DeveloperTools.css";

const sections = [{id:"tests",label:"Tests"},{id:"events",label:"Lives et actus"},{id:"feedback",label:"Retours"}];
export default function DeveloperTools({accountUid,tests,events,feedback}) {
  const [section,setSection]=useState("tests");
  const [visited,setVisited]=useState(["tests"]);
  const [unlocked,setUnlocked]=useState(false);
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const id=useId();
  if (!ownerUid || accountUid !== ownerUid) return null;
  function unlock(event) {
    event.preventDefault();
    if(password!=="1102"){setError("Code incorrect.");return;}
    setUnlocked(true);setPassword("");setError("");
  }
  function lock(){setUnlocked(false);setSection("tests");setVisited(["tests"]);setPassword("");setError("");}
  if(!unlocked) return <form className="developer-access-form" onSubmit={unlock}>
    <label htmlFor={`${id}-code`}>Code de l’espace développeur</label>
    <input id={`${id}-code`} type="password" inputMode="numeric" autoComplete="off" required value={password} aria-describedby={error?`${id}-error`:undefined} onChange={event=>{setPassword(event.target.value);setError("");}}/>
    {error&&<p id={`${id}-error`} role="alert">{error}</p>}
    <button type="submit" className="checkpoint-primary-action">Déverrouiller</button>
  </form>;
  const panels={tests,events,feedback};
  return <div className="developer-tools">
    <div className="developer-tools-head"><span>Espace développeur</span><button type="button" className="option-pill" onClick={lock}>Verrouiller</button></div>
    <div className="developer-tools-nav" role="group" aria-label="Rubriques développeur">
      {sections.map(item=><button type="button" key={item.id} className={`option-pill${section===item.id?' active':''}`} aria-pressed={section===item.id} aria-controls={`${id}-${item.id}`} onClick={()=>{setSection(item.id);setVisited(current=>current.includes(item.id)?current:[...current,item.id]);}}>{item.label}</button>)}
    </div>
    {sections.map(item=><section key={item.id} id={`${id}-${item.id}`} className="developer-tool-panel" aria-label={item.label} hidden={section!==item.id}>{visited.includes(item.id)&&panels[item.id]}</section>)}
  </div>;
}
