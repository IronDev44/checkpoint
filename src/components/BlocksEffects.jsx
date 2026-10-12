import "./BlocksEffects.css";

const pieces = [
  { color: "#32d6ef", cells: [[0,0],[1,0],[2,0],[3,0]] },
  { color: "#ffd34a", cells: [[0,0],[1,0],[0,1],[1,1]] },
  { color: "#b77bff", cells: [[1,0],[0,1],[1,1],[2,1]] },
  { color: "#5794ff", cells: [[0,0],[0,1],[1,1],[2,1]] },
  { color: "#ffac4c", cells: [[2,0],[0,1],[1,1],[2,1]] },
  { color: "#60dc88", cells: [[1,0],[2,0],[0,1],[1,1]] },
  { color: "#ff667d", cells: [[0,0],[1,0],[1,1],[2,1]] },
];
function Piece({ index, className = "", style }) {
  const piece = pieces[index % pieces.length];
  return <div className={"blocks-effect-piece " + className} style={{ ...style, "--block-color": piece.color }}>
    {piece.cells.map(([x,y]) => <i key={x+":"+y} style={{ left: `calc(${x} * var(--cell))`, top: `calc(${y} * var(--cell))` }} />)}
  </div>;
}
export function BlocksIntro({ progress }) {
  return <div className="blocks-boot">
    <main className="blocks-boot-content">
      <div className="blocks-boot-board" aria-hidden="true">
        <Piece index={0} className="blocks-boot-piece" style={{ "--piece-x": 0, "--piece-y": 7, "--piece-delay": "0ms" }} />
        <Piece index={1} className="blocks-boot-piece" style={{ "--piece-x": 4, "--piece-y": 6, "--piece-delay": "220ms" }} />
        <Piece index={3} className="blocks-boot-piece" style={{ "--piece-x": 7, "--piece-y": 6, "--piece-delay": "440ms" }} />
        <Piece index={2} className="blocks-boot-piece" style={{ "--piece-x": 1, "--piece-y": 5, "--piece-delay": "660ms" }} />
        <Piece index={5} className="blocks-boot-piece" style={{ "--piece-x": 4, "--piece-y": 4, "--piece-delay": "880ms" }} />
        <div className="blocks-boot-ghost"><Piece index={4} /></div>
        <Piece index={4} className="blocks-boot-piece" style={{ "--piece-x": 7, "--piece-y": 4, "--piece-delay": "1100ms" }} />
      </div>
      <span className="blocks-boot-kicker">CHAQUE PIÈCE TROUVE SA PLACE</span><h1>Checkpoint</h1><p>Une partie à la fois.</p>
      <div className="blocks-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: progress + "%" }} /></div>
      <small>Assemblage en cours <strong>{progress}%</strong></small>
    </main>
  </div>;
}
export function BlocksTransition({ effects }) {
  const count = effects === "calm" ? 5 : effects === "boost" ? 21 : 14;
  return <div className={"blocks-tab-transition effects-"+effects} aria-hidden="true">
    <div className="blocks-transition-grid" />
    {Array.from({ length:count }, (_,i) => <Piece key={i} index={i} className="blocks-falling-piece" style={{ "--fall-x": (i * 37 % 90) + "%", "--fall-y": (18 + i * 23 % 58) + "vh", "--piece-delay": i % 7 * 12 + "ms" }} />)}
    <div className="blocks-complete-line">{Array.from({ length:10 },(_,i)=><i key={i} style={{ "--block-color":pieces[i%7].color }} />)}</div>
    <div className="blocks-line-flash" />
  </div>;
}
