import { CheckpointMark } from "./CheckpointEffects";
import { CHECKPOINT_PREMIUM_LEVEL, CHECKPOINT_PREMIUM_THEME, CHECKPOINT_ULTIMATE_LEVEL, CHECKPOINT_ULTIMATE_THEME, canUseTheme } from "../services/themeRewards";

export default function CheckpointPremiumChoice({ theme, level = 1, unlockedThemes = [], onSelect, rewardTheme = CHECKPOINT_PREMIUM_THEME }) {
  const ultimate = rewardTheme === CHECKPOINT_ULTIMATE_THEME;
  const name = ultimate ? "Checkpoint Ultime" : "Checkpoint Premium";
  const required = ultimate ? CHECKPOINT_ULTIMATE_LEVEL : CHECKPOINT_PREMIUM_LEVEL;
  const unlocked = canUseTheme(rewardTheme, unlockedThemes);
  const currentLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  const selected = theme === rewardTheme;
  return <button type="button" className={`option-pill checkpoint-premium-choice${ultimate ? " checkpoint-ultimate-choice" : ""}${selected ? " active" : ""}${unlocked ? " is-unlocked" : " is-locked"}`}
    disabled={!unlocked} onClick={() => { if (unlocked) onSelect(rewardTheme); }}
    aria-label={`${name} — ${unlocked ? "débloqué" : `disponible au niveau ${required}, niveau actuel ${currentLevel}`}`}
    aria-pressed={selected}>
    <CheckpointMark variant={ultimate ? "diamond" : "platinum"}/>
    <span className="checkpoint-premium-choice-copy"><strong>{name}</strong></span>
    <span className="checkpoint-premium-choice-status">{unlocked ? selected ? <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="m4 10 4 4 8-8"/></svg> : null : <><svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="9" width="12" height="9" rx="2"/><path d="M6 9V6a4 4 0 0 1 8 0v3"/></svg>Niv. {required}</>}</span>
  </button>;
}
