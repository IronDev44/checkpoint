import { useEffect } from "react";
import { getPopCultureTheme } from "../data/popCultureThemes";
import "./PopCultureThemes.css";
import "./PopCultureEffects.css";
import { RevisedIntroScene, RevisedTransitionScene } from "./ThemeSceneRevision";

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

function Scene({ motif, light }) {
  if (motif === "original" || motif === "legacy") return <DigitalGrid legacy={motif === "legacy"} light={light}/>;
  return <RevisedTransitionScene motif={motif} light={light}/>;
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
    <RevisedIntroScene motif={config.motif} light={reduced}/><div className="pc-scene-shade"/>
    <header className="pc-boot-header"><span>{config.sceneTitle||config.universe}</span>{onRequestClose&&<button type="button" onClick={onRequestClose}>Passer l’intro <span aria-hidden="true">›</span></button>}</header>
    <div className="pc-boot-copy"><span>{config.motif==="original"?"SYSTÈME ENCOM":config.motif==="legacy"?"LA GRILLE":config.motif==="future"?"LE TEMPS T’APPARTIENT":"LA VIE TROUVE UN CHEMIN"}</span><h1>CHECKPOINT</h1><p>{config.subtitle}</p></div>
    <footer className="pc-boot-loading"><div><span>{value===100?"Tout est prêt":"Chargement…"}</span><strong>{value} %</strong></div><div className="pc-load-track" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><i style={{width:`${value}%`}}/></div></footer>
  </section>;
}

export function PopCultureTransition({ theme, direction = "right", light = false, effects = "balanced" }) {
  const config = getPopCultureTheme(theme);
  if (!config) return null;
  return <div className={`pc-tab-transition pc-${config.motif} direction-${direction} ${light||effects==="calm"?"is-light":""}`} aria-hidden="true">
    <div className="pc-transition-stage"><Scene motif={config.motif} light={light||effects==="calm"}/></div>
    <div className="pc-transition-label">{config.motif==="original"?"TRANSFERT ENCOM":config.motif==="legacy"?"GRILLE ACTIVE":config.motif==="future"?"PASSAGE TEMPOREL":"TRAVERSÉE DE LA RÉSERVE"}</div>
  </div>;
}
