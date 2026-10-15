// Keep the existing `platform` string so older profiles, backups and public links
// continue to work without a data migration.
export const FAVORITE_PLATFORM_GROUPS = [
  { label: "PC et consoles portables PC", platforms: ["PC", "Steam Deck", "ASUS ROG Ally", "Lenovo Legion Go"] },
  { label: "PlayStation", platforms: ["PlayStation", "PlayStation 5", "PlayStation 4", "PlayStation 3", "PlayStation 2", "PlayStation (PS1)", "PSP", "PlayStation Vita"] },
  { label: "Xbox", platforms: ["Xbox", "Xbox Series X/S", "Xbox One", "Xbox 360", "Xbox originale"] },
  { label: "Nintendo", platforms: ["Nintendo", "Nintendo Switch 2", "Nintendo Switch", "Wii U", "Wii", "GameCube", "Nintendo 64", "Super Nintendo", "NES", "Nintendo 3DS", "Nintendo DS", "Game Boy Advance", "Game Boy Color", "Game Boy"] },
  { label: "Sega", platforms: ["Dreamcast", "Sega Saturn", "Mega Drive", "Master System", "Game Gear"] },
  { label: "Autres", platforms: ["Android", "iPhone / iPad", "Arcade"] },
];

const keyOf = value => value.trim().toLocaleLowerCase("fr").replace(/\s+/g, " ");
const platformNames = new Map(FAVORITE_PLATFORM_GROUPS.flatMap(group => group.platforms).map(name => [keyOf(name), name]));
const aliases = new Map(Object.entries({
  ps5: "PlayStation 5", ps4: "PlayStation 4", ps3: "PlayStation 3", ps2: "PlayStation 2", ps1: "PlayStation (PS1)", "ps one": "PlayStation (PS1)",
  "ps vita": "PlayStation Vita", switch: "Nintendo Switch", "switch 2": "Nintendo Switch 2",
  "xbox series": "Xbox Series X/S", "xbox series s/x": "Xbox Series X/S", "xbox series x|s": "Xbox Series X/S",
}));

export function parseFavoritePlatforms(value) {
  const parts = typeof value === "string" ? value.split(/[,;·\n]/) : [];
  const seen = new Set();
  return parts.reduce((selected, part) => {
    const key = keyOf(part);
    if (!key || key === "multi-plateforme" || key === "multi-plateformes") return selected;
    const name = aliases.get(key) || platformNames.get(key) || part.trim();
    const normalized = keyOf(name);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      selected.push(name);
    }
    return selected;
  }, []);
}

export function serializeFavoritePlatforms(platforms) {
  return parseFavoritePlatforms(platforms.join(", ")).join(", ");
}
