import { useEffect, useId } from "react";
import { getGameUniverseTheme } from "../data/gameUniverseThemes";
import "./PopCultureEffects.css";
import "./GameUniverseThemes.css";
import "./GameUniverseEffects.css";
import { MORE_GAME_SCENES } from "./MoreGameScenes";
import { RevisedIntroScene, RevisedTransitionScene, REVISED_TRANSITIONS } from "./ThemeSceneRevision";

function Particles({ kind="embers", light, boost }) {
  const count=light?5:boost?38:24;
  return <div className={`gu-particles gu-${kind}`} aria-hidden="true">{Array.from({length:count},(_,i)=><i key={i} style={{"--x":`${i*61.803%100}%`,"--y":`${i*37.719%100}%`,"--delay":`${-i*.31}s`,"--drift":`${(i%2?1:-1)*(25+i%6*8)}px`,"--turn":`${i*47}deg`,"--size":`${2+i%4}px`}}/>)}</div>;
}

function EldenScene({ light, boost }) {
  return <div className="gu-world gu-elden-world" aria-hidden="true">
    <svg className="gu-golden-tree" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#c4aa58" strokeLinecap="round"><path d="M500 850Q540 510 492 310Q480 230 510 60" strokeWidth="17"/><path d="M500 430Q390 250 180 230M493 315Q660 190 840 175M491 300Q380 120 270 70M505 195Q610 95 700 20" strokeWidth="8"/>{!light&&<g strokeWidth="3"><path d="M355 282Q315 143 170 110M410 330Q165 359 50 245M620 234Q690 63 850 50M695 208Q870 325 1040 290M510 110Q426 67 380 -20M320 151Q445 123 460 20"/></g>}</svg>
    <svg className="gu-hero gu-grace" viewBox="0 0 360 370" fill="none"><g stroke="#e9cd83" strokeWidth="3"><path className="gu-grace-line" pathLength="1" d="M180 18V348M134 44Q180 79 226 44M126 319Q180 291 234 319"/><circle className="gu-grace-line" pathLength="1" cx="180" cy="141" r="88"/><circle className="gu-grace-line" pathLength="1" cx="137" cy="217" r="88"/><circle className="gu-grace-line" pathLength="1" cx="223" cy="217" r="88"/><circle cx="180" cy="190" r="145" stroke="#c4a454" strokeWidth="1" strokeDasharray="8 14"/>{Array.from({length:light?6:12},(_,i)=><path key={i} d="M177 28L183 18L189 28M183 18V38" transform={`rotate(${i*(light?60:30)} 180 190)`} strokeWidth="1.5"/>)}</g><path d="M95 160L116 169M215 72L226 80M269 231L281 237M152 285L144 301" stroke="#17150c" strokeWidth="8"/></svg>
    <div className="gu-grace-ground"/><Particles kind="embers" light={light} boost={boost}/>
  </div>;
}

function RaptureCity({ light }) {
  return <g fill="#102d38" stroke="#69a69f" strokeWidth="1.5">{Array.from({length:light?7:13},(_,i)=>{const x=25+i*(light?45:25),h=45+i*43%120;return <g key={i}><path d={`M${x} 290V${290-h}h7v-14h12v14h8V290Z`}/><path d={`M${x+9} ${290-h+15}V278M${x+19} ${290-h+15}V278`} stroke="#d9b96d" strokeDasharray="4 9" opacity=".6"/></g>;})}</g>;
}
function BioShockScene({ light, boost, id }) {
  return <div className="gu-world gu-bioshock-world" aria-hidden="true">
    <div className="gu-ocean-shafts">{Array.from({length:light?1:3},(_,i)=><i key={i} style={{left:`${12+i*34}%`,animationDelay:`${-i*2}s`}}/>)}</div>
    <svg className="gu-deco-frame" viewBox="0 0 1000 800" preserveAspectRatio="none" fill="none" stroke="#b99a5d55"><path d="M40 800V130L160 20H840L960 130V800M60 800V140L170 40H830L940 140V800M80 800V150L180 60H820L920 150V800"/>{!light&&[0,1,2,3].map(i=><path key={i} d={`M${70+i*15} 110L500 ${240+i*20}L${930-i*15} 110`}/>)}</svg>
    <svg className="gu-hero gu-porthole" viewBox="0 0 360 360"><defs><clipPath id={id}><circle cx="180" cy="180" r="127"/></clipPath><radialGradient id={`${id}-sea`}><stop stopColor="#397474"/><stop offset="1" stopColor="#082c3b"/></radialGradient></defs><circle cx="180" cy="180" r="157" fill="#302e22" stroke="#d0ab68" strokeWidth="9"/><circle cx="180" cy="180" r="138" fill="#0c242c" stroke="#8d794e" strokeWidth="3"/><g clipPath={`url(#${id})`}><circle cx="180" cy="180" r="127" fill={`url(#${id}-sea)`}/><RaptureCity light={light}/><path d="M70 112Q180 145 290 112M60 132Q180 165 300 132" fill="none" stroke="#a9e2ca" strokeWidth="2" opacity=".25"/></g>{Array.from({length:8},(_,i)=><circle key={i} cx="180" cy="31" r="5" fill="#f0cb86" transform={`rotate(${i*45} 180 180)`}/>)}<text x="180" y="198" textAnchor="middle" fill="#f1d392" fontFamily="Georgia,serif" fontSize="25" letterSpacing="4">RAPTURE</text></svg>
    <div className="gu-waterline"/><Particles kind="bubbles" light={light} boost={boost}/>
  </div>;
}

function PortalScene({ light, boost }) {
  return <div className="gu-world gu-portal-world" aria-hidden="true">
    <div className="gu-test-tiles"/><div className="gu-test-light"/>
    <div className="gu-portal-door orange"><i/></div><div className="gu-portal-door blue"><i/></div>
    <svg className="gu-hero gu-companion" viewBox="0 0 360 360" fill="none"><path d="M180 35L290 105L315 235L180 328L45 235L70 105Z" fill="#314c5d" stroke="#b6d8da" strokeWidth="3"/><path d="M180 35L180 328M70 105L290 105L180 328L70 105L315 235H45L290 105L180 35" stroke="#a5cbd277" strokeWidth="2"/><path d="M180 35L290 105L180 180L70 105Z" fill="#c4dddd22"/><path d="M180 180L315 235L180 328Z" fill="#e0b78b22"/><circle cx="180" cy="180" r="24" stroke="#d4d9c4" strokeWidth="2"/><path d="M160 180H200M180 160V200" stroke="#d9ded3" strokeWidth="2"/></svg>
    <div className="gu-test-line"><span>01</span><i/><span>02</span></div><Particles kind="test-dust" light={light} boost={boost}/>
  </div>;
}

function CrossingScene({ light, boost }) {
  return <div className="gu-world gu-crossing-world" aria-hidden="true">
    <div className="gu-island-sunset"/><div className="gu-soft-cloud one"/><div className="gu-soft-cloud two"/>
    <svg className="gu-hero gu-island" viewBox="0 0 400 360"><ellipse cx="200" cy="284" rx="180" ry="47" fill="#579f9a"/><ellipse cx="200" cy="268" rx="160" ry="46" fill="#dfce9c"/><ellipse cx="200" cy="251" rx="145" ry="41" fill="#7fa97e"/><path d="M196 253L200 309L220 309L214 256" fill="#b29968"/><path d="M184 284H232M187 296H233" stroke="#e3cea0" strokeWidth="4"/><path d="M158 170H263V254H158Z" fill="#e9dbb4" stroke="#9b8c66" strokeWidth="3"/><path d="M142 174L209 117L278 174Z" fill="#bf7664" stroke="#e9bd91" strokeWidth="4"/><path d="M191 208Q210 191 228 208V254H191Z" fill="#667f73"/><rect x="172" y="188" width="20" height="22" rx="3" fill="#f4d592"/><path d="M181 188V210M172 199H192" stroke="#baa16b" strokeWidth="2"/><path d="M106 163V251" stroke="#816947" strokeWidth="15"/><path d="M105 192L84 176M108 211L130 188" stroke="#816947" strokeWidth="6"/><circle cx="104" cy="141" r="44" fill="#6c9e70"/><circle cx="81" cy="160" r="30" fill="#7dab79"/><circle cx="126" cy="161" r="31" fill="#7dab79"/><circle cx="85" cy="149" r="8" fill="#e5a080"/><circle cx="121" cy="170" r="8" fill="#e5a080"/><circle cx="112" cy="125" r="8" fill="#e5a080"/><path d="M300 229Q295 208 310 195Q325 208 320 229" fill="#c4d89e"/><circle cx="281" cy="251" r="5" fill="#f4dfa2"/><circle cx="290" cy="244" r="4" fill="#f4dfa2"/></svg>
    <svg className="gu-gift-balloon" viewBox="0 0 100 180"><path d="M52 72Q43 115 55 139" fill="none" stroke="#f1d9bc" strokeWidth="2"/><ellipse cx="50" cy="42" rx="30" ry="36" fill="#dca28e"/><path d="M41 77H58L50 67Z" fill="#dca28e"/><rect x="27" y="136" width="48" height="35" rx="3" fill="#f0dfbb"/><path d="M51 136V171M27 148H75" stroke="#bd7971" strokeWidth="7"/></svg>
    <svg className="gu-leaf-wipe" viewBox="0 0 300 330"><path d="M250 20C85 -5 11 95 32 205C43 262 89 290 145 274C210 256 265 177 250 20Z" fill="#afd1a0"/><path d="M47 314Q111 172 219 63M107 204L72 142M145 157L202 159" fill="none" stroke="#4f8760" strokeWidth="10" strokeLinecap="round"/></svg><Particles kind="fireflies" light={light} boost={boost}/>
  </div>;
}

function GameScene({ motif, light, boost }) {
  const id=`gu-window-${useId().replace(/:/g,"")}`;
  const props={light,boost,id};
  if(REVISED_TRANSITIONS.has(motif))return <RevisedTransitionScene motif={motif} light={light}/>;
  const MoreScene=MORE_GAME_SCENES[motif];
  if(MoreScene)return <MoreScene {...props}/>;
  switch(motif){
    case "elden":return <EldenScene {...props}/>;
    case "bioshock":return <BioShockScene {...props}/>;
    case "portal":return <PortalScene {...props}/>;
    case "crossing":return <CrossingScene {...props}/>;
    default:return null;
  }
}

export function GameUniverseIntro({ theme, progress=0, effects="balanced", light=false, onRequestClose }) {
  const config=getGameUniverseTheme(theme);
  useEffect(()=>{
    if(!config)return;
    document.documentElement.classList.add("checkpoint-game-intro-active");
    return()=>document.documentElement.classList.remove("checkpoint-game-intro-active");
  },[config]);
  if(!config)return null;
  const value=Math.max(0,Math.min(100,Math.round(Number(progress)||0))),reduced=light||effects==="calm";
  return <section className={`pc-boot gu-boot gu-${config.motif} ${reduced?"is-light":""} ${value===100?"is-ready":""}`} aria-label={`Introduction ${config.label}`}>
    <RevisedIntroScene motif={config.motif} light={reduced}/><div className="pc-scene-shade"/>
    <header className="pc-boot-header"><span>{config.sceneTitle||config.universe}</span>{onRequestClose&&<button type="button" onClick={onRequestClose}>Passer l’intro <span aria-hidden="true">›</span></button>}</header>
    <div className="pc-boot-copy"><span>{config.kicker}</span><h1>CHECKPOINT</h1><p>{config.subtitle}</p></div>
    <footer className="pc-boot-loading"><div><span>{value===100?"Tout est prêt":"Chargement…"}</span><strong>{value} %</strong></div><div className="pc-load-track" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><i style={{width:`${value}%`}}/></div></footer>
  </section>;
}

export function GameUniverseTransition({ theme, direction="right", effects="balanced", light=false }) {
  const config=getGameUniverseTheme(theme);
  if(!config)return null;
  return <div className={`pc-tab-transition gu-tab-transition gu-${config.motif} direction-${direction} ${light||effects==="calm"?"is-light":""}`} aria-hidden="true">
    <div className="pc-transition-stage"><GameScene motif={config.motif} light={light||effects==="calm"} boost={effects==="boost"}/></div><div className="pc-transition-label">{config.transition}</div>
  </div>;
}
