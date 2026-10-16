import IntroVignette from "./IntroVignettes";
import "./CarbonEffects.css";

function IceCore() {
  return <svg className="carbon-ice-core" viewBox="0 0 200 200" fill="none" aria-hidden="true"><path d="M100 10L178 55V145L100 190L22 145V55Z" fill="#202e39" stroke="#c1e9fa" strokeWidth="2" /><path d="M100 10V190M22 55L178 145M178 55L22 145" stroke="#91bdd855" /><path d="M100 40L152 70V130L100 160L48 130V70Z" stroke="#8acced" strokeWidth="2" /><path d="M100 65V135M70 83L130 117M130 83L70 117M100 65L91 74M100 65L109 74M100 135L91 126M100 135L109 126M70 83L72 96M70 83L83 79M130 117L117 121M130 117L128 104M130 83L117 79M130 83L128 96M70 117L72 104M70 117L83 121" stroke="#e1f7ff" strokeWidth="3" strokeLinecap="round" /></svg>;
}
export function CarbonIntro({ progress }) {
  return <div className="carbon-boot"><div className="carbon-boot-frost" aria-hidden="true" /><main className="carbon-boot-content"><IntroVignette kind="carbon"/><span className="carbon-kicker">CALME. NET. ESSENTIEL.</span><h1>Checkpoint</h1><p>Toutes tes aventures au même endroit.</p><div className="carbon-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div><small>Mise en place <strong>{progress}%</strong></small></main></div>;
}
export function CarbonTransition({ direction, effects }) {
  return <div className={`carbon-tab-transition direction-${direction} effects-${effects}`} aria-hidden="true"><div className="carbon-transition-frost" /><div className="carbon-ice-sheets">{Array.from({length:effects==="calm"?3:7},(_,i)=><i key={i} style={{"--sheet-index":i,"--sheet-delay":i*10+"ms"}} />)}</div><div className="carbon-transition-core"><IceCore /></div><div className="carbon-ice-dust">{Array.from({length:effects==="calm"?0:effects==="boost"?48:24},(_,i)=><i key={i} style={{"--ice-x":(i*61.803%100)+"%","--ice-y":(i*37.719%100)+"%","--ice-delay":i%6*10+"ms"}} />)}</div></div>;
}
