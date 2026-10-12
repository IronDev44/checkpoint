import "./PacEffects.css";

function Pac() {
  return <div className="pac-effect-player"><i /><i /></div>;
}
function Ghost({ color }) {
  return <svg className="pac-effect-ghost" viewBox="0 0 40 42" aria-hidden="true"><path d="M2 40V20A18 18 0 0 1 38 20V40L32 34L26 40L20 34L14 40L8 34Z" fill={color} /><ellipse cx="14" cy="19" rx="6" ry="7" fill="white" /><ellipse cx="28" cy="19" rx="6" ry="7" fill="white" /><ellipse cx="16" cy="20" rx="3" ry="4" fill="#214a9e" /><ellipse cx="30" cy="20" rx="3" ry="4" fill="#214a9e" /></svg>;
}
function Maze() {
  return <svg className="pac-effect-maze" viewBox="0 0 340 200" fill="none" aria-hidden="true"><g stroke="#345aff" strokeWidth="4" strokeLinejoin="round">
    <path d="M8 78V8H332V78M8 122V192H332V122M8 78H38V122H8M332 78H302V122H332" />
    <path d="M28 28H86V56H28ZM112 28H152V56H112ZM188 28H228V56H188ZM254 28H312V56H254Z" />
    <path d="M60 78H110V94H60ZM230 78H280V94H230ZM60 122H110V138H60ZM230 122H280V138H230Z" />
    <path d="M28 158H86V174H28ZM112 158H152V174H112ZM188 158H228V174H188ZM254 158H312V174H254Z" />
    <path d="M150 90H132V130H208V90H190M170 8V58M170 150V192" />
  </g><path d="M150 90H190" stroke="#f4a4db" strokeWidth="3" /></svg>;
}
export function PacIntro({ progress }) {
  return <div className="pac-boot"><main className="pac-boot-content">
    <div className="pac-boot-board"><Maze /><div className="pac-boot-pellets" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} />)}</div><div className="pac-boot-runner" aria-hidden="true"><Pac /></div></div>
    <div className="pac-boot-ghosts" aria-hidden="true">{["#ff4b62","#ff9bd9","#45dcef","#ffb05c"].map(color=><Ghost key={color} color={color} />)}</div>
    <span className="pac-boot-kicker">PRÊT POUR UN NOUVEAU SCORE ?</span><h1>Checkpoint</h1><p>Encore une partie ?</p>
    <div className="pac-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div>
    <small>Chargement du labyrinthe <strong>{progress}%</strong></small>
  </main></div>;
}
export function PacTransition({ direction, effects }) {
  return <div className={`pac-tab-transition direction-${direction} effects-${effects}`} aria-hidden="true"><div className="pac-transition-backdrop"><Maze /></div>
    <div className="pac-transition-lane"><div className="pac-transition-pellets">{Array.from({length:effects==="calm"?8:18},(_,i)=><i key={i} style={{"--pellet-delay":(130+i*26)+"ms"}} />)}</div>
      <div className="pac-transition-runner"><Pac /></div>
      {["#ff4b62","#ff9bd9","#45dcef"].slice(0,effects==="calm"?1:3).map((color,i)=><div className="pac-transition-chaser" key={color} style={{"--ghost-delay":(70+i*45)+"ms"}}><Ghost color={color} /></div>)}
    </div>
  </div>;
}
