import { POP_CULTURE_THEMES } from "../data/popCultureThemes";
import { GAME_UNIVERSE_THEMES } from "../data/gameUniverseThemes";
const KEY = "checkpoint-startup-appearance";
const themeIds = new Set(["checkpointultimate", "checkpointpremium", "checkpoint", "indigo", "emerald", "crimson", "graphite", "retro", "cyberpunk", "playstation", "xbox", "steamdeck", "arcane", "stellar", "multiverse", "relic", "tamer", "mushroom", "blueblur", "blocks", "cubic", "hunter", "kart", "crystal", "ring", "matrix", "wasteland", "treasure", "vigilante", "slayer"].map(id => `theme-${id}`));
[...POP_CULTURE_THEMES, ...GAME_UNIVERSE_THEMES].forEach(theme => themeIds.add(theme.id));
const validTheme = theme => themeIds.has(theme) ? theme : "theme-checkpoint";

// Only visual preferences are available before authentication. Never read the
// account-prefixed collection or profile keys to decide what to show at boot.
export function readStartupAppearance(storage) {
  try {
    storage = storage || window.localStorage;
    const saved = JSON.parse(storage.getItem(KEY) || "null");
    return {
      theme: validTheme(saved?.theme || storage.getItem("checkpoint-theme")),
      effects: ["calm", "boost"].includes(saved?.effects) ? saved.effects : "balanced",
      light: saved?.light === true,
    };
  } catch { return { theme: "theme-checkpoint", effects: "balanced", light: false }; }
}

export function saveStartupAppearance({ theme, effects, light }, storage) {
  try { (storage || window.localStorage).setItem(KEY, JSON.stringify({ theme: validTheme(theme), effects: ["calm", "boost"].includes(effects) ? effects : "balanced", light: light === true })); } catch {}
}
