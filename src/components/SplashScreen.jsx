import { useEffect, useMemo } from "react";
import PlayStationSymbol from "./PlayStationSymbol";
import { SteamDeckIntro } from "./SteamDeckEffects";
import { AuroraIntro } from "./AuroraEffects";
import { XboxIntro } from "./XboxEffects";
import { ArcaneIntro } from "./ArcaneEffects";
import { StellarIntro } from "./StellarEffects";
import { MultiverseIntro } from "./MultiverseEffects";
import { RelicIntro } from "./RelicEffects";
import { MushroomIntro } from "./MushroomEffects";
import { BlueBlurIntro } from "./BlueBlurEffects";
import { BlocksIntro } from "./BlocksEffects";
import CubicIntro from "./CubicIntro";
import { HunterIntro } from "./HunterEffects";
import { KartIntro } from "./KartEffects";
import { CrystalIntro } from "./CrystalEffects";
import { PacIntro } from "./PacEffects";
import CodeGreenIntro from "./CodeGreenIntro";
import { WastelandIntro } from "./WastelandEffects";
import { TreasureIntro } from "./TreasureEffects";
import { VigilanteIntro } from "./VigilanteEffects";
import { MintIntro } from "./MintEffects";
import { RedlineIntro } from "./RedlineEffects";
import { CarbonIntro } from "./CarbonEffects";
import { ArcadeIntro } from "./ArcadeEffects";
import { TokyoIntro } from "./TokyoEffects";

export default function SplashScreen({ showSplash, progress = 0, onRequestClose }) {
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const splashTheme = useMemo(() => {
    try {
      return localStorage.getItem("checkpoint-theme") || "theme-indigo";
    } catch (error) {
      return "theme-indigo";
    }
  }, []);

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
    if (!showSplash || typeof onRequestClose !== "function") return;

    const safetyTimer = setTimeout(() => {
      onRequestClose();
    }, 4200);

    return () => clearTimeout(safetyTimer);
  }, [onRequestClose, showSplash]);

  if (!showSplash) return null;

  if (splashTheme === "theme-cyberpunk") return <TokyoIntro progress={safeProgress} />;
  if (splashTheme === "theme-retro") return <ArcadeIntro progress={safeProgress} />;
  if (splashTheme === "theme-graphite") return <CarbonIntro progress={safeProgress} />;
  if (splashTheme === "theme-crimson") return <RedlineIntro progress={safeProgress} />;
  if (splashTheme === "theme-emerald") return <MintIntro progress={safeProgress} />;
  if (splashTheme === "theme-vigilante") return <VigilanteIntro progress={safeProgress} />;
  if (splashTheme === "theme-treasure") return <TreasureIntro progress={safeProgress} />;
  if (splashTheme === "theme-wasteland") return <WastelandIntro progress={safeProgress} />;
  if (splashTheme === "theme-matrix") return <CodeGreenIntro progress={safeProgress} />;
  if (splashTheme === "theme-ring") return <PacIntro progress={safeProgress} />;
  if (splashTheme === "theme-crystal") return <CrystalIntro progress={safeProgress} />;
  if (splashTheme === "theme-kart") return <KartIntro progress={safeProgress} />;
  if (splashTheme === "theme-hunter") return <HunterIntro progress={safeProgress} />;
  if (splashTheme === "theme-cubic") return <CubicIntro progress={safeProgress} />;
  if (splashTheme === "theme-blocks") return <BlocksIntro progress={safeProgress} />;
  if (splashTheme === "theme-blueblur") return <BlueBlurIntro progress={safeProgress} />;
  if (splashTheme === "theme-mushroom") return <MushroomIntro progress={safeProgress} />;
  if (splashTheme === "theme-relic") return <RelicIntro progress={safeProgress} />;
  if (splashTheme === "theme-multiverse") return <MultiverseIntro progress={safeProgress} />;
  if (splashTheme === "theme-stellar") return <StellarIntro progress={safeProgress} />;
  if (splashTheme === "theme-arcane") return <ArcaneIntro progress={safeProgress} />;
  if (splashTheme === "theme-xbox") return <XboxIntro progress={safeProgress} />;
  if (splashTheme === "theme-indigo") return <AuroraIntro progress={safeProgress} />;
  if (splashTheme === "theme-steamdeck") return <SteamDeckIntro progress={safeProgress} />;

  return (
    <div className={`checkpoint-splash ${safeProgress >= 100 ? "complete" : ""}`}>
      <div className="splash-bg" />
      {splashTheme === "theme-playstation" && <div className="playstation-intro-symbols" aria-hidden="true">{[0,1,2,3].map((index) => <span key={index}><PlayStationSymbol index={index} /></span>)}</div>}
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
            <strong>{safeProgress}%</strong>
          </div>

          <div className="loader-bar">
            <div className="loader-fill" style={{ width: `${safeProgress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
