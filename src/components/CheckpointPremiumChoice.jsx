import { CheckpointMark } from "./CheckpointEffects";
import { CHECKPOINT_PREMIUM_LEVEL, CHECKPOINT_PREMIUM_THEME, canUseTheme } from "../services/themeRewards";

export default function CheckpointPremiumChoice({ theme, level = 1, unlockedThemes = [], onSelect }) {
  const unlocked = canUseTheme(CHECKPOINT_PREMIUM_THEME, unlockedThemes);
  const currentLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  return <button type="button" className={`option-pill checkpoint-premium-choice${theme === CHECKPOINT_PREMIUM_THEME ? " active" : ""}${unlocked ? " is-unlocked" : " is-locked"}`}
    disabled={!unlocked} onClick={() => { if (unlocked) onSelect(CHECKPOINT_PREMIUM_THEME); }}
    aria-label={`Checkpoint Premium — ${unlocked ? "débloqué" : `disponible au niveau ${CHECKPOINT_PREMIUM_LEVEL}, niveau actuel ${currentLevel}`}`}
    aria-pressed={theme === CHECKPOINT_PREMIUM_THEME}>
    <CheckpointMark variant="platinum"/>
    <span className="checkpoint-premium-choice-copy"><strong>Checkpoint Premium</strong><small>Noir · Platine · Nacre</small></span>
    <span className="checkpoint-premium-choice-status">{unlocked ? "Débloqué" : <><svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="9" width="12" height="9" rx="2"/><path d="M6 9V6a4 4 0 0 1 8 0v3"/></svg>Niveau {CHECKPOINT_PREMIUM_LEVEL}</>}</span>
    {!unlocked && <span className="checkpoint-premium-choice-progress"><span style={{width:`${Math.min(100,currentLevel / CHECKPOINT_PREMIUM_LEVEL * 100)}%`}}/></span>}
  </button>;
}
