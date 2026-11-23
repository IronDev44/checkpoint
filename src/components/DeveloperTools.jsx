import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedValue, LocalizedElement } from "../i18n/Localized";import { useId, useState } from "react";
import { ownerUid } from "../services/accountConfig";
import "./DeveloperTools.css";
import UsageDashboard from './UsageDashboard';
import SocialHealthDashboard from './SocialHealthDashboard';

const sections = [{ id: "usage", label: "Utilisation" }, { id: "social-health", label: "Fiabilité du social" }, { id: "tests", label: "Tests" }, { id: "events", label: "Lives et actus" }, { id: "feedback", label: "Retours" }, { id: "reports", label: "Signalements" }, { id: "predictions", label: "Pronostics" }];
export default function DeveloperTools({ accountUid, tests, events, feedback, predictions, reports }) {useLanguage();
  const [section, setSection] = useState("tests");
  const [visited, setVisited] = useState(["tests"]);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const id = useId();
  if (!ownerUid || accountUid !== ownerUid) return null;
  function unlock(event) {
    event.preventDefault();
    if (password !== "1102") {setError("Code incorrect.");return;}
    setUnlocked(true);setPassword("");setError("");
  }
  function lock() {setUnlocked(false);setSection("tests");setVisited(["tests"]);setPassword("");setError("");}
  if (!unlocked) return <form className="developer-access-form" onSubmit={unlock}>
    <label htmlFor={`${id}-code`}><LocalizedMessage source={"Code de l’espace développeur"} values={[]} /></label>
    <input id={`${id}-code`} type="password" inputMode="numeric" autoComplete="off" required value={password} aria-describedby={error ? `${id}-error` : undefined} onChange={(event) => {setPassword(event.target.value);setError("");}} />{
    error && <p id={`${id}-error`} role="alert"><LocalizedValue value={error} /></p>}
    <button type="submit" className="checkpoint-primary-action"><LocalizedMessage source={"Déverrouiller"} values={[]} /></button>
  </form>;
  const panels = { usage: <UsageDashboard />, 'social-health': <SocialHealthDashboard />, tests, events, feedback, predictions, reports };
  return <div className="developer-tools">
    <div className="developer-tools-head"><span><LocalizedMessage source={"Espace développeur"} values={[]} /></span><button type="button" className="option-pill" onClick={lock}><LocalizedMessage source={"Verrouiller"} values={[]} /></button></div>
    <LocalizedElement __as={"div"} className="developer-tools-nav" role="group" aria-label="Rubriques développeur">{
      sections.map((item) => <button type="button" key={item.id} className={`option-pill${section === item.id ? ' active' : ''}`} aria-pressed={section === item.id} aria-controls={`${id}-${item.id}`} onClick={() => {setSection(item.id);setVisited((current) => current.includes(item.id) ? current : [...current, item.id]);}}><LocalizedValue value={item.label} /></button>)}
    </LocalizedElement>{
    sections.map((item) => <LocalizedElement __as={"section"} key={item.id} id={`${id}-${item.id}`} className="developer-tool-panel" aria-label={item.label} hidden={section !== item.id}><LocalizedValue value={visited.includes(item.id) && panels[item.id]} /></LocalizedElement>)}
  </div>;
}
