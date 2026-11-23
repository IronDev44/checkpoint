import { useLanguage } from "../i18n/language";import { LocalizedValue, LocalizedMessage, LocalizedElement } from "../i18n/Localized";import ThemeWordmark from './ThemeWordmark';
import "./CrystalEffects.css";
import IntroVignette from "./IntroVignettes";

function Crystal() {useLanguage();
  return <svg className="ff-crystal" viewBox="0 0 160 240" fill="none" aria-hidden="true">
    <path d="M80 8L137 68L116 182L80 230L44 182L23 68Z" fill="#123d75" stroke="#a9e9ff" strokeWidth="2" />
    <path d="M80 8L58 68L80 230L102 68Z" fill="#b5f0ff" fillOpacity=".65" />
    <path d="M23 68H58L44 182Z" fill="#3b9ce1" /><path d="M137 68H102L116 182Z" fill="#6ccaff" />
    <path d="M80 8L23 68H58Z" fill="#78d7ff" /><path d="M80 8L137 68H102Z" fill="#d6f7ff" />
    <path d="M58 68H102L80 230Z" fill="#76bcfa" fillOpacity=".55" />
    <path d="M23 68H137M80 8L58 68L80 230L102 68L80 8M44 182L80 230L116 182" stroke="#d4f8ff" strokeOpacity=".75" strokeWidth="1.5" />
    <path d="M71 46L67 67L78 126" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
  </svg>;
}
function CrystalDust({ count }) {useLanguage();
  return <div className="ff-crystal-dust" aria-hidden="true">{Array.from({ length: count }, (_, i) => <i key={i} style={{ "--dust-x": i * 61.803 % 100 + "%", "--dust-y": i * 37.719 % 100 + "%", "--dust-delay": i % 6 * 10 + "ms", "--dust-angle": i * 360 / count + "deg" }} />)}</div>;
}
export function CrystalIntro({ progress }) {useLanguage();
  return <div className="ff-crystal-boot"><div className="ff-crystal-nebula" aria-hidden="true" /><CrystalDust count={38} />
    <main className="ff-crystal-boot-content"><IntroVignette kind="crystal" />
      <span className="ff-crystal-kicker"><LocalizedMessage source={"LE CRISTAL S’ÉVEILLE"} values={[]} /></span><h1><ThemeWordmark theme="theme-crystal">Checkpoint</ThemeWordmark></h1><p><LocalizedMessage source={"Chaque aventure écrit sa légende."} values={[]} /></p>
      <LocalizedElement __as={"div"} className="ff-crystal-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: progress + "%" }} /></LocalizedElement>
      <small><LocalizedMessage source={"Éveil des souvenirs "} values={[]} /><strong><LocalizedValue value={progress} />%</strong></small>
    </main>
  </div>;
}
export function CrystalTransition({ effects }) {useLanguage();
  return <div className={"ff-crystal-transition effects-" + effects} aria-hidden="true"><div className="ff-crystal-invocation-glow" />
    <div className="ff-crystal-summon-circle"><i /><i /><i /></div>
    <div className="ff-crystal-summoned"><Crystal /></div>
    <div className="ff-crystal-shards">{Array.from({ length: effects === "calm" ? 6 : effects === "boost" ? 36 : 20 }, (_, i) => <i key={i} style={{ "--shard-angle": i * 137.5 + "deg", "--shard-distance": 90 + i % 6 * 35 + "px", "--shard-delay": i % 5 * 10 + "ms" }} />)}</div>
    <CrystalDust count={effects === "calm" ? 8 : effects === "boost" ? 80 : 45} />
  </div>;
}
