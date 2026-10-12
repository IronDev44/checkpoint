import { useState } from "react";
import { feedbackRequest } from "../services/testerFeedback";
import "./TesterFeedback.css";

const labels = {new:"Nouveau",progress:"En cours",resolved:"Résolu"};
export default function FeedbackInbox() {
  const [secret,setSecret]=useState("");const [authorized,setAuthorized]=useState(false);
  const [items,setItems]=useState([]);const [cursor,setCursor]=useState(null);const [filter,setFilter]=useState("all");
  const [busy,setBusy]=useState(false);const [error,setError]=useState("");
  async function load(more=false) {if(busy)return;setBusy(true);setError("");try{const data=await feedbackRequest("/api/feedback/admin"+(more&&cursor?"?cursor="+encodeURIComponent(cursor):""),{secret});setItems(current=>more?[...current,...data.items]:data.items);setCursor(data.cursor);setAuthorized(true);}catch(e){setError(e.message);}finally{setBusy(false);}}
  async function update(item,status) {setBusy(true);setError("");try{await feedbackRequest("/api/feedback/admin",{method:"PATCH",secret,body:{id:item.id,status}});setItems(current=>current.map(row=>row.id===item.id?{...row,status}:row));}catch(e){setError(e.message);}finally{setBusy(false);}}
  return <section className="tester-feedback search-panel"><h2>Retours des testeurs</h2>
    {!authorized?<form onSubmit={e=>{e.preventDefault();load();}}><label>Code privé de la boîte de réception<input type="password" autoComplete="off" required value={secret} onChange={e=>setSecret(e.target.value)} /></label><button className="checkpoint-primary-action" disabled={busy} type="submit">{busy?"Connexion…":"Ouvrir la boîte"}</button></form>:<>
      <div className="feedback-inbox-tools"><select aria-label="Filtrer les retours" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Tous les retours</option>{Object.entries(labels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select><button type="button" disabled={busy} onClick={()=>load()}>Actualiser</button><button type="button" disabled={busy} onClick={()=>{setAuthorized(false);setSecret("");setItems([]);setError("");setCursor(null);}}>Verrouiller</button></div>
      {items.filter(item=>filter==="all"||item.status===filter).map(item=><article className="feedback-inbox-card" key={item.id}><div className="feedback-inbox-meta"><strong>{{bug:"Bug",idea:"Idée",visual:"Rendu visuel"}[item.category]} · {item.screen}</strong><time>{new Date(item.createdAt).toLocaleString("fr-FR")}</time></div><p>{item.message}</p>{item.expected&&<p><strong>Attendu : </strong>{item.expected}</p>}<small>{item.name||"Anonyme"} · {item.context?.theme} · {item.context?.viewport}</small><small>{item.context?.platform}</small><label>Suivi<select disabled={busy} value={item.status} onChange={e=>update(item,e.target.value)}>{Object.entries(labels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label></article>)}
      {!items.length&&<p>Aucun retour pour le moment.</p>}{items.length>0&&!items.some(item=>filter==="all"||item.status===filter)&&<p>Aucun retour avec ce statut dans les messages chargés.</p>}
      {cursor&&<button type="button" disabled={busy} onClick={()=>load(true)}>Charger les retours suivants</button>}
    </>}
    <p role="status" className="tester-feedback-status">{error}</p>
  </section>;
}

