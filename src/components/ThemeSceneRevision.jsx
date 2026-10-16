import { useId } from "react";
import "./ThemeSceneRevision.css";

// Intro plates are loaded only for the selected universe. Short transitions never
// download them: their separate geometry stays cheap on entry-level phones.
const PLATES = {godwar:"leviathan",outlaw:"western",assassin:"florence",future:"time-machine",jurassic:"park-gates"};

function Atmosphere({light,kind="dust"}) {
  return <div className={`rv-atmosphere rv-${kind}`}>{Array.from({length:light?4:20},(_,i)=><i key={i} style={{"--x":`${i*61.803%100}%`,"--y":`${i*37.719%100}%`,"--delay":`${-i*.43}s`}}/>)}</div>;
}

function SpartanHelmet({id}) {
  return <svg className="rv-spartan" viewBox="0 0 400 430" fill="none">
    <defs><linearGradient id={`${id}-armor`} x1="80" y1="50" x2="300" y2="330" gradientUnits="userSpaceOnUse"><stop stopColor="#a6ae7a"/><stop offset=".25" stopColor="#63744b"/><stop offset=".6" stopColor="#344b37"/><stop offset="1" stopColor="#152c26"/></linearGradient><linearGradient id={`${id}-visor`} x1="100" y1="120" x2="280" y2="230" gradientUnits="userSpaceOnUse"><stop stopColor="#fff3be"/><stop offset=".22" stopColor="#d4a64d"/><stop offset=".5" stopColor="#8e591c"/><stop offset=".74" stopColor="#dca24c"/><stop offset="1" stopColor="#674519"/></linearGradient></defs>
    <path d="M113 319L91 365L53 389L48 430H350L346 389L308 365L286 319" fill="#122520" stroke="#52614b" strokeWidth="3"/>
    <path d="M123 350L146 397H254L277 350M98 373L117 420M303 373L284 420" stroke="#070f12" strokeWidth="13"/>
    <path d="M82 143L91 96Q112 35 162 32H238Q288 35 309 96L318 143L326 260L294 319L256 350H144L106 319L74 260Z" fill={`url(#${id}-armor)`} stroke="#849175" strokeWidth="2"/>
    <path d="M96 106L119 71L153 62H247L281 71L304 106L264 93H136Z" fill="#83906b"/>
    <path d="M169 33L163 89H237L231 33M145 44L136 88M255 44L264 88" fill="#384c36" stroke="#b6bc91" strokeWidth="2"/>
    <path d="M86 128L122 100H278L314 128L292 197L250 212H150L108 197Z" fill="#101b19" stroke="#a1a980" strokeWidth="3"/>
    <path d="M106 131L137 117H263L294 131L281 179L247 195H153L119 179Z" fill={`url(#${id}-visor)`} stroke="#473d23" strokeWidth="3"/>
    <path d="M117 135L143 125H258L282 134M139 141H258" stroke="#fff4cd" strokeWidth="2" opacity=".7"/>
    <path d="M115 147L128 166L153 177H242L276 155" stroke="#f8ce75" opacity=".35" strokeWidth="8"/>
    <path d="M81 154L66 163L65 244L82 265L105 239L108 203L87 189ZM319 154L334 163L335 244L318 265L295 239L292 203L313 189Z" fill="#304536" stroke="#72816a" strokeWidth="3"/>
    <path d="M111 202L145 220L159 250H241L255 220L289 202L293 272L266 317L248 332H152L134 317L107 272Z" fill="#283e32" stroke="#7e8c6d" strokeWidth="3"/>
    <path d="M151 215L160 202H240L249 215L234 251H166Z" fill="#526347" stroke="#9aa27d" strokeWidth="2"/>
    <path d="M166 220H234M170 230H230M174 240H226" stroke="#14251f" strokeWidth="5"/>
    <path d="M136 265L154 255H246L264 265L245 300H155Z" fill="#131f20" stroke="#607157" strokeWidth="3"/>
    <path d="M161 269H239M164 280H236M170 290H230" stroke="#485c46" strokeWidth="4"/>
    <path d="M111 226L128 236L132 268L118 258M289 226L272 236L268 268L282 258M143 312L162 319H238L257 312" stroke="#abb28d" strokeWidth="3"/>
    <path d="M78 172V231M322 172V231" stroke="#111f1b" strokeWidth="5"/>
    {[0,1].map(i=><g key={i} transform={i?"translate(400 0) scale(-1 1)":undefined}><rect x="89" y="209" width="7" height="19" rx="2" fill="#91b8c0"/><path d="M100 280L116 300M121 91L135 83M108 310L122 318" stroke="#c0c5a2" strokeWidth="2" opacity=".55"/></g>)}
  </svg>;
}

function PortalArrival({light}) {
  return <div className="rv-test-chamber"><div className="rv-chamber-ceiling"/><div className="rv-chamber-floor"/><div className="rv-observation-window"><i/><i/></div><div className="rv-aperture-door"><span>01</span>{Array.from({length:light?4:8},(_,i)=><i key={i} style={{"--sector":i*(light?90:45)}}/>)}</div><div className="rv-test-sign"><b>01</b><span>CHAMBRE DE TEST</span><i>→</i></div></div>;
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
  const id=`rv-${useId().replace(/:/g,"")}`;
  return <div className={`rv-intro-scene rv-intro-${motif}`} data-scene-purpose="intro" aria-hidden="true">
    {PLATES[motif]?<img className="rv-cinematic-plate" src={`/theme-scenes/${PLATES[motif]}-v2.webp`} alt="" fetchPriority="high" decoding="async"/>:motif==="halo"?<><div className="rv-halo-sky"/><SpartanHelmet id={id}/><div className="rv-helmet-readout"><span>MJOLNIR / MARK VI</span><b>117</b></div></>:<DistinctIntro motif={motif} light={light}/>}
    {motif==="godwar"&&<div className="rv-frost-mist"/>}
    {motif==="jurassic"&&<><div className="rv-torch-glow left"/><div className="rv-torch-glow right"/></>}
    <Atmosphere light={light} kind={motif==="godwar"?"snow":motif==="jurassic"?"rain":"dust"}/><div className="rv-intro-vignette"/>
  </div>;
}

function RuneStone({light}) {
  return <div className="rv-runestone"><svg viewBox="0 0 600 600" fill="none"><path d="M300 48C162 48 49 161 49 300S162 551 300 551S551 438 551 300S438 49 300 49" stroke="#4c7780" strokeWidth="17"/><path d="M184 470C86 408 81 230 164 143M416 470C514 408 519 230 436 143" stroke="#b54a3e" strokeWidth="32"/><path d="M182 470L228 470M418 470L372 470" stroke="#b54a3e" strokeWidth="23"/>{Array.from({length:light?8:16},(_,i)=><path key={i} d="M293 67V95M293 72L305 80L293 86" stroke="#b9ecf0" strokeWidth="3" transform={`rotate(${i*(light?45:22.5)} 300 300)`}/>)}<path className="rv-frost-fracture" d="M300 0L277 140L339 234L278 314L325 449L300 600M278 314L154 366L0 339M339 234L446 165L600 199" stroke="#d4fcff" strokeWidth="4"/></svg></div>;
}

export function RevisedTransitionScene({motif,light=false}) {
  if(!["halo","godwar","outlaw","assassin","future","jurassic"].includes(motif))return null;
  return <div className={`rv-transfer rv-transfer-${motif}`} data-scene-purpose="transition" aria-hidden="true">
    {motif==="halo"&&<><div className="rv-halo-orbit"/><div className="rv-halo-reticle"><i/><i/><i/><i/></div><div className="rv-halo-scan"/><span className="rv-transfer-code">UNSC // SLIPSPACE DRIVE</span></>}
    {motif==="godwar"&&<><RuneStone light={light}/><div className="rv-frost-front"/></>}
    {motif==="outlaw"&&<><div className="rv-western-sun"/><svg className="rv-western-panorama" viewBox="0 0 400 800" preserveAspectRatio="none"><path d="M0 443L28 425L38 309L91 305L106 424L139 448L171 497L220 516L277 474L300 350L351 347L368 451L400 460V800H0Z" fill="#8a3828"/><path d="M39 316L50 425L101 436M300 362L309 475L357 468M28 426L62 442M310 399L353 401" fill="none" stroke="#c0784355" strokeWidth="2"/><path d="M0 567L72 522L150 577L235 529L311 589L400 537V800H0Z" fill="#4c1b19"/><path d="M0 660L135 613L260 680L400 631V800H0Z" fill="#280e11"/></svg><div className="rv-ink-swipe"/><div className="rv-film-edge top"/><div className="rv-film-edge bottom"/></>}
    {motif==="assassin"&&<><div className="rv-animus-whiteout"/><svg className="rv-creed-sigil" viewBox="0 0 400 400" fill="none"><path d="M200 29L61 321Q111 315 140 336L165 294Q117 298 113 288L200 86L287 288Q283 298 235 294L260 336Q289 315 339 321Z" stroke="#e9ece8" strokeWidth="4"/><path d="M128 344Q200 380 272 344" stroke="#b25a52" strokeWidth="9"/></svg><div className="rv-animus-panels">{Array.from({length:light?4:12},(_,i)=><i key={i} style={{"--n":i}}/>)}</div></>}
    {motif==="future"&&<><div className="rv-jump-clock"><span>VITESSE TEMPORELLE</span><b>88</b><small>MPH</small></div><div className="rv-time-road"/><div className="rv-time-track left"/><div className="rv-time-track right"/><svg className="rv-jump-lightning" viewBox="0 0 1000 900" preserveAspectRatio="none"><path d="M340 0L420 150L367 226L530 369L460 464L570 650L500 900M530 369L699 302L745 410L1000 437" fill="none" stroke="#c3f3ff" strokeWidth="5"/></svg><div className="rv-jump-flash"/></>}
    {motif==="jurassic"&&<><div className="rv-park-opening"><div className="rv-park-door left"/><div className="rv-park-door right"/><div className="rv-park-lintel"><span>JURASSIC<br/>PARK</span></div><div className="rv-park-column left"/><div className="rv-park-column right"/></div><div className="rv-park-fog"/><div className="rv-park-foliage"/></>}
    <Atmosphere light={light} kind={motif==="godwar"?"snow":"dust"}/>
  </div>;
}

export const REVISED_TRANSITIONS = new Set(["halo","godwar","outlaw","assassin","future","jurassic"]);
