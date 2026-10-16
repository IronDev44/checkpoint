import IntroVignette from "./IntroVignettes";
import "./ArcaneEffects.css";
function Grimoire() {
  return <div className="arcane-grimoire" aria-hidden="true"><svg viewBox="0 0 220 160" fill="none">
    <path d="M110 35 Q64 9 15 27 V132 Q64 113 110 142 Q156 113 205 132 V27 Q156 9 110 35Z" fill="#23152e" stroke="#b79455" strokeWidth="3" />
    <path d="M110 35 Q68 16 24 34 V121 Q68 106 110 133 Q152 106 196 121 V34 Q152 16 110 35Z" fill="#d5bd87" />
    <path d="M110 35 V133" stroke="#665039" strokeWidth="3" />
    {[47,61,75,89,103].map(y=><path key={y} d={"M36 "+y+" Q66 "+(y-6)+" 94 "+(y+7)+" M126 "+(y+7)+" Q155 "+(y-6)+" 184 "+y} stroke="#735c3e" strokeWidth="2" opacity=".65" />)}
  </svg><span className="arcane-book-star">✧</span></div>;
}
function ArcaneSparks({ count = 32 }) {
  return <div className="arcane-sparks" aria-hidden="true">{Array.from({length:count},(_,i)=><i key={i} style={{"--spark-left":(i*37%100)+"%","--spark-top":(i*61%100)+"%","--spark-turn":(i/count*360)+"deg","--spark-delay":(i%6*14)+"ms"}} />)}</div>;
}
export function ArcaneIntro({ progress }) {
  return <div className="arcane-boot"><ArcaneSparks /><main className="arcane-boot-content">
    <IntroVignette kind="arcane"/><span className="arcane-boot-kicker">UN NOUVEAU CHAPITRE</span>
    <h1>Checkpoint</h1><p>Ton histoire s’écrit, une aventure à la fois.</p>
    <div className="arcane-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div>
    <small>Chargement <strong>{progress}%</strong></small>
  </main></div>;
}
export function ArcaneTransition({ direction, effects }) {
  return <div className={"arcane-tab-transition direction-"+direction+" effects-"+effects} aria-hidden="true">
    <div className="arcane-spell-halo" /><ArcaneSparks count={effects === "calm" ? 8 : effects === "boost" ? 72 : 44} />
    <div className="arcane-turning-book"><Grimoire /><i className="arcane-turning-page" /></div>
  </div>;
}
