import { useEffect, useRef, useState } from "react";
import "./AccountWelcome.css";

const steps = [
  ["Bienvenue chez toi", "Ta collection, tes envies et tes souvenirs de jeu réunis au même endroit.", "🎮"],
  ["Ajoute tes premiers jeux", "Depuis Recherche, retrouve un jeu et ajoute-le à ta collection ou à ta wishlist.", "🔎"],
  ["Ton expérience compte", "Terminé, joué ou simplement essayé : choisis ce qui te correspond. Les critères de notation s’adaptent.", "⭐"],
  ["Un profil qui te ressemble", "Ajoute ton matériel et personnalise ton profil. Tes jeux et tes expériences font progresser ton niveau. Tu peux envoyer tes idées et signaler un souci dans Options.", "✨"],
];
export default function WelcomeTour({ onClose }) {
  const [step, setStep] = useState(0);
  const dialog = useRef(null);
  useEffect(() => { const previous=document.activeElement; dialog.current?.querySelector('button')?.focus(); return () => previous?.focus(); }, []);
  function keyboard(event) {
    if(event.key === 'Escape') onClose();
    if(event.key !== 'Tab') return;
    const buttons=[...dialog.current.querySelectorAll('button')];const first=buttons[0], last=buttons[buttons.length-1];
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
  }
  return <div className="account-welcome-overlay"><section ref={dialog} onKeyDown={keyboard} className="account-welcome" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
    <button className="welcome-skip" onClick={onClose}>Passer</button>
    <div className="welcome-symbol" aria-hidden="true">{steps[step][2]}</div>
    <p className="welcome-counter">Découverte · {step + 1} / {steps.length}</p>
    <h1 id="welcome-title">{steps[step][0]}</h1><p>{steps[step][1]}</p>
    <div className="welcome-dots" aria-hidden="true">{steps.map((_, i) => <span key={i} className={i === step ? "active" : ""} />)}</div>
    <div className="welcome-actions">{step > 0 && <button onClick={() => setStep(step - 1)}>Retour</button>}<button className="checkpoint-primary-action" onClick={() => step === steps.length - 1 ? onClose() : setStep(step + 1)}>{step === steps.length - 1 ? "C’est parti" : "Continuer"}</button></div>
  </section></div>;
}
