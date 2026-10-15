import { useEffect, useId, useRef } from "react";
import { getKartSceneBudget, paintKartSky, paintKartRoad } from "../services/kartScene";
import "./KartEffects.css";

function RainbowDrive({ light = false, effects = "balanced", boost = false, transition = false, direction = "right" }) {
  const canvasRef = useRef(null);
  const boostRef = useRef(boost);
  boostRef.current = boost;
  useEffect(() => {
    const canvas = canvasRef.current;
    let ctx;
    try { ctx = canvas.getContext("2d", { alpha: false }); } catch { return; }
    if (!ctx) return;
    const backdrop = document.createElement("canvas");
    const sky = backdrop.getContext("2d", { alpha: false });
    if (!sky) return;
    let width = 0, height = 0, budget, frame = 0, lastTime = 0, elapsed = 0, distance = 2.6, stopped = false;
    const draw = () => {
      ctx.drawImage(backdrop, 0, 0, width, height);
      paintKartRoad(ctx, width, height, distance, elapsed, { budget, direction: direction === "left" ? -1 : 1, boost: transition || boostRef.current });
      canvas.dataset.ready = "true";
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width); height = Math.max(1, rect.height);
      budget = getKartSceneBudget(width, height, { light, effects, dpr: window.devicePixelRatio });
      canvas.width = backdrop.width = Math.max(1, Math.round(width * budget.pixelRatio));
      canvas.height = backdrop.height = Math.max(1, Math.round(height * budget.pixelRatio));
      ctx.setTransform(budget.pixelRatio, 0, 0, budget.pixelRatio, 0, 0);
      sky.setTransform(budget.pixelRatio, 0, 0, budget.pixelRatio, 0, 0);
      paintKartSky(sky, width, height, budget);
      draw();
    };
    const tick = now => {
      if (stopped) return;
      if (!lastTime) lastTime = now;
      const delta = now - lastTime;
      if (delta >= 1000 / budget.fps - .5) {
        const seconds = Math.min(delta / 1000, .05);
        lastTime = now; elapsed += seconds;
        distance += seconds * (transition ? 30 + Math.min(elapsed, .8) * 65 : boostRef.current ? 20 : 6);
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (document.hidden || stopped || frame) return;
      lastTime = 0; frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
      cancelAnimationFrame(frame); frame = 0; lastTime = 0;
      if (!document.hidden) start();
    };
    resize(); start();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    observer?.observe(canvas);
    if (!observer) window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      stopped = true; cancelAnimationFrame(frame); observer?.disconnect();
      window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", visibility);
    };
  }, [light, effects, transition, direction]);
  return <div className="kart-rainbow-drive" aria-hidden="true">
    <div className="kart-road-fallback" />
    <canvas ref={canvasRef} className="kart-scene-canvas" />
    <div className="kart-scene-vignette" />
  </div>;
}

function DriverCockpit({ light }) {
  const id = useId().replace(/:/g, "");
  return <svg className={`kart-cockpit ${light ? "is-light" : ""}`} viewBox="0 95 760 175" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-red`} x2="0" y2="1"><stop stopColor="#ff5d6b"/><stop offset=".45" stopColor="#c32c46"/><stop offset="1" stopColor="#64182f"/></linearGradient>
      <linearGradient id={`${id}-metal`} x2="0" y2="1"><stop stopColor="#8594b5"/><stop offset=".35" stopColor="#26314b"/><stop offset="1" stopColor="#0a1021"/></linearGradient>
      <linearGradient id={`${id}-glove`} x2=".3" y2="1"><stop stopColor="#fff7ed"/><stop offset="1" stopColor="#adb9d0"/></linearGradient>
    </defs>
    <path d="M-30 280L5 140Q56 94 116 114L242 182H518L644 114Q704 94 755 140L790 280Z" fill={`url(#${id}-red)`} stroke="#fc8c99" strokeWidth="2"/>
    <path d="M18 148Q61 121 110 133L213 197M742 148Q699 121 650 133L547 197" fill="none" stroke="#ffbec1" strokeWidth="5"/>
    <path d="M125 280L218 170Q380 126 542 170L635 280Z" fill={`url(#${id}-metal)`} stroke="#596987" strokeWidth="3"/>
    <path d="M254 188Q380 151 506 188L484 224H276Z" fill="#080e20" stroke="#8394b3" strokeWidth="2"/>
    <path d="M306 196H454" stroke="#62e8ed" strokeWidth="3" strokeDasharray="8 4"/>
    <g className="kart-cockpit-wheel">
      <ellipse cx="380" cy="200" rx="124" ry="67" fill="none" stroke="#080c18" strokeWidth="25"/>
      <ellipse cx="380" cy="200" rx="124" ry="67" fill="none" stroke="#7b87a3" strokeWidth="3"/>
      <path d="M270 202L355 217M490 202L405 217M380 220V267" stroke="#151d31" strokeWidth="21"/>
      <path d="M275 202L354 216M485 202L406 216" stroke="#60708d" strokeWidth="3"/>
      <ellipse cx="380" cy="216" rx="36" ry="25" fill="#25324c" stroke="#7789a9" strokeWidth="2"/>
      <path d="M380 200L385 211L398 212L389 221L391 233L380 227L369 233L371 221L362 212L375 211Z" fill="#ffe298"/>
      <g fill={`url(#${id}-glove)`} stroke="#77849e" strokeWidth="1.5">
        <path d="M229 207Q224 188 237 173L250 162Q259 158 264 165L276 183Q289 179 294 187Q298 198 284 211L266 226Z"/>
        <path d="M531 207Q536 188 523 173L510 162Q501 158 496 165L484 183Q471 179 466 187Q462 198 476 211L494 226Z"/>
      </g>
      <path d="M223 205L266 223L255 249L207 227ZM537 205L494 223L505 249L553 227Z" fill="#c62b45" stroke="#f07080" strokeWidth="2"/>
      <path d="M241 180L255 195M250 173L265 189M519 180L505 195M510 173L495 189" stroke="#8392ab" strokeWidth="2" strokeLinecap="round"/>
    </g>
  </svg>;
}

export function KartIntro({ progress = 0, light = false, effects = "balanced", onRequestClose }) {
  useEffect(() => {
    document.documentElement.classList.add("checkpoint-kart-intro-active");
    return () => document.documentElement.classList.remove("checkpoint-kart-intro-active");
  }, []);
  const value = Math.max(0, Math.min(100, Math.round(Number(progress) || 0)));
  const stage = value < 34 ? 0 : value < 67 ? 1 : value < 100 ? 2 : 3;
  return <div className={`kart-boot kart-v2 ${light ? "is-light" : ""} ${stage === 3 ? "is-ready" : ""}`} role="region" aria-label="Introduction Mario Kart, Route Arc-en-ciel">
    <RainbowDrive light={light} effects={effects} boost={stage === 3} />
    <header className="kart-boot-header">
      <span className="kart-grand-prix"><i aria-hidden="true"/> GRAND PRIX</span>
      {onRequestClose && <button type="button" className="kart-skip" onClick={onRequestClose}>Passer l’intro <span aria-hidden="true">›</span></button>}
    </header>
    <div className="kart-boot-title"><span>MARIO KART</span><h1>CHECKPOINT</h1><p>Route Arc-en-ciel</p></div>
    <div className="kart-start-signal" aria-hidden="true">
      <div className="kart-start-lights">{[0, 1, 2].map(index => <i key={index} className={stage >= index ? "lit" : ""}/>)}</div>
      <strong>{stage === 3 ? "GO!" : 3 - stage}</strong>
    </div>
    <DriverCockpit light={light}/>
    <div className="kart-loading">
      <div><span>{value >= 100 ? "C’est parti !" : "Sur la grille de départ"}</span><strong>{value}%</strong></div>
      <div className="kart-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{width:`${value}%`}}/></div>
    </div>
  </div>;
}

export function KartTransition({ direction = "right", effects = "balanced", light = false }) {
  const reduced = light || effects === "calm";
  return <div className={`kart-tab-transition kart-v2 direction-${direction} ${reduced ? "is-light" : ""}`} aria-hidden="true">
    <div className="kart-boost-stage"><RainbowDrive light={reduced} effects={effects} transition direction={direction}/></div>
    <div className="kart-boost-label"><span>★</span> BOOST <span>»</span></div>
    <div className="kart-exit-ribbon"/>
  </div>;
}
