import { useId, useState } from "react";
import { ownerUid } from "../services/accountConfig";
import "./DeveloperTools.css";

const sections = [{id:"tests",label:"Tests"},{id:"events",label:"Lives et actus"},{id:"feedback",label:"Retours"}];
export default function DeveloperTools({accountUid,tests,events,feedback}) {
  const [section,setSection]=useState("tests");
  const id=useId();
  if (!ownerUid || accountUid !== ownerUid) return null;
  const panels={tests,events,feedback};
  return <div className="developer-tools">
    <div className="developer-tools-nav" role="group" aria-label="Rubriques développeur">
      {sections.map(item=><button type="button" key={item.id} className={`option-pill${section===item.id?' active':''}`} aria-pressed={section===item.id} aria-controls={`${id}-${item.id}`} onClick={()=>setSection(item.id)}>{item.label}</button>)}
    </div>
    {sections.map(item=><section key={item.id} id={`${id}-${item.id}`} className="developer-tool-panel" aria-label={item.label} hidden={section!==item.id}>{panels[item.id]}</section>)}
  </div>;
}
