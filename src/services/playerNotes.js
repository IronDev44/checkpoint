import { getGameExperience } from "./gameExperience";

const normalize = (value) => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
const list = (values) => values.length < 2 ? values[0] || "" : `${values.slice(0, -1).join(", ")} et ${values[values.length - 1]}`;
const count = (value, singular, plural = singular === "jeu" ? "jeux" : `${singular}s`) => `${value} ${value === 1 ? singular : plural}`;
const names = (games) => [...new Set((games || []).map(game => game?.name?.trim()).filter(Boolean))];
const number = (value) => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : 0;

// Only use genre metadata: a title or a platform name does not describe someone's tastes.
const GENRES = [
  { label: "Aventure", aliases: ["adventure", "aventure", "action-adventure"], title: "Une place pour l’aventure", phrase: "L’aventure revient souvent" },
  { label: "RPG", aliases: ["rpg", "role-playing", "role playing", "jeux de role", "jeu de role", "jrpg"], title: "Les RPG en bonne place", phrase: "Les RPG reviennent souvent" },
  { label: "Course", aliases: ["racing", "course", "driving"], title: "Un faible pour la course", phrase: "Les jeux de course reviennent souvent" },
  { label: "Shooter", aliases: ["shooter", "fps", "tps", "tir"], title: "Souvent du côté des jeux de tir", phrase: "Les jeux de tir reviennent souvent" },
  { label: "Stratégie", aliases: ["strategy", "strategie", "tactical", "tactics"], title: "Une place pour la stratégie", phrase: "Les jeux de stratégie reviennent souvent" },
  { label: "Simulation", aliases: ["simulation", "simulator"], title: "La simulation en bonne place", phrase: "Les jeux de simulation reviennent souvent" },
  { label: "Plateforme", aliases: ["platformer", "platform", "plateforme"], title: "Un faible pour les jeux de plateforme", phrase: "Les jeux de plateforme reviennent souvent" },
  { label: "Puzzle", aliases: ["puzzle", "enigmes", "reflexion"], title: "Une place pour les énigmes", phrase: "Les jeux de réflexion reviennent souvent" },
  { label: "Sport", aliases: ["sports", "sport"], title: "Souvent du côté du sport", phrase: "Les jeux de sport reviennent souvent" },
  { label: "Combat", aliases: ["fighting", "combat"], title: "Le combat en bonne place", phrase: "Les jeux de combat reviennent souvent" },
  { label: "Horreur", aliases: ["horror", "horreur", "survival horror"], title: "Un faible pour l’horreur", phrase: "Les jeux d’horreur reviennent souvent" },
  { label: "Action", aliases: ["action"], title: "Une place pour l’action", phrase: "Les jeux d’action reviennent souvent" },
];

function gameGenres(game) {
  const metadata = [...(Array.isArray(game.genreNames) ? game.genreNames : []), ...(Array.isArray(game.genres) ? game.genres : [])];
  const labels = metadata.map(value => normalize(typeof value === "string" ? value : value?.name));
  return GENRES.filter(genre => labels.some(label => genre.aliases.includes(label))).map(genre => genre.label);
}

export function getPlayerFacts(games = [], hardware = []) {
  const collection = games.filter(game => game && !normalize(game.status).includes("wishlist"));
  const played = collection.filter(game => getGameExperience(game) || game.favorite);
  const finished = played.filter(game => getGameExperience(game) === "completed");
  const rated = played.map(game => Number(game.rating)).filter(rating => rating > 0 && rating <= 10);
  const favorites = collection.filter(game => game.favorite);
  const genres = new Map();
  let genreSampleCount = 0;
  played.forEach(game => {
    const labels = gameGenres(game);
    if (labels.length) genreSampleCount += 1;
    labels.forEach(label => genres.set(label, (genres.get(label) || 0) + 1));
  });
  const currentHardware = hardware.filter(item => item && /poss|reparer/.test(normalize(item.status)));
  return {
    collectionCount: collection.length,
    playedCount: played.length,
    finishedCount: finished.length,
    ratedCount: rated.length,
    averageRating: rated.length ? Math.round(rated.reduce((sum, rating) => sum + rating, 0) / rated.length * 10) / 10 : 0,
    favoriteCount: favorites.length,
    favoriteNames: names(favorites).slice(0, 2),
    hardwareCount: currentHardware.length,
    genreSampleCount,
    genres: [...genres].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr")),
  };
}

function genreSummary(facts) {
  const [first, second] = facts.genres;
  // A few known genres in a large imported collection aren't a representative sample.
  if (facts.genreSampleCount < 5 || facts.genreSampleCount < facts.playedCount / 2) return null;
  if (!first || first[1] <= (second?.[1] || 0) || first[1] < facts.genreSampleCount * 0.6) return null;
  return GENRES.find(genre => genre.label === first[0]);
}

function describePlayer(facts, displayName) {
  const publicView = Boolean(displayName);
  const subject = publicView ? displayName : "Tu";
  const genre = genreSummary(facts);
  let title;
  let subtitle;
  if (genre) {
    title = genre.title;
    subtitle = `${genre.phrase} dans ${publicView ? "ses" : "tes"} parties.`;
  } else if (!facts.playedCount) {
    title = facts.collectionCount ? "À chacun son rythme" : "Tout commence avec un jeu";
    subtitle = publicView
      ? `${subject} ${facts.collectionCount ? `a ${count(facts.collectionCount, "jeu")} dans sa bibliothèque.` : "n’a pas encore ajouté de jeux."}`
      : facts.collectionCount
        ? "Tes jeux sont là. Indique ceux auxquels tu as joué pour retrouver tes habitudes ici."
        : "Un jeu que tu adores, une partie en cours… commence par ce qui te fait envie.";
  } else if (facts.playedCount < 5) {
    title = "Les premières parties";
    subtitle = `${subject} ${publicView ? "a" : "as"} renseigné ${count(facts.playedCount, "jeu joué", "jeux joués")}. C’est encore un peu tôt pour en dégager des habitudes.`;
  } else if (facts.genreSampleCount >= 5 && facts.genres.length > 1) {
    title = "D’un genre à l’autre";
    subtitle = `${list(facts.genres.slice(0, 3).map(([label]) => label))} : plusieurs genres se retrouvent dans ${publicView ? "ses" : "tes"} parties.`;
  } else {
    title = "Au fil des parties";
    subtitle = `${subject} ${publicView ? "a" : "as"} renseigné ${count(facts.playedCount, "jeu joué", "jeux joués")}${facts.finishedCount ? `, dont ${count(facts.finishedCount, "terminé")}` : ""}.`;
  }
  if (facts.favoriteNames.length) {
    subtitle += ` ${list(facts.favoriteNames)} ${facts.favoriteNames.length === 1 ? "fait" : "font"} partie de ${publicView ? "ses" : "tes"} coups de cœur.`;
  }
  const signals = [
    { label: "Jeux joués", value: String(facts.playedCount), detail: "Terminés, essayés, en cours ou notés." },
    { label: "Tes notes", value: facts.ratedCount ? `${facts.averageRating.toLocaleString("fr-FR")}/10` : "Pas encore de note", detail: facts.ratedCount ? `La moyenne de ${count(facts.ratedCount, "note")}.` : "Un avis compte aussi sans avoir fini le jeu." },
    { label: "Coups de cœur", value: String(facts.favoriteCount), detail: facts.favoriteNames.length ? list(facts.favoriteNames) : "Les jeux que tu choisis de garder en favoris." },
    { label: "Ton matériel", value: String(facts.hardwareCount), detail: `${count(facts.hardwareCount, "équipement")} dans ton setup actuel.` },
  ];
  const nextSteps = [];
  if (!facts.playedCount) nextSteps.push("Tu peux commencer par un jeu déjà joué, même sans l’avoir terminé.");
  else if (!facts.favoriteCount) nextSteps.push("Un jeu te tient à cœur ? Ajoute-le à tes favoris pour le retrouver ici.");
  if (facts.playedCount && !facts.ratedCount) nextSteps.push("Si tu en as envie, laisse un avis sur une de tes parties.");
  return {
    version: 2,
    facts,
    title,
    subtitle,
    icon: genre ? "◈" : "◇",
    maturity: facts.playedCount ? `D’après ${count(facts.playedCount, "jeu joué", "jeux joués")}` : "À ton rythme",
    vibe: facts.finishedCount ? `${count(facts.finishedCount, "jeu terminé", "jeux terminés")}` : facts.playedCount ? "Les parties inachevées comptent aussi." : "",
    signals,
    nextSteps,
  };
}

export function getPlayerNotes(games = [], hardware = []) {
  return describePlayer(getPlayerFacts(games, hardware));
}

export function getFounderSignature(identityGames = [], displayName = "") {
  const games = identityGames.filter(Boolean).slice(0, 3);
  const selectedNames = names(games);
  if (!selectedNames.length) return {
    title: "Quels jeux t’ont marqué ?",
    subtitle: "Choisis jusqu’à trois jeux que tu aimerais faire découvrir en te présentant.",
  };
  return {
    title: selectedNames.length === 1 ? "Un jeu à part" : displayName ? "Ses incontournables" : "Tes incontournables",
    subtitle: displayName
      ? `${displayName} a choisi ${list(selectedNames)} pour se présenter.`
      : `Tu as choisi ${list(selectedNames)} pour te présenter.`,
  };
}

// Older public profiles contain stored archetypes. Rebuild their copy instead of displaying it.
export function getPublicPlayerNotes(profile = {}) {
  const visibleFavorites = profile.publicSections?.essential !== false;
  const stored = profile.playerAnalysis;
  if (stored?.version === 2 && stored.facts) {
    const source = stored.facts;
    const facts = {
      collectionCount: number(source.collectionCount), playedCount: number(source.playedCount),
      finishedCount: number(source.finishedCount), ratedCount: number(source.ratedCount),
      averageRating: number(source.averageRating), hardwareCount: number(source.hardwareCount),
      favoriteCount: visibleFavorites ? number(source.favoriteCount) : 0,
      favoriteNames: visibleFavorites ? (source.favoriteNames || []).filter(value => typeof value === "string").slice(0, 2) : [],
      genreSampleCount: number(source.genreSampleCount), genres: Array.isArray(source.genres) ? source.genres : [],
    };
    return describePlayer(facts, profile.displayName || "Ce joueur");
  }
  const total = number(profile.totalGames);
  const finished = number(profile.finishedGames);
  const favoriteNames = visibleFavorites ? names(profile.favoriteGames).slice(0, 2) : [];
  return {
    title: finished ? `${count(finished, "partie terminée", "parties terminées")}` : "Au fil des parties",
    subtitle: `${profile.displayName || "Ce joueur"} a ${count(total, "jeu")} dans sa bibliothèque.${favoriteNames.length ? ` Parmi ses coups de cœur : ${list(favoriteNames)}.` : ""}`,
    icon: "◇",
    maturity: "Dans sa collection",
    vibe: number(profile.hardwareCount) ? `${count(number(profile.hardwareCount), "équipement")} dans son setup actuel.` : "",
  };
}
