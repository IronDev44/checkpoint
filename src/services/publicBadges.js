export function restorePublicBadge(badge, catalog = []) {
  if (!badge) return null;
  const original = catalog.find(item => item.id === badge.id);
  const family = String(badge.id || "").match(/^brand_(playstation|xbox|nintendo|pc)_/)?.[1];
  return {
    ...badge,
    icon: original?.icon || badge.icon || "",
    name: badge.name || original?.name || "Badge",
    rarity: original?.rarity || badge.rarity || "common",
    platformFamily: original?.platformFamily || badge.platformFamily || family || "",
    platformKey: original?.platformKey || badge.platformKey || "",
    special: original?.special || badge.special || (badge.id === "creator_checkpoint" ? "creator" : ""),
  };
}

export function toPublicBadge(badge) {
  if (!badge) return null;
  return {
    id: badge.id, icon: badge.icon || "", name: badge.name || "", rarity: badge.rarity || "common",
    platformFamily: badge.platformFamily || "", platformKey: badge.platformKey || "", special: badge.special || "",
  };
}
