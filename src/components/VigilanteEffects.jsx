import "./VigilanteEffects.css";

function Bat() {
  return <svg className="vigilante-bat" viewBox="0 0 240 120" fill="currentColor" aria-hidden="true"><path d="M5 17Q32 43 66 39L88 52L104 43L111 22L120 37L129 22L136 43L152 52L174 39Q208 43 235 17L222 73Q200 59 185 83Q162 69 150 97Q131 87 120 114Q109 87 90 97Q78 69 55 83Q40 59 18 73Z" /></svg>;
}
function Skyline() {
  return <div className="vigilante-skyline" aria-hidden="true">{Array.from({length:13},(_,i)=><i key={i} style={{"--tower-height":(55+i*37%115)+"px"}} />)}</div>;
}
export function VigilanteIntro({ progress }) {
  return <div className="vigilante-boot"><div className="vigilante-clouds" aria-hidden="true" /><div className="vigilante-searchlight" aria-hidden="true" /><Skyline />
    <main className="vigilante-boot-content"><div className="vigilante-signal"><Bat /></div>
      <span className="vigilante-kicker">LA NUIT T’APPARTIENT</span><h1>Checkpoint</h1><p>Chaque aventure laisse son empreinte.</p>
      <div className="vigilante-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div>
      <small>Veille nocturne <strong>{progress}%</strong></small>
    </main>
  </div>;
}
export function VigilanteTransition({ direction, effects }) {
  return <div className={`vigilante-tab-transition direction-${direction} effects-${effects}`} aria-hidden="true">
    <div className="vigilante-transition-night" /><div className="vigilante-cape cape-left" /><div className="vigilante-cape cape-right" />
    <div className="vigilante-transition-signal"><Bat /></div>
    <div className="vigilante-bat-swarm">{Array.from({length:effects==="calm"?3:effects==="boost"?30:16},(_,i)=><div key={i} style={{"--bat-x":(i*37%100)+"vw","--bat-y":(8+i*23%84)+"vh","--bat-delay":i%6*10+"ms","--bat-size":(28+i%4*14)+"px","--bat-tilt":(i%2?18:-18)+"deg"}}><Bat /></div>)}</div>
  </div>;
}
