import "./TamerEffects.css";

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
