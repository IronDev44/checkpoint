import { useLanguage } from "../i18n/language";import { LocalizedValue, LocalizedMessage, LocalizedElement } from "../i18n/Localized";import ThemeWordmark from './ThemeWordmark';
import IntroVignette from "./IntroVignettes";
import "./MultiverseEffects.css";
function Portal({ count }) {useLanguage();
  return <div className="hero-mystic-portal" aria-hidden="true"><div className="hero-portal-window" /><div className="hero-portal-rim" /><div className="hero-portal-sparks">{Array.from({ length: count }, (_, i) => <i key={i} style={{ "--ember-angle": i * 360 / count + "deg", "--ember-delay": -i % 11 * 90 + "ms", "--ember-length": 9 + i % 4 * 6 + "px" }} />)}</div></div>;
}
export function MultiverseIntro({ progress }) {useLanguage();
  return <div className="hero-boot"><div className="hero-cosmic-clouds" aria-hidden="true" /><main className="hero-boot-content">
    <IntroVignette kind="multiverse" /><span className="hero-kicker"><LocalizedMessage source={"TES UNIVERS PRENNENT VIE"} values={[]} /></span><h1><ThemeWordmark theme="theme-multiverse">Checkpoint</ThemeWordmark></h1><p><LocalizedMessage source={"Chaque aventure ouvre une nouvelle réalité."} values={[]} /></p>
    <LocalizedElement __as={"div"} className="hero-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: progress + "%" }} /></LocalizedElement>
    <small><LocalizedMessage source={"Ouverture du multivers "} values={[]} /><strong><LocalizedValue value={progress} />%</strong></small>
  </main></div>;
}
export function MultiverseTransition({ direction, effects }) {useLanguage();
  return <div className={"hero-tab-transition direction-" + direction + " effects-" + effects} aria-hidden="true">
    <div className="hero-reality-wash" /><div className="hero-portal-traverse"><Portal count={effects === "calm" ? 12 : effects === "boost" ? 100 : 64} /></div>
    <div className="hero-reality-fragments">{Array.from({ length: effects === "calm" ? 0 : effects === "boost" ? 24 : 12 }, (_, i) => <i key={i} style={{ "--fragment-x": i * 61.803 % 100 + "%", "--fragment-y": i * 37.719 % 100 + "%", "--fragment-angle": i * 137.5 + "deg", "--fragment-delay": i % 5 * 12 + "ms" }} />)}</div>
  </div>;
}
