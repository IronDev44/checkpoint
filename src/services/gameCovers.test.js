import { createGameCoverResolver, getKnownGameCover, selectGameCoverMatch, toPublicFounderGame } from "./gameCovers";

const cover = id => ({ image_id: id });
const url = id => `https://images.igdb.com/igdb/image/upload/t_cover_big/${id}.jpg`;
const original = { id: 375, name: "Metal Gear Solid", first_release_date: 904780800, platforms: [{ name: "PlayStation" }], cover: cover("original") };
const pcPort = { id: 393642, name: "Metal Gear Solid", first_release_date: 969753600, platforms: [{ name: "PC (Microsoft Windows)" }], cover: cover("pcport") };

test("cover selection rejects RAWG backgrounds and IGDB screenshots in legacy fields", () => {
  expect(getKnownGameCover({ cover_image: "https://images.igdb.com/igdb/image/upload/t_screenshot_big/test.jpg", image: "https://media.rawg.io/media/games/test.jpg" })).toBe("");
  expect(getKnownGameCover({ normalized: { cover: "https://media.rawg.io/media/games/test.jpg" } })).toBe("");
  expect(getKnownGameCover({ image: url("saved") })).toBe(url("saved"));
  expect(getKnownGameCover({ cover: cover("raw") })).toBe(url("raw"));
});

test("the exact title wins over search order, a sequel, and a similarly named mobile game", () => {
  const matched = selectGameCoverMatch({ name: "Def Jam: Fight for NY" }, [
    { name: "Boxing Fighting Def Jam NY", cover: cover("wrong") },
    { name: "Def Jam Fight For NY: The Takeover", cover: cover("sequel") },
    { name: "Def Jam: Fight for NY", cover: cover("right") },
  ]);
  expect(getKnownGameCover(matched)).toBe(url("right"));
  expect(selectGameCoverMatch({ name: "Def Jam: Fight for NY" }, [{ name: "Def Jam Fight For NY: The Takeover", cover: cover("wrong") }])).toBeNull();
});

test("platform and year preserve the intended edition, and unqualified legacy titles choose the original", () => {
  expect(selectGameCoverMatch({ name: "Metal Gear Solid", released: "1998-09-03", platforms: ["PS1"] }, [pcPort, original])).toBe(original);
  expect(selectGameCoverMatch({ name: "Metal Gear Solid", released: "2000-09-24" }, [original, pcPort])).toBe(pcPort);
  expect(selectGameCoverMatch({ name: "Metal Gear Solid" }, [pcPort, original])).toBe(original);
});

test("known cover metadata does not trigger a lookup", async () => {
  const request = jest.fn();
  const resolve = createGameCoverResolver(request);
  expect(await resolve({ cover_image: url("saved") })).toBe(url("saved"));
  expect(request).not.toHaveBeenCalled();
});

test("an explicit IGDB id uses game details instead of matching another title", async () => {
  const request = jest.fn().mockResolvedValue(original);
  const resolve = createGameCoverResolver(request);
  expect(await resolve({ id: "local-id", sourceIds: { igdb: 375 }, name: "Metal Gear Solid" })).toBe(url("original"));
  expect(request).toHaveBeenCalledWith("/games/375", {}, expect.objectContaining({ normalize: false }));
});

test("concurrent and repeated lookups share one request, while different editions remain separate", async () => {
  const request = jest.fn().mockResolvedValue({ results: [pcPort, original] });
  const resolve = createGameCoverResolver(request);
  const game = { id: "saved", name: "Metal Gear Solid", released: "1998" };
  const results = await Promise.all([resolve(game), resolve({ ...game })]);
  expect(results).toEqual([url("original"), url("original")]);
  await resolve(game);
  expect(request).toHaveBeenCalledTimes(1);
  expect(await resolve({ ...game, released: "2000" })).toBe(url("pcport"));
  expect(request).toHaveBeenCalledTimes(2);
});

test("failures stay non-blocking and are retried after the short negative cache expires", async () => {
  const now = jest.spyOn(Date, "now").mockReturnValue(1000000);
  try {
    const request = jest.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue({ results: [original] });
    const resolve = createGameCoverResolver(request);
    const game = { name: "Metal Gear Solid" };
    expect(await resolve(game)).toBe("");
    expect(await resolve(game)).toBe("");
    expect(request).toHaveBeenCalledTimes(1);
    now.mockReturnValue(1300001);
    expect(await resolve(game)).toBe(url("original"));
  } finally { now.mockRestore(); }
});

test("public founder snapshots retain cover and matching hints without exposing the private review", () => {
  const snapshot = toPublicFounderGame({ id: "igdb:375", name: "Metal Gear Solid", image: url("saved"), playedPlatforms: ["PS1"], released: "1998", review: "Private note" });
  expect(snapshot).toMatchObject({ cover_image: url("saved"), sourceIds: { igdb: 375 }, platforms: ["PS1"], released: "1998" });
  expect(snapshot.review).toBeUndefined();
});
