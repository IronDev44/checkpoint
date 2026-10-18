const list = value => Array.isArray(value) ? value : [];
const label = value => typeof value === "string" ? value : value?.name || value?.type || "";
const normalize = value => label(value).trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
const fanLabels = new Set(["fan game", "fan games", "fangame", "fangames", "fan made", "fanmade", "fan made game"]);

// Only explicit catalogue tags count. Names, summaries and franchise resemblance
// are deliberately ignored; conflicting publication data keeps a title visible.
export function getDiscoveryMetadata(game = {}, ...additionalGames) {
  const sources = [game, ...additionalGames].filter(Boolean)
    .flatMap(item => [item, item.normalized, item.discoveryMetadata].filter(Boolean));
  return {
    keywords: [...new Set(sources.flatMap(source => [...list(source.keywords), ...list(source.tags)]).map(label).filter(Boolean))],
    publishers: [...new Set(sources.flatMap(source => [
      ...list(source.publishers).map(label),
      ...list(source.involved_companies).filter(item => item?.publisher === true)
        .map(item => item.company?.name || (item.company?.id ? String(item.company.id) : "")),
    ]).filter(value => typeof value === "string" && value.trim()))],
    gameType: sources.map(source => label(source.game_type || source.gameType)).find(Boolean) || "",
    category: game.igdbCategory ?? game.category ?? game.normalized?.category ?? game.discoveryMetadata?.category ?? null,
  };
}

export function classifyFanGame(game) {
  const metadata = getDiscoveryMetadata(game);
  const type = normalize(metadata.gameType);
  if (type === "mod" || metadata.category === 5) return "mod";
  if (metadata.publishers.length) return "uncertain";
  return fanLabels.has(type) || metadata.keywords.some(value => fanLabels.has(normalize(value))) ? "fan" : "uncertain";
}

export const isFanGame = game => classifyFanGame(game) === "fan";

export function isMainGameResult(game = {}) {
  const type = normalize(getDiscoveryMetadata(game).gameType);
  if (["main game", "remake", "remaster", "port", "standalone expansion"].includes(type)) return true;
  const name = (game.name || "").toLowerCase();
  if (/\b(complete edition|definitive edition|ultimate edition|deluxe edition|gold edition|game of the year|goty|remastered|remake|director's cut|anniversary edition|collection|trilogy)\b/.test(name)) return true;
  // Word boundaries prevent false matches such as "ost" inside "Ghost".
  return !/\b(dlc|season pass|battle pass|expansion|add-on|addon|skin|costume|soundtrack|ost|demo|beta)\b/.test(name);
}
