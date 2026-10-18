import {useEffect, useId, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowLeft, ArrowRight, BookOpen, Check, X} from 'lucide-react';
import {accountStorage} from '../services/accountData';
import {TAB_TUTORIALS} from '../data/tabTutorials';
import './TabTutorials.css';

const STORAGE_KEY = 'checkpoint-tab-tutorials-v1';
function readProgress() {
  try {
    const saved = JSON.parse(accountStorage.getItem(STORAGE_KEY) || '{}');
    return Object.fromEntries(Object.keys(TAB_TUTORIALS).filter(key => ['completed','dismissed'].includes(saved?.[key])).map(key => [key, saved[key]]));
  } catch { return {}; }
}
function saveProgress(tab, completed) {
  const next = {...readProgress(), [tab]:completed ? 'completed' : 'dismissed'};
  try { accountStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* The guide remains usable without storage. */ }
  window.dispatchEvent(new Event('checkpoint-tutorial-progress'));
}
function useTutorialProgress() {
  const [progress, setProgress] = useState(readProgress);
  useEffect(() => {
    const refresh = () => setProgress(readProgress());
    window.addEventListener('checkpoint-tutorial-progress', refresh);
    return () => window.removeEventListener('checkpoint-tutorial-progress', refresh);
  }, []);
  return progress;
}

export function TutorialDialog({tab, onClose}) {
  const guide = TAB_TUTORIALS[tab];
  const [index, setIndex] = useState(0);
  const root = useRef(null);
  const heading = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus(); };
  }, []);
  useEffect(() => { heading.current?.focus(); root.current?.querySelector('.tab-tutorial-body')?.scrollTo?.(0, 0); }, [index]);
  if (!guide) return null;
  const current = guide.steps[index];
  function keyboard(event) {
    if (event.key === 'Escape') { event.preventDefault(); onClose(false); }
    if (event.key !== 'Tab') return;
    const buttons = [...root.current.querySelectorAll('button:not(:disabled)')];
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === heading.current)) {event.preventDefault(); last.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
  }
  return createPortal(<div className="tab-tutorial-overlay">
    <section className="tab-tutorial-dialog" ref={root} role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={keyboard}>
      <header className="tab-tutorial-head">
        <span><BookOpen size={18} aria-hidden="true"/> Guide · {guide.label}</span>
        <button type="button" className="back-btn" aria-label="Fermer le tutoriel" onClick={() => onClose(false)}><X size={19}/></button>
      </header>
      <div className="tab-tutorial-body">
        <p className="tab-tutorial-counter">Étape {index + 1} sur {guide.steps.length}</p>
        <h2 id={titleId} tabIndex={-1} ref={heading}>{current.title}</h2>
        <p>{current.text}</p>
        <ul>{current.points.map(point => <li key={point}>{point}</li>)}</ul>
        {index === guide.steps.length - 1 && <p className="tab-tutorial-replay">Tu peux revoir ce tutoriel quand tu veux dans Options → Aide et tutoriels.</p>}
      </div>
      <footer className="tab-tutorial-footer">
        <div className="tab-tutorial-dots" aria-hidden="true">{guide.steps.map((_, i) => <span key={i} className={i <= index ? 'active' : ''}/>)}</div>
        <div className="tab-tutorial-actions">
          <button type="button" className="back-btn" disabled={index === 0} onClick={() => setIndex(value => value - 1)}><ArrowLeft size={16}/> Précédent</button>
          <button type="button" className="checkpoint-primary-action" onClick={() => index === guide.steps.length - 1 ? onClose(true) : setIndex(value => value + 1)}>
            {index === guide.steps.length - 1 ? 'J’ai compris' : 'Suivant'}<ArrowRight size={16}/>
          </button>
        </div>
      </footer>
    </section>
  </div>, document.body);
}

export function TabTutorialEntry({tab, enabled = true}) {
  const [open, setOpen] = useState(false);
  const shown = useRef(false);
  useEffect(() => {
    if (!enabled || !TAB_TUTORIALS[tab] || shown.current || readProgress()[tab]) return;
    shown.current = true;
    saveProgress(tab, false);
    setOpen(true);
  }, [tab, enabled]);
  return open ? <TutorialDialog tab={tab} onClose={completed => {if (completed) saveProgress(tab, true); setOpen(false);}}/> : null;
}

export function TutorialLibrary() {
  const [tab, setTab] = useState(null);
  const progress = useTutorialProgress();
  return <div className="tab-tutorial-library">
    <p>Choisis un onglet pour revoir ses fonctions, à ton rythme. Les guides sont toujours disponibles, même après les avoir terminés.</p>
    <div className="tab-tutorial-grid">
      {Object.entries(TAB_TUTORIALS).map(([key, guide]) => <button type="button" className="tab-tutorial-choice" key={key} onClick={() => setTab(key)}>
        <span className="tab-tutorial-choice-head"><strong>{guide.label}</strong>{progress[key] === 'completed' ? <Check size={17} aria-label="Guide terminé"/> : <BookOpen size={17} aria-hidden="true"/>}</span>
        <span>{guide.summary}</span>
        <small>{guide.steps.length} étapes · {progress[key] === 'completed' ? 'Revoir le guide' : 'Ouvrir le guide'}</small>
      </button>)}
    </div>
    {tab && <TutorialDialog key={tab} tab={tab} onClose={completed => {saveProgress(tab, completed || progress[tab] === 'completed'); setTab(null);}}/>}
  </div>;
}
