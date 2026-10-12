import "./TamerEffects.css";

export function TamerIntro({ progress }) {
  return <div className="tamer-boot"><main className="tamer-boot-content">
    <div className="tamer-boot-capture" aria-hidden="true"><div className="tamer-boot-halo" />
      <div className="tamer-capsule"><div className="tamer-capsule-top" /><div className="tamer-capsule-bottom" /><div className="tamer-capsule-button" /></div>
      <div className="tamer-boot-stars">{Array.from({length:12},(_,i)=><i key={i} style={{"--star-angle":i*30+"deg","--star-delay":i%4*80+"ms"}} />)}</div>
    </div>
    <span className="tamer-boot-kicker">À CHAQUE RENCONTRE, UNE AVENTURE</span><h1>Checkpoint</h1><p>Ta collection grandit avec toi.</p>
    <div className="tamer-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div>
    <small>Préparation du voyage <strong>{progress}%</strong></small>
  </main></div>;
}

export function TamerTransition({ effects }) {
  const count = effects === "calm" ? 8 : effects === "boost" ? 56 : 32;
  return <div className={"tamer-tab-transition effects-" + effects} aria-hidden="true">
    <div className="tamer-capture-glow" />
    <div className="tamer-capture-ring" />
    <div className="tamer-capsule">
      <div className="tamer-capsule-top" /><div className="tamer-capsule-bottom" />
      <div className="tamer-capsule-button" />
    </div>
    <div className="tamer-capture-sparks">{Array.from({ length: count }, (_, i) => <i key={i} style={{ "--capture-angle": (i * 360 / count) + "deg", "--capture-distance": (120 + i % 5 * 40) + "px", "--capture-delay": (i % 5 * 10) + "ms" }} />)}</div>
  </div>;
}
