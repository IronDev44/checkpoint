import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedElement, LocalizedValue } from "../i18n/Localized";import ThemeWordmark from './ThemeWordmark';
import "./TamerEffects.css";
import IntroVignette from "./IntroVignettes";

export function TamerIntro({ progress }) {useLanguage();
  return <div className="tamer-boot"><main className="tamer-boot-content">
    <IntroVignette kind="tamer" />
    <span className="tamer-boot-kicker"><LocalizedMessage source={"À CHAQUE RENCONTRE, UNE AVENTURE"} values={[]} /></span><h1><ThemeWordmark theme="theme-tamer">Checkpoint</ThemeWordmark></h1><p><LocalizedMessage source={"Ta collection grandit avec toi."} values={[]} /></p>
    <LocalizedElement __as={"div"} className="tamer-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: progress + "%" }} /></LocalizedElement>
    <small><LocalizedMessage source={"Préparation du voyage "} values={[]} /><strong><LocalizedValue value={progress} />%</strong></small>
  </main></div>;
}

export function TamerTransition({ effects }) {useLanguage();
  const count = effects === "calm" ? 8 : effects === "boost" ? 56 : 32;
  return <div className={"tamer-tab-transition effects-" + effects} aria-hidden="true">
    <div className="tamer-capture-glow" />
    <div className="tamer-capture-ring" />
    <div className="tamer-capsule">
      <div className="tamer-capsule-top" /><div className="tamer-capsule-bottom" />
      <div className="tamer-capsule-button" />
    </div>
    <div className="tamer-capture-sparks">{Array.from({ length: count }, (_, i) => <i key={i} style={{ "--capture-angle": i * 360 / count + "deg", "--capture-distance": 120 + i % 5 * 40 + "px", "--capture-delay": i % 5 * 10 + "ms" }} />)}</div>
  </div>;
}
