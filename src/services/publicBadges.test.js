import { restorePublicBadge, toPublicBadge } from "./publicBadges";

const catalog = [
  { id: "brand_playstation_400", icon: "PS", name: "Légende PlayStation", rarity: "mythic", platformFamily: "playstation" },
  { id: "platform_ps4_50", icon: "PS4", name: "Vétéran PS4", rarity: "epic", platformFamily: "playstation", platformKey: "ps4" },
];

test("old public badges recover the family and platform needed for the original artwork", () => {
  expect(restorePublicBadge({ id: "brand_playstation_400", icon: "PS", platformFamily: "" }, catalog)).toMatchObject({ platformFamily: "playstation", rarity: "mythic" });
  expect(restorePublicBadge({ id: "platform_ps4_50", icon: "PS4" }, catalog)).toMatchObject({ platformFamily: "playstation", platformKey: "ps4", rarity: "epic" });
});

test("new public snapshots keep the visual metadata without serializing private or executable properties", () => {
  const snapshot = toPublicBadge({ ...catalog[1], special: "trial", unlocked: true, condition: () => true, privateNote: "secret" });
  expect(snapshot).toMatchObject({ platformFamily: "playstation", platformKey: "ps4", special: "trial" });
  expect(snapshot.condition).toBeUndefined();
  expect(snapshot.privateNote).toBeUndefined();
});

test("the creator mark and numeric seals survive old snapshots, while unknown badges remain visible", () => {
  expect(restorePublicBadge({ id: "creator_checkpoint", icon: "C" }).special).toBe("creator");
  expect(restorePublicBadge({ id: "trial-75", icon: "75", rarity: "mythic" }).icon).toBe("75");
  expect(restorePublicBadge({ id: "future", icon: "✦", name: "Future badge" }).name).toBe("Future badge");
  expect(restorePublicBadge(null)).toBeNull();
});
