import "./MushroomEffects.css";

function MushroomMascot({ className }) {
  return <svg className={className} viewBox="0 0 100 90" fill="none" aria-hidden="true">
    <path d="M22 51H78V70Q78 83 65 83H35Q22 83 22 70Z" fill="#ffe9c0" stroke="#542a20" strokeWidth="4" />
    <path d="M4 49C4 23 24 5 50 5S96 23 96 49Q96 59 83 59H17Q4 59 4 49Z" fill="#ef4444" stroke="#542a20" strokeWidth="4" />
    <ellipse cx="50" cy="27" rx="17" ry="18" fill="#fff7e6" />
    <path d="M9 30Q25 26 24 44Q23 53 7 51Q4 42 9 30ZM91 30Q75 26 76 44Q77 53 93 51Q96 42 91 30Z" fill="#fff7e6" />
    <path d="M40 65V73M60 65V73" stroke="#542a20" strokeWidth="4" strokeLinecap="round" />
  </svg>;
}

export function MushroomIntro({ progress }) {
  return <div className="mushroom-boot">
    <div className="mushroom-boot-cloud cloud-one" aria-hidden="true" /><div className="mushroom-boot-cloud cloud-two" aria-hidden="true" />
    <div className="mushroom-boot-hills" aria-hidden="true" /><div className="mushroom-boot-ground" aria-hidden="true" />
    <main className="mushroom-boot-content">
      <div className="mushroom-boot-blocks" aria-hidden="true">{[0,1,2].map(i => <div className="mushroom-block-slot" key={i} style={{ "--block-delay": i * 180 + "ms" }}>
        <div className="mushroom-gold-coin"><span /></div><div className="mushroom-question-block"><b>?</b><i /><i /><i /><i /></div>
      </div>)}</div>
      <MushroomMascot className="mushroom-boot-mascot" />
      <span className="mushroom-boot-kicker">UNE NOUVELLE PARTIE T’ATTEND</span>
      <h1>Checkpoint</h1><p>À toi de jouer !</p>
      <div className="mushroom-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: progress + "%" }} /></div>
      <small>Préparation du niveau <strong>{progress}%</strong></small>
    </main>
  </div>;
}

export function MushroomTransition({ direction, effects }) {
  const count = effects === "calm" ? 3 : effects === "boost" ? 9 : 5;
  return <div className={`mushroom-tab-transition direction-${direction} effects-${effects}`} aria-hidden="true">
    <div className="mushroom-stage-glow" />
    <div className="mushroom-block-row">{Array.from({ length: count }, (_, i) => <div className="mushroom-block-slot" key={i} style={{ "--block-delay": (i % 3 * 25) + "ms" }}>
      <div className="mushroom-gold-coin"><span /></div>
      <div className="mushroom-question-block"><b>?</b><i /><i /><i /><i /></div>
      <div className="mushroom-block-spark spark-left" /><div className="mushroom-block-spark spark-right" />
    </div>)}</div>
    <div className="mushroom-powerup"><MushroomMascot /></div>
  </div>;
}
