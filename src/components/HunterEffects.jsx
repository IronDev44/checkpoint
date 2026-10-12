import "./HunterEffects.css";

function Visor({ progress }) {
  return <svg className="hunter-visor" viewBox="0 0 300 220" fill="none" aria-hidden="true">
    <path d="M61 153V98C61 46 94 19 150 19S239 46 239 98V153L213 189L178 202H122L87 189Z" fill="#ad302a" stroke="#481c21" strokeWidth="5" />
    <path d="M65 92C71 46 103 27 150 27S229 46 235 92L205 71H95Z" fill="#de5140" />
    <path d="M143 22H157L166 68H134Z" fill="#f77c58" />
    <path d="M77 77L119 69H181L223 77L212 115L171 122L165 163H135L129 122L88 115Z" fill="#092e26" stroke="#481c21" strokeWidth="6" />
    <path d="M85 83L121 76H179L215 83L205 108L164 115L159 155H141L136 115L95 108Z" fill="#6fef86" />
    <path d="M96 85L126 81H179L196 85L187 91H105Z" fill="#c6ffb7" />
    <path d="M75 123L101 128L116 170L132 183H168L184 170L199 128L225 123L220 155L199 185L174 194H126L101 185L80 155Z" fill="#7b2928" />
    <path d="M64 101H79V150H65ZM221 101H236V150H221Z" fill="#c5c6b8" stroke="#6b6b60" strokeWidth="3" />
    <path d="M114 169L127 180M186 169L173 180M130 187H170" stroke="#e5af82" strokeWidth="4" />
    <rect x="137" y="137" width={26 * progress / 100} height="3" fill="#e5ffd9" opacity=".8" />
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
