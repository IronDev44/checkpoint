import "./XboxEffects.css";
function XboxSphere() {
  return <div className="xbox-sphere" aria-hidden="true"><svg viewBox="0 0 100 100" fill="none"><path d="M24 18 Q50 30 78 80 M76 18 Q50 30 22 80" stroke="#e5ffe9" strokeWidth="10" strokeLinecap="round" /></svg></div>;
}
export function XboxIntro({ progress }) {
  return <div className="xbox-boot"><main className="xbox-boot-content">
    <XboxSphere /><h1>Checkpoint</h1><p>Ta collection. Ta prochaine aventure.</p>
    <div className="xbox-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div>
    <small>Chargement <strong>{progress}%</strong></small>
  </main></div>;
}
export function XboxTransition({ direction, effects }) {
  return <div className={"xbox-tab-transition direction-"+direction+" effects-"+effects} aria-hidden="true">
    <div className="xbox-transition-glow" />
    <div className="xbox-dashboard-tiles">{Array.from({length:12},(_,index)=><i key={index} style={{"--tile-delay":(index%4)*24+"ms"}} />)}</div>
    <div className="xbox-transition-emblem"><XboxSphere /></div>
  </div>;
}
