import { useEffect, useRef, useState } from "react";
import { ZoomIn } from "lucide-react";
import { loadProfilePhoto } from "../services/profilePhoto";
import { ProfilePhotoCropper, ProfilePhotoViewer } from "./ProfilePhotoDialog";
import "./ProfilePhoto.css";

export function SocialAvatar({ name, src, className = "social-hub-avatar", zoomable = false }) {
  const [failed, setFailed] = useState("");
  const [viewing, setViewing] = useState(false);
  const hasPhoto = Boolean(src && failed !== src);
  const initials = String(name || "CP").split(/\s+/).map(word => word[0]).slice(0, 2).join("").toUpperCase();
  return <>
    <span className={`${className} checkpoint-avatar ${zoomable && hasPhoto ? "checkpoint-avatar-zoomable" : ""}`} aria-hidden={zoomable && hasPhoto ? undefined : true}>
      {hasPhoto ? <img src={src} alt="" onError={() => { setFailed(src); setViewing(false); }} /> : initials}
      {zoomable && hasPhoto && <button type="button" className="checkpoint-avatar-open" aria-label={`Agrandir la photo de ${name || "profil"}`} onClick={() => setViewing(true)}><ZoomIn size={18} aria-hidden="true" /></button>}
    </span>
    {viewing && hasPhoto && <ProfilePhotoViewer key={src} name={name} src={src} onClose={() => setViewing(false)} />}
  </>;
}

export default function ProfilePhotoEditor({ name, value, onChange }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const mounted = useRef(false);
  const operation = useRef(0);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const startEditing = async (source, existing = false) => {
    const current = ++operation.current;
    setBusy(true); setMessage(""); setError("");
    try {
      const photo = await loadProfilePhoto(source);
      if (mounted.current && current === operation.current) setEditing({ photo, existing });
    } catch (e) { if (mounted.current && current === operation.current) setError(e.message || "Impossible de modifier cette photo."); }
    finally { if (mounted.current && current === operation.current) setBusy(false); }
  };
  const choose = async event => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await startEditing(file);
  };
  const save = async photo => {
    await onChange(photo);
    if (mounted.current) { setEditing(null); setMessage("Photo de profil mise à jour."); }
  };
  const remove = async () => {
    setBusy(true); setMessage(""); setError("");
    try { await onChange(""); setMessage("Photo retirée."); }
    catch { setError("Impossible de retirer la photo. Réessaie."); }
    finally { setBusy(false); }
  };
  return <section className="social-photo-editor" aria-label="Photo de profil">
    <SocialAvatar name={name} src={value} className="social-photo-editor-preview" zoomable />
    <div><h3>Photo de profil</h3><p>Choisis ton cadrage avant d’enregistrer. Ta photo sera visible avec ton profil.</p>
      <input ref={input} type="file" accept="image/*" aria-label="Choisir une photo de profil" onChange={choose} disabled={busy} hidden />
      <div className="social-photo-editor-actions"><button type="button" className="option-pill active" disabled={busy} onClick={() => input.current.click()}>{busy ? "Préparation…" : value ? "Changer la photo" : "Ajouter une photo"}</button>
        {value && <button type="button" className="option-pill" disabled={busy} onClick={() => startEditing(value, true)}>Recadrer</button>}
        {value && <button type="button" className="option-pill" disabled={busy} onClick={remove}>Retirer la photo</button>}
      </div>
      {message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}
    </div>
    {editing && <ProfilePhotoCropper photo={editing.photo} existing={editing.existing} onSave={save} onClose={() => setEditing(null)} />}
  </section>;
}
