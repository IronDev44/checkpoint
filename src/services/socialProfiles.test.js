import { getFriendsFeed, readPublicSocialProfile } from "./socialProfiles";

test("opens the current public document, including an @ identifier", async () => {
  const read = jest.fn().mockResolvedValue({ exists: () => true, data: () => ({ displayName: "Nouveau nom", visibility: "public", handle: "old" }) });
  await expect(readPublicSocialProfile(" @Player_1 ", read)).resolves.toMatchObject({ displayName: "Nouveau nom", handle: "player_1" });
  expect(read).toHaveBeenCalledWith("player_1");
});
test.each([
  [{ exists: () => false }, /plus disponible/],
  [{ exists: () => true, data: () => ({ visibility: "prive" }) }, /privé/],
])("does not open missing or private profiles", async (snapshot, message) => {
  await expect(readPublicSocialProfile("friend", async () => snapshot)).rejects.toThrow(message);
});
test("friends feed respects hidden activities and orders public events by date", () => {
  const profiles = [
    { handle: "a", recentActivity: [{ id: "1", date: "2026-10-10", title: "Ancien" }] },
    { handle: "b", recentActivity: [{ id: "1", date: "2026-10-14", title: "Nouveau" }] },
    { handle: "c", publicSections: { activity: false }, recentActivity: [{ id: "2", date: "2026-10-15", title: "Masqué" }] },
  ];
  expect(getFriendsFeed(profiles).map(a => a.title)).toEqual(["Nouveau", "Ancien"]);
  expect(new Set(getFriendsFeed(profiles).map(a => a.feedId)).size).toBe(2);
});
