import "./CubicIntro.css";

export default function CubicIntro({ progress }) {
  return <div className="cubic-boot">
    <div className="cubic-boot-terrain" aria-hidden="true">{[0,1,2,3,4,5,6].map(i => <i key={i} style={{ "--terrain-height": (70 + i % 3 * 32) + "px" }} />)}</div>
    <main className="cubic-boot-content">
      <div className="cubic-boot-mining" aria-hidden="true">
        <div className="cubic-boot-block"><div className="cubic-boot-grass" /><div className="cubic-boot-crack" /></div>
        <div className="cubic-boot-fragments">{Array.from({ length:12 }, (_,i) => <i key={i} style={{ "--fragment-x": ((i%2 ? 1 : -1) * (65+i*7)) + "px", "--fragment-y": (-70+i%5*32) + "px", "--fragment-turn": (i*47) + "deg", "--fragment-color": i%3===0 ? "#79a74c" : "#8f623c" }} />)}</div>
      </div>
      <span className="cubic-boot-kicker">UN MONDE À CONSTRUIRE</span>
      <h1>Checkpoint</h1><p>Chaque aventure pose une nouvelle brique.</p>
      <div className="cubic-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: progress + "%" }} /></div>
      <small>Chargement du terrain <strong>{progress}%</strong></small>
    </main>
  </div>;
}
