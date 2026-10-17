import { useId } from "react";
import "./CheckpointTheme.css";

// A gateway and its save point: one original mark shared by the app and boot.
export function CheckpointMark({ className = "" }) {
  // Instances coexist in the header, boot and portal. SVG paint IDs must not collide.
  const id = `checkpoint-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return <svg className={`checkpoint-mark ${className}`} viewBox="0 0 120 128" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-gold`} x1="21" y1="12" x2="93" y2="119" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fff0bf"/><stop offset=".24" stopColor="#ddbd76"/>
        <stop offset=".49" stopColor="#b58a3e"/><stop offset=".7" stopColor="#f1d89b"/><stop offset="1" stopColor="#b28a43"/>
      </linearGradient>
      <linearGradient id={`${id}-edge`} x1="17" y1="12" x2="79" y2="113" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fff9df"/><stop offset=".48" stopColor="#f5dca1" stopOpacity=".2"/><stop offset="1" stopColor="#eed395" stopOpacity=".75"/>
      </linearGradient>
      <linearGradient id={`${id}-gem`} x1="85" y1="52" x2="108" y2="77" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fff3ca"/><stop offset=".5" stopColor="#e9c884"/><stop offset="1" stopColor="#a77c33"/>
      </linearGradient>
      <mask id={`${id}-reveal`} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="128">
        <path className="checkpoint-mark-reveal" d="m92 37-32-19-40 23v46l40 23 32-19" pathLength="1" stroke="white" strokeWidth="28"/>
      </mask>
    </defs>
    <g mask={`url(#${id}-reveal)`}>
      <path className="checkpoint-gateway" d="m60 8 36 21-9 15-27-16-31 18v36l31 18 27-16 9 15-36 21-49-28V36Z" fill={`url(#${id}-gold)`}/>
      <path className="checkpoint-facet" d="m11 36 5 3v50l-5 3Z" fill="#846025" fillOpacity=".65"/>
      <path className="checkpoint-facet" d="m29 46 31-18 27 16 3-5-30-17-36 21v42l36 21 30-17-3-5-27 16-31-18Z" fill="#72511e" fillOpacity=".3"/>
      <path className="checkpoint-mark-edge" d="m94 29-34-20-48 28v54l48 28 34-20M29 81V46l31-18 26 15" stroke={`url(#${id}-edge)`} strokeWidth="1.1" strokeLinejoin="round"/>
      <path className="checkpoint-facet" d="m60 8 1 5 31 18 4-2Z" fill="#fff3cc" fillOpacity=".35"/>
    </g>
    <g className="checkpoint-diamond">
      <path d="m96 50 14 14-14 14-14-14Z" fill={`url(#${id}-gem)`}/>
      <path className="checkpoint-gem-facet" d="m96 50 1 14-15 0Z" fill="#fff8df" fillOpacity=".75"/>
      <path className="checkpoint-gem-facet" d="m97 64 13 0-14 14Z" fill="#9a702c" fillOpacity=".45"/>
      <path className="checkpoint-gem-edge" d="m83 64 13-13 13 13" stroke="#fff5d3" strokeWidth=".85" strokeLinejoin="round"/>
    </g>
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
