import { useId } from "react";
import "./CheckpointTheme.css";
import "./CheckpointPremium.css";
import "./CheckpointUltimate.css";

// A gateway and its save point: one original mark shared by the app and boot.
export function CheckpointMark({ className = "", variant = "gold" }) {
  // Instances coexist in the header, boot and portal. SVG paint IDs must not collide.
  const id = `checkpoint-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const diamond = variant === "diamond";
  const platinum = variant === "platinum" || diamond;
  const metal = diamond ? ["#ffffff", "#d7e5e4", "#697986", "#f6e4c8", "#96c6ce"] : platinum ? ["#fcfcff", "#d8dbe5", "#8c91a5", "#eeeaf9", "#8d91a4"] : ["#fff0bf", "#ddbd76", "#b58a3e", "#f1d89b", "#b28a43"];
  return <svg className={`checkpoint-mark${platinum ? " checkpoint-mark-platinum" : ""}${diamond ? " checkpoint-mark-diamond" : ""} ${className}`} viewBox="0 0 120 128" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-gold`} x1="21" y1="12" x2="93" y2="119" gradientUnits="userSpaceOnUse">
        <stop stopColor={metal[0]}/><stop offset=".24" stopColor={metal[1]}/>
        <stop offset=".49" stopColor={metal[2]}/><stop offset=".7" stopColor={metal[3]}/><stop offset="1" stopColor={metal[4]}/>
      </linearGradient>
      <linearGradient id={`${id}-edge`} x1="17" y1="12" x2="79" y2="113" gradientUnits="userSpaceOnUse">
        <stop stopColor={platinum ? "#ffffff" : "#fff9df"}/><stop offset=".48" stopColor={platinum ? "#d6d0f7" : "#f5dca1"} stopOpacity=".2"/><stop offset="1" stopColor={platinum ? "#c7e0e5" : "#eed395"} stopOpacity=".75"/>
      </linearGradient>
      <linearGradient id={`${id}-gem`} x1="85" y1="52" x2="108" y2="77" gradientUnits="userSpaceOnUse">
        <stop stopColor={platinum ? "#ffffff" : "#fff3ca"}/><stop offset=".5" stopColor={platinum ? "#ded8f4" : "#e9c884"}/><stop offset="1" stopColor={platinum ? "#838ba5" : "#a77c33"}/>
      </linearGradient>
      <mask id={`${id}-reveal`} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="128">
        <path className="checkpoint-mark-reveal" d="m92 37-32-19-40 23v46l40 23 32-19" pathLength="1" stroke="white" strokeWidth="28"/>
      </mask>
    </defs>
    <g mask={`url(#${id}-reveal)`}>
      <path className="checkpoint-gateway" d="m60 8 36 21-9 15-27-16-31 18v36l31 18 27-16 9 15-36 21-49-28V36Z" fill={`url(#${id}-gold)`}/>
      <path className="checkpoint-facet" d="m11 36 5 3v50l-5 3Z" fill={platinum ? "#596176" : "#846025"} fillOpacity=".65"/>
      <path className="checkpoint-facet" d="m29 46 31-18 27 16 3-5-30-17-36 21v42l36 21 30-17-3-5-27 16-31-18Z" fill={platinum ? "#4f566c" : "#72511e"} fillOpacity=".3"/>
      <path className="checkpoint-mark-edge" d="m94 29-34-20-48 28v54l48 28 34-20M29 81V46l31-18 26 15" stroke={`url(#${id}-edge)`} strokeWidth="1.1" strokeLinejoin="round"/>
      <path className="checkpoint-facet" d="m60 8 1 5 31 18 4-2Z" fill={platinum ? "#ffffff" : "#fff3cc"} fillOpacity=".35"/>
    </g>
    <g className="checkpoint-diamond">
      <path d="m96 50 14 14-14 14-14-14Z" fill={`url(#${id}-gem)`}/>
      <path className="checkpoint-gem-facet" d="m96 50 1 14-15 0Z" fill={platinum ? "#ffffff" : "#fff8df"} fillOpacity=".75"/>
      <path className="checkpoint-gem-facet" d="m97 64 13 0-14 14Z" fill={platinum ? "#797a9f" : "#9a702c"} fillOpacity=".45"/>
      <path className="checkpoint-gem-edge" d="m83 64 13-13 13 13" stroke={platinum ? "#f5f4ff" : "#fff5d3"} strokeWidth=".85" strokeLinejoin="round"/>
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

export function CheckpointPremiumIntro({ progress = 0, light = false, onRequestClose }) {
  const value = Math.max(0, Math.min(100, Math.round(progress)));
  return <div className={`checkpoint-gold-intro checkpoint-premium-intro${light ? " is-light" : ""}`}>
    <div className="checkpoint-premium-prism" aria-hidden="true">{Array.from({length:light ? 3 : 6},(_,i)=><i key={i} style={{"--plane":i}}/>)}</div>
    {onRequestClose && <button className="checkpoint-gold-skip" onClick={onRequestClose}>Passer</button>}
    <main className="checkpoint-gold-intro-content">
      <span className="checkpoint-premium-edition">ÉDITION PLATINE</span>
      <div className="checkpoint-gold-emblem"><CheckpointMark variant="platinum"/></div>
      <h1>CHECKPOINT</h1><p className="checkpoint-premium-wordmark">PREMIUM</p>
      <p className="checkpoint-premium-caption">La signature de ton parcours.</p>
    </main>
    <div className="checkpoint-gold-loading"><div><span>Ton espace se prépare</span><strong>{value}%</strong></div>
      <div className="checkpoint-gold-progress" role="progressbar" aria-label="Chargement de Checkpoint Premium" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{width:`${value}%`}}/></div>
    </div>
  </div>;
}

export function CheckpointPremiumTransition({ light = false, direction = "right" }) {
  return <div className={`checkpoint-premium-transition direction-${direction}${light ? " is-light" : ""}`} aria-hidden="true">
    <div className="checkpoint-premium-shutter shutter-left"/><div className="checkpoint-premium-shutter shutter-right"/>
    <div className="checkpoint-premium-seam"/>
    <div className="checkpoint-premium-transition-seal"><CheckpointMark variant="platinum"/><span>PREMIUM</span></div>
    {!light && <div className="checkpoint-premium-transition-facets">{Array.from({length:6},(_,i)=><i key={i} style={{"--plane":i}}/>)}</div>}
  </div>;
}

// An aperture of light assembles the mark at boot; a travelling diamond seam
// opens the next tab. Both keep their own composition and the shared 840ms exit.
function UltimateIris({light}) {
  return <div className="checkpoint-ultimate-iris" aria-hidden="true">{Array.from({length:light?4:12},(_,i)=><i key={i} style={{'--facet':i,'--facets':light?4:12}}/>)}</div>;
}
export function CheckpointUltimateIntro({progress=0,light=false,onRequestClose}) {
  const value=Math.max(0,Math.min(100,Math.round(progress)));
  return <div className={`checkpoint-gold-intro checkpoint-ultimate-intro${light?' is-light':''}`}>
    <UltimateIris light={light}/><div className="checkpoint-ultimate-horizon" aria-hidden="true"/>
    {onRequestClose&&<button className="checkpoint-gold-skip" onClick={onRequestClose}>Passer</button>}
    <main className="checkpoint-gold-intro-content"><span className="checkpoint-ultimate-edition">LE SOMMET DE TON PARCOURS</span><div className="checkpoint-gold-emblem"><CheckpointMark variant="diamond"/></div><h1>CHECKPOINT</h1><p className="checkpoint-ultimate-wordmark">ULTIME</p><p className="checkpoint-ultimate-caption">Chaque partie t’a mené ici.</p></main>
    <div className="checkpoint-gold-loading"><div><span>Ton espace se prépare</span><strong>{value}%</strong></div><div className="checkpoint-gold-progress" role="progressbar" aria-label="Chargement de Checkpoint Ultime" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{width:`${value}%`}}/></div></div>
  </div>;
}
export function CheckpointUltimateTransition({light=false,direction='right'}) {
  return <div className={`checkpoint-ultimate-transition direction-${direction}${light?' is-light':''}`} aria-hidden="true"><div className="checkpoint-ultimate-veil"/><div className="checkpoint-ultimate-seam"/>{!light&&<div className="checkpoint-ultimate-rays">{Array.from({length:8},(_,i)=><i key={i} style={{'--facet':i}}/>)}</div>}<div className="checkpoint-ultimate-seal"><CheckpointMark variant="diamond"/><span>ULTIME</span></div></div>;
}
