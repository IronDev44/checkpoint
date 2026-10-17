import "./CheckpointTheme.css";

// A gateway and its save point: one original mark shared by the app and boot.
export function CheckpointMark({ className = "" }) {
  return <svg className={`checkpoint-mark ${className}`} viewBox="0 0 100 112" fill="none" aria-hidden="true">
    <path className="checkpoint-gateway" d="M78 24 48 5 8 29v54l40 24 30-19" stroke="currentColor" strokeWidth="11" strokeLinejoin="miter"/>
    <path className="checkpoint-diamond" d="m82 43 13 13-13 13-13-13Z" fill="currentColor"/>
  </svg>;
}

export function CheckpointIntro({ progress = 0, light = false, onRequestClose }) {
  const value = Math.max(0, Math.min(100, Math.round(progress)));
  return <div className={`checkpoint-gold-intro${light ? " is-light" : ""}`}>
    <div className="checkpoint-gold-orbit" aria-hidden="true">{Array.from({length:light ? 3 : 9},(_,i)=><i key={i} style={{"--point":i}}/>)}</div>
    {onRequestClose && <button className="checkpoint-gold-skip" onClick={onRequestClose}>Passer</button>}
    <main className="checkpoint-gold-intro-content">
      <div className="checkpoint-gold-emblem"><CheckpointMark/></div>
      <h1>CHECKPOINT</h1><p>Chaque partie laisse une trace.</p>
    </main>
    <div className="checkpoint-gold-loading">
      <div><span>Ton espace se prépare</span><strong>{value}%</strong></div>
      <div className="checkpoint-gold-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{width:`${value}%`}}/></div>
    </div>
  </div>;
}

export function CheckpointTransition({ light = false, direction = "right" }) {
  return <div className={`checkpoint-gold-transition${light ? " is-light" : ""} direction-${direction}`} aria-hidden="true">
    <div className="checkpoint-gold-wipe"/><div className="checkpoint-gold-trail"/>
    <CheckpointMark/>
    {!light && <div className="checkpoint-gold-sparks">{Array.from({length:12},(_,i)=><i key={i} style={{"--point":i}}/>)}</div>}
  </div>;
}
