import "./SteamDeckEffects.css";
import IntroVignette from "./IntroVignettes";

export function SteamDeckDevice() {
  return <svg className="deck-device" viewBox="0 0 360 160" fill="none" aria-hidden="true">
    <rect x="5" y="5" width="350" height="150" rx="38" fill="#161e2b" stroke="#64748b" strokeWidth="2" />
    <rect x="72" y="19" width="216" height="122" rx="8" fill="#030711" stroke="#334155" strokeWidth="3" />
    <circle cx="37" cy="43" r="15" fill="#090e17" stroke="#8b9bb2" strokeWidth="2" />
    <circle cx="323" cy="92" r="15" fill="#090e17" stroke="#8b9bb2" strokeWidth="2" />
    <path d="M31 89 H43 V99 H53 V111 H43 V121 H31 V111 H21 V99 H31 Z" fill="#070c14" stroke="#64748b" />
    <rect x="23" y="64" width="30" height="17" rx="4" fill="#283345" />
    <rect x="308" y="115" width="30" height="17" rx="4" fill="#283345" />
    {[ [323,32], [337,46], [323,60], [309,46] ].map(([x,y]) => <circle key={x+"-"+y} cx={x} cy={y} r="5" fill="#94a3b8" />)}
    <circle className="deck-screen-ring" cx="180" cy="80" r="32" stroke="#60a5fa" strokeWidth="5" strokeDasharray="150 51" />
    <text x="180" y="87" textAnchor="middle" fill="#e2e8f0" fontFamily="system-ui" fontWeight="800" fontSize="20">CP</text>
  </svg>;
}

export function SteamDeckIntro({ progress }) {
  return <div className={"deck-boot " + (progress >= 100 ? "complete" : "")}>
    <div className="deck-boot-grid" aria-hidden="true" />
    <main className="deck-boot-content">
      <span className="deck-boot-kicker">TA BIBLIOTHÈQUE, PARTOUT</span>
      <IntroVignette kind="steamdeck"/>
      <h1>Checkpoint</h1>
      <p>Prêt pour ta prochaine session.</p>
      <div className="deck-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{width:progress+"%"}} /></div>
      <small>Chargement <strong>{progress}%</strong></small>
    </main>
  </div>;
}

export function SteamDeckTransition({ direction, effects }) {
  return <div className={"deck-tab-transition direction-" + direction + " effects-" + effects} aria-hidden="true">
    <div className="deck-transition-pane pane-left" /><div className="deck-transition-pane pane-right" />
    <div className="deck-transition-device"><SteamDeckDevice /></div>
    <div className="deck-transition-tiles">{Array.from({length:effects === "calm" ? 4 : 12},(_,i)=><i key={i} style={{"--tile-index":i}} />)}</div>
  </div>;
}
