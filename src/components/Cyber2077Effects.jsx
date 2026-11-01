import { useId } from "react";
import { CHECKPOINT_2077_REFERENCE_K } from "../data/checkpoint2077ReferenceK";
import { CHECKPOINT_2077_REFERENCE_P } from "../data/checkpoint2077ReferenceP";
import "./Cyber2077Effects.css";

export const CYBER2077_THEME = "theme-checkpoint2077";
export const CYBER2077_TRANSITION_DURATION = 1040;

// Visible ink follows shared cap and baseline guides. H, I and T are drawn as
// angular brush strokes to avoid the reference font's thin, serif-like outliers.
const WORDMARK_LETTERS = [
  { letter: "C", x: 0, scale: 1.12, baseline: 83 },
  { letter: "E", x: 235, scale: .86, baseline: 88 },
  { letter: "C", x: 329, scale: 1.12, baseline: 83 },
  { letter: "O", x: 743, scale: .96, baseline: 84 },
  { letter: "N", x: 861, scale: .96, baseline: 87 },
];
const BRUSH_STROKES = [
  { letter:"H", x:152, d:"M22 24 43 17 20 108 0 116Z M78 18 98 11 75 106 55 114Z M18 62 82 48 77 64 14 78Z" },
  { letter:"I", x:833, d:"M27 25 46 18 23 106 1 117Z" },
  { letter:"T", x:956, d:"M0 28 102 9 139 12 118 24 71 30 43 109 20 122 44 36 -8 43Z" },
];

function WordmarkLetters() {
  return <>
    {WORDMARK_LETTERS.map(({letter,x,scale,baseline},index)=><text key={index} className="cp2077-lettering" x="0" y="0" transform={`translate(${x - 8 * scale} ${baseline}) scale(${scale})`}>{letter}</text>)}
    <g transform="translate(478 -17) scale(4.1) translate(-157.57 0)" stroke="none">
      <path d={CHECKPOINT_2077_REFERENCE_K.body}/>
      <path d={CHECKPOINT_2077_REFERENCE_K.tail} transform="translate(167.46 26.15) scale(.58) translate(-167.46 -26.15)"/>
    </g>
    {/* Preserve the reference P's wide bowl and long, tapering blade together. */}
    <path d={CHECKPOINT_2077_REFERENCE_P} transform="translate(559 -50.5) scale(5) translate(-100.5 0)" stroke="none" fillRule="nonzero"/>
    {BRUSH_STROKES.map(({letter,x,d})=><path key={letter} d={d} transform={`translate(${x} 0)`} stroke="none"/>)}
  </>;
}

export function Cyber2077Wordmark({ className = "" }) {
  return <span className={`cp2077-wordmark ${className}`} aria-label="Checkpoint 2077">
    <span className="cp2077-name" aria-hidden="true"><svg className="cp2077-brush" viewBox="-15 0 1125 225" focusable="false">
      <g className="cp2077-ink"><WordmarkLetters/></g>
      <g className="cp2077-ink-echo cp2077-ink-cyan"><WordmarkLetters/></g>
      <g className="cp2077-ink-echo cp2077-ink-red"><WordmarkLetters/></g>
      {/* Finish beneath the T's descending stroke, rather than its long top flourish. */}
      <text className="cp2077-year" y="162" textAnchor="end"><tspan x="759">2</tspan><tspan x="839">0</tspan><tspan x="919">7</tspan><tspan x="999">7</tspan></text>
    </svg></span>
  </span>;
}

function TerminalBackdrop() {
  return <div className="cp2077-terminal">
    <div className="cp2077-terminal-board">
      <div className="cp2077-terminal-mast" aria-hidden="true"><b>CHECKPOINT / NEURAL ARCHIVE</b><span>CP_2077 // LINK ESTABLISHED</span></div>
      <div className="cp2077-data-banks" aria-hidden="true">{Array.from({length: 6}, (_, bank) => <div className="cp2077-data-bank" key={bank}>
        <span>SECTOR 0{bank + 1} / MEMORY</span>
        <pre>{Array.from({length: 22}, (_, line) => `${(bank * 971 + line * 139 + 2077).toString(16).padStart(6, '0').toUpperCase()}  ${(line * 73 + bank * 27).toString(2).padStart(10, '0')}  CP:${String(line * 17 + bank).padStart(4, '0')}`).join('\n')}</pre>
      </div>)}</div>
      <div className="cp2077-cyan-channel"><i/><i/><i/><i/><main className="cp2077-intro-stage"><Cyber2077Wordmark/></main></div>
      <div className="cp2077-lower-banks" aria-hidden="true"><span>ARCHIVE // JEUX · PARCOURS · SOUVENIRS</span><div/><span>PERSONAL SYSTEM — 2077</span></div>
      <div className="cp2077-cross-grid"/>
    </div>
    <div className="cp2077-glass-fragments">{Array.from({length: 24}, (_, i) => <i key={i} style={{'--x':`${(i * 47 + 7) % 100}%`,'--y':`${(i * 31 + 13) % 100}%`,'--angle':`${i * 53 % 180}deg`,'--length':`${10 + i * 17 % 65}px`,'--delay':`${i % 6 * -.6}s`}}/>)}</div>
    <svg aria-hidden="true" focusable="false" className="cp2077-glass-traces" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="currentColor"><path d="M0 92 105 142 139 129 202 220 257 237 279 280M139 129 167 70 211 53M202 220 181 281 207 310M1200 80 1082 187 1048 199 1015 278 946 309M1082 187 1101 249 1148 273M1200 683 1088 622 1034 634 1001 588 917 559M1034 634 1012 695M0 646 94 590 133 594 179 521 212 505M94 590 83 545"/><path d="m41 44 21 4m291 80 14-6m492 560 21-12m221-545 18-14m-557 52 17 9m-299 543 21 16"/></g></svg>
  </div>;
}

export function Cyber2077Intro({ progress = 0, light = false, effects = "balanced", onRequestClose }) {
  const value = Math.max(0, Math.min(100, Math.round(progress)));
  const grainId = useId();
  return <div className={`cp2077-intro${light ? " is-light" : ""} effects-${effects}`}>
    <TerminalBackdrop/>
    <div className="cp2077-scanlines" aria-hidden="true"/>
    <div className="cp2077-optical-glaze" aria-hidden="true"><i/><i/></div>
    {!light && <svg className="cp2077-optical-grain" width="100%" height="100%" aria-hidden="true" focusable="false">
      <defs><filter id={grainId}><feTurbulence type="fractalNoise" baseFrequency=".74" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter></defs>
      <rect width="100%" height="100%" filter={`url(#${grainId})`}/>
    </svg>}
    <div className="cp2077-boot-rail" aria-hidden="true"><span>CP / SYSTEM 2077</span><span>CONNEXION SÉCURISÉE</span></div>
    <div className="cp2077-load">
      <div><span>{value === 100 ? "ESPACE CONNECTÉ" : "SYNCHRONISATION EN COURS"}</span><strong>{value}%</strong></div>
      <div className="cp2077-progress" role="progressbar" aria-label="Chargement de Checkpoint 2077" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: `${value}%` }}/></div>
    </div>
    {onRequestClose && <button type="button" className="cp2077-skip" onClick={onRequestClose}>Entrer dans Checkpoint <span aria-hidden="true">↗</span></button>}
  </div>;
}

export function Cyber2077Transition({ direction = "right", light = false, effects = "balanced" }) {
  return <div className={`cp2077-transition direction-${direction}${light ? " is-light" : ""} effects-${effects}`} aria-hidden="true">
    <div className="cp2077-transfer-slab"/>
    <div className="cp2077-transfer-lines"><i/><i/><i/></div>
    <div className="cp2077-transfer-lockup"><span>CHANGEMENT DE CANAL</span><Cyber2077Wordmark/></div>
    <div className="cp2077-transfer-code">CP://2077 — SIGNAL CONNECTÉ</div>
  </div>;
}
