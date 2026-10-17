import InspiredWorldCanvas from "./InspiredWorldCanvas";
import { INSPIRED_WORLDS } from "../services/inspiredWorlds";
import "./ThemeSceneRevision.css";

function Atmosphere({light,kind="dust"}) {
  return <div className={`rv-atmosphere rv-${kind}`}>{Array.from({length:light?4:20},(_,i)=><i key={i} style={{"--x":`${i*61.803%100}%`,"--y":`${i*37.719%100}%`,"--delay":`${-i*.43}s`}}/>)}</div>;
}

function DistinctIntro({motif,light}) {
  switch(motif){
    case "elden": return <div className="rv-grace-site"><div className="rv-grace-horizon"/><svg viewBox="0 0 400 360"><path d="M0 310Q90 230 200 270Q290 225 400 300V360H0" fill="#20251b"/><path d="M200 275Q128 208 198 98Q168 211 212 235Q245 175 225 154Q282 236 200 275" fill="#eac476"/><path d="M202 273Q170 188 200 122" fill="none" stroke="#fff1c0" strokeWidth="3"/><ellipse cx="200" cy="281" rx="55" ry="7" fill="#ba914c" opacity=".35"/></svg></div>;
    case "portal": return <PortalArrival light={light}/>;
    case "bioshock": return <div className="rv-lighthouse"><div className="rv-sea"/><svg viewBox="0 0 400 400"><path d="M76 374L106 324H144L156 152H244L256 324H294L324 374Z" fill="#182d30" stroke="#bd9c60" strokeWidth="2"/><path d="M151 152L159 104H241L249 152ZM163 104V75H237V104L200 53Z" fill="#354d4a" stroke="#c8b17a" strokeWidth="2"/><path d="M162 126H238" stroke="#f8e7b4" strokeWidth="8"/><path d="M178 326V245Q200 227 222 245V326Z" fill="#040f16" stroke="#967f51" strokeWidth="3"/><path d="M200 252V325M151 160H249M128 335H272M111 347H289M93 362H307" stroke="#ab925b" strokeWidth="2"/></svg><div className="rv-lighthouse-beam"/></div>;
    case "crossing": return <div className="rv-island-map"><div className="rv-map-land"><i/><i/><i/><i/><b>⌂</b><span>✿</span><em>×</em></div><span className="rv-map-label">UNE NOUVELLE JOURNÉE SUR TON ÎLE</span></div>;
    case "hollow": return <div className="rv-hallownest"><div className="rv-station-arch"/><div className="rv-bench"><i/><i/><i/><i/><i/></div><div className="rv-station-lamp"><i/></div><div className="rv-cavern-ground"/></div>;
    case "hades": return <div className="rv-underworld"><div className="rv-hell-door"><span>Α</span><i/><i/></div><div className="rv-hell-steps"/></div>;
    case "resident": return <div className="rv-safe-room"><div className="rv-safe-door"><i/><span>SAFE ROOM</span></div><div className="rv-wall-lamp"/><div className="rv-safe-floor"/></div>;
    case "codec": return <div className="rv-incoming"><span>INCOMING CALL</span><b>140.85</b><div>{Array.from({length:light?12:32},(_,i)=><i key={i} style={{"--bar":`${12+i*31%72}%`,"--delay":`${-i*.11}s`}}/>)}</div><small>CANAL SÉCURISÉ · RÉCEPTION</small></div>;
    case "original": return <div className="rv-encom"><span>ENCOM OS / SYSTEM ACCESS</span><div className="rv-terminal-lines"><p>CONNECTING TO MAINFRAME...</p><p>IDENTITY VERIFIED</p><p>DIGITIZATION SEQUENCE</p><b>ENTER THE GRID_</b></div><div className="rv-digitizer">{Array.from({length:light?8:20},(_,i)=><i key={i} style={{"--n":i}}/>)}</div></div>;
    case "legacy": return <div className="rv-grid-arrival"><div className="rv-grid-entrance"/><div className="rv-grid-runway"/>{[0,1,2].map(i=><i className="rv-grid-tower" key={i} style={{"--n":i}}/>)}<div className="rv-grid-sun"/></div>;
    default:return null;
  }
}

export function RevisedIntroScene({motif,light=false}) {
  const original=INSPIRED_WORLDS.has(motif);
  return <div className={`rv-intro-scene rv-intro-${motif}`} data-scene-purpose="intro" aria-hidden="true">
    {original?<InspiredWorldCanvas motif={motif} light={light}/>:<><DistinctIntro motif={motif} light={light}/><Atmosphere light={light}/><div className="rv-intro-vignette"/></>}
  </div>;
}

function RuneStone({light}) {
  return <div className="rv-runestone"><svg viewBox="0 0 600 600" fill="none"><circle cx="300" cy="300" r="230" stroke="#59838b" strokeWidth="6"/><path d="M300 130C140 190 140 410 300 470C460 410 460 190 300 130ZM150 300C220 140 380 140 450 300C380 460 220 460 150 300Z" stroke="#b8dad8" strokeWidth="5"/><path d="M215 165L385 435M385 165L215 435" stroke="#a75d51" strokeWidth="6"/>{Array.from({length:light?8:16},(_,i)=><path key={i} d="M300 40L307 57L300 74L293 57Z" stroke="#c4e7e6" strokeWidth="2" transform={`rotate(${i*(light?45:22.5)} 300 300)`}/>)}<path className="rv-frost-fracture" d="M300 0L277 140L339 234L278 314L325 449L300 600M278 314L154 366L0 339M339 234L446 165L600 199" stroke="#d4fcff" strokeWidth="4"/></svg></div>;
}

export function RevisedTransitionScene({motif,light=false}) {
  if(!["halo","godwar","outlaw","assassin","future","jurassic"].includes(motif))return null;
  return <div className={`rv-transfer rv-transfer-${motif}`} data-scene-purpose="transition" aria-hidden="true">
    {motif==="halo"&&<><div className="rv-halo-orbit"/><div className="rv-halo-reticle"><i/><i/><i/><i/></div><div className="rv-halo-scan"/><span className="rv-transfer-code">RELAIS // SYNCHRONISATION</span></>}
    {motif==="godwar"&&<><RuneStone light={light}/><div className="rv-frost-front"/></>}
    {motif==="outlaw"&&<><div className="rv-western-sun"/><svg className="rv-western-panorama" viewBox="0 0 400 800" preserveAspectRatio="none"><path d="M0 443L28 425L38 309L91 305L106 424L139 448L171 497L220 516L277 474L300 350L351 347L368 451L400 460V800H0Z" fill="#8a3828"/><path d="M39 316L50 425L101 436M300 362L309 475L357 468M28 426L62 442M310 399L353 401" fill="none" stroke="#c0784355" strokeWidth="2"/><path d="M0 567L72 522L150 577L235 529L311 589L400 537V800H0Z" fill="#4c1b19"/><path d="M0 660L135 613L260 680L400 631V800H0Z" fill="#280e11"/></svg><div className="rv-ink-swipe"/><div className="rv-film-edge top"/><div className="rv-film-edge bottom"/></>}
    {motif==="assassin"&&<><div className="rv-animus-whiteout"/><svg className="rv-memory-roof" viewBox="0 0 800 560" fill="none"><path d="M0 440L180 320L340 424L510 315L800 457M180 320V535M340 424V560M510 315V535M0 485L180 368L340 466L510 361L800 498M354 350V239H490V350M344 239Q422 100 500 239M422 145V98M380 240V305M421 240V305M463 240V305" stroke="#c9d6d2" strokeWidth="3"/><path d="M80 388L80 468M510 316L552 343L548 390L510 373" stroke="#c47c64" strokeWidth="5"/><path d="M0 525H800M88 559V468M688 559V433" stroke="#91acb666" strokeWidth="2"/></svg><div className="rv-animus-panels">{Array.from({length:light?4:12},(_,i)=><i key={i} style={{"--n":i}}/>)}</div></>}
    {motif==="future"&&<><div className="rv-jump-clock"><span>VITESSE TEMPORELLE</span><b>Δt</b><small>CHAMP TEMPOREL</small></div><div className="rv-time-road"/><div className="rv-time-track left"/><div className="rv-time-track right"/><svg className="rv-jump-lightning" viewBox="0 0 1000 900" preserveAspectRatio="none"><path d="M340 0L420 150L367 226L530 369L460 464L570 650L500 900M530 369L699 302L745 410L1000 437" fill="none" stroke="#c3f3ff" strokeWidth="5"/></svg><div className="rv-jump-flash"/></>}
    {motif==="jurassic"&&<div className="rv-reserve-passage"><svg viewBox="0 0 1000 1200" preserveAspectRatio="none" fill="none">{[false,true].map(flip=><g key={String(flip)} transform={flip?"translate(1000 0) scale(-1 1)":undefined}><path d="M-90 1230Q390 650 330 -60" stroke="#41634b" strokeWidth="12"/>{Array.from({length:light?5:12},(_,i)=><g key={i} transform={`translate(${150+i*17} ${1040-i*(light?210:94)}) rotate(${-30+i*5})`}><path d="M0 0Q-140 -145 -260 -90Q-190 15 0 0Q155 -175 270 -132Q220 -15 0 0" fill={i%2?"#1f4a39":"#2a5740"}/><path d="M-250 -90L0 0L260 -130" stroke="#78906455" strokeWidth="2"/></g>)}</g>)}</svg><div className="rv-reserve-light"/></div>}
    <Atmosphere light={light} kind={motif==="godwar"?"snow":"dust"}/>
  </div>;
}

export const REVISED_TRANSITIONS = new Set(["halo","godwar","outlaw","assassin","future","jurassic"]);
