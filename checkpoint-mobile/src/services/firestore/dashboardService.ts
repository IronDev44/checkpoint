import { collection, getDocs, limit, query } from "firebase/firestore";

import { db } from "../../config/firebase";
import type {
  DashboardSnapshot,
  GameDocument,
  HardwareDocument,
} from "../../types/checkpoint";

function getGameTitle(game: GameDocument) {
  return game.name || game.title || "Jeu sans titre";
}

function isCompleted(game: GameDocument) {
  const status = String(game.status || "").toLowerCase();
  return Boolean(game.completed || status.includes("termin") || status === "completed");
}

function isActive(game: GameDocument) {
  const status = String(game.status || "").toLowerCase();
  return status.includes("cours") || status === "playing" || status === "in-progress";
}

function isOwnedHardware(item: HardwareDocument) {
  const status = String(item.status || "").toLowerCase();
  return status.includes("poss") || status.includes("actuel") || status === "owned";
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [gamesSnapshot, hardwareSnapshot] = await Promise.all([
    getDocs(query(collection(db, "games"), limit(200))),
    getDocs(query(collection(db, "hardware"), limit(200))),
  ]);

  const games = gamesSnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as GameDocument
  );
  const hardware = hardwareSnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as HardwareDocument
  );
  const ratings = games
    .map((game) => Number(game.rating))
    .filter((rating) => Number.isFinite(rating) && rating > 0);

  return {
    totalGames: games.length,
    completedGames: games.filter(isCompleted).length,
    activeGames: games.filter(isActive).length,
    favoriteGames: games.filter((game) => Boolean(game.favorite)).length,
    hardwareCount: hardware.filter(isOwnedHardware).length,
    averageRating: ratings.length
      ? Math.round(
          (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10
        ) / 10
      : null,
    recentGames: games
      .slice(0, 5)
      .sort((a, b) => getGameTitle(a).localeCompare(getGameTitle(b))),
  };
}
