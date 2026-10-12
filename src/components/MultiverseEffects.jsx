import "./MultiverseEffects.css";
function HeroEmblem() {
  return <svg className="hero-emblem" viewBox="0 0 160 160" fill="none" aria-hidden="true"><path d="M80 5 L146 40 V102 L80 153 L14 102 V40Z" fill="#142952" stroke="#ffce54" strokeWidth="4" /><path d="M87 28 L43 89 H73 L65 132 L121 67 H87Z" fill="#ffce54" /><path d="M24 45 L72 19" stroke="#ff6574" strokeWidth="4" /></svg>;
}
export function MultiverseIntro({ progress }) {
  return <div className="hero-boot"><div className="hero-halftone" aria-hidden="true" /><main className="hero-boot-content">
    <HeroEmblem /><span className="hero-kicker">TON UNIVERS. TES HÉROS.</span><h1>CHECKPOINT</h1><p>Chaque aventure a sa place dans ton histoire.</p>
    <div className="hero-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div>
    <small>Ouverture du multivers <strong>{progress}%</strong></small>
  </main></div>;
}
export function MultiverseTransition({ direction, effects }) {
  return <div className={"hero-tab-transition direction-"+direction+" effects-"+effects} aria-hidden="true">
    <div className="hero-panel hero-panel-red" /><div className="hero-panel hero-panel-blue" />
    <div className="hero-portal"><i /><i /><HeroEmblem /></div>
    <div className="hero-energy">{Array.from({length:effects === "calm" ? 8 : 32},(_,index)=><i key={index} style={{"--hero-angle":(index*360/32)+"deg","--hero-delay":(index%5*12)+"ms"}} />)}</div>
  </div>;
}
