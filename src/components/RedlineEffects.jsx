import "./RedlineEffects.css";

function Tachometer({ progress }) {
  return <svg className="redline-tachometer" viewBox="0 0 240 200" fill="none" aria-hidden="true">
    <path d="M39 158A92 92 0 1 1 201 158" stroke="#35414b" strokeWidth="15" />
    <path d="M168 37A92 92 0 0 1 201 158" stroke="#f34343" strokeWidth="15" />
    {Array.from({length:9},(_,i)=>{const angle=(145+i*31.25)*Math.PI/180;return <path key={i} d={`M${120+73*Math.cos(angle)} ${106+73*Math.sin(angle)}L${120+84*Math.cos(angle)} ${106+84*Math.sin(angle)}`} stroke={i>6?"#ff6760":"#aab4bc"} strokeWidth="3" />;})}
    <g style={{transform:`rotate(${-125+progress*2.5}deg)`,transformOrigin:"120px 106px"}}><path d="M120 106L117 30L123 30Z" fill="#fff1e8" /></g>
    <circle cx="120" cy="106" r="10" fill="#ed4545" /><path d="M85 167H155" stroke="#ed4545" strokeWidth="3" /><text x="120" y="145" fill="#dbe1e5" textAnchor="middle" fontFamily="monospace" fontSize="11">RPM × 1000</text>
  </svg>;
}
export function RedlineIntro({ progress }) {
  return <div className="redline-boot"><main className="redline-boot-content"><Tachometer progress={progress} /><span className="redline-kicker">MONTE DANS LES TOURS</span><h1>Checkpoint</h1><p>Prêt pour la prochaine session.</p><div className="redline-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div><small>Sur la ligne de départ <strong>{progress}%</strong></small></main></div>;
}
export function RedlineTransition({ direction, effects }) {
  return <div className={`redline-tab-transition direction-${direction} effects-${effects}`} aria-hidden="true"><div className="redline-asphalt" /><div className="redline-road-marks" /><div className="redline-tail-light" /><div className="redline-rpm-bars">{Array.from({length:12},(_,i)=><i key={i} style={{"--rpm-delay":i*12+"ms","--rpm-color":i>8?"#ff4848":"#c7d3db"}} />)}</div><div className="redline-sparks">{Array.from({length:effects==="calm"?0:effects==="boost"?36:18},(_,i)=><i key={i} style={{"--spark-y":(15+i*37%70)+"%","--spark-delay":i%6*10+"ms"}} />)}</div></div>;
}
