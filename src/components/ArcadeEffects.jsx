import "./ArcadeEffects.css";

function Sunset() { return <div className="arcade-sunset" aria-hidden="true" />; }
function Cabinet() {
  return <svg className="arcade-cabinet" viewBox="0 0 180 230" fill="none" aria-hidden="true"><path d="M35 8H145L160 38L149 126L165 159L153 220H27L15 159L31 126L20 38Z" fill="#21152e" stroke="#f4a378" strokeWidth="3" /><path d="M35 8H145L150 32H30Z" fill="#b9506e" /><path d="M43 48H137L129 116H51Z" fill="#111323" stroke="#997fc1" strokeWidth="3" /><path d="M54 98H126M59 84H121M64 70H116M74 116L82 55M106 116L98 55" stroke="#d078a3" strokeOpacity=".55" /><path d="M31 130H149L165 159H15Z" fill="#4e2a49" stroke="#f4a378" strokeWidth="2" /><path d="M58 147V131" stroke="#dfb49a" strokeWidth="4" /><circle cx="58" cy="130" r="7" fill="#f77c55" /><ellipse cx="111" cy="145" rx="6" ry="3" fill="#ffa05d" /><ellipse cx="129" cy="140" rx="6" ry="3" fill="#b997f0" /><path d="M62 185H118V207H62Z" stroke="#8f6c96" strokeWidth="2" /><text x="90" y="25" textAnchor="middle" fill="#ffe3bd" fontFamily="monospace" fontSize="10" fontWeight="bold">CHECKPOINT</text></svg>;
}
export function ArcadeIntro({ progress }) {
  return <div className="arcade-boot"><Sunset /><div className="arcade-perspective-grid" aria-hidden="true" /><main className="arcade-boot-content"><Cabinet /><span className="arcade-kicker">LA SOIRÉE NE FAIT QUE COMMENCER</span><h1>Checkpoint</h1><p>Un crédit, mille souvenirs.</p><div className="arcade-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div><small>Allumage de la borne <strong>{progress}%</strong></small></main></div>;
}
export function ArcadeTransition({ effects }) {
  return <div className={"arcade-tab-transition effects-"+effects} aria-hidden="true"><div className="arcade-transition-sky"><Sunset /><div className="arcade-perspective-grid" /></div><div className="arcade-pixel-shutter">{Array.from({length:effects==="calm"?8:16},(_,i)=><i key={i} style={{"--strip-index":i,"--strip-count":effects==="calm"?8:16,"--strip-delay":i%5*12+"ms"}} />)}</div><div className="arcade-transition-cabinet"><Cabinet /></div></div>;
}
