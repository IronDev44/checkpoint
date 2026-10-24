import { useCallback, useEffect, useRef, useState } from "react";
import { adminFeedbackRequest } from "../services/testerFeedback";
import "./TesterFeedback.css";

const labels = {new:"Nouveau",progress:"En cours",resolved:"Résolu"};
export default function FeedbackInbox() {
  const [items,setItems]=useState([]);const [cursor,setCursor]=useState(null);const [filter,setFilter]=useState("all");
  const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [loaded,setLoaded]=useState(false);
  const [deleteId,setDeleteId]=useState(null);
  const pending=useRef(false);const pageCursor=useRef(null);const controller=useRef(null);
  const load=useCallback(async(more=false)=>{
    if(pending.current)return;
    pending.current=true;setBusy(true);setError("");
    const request=new AbortController();controller.current=request;
    try {
      const data=await adminFeedbackRequest("/api/feedback/admin"+(more&&pageCursor.current?"?cursor="+encodeURIComponent(pageCursor.current):""),{signal:request.signal});
      if(request.signal.aborted)return;
      setItems(current=>more?[...current,...data.items]:data.items);
      pageCursor.current=data.cursor;setCursor(data.cursor);setLoaded(true);
    } catch(e){if(!request.signal.aborted)setError(e.message);}
    finally{if(!request.signal.aborted){pending.current=false;setBusy(false);}}
  },[]);
  useEffect(()=>{load();return()=>{controller.current?.abort();pending.current=false;};},[load]);
  async function update(item,status) {
    if(pending.current)return;
    pending.current=true;setBusy(true);setError("");
    const request=new AbortController();controller.current=request;
    try {
      await adminFeedbackRequest("/api/feedback/admin",{method:"PATCH",body:{id:item.id,status},signal:request.signal});
      if(!request.signal.aborted)setItems(current=>current.map(row=>row.id===item.id?{...row,status}:row));
    } catch(e){if(!request.signal.aborted)setError(e.message);}
    finally{if(!request.signal.aborted){pending.current=false;setBusy(false);}}
  }
  async function remove(item) {
    if(pending.current)return;
    pending.current=true;setBusy(true);setError("");
    const request=new AbortController();controller.current=request;
    try {
      await adminFeedbackRequest("/api/feedback/admin",{method:"DELETE",body:{id:item.id},signal:request.signal});
      if(!request.signal.aborted){
        setItems(current=>current.filter(row=>row.id!==item.id));
        setDeleteId(null);
      }
    } catch(e){if(!request.signal.aborted)setError(e.message);}
    finally{if(!request.signal.aborted){pending.current=false;setBusy(false);}}
  }
  return <section className="tester-feedback search-panel"><h2>Retours des testeurs</h2>
    <div className="feedback-inbox-tools"><select aria-label="Filtrer les retours" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Tous les retours</option>{Object.entries(labels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select><button type="button" disabled={busy} onClick={()=>load()}>{busy?"Chargement…":"Actualiser"}</button></div>
    {items.filter(item=>filter==="all"||item.status===filter).map(item=><article className="feedback-inbox-card" key={item.id}><div className="feedback-inbox-meta"><strong>{{bug:"Bug",idea:"Idée",visual:"Rendu visuel"}[item.category]} · {item.screen}</strong><time>{new Date(item.createdAt).toLocaleString("fr-FR")}</time></div><p>{item.message}</p>{item.expected&&<p><strong>Attendu : </strong>{item.expected}</p>}<small>{item.name||"Anonyme"} · {item.context?.theme} · {item.context?.viewport}</small><small>{item.context?.platform}</small><label>Suivi<select disabled={busy} value={item.status} onChange={e=>update(item,e.target.value)}>{Object.entries(labels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
      <div className="feedback-inbox-delete">
        {deleteId===item.id?<><p>Supprimer définitivement ce retour ?</p><div className="feedback-inbox-delete-actions"><button type="button" disabled={busy} onClick={()=>setDeleteId(null)}>Annuler</button><button type="button" disabled={busy} onClick={()=>remove(item)}>Confirmer la suppression</button></div></>:<button type="button" disabled={busy} onClick={()=>setDeleteId(item.id)}>Supprimer ce retour</button>}
      </div></article>)}
    {loaded&&!items.length&&<p>Aucun retour pour le moment.</p>}{loaded&&items.length>0&&!items.some(item=>filter==="all"||item.status===filter)&&<p>Aucun retour avec ce statut dans les messages chargés.</p>}
    {cursor&&<button type="button" disabled={busy} onClick={()=>load(true)}>Charger les retours suivants</button>}
    <p role="status" className="tester-feedback-status">{error}</p>
  </section>;
}
