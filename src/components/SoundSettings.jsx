import { useEffect, useId, useRef, useState } from "react";
import { Minus, Plus, Volume2, VolumeX, Play } from "lucide-react";
import { normalizeSoundSettings, playSound, SOUND_EVENTS, SOUND_PRESETS } from "../services/soundEffects";
import "./SoundSettings.css";

export default function SoundSettings({ value, onChange, onPreview = playSound }) {
  const settings = normalizeSoundSettings(value), id = useId();
  const [volume, setVolume] = useState(settings.volume);
  const [playing, setPlaying] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const current = useRef(settings), latestVolume = useRef(volume), dragging = useRef(false), previewId = useRef(0), timer = useRef(null);
  current.current = settings;
  useEffect(() => { if (!dragging.current) { setVolume(settings.volume); latestVolume.current = settings.volume; } }, [settings.volume]);
  useEffect(() => () => { previewId.current++; clearTimeout(timer.current); }, []);
  const preset = SOUND_PRESETS.find(item => item.id === settings.style);
  function commitVolume(next) {
    const safe = normalizeSoundSettings({volume:next}).volume;
    setVolume(safe); latestVolume.current = safe; onChange({...current.current,volume:safe});
  }
  function finishDrag() {
    if (!dragging.current) return;
    dragging.current = false; commitVolume(latestVolume.current);
  }
  async function preview(event) {
    const request = ++previewId.current; clearTimeout(timer.current); setError(false); setMessage(""); setPlaying(event.id);
    try {
      const result = await onPreview(event.id, {preview:true,settings:{...current.current,volume:latestVolume.current}});
      if (request !== previewId.current) return;
      if (!result?.ok) {
        setPlaying(""); setError(true); setMessage(result?.reason === "unsupported" ? "Les sons ne sont pas disponibles dans ce navigateur." : "L’aperçu n’a pas pu démarrer. Appuie à nouveau pour réessayer.");
      } else {
        setMessage(`Aperçu : ${event.label} · ${preset.name}.`);
        timer.current = setTimeout(()=>{if(request===previewId.current)setPlaying("");},(result.duration+.1)*1000);
      }
    } catch { if(request===previewId.current){setPlaying("");setError(true);setMessage("L’aperçu n’a pas pu démarrer. Réessaie.");} }
  }
  return <section className="option-setting-card sound-settings" aria-labelledby={`${id}-title`}>
    <div className="sound-settings-heading"><div><h3 id={`${id}-title`}>Sons de l’interface</h3><p>Choisis une ambiance pour les clics, les ajouts et les récompenses.</p></div>{settings.enabled&&volume>0?<Volume2 aria-hidden="true"/>:<VolumeX aria-hidden="true"/>}</div>
    <div className="sound-enable-controls" role="group" aria-label="Activer les sons">
      <button type="button" className={`option-pill ${settings.enabled?"active":""}`} aria-pressed={settings.enabled} onClick={()=>onChange({...settings,enabled:true})}>Activés</button>
      <button type="button" className={`option-pill ${!settings.enabled?"active":""}`} aria-pressed={!settings.enabled} onClick={()=>onChange({...settings,enabled:false})}>Désactivés</button>
    </div>
    <div className="sound-volume-heading"><label htmlFor={`${id}-volume`}>Volume des effets</label><output htmlFor={`${id}-volume`}>{volume} %</output></div>
    <div className="sound-volume-controls">
      <button type="button" aria-label="Baisser le volume" disabled={volume===0} onClick={()=>commitVolume(volume-10)}><Minus size={18} aria-hidden="true"/></button>
      <input id={`${id}-volume`} type="range" min="0" max="100" step="1" value={volume} aria-valuetext={`${volume} %`} style={{"--sound-volume":`${volume}%`}}
        onPointerDown={event=>{dragging.current=true;event.currentTarget.setPointerCapture?.(event.pointerId);}}
        onChange={event=>{const next=Number(event.target.value);setVolume(next);latestVolume.current=next;if(!dragging.current)commitVolume(next);}}
        onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag} onBlur={finishDrag}/>
      <button type="button" aria-label="Augmenter le volume" disabled={volume===100} onClick={()=>commitVolume(volume+10)}><Plus size={18} aria-hidden="true"/></button>
    </div>
    <div className="sound-preset-field"><label htmlFor={`${id}-preset`}>Ambiance sonore</label><select id={`${id}-preset`} value={settings.style} onChange={event=>{previewId.current++;clearTimeout(timer.current);setPlaying("");setMessage("");onChange({...settings,style:event.target.value});}}>
      {SOUND_PRESETS.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
    </select><p>{preset.description}</p></div>
    <div className="sound-preview-heading"><strong>Écouter un aperçu</strong><small>{volume===0?"Monte le volume pour écouter les sons.":settings.enabled?"Chaque action a son propre son.":"Les effets sont coupés. Tu peux quand même écouter les aperçus."}</small></div>
    <div className="sound-preview-actions">{SOUND_EVENTS.map(event=><button type="button" key={event.id} disabled={volume===0} aria-label={`Écouter : ${event.label}`} className={playing===event.id?"is-playing":""} onClick={()=>preview(event)}><Play size={14} aria-hidden="true" fill={playing===event.id?"currentColor":"none"}/>{event.label}</button>)}</div>
    <p className={`sound-preview-status ${error?"is-error":""}`} role="status" aria-label="État de l’aperçu">{message}</p>
  </section>;
}
