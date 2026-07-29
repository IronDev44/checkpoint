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
  const binaryColumns = useMemo(() => {
    const patterns = [
      "010110100101101001011010010110100101101001011010",
      "101001011010010110100101101001011010010110100101",
      "001011010010110100101101001011010010110100101101",
      "110100101101001011010010110100101101001011010010",
    ];

    return Array.from({ length: 34 }).map((_, index) => ({
      id: `binary-${index}`,
      text: patterns[index % patterns.length].repeat(4),
      left: `${index * 3}%`,
      delay: `${-(index % 12) * 0.36}s`,
      duration: `${11 + (index % 6) * 1.2}s`,
      opacity: 0.2 + (index % 5) * 0.035,
    }));
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
      <div className="basic-splash-binary-curtain" aria-hidden="true">
        {binaryColumns.map((column) => (
          <span
            key={column.id}
            style={{
              left: column.left,
              animationDelay: column.delay,
              animationDuration: column.duration,
              opacity: column.opacity,
            }}
          >
            {column.text}
          </span>
        ))}
      </div>

      <div className="basic-splash-content">
        <div className="basic-splash-logo" aria-label="Checkpoint">
          <span className="basic-splash-logo-c">C</span>
          <span className="basic-splash-logo-cut" />
          <span className="basic-splash-logo-p">P</span>
        </div>
        <h1>Checkpoint</h1>
        <p>Votre univers gaming</p>

        <div className="basic-splash-loader">
          <span>Chargement en cours...</span>
          <div className="basic-splash-bar" aria-hidden="true">
            <div className="basic-splash-bar-fill" style={{ width: `${safeProgress}%` }}>
              <i />
            </div>
          </div>
          <strong>{safeProgress}%</strong>
        </div>
      </div>
    </div>
  );
}
