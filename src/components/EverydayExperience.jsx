import { useLanguage } from "../i18n/language";import { LocalizedValue, LocalizedMessage } from "../i18n/Localized";import { useEffect, useId, useState } from 'react';
import { ArrowRight, ChevronDown, Check } from 'lucide-react';
import './EverydayExperience.css';

export function ProfileSection({ title, summary, children, defaultOpen = false }) {useLanguage();
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();
  useEffect(() => {if (defaultOpen) setOpen(true);}, [defaultOpen]);
  return <section className="search-panel profile-disclosure">
    <button type="button" className="profile-disclosure-toggle" aria-expanded={open} aria-controls={contentId} onClick={() => setOpen((value) => !value)}>
      <span><strong><LocalizedValue value={title} /></strong><small><LocalizedValue value={summary} /></small></span><ChevronDown size={20} aria-hidden="true" />
    </button>{
    open && <div id={contentId} className="profile-disclosure-body">{children}</div>}
  </section>;
}

export function FirstSteps({ games = [], onSearch, onOpenGame, onHardware }) {useLanguage();
  const owned = games.filter((game) => game.status !== 'wishlist');
  const platformGame = owned.find((game) => !(game.playedPlatforms || []).length);
  const unrated = owned.find((game) => !Number(game.rating) && !game.review);
  if (owned.length >= 3 && !platformGame && !unrated) return null;
  const steps = [
  { title: 'Ajoute ton premier jeu', text: 'Un jeu que tu possèdes ou qui a marqué ton parcours.', done: owned.length > 0, action: onSearch, label: 'Ajouter mon premier jeu' },
  { title: 'Choisis ta plateforme', text: 'Ouvre sa fiche et indique sur quoi tu y as joué.', done: owned.some((game) => (game.playedPlatforms || []).length), action: () => onOpenGame?.(platformGame || owned[0]), label: 'Choisir ma plateforme' },
  { title: 'Raconte ta partie', text: 'Terminé, joué ou essayé : quelques impressions suffisent.', done: owned.some((game) => Number(game.rating) > 0 || game.review), action: () => onOpenGame?.(unrated || owned[0]), label: 'Donner mon premier avis' }];

  const next = steps.find((step) => !step.done);
  if (!next) return null;
  return <section className="search-panel first-steps" aria-labelledby="first-steps-title">
    <span className="home-kicker"><LocalizedMessage source={"Pour commencer"} values={[]} /></span><h2 id="first-steps-title"><LocalizedMessage source={"Ton espace prend forme"} values={[]} /></h2>
    <p><LocalizedMessage source={"Quelques informations suffisent pour commencer. Tu pourras tout compléter plus tard."} values={[]} /></p>
    <button type="button" className="checkpoint-primary-action" onClick={next.action}><LocalizedValue value={next.label} /><ArrowRight size={17} /></button>
    <ol>{steps.map((step) => <li key={step.title} className={step.done ? 'done' : ''}>{step.done && <Check size={16} aria-hidden="true" />}<span><strong><LocalizedValue value={step.title} /></strong><small><LocalizedValue value={step.text} /></small></span></li>)}</ol>{
    onHardware && <button type="button" className="experience-secondary" onClick={onHardware}><LocalizedMessage source={"Ajouter aussi mon matériel"} values={[]} /></button>}
  </section>;
}
