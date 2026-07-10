import { useEffect, useMemo } from "react";

export default function SplashScreen({ showSplash, progress = 0 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 44 }).map((_, index) => ({
        id: index,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 4 + Math.random() * 3,
        size: 1 + Math.random() * 2.2,
      })),
    []
  );

  const pixelWalls = useMemo(
    () => ({
      left: Array.from({ length: 52 }).map((_, index) => ({
        id: `left-${index}`,
        x: 4 + Math.pow(index / 52, 1.2) * 34 + (Math.random() - 0.5) * 7,
        y: 13 + Math.random() * 58,
        endX: 42 + Math.random() * 7,
        endY: 55 + Math.random() * 9,
        size: 2 + Math.random() * 7,
        delay: Math.random() * 2.4,
        opacity: 0.2 + Math.random() * 0.34,
      })),
      right: Array.from({ length: 52 }).map((_, index) => ({
        id: `right-${index}`,
        x: 96 - Math.pow(index / 52, 1.2) * 34 + (Math.random() - 0.5) * 7,
        y: 13 + Math.random() * 58,
        endX: 51 + Math.random() * 7,
        endY: 55 + Math.random() * 9,
        size: 2 + Math.random() * 7,
        delay: Math.random() * 2.4,
        opacity: 0.2 + Math.random() * 0.34,
      })),
    }),
    []
  );

  useEffect(() => {
    if (!showSplash) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const master = ctx.createGain();
      master.gain.value = 0.055;
      master.connect(ctx.destination);

      const now = ctx.currentTime;

      const playNote = (freq, start, duration, type = "sine") => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + start);

        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.exponentialRampToValueAtTime(0.22, now + start + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now + start);
        osc.stop(now + start + duration);
      };

      playNote(196, 0, 0.65, "sine");
      playNote(293.66, 0.14, 0.85, "triangle");
      playNote(392, 0.42, 1.1, "sine");
      playNote(587.33, 0.9, 1.3, "triangle");

      setTimeout(() => {
        ctx.close().catch(() => {});
      }, 2800);
    } catch (e) {
      console.warn("Boot sound ignoré :", e);
    }
  }, [showSplash]);

  if (!showSplash) return null;

  return (
      <div className={`checkpoint-splash ${progress >= 100 ? "complete" : ""}`}>
      <div className="splash-bg" />
      <div className="splash-grid" />
      <div className="splash-neon-horizon" />
      <div className="splash-floor-reflection" />
      <div className="splash-vignette" />

      <div className="splash-particles-premium">
        {particles.map((particle) => (
          <span
            key={particle.id}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="splash-pixel-wall splash-pixel-wall-left">
        {pixelWalls.left.map((pixel) => (
          <span
            key={pixel.id}
            style={{
              left: `${pixel.x}%`,
              top: `${pixel.y}%`,
              width: `${pixel.size}px`,
              height: `${pixel.size}px`,
              opacity: pixel.opacity,
              animationDelay: `${pixel.delay}s`,
              "--end-x": `${pixel.endX - pixel.x}vw`,
              "--end-y": `${pixel.endY - pixel.y}vh`,
            }}
          />
        ))}
      </div>

      <div className="splash-pixel-wall splash-pixel-wall-right">
        {pixelWalls.right.map((pixel) => (
          <span
            key={pixel.id}
            style={{
              left: `${pixel.x}%`,
              top: `${pixel.y}%`,
              width: `${pixel.size}px`,
              height: `${pixel.size}px`,
              opacity: pixel.opacity,
              animationDelay: `${pixel.delay}s`,
              "--end-x": `${pixel.endX - pixel.x}vw`,
              "--end-y": `${pixel.endY - pixel.y}vh`,
            }}
          />
        ))}
      </div>

      <div className="splash-stage">
        <div className="splash-cube-wrap">
          <div className="splash-cube">
            <div className="splash-logo-mark" aria-label="Checkpoint">
              <span className="splash-logo-letter">C</span>
              <span className="splash-logo-divider" />
              <span className="splash-logo-letter">P</span>
            </div>
          </div>
        </div>

        <div className="splash-title-wrap">
          <h1 className="splash-title">Checkpoint</h1>
          <div className="splash-title-reflect">Checkpoint</div>
        </div>

        <p className="splash-subtitle">Votre univers gaming</p>

        <div className="splash-loader">
          <div className="splash-loading-label">Chargement en cours...</div>
          <div className="splash-loader-top">
            <strong>{progress}%</strong>
          </div>

          <div className="loader-bar">
            <div className="loader-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="splash-scanline" />
    </div>
  );
}
