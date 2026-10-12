import "./KartEffects.css";

const colors = ["#ff527f", "#ffad47", "#ffe95c", "#60ed9b", "#45cfff", "#8d86ff", "#e776ed"];
function DriverView({ cockpit = false }) {
  return <div className="kart-driver-scene" aria-hidden="true">
    <div className="kart-driver-stars">{Array.from({length:45},(_,i)=><i key={i} style={{left:(i*61.803%100)+"%",top:(i*37.719%48)+"%"}} />)}</div>
    <div className="kart-driver-planet" />
    <svg className="kart-driver-road" viewBox="0 0 600 800" preserveAspectRatio="none" fill="none">
      <path d="M275 280Q420 185 362 154Q307 128 359 93" stroke="#9c92e9" strokeWidth="12" />
      {colors.map((color,i)=><path key={color} d={`M${275+i*7} 280L${-500+i*230} 800H${-500+(i+1)*230}L${275+(i+1)*7} 280Z`} fill={color} />)}
      <path d="M275 280L-500 800M324 280L1110 800" stroke="#e3d9ff" strokeWidth="7" />
      <g className="kart-driver-tiles">{Array.from({length:18},(_,i)=>{const y=282+Math.pow((i+1)/18,2)*540;const t=(y-280)/520;return <path key={i} d={`M${275-775*t} ${y}H${324+786*t}`} stroke="#fff" strokeOpacity=".45" strokeWidth={1+t*4} />;})}</g>
      <path d="M299 280V800" stroke="#fff" strokeOpacity=".3" strokeWidth="2" />
    </svg>
    {cockpit && <svg className="kart-driver-cockpit" viewBox="0 0 600 220" preserveAspectRatio="xMidYMax meet">
      <path d="M0 220V142L60 116L137 122L195 150H405L463 122L540 116L600 142V220Z" fill="#d33f4d" stroke="#ff8a70" strokeWidth="5" />
      <path d="M155 220L190 134Q300 100 410 134L445 220Z" fill="#182335" stroke="#60748a" strokeWidth="4" />
      <g className="kart-driver-steering"><ellipse cx="300" cy="153" rx="101" ry="54" fill="none" stroke="#07101d" strokeWidth="22" /><ellipse cx="300" cy="153" rx="101" ry="54" fill="none" stroke="#778ba3" strokeWidth="3" /><path d="M205 154L282 166M395 154L318 166M300 171V210" stroke="#273c55" strokeWidth="17" /><ellipse cx="300" cy="163" rx="26" ry="17" fill="#354d67" stroke="#98afc7" strokeWidth="3" /><path d="M290 160H310" stroke="#ffe56d" strokeWidth="4" /></g>
      <path d="M45 171L121 184M479 184L555 171" stroke="#ffb898" strokeWidth="8" strokeLinecap="round" />
    </svg>}
  </div>;
}
export function KartIntro({ progress }) {
  return <div className="kart-boot"><DriverView cockpit /><main className="kart-boot-content"><span className="kart-boot-badge">ROUTE ARC-EN-CIEL</span><h1>Checkpoint</h1><p>Prends le volant.</p><div className="kart-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div><small>Prêt au départ <strong>{progress}%</strong></small></main></div>;
}
export function KartTransition({ direction, effects }) {
  return <div className={`kart-tab-transition direction-${direction} effects-${effects}`} aria-hidden="true"><div className="kart-boost-drive"><DriverView /></div><div className="kart-boost-rays">{Array.from({length:effects==="calm"?0:effects==="boost"?42:24},(_,i)=><i key={i} style={{"--ray-angle":i*360/(effects==="boost"?42:24)+"deg","--ray-color":colors[i%7],"--ray-delay":i%5*10+"ms"}} />)}</div></div>;
}
