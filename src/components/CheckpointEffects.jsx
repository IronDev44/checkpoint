import UltimateVaultTransition from "./UltimateVaultTransition";
import { useId } from "react";
import "./CheckpointTheme.css";
import "./CheckpointPremium.css";
import "./CheckpointUltimate.css";
import "./UltimateVaultTransition.css";

// A gateway and its save point: one original mark shared by the app and boot.
export function CheckpointMark({ className = "", variant = "gold" }) {
  // Instances coexist in the header, boot and portal. SVG paint IDs must not collide.
  const id = `checkpoint-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  if (variant === "diamond") return <DiamondMark id={id} className={className}/>;
  const platinum = variant === "platinum";
  const metal = platinum ? ["#fcfcff", "#d8dbe5", "#8c91a5", "#eeeaf9", "#8d91a4"] : ["#fff0bf", "#ddbd76", "#b58a3e", "#f1d89b", "#b28a43"];
  return <svg className={`checkpoint-mark${platinum ? " checkpoint-mark-platinum" : ""} ${className}`} viewBox="0 0 120 128" fill="none" aria-hidden="true" focusable="false">
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

export function CheckpointPremiumTransition({light=false,direction="right"}) {
  return <CheckpointCrownTransition light={light} direction={direction}/>;
}

// Original cut-crystal geometry. Dark tables and narrow illuminated bevels
// keep Ultime distinct from Premium's solid platinum surface.
function DiamondMark({id,className}) {
  const outline="m60 8 36 21-9 15-27-16-31 18v36l31 18 27-16 9 15-36 21-49-28V36Z";
  return <svg className={`checkpoint-mark checkpoint-mark-diamond ${className}`} viewBox="0 0 120 128" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-table`} x1="15" y1="16" x2="91" y2="117" gradientUnits="userSpaceOnUse"><stop stopColor="#334851"/><stop offset=".22" stopColor="#0c151b"/><stop offset=".5" stopColor="#17222a"/><stop offset=".66" stopColor="#060d12"/><stop offset="1" stopColor="#30454f"/></linearGradient>
      <linearGradient id={`${id}-bevel`} x1="12" y1="14" x2="102" y2="113" gradientUnits="userSpaceOnUse"><stop stopColor="#f7ffff"/><stop offset=".23" stopColor="#89a5b3"/><stop offset=".42" stopColor="#eefcff"/><stop offset=".48" stopColor="#3c5366"/><stop offset=".7" stopColor="#759da8"/><stop offset=".83" stopColor="#e5e4dc"/><stop offset="1" stopColor="#718e9c"/></linearGradient>
      <linearGradient id={`${id}-rim`} x1="16" y1="17" x2="87" y2="116" gradientUnits="userSpaceOnUse"><stop stopColor="white"/><stop offset=".36" stopColor="#c7edf1"/><stop offset=".52" stopColor="#8a9eae" stopOpacity=".2"/><stop offset=".76" stopColor="#f9f0df"/><stop offset="1" stopColor="#a7c7d4"/></linearGradient>
      <linearGradient id={`${id}-scan`}><stop stopColor="#98deed" stopOpacity="0"/><stop offset=".42" stopColor="#c5c5ff" stopOpacity=".25"/><stop offset=".5" stopColor="#ffffff" stopOpacity=".95"/><stop offset=".57" stopColor="#e7d6ad" stopOpacity=".3"/><stop offset="1" stopColor="#98deed" stopOpacity="0"/></linearGradient>
      <clipPath id={`${id}-cut`}><path d={outline}/><path d="m96 50 14 14-14 14-14-14Z"/></clipPath>
    </defs>
    <path className="checkpoint-crystal-table" d={outline} fill={`url(#${id}-table)`}/>
    <g className="checkpoint-crystal-bevels" fill={`url(#${id}-bevel)`}>
      <path d="m60 8 36 21-6 3-30-18-43 25-6-3Z"/>
      <path d="m11 36 6 3v50l-6 3Z"/>
      <path d="m11 92 6-3 43 25v6Z"/>
      <path d="m60 120 36-21-6-3-30 18Z"/>
      <path d="m96 29-9 15-3-6 6-6Z"/>
      <path d="m60 28 27 16-3-6-24-14-35 20 4 2Z"/>
      <path d="m29 46-4-2v40l4-2Z"/>
      <path d="m29 82-4 2 35 20v-4Z"/>
      <path d="m60 100 27-16-3 6-24 14Z"/>
      <path d="m87 84 9 15-6-3-6-6Z"/>
    </g>
    <g className="checkpoint-crystal-inclusions" stroke="#bad9e3" strokeWidth=".45" opacity=".28"><path d="m60 14 0 10M17 39l8 5M17 89l8-5M60 104v10M47 21l-22 40M25 61l35 43M25 61l-8 28M60 104l30-8"/></g>
    <path className="checkpoint-crystal-rim" d={outline} stroke={`url(#${id}-rim)`} strokeWidth=".7" pathLength="1"/>
    <path d="m60 18 29 17M21 46v35M33 98l27 16" stroke="#f3ffff" strokeWidth=".55" opacity=".7"/>
    <g className="checkpoint-crystal-gem"><path d="m96 50 14 14-14 14-14-14Z" fill="#12222d" stroke="#dceff3" strokeWidth=".5"/><path d="m96 50 2 9-16 5Z" fill="#e3f5f8"/><path d="m96 50 14 14-8 1-4-6Z" fill="#91afbd"/><path d="m82 64 10 2 4 12Z" fill="#80a5b3"/><path d="m96 78 6-13 8-1Z" fill="#d9dee6"/><path d="m98 59 4 6-6 7-4-6Z" fill="#2a404c"/><path d="m96 51 12 13" stroke="#fff" strokeWidth=".7"/></g>
    <g className="checkpoint-crystal-caustic" clipPath={`url(#${id}-cut)`}><path className="checkpoint-crystal-scan" d="m-55-20 30 0 95 180H40Z" fill={`url(#${id}-scan)`}/></g>
  </svg>;
}

function UltimatePrestigeSetting({transition=false}) {
  return <div className={`ultimate-prestige-setting${transition?' is-transition':''}`} aria-hidden="true">
    <svg className="ultimate-prestige-frame" viewBox="0 0 420 440" fill="none">
      <path className="ultimate-prestige-outline" pathLength="1" d="M210 18L383 118V322L210 422L37 322V118Z"/>
      <path className="ultimate-prestige-inner" d="M210 38L366 128V312L210 402L54 312V128Z"/>
      <path className="ultimate-prestige-cuts" d="M210 18V38M383 118L366 128M383 322L366 312M210 422V402M37 322L54 312M37 118L54 128"/>
      <path className="ultimate-prestige-trace" pathLength="1" d="M210 18L383 118V322L210 422L37 322V118Z"/>
      {[[210,18],[383,118],[383,322],[210,422],[37,322],[37,118]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}><g className="ultimate-prestige-glint" style={{'--glint-delay':`${transition?i*.055:.65+i*.28}s`}}><circle className="ultimate-glint-halo" r="7"/><circle className="ultimate-glint-core" r="2"/><path d="M-11.5 0H11.5M0-7.5V7.5"/></g></g>)}
    </svg>
  </div>;
}

export function CheckpointUltimateIntro({progress=0,light=false,onRequestClose}) {
  const value=Math.max(0,Math.min(100,Math.round(progress)));
  return <div className={`checkpoint-ultimate-intro${light?' is-light':''}`}>
    <div className="checkpoint-ultimate-studio" aria-hidden="true"><div className="ultimate-studio-light"/>{!light&&<><div className="ultimate-studio-beams"><i/><i/></div><div className="ultimate-studio-caustics"/></>}<div className="ultimate-studio-floor"/></div>
    {onRequestClose&&<button className="checkpoint-gold-skip" onClick={onRequestClose}>Passer</button>}
    <main className="checkpoint-ultimate-stage">
      <span className="checkpoint-ultimate-edition">LA SIGNATURE CHECKPOINT</span>
      <div className="checkpoint-ultimate-object">{!light&&<UltimatePrestigeSetting/>}<CheckpointMark variant="diamond"/>{!light&&<div className="checkpoint-ultimate-reflection" aria-hidden="true"><CheckpointMark variant="diamond"/></div>}</div>
      <div className="checkpoint-ultimate-lockup"><h1>CHECKPOINT</h1><p className="checkpoint-ultimate-wordmark"><span/>ULTIME<span/></p></div>
    </main>
    <div className="checkpoint-gold-loading"><div><span>Ton espace se prépare</span><strong>{value}%</strong></div><div className="checkpoint-gold-progress" role="progressbar" aria-label="Chargement de Checkpoint Ultime" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{width:`${value}%`}}/></div></div>
  </div>;
}

function UltimateCrownLighting(){
  const paint=`ultimate-crown-${useId().replace(/[^a-zA-Z0-9_-]/g,'')}`;
  const rails=['M-120 1100L500 90L1120 1100','M80 1100L500 90L920 1100'];
  return <div className="ultimate-cut-lighting" aria-hidden="true">
    <svg className="ultimate-crown-light" viewBox="0 0 1000 1000" preserveAspectRatio="none" fill="none">
      <defs><linearGradient id={paint} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f1fcff"/><stop offset=".4" stopColor="#c3e6fc"/><stop offset="1" stopColor="#8daccb" stopOpacity=".2"/></linearGradient></defs>
      {rails.map((path,i)=><g key={path} className="ultimate-crown-rail"><path className="ultimate-crown-bloom" d={path}/><path className="ultimate-crown-edge" d={path} stroke={`url(#${paint})`} vectorEffect="non-scaling-stroke"/><path className="ultimate-crown-caustic" d={path} pathLength="1" vectorEffect="non-scaling-stroke" style={{animationDelay:`${i*.06}s`}}/></g>)}
    </svg>
    <div className="ultimate-apex-flare"/><div className="ultimate-diamond-aura"/>
  </div>;
}

function CheckpointCrownTransition({light=false,direction='right'}) {
  return <div className={`checkpoint-ultimate-transition checkpoint-premium-transition checkpoint-crown-transition direction-${direction}${light?' is-light':''}`} aria-hidden="true">
    <div className="checkpoint-ultimate-veil"/>
    {!light&&<><UltimateCrownLighting/><UltimatePrestigeSetting transition/></>}
    <div className="checkpoint-ultimate-seal"><CheckpointMark variant="platinum"/></div>
  </div>;
}

export function CheckpointUltimateTransition(props){return <UltimateVaultTransition {...props} Mark={CheckpointMark}/>;}
