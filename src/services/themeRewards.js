import {ALL_THEME_CATALOG} from "../data/themeCatalog";
import { ownerUid } from "./accountConfig";

export const CHECKPOINT_PREMIUM_THEME = "theme-checkpointpremium";
export const CHECKPOINT_PREMIUM_LEVEL = 50;
export const CHECKPOINT_ULTIMATE_THEME = "theme-checkpointultimate";
export const CHECKPOINT_ULTIMATE_LEVEL = 100;
// Stable catalogue order: one reward every two levels, with signature milestones reserved.
const regular=ALL_THEME_CATALOG.filter(theme=>!['theme-checkpoint',CHECKPOINT_PREMIUM_THEME,CHECKPOINT_ULTIMATE_THEME].includes(theme.id));
const regularLevels=Array.from({length:50},(_,i)=>(i+1)*2).filter(level=>![CHECKPOINT_PREMIUM_LEVEL,CHECKPOINT_ULTIMATE_LEVEL].includes(level));
export const THEME_REWARD_LEVELS=Object.freeze({...Object.fromEntries(regular.map((theme,i)=>[theme.id,regularLevels[i]])),[CHECKPOINT_PREMIUM_THEME]:CHECKPOINT_PREMIUM_LEVEL,[CHECKPOINT_ULTIMATE_THEME]:CHECKPOINT_ULTIMATE_LEVEL});
const REWARD_LEVELS=THEME_REWARD_LEVELS;
export const getThemeUnlockLevel=theme=>REWARD_LEVELS[theme]||0;
export const getThemeLabel=theme=>ALL_THEME_CATALOG.find(item=>item.id===theme)?.label||theme;

const REWARD_THEMES = new Set(Object.keys(REWARD_LEVELS));

export function normalizeThemeUnlocks(value) {
  return [...new Set(Array.isArray(value) ? value.filter(id => REWARD_THEMES.has(id)) : [])];
}

export function mergeThemeUnlocks(local, remote) {
  return normalizeThemeUnlocks([...normalizeThemeUnlocks(local), ...normalizeThemeUnlocks(remote)]);
}

// A cosmetic earned through progression stays earned if the collection changes.
export function earnThemeUnlocks(unlocked, level) {
  const next = normalizeThemeUnlocks(unlocked);
  if (Number.isFinite(level)) Object.entries(REWARD_LEVELS).forEach(([theme,required]) => {
    if (level >= required && !next.includes(theme)) next.push(theme);
  });
  return next;
}

export function canUseTheme(theme, unlocked) {
  return !REWARD_THEMES.has(theme) || normalizeThemeUnlocks(unlocked).includes(theme);
}

export function isCheckpointTheme(theme) {
  return ["theme-checkpoint",CHECKPOINT_PREMIUM_THEME,CHECKPOINT_ULTIMATE_THEME].includes(theme);
}

export function resolveThemeRewards({ theme, unlockedThemes, level, ready, accountUid }) {
  if (!ready) return { theme, unlockedThemes, justUnlocked: false };
  const earned = earnThemeUnlocks(unlockedThemes, level);
  // The app's authenticated owner can preview the entire theme catalogue.
  // Never infer ownership from a public profile, handle or editable flag.
  if (ownerUid && accountUid === ownerUid) {
    REWARD_THEMES.forEach(id => { if (!earned.includes(id)) earned.push(id); });
  }
  return {
    theme: canUseTheme(theme, earned) ? theme : "theme-checkpoint",
    unlockedThemes: earned,
    justUnlocked: earned.some(id => !normalizeThemeUnlocks(unlockedThemes).includes(id)),
    newlyUnlocked: earned.filter(id => !normalizeThemeUnlocks(unlockedThemes).includes(id)),
  };
}
