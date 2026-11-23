import { useLanguage } from "../i18n/language";import { LocalizedValue, LocalizedMessage, LocalizedElement } from "../i18n/Localized";import CatalogImage from './CatalogImage';
import { useEffect, useState } from 'react';
export default function LibraryBulkEditor({ games, onApply, active, onActiveChange }) {useLanguage();
  const [selected, setSelected] = useState([]);
  const [changes, setChanges] = useState({ status: '', platform: '', format: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const ids = games.map((g) => String(g.id));
  useEffect(() => {setSelected((current) => current.filter((id) => ids.includes(id)));}, [ids.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  const platforms = [...new Set(['PC', 'PlayStation 5', 'Xbox Series S/X', 'Nintendo Switch', 'Nintendo Switch 2', ...games.flatMap((g) => g.playedPlatforms || [])])].sort();
  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  const apply = async () => {
    setBusy(true);setMessage('');
    try {const result = await onApply(selected, changes);setSelected(result.failedIds.map(String));setMessage(`${result.updated} jeu${result.updated > 1 ? 'x' : ''} mis à jour.${result.failedIds.length ? ` ${result.failedIds.length} à réessayer.` : ''}`);}
    catch (e) {setMessage(e.message || 'Enregistrement impossible. La sélection est conservée.');} finally
    {setBusy(false);}
  };
  return <LocalizedElement __as={"section"} className="library-bulk" aria-label="Modification de plusieurs jeux">
  <button type="button" disabled={busy} aria-expanded={active} onClick={() => {onActiveChange(!active);setMessage('');}}><LocalizedValue value={active ? 'Fermer la sélection' : 'Modifier plusieurs jeux'} /></button>
  {active && <>
   <div className="library-bulk-heading"><strong><LocalizedMessage source={"{{0}} sélectionné" + (selected.length > 1 ? 's' : '')} values={[selected.length]} /></strong><button disabled={busy} type="button" onClick={() => setSelected(selected.length === ids.length ? [] : ids)}><LocalizedValue value={selected.length === ids.length ? 'Tout désélectionner' : 'Tout sélectionner'} /></button></div>
   <div className="library-bulk-fields">
    <label><LocalizedMessage source={"Statut"} values={[]} /><select disabled={busy} value={changes.status} onChange={(e) => setChanges((c) => ({ ...c, status: e.target.value }))}><option value=""><LocalizedMessage source={"Ne pas modifier"} values={[]} /></option><option value="collection"><LocalizedMessage source={"Dans ma collection"} values={[]} /></option><option value="en cours"><LocalizedMessage source={"En cours"} values={[]} /></option><option value="completed"><LocalizedMessage source={"Terminé"} values={[]} /></option><option value="wishlist"><LocalizedMessage source={"Wishlist"} values={[]} /></option></select></label>
    <label><LocalizedMessage source={"Plateforme jouée"} values={[]} /><select disabled={busy} value={changes.platform} onChange={(e) => setChanges((c) => ({ ...c, platform: e.target.value }))}><option value=""><LocalizedMessage source={"Ne pas modifier"} values={[]} /></option>{platforms.map((p) => <option key={p}><LocalizedValue value={p} /></option>)}</select></label>
    <label><LocalizedMessage source={"Format"} values={[]} /><select disabled={busy} value={changes.format} onChange={(e) => setChanges((c) => ({ ...c, format: e.target.value }))}><option value=""><LocalizedMessage source={"Ne pas modifier"} values={[]} /></option><option value="physical"><LocalizedMessage source={"Physique"} values={[]} /></option><option value="digital"><LocalizedMessage source={"Numérique"} values={[]} /></option></select></label>
   </div>
   {changes.platform && <p><LocalizedMessage source={"La plateforme choisie remplacera les plateformes jouées des jeux sélectionnés."} values={[]} /></p>}
   <button className="checkpoint-primary-action" type="button" disabled={busy || !selected.length || !Object.values(changes).some(Boolean)} onClick={apply}><LocalizedValue value={busy ? 'Enregistrement…' : `Appliquer à ${selected.length} jeu${selected.length > 1 ? 'x' : ''}`} /></button>
   <div className="library-bulk-list">{games.map((g) => <label key={g.id}><input type="checkbox" disabled={busy} checked={selected.includes(String(g.id))} onChange={() => toggle(String(g.id))} />{g.image && <CatalogImage src={g.image} alt="" loading="lazy" />}<span><LocalizedValue value={g.name} /></span></label>)}</div>
  </>}
  {message && <p role="status"><LocalizedValue value={message} /></p>}
 </LocalizedElement>;
}
