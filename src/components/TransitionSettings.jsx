import "./TransitionSettings.css";

const choices = [
  { id: "full", label: "Complète", detail: "Tous les effets du thème." },
  { id: "light", label: "Réduite", detail: "Moins de particules et d’effets pour plus de fluidité." },
  { id: "off", label: "Désactivée", detail: "Changement d’onglet immédiat." },
];

export default function TransitionSettings({ mode, onChange }) {
  return <div className="transition-mode-choices" role="group" aria-label="Transition d’onglet">
    {choices.map(choice => <button key={choice.id} type="button"
      className={`option-pill transition-mode-choice ${mode === choice.id ? "active" : ""}`}
      aria-pressed={mode === choice.id} onClick={() => onChange(choice.id)}>
      <strong>{choice.label}</strong><span>{choice.detail}</span>
    </button>)}
  </div>;
}
