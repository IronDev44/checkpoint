import { useLanguage } from "../i18n/language";import { LocalizedValue, LocalizedMessage, LocalizedElement } from "../i18n/Localized";import ThemeWordmark from './ThemeWordmark';
import "./StellarEffects.css";
function StarField({ count = 100 }) {useLanguage();
  return <div className="stellar-star-field" aria-hidden="true">{Array.from({ length: count }, (_, i) => <i key={i} style={{ "--star-x": i * 61.803 % 100 + "%", "--star-y": i * 37.719 % 100 + "%", "--star-size": 1 + i % 3 + "px", "--star-angle": i / count * 360 + "deg", "--star-delay": i % 7 * 10 + "ms" }} />)}</div>;
}
export function StellarIntro({ progress }) {useLanguage();
  return <div className="stellar-boot"><StarField /><div className="stellar-horizon" aria-hidden="true" />
    <main className="stellar-boot-content"><span className="stellar-boot-kicker"><LocalizedMessage source={"UNE NOUVELLE AVENTURE T’ATTEND"} values={[]} /></span><h1><ThemeWordmark theme="theme-stellar">CHECKPOINT</ThemeWordmark></h1><p><LocalizedMessage source={"Explore ton univers gaming."} values={[]} /></p>
      <LocalizedElement __as={"div"} className="stellar-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: progress + "%" }} /></LocalizedElement>
      <small><LocalizedMessage source={"Préparation du voyage "} values={[]} /><strong><LocalizedValue value={progress} />%</strong></small>
    </main>
  </div>;
}
export function StellarTransition({ effects }) {useLanguage();
  return <div className={"stellar-tab-transition effects-" + effects} aria-hidden="true"><div className="stellar-jump-core" /><StarField count={effects === "calm" ? 32 : effects === "boost" ? 160 : 100} /></div>;
}
