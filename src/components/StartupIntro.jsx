import { useEffect, useRef, useState } from "react";
import SplashScreen from "./SplashScreen";

export default function StartupIntro({ visible, appearance, authReady, appProgress = 0, ready, onComplete }) {
  const [progress, setProgress] = useState(2);
  const progressValue = useRef(2);
  const startedAt = useRef(Date.now());
  const completedAt = useRef(0);
  const state = useRef({ ready, authReady, appProgress, onComplete });
  state.current = { ready, authReady, appProgress, onComplete };
  useEffect(() => {
    if (!visible) return;
    startedAt.current = Date.now(); completedAt.current = 0; progressValue.current = 2; setProgress(2);
    const timer = window.setInterval(() => {
      const now = Date.now(), elapsed = now - startedAt.current;
      const current = state.current;
      const target = current.ready && elapsed >= 2900 ? 100 : current.authReady ? Math.min(92, 40 + current.appProgress * 50) : Math.min(25, 8 + elapsed / 450);
      const previous = progressValue.current;
      const next = Math.round(Math.max(previous, Math.min(target, previous + Math.max(1, Math.ceil((target - previous) * .2)))));
      progressValue.current = next; setProgress(next);
      if (next >= 100 && current.ready && !completedAt.current) completedAt.current = now;
      if (current.ready && elapsed >= 3600 && completedAt.current && now - completedAt.current >= 240) {
        window.clearInterval(timer); current.onComplete();
      }
    }, 80);
    return () => window.clearInterval(timer);
  }, [visible]);
  return <SplashScreen showSplash={visible} progress={progress} theme={appearance.theme} effects={appearance.effects} light={appearance.light} managed onRequestClose={ready ? onComplete : undefined} />;
}
