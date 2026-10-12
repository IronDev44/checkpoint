import "./WastelandEffects.css";

function BunkerSeal() {
  return <svg className="wasteland-seal" viewBox="0 0 200 200" fill="none" aria-hidden="true">
    <circle cx="100" cy="100" r="84" fill="#292d29" stroke="#717362" strokeWidth="9" />
    <circle cx="100" cy="100" r="64" stroke="#d5b569" strokeWidth="2" strokeDasharray="3 10" />
    <path d="M100 42L155 140H45Z" fill="#d8b65d" stroke="#f3d98c" strokeWidth="2" />
    <circle cx="100" cy="105" r="8" fill="#292d29" />
    <path d="M96 93L80 69L69 88L90 101ZM108 101L135 88L124 69L104 93ZM94 114L89 138H111L106 114Z" fill="#292d29" />
    {[0,1,2,3,4,5].map(i=><circle key={i} cx={100+74*Math.cos(i*Math.PI/3)} cy={100+74*Math.sin(i*Math.PI/3)} r="4" fill="#b6b89b" />)}
  </svg>;
}
function Dust({ count }) {
  return <div className="wasteland-dust" aria-hidden="true">{Array.from({length:count},(_,i)=><i key={i} style={{"--dust-x":(i*61.803%100)+"%","--dust-y":(i*37.719%100)+"%","--dust-delay":i%6*10+"ms","--dust-size":(2+i%3)+"px"}} />)}</div>;
}
export function WastelandIntro({ progress }) {
  return <div className="wasteland-boot"><div className="wasteland-horizon" aria-hidden="true" /><Dust count={36} />
    <main className="wasteland-boot-content"><BunkerSeal /><div className="wasteland-terminal">
      <span className="wasteland-kicker">ABRI / SYSTÈME DE SURVIE</span><h1>Checkpoint</h1><p>Les aventures restent. Même après la fin du monde.</p>
      <div className="wasteland-system-readout" aria-hidden="true"><span>ÉNERGIE : STABLE</span><span>{progress>=80?"ACCÈS : AUTORISÉ":"ACCÈS : EN ATTENTE"}</span></div>
      <div className="wasteland-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div>
      <small>Remise en route <strong>{progress}%</strong></small>
    </div></main>
  </div>;
}
export function WastelandTransition({ direction, effects }) {
  return <div className={`wasteland-tab-transition direction-${direction} effects-${effects}`} aria-hidden="true">
    <div className="wasteland-transition-haze" />
    <div className="wasteland-bunker-door bunker-left" /><div className="wasteland-bunker-door bunker-right" />
    <div className="wasteland-door-seal"><BunkerSeal /></div><div className="wasteland-door-slit" />
    <Dust count={effects==="calm"?6:effects==="boost"?80:45} />
  </div>;
}
