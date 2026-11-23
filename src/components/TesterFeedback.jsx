import { useLanguage } from "../i18n/language";import { LocalizedMessage, LocalizedValue } from "../i18n/Localized";import { accountStorage as localStorage } from "../services/accountData";
import { useState } from "react";
import "./TesterFeedback.css";

const draftKey = "checkpoint-feedback-draft";
const empty = { category: "bug", screen: "Accueil", message: "", expected: "", name: "" };
const screens = ["Accueil", "Actu", "Recherche", "Sorties", "Promos", "Live", "Bibliothèque", "Séries", "Matériel", "Sanctuaire", "Top 5", "Profil", "Options", "Autre"];
export default function TesterFeedback({ onSubmit }) {useLanguage();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => {try {return { ...empty, ...JSON.parse(localStorage.getItem(draftKey) || "null") };} catch {return empty;}});
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  function change(field, value) {const next = { ...draft, [field]: value };setDraft(next);setStatus("");try {localStorage.setItem(draftKey, JSON.stringify(next));} catch {}}
  async function submit(event) {
    event.preventDefault();if (sending) return;
    if (draft.message.trim().length < 10) {setStatus("Ajoute quelques détails pour qu’on puisse comprendre ton retour.");return;}
    setSending(true);setStatus("");
    try {
      await onSubmit({ ...draft, message: draft.message.trim(), expected: draft.expected.trim(), name: draft.name.trim(), context: { theme: document.body.dataset.theme || "", viewport: window.innerWidth + " × " + window.innerHeight, platform: navigator.userAgent.slice(0, 300) } });
      setDraft({ ...empty });try {localStorage.removeItem(draftKey);} catch {}setStatus("Merci ! Ton retour a bien été envoyé.");
    } catch (error) {setStatus((error.message || "L’envoi n’a pas abouti.") + " Ton brouillon est conservé.");} finally
    {setSending(false);}
  }
  return <section className="tester-feedback search-panel"><div className="tester-feedback-head"><div><h2><LocalizedMessage source={"Améliorons Checkpoint"} values={[]} /></h2><p><LocalizedMessage source={"Un souci ou une idée ? Raconte-nous."} values={[]} /></p></div><button type="button" className="checkpoint-primary-action" aria-expanded={open} onClick={() => setOpen(!open)}><LocalizedValue value={open ? "Fermer" : "Faire un retour"} /></button></div>{
    open && <form onSubmit={submit}><fieldset disabled={sending}><legend><LocalizedMessage source={"Ton retour"} values={[]} /></legend><div className="tester-feedback-types">{[["bug", "Un bug"], ["idea", "Une idée"], ["visual", "Le rendu"]].map(([value, label]) => <button type="button" key={value} aria-pressed={draft.category === value} onClick={() => change("category", value)}><LocalizedValue value={label} /></button>)}</div>
      <label><LocalizedMessage source={"Où ça se passe ?"} values={[]} /><select value={draft.screen} onChange={(e) => change("screen", e.target.value)}>{screens.map((screen) => <option key={screen}><LocalizedValue value={screen} /></option>)}</select></label>
      <label><LocalizedValue value={draft.category === "idea" ? "Ton idée" : "Qu’est-ce qui ne va pas ?"} /><textarea required minLength={10} maxLength={3000} rows={4} value={draft.message} onChange={(e) => change("message", e.target.value)} placeholder={draft.category === "idea" ? "Ce qui rendrait l’appli plus agréable…" : "Ce que tu faisais et ce qui s’est passé…"} /></label>{
        draft.category !== "idea" && <label><LocalizedMessage source={"Ce que tu attendais "} values={[]} /><span><LocalizedMessage source={"(facultatif)"} values={[]} /></span><textarea maxLength={1500} rows={2} value={draft.expected} onChange={(e) => change("expected", e.target.value)} /></label>}
        <label><LocalizedMessage source={"Ton prénom ou pseudo "} values={[]} /><span><LocalizedMessage source={"(facultatif)"} values={[]} /></span><input maxLength={60} value={draft.name} onChange={(e) => change("name", e.target.value)} /></label>
      <p className="tester-feedback-context"><LocalizedMessage source={"Le thème, la taille de l’écran et le navigateur accompagnent ton retour pour aider à reproduire le souci."} values={[]} /></p>
      <p className="tester-feedback-context"><LocalizedMessage source={"Ton message est transmis à l’éditeur pour traiter ton retour. Évite les informations sensibles. "} values={[]} /><a href="/legal/confidentialite.html" target="_blank" rel="noreferrer"><LocalizedMessage source={"Données personnelles et droits"} values={[]} /></a>.</p>
      <button type="submit" className="checkpoint-primary-action"><LocalizedValue value={sending ? "Envoi en cours…" : "Envoyer mon retour"} /></button>
    </fieldset><p role="status" className="tester-feedback-status"><LocalizedValue value={status} /></p></form>}
  </section>;
}
