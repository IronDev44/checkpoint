import { FAVORITE_PLATFORM_GROUPS, parseFavoritePlatforms, serializeFavoritePlatforms } from "./favoritePlatforms";

test("recognizes old free-text favorites and removes aliases repeated in a profile", () => {
  expect(parseFavoritePlatforms(" PS5, Switch ; playstation 5 · PC ")).toEqual(["PlayStation 5", "Nintendo Switch", "PC"]);
});

test("keeps a custom legacy platform instead of erasing it", () => {
  expect(parseFavoritePlatforms("Amiga 500, amiga 500, Xbox Series S/X")).toEqual(["Amiga 500", "Xbox Series X/S"]);
  expect(parseFavoritePlatforms("constructor")).toEqual(["constructor"]);
});

test("the default Multi-plateforme is not treated as a chosen favorite", () => {
  for (const value of [undefined, null, "", "Multi-plateforme"]) expect(parseFavoritePlatforms(value)).toEqual([]);
});

test("adding and removing all favorites round-trips the existing profile string", () => {
  const favorites = ["PC", "Nintendo Switch 2", "PlayStation (PS1)", "iPhone / iPad"];
  expect(parseFavoritePlatforms(serializeFavoritePlatforms(favorites))).toEqual(favorites);
  expect(serializeFavoritePlatforms([])).toBe("");
});

test("every menu choice has a unique name and survives saving", () => {
  const platforms = FAVORITE_PLATFORM_GROUPS.flatMap(group => group.platforms);
  expect(new Set(platforms).size).toBe(platforms.length);
  expect(parseFavoritePlatforms(serializeFavoritePlatforms(platforms))).toEqual(platforms);
});
