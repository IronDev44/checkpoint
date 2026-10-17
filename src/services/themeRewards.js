export const CHECKPOINT_PREMIUM_THEME = "theme-checkpointpremium";
export const CHECKPOINT_PREMIUM_LEVEL = 50;
const REWARD_THEMES = new Set([CHECKPOINT_PREMIUM_THEME]);

export function normalizeThemeUnlocks(value) {
  return [...new Set(Array.isArray(value) ? value.filter(id => REWARD_THEMES.has(id)) : [])];
}

export function mergeThemeUnlocks(local, remote) {
  return normalizeThemeUnlocks([...normalizeThemeUnlocks(local), ...normalizeThemeUnlocks(remote)]);
}

// A cosmetic earned through progression stays earned if the collection changes.
export function earnThemeUnlocks(unlocked, level) {
  const next = normalizeThemeUnlocks(unlocked);
  if (Number.isFinite(level) && level >= CHECKPOINT_PREMIUM_LEVEL && !next.includes(CHECKPOINT_PREMIUM_THEME)) next.push(CHECKPOINT_PREMIUM_THEME);
  return next;
}

export function canUseTheme(theme, unlocked) {
  return theme !== CHECKPOINT_PREMIUM_THEME || normalizeThemeUnlocks(unlocked).includes(theme);
}

export function isCheckpointTheme(theme) {
  return theme === "theme-checkpoint" || theme === CHECKPOINT_PREMIUM_THEME;
}

export function resolveThemeRewards({ theme, unlockedThemes, level, ready }) {
  if (!ready) return { theme, unlockedThemes, justUnlocked: false };
  const earned = earnThemeUnlocks(unlockedThemes, level);
  return {
    theme: canUseTheme(theme, earned) ? theme : "theme-checkpoint",
    unlockedThemes: earned,
    justUnlocked: earned.includes(CHECKPOINT_PREMIUM_THEME) && !normalizeThemeUnlocks(unlockedThemes).includes(CHECKPOINT_PREMIUM_THEME),
  };
}
