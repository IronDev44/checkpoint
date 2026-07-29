import { useEffect, useMemo } from "react";

export default function SplashScreen({ showSplash, progress = 0, onRequestClose }) {
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const splashTheme = useMemo(() => {
    try {
      return localStorage.getItem("checkpoint-theme") || "theme-indigo";
    } catch (error) {
      return "theme-indigo";
    }
  }, []);

  useEffect(() => {
    if (!showSplash || typeof onRequestClose !== "function") return;

    const safetyTimer = setTimeout(() => {
      onRequestClose();
    }, 4200);

    return () => clearTimeout(safetyTimer);
  }, [onRequestClose, showSplash]);

  if (!showSplash) return null;

  return (
    <div className={`basic-splash ${splashTheme}`}>
      <div className="basic-splash-backdrop" />

      <div className="basic-splash-content">
        <div className="basic-splash-logo">CP</div>
        <h1>Checkpoint</h1>
        <p>Votre univers gaming</p>

        <div className="basic-splash-loader">
          <span>Chargement en cours...</span>
          <div className="basic-splash-bar" aria-hidden="true">
            <div style={{ width: `${safeProgress}%` }} />
          </div>
          <strong>{safeProgress}%</strong>
        </div>
      </div>
    </div>
  );
}
