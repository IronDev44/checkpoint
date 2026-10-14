import { useRef, useState } from "react";
import { prepareProfilePhoto } from "../services/profilePhoto";
import "./ProfilePhoto.css";

export function SocialAvatar({ name, src, className = "social-hub-avatar" }) {
  const [failed, setFailed] = useState("");
  const initials = String(name || "CP").split(/\s+/).map(word => word[0]).slice(0, 2).join("").toUpperCase();
  return <span className={`${className} checkpoint-avatar`} aria-hidden="true">
    {src && failed !== src ? <img src={src} alt="" onError={() => setFailed(src)} /> : initials}
  </span>;
}

export default function ProfilePhotoEditor({ name, value, onChange }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const choose = async event => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true); setMessage(""); setError("");
    try { await onChange(await prepareProfilePhoto(file)); setMessage("Photo de profil mise à jour."); }
    catch (e) { setError(e.message || "Impossible de modifier cette photo."); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true); setMessage(""); setError("");
    try { await onChange(""); setMessage("Photo retirée."); }
    catch { setError("Impossible de retirer la photo. Réessaie."); }
    finally { setBusy(false); }
  };
  return <section className="social-photo-editor" aria-label="Photo de profil">
    <SocialAvatar name={name} src={value} className="social-photo-editor-preview" />
    <div><h3>Photo de profil</h3><p>Ta photo est recadrée au centre. Elle apparaît sur ton profil public et auprès de tes amis.</p>
      <input ref={input} type="file" accept="image/*" aria-label="Choisir une photo de profil" onChange={choose} disabled={busy} hidden />
      <div className="social-photo-editor-actions"><button type="button" className="option-pill active" disabled={busy} onClick={() => input.current.click()}>{busy ? "Préparation…" : value ? "Changer la photo" : "Ajouter une photo"}</button>
        {value && <button type="button" className="option-pill" disabled={busy} onClick={remove}>Retirer la photo</button>}
      </div>
      {message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}
    </div>
  </section>;
}
