import { useLanguage } from "../i18n/language";import { LocalizedValue, LocalizedMessage, LocalizedElement } from "../i18n/Localized";import IntroVignette from "./IntroVignettes";
import "./TokyoEffects.css";

function Street() {useLanguage();
  return <div className="tokyo-street" aria-hidden="true"><div className="tokyo-buildings">{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ "--building-height": 110 + i * 47 % 160 + "px" }} />)}</div><div className="tokyo-sign sign-cyan">ゲーム</div><div className="tokyo-sign sign-pink">夜の街</div><div className="tokyo-sign sign-small"><LocalizedMessage source={"CP"} values={[]} /></div><div className="tokyo-street-reflection" /></div>;
}
function Rain({ count }) {useLanguage();
  return <div className="tokyo-rain" aria-hidden="true">{Array.from({ length: count }, (_, i) => <i key={i} style={{ "--rain-x": i * 61.803 % 100 + "%", "--rain-delay": -i % 7 * 140 + "ms", "--rain-duration": 600 + i % 4 * 130 + "ms" }} />)}</div>;
}
export function TokyoIntro({ progress }) {useLanguage();
  return <div className="tokyo-boot"><main className="tokyo-boot-content"><IntroVignette kind="tokyo" /><span className="tokyo-kicker"><LocalizedMessage source={"夜の街 · TOKYO AFTER DARK"} values={[]} /></span><h1>Checkpoint</h1><p><LocalizedMessage source={"La ville s’allume. Tes aventures aussi."} values={[]} /></p><LocalizedElement __as={"div"} className="tokyo-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: progress + "%" }} /></LocalizedElement><small><LocalizedMessage source={"Connexion à la ville "} values={[]} /><strong><LocalizedValue value={progress} />%</strong></small></main></div>;
}
export function TokyoTransition({ direction, effects }) {useLanguage();
  return <div className={`tokyo-tab-transition direction-${direction} effects-${effects}`} aria-hidden="true"><div className="tokyo-transition-city"><Street /><Rain count={effects === "calm" ? 0 : effects === "boost" ? 60 : 30} /></div><div className="tokyo-neon-panels">{[0, 1, 2, 3].map((i) => <i key={i} style={{ "--panel-index": i, "--panel-delay": i * 18 + "ms" }} />)}</div><div className="tokyo-transition-sign">夜の街<span>CHECKPOINT</span></div></div>;
}
