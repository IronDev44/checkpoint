import "./KartEffects.css";

function RainbowRoad() {
  return <svg className="kart-rainbow-road" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
    <defs><linearGradient id="kart-road-spectrum" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#ff5b83" /><stop offset=".18" stopColor="#ffbd55" /><stop offset=".35" stopColor="#fff06b" /><stop offset=".52" stopColor="#5af2a8" /><stop offset=".7" stopColor="#50ccff" /><stop offset=".86" stopColor="#9285ff" /><stop offset="1" stopColor="#f47be9" /></linearGradient></defs>
    <path className="kart-road-edge" d="M100 850C40 610 540 590 440 405S170 345 230 175S400 140 400-60" stroke="#b9c8ff" strokeWidth="106" />
    <path d="M100 850C40 610 540 590 440 405S170 345 230 175S400 140 400-60" stroke="url(#kart-road-spectrum)" strokeWidth="96" />
    <path className="kart-road-seams" d="M100 850C40 610 540 590 440 405S170 345 230 175S400 140 400-60" stroke="#ffffff80" strokeWidth="96" strokeDasharray="2 27" />
    <path className="kart-road-center" d="M100 850C40 610 540 590 440 405S170 345 230 175S400 140 400-60" stroke="#ffffff80" strokeWidth="2" strokeDasharray="12 18" />
  </svg>;
}
function SpaceStars({ count }) {
  return <div className="kart-space-stars" aria-hidden="true">{Array.from({length:count},(_,i)=><i key={i} style={{left:(i*61.803%100)+"%",top:(i*37.719%100)+"%","--star-size":(i%4===0?4:2)+"px"}} />)}</div>;
}
export function KartIntro({ progress }) {
  return <div className="kart-boot"><SpaceStars count={65} /><div className="kart-boot-planet" aria-hidden="true" /><div className="kart-boot-road"><RainbowRoad /></div>
    <main className="kart-boot-content"><span className="kart-boot-badge">★ ROUTE ARC-EN-CIEL ★</span><h1>Checkpoint</h1><p>La prochaine course commence ici.</p>
      <div className="kart-boot-lights" aria-hidden="true">{[0,1,2].map(i=><i key={i} style={{"--light-delay":i*350+"ms"}} />)}</div>
      <div className="kart-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div>
      <small>Sur la grille de départ <strong>{progress}%</strong></small>
    </main>
  </div>;
}
export function KartTransition({ direction, effects }) {
  return <div className={`kart-tab-transition direction-${direction} effects-${effects}`} aria-hidden="true"><div className="kart-transition-space" /><SpaceStars count={effects==="calm"?15:effects==="boost"?100:55} />
    <div className="kart-transition-road"><RainbowRoad /></div><div className="kart-boost-streak" />
    <div className="kart-transition-sparks">{Array.from({length:effects==="calm"?0:effects==="boost"?36:18},(_,i)=><i key={i} style={{"--spark-x":(i*37%100)+"vw","--spark-y":(i*23%100)+"vh","--spark-delay":i%5*10+"ms","--spark-color":["#ff6fa7","#ffe66b","#62eac3","#70b7ff"][i%4]}} />)}</div>
  </div>;
}
