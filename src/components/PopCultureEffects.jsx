import { useEffect, useId } from "react";
import { getPopCultureTheme } from "../data/popCultureThemes";
import "./PopCultureThemes.css";
import "./PopCultureEffects.css";

function DigitalGrid({ legacy, light }) {
  return <div className="pc-digital-landscape" aria-hidden="true">
    <div className="pc-grid-horizon"/>
    <svg className="pc-grid-floor" viewBox="0 0 1200 800" preserveAspectRatio="none">
      {Array.from({length:light?11:21},(_,i)=><path key={i} d={`M600 380L${-1800+i*(light?480:240)} 850`}/>)}
      <g className="pc-grid-rows">{Array.from({length:11},(_,i)=><path key={i} d={`M0 ${380+12*1.4**i}H1200`}/>)}</g>
    </svg>
    <svg className="pc-grid-city" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
      {Array.from({length:light?8:16},(_,i)=>{const x=i*85-40,height=50+(i*43%145);return legacy
        ? <path key={i} d={`M${x} 520V${520-height}l32 -12 25 12V520M${x+32} ${508-height}V520`} />
        : <path key={i} d={`M${x} 520l40 -${height} 50 ${height}M${x+40} ${520-height}v${height}M${x+10} ${520-height*.25}h68M${x+20} ${520-height*.5}h47`} />;})}
    </svg>
    {!legacy&&<svg className="pc-recognizer" viewBox="0 0 300 210"><path d="M22 20H278V69H234V173H196V59H104V173H66V69H22Z" fill="#2c0d29" stroke="#ff758b" strokeWidth="4"/><path d="M40 34H260M80 85V157M220 85V157" stroke="#ffb7c3" strokeWidth="2"/><path d="M115 40H185" stroke="#d8efff" strokeWidth="6"/></svg>}
    {legacy&&<svg className="pc-identity-disc" viewBox="0 0 400 400"><circle cx="200" cy="200" r="150" fill="#02090e" stroke="#21414d" strokeWidth="38"/><circle cx="200" cy="200" r="150" fill="none" stroke="#bdf9ff" strokeWidth="7"/><circle cx="200" cy="200" r="127" fill="none" stroke="#54dff6" strokeWidth="3" strokeDasharray="190 18 60 18"/><path d="M93 93A151 151 0 0 1 307 93" fill="none" stroke="#fff" strokeWidth="4"/></svg>}
    <svg className="pc-light-trails" viewBox="0 0 1200 800" preserveAspectRatio="none"><path className="pc-trail-blue" pathLength="1" d="M-80 670H250V590H790V710H1280"/><path className="pc-trail-orange" pathLength="1" d="M1280 750H930V640H490V760H-80"/></svg>
    {!light&&<div className="pc-grid-motes">{Array.from({length:16},(_,i)=><i key={i} style={{left:`${i*61.8%100}%`,top:`${i*37.7%100}%`,animationDelay:`${-i*.23}s`}}/>)}</div>}
  </div>;
}

function TimeCircuits({ light }) {
  return <div className="pc-time-scene" aria-hidden="true">
    <div className="pc-time-tunnel">{Array.from({length:light?3:7},(_,i)=><i key={i} style={{"--ring":i}}/>)}</div>
    <div className="pc-time-console">
      <div className="pc-time-readout destination"><span>DESTINATION</span><b>OCT 21 2015</b></div>
      <div className="pc-time-readout present"><span>PRÉSENT</span><b>NOV 05 1955</b></div>
      <div className="pc-time-readout last"><span>DERNIER DÉPART</span><b>OCT 26 1985</b></div>
      <svg className="pc-flux-core" viewBox="0 0 240 220"><rect x="15" y="10" width="210" height="195" rx="22" fill="#111b20" stroke="#81969b" strokeWidth="5"/><rect x="28" y="24" width="184" height="166" rx="15" fill="#080e13" stroke="#374b53"/><g fill="none" strokeLinecap="round"><path d="M65 54L120 112L175 54M120 112V174" stroke="#243841" strokeWidth="21"/><path className="pc-flux-wire" d="M65 54L120 112L175 54M120 112V174" stroke="#a5efff" strokeWidth="7" pathLength="1"/></g><circle cx="120" cy="112" r="10" fill="#e4fdff"/></svg>
      <span className="pc-speed"><b>88</b> MPH</span>
    </div>
    <svg className="pc-fire-tracks" viewBox="0 0 1200 800" preserveAspectRatio="none"><path d="M475 410L90 850M725 410L1110 850" stroke="#bb4717" strokeWidth="44"/><path d="M475 410L90 850M725 410L1110 850" stroke="#ffc468" strokeWidth="12"/><path className="pc-time-bolt" d="M400 -40L560 220L495 290L680 530L635 590L850 860" fill="none" stroke="#bdf5ff" strokeWidth="5"/></svg>
  </div>;
}

function Amber({ id }) {
  return <svg className="pc-amber" viewBox="0 0 360 360" aria-hidden="true"><defs><radialGradient id={id} cx="38%" cy="30%"><stop stopColor="#ffe4a1"/><stop offset=".5" stopColor="#dd9c30"/><stop offset="1" stopColor="#6a310e"/></radialGradient></defs>
    <path d="M166 21L264 51L323 143L302 254L224 326L114 313L39 236L45 126L99 51Z" fill={`url(#${id})`} stroke="#eab965" strokeWidth="3"/>
    <path d="M166 21L186 88L264 51M45 126L102 148L39 236M224 326L206 264L302 254M99 51L124 96" fill="none" stroke="#ffe3a555" strokeWidth="2"/>
    <g transform="rotate(-22 180 170)" fill="#35220c" stroke="#35220c" strokeWidth="3" strokeLinecap="round"><ellipse cx="181" cy="185" rx="7" ry="24"/><circle cx="180" cy="153" r="8"/><path d="M180 146L177 114M176 169L142 155L120 134M185 168L221 152L239 133M176 186L143 195L124 218M186 184L217 198L239 221M177 195L155 229M185 195L206 232" fill="none"/><ellipse cx="158" cy="159" rx="13" ry="34" transform="rotate(-40 158 159)" fill="#ffdc8b70" strokeWidth="2"/><ellipse cx="204" cy="159" rx="13" ry="34" transform="rotate(40 204 159)" fill="#ffdc8b70" strokeWidth="2"/></g>
    <path d="M85 111L113 71L165 57" fill="none" stroke="#fff2c0" strokeWidth="5" opacity=".6"/>
  </svg>;
}

function JurassicScene({ light, id }) {
  return <div className="pc-jurassic-scene" aria-hidden="true">
    <div className="pc-jungle-moon"/>
    <div className="pc-park-gates"><div className="pc-gate left"/><div className="pc-gate right"/><div className="pc-gate-pillar left"/><div className="pc-gate-pillar right"/></div>
    <Amber id={id}/>
    <svg className="pc-jungle-leaves" viewBox="0 0 1200 800" preserveAspectRatio="none" fill="none" stroke="#274b33" strokeWidth="5">
      {[false,true].map(flip=><g key={String(flip)} transform={flip?'translate(1200 0) scale(-1 1)':undefined}>
        <path d="M-40 800Q210 500 60 120M0 540Q180 480 290 220M0 710Q150 670 330 520"/>
        {Array.from({length:light?5:10},(_,i)=><g key={i} transform={`translate(${60+i*16} ${250+i*45}) rotate(${i*8})`}><path d="M0 0Q-105 -58 -150 -38Q-76 24 0 0" fill="#10281b"/><path d="M0 0Q34 -89 96 -110Q94 -25 0 0" fill="#152e1d"/></g>)}
      </g>)}
    </svg>
    <div className="pc-rain">{Array.from({length:light?8:30},(_,i)=><i key={i} style={{left:`${i*61.803%100}%`,animationDelay:`${-i*.17}s`,animationDuration:`${.7+i%4*.12}s`}}/>)}</div>
    <div className="pc-park-dust">{Array.from({length:light?4:16},(_,i)=><i key={i} style={{left:`${i*61.8%100}%`,top:`${i*37.7%100}%`,animationDelay:`${-i*.34}s`}}/>)}</div>
  </div>;
}

function Scene({ motif, light }) {
  const id = `amber-${useId().replace(/:/g,"")}`;
  if (motif === "original" || motif === "legacy") return <DigitalGrid legacy={motif === "legacy"} light={light}/>;
  if (motif === "future") return <TimeCircuits light={light}/>;
  return <JurassicScene light={light} id={id}/>;
}

export function PopCultureIntro({ theme, progress = 0, light = false, effects = "balanced", onRequestClose }) {
  const config = getPopCultureTheme(theme);
  useEffect(() => {
    if (!config) return;
    document.documentElement.classList.add("checkpoint-pop-intro-active");
    return () => document.documentElement.classList.remove("checkpoint-pop-intro-active");
  }, [config]);
  if (!config) return null;
  const value = Math.max(0,Math.min(100,Math.round(Number(progress)||0)));
  const reduced = light || effects === "calm";
  return <section className={`pc-boot pc-${config.motif} ${reduced?"is-light":""} ${value===100?"is-ready":""}`} aria-label={`Introduction ${config.label}`}>
    <Scene motif={config.motif} light={reduced}/><div className="pc-scene-shade"/>
    <header className="pc-boot-header"><span>{config.universe}</span>{onRequestClose&&<button type="button" onClick={onRequestClose}>Passer l’intro <span aria-hidden="true">›</span></button>}</header>
    <div className="pc-boot-copy"><span>{config.motif==="original"?"SYSTÈME ENCOM":config.motif==="legacy"?"LA GRILLE":config.motif==="future"?"LE TEMPS T’APPARTIENT":"LA VIE TROUVE UN CHEMIN"}</span><h1>CHECKPOINT</h1><p>{config.subtitle}</p></div>
    <footer className="pc-boot-loading"><div><span>{value===100?"Tout est prêt":"Chargement…"}</span><strong>{value} %</strong></div><div className="pc-load-track" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><i style={{width:`${value}%`}}/></div></footer>
  </section>;
}

export function PopCultureTransition({ theme, direction = "right", light = false, effects = "balanced" }) {
  const config = getPopCultureTheme(theme);
  if (!config) return null;
  return <div className={`pc-tab-transition pc-${config.motif} direction-${direction} ${light||effects==="calm"?"is-light":""}`} aria-hidden="true">
    <div className="pc-transition-stage"><Scene motif={config.motif} light={light||effects==="calm"}/></div>
    <div className="pc-transition-label">{config.motif==="original"?"TRANSFERT ENCOM":config.motif==="legacy"?"GRILLE ACTIVE":config.motif==="future"?"88 MPH":"ACCÈS AU PARC"}</div>
  </div>;
}
