import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, X } from "lucide-react";
import { cropProfilePhoto, getPhotoViewport, loadProfilePhoto } from "../services/profilePhoto";

const DEFAULT_VIEW = { zoom: 1, centerX: .5, centerY: .5 };

function PhotoModal({ title, closeLabel, onClose, busy = false, children, footer }) {
  const headingId = useId();
  const dialog = useRef(null);
  const state = useRef({ onClose, busy });
  state.current = { onClose, busy };
  useEffect(() => {
    const previousFocus = document.activeElement;
    const root = document.getElementById("root");
    const previousInert = root?.hasAttribute("inert");
    const previousHidden = root?.getAttribute("aria-hidden");
    const html = document.documentElement;
    const alreadyLocked = html.classList.contains("checkpoint-photo-modal-active");
    html.classList.add("checkpoint-photo-modal-active");
    dialog.current?.querySelector("button")?.focus({ preventScroll: true });
    if (root) { root.setAttribute("inert", ""); root.setAttribute("aria-hidden", "true"); }
    const onKey = event => {
      if (event.key === "Escape") {
        event.preventDefault(); event.stopPropagation();
        if (!state.current.busy) state.current.onClose();
      }
      if (event.key === "Tab") {
        const controls = [...(dialog.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), [tabindex="0"]') || [])];
        const first = controls[0], last = controls[controls.length - 1];
        if (!first) { event.preventDefault(); dialog.current?.focus(); }
        else if (event.shiftKey && (document.activeElement === first || !dialog.current.contains(document.activeElement))) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !dialog.current.contains(document.activeElement))) {
          event.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      if (!alreadyLocked) html.classList.remove("checkpoint-photo-modal-active");
      if (root) {
        if (!previousInert) root.removeAttribute("inert");
        if (previousHidden === null) root.removeAttribute("aria-hidden"); else root.setAttribute("aria-hidden", previousHidden);
      }
      if (previousFocus?.isConnected) previousFocus.focus?.({ preventScroll: true });
    };
  }, []);
  return createPortal(
    <div className="checkpoint-photo-backdrop" onClick={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <section ref={dialog} className="checkpoint-photo-dialog" role="dialog" aria-modal="true" aria-labelledby={headingId} tabIndex={-1} aria-busy={busy}>
        <header><h2 id={headingId}>{title}</h2><button type="button" className="checkpoint-photo-close" aria-label={closeLabel} disabled={busy} onClick={onClose}><X size={22} aria-hidden="true" /></button></header>
        <div className="checkpoint-photo-dialog-body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </section>
    </div>, document.body
  );
}

function PhotoPanZoom({ photo, crop, setCrop, editing = false, disabled = false }) {
  const pointers = useRef(new Map());
  const pinch = useRef(null);
  const hintId = useId();
  const fit = editing ? "cover" : "contain";
  const geometry = getPhotoViewport(photo.width, photo.height, crop, fit);
  const update = next => setCrop(previous => {
    const proposed = typeof next === "function" ? next(previous) : next;
    const view = getPhotoViewport(photo.width, photo.height, proposed, fit);
    return { zoom: view.zoom, centerX: view.centerX, centerY: view.centerY };
  });
  const setZoom = zoom => update(previous => ({ ...previous, zoom }));
  const startPinch = element => {
    const [a, b] = [...pointers.current.values()];
    const rect = element.getBoundingClientRect();
    const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
    pinch.current = { distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), zoom: geometry.zoom,
      anchorX: geometry.centerX + ((midX - rect.left) / rect.width - .5) * geometry.side / photo.width,
      anchorY: geometry.centerY + ((midY - rect.top) / rect.height - .5) * geometry.side / photo.height };
  };
  const down = event => {
    if (disabled || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) startPinch(event.currentTarget);
  };
  const move = event => {
    const last = pointers.current.get(event.pointerId);
    if (!last || disabled) return;
    event.preventDefault();
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const start = pinch.current;
      const zoom = Math.max(1, Math.min(4, start.zoom * Math.hypot(a.x - b.x, a.y - b.y) / start.distance));
      const side = (editing ? Math.min(photo.width, photo.height) : Math.max(photo.width, photo.height)) / zoom;
      update({ zoom,
        centerX: start.anchorX - (((a.x + b.x) / 2 - rect.left) / rect.width - .5) * side / photo.width,
        centerY: start.anchorY - (((a.y + b.y) / 2 - rect.top) / rect.height - .5) * side / photo.height });
    } else {
      update(previous => {
        const view = getPhotoViewport(photo.width, photo.height, previous, fit);
        return { ...previous, centerX: view.centerX - (event.clientX - last.x) / rect.width * view.side / photo.width,
          centerY: view.centerY - (event.clientY - last.y) / rect.height * view.side / photo.height };
      });
    }
  };
  const up = event => {
    pointers.current.delete(event.pointerId);
    pinch.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const keyDown = event => {
    if (disabled) return;
    const directions = { ArrowLeft: [-.02, 0], ArrowRight: [.02, 0], ArrowUp: [0, -.02], ArrowDown: [0, .02] };
    if (directions[event.key]) {
      event.preventDefault();
      const [x, y] = directions[event.key];
      update(previous => ({ ...previous, centerX: geometry.centerX + x, centerY: geometry.centerY + y }));
    } else if (event.key === "Home") { event.preventDefault(); update(DEFAULT_VIEW); }
  };
  return <>
    <div className={`checkpoint-photo-frame ${editing ? "checkpoint-photo-frame-editing" : ""}`} tabIndex={disabled ? -1 : 0} role="group" aria-label="Déplacer la photo" aria-describedby={hintId}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up} onKeyDown={keyDown}>
      <img src={photo.source} alt="Aperçu de la photo de profil" draggable={false} style={{ width: `${photo.width / geometry.side * 100}%`, height: `${photo.height / geometry.side * 100}%`,
        left: `${50 - geometry.centerX * photo.width / geometry.side * 100}%`, top: `${50 - geometry.centerY * photo.height / geometry.side * 100}%` }} />
      {editing && <span className="checkpoint-photo-crop-guide" aria-hidden="true" />}
    </div>
    <p className="checkpoint-photo-hint" id={hintId}>Fais glisser la photo pour la déplacer. Tu peux aussi utiliser les flèches du clavier ou zoomer avec deux doigts.</p>
    <div className="checkpoint-photo-zoom-label"><label htmlFor={`${hintId}-zoom`}>Zoom</label><output htmlFor={`${hintId}-zoom`}>{Math.round(geometry.zoom * 100)} %</output></div>
    <div className="checkpoint-photo-zoom-controls">
      <button type="button" aria-label="Dézoomer" disabled={disabled || geometry.zoom <= 1} onClick={() => setZoom(geometry.zoom - .1)}><Minus size={18} aria-hidden="true" /></button>
      <input id={`${hintId}-zoom`} aria-label="Zoom de la photo" type="range" min="1" max="4" step=".01" value={geometry.zoom} disabled={disabled} onChange={event => setZoom(Number(event.target.value))} />
      <button type="button" aria-label="Zoomer" disabled={disabled || geometry.zoom >= 4} onClick={() => setZoom(geometry.zoom + .1)}><Plus size={18} aria-hidden="true" /></button>
    </div>
    <button type="button" className="checkpoint-photo-reset" disabled={disabled} onClick={() => update(DEFAULT_VIEW)}>Recentrer</button>
  </>;
}

export function ProfilePhotoViewer({ name, src, onClose }) {
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [crop, setCrop] = useState(DEFAULT_VIEW);
  useEffect(() => {
    let active = true;
    loadProfilePhoto(src, { forEditing: false }).then(value => { if (active) setPhoto(value); }).catch(() => { if (active) setError("Impossible d’ouvrir cette photo pour le moment."); });
    return () => { active = false; };
  }, [src]);
  return <PhotoModal title={`Photo de ${name || "profil"}`} closeLabel="Fermer la photo" onClose={onClose}>
    {photo ? <PhotoPanZoom photo={photo} crop={crop} setCrop={setCrop} /> : error ? <p role="alert">{error}</p> : <p role="status">Ouverture de la photo…</p>}
  </PhotoModal>;
}

export function ProfilePhotoCropper({ photo, existing = false, onSave, onClose }) {
  const [crop, setCrop] = useState(DEFAULT_VIEW);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    setBusy(true); setError("");
    try { await onSave(cropProfilePhoto(photo, crop)); }
    catch (e) { setError(e.message || "Impossible d’enregistrer la photo. Réessaie."); }
    finally { setBusy(false); }
  };
  return <PhotoModal title="Cadrer ta photo" closeLabel="Fermer le recadrage" onClose={onClose} busy={busy} footer={<>
    <button type="button" disabled={busy} onClick={onClose}>Annuler</button>
    <button type="button" className="checkpoint-photo-primary" disabled={busy} onClick={save}>{busy ? "Enregistrement…" : "Enregistrer la photo"}</button>
  </>}>
    <PhotoPanZoom photo={photo} crop={crop} setCrop={setCrop} editing disabled={busy} />
    {existing && <p className="checkpoint-photo-hint">Pour un cadrage plus large, choisis à nouveau la photo d’origine.</p>}
    {error && <p role="alert" className="checkpoint-photo-error">{error}</p>}
  </PhotoModal>;
}
