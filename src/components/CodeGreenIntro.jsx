import { useLanguage } from "../i18n/language";import { LocalizedValue, LocalizedMessage, LocalizedElement } from "../i18n/Localized";import ThemeWordmark from './ThemeWordmark';
import "./CodeGreenIntro.css";

const symbols = "012345789アイウエオカキクケコサシスセソタチツテトナニヌネノ<>:=+";
export default function CodeGreenIntro({ progress }) {useLanguage();
  return <div className="codegreen-boot">
    <div className="codegreen-rain" aria-hidden="true">{Array.from({ length: 48 }, (_, column) => <div className="codegreen-column" key={column} style={{ "--code-duration": 3100 + column % 7 * 380 + "ms", "--code-delay": -column % 13 * 420 + "ms" }}>{
        Array.from({ length: 50 }, (_, row) => <span key={row} className={row === 49 ? "codegreen-head" : ""} style={{ opacity: .15 + row / 60 }}><LocalizedValue value={(row + column * 3) % 19 < 3 ? "\u00a0" : symbols[(column * 17 + row * 13 + row * row) % symbols.length]} /></span>)}
      </div>)}</div>
    <div className="codegreen-scanlines" aria-hidden="true" />
    <main className="codegreen-terminal">
      <div className="codegreen-terminal-status"><span><LocalizedMessage source={"CP / CONNEXION"} values={[]} /></span><span className="codegreen-status-dot"><LocalizedMessage source={"● EN LIGNE"} values={[]} /></span></div>
      <p className="codegreen-command"><LocalizedMessage source={"> ouvrir checkpoint"} values={[]} /><span className="codegreen-cursor">_</span></p>
      <h1><ThemeWordmark theme="theme-matrix">CHECKPOINT</ThemeWordmark></h1><p className="codegreen-subtitle"><LocalizedMessage source={"Ta collection prend vie."} values={[]} /></p>
      <div className="codegreen-log" aria-hidden="true"><span><LocalizedMessage source={"[OK] Connexion établie"} values={[]} /></span><span><LocalizedValue value={progress >= 35 ? "[OK] Bibliothèque synchronisée" : "[..] Lecture de la bibliothèque"} /></span><span><LocalizedValue value={progress >= 80 ? "[OK] Profil prêt" : "[..] Préparation du profil"} /></span></div>
      <LocalizedElement __as={"div"} className="codegreen-progress" role="progressbar" aria-label="Chargement de Checkpoint" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: progress + "%" }} /></LocalizedElement>
      <small><span><LocalizedValue value={progress >= 100 ? "ACCÈS OUVERT" : "INITIALISATION"} /></span><strong><LocalizedValue value={progress} />%</strong></small>
    </main>
  </div>;
}
