import "./AuroraEffects.css";

export function AuroraIntro({ progress }) {
  return <div className={"aurora-boot " + (progress >= 100 ? "complete" : "")}>
    <div className="aurora-boot-lights" aria-hidden="true"><i /><i /><i /></div>
    <main className="aurora-boot-content">
      <div className="aurora-seal" aria-hidden="true"><span>CP</span></div>
      <h1>Checkpoint</h1>
      <p>Tes jeux. Ton parcours. Ton univers.</p>
      <div className="aurora-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width: progress + "%"}} /></div>
      <small>Chargement <strong>{progress}%</strong></small>
    </main>
  </div>;
}

export function AuroraTransition({ direction, effects }) {
  return <div className={"aurora-tab-transition direction-" + direction + " effects-" + effects} aria-hidden="true">
    <div className="aurora-transition-dim" />
    <div className="aurora-ribbon ribbon-cyan" />
    <div className="aurora-ribbon ribbon-violet" />
    <div className="aurora-ribbon ribbon-pink" />
  </div>;
}
