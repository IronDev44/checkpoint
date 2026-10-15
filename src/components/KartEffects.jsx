import { useEffect, useRef } from "react";
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
        distance += seconds * (transition ? 30 + Math.min(elapsed, .8) * 65 : boostRef.current ? 28 : 12);
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

export function KartIntro({ progress = 0, light = false, effects = "balanced", onRequestClose }) {
  useEffect(() => {
    document.documentElement.classList.add("checkpoint-kart-intro-active");
    return () => document.documentElement.classList.remove("checkpoint-kart-intro-active");
  }, []);
  const value = Math.max(0, Math.min(100, Math.round(Number(progress) || 0)));
  const ready = value >= 100;
  return <div className={`kart-boot kart-v2 ${light ? "is-light" : ""} ${ready ? "is-ready" : ""}`} role="region" aria-label="Introduction Mario Kart, Route Arc-en-ciel">
    <RainbowDrive light={light} effects={effects} boost={ready} />
    <header className="kart-boot-header">
      <span className="kart-grand-prix"><i aria-hidden="true"/> MARIO KART WORLD</span>
      {onRequestClose && <button type="button" className="kart-skip" onClick={onRequestClose}>Passer l’intro <span aria-hidden="true">›</span></button>}
    </header>
    <div className="kart-boot-title"><h1>CHECKPOINT</h1><p>Route Arc-en-ciel</p></div>
    <div className="kart-loading">
      <div><span>{ready ? "Tout est prêt" : "Chargement…"}</span><strong>{value}%</strong></div>
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
