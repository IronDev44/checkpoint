import { getPlayerFacts, getPlayerNotes, getFounderSignature, getPublicPlayerNotes } from "./playerNotes";

const played = (id, genres = [], extra = {}) => ({ id, name: `Jeu ${id}`, status: "collection", ratingExperience: "partial", genreNames: genres, ...extra });
const series = (length, genres, extra = {}) => Array.from({ length }, (_, index) => played(index, genres, extra));

test("an empty profile doesn't invent a personality or a confidence score", () => {
  const notes = getPlayerNotes();
  expect(notes.title).toBe("Tout commence avec un jeu");
  expect(notes.facts.playedCount).toBe(0);
  expect(notes.confidence).toBeUndefined();
  expect(notes.secondary).toBeUndefined();
});

test("wishlisted and untouched owned games don't determine playing habits", () => {
  const notes = getPlayerNotes([
    ...series(20, ["RPG"], { status: "wishlist", rating: 9, favorite: true }),
    { name: "Resident Evil", status: "collection", genreNames: ["Horror"] },
  ]);
  expect(notes.title).toBe("À chacun son rythme");
  expect(notes.facts).toMatchObject({ collectionCount: 1, playedCount: 0, ratedCount: 0, favoriteCount: 0, genres: [] });
  expect(notes.subtitle).not.toMatch(/RPG|horreur|confort/);
});

test("small samples stay tentative even when every known game has the same genre", () => {
  const notes = getPlayerNotes(series(3, ["RPG"]));
  expect(notes.title).toBe("Les premières parties");
  expect(notes.subtitle).toContain("un peu tôt");
  expect(notes.nextSteps.join(" ")).not.toMatch(/terminer|au moins|10 jeux|15 jeux/i);
});

test("a genre trend is grounded in actual games and duplicate metadata counts once", () => {
  const notes = getPlayerNotes(series(8, ["Adventure", "Aventure", "Adventure"], { tags: ["RPG"], rating: 8 }));
  expect(notes.title).toBe("Une place pour l’aventure");
  expect(notes.facts.genres).toEqual([["Aventure", 8]]);
  expect(notes.signals.find(signal => signal.label === "Tes notes")).toMatchObject({ value: "8/10", detail: "La moyenne de 8 notes." });
});

test("neither ties nor a handful of known genres in a large collection create a dominant genre", () => {
  const tie = getPlayerNotes([...series(5, ["RPG"]), ...series(5, ["Adventure"])]);
  expect(tie.title).toBe("D’un genre à l’autre");
  const sparse = getPlayerNotes([...series(5, ["Adventure"]), ...series(30, [])]);
  expect(sparse.title).toBe("Au fil des parties");
});

test("a game name and its available platforms aren't genre or personality evidence", () => {
  const notes = getPlayerNotes(series(8, [], { name: "Uncharted: God of War", platformNames: ["Nintendo", "Racing PC"], tags: ["family", "war"] }));
  expect(notes.facts.genres).toEqual([]);
  expect(notes.title).toBe("Au fil des parties");
  const signature = getFounderSignature([{ name: "Uncharted", platformNames: ["Nintendo"], genreNames: ["Adventure"] }]);
  expect(signature.title).toBe("Un jeu à part");
  expect(signature.subtitle).not.toMatch(/pilote|familial|guerre|ADN/i);
});

test("partial and tried games count, and completing a game doesn't imply 100 percent completion", () => {
  const notes = getPlayerNotes([
    played(1, [], { ratingExperience: "tried" }),
    played(2, [], { ratingExperience: "partial", rating: 8 }),
    played(3, [], { ratingExperience: "completed" }),
  ]);
  expect(notes.facts).toMatchObject({ playedCount: 3, finishedCount: 1, ratedCount: 1 });
  expect(JSON.stringify(notes)).not.toMatch(/100%|chasseur|verrouiller|exigence/i);
});

test("favorites and currently owned hardware keep the description personal without judging ratings", () => {
  const games = series(6, [], { rating: 3 });
  games[0] = { ...games[0], name: "Portal", favorite: true };
  const notes = getPlayerNotes(games, [{ name: "Switch", status: "possédé" }, { name: "PS2", status: "vendu" }, { name: "PSP", status: "à réparer" }]);
  expect(notes.subtitle).toContain("Portal fait partie de tes coups de cœur.");
  expect(notes.facts.hardwareCount).toBe(2);
  expect(notes.subtitle).not.toMatch(/exigeant|sélectif|débutant/);
});

test("founder signatures work with one to three choices without pressuring users to fill every slot", () => {
  expect(getFounderSignature().subtitle).toContain("jusqu’à trois");
  expect(getFounderSignature([{ name: "Portal" }]).subtitle).toContain("Portal");
  const signature = getFounderSignature([{ name: "Zelda" }, { name: "Mario" }, { name: "Portal" }, { name: "Halo" }]);
  expect(signature.subtitle).toContain("Zelda, Mario et Portal");
  expect(signature.subtitle).not.toContain("Halo");
  expect(signature.subtitle).not.toMatch(/encore|affiner|en cours|personnalité/);
  expect(getFounderSignature([{ name: "Portal" }], "Alex").subtitle).toBe("Alex a choisi Portal pour se présenter.");
});

test("old public analysis copy is replaced immediately without claiming an unknown played count", () => {
  const notes = getPublicPlayerNotes({ displayName: "Alex", totalGames: 42, finishedGames: 18, hardwareCount: 2,
    playerAnalysis: { title: "Curateur de pépites", subtitle: "Ton ADN de joueur", confidence: 99 },
  });
  expect(notes.title).toBe("18 parties terminées");
  expect(notes.subtitle).toBe("Alex a 42 jeux dans sa bibliothèque.");
  expect(JSON.stringify(notes)).not.toMatch(/ADN|Curateur|99|42 jeux joués/);
});

test("new public analysis uses the owner's name and honors hidden favorites", () => {
  const profile = { displayName: "Alex", playerAnalysis: getPlayerNotes(series(6, ["RPG"], { name: "Persona", favorite: true })) };
  expect(getPublicPlayerNotes(profile).subtitle).toContain("ses coups de cœur");
  const hidden = getPublicPlayerNotes({ ...profile, publicSections: { essential: false } });
  expect(hidden.subtitle).not.toContain("Persona");
  expect(hidden.subtitle).not.toContain("tes ");
  expect(getPublicPlayerNotes({ displayName: "Alex", publicSections: { essential: false }, favoriteGames: [{ name: "Secret" }] }).subtitle).not.toContain("Secret");
});

test("historical completed and currently played game formats remain recognized", () => {
  const facts = getPlayerFacts([
    { name: "A", status: "terminé" }, { name: "B", completed: true },
    { name: "C", status: "en cours" }, { name: "D", progressStatus: "tried" },
    { name: "E", ratingGameplay: 8 },
  ]);
  expect(facts).toMatchObject({ playedCount: 5, finishedCount: 2 });
});
