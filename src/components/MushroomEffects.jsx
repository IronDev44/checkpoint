import "./MushroomEffects.css";

export function MushroomIntro({ progress }) {
  return <div className="mushroom-boot">
    <div className="mushroom-boot-cloud cloud-one" aria-hidden="true" /><div className="mushroom-boot-cloud cloud-two" aria-hidden="true" />
    <div className="mushroom-boot-hills" aria-hidden="true" /><div className="mushroom-boot-ground" aria-hidden="true" />
    <main className="mushroom-boot-content">
      <div className="mushroom-boot-blocks" aria-hidden="true">{[0,1,2].map(i => <div className="mushroom-block-slot" key={i} style={{ "--block-delay": i * 180 + "ms" }}>
        <div className="mushroom-gold-coin"><span /></div><div className="mushroom-question-block"><b>?</b><i /><i /><i /><i /></div>
      </div>)}</div>
      <svg className="mushroom-boot-mascot" viewBox="0 0 100 90" aria-hidden="true">
        <path d="M29 47H71V70Q71 86 50 86Q29 86 29 70Z" fill="#ffe9c0" stroke="#542a20" strokeWidth="5" />
        <path d="M5 48C5 20 22 5 50 5S95 20 95 48Q95 61 50 61Q5 61 5 48Z" fill="#ef4444" stroke="#542a20" strokeWidth="5" />
        <ellipse cx="50" cy="23" rx="13" ry="15" fill="#fff7e6" />
        <path d="M9 33Q28 26 27 50Q15 55 8 48M91 33Q72 26 73 50Q85 55 92 48" fill="#fff7e6" />
        <path d="M41 68V76M59 68V76" stroke="#542a20" strokeWidth="5" strokeLinecap="round" />
      </svg>
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
    <div className="mushroom-powerup"><svg viewBox="0 0 100 90" fill="none">
      <path d="M29 47H71V70Q71 86 50 86Q29 86 29 70Z" fill="#ffe9c0" stroke="#542a20" strokeWidth="5" />
      <path d="M5 48C5 20 22 5 50 5S95 20 95 48Q95 61 50 61Q5 61 5 48Z" fill="#ef4444" stroke="#542a20" strokeWidth="5" />
      <ellipse cx="50" cy="23" rx="13" ry="15" fill="#fff7e6" /><path d="M9 33Q28 26 27 50Q15 55 8 48M91 33Q72 26 73 50Q85 55 92 48" fill="#fff7e6" />
      <path d="M41 68V76M59 68V76" stroke="#542a20" strokeWidth="5" strokeLinecap="round" />
    </svg></div>
  </div>;
}
