import { classifyFanGame, getDiscoveryMetadata, isMainGameResult } from "./fanGames";
import { toRawgCompatibleIgdbGame } from "./igdbAdapter";

test.each(["fan game", "Fan-Game", "fanmade", "fan-made game", "fangame"])("recognizes explicit catalogue tag %s", tag => {
  expect(classifyFanGame({ keywords: [{ name: tag }] })).toBe("fan");
});

test.each([
  {}, { name: "Sonic Fan Adventure", summary: "A fan-made adventure" },
  { tags: [{ name: "fan service" }] }, { keywords: ["unofficial"] },
  { keywords: ["fan game"], publishers: [{ name: "Nintendo" }] },
  { keywords: ["fan game"], involved_companies: [{ publisher: true, company: { id: 42 } }] },
])("keeps uncertain or conflicting evidence visible: %j", game => {
  expect(classifyFanGame(game)).toBe("uncertain");
});

test("developer evidence alone does not mean published, and mods stay separate", () => {
  expect(classifyFanGame({ tags: ["fan game"], involved_companies: [{ developer: true, company: { name: "Fans" } }] })).toBe("fan");
  expect(classifyFanGame({ keywords: ["fan game"], game_type: { type: "Mod" } })).toBe("mod");
  expect(classifyFanGame({ keywords: ["fan game"], igdbCategory: 5 })).toBe("mod");
});

test("IGDB tags and publication evidence survive normalization and saved-game metadata", () => {
  const raw = { id: 1, name: "Example", keywords: [{ name: "fan game" }], game_type: { type: "Main Game" } };
  const fan = toRawgCompatibleIgdbGame(raw);
  expect(classifyFanGame(fan)).toBe("fan");
  expect(classifyFanGame({ discoveryMetadata: getDiscoveryMetadata(fan) })).toBe("fan");
  const published = toRawgCompatibleIgdbGame({ ...raw, involved_companies: [{ publisher: true, company: { name: "Publisher" } }] });
  expect(classifyFanGame({ discoveryMetadata: getDiscoveryMetadata(published) })).toBe("uncertain");
  expect(classifyFanGame({ discoveryMetadata: getDiscoveryMetadata(fan, published) })).toBe("uncertain");
  expect(classifyFanGame(toRawgCompatibleIgdbGame({ ...raw, involved_companies: [{ publisher: true, company: { id: 42 } }] }))).toBe("uncertain");
});

test("content exclusions do not remove official titles containing a matching substring", () => {
  expect(isMainGameResult({ name: "Ghost of Tsushima" })).toBe(true);
  expect(isMainGameResult({ name: "Skin Deep", game_type: { type: "Main Game" } })).toBe(true);
  expect(isMainGameResult({ name: "Example OST" })).toBe(false);
  expect(isMainGameResult({ name: "Example Demo" })).toBe(false);
});
