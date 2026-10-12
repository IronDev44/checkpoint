import "./HunterEffects.css";

function Visor({ progress }) {
  return <svg className="hunter-visor" viewBox="0 0 300 220" fill="none" aria-hidden="true">
    <path d="M50 177L31 101L67 42L121 21H179L233 42L269 101L250 177L210 199H90Z" fill="#19282d" stroke="#f39a34" strokeWidth="5" />
    <path d="M67 42L91 68L74 101L89 163L50 177M233 42L209 68L226 101L211 163L250 177" stroke="#905426" strokeWidth="14" />
    <path d="M76 87L114 72H186L224 87L207 123L170 114H130L93 123Z" fill="#74f9a0" stroke="#d7ffd7" strokeWidth="2" />
    <path d="M132 114L125 165H175L168 114M125 165L112 194M175 165L188 194" stroke="#e59b4b" strokeWidth="4" />
    <path d="M103 49H197M140 28V52M160 28V52M103 146H115M185 146H197" stroke="#a5c3c2" strokeWidth="3" />
    <rect x="97" y="90" width={106 * progress / 100} height="5" fill="#effff1" opacity=".7" />
  </svg>;
}
function ScanFrame() {
  return <div className="hunter-scan-frame" aria-hidden="true"><i /><i /><i /><i /><div className="hunter-scan-cross" /></div>;
}
export function HunterIntro({ progress }) {
  return <div className="hunter-boot">
    <div className="hunter-boot-grid" aria-hidden="true" /><div className="hunter-boot-scan" aria-hidden="true" />
    <main className="hunter-boot-content"><div className="hunter-boot-target"><ScanFrame /><Visor progress={progress} /></div>
      <span className="hunter-kicker">INITIALISATION DE LA VISIÈRE</span><h1>Checkpoint</h1><p>Une nouvelle zone à explorer.</p>
      <div className="hunter-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width:progress+"%" }} /></div>
      <small>Systèmes en ligne <strong>{progress}%</strong></small>
    </main>
    <div className="hunter-boot-readout" aria-hidden="true"><span>SCAN / EXPLORATION</span><span>ÉNERGIE {progress}%</span></div>
  </div>;
}
export function HunterTransition({ direction, effects }) {
  return <div className={`hunter-tab-transition direction-${direction} effects-${effects}`} aria-hidden="true">
    <div className="hunter-transition-field" /><div className="hunter-transition-scan" />
    <div className="hunter-transition-target"><ScanFrame /><div className="hunter-target-ring" /><div className="hunter-target-ring ring-inner" /></div>
    <div className="hunter-door door-top" /><div className="hunter-door door-bottom" />
    <div className="hunter-door-light" />
    <div className="hunter-scan-markers">{Array.from({length:effects==="calm"?4:effects==="boost"?24:12},(_,i)=><i key={i} style={{"--marker-x":(8+i*37%84)+"%","--marker-y":(10+i*23%80)+"%","--marker-delay":i%5*12+"ms"}} />)}</div>
  </div>;
}
