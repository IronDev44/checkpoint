import { useEffect, useState } from "react";
import { createPortal as renderPortal } from "react-dom";
import "./ThemeTransition.css";
import PlayStationSymbol from "./PlayStationSymbol";
import { SteamDeckTransition } from "./SteamDeckEffects";
import { AuroraTransition } from "./AuroraEffects";
import { XboxTransition } from "./XboxEffects";
import { ArcaneTransition } from "./ArcaneEffects";
import { StellarTransition } from "./StellarEffects";
import { MultiverseTransition } from "./MultiverseEffects";
import { RelicTransition } from "./RelicEffects";
import { TamerTransition } from "./TamerEffects";
import { MushroomTransition } from "./MushroomEffects";
import { BlueBlurTransition } from "./BlueBlurEffects";
import { BlocksTransition } from "./BlocksEffects";
import { HunterTransition } from "./HunterEffects";
import { KartTransition } from "./KartEffects";
import { CrystalTransition } from "./CrystalEffects";
import { PacTransition } from "./PacEffects";
import { WastelandTransition } from "./WastelandEffects";
import { TreasureTransition } from "./TreasureEffects";
import { SlayerTransition } from "./SlayerEffects";
import { VigilanteTransition } from "./VigilanteEffects";
import { MintTransition } from "./MintEffects";
import { RedlineTransition } from "./RedlineEffects";
import { CarbonTransition } from "./CarbonEffects";
import { ArcadeTransition } from "./ArcadeEffects";
import { TokyoTransition } from "./TokyoEffects";

// Each theme has its own motif; motion stays short enough to finish before cleanup.
export const THEME_TRANSITION_DURATION = 840;

const identities = {
  "theme-indigo": ["aurora", "#a78bfa", "M2 18 Q7 2 12 12 T22 6 M2 22 Q7 6 12 16 T22 10"],
  "theme-playstation": ["symbols", "#93c5fd", "M12 3 L22 21 H2 Z"],
  "theme-xbox": ["pulse", "#86efac", "M4 4 L20 20 M20 4 L4 20"],
  "theme-steamdeck": ["mechanical", "#e2e8f0", "M3 12 H9 V5 H17 V12 H21 M9 12 V19 H17 V12"],
  "theme-arcane": ["spell", "#d8b4fe", "M12 2 L14 9 L22 12 L14 15 L12 22 L10 15 L2 12 L10 9 Z"],
  "theme-stellar": ["warp", "#bae6fd", "M2 12 H22 M16 10 L22 12 L16 14"],
  "theme-multiverse": ["burst", "#fb7185", "M13 2 L4 14 H11 L9 22 L21 9 H13 Z"],
  "theme-relic": ["relic", "#fde68a", "M12 2 L21 12 L12 22 L3 12 Z M12 7 V17 M7 12 H17"],
  "theme-tamer": ["capture", "#fca5a5", "M22 12 A10 10 0 1 1 2 12 A10 10 0 1 1 22 12 M2 12 H8 M16 12 H22 M16 12 A4 4 0 1 1 8 12 A4 4 0 1 1 16 12"],
  "theme-mushroom": ["jump", "#facc15", "M17 12 A5 9 0 1 1 7 12 A5 9 0 1 1 17 12 M12 7 V17"],
  "theme-blueblur": ["dash", "#facc15", "M21 12 A9 9 0 1 1 3 12 A9 9 0 1 1 21 12 M18 12 A6 6 0 1 1 6 12 A6 6 0 1 1 18 12"],
  "theme-blocks": ["drop", "#c084fc", "M2 2 H9 V9 H2 Z M9 2 H16 V9 H9 Z M16 2 H23 V9 H16 Z M9 9 H16 V16 H9 Z"],
  "theme-cubic": ["assemble", "#86efac", "M12 2 L22 7 V17 L12 22 L2 17 V7 Z M2 7 L12 12 L22 7 M12 12 V22"],
  "theme-hunter": ["scan", "#fb923c", "M3 8 V3 H8 M16 3 H21 V8 M21 16 V21 H16 M8 21 H3 V16 M7 12 H17 M12 7 V17"],
  "theme-kart": ["race", "#f472b6", "M3 3 H10 V10 H3 Z M10 10 H17 V17 H10 Z M17 3 H24 V10 H17 Z M3 17 H10 V24 H3 Z M17 17 H24 V24 H17 Z"],
  "theme-crystal": ["crystal", "#7dd3fc", "M12 1 L20 7 L16 20 L12 23 L8 20 L4 7 Z M4 7 H20 M12 1 L8 7 L12 23 L16 7 Z"],
  "theme-ring": ["chomp", "#fde047", "M21 5 A11 11 0 1 0 21 19 L12 12 Z M10 5 H10.1"],
  "theme-matrix": ["rain", "#4ade80", null],
  "theme-wasteland": ["dust", "#fdba74", "M3 16 L8 8 L12 13 L18 4 L21 17 M5 21 H19"],
  "theme-treasure": ["compass", "#fbbf24", "M12 2 V18 M7 7 H17 M3 14 Q3 22 12 22 Q21 22 21 14 M3 14 L1 17 M21 14 L23 17"],
  "theme-vigilante": ["wings", "#facc15", "M1 5 L8 9 L10 6 L12 9 L14 6 L16 9 L23 5 L20 16 L15 15 L12 21 L9 15 L4 16 Z"],
  "theme-emerald": ["circuit", "#6ee7b7", "M2 5 H9 V12 H15 V19 H22 M2 19 H7 V12 M17 12 V5 H22"],
  "theme-crimson": ["redline", "#fb7185", "M2 5 L13 12 L2 19 M11 5 L22 12 L11 19"],
  "theme-graphite": ["shutter", "#cbd5e1", "M2 7 H22 M2 12 H16 M2 17 H10"],
  "theme-retro": ["pixels", "#fb923c", "M4 4 H9 V9 H15 V4 H20 V20 H15 V15 H9 V20 H4 Z"],
  "theme-cyberpunk": ["glitch", "#22d3ee", "M2 8 H10 V3 H22 M2 16 H14 V21 H22 M5 12 H19"],
};

const tetrisPieces = [[0,1,2,3], [0,1,4,5], [1,4,5,6], [0,4,5,6], [2,4,5,6], [1,2,4,5], [0,1,5,6]];
const tetrisColors = ["#22d3ee", "#facc15", "#c084fc", "#60a5fa", "#fb923c", "#4ade80", "#f87171"];
function renderMotif(theme, path, index) {
  if (theme === "theme-playstation") return <PlayStationSymbol index={index} />;
  if (theme === "theme-cubic") return <b className="dirt-block"><i className="block-crack" /></b>;
  if (theme === "theme-blocks") return <b className="tetris-piece" style={{ "--piece-color": tetrisColors[index % 7] }}>{Array.from({length: 8}, (_, cell) => <i key={cell} className={tetrisPieces[index % 7].includes(cell) ? "filled" : ""} />)}</b>;
  if (theme === "theme-matrix") return <b className="matrix-code">{Array.from({length: 16}, (_, row) => <i key={row}>{"01アイウエオカキクケコ789"[(index * 7 + row * 11) % 18]}</i>)}</b>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>;
}

function transitionPortal(content, target, fullMotion, light = false) {
  return renderPortal(<div className={`${fullMotion ? "checkpoint-full-tab-motion" : "checkpoint-tab-motion"}${light ? " checkpoint-tab-light" : ""}`} style={{ display: "contents" }}>{content}</div>, target);
}

function MatrixScreenTransition({ effects, fullMotion, light }) {
  const createPortal = (content, target) => transitionPortal(content, target, fullMotion, light);
  const symbols = "012345789アイウエオカキクケコサシスセソタチツテトナニヌネノ<>:=+";
  return createPortal(
    <div className={"matrix-screen-transition effects-" + effects} aria-hidden="true">
      <div className="matrix-screen-code">
        {Array.from({length: light ? 24 : 64}, (_, column) => <pre key={column} className="matrix-screen-column" style={{ "--code-speed": (800 + column % 7 * 65) + "ms", "--code-offset": (-column % 9 * 22) + "px", "--code-brightness": .45 + column % 5 * .12 }}>
          {Array.from({length: 90}, (_, row) => (row + column * 3) % 21 < 4 ? " " : symbols[(column * 17 + row * 13 + row * row) % symbols.length]).join("\n")}
        </pre>)}
      </div>
      <div className="matrix-screen-grain" />
    </div>, document.body
  );
}

function useReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(() =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );
  useEffect(() => {
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!preference) return undefined;
    const update = () => setReduceMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  return reduceMotion;
}

export function TransitionMotionNotice({ fullMotion = false }) {
  const reduceMotion = useReducedMotion();
  return <p className="transition-motion-notice">
    {fullMotion
      ? "Les transitions complètes sont activées, même si ton appareil limite les animations."
      : reduceMotion
      ? "Ton appareil limite les animations : un repère discret remplace les effets du thème."
      : "Les animations du thème sont autorisées par ton appareil."}
  </p>;
}

export default function ThemeTransition({ theme, direction, effects, fullMotion = false, light = false }) {
  const reduceMotion = useReducedMotion();
  const createPortal = (content, target) => transitionPortal(content, target, fullMotion, light);
  // Keep a visible, stationary cue when Android suppresses motion. The
  // system preference still prevents sweeps, flashes and moving particles.
  if (reduceMotion && !fullMotion) return createPortal(
    <div className="checkpoint-transition-still" aria-hidden="true" />,
    document.body
  );
  if (theme === "theme-slayer") return createPortal(<SlayerTransition direction={direction} effects={effects} />, document.body);
  if (theme === "theme-cyberpunk") return createPortal(<TokyoTransition direction={direction} effects={effects} />, document.body);
  if (theme === "theme-retro") return createPortal(<ArcadeTransition effects={effects} />, document.body);
  if (theme === "theme-graphite") return createPortal(<CarbonTransition direction={direction} effects={effects} />, document.body);
  if (theme === "theme-crimson") return createPortal(<RedlineTransition direction={direction} effects={effects} />, document.body);
  if (theme === "theme-emerald") return createPortal(<MintTransition effects={effects} />, document.body);
  if (theme === "theme-vigilante") return createPortal(<VigilanteTransition direction={direction} effects={effects} />, document.body);
  if (theme === "theme-treasure") return createPortal(<TreasureTransition direction={direction} effects={effects} />, document.body);
  if (theme === "theme-wasteland") return createPortal(<WastelandTransition direction={direction} effects={effects} />, document.body);
  if (theme === "theme-ring") return createPortal(<PacTransition direction={direction} effects={effects} />, document.body);
  if (theme === "theme-crystal") return createPortal(<CrystalTransition effects={effects} />, document.body);
  if (theme === "theme-kart") return createPortal(<KartTransition direction={direction} effects={effects} light={light} />, document.body);
  if (theme === "theme-hunter") return createPortal(<HunterTransition direction={direction} effects={effects} />, document.body);
  if (theme === "theme-blocks") return createPortal(<BlocksTransition effects={effects} />, document.body);
  if (theme === "theme-blueblur") return createPortal(<BlueBlurTransition direction={direction} effects={effects} />, document.body);
  if (theme === "theme-mushroom") return createPortal(<MushroomTransition direction={direction} effects={effects} />, document.body);
  if (theme === "theme-tamer") return createPortal(<TamerTransition effects={effects} />, document.body);
  if (theme === "theme-relic") return createPortal(<RelicTransition direction={direction} effects={effects} />, document.body);
  if (theme === "theme-multiverse") return createPortal(<MultiverseTransition direction={direction} effects={effects} />, document.body);
  if (theme === "theme-stellar") return createPortal(<StellarTransition effects={effects} />, document.body);
  if (theme === "theme-arcane") return createPortal(<ArcaneTransition direction={direction} effects={effects} />, document.body);
  if (theme === "theme-indigo") return createPortal(<AuroraTransition direction={direction} effects={effects} />, document.body);
  if (theme === "theme-steamdeck") return createPortal(<SteamDeckTransition direction={direction} effects={effects} />, document.body);
  if (theme === "theme-xbox") return createPortal(<XboxTransition direction={direction} effects={effects} />, document.body);
  if (theme === "theme-matrix") return <MatrixScreenTransition effects={effects} fullMotion={fullMotion} light={light} />;
  const [motion, color, path] = identities[theme] || identities["theme-indigo"];
  const count = effects === "calm" ? 18 : effects === "boost" ? 112 : 72;
  const sparkCount = effects === "calm" ? 0 : effects === "boost" ? 144 : 80;
  return createPortal(
    <div className={`checkpoint-theme-transition motion-${motion} effects-${effects} direction-${direction}`} aria-hidden="true" style={{ "--travel": direction === "left" ? "calc(-100vw - 80px)" : "calc(100vw + 80px)", "--origin": direction === "left" ? "calc(100% + 32px)" : "-32px", "--motif-color": color }}>
      <i className="transition-veil" />
      <div className="transition-feature" aria-hidden="true">{(theme === "theme-playstation" ? [0,1,2,3] : [0,1,2]).map((index) => <div key={index} style={{ "--feature-index": index, "--feature-turn": `${index % 2 ? -25 : 25}deg` }}>{renderMotif(theme, path, index)}</div>)}</div>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} style={{ "--row": `${4 + ((i * 37) % 92)}vh`, "--column": `${(i * 37) % 100}vw`, "--wait": `${(i % 8) * 16}ms`, "--motif-size": `${22 + (i % 4) * 6}px`, "--debris-x": `${(i % 2 ? 1 : -1) * (50 + i % 80)}px`, "--ray-angle": `${(i / count) * 360}deg`, "--drift": `${(i % 2 ? 1 : -1) * 22}vh`, "--tilt": `${(i % 2 ? 1 : -1) * 30}deg` }}>
          {renderMotif(theme, path, i)}
        </span>
      ))}
      <div className="transition-spark-field">
        {Array.from({ length: sparkCount }, (_, i) => <i key={i} style={{ "--spark-x": `${(i * 61.803) % 100}vw`, "--spark-y": `${(i * 37.719) % 100}vh`, "--spark-size": `${2 + (i % 4)}px`, "--spark-delay": `${(i % 9) * 12}ms`, "--spark-drift": `${(i % 2 ? 1 : -1) * (35 + i % 50)}px`, "--ray-angle": `${(i / sparkCount) * 360}deg` }} />)}
      </div>
    </div>, document.body
  );
}
