import "./RelicEffects.css";
function RelicEmblem() {
  return <svg className="relic-emblem" viewBox="0 0 180 180" fill="none" aria-hidden="true">
    <circle cx="90" cy="90" r="82" stroke="#d6b871" strokeWidth="2" strokeDasharray="4 9" />
    <circle cx="90" cy="90" r="68" stroke="#65ad8d" strokeWidth="2" />
    <path d="M90 35 L115 78 H65Z M65 78 L90 121 H40Z M115 78 L140 121 H90Z" fill="#e7c875" stroke="#fff0b8" strokeWidth="1.5" />
    <path d="M90 13 V24 M90 156 V167 M13 90 H24 M156 90 H167" stroke="#78bb9d" strokeWidth="3" />
  </svg>;
}
function ForestMotes({ count }) {
  return <div className="relic-motes" aria-hidden="true">{Array.from({length:count},(_,i)=><i key={i} style={{"--mote-x":(i*61.803%100)+"%","--mote-y":(i*37.719%100)+"%","--mote-delay":(i%6*12)+"ms"}} />)}</div>;
}
export function RelicIntro({ progress }) {
  return <div className="relic-boot"><div className="relic-forest-light" aria-hidden="true" /><ForestMotes count={30} />
    <main className="relic-boot-content"><RelicEmblem /><span className="relic-kicker">L’AVENTURE T’APPELLE</span><h1>Checkpoint</h1><p>Chaque aventure laisse une trace.</p>
      <div className="relic-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div>
      <small>Éveil du sanctuaire <strong>{progress}%</strong></small>
    </main>
  </div>;
}
export function RelicTransition({ direction, effects }) {
  return <div className={"relic-tab-transition direction-"+direction+" effects-"+effects} aria-hidden="true">
    <div className="relic-stone-gate gate-left" /><div className="relic-stone-gate gate-right" />
    <div className="relic-temple-light" /><div className="relic-transition-seal"><RelicEmblem /></div>
    <ForestMotes count={effects === "calm" ? 8 : effects === "boost" ? 70 : 40} />
  </div>;
}
