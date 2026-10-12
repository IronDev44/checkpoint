import "./BlueBlurEffects.css";

function SpeedLines({ count }) {
  return <div className="blueblur-speed-lines" aria-hidden="true">{Array.from({ length: count }, (_, i) => <i key={i} style={{ "--speed-y": (i * 37 % 96) + "%", "--speed-delay": (i % 6 * 12) + "ms", "--speed-width": (20 + i % 4 * 12) + "vw" }} />)}</div>;
}
function SpeedEmblem() {
  return <svg className="blueblur-speed-emblem" viewBox="0 0 180 180" fill="none" aria-hidden="true">
    <circle cx="90" cy="90" r="70" stroke="#8e560a" strokeWidth="17" />
    <circle cx="90" cy="90" r="70" stroke="#ffd64a" strokeWidth="11" />
    <path d="M41 42A70 70 0 0 1 121 27" stroke="#fff4b5" strokeWidth="4" strokeLinecap="round" />
    <path d="M54 64L107 40L95 65L129 59L111 86L137 83L100 127L103 102L58 124L75 97L44 102L65 79Z" fill="#2781ff" stroke="#a6ddff" strokeWidth="2" />
  </svg>;
}
export function BlueBlurIntro({ progress }) {
  return <div className="blueblur-boot">
    <SpeedLines count={14} /><div className="blueblur-boot-track" aria-hidden="true" />
    <main className="blueblur-boot-content"><SpeedEmblem />
      <span className="blueblur-kicker">PRÊT À PASSER LA VITESSE SUPÉRIEURE ?</span>
      <h1>Checkpoint</h1><p>Ta prochaine aventure démarre ici.</p>
      <div className="blueblur-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: progress + "%" }} /></div>
      <small>Sur la ligne de départ <strong>{progress}%</strong></small>
    </main>
  </div>;
}
export function BlueBlurTransition({ direction, effects }) {
  const count = effects === "calm" ? 4 : effects === "boost" ? 36 : 20;
  return <div className={`blueblur-tab-transition direction-${direction} effects-${effects}`} aria-hidden="true">
    <div className="blueblur-speed-wash" /><SpeedLines count={count} />
    <div className="blueblur-ring-lane">{Array.from({ length: effects === "calm" ? 3 : 7 }, (_, i) => <i key={i} style={{ "--ring-delay": i * 20 + "ms", "--ring-y": (38 + i % 3 * 10) + "%" }} />)}</div>
    <div className="blueblur-runner"><div className="blueblur-runner-tail" /><div className="blueblur-runner-ball" /></div>
  </div>;
}
