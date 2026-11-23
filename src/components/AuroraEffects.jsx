import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedElement, LocalizedValue } from "../i18n/Localized";import "./AuroraEffects.css";

export function AuroraIntro({ progress }) {useLanguage();
  return <div className={"aurora-boot " + (progress >= 100 ? "complete" : "")}>
    <div className="aurora-boot-lights" aria-hidden="true"><i /><i /><i /></div>
    <main className="aurora-boot-content">
      <div className="aurora-seal" aria-hidden="true"><span><LocalizedMessage source={"CP"} values={[]} /></span></div>
      <h1>Checkpoint</h1>
      <p><LocalizedMessage source={"Tes jeux. Ton parcours. Ton univers."} values={[]} /></p>
      <LocalizedElement __as={"div"} className="aurora-boot-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: progress + "%" }} /></LocalizedElement>
      <small><LocalizedMessage source={"Chargement "} values={[]} /><strong><LocalizedValue value={progress} />%</strong></small>
    </main>
  </div>;
}

export function AuroraTransition({ direction, effects }) {useLanguage();
  return <div className={"aurora-tab-transition direction-" + direction + " effects-" + effects} aria-hidden="true">
    <div className="aurora-transition-dim" />
    <div className="aurora-ribbon ribbon-cyan" />
    <div className="aurora-ribbon ribbon-violet" />
    <div className="aurora-ribbon ribbon-pink" />
  </div>;
}
