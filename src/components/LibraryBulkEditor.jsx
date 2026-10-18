import {useEffect,useState} from 'react';
export default function LibraryBulkEditor({games,onApply,active,onActiveChange}){
 const [selected,setSelected]=useState([]);
 const [changes,setChanges]=useState({status:'',platform:'',format:''});
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const ids=games.map(g=>String(g.id));
 useEffect(()=>{setSelected(current=>current.filter(id=>ids.includes(id)));},[ids.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
 const platforms=[...new Set(['PC','PlayStation 5','Xbox Series S/X','Nintendo Switch','Nintendo Switch 2',...games.flatMap(g=>g.playedPlatforms||[])])].sort();
 const toggle=id=>setSelected(current=>current.includes(id)?current.filter(x=>x!==id):[...current,id]);
 const apply=async()=>{
   setBusy(true);setMessage('');
   try{const result=await onApply(selected,changes);setSelected(result.failedIds.map(String));setMessage(`${result.updated} jeu${result.updated>1?'x':''} mis à jour.${result.failedIds.length?` ${result.failedIds.length} à réessayer.`:''}`);}
   catch(e){setMessage(e.message||'Enregistrement impossible. La sélection est conservée.');}
   finally{setBusy(false);}
 };
 return <section className="library-bulk" aria-label="Modification de plusieurs jeux">
  <button type="button" disabled={busy} aria-expanded={active} onClick={()=>{onActiveChange(!active);setMessage('');}}>{active?'Fermer la sélection':'Modifier plusieurs jeux'}</button>
  {active&&<>
   <div className="library-bulk-heading"><strong>{selected.length} sélectionné{selected.length>1?'s':''}</strong><button disabled={busy} type="button" onClick={()=>setSelected(selected.length===ids.length?[]:ids)}>{selected.length===ids.length?'Tout désélectionner':'Tout sélectionner'}</button></div>
   <div className="library-bulk-fields">
    <label>Statut<select disabled={busy} value={changes.status} onChange={e=>setChanges(c=>({...c,status:e.target.value}))}><option value="">Ne pas modifier</option><option value="collection">Dans ma collection</option><option value="en cours">En cours</option><option value="completed">Terminé</option><option value="wishlist">Wishlist</option></select></label>
    <label>Plateforme jouée<select disabled={busy} value={changes.platform} onChange={e=>setChanges(c=>({...c,platform:e.target.value}))}><option value="">Ne pas modifier</option>{platforms.map(p=><option key={p}>{p}</option>)}</select></label>
    <label>Format<select disabled={busy} value={changes.format} onChange={e=>setChanges(c=>({...c,format:e.target.value}))}><option value="">Ne pas modifier</option><option value="physical">Physique</option><option value="digital">Numérique</option></select></label>
   </div>
   {changes.platform&&<p>La plateforme choisie remplacera les plateformes jouées des jeux sélectionnés.</p>}
   <button className="checkpoint-primary-action" type="button" disabled={busy||!selected.length||!Object.values(changes).some(Boolean)} onClick={apply}>{busy?'Enregistrement…':`Appliquer à ${selected.length} jeu${selected.length>1?'x':''}`}</button>
   <div className="library-bulk-list">{games.map(g=><label key={g.id}><input type="checkbox" disabled={busy} checked={selected.includes(String(g.id))} onChange={()=>toggle(String(g.id))}/>{g.image&&<img src={g.image} alt="" loading="lazy"/>}<span>{g.name}</span></label>)}</div>
  </>}
  {message&&<p role="status">{message}</p>}
 </section>;
}
