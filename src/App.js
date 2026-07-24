import { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import "./App.css";
import { db } from "./firebase";
import { HARDWARE_CATALOG } from "./data/hardware";
import { PC_COMPONENT_FIELDS, getPcComponentOptions } from "./data/pcComponents";
import { WEEKLY_QUIZ_QUESTIONS, WEEKLY_QUIZ_XP } from "./data/weeklyQuiz";
import SplashScreen from "./components/SplashScreen";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

import {
  Home,
  List,
  Play,
  Radio,
  Check,
  Search,
  CalendarDays,
  Library,
  Heart,
  Trophy,
  Medal,
  Moon,
  Settings,
  Puzzle,
  Joystick,
  Users,
  ArrowLeft,
  Newspaper,
  BookmarkPlus,
  Archive,
  BookOpen,
  CheckCircle2,
  Clock3,
  Crown,
  Flag,
  Gamepad2,
  Gem,
  Headphones,
  Landmark,
  Monitor,
  Package,
  PenLine,
  ScrollText,
  Sparkles,
  Star as StarIcon,
  Target,
  Timer,
  Wrench,
} from "lucide-react";

const API_KEY = "d7b763a492c745cd82217c285f897e08";

const WEEKLY_QUIZ_STORAGE_KEY = "checkpoint-weekly-quiz";
const CHECKPOINT_GOALS_STORAGE_KEY = "checkpoint-goals";

const DEFAULT_WEEKLY_QUIZ_PROGRESS = {
  answers: {},
  totalXP: 0,
  streak: 0,
  bestStreak: 0,
  lastCorrectWeek: "",
};

const DEFAULT_CHECKPOINT_GOAL_PROGRESS = {
  claimed: {},
  totalXP: 0,
};

function getWeeklyQuizKey(date = new Date()) {
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  const day = current.getDay() || 7;
  current.setDate(current.getDate() + 4 - day);
  const yearStart = new Date(current.getFullYear(), 0, 1);
  const week = Math.ceil((((current - yearStart) / 86400000) + 1) / 7);
  return `${current.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getPreviousWeeklyQuizKey(weekKey) {
  const [yearPart, weekPart] = String(weekKey).split("-W");
  const year = Number(yearPart);
  const week = Number(weekPart);

  if (!year || !week) return "";
  if (week > 1) return `${year}-W${String(week - 1).padStart(2, "0")}`;

  return `${year - 1}-W${String(getWeeksInYear(year - 1)).padStart(2, "0")}`;
}

function getWeeksInYear(year) {
  return getWeeklyQuizKey(new Date(year, 11, 28)).split("-W")[1];
}

function hashString(value) {
  return String(value)
    .split("")
    .reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
}

function getQuizAnswerChoices(question) {
  if (!question?.answers) return [];

  return question.answers
    .map((answer, originalIndex) => ({
      answer,
      originalIndex,
      sortKey: Math.abs(hashString(`${question.id}-${answer}-${originalIndex}`)),
    }))
    .sort((a, b) => a.sortKey - b.sortKey);
}

function getWeeklyQuizQuestion(weekKey = getWeeklyQuizKey()) {
  const questions = WEEKLY_QUIZ_QUESTIONS.length ? WEEKLY_QUIZ_QUESTIONS : [];
  if (questions.length === 0) return null;

  const index = Math.abs(hashString(weekKey)) % questions.length;
  return questions[index];
}

function getStoredWeeklyQuizProgress() {
  try {
    const storedProgress = JSON.parse(
      localStorage.getItem(WEEKLY_QUIZ_STORAGE_KEY) || "{}"
    );

    return {
      ...DEFAULT_WEEKLY_QUIZ_PROGRESS,
      ...storedProgress,
      answers: {
        ...DEFAULT_WEEKLY_QUIZ_PROGRESS.answers,
        ...(storedProgress.answers || {}),
      },
    };
  } catch (error) {
    return DEFAULT_WEEKLY_QUIZ_PROGRESS;
  }
}

function storeWeeklyQuizProgress(progress) {
  localStorage.setItem(WEEKLY_QUIZ_STORAGE_KEY, JSON.stringify(progress));
}

function getStoredCheckpointGoalProgress() {
  try {
    const storedProgress = JSON.parse(
      localStorage.getItem(CHECKPOINT_GOALS_STORAGE_KEY) || "{}"
    );

    return {
      ...DEFAULT_CHECKPOINT_GOAL_PROGRESS,
      ...storedProgress,
      claimed: {
        ...DEFAULT_CHECKPOINT_GOAL_PROGRESS.claimed,
        ...(storedProgress.claimed || {}),
      },
    };
  } catch (error) {
    return DEFAULT_CHECKPOINT_GOAL_PROGRESS;
  }
}

function storeCheckpointGoalProgress(progress) {
  localStorage.setItem(CHECKPOINT_GOALS_STORAGE_KEY, JSON.stringify(progress));
}

function isAbortError(error) {
  const message = String(
    error?.message || error?.reason || error || ""
  ).toLowerCase();

  return (
    error?.name === "AbortError" ||
    message.includes("aborted") ||
    message.includes("user aborted") ||
    message.includes("the user aborted a request")
  );
}

/* ==================== STATS AVANCÉES & PROFIL JOUEUR ==================== */

const APP_RATING_MAX = 10;
const APP_TAB_IDS = [
  "home",
  "news",
  "search",
  "upcoming",
  "deals",
  "live",
  "social",
  "library",
  "series",
  "hardware",
  "favorites",
  "top5",
  "profile",
  "options",
];

const DEFAULT_PUBLIC_SECTIONS = {
  photos: true,
  essential: true,
  identityGames: true,
  hardware: true,
  activity: true,
};

const DEFAULT_APP_OPTIONS = {
  startTab: "home",
  visualEffects: "balanced",
  animatedBackground: true,
  appIcon: "theme",
  ratingDisplay: "number",
  headerMode: "standard",
  mobileNavMode: "standard",
  rememberLastTab: true,
  confirmDangerActions: true,
  afterAddAction: "stay",
  dealRegion: "FR",
  dealSources: {
    steam: true,
    epic: true,
    psn: true,
  },
};

const GAME_RATING_KEYS = [
  "rating",
  "ratingGraphics",
  "ratingGameplay",
  "ratingStory",
  "ratingSound",
  "ratingLongevity",
  "ostRating",
  "ratingOpenWorld",
  "ratingGunplay",
  "ratingDriving",
  "ratingCombat",
  "ratingExploration",
  "ratingChallenge",
  "ratingMultiplayer",
  "ratingStealth",
  "ratingPuzzle",
  "ratingPlatforming",
  "ratingHorror",
];

function clampRating(value, max = APP_RATING_MAX) {
  const rating = Number(value) || 0;
  return Math.max(0, Math.min(max, Math.round(rating * 10) / 10));
}

function getRatingDisplayMode() {
  try {
    const saved = JSON.parse(localStorage.getItem("checkpoint-app-options") || "{}");
    return saved.ratingDisplay || DEFAULT_APP_OPTIONS.ratingDisplay;
  } catch (error) {
    return DEFAULT_APP_OPTIONS.ratingDisplay;
  }
}

function getStoredAppOptions() {
  try {
    const saved = JSON.parse(localStorage.getItem("checkpoint-app-options") || "{}");
    return {
      ...DEFAULT_APP_OPTIONS,
      ...saved,
      dealSources: {
        ...DEFAULT_APP_OPTIONS.dealSources,
        ...(saved.dealSources || {}),
      },
    };
  } catch (error) {
    return DEFAULT_APP_OPTIONS;
  }
}

function formatRating10(value, emptyLabel = "Pas note") {
  const rating = clampRating(value);
  if (!rating) return emptyLabel;

  const displayMode = getRatingDisplayMode();

  if (displayMode === "stars") {
    const stars = Math.max(1, Math.round(rating / 2));
    return `${"★".repeat(stars)}${"☆".repeat(5 - stars)}`;
  }

  if (displayMode === "compact") {
    return String(rating);
  }

  return `${rating}/10`;
}

function getGameRating(game) {
  return clampRating(game?.rating);
}

function normalizeGameRatings(game = {}) {
  const normalizedGame = { ...game };

  GAME_RATING_KEYS.forEach((key) => {
    if (normalizedGame[key] !== undefined) {
      normalizedGame[key] = clampRating(normalizedGame[key]);
    }
  });

  return normalizedGame;
}

const GAME_GENRE_SIGNAL_RULES = [
  { label: "RPG", weight: 1.35, keywords: ["rpg", "role playing", "role-playing", "jrpg", "arpg", "soulslike"] },
  { label: "Shooter", weight: 1.35, keywords: ["shooter", "fps", "tps", "first person", "third person", "gunplay"] },
  { label: "Course", weight: 1.3, keywords: ["racing", "driving", "course", "pilotage", "motorsport", "rally"] },
  { label: "Horreur", weight: 1.28, keywords: ["horror", "survival horror", "survie", "terror", "scary"] },
  { label: "Stratégie", weight: 1.25, keywords: ["strategy", "tactical", "tactics", "rts", "4x", "gestion"] },
  { label: "Simulation", weight: 1.18, keywords: ["simulation", "simulator", "management", "builder"] },
  { label: "Plateforme", weight: 1.18, keywords: ["platformer", "platform", "metroidvania"] },
  { label: "Puzzle", weight: 1.16, keywords: ["puzzle", "logic", "escape"] },
  { label: "Sport", weight: 1.12, keywords: ["sports", "sport", "football", "basketball", "tennis"] },
  { label: "Combat", weight: 1.08, keywords: ["fighting", "fight", "brawler", "beat em up", "beat-em-up"] },
  { label: "Aventure", weight: 0.9, keywords: ["adventure", "action-adventure", "narrative", "story rich"] },
  { label: "Indé", weight: 0.82, keywords: ["indie", "independent"] },
  { label: "Action", weight: 0.58, keywords: ["action", "arcade"] },
];

function getGameGenreSignals(game = {}) {
  const text = [
    game.name,
    game.slug,
    ...(game.genreNames || []),
    ...(game.tags || []).map((tag) => tag?.name || tag),
  ]
    .filter(Boolean)
    .map((value) => normalizeIdentityText(String(value)))
    .join(" ");

  const scores = {};

  GAME_GENRE_SIGNAL_RULES.forEach((rule) => {
    const matched = rule.keywords.some((keyword) =>
      text.includes(normalizeIdentityText(keyword))
    );

    if (matched) {
      scores[rule.label] = Math.max(scores[rule.label] || 0, rule.weight);
    }
  });

  const hasSpecificGenre = Object.entries(scores).some(
    ([label, score]) => label !== "Action" && score >= 1
  );

  if (hasSpecificGenre && scores.Action) {
    scores.Action = Math.min(scores.Action, 0.25);
  }

  if (!Object.keys(scores).length && game.genreNames?.[0]) {
    scores[game.genreNames[0]] = 0.75;
  }

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([label, weight]) => ({ label, weight }));
}

function getAdvancedStats(games) {
  const finished = games.filter(isGameFinishedStatus);

  const totalPlaytime = games.reduce((acc, g) => acc + (g.playtime || 0), 0);

  const ratedGames = games.filter((g) => getGameRating(g) > 0);
  const avgRating =
    ratedGames.reduce((acc, g) => acc + getGameRating(g), 0) /
    (ratedGames.length || 1);

  const avgDifficulty = (() => {
    const map = { casual: 1, normal: 2, hard: 3, hardcore: 4 };
    const values = games.map(g => map[g.difficulty]).filter(Boolean);
    if (!values.length) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  })();

  const genres = {};
  const platforms = {};

  games.forEach(g => {
    getGameGenreSignals(g).forEach(({ label, weight }) => {
      genres[label] = (genres[label] || 0) + weight;
    });

    g.platformNames?.forEach(p => {
      platforms[p] = (platforms[p] || 0) + 1;
    });
  });

  const topGenres = Object.entries(genres)
    .sort((a, b) => b[1] - a[1])
    .map(([label, score]) => [label, Math.max(1, Math.round(score))])
    .slice(0, 3);

  const topPlatforms = Object.entries(platforms)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return {
  totalPlaytime,
  avgRating,
  avgDifficulty,
  topGenres,
  topPlatforms,
  finishedCount: finished.length,
  avgXpPerFinished:
    finished.length > 0
      ? Math.round(
          finished.reduce((acc, game) => acc + calculateXP(game), 0) / finished.length
        )
      : 0,
};
}

function formatFullDate(date) {
  if (!date) return "Date inconnue";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getReleaseCountdown(date) {
  if (!date) return "";

  const today = new Date();
  const releaseDate = new Date(date);

  today.setHours(0, 0, 0, 0);
  releaseDate.setHours(0, 0, 0, 0);

  const diffTime = releaseDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (Number.isNaN(diffDays)) return "";
  if (diffDays > 1) return `Sort dans ${diffDays} jours`;
  if (diffDays === 1) return "Sort demain";
  if (diffDays === 0) return "Sort aujourd’hui";
  if (diffDays < 0) return "Déjà sorti";

  return "";
}

function getGenreChartData(games) {
  const genres = {};

  games.forEach((game) => {
    getGameGenreSignals(game).forEach(({ label, weight }) => {
      genres[label] = (genres[label] || 0) + weight;
    });
  });

  return Object.entries(genres)
    .sort((a, b) => b[1] - a[1])
    .map(([label, score]) => [label, Math.max(1, Math.round(score))])
    .slice(0, 5);
}


function AdvancedStats({ games }) {
  const stats = getAdvancedStats(games);
  const profile = getPlayerProfile(games);

  return (
    <div className="advanced-stats">
      <div className="stat-card wide profile-card">
        <div className="stat-value">{profile.title}</div>
        <div className="stat-label">{profile.subtitle}</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">{stats.totalPlaytime}h</div>
        <div className="stat-label">Temps total</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">
          {stats.avgRating ? stats.avgRating.toFixed(1) : "-"}
        </div>
        <div className="stat-label">Note moyenne</div>
      </div>

      <div className="stat-card">
        <div className={`difficulty-badge difficulty-${Math.round(stats.avgDifficulty || 0)}`}>
          {stats.avgDifficulty ? difficultyLabel(stats.avgDifficulty) : "-"}
        </div>
        <div className="stat-label">Difficulté moyenne</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">
          {stats.avgXpPerFinished ? `${stats.avgXpPerFinished} XP` : "-"}
        </div>
        <div className="stat-label">XP moyenne / jeu</div>
      </div>

      <div className="stat-card wide">
        <div className="stat-value">
          {stats.topGenres.map((g) => g[0]).join(" • ") || "-"}
        </div>
        <div className="stat-label">Genres favoris</div>
      </div>

      <div className="stat-card wide">
        <div className="stat-value">
          {stats.topPlatforms.map((p) => p[0]).join(" • ") || "-"}
        </div>
        <div className="stat-label">Plateformes principales</div>
      </div>
    </div>
  );
}

function SearchGameDetailModal({ game, onClose, onWishlist, onCollection }) {
  const [details, setDetails] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (!game) return;

  document.body.classList.add("modal-open");

  return () => {
    document.body.classList.remove("modal-open");
  };
}, [game]);

  useEffect(() => {
    if (!game) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);

        const [detailsRes, screenshotsRes, moviesRes] = await Promise.all([
          fetch(`https://api.rawg.io/api/games/${game.id}?key=${API_KEY}&lang=fr`),
          fetch(`https://api.rawg.io/api/games/${game.id}/screenshots?key=${API_KEY}`),
          fetch(`https://api.rawg.io/api/games/${game.id}/movies?key=${API_KEY}`),
        ]);

        const detailsData = await detailsRes.json();
        const screenshotsData = await screenshotsRes.json();
        const moviesData = await moviesRes.json();

        setDetails(detailsData);
        setScreenshots(screenshotsData.results || []);
        setMovies(moviesData.results || []);
      } catch (error) {
        if (isAbortError(error)) return;
        console.warn("Erreur détail RAWG ignorée :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [game]);

  if (!game) return null;

  const buildPayload = (status) => ({
    name: game.name,
    rating: 0,
    favorite: false,
    image: game.background_image || details?.background_image || "",
    status,
    released: game.released || details?.released || "",
    platformNames:
      game.platforms?.map((p) => p.platform.name) ||
      details?.platforms?.map((p) => p.platform.name) ||
      [],
    genreNames:
      game.genres?.map((g) => g.name) ||
      details?.genres?.map((g) => g.name) ||
      [],
    playtime: game.playtime || details?.playtime || null,
    difficulty: getSuggestedDifficulty(details || game),
    progressStatus: "not_started",
    playtimeRange: "none",
    review: "",
    ratingGraphics: 0,
    ratingGameplay: 0,
    ratingStory: 0,
    ratingSound: 0,
    ostRating: 0,
    ratingLongevity: 0,
    rawgId: game.id,
  });

  const trailer = movies[0]?.data?.max || movies[0]?.data?.["480"];

  return (
    <div className="search-detail-backdrop" onClick={onClose}>
      <div className="search-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" type="button" onClick={onClose}>
          ✕
        </button>

        {loading ? (
          <Loader text="Chargement des infos..." />
        ) : (
          <>
            <div
              className="search-detail-hero premium"
              style={{
                backgroundImage: `url(${details?.background_image || game.background_image})`,
              }}
            >
              <div className="search-detail-hero-blur" />

              <img
                src={details?.background_image || game.background_image}
                alt={game.name}
                className="search-detail-cover"
              />

              <div className="search-detail-hero-overlay">
                <h2>{details?.name || game.name}</h2>
                <div className="search-detail-meta">
                  {details?.released || game.released || "Date inconnue"} • ⭐{" "}
                  {details?.rating || game.rating || "-"}
                </div>
              </div>
            </div>

            <div className="search-detail-content">
              <div className="search-detail-actions">
                <button
                  type="button"
                  onClick={() => onWishlist(buildPayload("wishlist"))}
                >
                  <BookmarkPlus size={18} />
                  Wishlist
                </button>

                <button
                  type="button"
                  onClick={() => onCollection(buildPayload("collection"))}
                >
                  <Library size={18} />
                  Collection
                </button>
              </div>

              <div className="search-detail-section">
                <h3>Synopsis</h3>
                <p>
                  {details?.description_raw ||
                    "Aucun synopsis disponible en français pour ce jeu."}
                </p>
              </div>

              {screenshots.length > 0 && (
                <div className="search-detail-section">
                  <h3>Images</h3>
                  <div className="screenshots-carousel">
                    {screenshots.slice(0, 6).map((shot) => (
                      <img key={shot.id} src={shot.image} alt="" />
                    ))}
                  </div>
                </div>
              )}

              {trailer && (
                <div className="search-detail-section">
                  <h3>Bande-annonce</h3>
                  <video controls className="search-detail-video">
                    <source src={trailer} />
                  </video>
                </div>
              )}

              <div className="search-detail-section">
                <h3>Infos</h3>
                <div className="search-detail-info-grid">
                  <div>
                    <strong>Genres</strong>
                    <span>{details?.genres?.map((g) => g.name).join(" • ") || "—"}</span>
                  </div>

                  <div>
                    <strong>Plateformes</strong>
                    <span>
                      {details?.platforms?.map((p) => p.platform.name).slice(0, 6).join(" • ") ||
                        "—"}
                    </span>
                  </div>

                  <div>
                    <strong>Développeur</strong>
                    <span>{details?.developers?.map((d) => d.name).join(" • ") || "—"}</span>
                  </div>

                  <div>
                    <strong>Éditeur</strong>
                    <span>{details?.publishers?.map((p) => p.name).join(" • ") || "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GenreStatsChart({ games }) {
  const data = getGenreChartData(games);

  if (!data.length) {
    return (
      <div className="search-panel">
        <h2 className="panel-title">Genres les plus joués</h2>
        <div className="option-value">Pas assez de données pour afficher le graphique.</div>
      </div>
    );
  }

  const maxValue = data[0][1];

  return (
    <div className="search-panel">
      <h2 className="panel-title">Genres les plus joués</h2>

      <div className="genre-chart">
        {data.map(([genre, count]) => (
          <div key={genre} className="genre-chart-row">
            <div className="genre-chart-label">{genre}</div>

            <div className="genre-chart-bar-wrap">
              <div
                className="genre-chart-bar"
                style={{ width: `${(count / maxValue) * 100}%` }}
              />
            </div>

            <div className="genre-chart-value">{count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getPlayerProfile(games) {
  if (!games.length) {
    return {
      title: "Signature en construction",
      subtitle: "Ta bibliotheque commence a dessiner ton univers gaming."
    };
  }

  const finishedGames = games.filter(isGameFinishedStatus);
  const favoriteGames = games.filter((g) => g.favorite);
  const stats = getAdvancedStats(games);

  const topGenre = stats.topGenres[0]?.[0] || "";
  const avgDifficulty = stats.avgDifficulty || 0;
  const avgRating = stats.avgRating || 0;
  const totalPlaytime = stats.totalPlaytime || 0;
  const finishedCount = finishedGames.length;
  const favoriteCount = favoriteGames.length;

  if (finishedCount >= 20 && avgDifficulty >= 3.2) {
    return {
      title: "Mode Legende active",
      subtitle: "Tu valides des jeux exigeants et tu fais monter ton checkpoint."
    };
  }

  if (topGenre === "RPG") {
    return {
      title: "Cartographe d'univers",
      subtitle: "Ton profil se construit autour des mondes riches, des quetes et de la progression."
    };
  }

  if (topGenre === "Aventure") {
    return {
      title: "Voyageur de mondes",
      subtitle: "Tu avances par decouverte, ambiance et grands moments d'exploration."
    };
  }

  if (topGenre === "Shooter") {
    return {
      title: "Précision tactique",
      subtitle: "Ton profil aime la visée propre, la pression et les décisions rapides."
    };
  }

  if (topGenre === "Course") {
    return {
      title: "Pilote de trajectoires",
      subtitle: "Ton univers aime la vitesse, la maîtrise et le feeling manette en main."
    };
  }

  if (topGenre === "Horreur") {
    return {
      title: "Chasseur de tension",
      subtitle: "Ton profil se nourrit d'ambiance, de survie et de moments qui restent."
    };
  }

  if (topGenre === "Stratégie") {
    return {
      title: "Architecte tactique",
      subtitle: "Tu aimes planifier, optimiser et gagner avant même que l'action explose."
    };
  }

  if (topGenre === "Action" || topGenre === "Combat") {
    return {
      title: "Instinct arcade",
      subtitle: "Ton checkpoint préfère le rythme, l'impact et les sensations immédiates."
    };
  }

  if (topGenre === "Simulation") {
    return {
      title: "Architecte de systemes",
      subtitle: "Tu prends plaisir a gerer, optimiser et construire quelque chose qui tient."
    };
  }

  if (favoriteCount >= 8 && avgRating >= 8) {
    return {
      title: "Curateur de pepites",
      subtitle: "Tes favoris racontent une selection personnelle, pas juste une collection."
    };
  }

  if (avgRating >= 8.6) {
    return {
      title: "Oeil de selection",
      subtitle: "Tu notes haut quand un jeu merite vraiment sa place dans ton univers."
    };
  }

  if (totalPlaytime >= 120) {
    return {
      title: "Gardien du backlog",
      subtitle: "Tu donnes du temps a ta bibliotheque et tu fais vivre tes jeux sur la duree."
    };
  }

  if (finishedCount >= 10) {
    return {
      title: "Bibliotheque consolidee",
      subtitle: "Ton checkpoint a deja une vraie base de jeux termines et assumes."
    };
  }

  if (avgDifficulty <= 1.5) {
    return {
      title: "Session confort",
      subtitle: "Tu privilegies les experiences fluides, accessibles et agreables a lancer."
    };
  }

  return {
    title: "Profil multi-plateforme",
    subtitle: "Ton univers reste ouvert, varie et difficile a ranger dans une seule case."
  };
}

function getProfileInsights(games = [], hardware = [], badges = []) {
  const stats = getAdvancedStats(games);
  const completedGames = games.filter(isGameFinishedStatus);
  const ratedGames = games.filter((game) => getGameRating(game) > 0);
  const currentHardware = hardware.filter((item) => {
    const status = normalizeIdentityText(item.status || "");
    return status.includes("poss") || status.includes("reparer");
  });
  const ratedHardware = currentHardware
    .map((item) => ({
      ...item,
      average: getHardwareAverageRating(item),
    }))
    .filter((item) => item.average > 0)
    .sort((a, b) => b.average - a.average);

  const topGenre = stats.topGenres[0];
  const topPlatform = stats.topPlatforms[0];
  const topHardware = ratedHardware[0];
  const unlockedBadges = badges.filter((badge) => badge.unlocked);
  const favoriteGames = games.filter((game) => game.favorite);
  const badgeCompletion = badges.length
    ? Math.round((unlockedBadges.length / badges.length) * 100)
    : 0;
  const averageRating = stats.avgRating || 0;
  const completionRate = games.length
    ? Math.round((completedGames.length / games.length) * 100)
    : 0;
  const topGenreName = topGenre?.[0] || "univers varié";
  const topPlatformName = topPlatform?.[0] || "multi-plateforme";
  const hardwareTone = topHardware
    ? `et un setup porté par ${topHardware.name}`
    : "avec un setup encore en construction";

  const headline =
    games.length > 0
      ? `${topGenreName} sur ${topPlatformName}`
      : "Signature à révéler";
  const summary =
    games.length > 0
      ? `Ton profil penche vers ${topGenreName}, avec ${completedGames.length} jeux terminés, ${favoriteGames.length} favoris ${hardwareTone}.`
      : "Ajoute tes jeux, ton matériel et quelques notes pour que Checkpoint commence à lire ton identité de joueur.";
  const maturity =
    completedGames.length >= 50
      ? "Profil solide"
      : completedGames.length >= 20
        ? "Profil établi"
        : completedGames.length >= 5
          ? "Profil en progression"
          : "Profil naissant";

  const cards = [
    {
      label: "Signature",
      value: topGenre ? topGenre[0] : "À définir",
      detail: topGenre
        ? `${topGenre[1]} jeux dans ce registre`
        : "Ajoute ou classe tes jeux pour révéler ton style.",
      tone: "primary",
    },
    {
      label: "Terrain favori",
      value: topPlatform ? topPlatform[0] : "Multi-plateforme",
      detail: topPlatform
        ? `${topPlatform[1]} jeux liés à cette plateforme`
        : "Tes plateformes ressortiront avec plus de jeux classés.",
      tone: "platform",
    },
    {
      label: "Exigence",
      value: averageRating ? formatRating10(averageRating, "-") : "À noter",
      detail: ratedGames.length
        ? `${ratedGames.length} jeux notés`
        : "Tes notes construiront une vraie lecture de ton profil.",
      tone: averageRating >= 8.5 ? "high" : "neutral",
    },
    {
      label: "Matériel repère",
      value: topHardware ? topHardware.name : "À choisir",
      detail: topHardware
        ? `${formatRating10(topHardware.average, "-")} sur tes critères`
        : `${currentHardware.length} matériels actuellement en possession`,
      tone: "hardware",
    },
  ];

  const focus = [];

  if (completedGames.length >= 25) {
    focus.push("Tu as une base solide de jeux terminés, ton profil commence à raconter une vraie trajectoire.");
  } else if (completedGames.length > 0) {
    focus.push(`Encore ${Math.max(1, 25 - completedGames.length)} jeux terminés pour consolider ta trajectoire.`);
  } else {
    focus.push("Terminer quelques jeux donnera plus de poids à ton profil joueur.");
  }

  if (badgeCompletion >= 70) {
    focus.push("Ta chasse aux badges est déjà bien avancée.");
  } else if (badges.length) {
    focus.push(`${badgeCompletion}% des badges débloqués, il reste de quoi faire évoluer ton identité.`);
  }

  if (ratedHardware.length >= 5) {
    focus.push("Tes notes matériel commencent à donner une vraie hiérarchie à ton setup.");
  } else if (currentHardware.length) {
    focus.push("Noter plus de matériel rendra tes classements beaucoup plus fiables.");
  }

  return {
    headline,
    summary,
    maturity,
    completionRate,
    badgeCompletion,
    cards,
    focus: focus.slice(0, 3),
  };
}

function normalizeIdentityText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getIdentityPlayerTitle(identityGames = []) {
  const games = identityGames.filter(Boolean).slice(0, 3);

  if (!games.length) {
    return {
      title: "Identite a construire",
      subtitle: "Choisis 3 jeux pour reveler ta signature de joueur.",
    };
  }

  const text = games
    .flatMap((game) => [
      game.name,
      ...(game.genreNames || []),
      ...(game.platforms || []),
      ...(game.platformNames || []),
    ])
    .map(normalizeIdentityText)
    .join(" ");

  const countMatches = (words) =>
    words.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);

  const identityRules = [
    {
      title: "Pilote dans l'ame",
      subtitle: "Ton ADN de joueur sent la trajectoire parfaite et la vitesse.",
      words: ["racing", "race", "driving", "cars", "car", "vehicle", "automobile", "forza", "gran turismo", "need for speed", "mario kart", "dirt", "f1", "wrc", "assetto"],
    },
    {
      title: "Samourai du pad",
      subtitle: "Ton identite s'est forgee dans l'exigence, les boss et la perseverance.",
      words: ["souls", "soulslike", "dark souls", "elden ring", "bloodborne", "sekiro", "nioh", "lies of p", "lord of the fallen", "wo long"],
    },
    {
      title: "Infiltreur",
      subtitle: "Tu aimes observer, contourner et gagner sans faire de bruit.",
      words: ["stealth", "infiltration", "metal gear", "splinter cell", "hitman", "dishonored", "thief", "deus ex", "assassin"],
    },
    {
      title: "Legende JRPG",
      subtitle: "Ton imaginaire s'est construit avec les equipes, les invocations et les grandes odyssees.",
      words: ["jrpg", "final fantasy", "dragon quest", "persona", "xenoblade", "tales of", "chrono trigger", "ni no kuni", "octopath", "fire emblem"],
    },
    {
      title: "Gardien de la fantasy",
      subtitle: "Tu reviens toujours vers les royaumes, les mythes et les destins epiques.",
      words: ["fantasy", "dragon", "witcher", "skyrim", "elder scrolls", "baldur", "dragon age", "diablo", "warcraft", "middle-earth"],
    },
    {
      title: "Voyageur de science-fiction",
      subtitle: "Ton profil regarde vers l'espace, la technologie et les futurs possibles.",
      words: ["sci-fi", "science fiction", "space", "cyberpunk", "starfield", "mass effect", "halo", "metroid", "deus ex", "outer worlds", "no man's sky"],
    },
    {
      title: "Heros de comics",
      subtitle: "Ton identite de joueur a le gout des pouvoirs, des masques et des grandes responsabilites.",
      words: ["spider-man", "spiderman", "batman", "arkham", "marvel", "guardians", "avengers", "injustice", "dc ", "lego marvel"],
    },
    {
      title: "Roi du crime ouvert",
      subtitle: "Tu t'es construit dans les villes ouvertes, les braquages et les histoires de rue.",
      words: ["gta", "grand theft", "mafia", "saints row", "yakuza", "like a dragon", "sleeping dogs", "watch dogs", "payday", "crime"],
    },
    {
      title: "Survivant",
      subtitle: "Tu aimes quand chaque ressource compte et que le monde ne te fait aucun cadeau.",
      words: ["survival", "craft", "the forest", "subnautica", "dayz", "rust", "ark", "valheim", "green hell", "don't starve"],
    },
    {
      title: "Createur de mondes",
      subtitle: "Tu preferes construire, decorer, organiser et laisser une trace visible.",
      words: ["builder", "building", "creation", "minecraft", "animal crossing", "dragon quest builders", "planet coaster", "cities", "sims", "two point"],
    },
    {
      title: "Maitre des enigmes",
      subtitle: "Ton plaisir vient des idees qui s'emboitent et des solutions elegantes.",
      words: ["puzzle", "portal", "witness", "talos", "tetris", "professor layton", "monument valley", "baba is you", "return of the obra dinn"],
    },
    {
      title: "Rythme dans le sang",
      subtitle: "Tu joues autant avec l'oreille qu'avec les reflexes.",
      words: ["rhythm", "music", "guitar hero", "rock band", "beat saber", "just dance", "taiko", "osu", "hatsune", "thumper"],
    },
    {
      title: "Ame d'independant",
      subtitle: "Tu es marque par les experiences singulieres, les idees fortes et les petits studios.",
      words: ["indie", "hades", "hollow knight", "celeste", "limbo", "inside", "dead cells", "undertale", "cuphead", "ori"],
    },
    {
      title: "Retro dans le coeur",
      subtitle: "Ton identite garde le gout des classiques, des sprites et des consoles qui ont ouvert la voie.",
      words: ["retro", "arcade", "classic", "mega man", "castlevania", "pac-man", "street fighter ii", "sonic", "mario bros", "contra"],
    },
    {
      title: "Joueur de canape",
      subtitle: "Ton histoire se raconte aussi a plusieurs, manette en main et rire en fond.",
      words: ["coop", "co-op", "party", "multiplayer", "overcooked", "it takes two", "mario party", "smash", "gang beasts", "moving out"],
    },
    {
      title: "Competiteur en ligne",
      subtitle: "Tu cherches le duel, le classement et la partie ou tout se joue maintenant.",
      words: ["competitive", "esport", "ranked", "league of legends", "valorant", "counter-strike", "fortnite", "apex legends", "rocket league", "overwatch"],
    },
    {
      title: "Chasseur de monstres",
      subtitle: "Tu aimes apprendre les patterns, preparer ton equipement et repartir en chasse.",
      words: ["monster hunter", "dauntless", "god eater", "wild hearts", "dragons dogma", "horizon", "witcher"],
    },
    {
      title: "Commandant de guerre",
      subtitle: "Ton profil aime les fronts, les escouades et les decisions sous pression.",
      words: ["war", "military", "battlefield", "call of duty", "medal of honor", "arma", "hell let loose", "company of heroes", "brothers in arms"],
    },
    {
      title: "Collectionneur de creatures",
      subtitle: "Ton aventure passe par les equipes a composer, les captures et l'attachement.",
      words: ["pokemon", "digimon", "palworld", "monster sanctuary", "temtem", "yo-kai", "nexomon"],
    },
    {
      title: "Explorateur de mondes",
      subtitle: "Tu t'es construit avec l'aventure, les grands espaces et la decouverte.",
      words: ["adventure", "open world", "exploration", "zelda", "tomb raider", "uncharted", "horizon", "death stranding"],
    },
    {
      title: "Heros narratif",
      subtitle: "Ce sont les histoires, les personnages et les emotions qui t'ont marque.",
      words: ["story", "narrative", "rpg", "role-playing", "the last of us", "life is strange", "detroit", "mass effect", "final fantasy", "persona"],
    },
    {
      title: "Combattant instinctif",
      subtitle: "Ton profil s'est forge dans le duel, le timing et la maitrise.",
      words: ["fighting", "combat", "mortal kombat", "street fighter", "tekken", "dragon ball", "super smash", "soulcalibur"],
    },
    {
      title: "Tacticien",
      subtitle: "Tu aimes comprendre les systemes, optimiser et gagner avec la tete.",
      words: ["strategy", "tactical", "tactics", "management", "civilization", "xcom", "fire emblem", "total war", "football manager"],
    },
    {
      title: "Tireur de precision",
      subtitle: "Ton identite passe par le reflexe, la visee et la pression.",
      words: ["shooter", "fps", "shooting", "call of duty", "battlefield", "halo", "doom", "counter-strike", "valorant", "destiny"],
    },
    {
      title: "Architecte du chaos",
      subtitle: "Tu aimes les bacs a sable, les systemes libres et les histoires que tu crees toi-meme.",
      words: ["sandbox", "simulation", "simulator", "minecraft", "terraria", "sims", "cities", "planet coaster", "stardew"],
    },
    {
      title: "Chasseur d'ombres",
      subtitle: "Ton parcours a ete marque par l'horreur, la tension et les ambiances lourdes.",
      words: ["horror", "survival", "resident evil", "silent hill", "dead space", "alan wake", "outlast", "evil within"],
    },
    {
      title: "Gardien du sport",
      subtitle: "Ton profil s'est construit dans la competition, les saisons et les grands matchs.",
      words: ["sports", "sport", "football", "soccer", "nba", "fifa", "fc ", "efootball", "nhl", "ufc", "wwe", "tennis"],
    },
    {
      title: "Plateformeur ne",
      subtitle: "Tu as grandi avec le saut parfait, le rythme et les niveaux a maitriser.",
      words: ["platformer", "platform", "mario", "sonic", "rayman", "crash", "spyro", "celeste", "ori"],
    },
    {
      title: "Gardien familial",
      subtitle: "Ton identite de joueur garde un cote accessible, colore et partageable.",
      words: ["family", "kids", "nintendo", "kirby", "yoshi", "lego", "mario", "splatoon", "animal crossing"],
    },
  ];

  const rankedRules = identityRules
    .map((rule) => ({ ...rule, score: countMatches(rule.words) }))
    .sort((a, b) => b.score - a.score);

  if (rankedRules[0]?.score >= 2) {
    return {
      title: rankedRules[0].title,
      subtitle: rankedRules[0].subtitle,
    };
  }

  if (games.length === 3) {
    return {
      title: "Joueur aux trois piliers",
      subtitle: "Tes jeux fondateurs dessinent un profil varie et tres personnel.",
    };
  }

  return {
    title: "Signature en cours",
    subtitle: "Ajoute encore des jeux fondateurs pour affiner ton identite.",
  };
}

function formatGameRating10(rating) {
  return formatRating10(rating, "");
}

const soundEnabledGlobal = () => {
  return localStorage.getItem("checkpoint-sound-enabled") !== "false";
};

let checkpointAudioContext = null;

const getCheckpointAudioContext = () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!checkpointAudioContext || checkpointAudioContext.state === "closed") {
    checkpointAudioContext = new AudioContextClass();
  }

  if (checkpointAudioContext.state === "suspended") {
    checkpointAudioContext.resume().catch(() => {});
  }

  return checkpointAudioContext;
};

const playSound = (type, options = {}) => {
  const force = typeof options === "object" && options?.force === true;
  if (!force && !soundEnabledGlobal()) return;

  try {
    const ctx = getCheckpointAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.value = 0.06;
    master.connect(ctx.destination);

    const note = (freq, start, dur, vol = 0.13, waveform = "sine") => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = waveform;
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(vol, now + start + 0.012);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + start + dur
      );

      osc.connect(gain);
      gain.connect(master);

      osc.start(now + start);
      osc.stop(now + start + dur);
    };

    // 🎮 SWITCH PAR ACTION
    switch (type) {
      case "click":
        note(880, 0, 0.045, 0.08, "triangle");
        break;

      case "success":
        note(740, 0, 0.06, 0.09, "triangle");
        note(980, 0.06, 0.07, 0.1, "sine");
        note(1280, 0.13, 0.1, 0.11, "sine");
        break;

      case "delete":
        note(520, 0, 0.08, 0.1, "triangle");
        note(360, 0.06, 0.1, 0.08, "sine");
        break;

      case "badge":
        note(860, 0, 0.055, 0.1, "triangle");
        note(1180, 0.055, 0.07, 0.11, "sine");
        note(1580, 0.13, 0.12, 0.12, "sine");
        break;

      case "levelup":
        note(660, 0, 0.07, 0.1, "triangle");
        note(880, 0.07, 0.08, 0.1, "triangle");
        note(1180, 0.15, 0.09, 0.11, "sine");
        note(1560, 0.25, 0.14, 0.12, "sine");
        break;

      default:
        note(880, 0, 0.06, 0.09, "triangle");
    }

    setTimeout(() => master.disconnect(), 800);
  } catch (e) {
    console.error("Erreur son :", e);
  }
};

const createPixelEffect = (x, y) => {
  const pixel = document.createElement("div");
  pixel.className = "pixel-click";

  pixel.style.left = `${x}px`;
  pixel.style.top = `${y}px`;

  document.body.appendChild(pixel);

  setTimeout(() => {
    pixel.remove();
  }, 400);
};

const importNewsFromRSS = async () => {
  try {
    const res = await fetch(
      "https://api.rss2json.com/v1/api.json?rss_url=https://www.jeuxvideo.com/rss/rss.xml"
    );

    const data = await res.json();

    const news = data.items.slice(0, 10);

    for (const item of news) {
      await addDoc(collection(db, "news"), {
        title: item.title,
        summary: item.description,
        url: item.link,
        date: item.pubDate,
        source: "JeuxVideo.com",
        image: item.thumbnail || "",
        createdAt: new Date(),
      });
    }

    alert("Actus importées !");
  } catch (error) {
  if (isAbortError(error)) return;

  console.error("Erreur import RSS :", error);
  alert("Erreur import RSS");
}
};

/* -------------------- HELPERS -------------------- */

/* ==================== HELPERS / FORMATAGE ==================== */

function formatReleaseDate(dateStr) {
  if (!dateStr) return "Date inconnue";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getMonthKey(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${month}`;
}

function formatMonthLabel(monthKey) {
  if (!monthKey) return "Tous les mois";
  const [year, month] = monthKey.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

function averageDetailedRating(game) {
  const values = [
    clampRating(game.ratingGraphics),
    clampRating(game.ratingGameplay),
    clampRating(game.ratingStory),
    clampRating(game.ratingSound),
    clampRating(game.ratingLongevity),
  ].filter((v) => v > 0);

  if (values.length === 0) return 0;
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  return Math.round(avg * 10) / 10;
}

const BASE_GAME_RATING_FIELDS = [
  { key: "ratingGraphics", label: "Graphismes", hint: "Direction visuelle, technique, lisibilité" },
  { key: "ratingGameplay", label: "Gameplay", hint: "Feeling, rythme, plaisir manette en main" },
  { key: "ratingStory", label: "Histoire", hint: "Écriture, personnages, mise en scène" },
  { key: "ratingSound", label: "Audio", hint: "Sound design, doublage, ambiance sonore" },
  { key: "ratingLongevity", label: "Durée de vie", hint: "Contenu, rejouabilité, rythme global" },
];

function getGameRatingBreakdown(game = {}) {
  return BASE_GAME_RATING_FIELDS.map((field) => ({
    ...field,
    value: clampRating(game[field.key]),
  }));
}

function getGameDetailedRatingSummary(game = {}) {
  const baseFields = getGameRatingBreakdown(game);
  const ratedBaseFields = baseFields.filter((field) => field.value > 0);
  const contextualFields = getContextualRatingFields(game).map((field) => ({
    ...field,
    value: clampRating(game[field.key]),
  }));
  const ratedContextualFields = contextualFields.filter((field) => field.value > 0);
  const rankedFields = [...ratedBaseFields, ...ratedContextualFields].sort(
    (a, b) => b.value - a.value
  );

  return {
    baseFields,
    contextualFields,
    ratedBaseFields,
    ratedContextualFields,
    bestField: rankedFields[0],
    completion: baseFields.length
      ? Math.round((ratedBaseFields.length / baseFields.length) * 100)
      : 0,
  };
}

/* ==================== SONS ==================== */

function playBootSoundNow() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;

    const ctx = new AudioContextClass();
    const master = ctx.createGain();
    master.gain.value = 0.08;
    master.connect(ctx.destination);

    const now = ctx.currentTime + 0.02;

    const notes = [
      { freq: 196, start: 0.0, dur: 0.45, type: "sine" },
      { freq: 293.66, start: 0.12, dur: 0.55, type: "triangle" },
      { freq: 392, start: 0.34, dur: 0.8, type: "triangle" },
      { freq: 587.33, start: 0.68, dur: 1.0, type: "sine" },
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = note.type;
      osc.frequency.setValueAtTime(note.freq, now + note.start);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2200, now + note.start);

      gain.gain.setValueAtTime(0.0001, now + note.start);
      gain.gain.exponentialRampToValueAtTime(0.22, now + note.start + 0.08);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + note.start + note.dur
      );

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);

      osc.start(now + note.start);
      osc.stop(now + note.start + note.dur);
    });

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 2500);

    return true;
  } catch (e) {
    console.error("Erreur son démarrage :", e);
    return false;
  }
}

  /* -------------------- BADGES V2 -------------------- */

/* ==================== BADGES ==================== */

const BADGES = [
  { id: "first_game", icon: "🎮", name: "Premier pas", desc: "Ajouter 1 jeu", rarity: "common", condition: (s) => s.total >= 1 },
  { id: "collector_10", icon: "📚", name: "Collectionneur", desc: "Avoir 10 jeux", rarity: "common", condition: (s) => s.total >= 10 },
  { id: "collector_25", icon: "🗂️", name: "Archiviste", desc: "Avoir 25 jeux", rarity: "rare", condition: (s) => s.total >= 25 },
  { id: "collector_50", icon: "🏛️", name: "Bibliothèque vivante", desc: "Avoir 50 jeux", rarity: "epic", condition: (s) => s.total >= 50 },

  { id: "finisher_5", icon: "🏁", name: "Finisseur", desc: "Terminer 5 jeux", rarity: "common", condition: (s) => s.finished >= 5 },
  { id: "finisher_15", icon: "🔥", name: "Joueur sérieux", desc: "Terminer 15 jeux", rarity: "rare", condition: (s) => s.finished >= 15 },
  { id: "finisher_30", icon: "⚔️", name: "Machine à finir", desc: "Terminer 30 jeux", rarity: "epic", condition: (s) => s.finished >= 30 },

  { id: "favorites_3", icon: "💖", name: "Coup de cœur", desc: "Avoir 3 favoris", rarity: "common", condition: (s) => s.favorites >= 3 },
  { id: "favorites_8", icon: "💜", name: "Passionné", desc: "Avoir 8 favoris", rarity: "rare", condition: (s) => s.favorites >= 8 },
  { id: "favorites_15", icon: "🌟", name: "Fan ultime", desc: "Avoir 15 favoris", rarity: "epic", condition: (s) => s.favorites >= 15 },

  { id: "reviews_3", icon: "✍️", name: "Critique", desc: "Écrire 3 avis", rarity: "common", condition: (s) => s.reviews >= 3 },
  { id: "reviews_10", icon: "📝", name: "Testeur pro", desc: "Écrire 10 avis", rarity: "rare", condition: (s) => s.reviews >= 10 },
  { id: "reviews_25", icon: "📜", name: "Plume légendaire", desc: "Écrire 25 avis", rarity: "legendary", condition: (s) => s.reviews >= 25 },

  { id: "hours_50", icon: "⏱️", name: "Session longue", desc: "Cumuler 50 h", rarity: "common", condition: (s) => s.hours >= 50 },
  { id: "hours_100", icon: "⏳", name: "Marathon", desc: "Cumuler 100 h", rarity: "rare", condition: (s) => s.hours >= 100 },
  { id: "hours_250", icon: "🌙", name: "No-life", desc: "Cumuler 250 h", rarity: "epic", condition: (s) => s.hours >= 250 },
  { id: "hours_500", icon: "👑", name: "Légende vivante", desc: "Cumuler 500 h", rarity: "legendary", condition: (s) => s.hours >= 500 },

  { id: "level_10", icon: "⭐", name: "Joueur confirmé", desc: "Atteindre le niveau 10", rarity: "common", condition: (s) => s.level >= 10 },
  { id: "level_25", icon: "🥈", name: "Expert", desc: "Atteindre le niveau 25", rarity: "rare", condition: (s) => s.level >= 25 },
  { id: "level_50", icon: "🥇", name: "Légende", desc: "Atteindre le niveau 50", rarity: "epic", condition: (s) => s.level >= 50 },
  { id: "level_100", icon: "💎", name: "Suprême", desc: "Atteindre le niveau 100", rarity: "legendary", condition: (s) => s.level >= 100 },
  { id: "hardware_3", icon: "\uD83E\uDDF0", name: "Setup lance", desc: "Posseder 3 materiels", rarity: "common", condition: (s) => s.hardware >= 3 },
  { id: "hardware_8", icon: "\uD83D\uDEE0\uFE0F", name: "Coin gaming", desc: "Posseder 8 materiels", rarity: "rare", condition: (s) => s.hardware >= 8 },
  { id: "hardware_15", icon: "\uD83C\uDFC6", name: "Salle d'arcade", desc: "Posseder 15 materiels", rarity: "epic", condition: (s) => s.hardware >= 15 },

  { id: "consoles_2", icon: "\uD83D\uDDA5\uFE0F", name: "Multi-console", desc: "Posseder 2 consoles", rarity: "common", condition: (s) => s.consoles >= 2 },
  { id: "consoles_5", icon: "\uD83C\uDF10", name: "Generation ouverte", desc: "Posseder 5 consoles", rarity: "rare", condition: (s) => s.consoles >= 5 },
  { id: "consoles_10", icon: "\uD83D\uDE80", name: "Musee personnel", desc: "Posseder 10 consoles", rarity: "legendary", condition: (s) => s.consoles >= 10 },

  { id: "controllers_3", icon: "\uD83D\uDD79\uFE0F", name: "Pret pour le multi", desc: "Posseder 3 manettes", rarity: "common", condition: (s) => s.controllers >= 3 },
  { id: "controllers_6", icon: "\uD83C\uDFAF", name: "Maitre des commandes", desc: "Posseder 6 manettes", rarity: "rare", condition: (s) => s.controllers >= 6 },

  { id: "audio_2", icon: "\uD83C\uDFA7", name: "Immersion", desc: "Posseder 2 equipements audio", rarity: "common", condition: (s) => s.audio >= 2 },
  { id: "top_console", icon: "\u2728", name: "Console coup de coeur", desc: "Noter une console a 9/10", rarity: "epic", condition: (s) => s.topConsoleRating >= 9 },

  { id: "quiz_first", icon: "?", name: "Premier checkpoint", desc: "Repondre a 1 quiz hebdo", rarity: "common", condition: (s) => s.quizAnswered >= 1 },
  { id: "quiz_5", icon: "5", name: "Memoire active", desc: "Repondre a 5 quiz hebdo", rarity: "rare", condition: (s) => s.quizAnswered >= 5 },
  { id: "quiz_streak_4", icon: "4", name: "Serie parfaite", desc: "Enchainer 4 bonnes reponses hebdomadaires", rarity: "epic", condition: (s) => s.quizBestStreak >= 4 },

  { id: "creator_checkpoint", icon: "C", name: "Createur de Checkpoint", desc: "Badge unique du createur de l'application", rarity: "creator", special: "creator", hiddenWhenLocked: true, condition: (s) => s.isCreator },

  { id: "brand_playstation_50", icon: "PS", platformFamily: "playstation", name: "Explorateur PlayStation", desc: "Jouer 50 jeux sur PlayStation", rarity: "rare", condition: (s) => s.platformFamilies.playstation >= 50 },
  { id: "brand_playstation_100", icon: "PS", platformFamily: "playstation", name: "Veteran PlayStation", desc: "Jouer 100 jeux sur PlayStation", rarity: "epic", condition: (s) => s.platformFamilies.playstation >= 100 },
  { id: "brand_playstation_200", icon: "PS", platformFamily: "playstation", name: "Heros PlayStation", desc: "Jouer 200 jeux sur PlayStation", rarity: "legendary", condition: (s) => s.platformFamilies.playstation >= 200 },
  { id: "brand_playstation_400", icon: "PS", platformFamily: "playstation", name: "Legende PlayStation", desc: "Jouer 400 jeux sur PlayStation", rarity: "mythic", condition: (s) => s.platformFamilies.playstation >= 400 },
  { id: "brand_playstation_600", icon: "PS", platformFamily: "playstation", name: "Immortel PlayStation", desc: "Jouer 600 jeux sur PlayStation", rarity: "mythic", condition: (s) => s.platformFamilies.playstation >= 600 },
  { id: "brand_playstation_700", icon: "PS", platformFamily: "playstation", name: "Legende absolue PlayStation", desc: "Jouer 700 jeux sur PlayStation", rarity: "mythic", condition: (s) => s.platformFamilies.playstation >= 700 },
  { id: "brand_playstation_800", icon: "PS", platformFamily: "playstation", name: "Divin PlayStation", desc: "Jouer 800 jeux sur PlayStation", rarity: "mythic", condition: (s) => s.platformFamilies.playstation >= 800 },
  { id: "brand_playstation_900", icon: "PS", platformFamily: "playstation", name: "Eternel PlayStation", desc: "Jouer 900 jeux sur PlayStation", rarity: "mythic", condition: (s) => s.platformFamilies.playstation >= 900 },
  { id: "brand_playstation_1000", icon: "PS", platformFamily: "playstation", name: "Omega PlayStation", desc: "Jouer 1000 jeux sur PlayStation", rarity: "mythic", condition: (s) => s.platformFamilies.playstation >= 1000 },

  { id: "brand_xbox_50", icon: "X", platformFamily: "xbox", name: "Explorateur Xbox", desc: "Jouer 50 jeux sur Xbox", rarity: "rare", condition: (s) => s.platformFamilies.xbox >= 50 },
  { id: "brand_xbox_100", icon: "X", platformFamily: "xbox", name: "Veteran Xbox", desc: "Jouer 100 jeux sur Xbox", rarity: "epic", condition: (s) => s.platformFamilies.xbox >= 100 },
  { id: "brand_xbox_200", icon: "X", platformFamily: "xbox", name: "Heros Xbox", desc: "Jouer 200 jeux sur Xbox", rarity: "legendary", condition: (s) => s.platformFamilies.xbox >= 200 },
  { id: "brand_xbox_400", icon: "X", platformFamily: "xbox", name: "Legende Xbox", desc: "Jouer 400 jeux sur Xbox", rarity: "mythic", condition: (s) => s.platformFamilies.xbox >= 400 },
  { id: "brand_xbox_600", icon: "X", platformFamily: "xbox", name: "Immortel Xbox", desc: "Jouer 600 jeux sur Xbox", rarity: "mythic", condition: (s) => s.platformFamilies.xbox >= 600 },
  { id: "brand_xbox_700", icon: "X", platformFamily: "xbox", name: "Legende absolue Xbox", desc: "Jouer 700 jeux sur Xbox", rarity: "mythic", condition: (s) => s.platformFamilies.xbox >= 700 },
  { id: "brand_xbox_800", icon: "X", platformFamily: "xbox", name: "Divin Xbox", desc: "Jouer 800 jeux sur Xbox", rarity: "mythic", condition: (s) => s.platformFamilies.xbox >= 800 },
  { id: "brand_xbox_900", icon: "X", platformFamily: "xbox", name: "Eternel Xbox", desc: "Jouer 900 jeux sur Xbox", rarity: "mythic", condition: (s) => s.platformFamilies.xbox >= 900 },
  { id: "brand_xbox_1000", icon: "X", platformFamily: "xbox", name: "Omega Xbox", desc: "Jouer 1000 jeux sur Xbox", rarity: "mythic", condition: (s) => s.platformFamilies.xbox >= 1000 },

  { id: "brand_nintendo_50", icon: "N", platformFamily: "nintendo", name: "Explorateur Nintendo", desc: "Jouer 50 jeux sur Nintendo", rarity: "rare", condition: (s) => s.platformFamilies.nintendo >= 50 },
  { id: "brand_nintendo_100", icon: "N", platformFamily: "nintendo", name: "Veteran Nintendo", desc: "Jouer 100 jeux sur Nintendo", rarity: "epic", condition: (s) => s.platformFamilies.nintendo >= 100 },
  { id: "brand_nintendo_200", icon: "N", platformFamily: "nintendo", name: "Heros Nintendo", desc: "Jouer 200 jeux sur Nintendo", rarity: "legendary", condition: (s) => s.platformFamilies.nintendo >= 200 },
  { id: "brand_nintendo_400", icon: "N", platformFamily: "nintendo", name: "Legende Nintendo", desc: "Jouer 400 jeux sur Nintendo", rarity: "mythic", condition: (s) => s.platformFamilies.nintendo >= 400 },
  { id: "brand_nintendo_600", icon: "N", platformFamily: "nintendo", name: "Immortel Nintendo", desc: "Jouer 600 jeux sur Nintendo", rarity: "mythic", condition: (s) => s.platformFamilies.nintendo >= 600 },
  { id: "brand_nintendo_700", icon: "N", platformFamily: "nintendo", name: "Legende absolue Nintendo", desc: "Jouer 700 jeux sur Nintendo", rarity: "mythic", condition: (s) => s.platformFamilies.nintendo >= 700 },
  { id: "brand_nintendo_800", icon: "N", platformFamily: "nintendo", name: "Divin Nintendo", desc: "Jouer 800 jeux sur Nintendo", rarity: "mythic", condition: (s) => s.platformFamilies.nintendo >= 800 },
  { id: "brand_nintendo_900", icon: "N", platformFamily: "nintendo", name: "Eternel Nintendo", desc: "Jouer 900 jeux sur Nintendo", rarity: "mythic", condition: (s) => s.platformFamilies.nintendo >= 900 },
  { id: "brand_nintendo_1000", icon: "N", platformFamily: "nintendo", name: "Omega Nintendo", desc: "Jouer 1000 jeux sur Nintendo", rarity: "mythic", condition: (s) => s.platformFamilies.nintendo >= 1000 },

  { id: "platform_ps5_25", icon: "PS5", platformFamily: "playstation", platformKey: "ps5", name: "Explorateur PS5", desc: "Jouer 25 jeux sur PS5", rarity: "rare", condition: (s) => s.platformCounts.ps5 >= 25 },
  { id: "platform_ps5_50", icon: "PS5", platformFamily: "playstation", platformKey: "ps5", name: "Veteran PS5", desc: "Jouer 50 jeux sur PS5", rarity: "epic", condition: (s) => s.platformCounts.ps5 >= 50 },
  { id: "platform_ps5_100", icon: "PS5", platformFamily: "playstation", platformKey: "ps5", name: "Legende PS5", desc: "Jouer 100 jeux sur PS5", rarity: "legendary", condition: (s) => s.platformCounts.ps5 >= 100 },
  { id: "platform_ps5_200", icon: "PS5", platformFamily: "playstation", platformKey: "ps5", name: "Icone PS5", desc: "Jouer 200 jeux sur PS5", rarity: "mythic", condition: (s) => s.platformCounts.ps5 >= 200 },

  { id: "platform_ps4_25", icon: "PS4", platformFamily: "playstation", platformKey: "ps4", name: "Explorateur PS4", desc: "Jouer 25 jeux sur PS4", rarity: "rare", condition: (s) => s.platformCounts.ps4 >= 25 },
  { id: "platform_ps4_50", icon: "PS4", platformFamily: "playstation", platformKey: "ps4", name: "Veteran PS4", desc: "Jouer 50 jeux sur PS4", rarity: "epic", condition: (s) => s.platformCounts.ps4 >= 50 },
  { id: "platform_ps4_100", icon: "PS4", platformFamily: "playstation", platformKey: "ps4", name: "Legende PS4", desc: "Jouer 100 jeux sur PS4", rarity: "legendary", condition: (s) => s.platformCounts.ps4 >= 100 },
  { id: "platform_ps4_200", icon: "PS4", platformFamily: "playstation", platformKey: "ps4", name: "Icone PS4", desc: "Jouer 200 jeux sur PS4", rarity: "mythic", condition: (s) => s.platformCounts.ps4 >= 200 },

  { id: "platform_ps3_25", icon: "PS3", platformFamily: "playstation", platformKey: "ps3", name: "Explorateur PS3", desc: "Jouer 25 jeux sur PS3", rarity: "rare", condition: (s) => s.platformCounts.ps3 >= 25 },
  { id: "platform_ps3_50", icon: "PS3", platformFamily: "playstation", platformKey: "ps3", name: "Veteran PS3", desc: "Jouer 50 jeux sur PS3", rarity: "epic", condition: (s) => s.platformCounts.ps3 >= 50 },
  { id: "platform_ps3_100", icon: "PS3", platformFamily: "playstation", platformKey: "ps3", name: "Legende PS3", desc: "Jouer 100 jeux sur PS3", rarity: "legendary", condition: (s) => s.platformCounts.ps3 >= 100 },
  { id: "platform_ps3_200", icon: "PS3", platformFamily: "playstation", platformKey: "ps3", name: "Icone PS3", desc: "Jouer 200 jeux sur PS3", rarity: "mythic", condition: (s) => s.platformCounts.ps3 >= 200 },

  { id: "platform_xbox_series_25", icon: "XS", platformFamily: "xbox", platformKey: "xboxSeries", name: "Explorateur Xbox Series", desc: "Jouer 25 jeux sur Xbox Series", rarity: "rare", condition: (s) => s.platformCounts.xboxSeries >= 25 },
  { id: "platform_xbox_series_50", icon: "XS", platformFamily: "xbox", platformKey: "xboxSeries", name: "Veteran Xbox Series", desc: "Jouer 50 jeux sur Xbox Series", rarity: "epic", condition: (s) => s.platformCounts.xboxSeries >= 50 },
  { id: "platform_xbox_series_100", icon: "XS", platformFamily: "xbox", platformKey: "xboxSeries", name: "Legende Xbox Series", desc: "Jouer 100 jeux sur Xbox Series", rarity: "legendary", condition: (s) => s.platformCounts.xboxSeries >= 100 },
  { id: "platform_xbox_series_200", icon: "XS", platformFamily: "xbox", platformKey: "xboxSeries", name: "Icone Series", desc: "Jouer 200 jeux sur Xbox Series", rarity: "mythic", condition: (s) => s.platformCounts.xboxSeries >= 200 },

  { id: "platform_xbox_one_25", icon: "XO", platformFamily: "xbox", platformKey: "xboxOne", name: "Explorateur Xbox One", desc: "Jouer 25 jeux sur Xbox One", rarity: "rare", condition: (s) => s.platformCounts.xboxOne >= 25 },
  { id: "platform_xbox_one_50", icon: "XO", platformFamily: "xbox", platformKey: "xboxOne", name: "Veteran Xbox One", desc: "Jouer 50 jeux sur Xbox One", rarity: "epic", condition: (s) => s.platformCounts.xboxOne >= 50 },
  { id: "platform_xbox_one_100", icon: "XO", platformFamily: "xbox", platformKey: "xboxOne", name: "Legende Xbox One", desc: "Jouer 100 jeux sur Xbox One", rarity: "legendary", condition: (s) => s.platformCounts.xboxOne >= 100 },
  { id: "platform_xbox_one_200", icon: "XO", platformFamily: "xbox", platformKey: "xboxOne", name: "Icone Xbox One", desc: "Jouer 200 jeux sur Xbox One", rarity: "mythic", condition: (s) => s.platformCounts.xboxOne >= 200 },

  { id: "platform_switch_25", icon: "SW", platformFamily: "nintendo", platformKey: "switch", name: "Explorateur Switch", desc: "Jouer 25 jeux sur Switch", rarity: "rare", condition: (s) => s.platformCounts.switch >= 25 },
  { id: "platform_switch_50", icon: "SW", platformFamily: "nintendo", platformKey: "switch", name: "Veteran Switch", desc: "Jouer 50 jeux sur Switch", rarity: "epic", condition: (s) => s.platformCounts.switch >= 50 },
  { id: "platform_switch_100", icon: "SW", platformFamily: "nintendo", platformKey: "switch", name: "Legende Switch", desc: "Jouer 100 jeux sur Switch", rarity: "legendary", condition: (s) => s.platformCounts.switch >= 100 },
  { id: "platform_switch_200", icon: "SW", platformFamily: "nintendo", platformKey: "switch", name: "Icone Switch", desc: "Jouer 200 jeux sur Switch", rarity: "mythic", condition: (s) => s.platformCounts.switch >= 200 },

  { id: "platform_pc_25", icon: "PC", platformFamily: "pc", platformKey: "pc", name: "Explorateur PC", desc: "Jouer 25 jeux sur PC", rarity: "rare", condition: (s) => s.platformCounts.pc >= 25 },
  { id: "platform_pc_50", icon: "PC", platformFamily: "pc", platformKey: "pc", name: "Veteran PC", desc: "Jouer 50 jeux sur PC", rarity: "epic", condition: (s) => s.platformCounts.pc >= 50 },
  { id: "platform_pc_100", icon: "PC", platformFamily: "pc", platformKey: "pc", name: "Legende PC", desc: "Jouer 100 jeux sur PC", rarity: "legendary", condition: (s) => s.platformCounts.pc >= 100 },
  { id: "platform_pc_200", icon: "PC", platformFamily: "pc", platformKey: "pc", name: "Machine de guerre", desc: "Jouer 200 jeux sur PC", rarity: "mythic", condition: (s) => s.platformCounts.pc >= 200 },
];

const BADGE_ICON_COMPONENTS = {
  first_game: Gamepad2,
  collector_10: BookOpen,
  collector_25: Archive,
  collector_50: Landmark,
  finisher_5: CheckCircle2,
  finisher_15: Flag,
  finisher_30: Trophy,
  favorites_3: Heart,
  favorites_8: Heart,
  favorites_15: StarIcon,
  reviews_3: PenLine,
  reviews_10: Newspaper,
  reviews_25: ScrollText,
  hours_50: Timer,
  hours_100: Clock3,
  hours_250: Moon,
  hours_500: Crown,
  level_10: StarIcon,
  level_25: Medal,
  level_50: Trophy,
  level_100: Gem,
  hardware_3: Package,
  hardware_8: Wrench,
  hardware_15: Joystick,
  consoles_2: Monitor,
  consoles_5: Puzzle,
  consoles_10: Landmark,
  controllers_3: Gamepad2,
  controllers_6: Target,
  audio_2: Headphones,
  top_console: Sparkles,
  quiz_first: Target,
  quiz_5: Puzzle,
  quiz_streak_4: Trophy,
};

const BADGE_BRAND_LOGOS = {
  playstation: "/images/brands/sony.png",
  xbox: "/images/brands/xbox.png",
  nintendo: "/images/brands/nintendo.png",
  pc: "/images/brands/pc.png",
};

const CREATOR_HANDLES = ["checkpoint"];

function isCreatorProfile(profile = {}) {
  return CREATOR_HANDLES.includes(normalizeHandle(profile.handle || ""));
}

function BadgeVisualIcon({ badge, size = 20 }) {
  if (badge?.special === "creator") {
    return <span className="badge-creator-mark">C</span>;
  }

  if (badge?.id?.startsWith("brand_") && BADGE_BRAND_LOGOS[badge.platformFamily]) {
    return (
      <img
        src={BADGE_BRAND_LOGOS[badge.platformFamily]}
        alt=""
        className="badge-brand-logo"
      />
    );
  }

  if (badge?.platformFamily) {
    return <span className={`badge-platform-mark ${badge.platformFamily}`}>{badge.icon}</span>;
  }

  const Icon = BADGE_ICON_COMPONENTS[badge?.id];

  if (Icon) {
    return <Icon size={size} strokeWidth={2.35} />;
  }

  return <span>{badge?.icon}</span>;
}

function getFeaturedBadgeFromSelection(badges = [], featuredBadgeId = "") {
  const unlockedBadges = badges.filter((badge) => badge.unlocked);
  const exactBadge = unlockedBadges.find((badge) => badge.id === featuredBadgeId);

  if (exactBadge) return exactBadge;

  const legacyBrandMatch = featuredBadgeId.match(/^platform_(playstation|xbox|nintendo)_(\d+)$/);

  if (legacyBrandMatch) {
    const [, family, target] = legacyBrandMatch;
    const directBrandBadge = unlockedBadges.find(
      (badge) => badge.id === `brand_${family}_${target}`
    );

    if (directBrandBadge) return directBrandBadge;

    return unlockedBadges
      .filter((badge) => badge.id.startsWith(`brand_${family}_`))
      .sort((a, b) => Number(b.id.split("_").at(-1)) - Number(a.id.split("_").at(-1)))[0];
  }

  return null;
}

function getPlatformFamily(platform = "") {
  const normalized = platform.toLowerCase();

  if (
    normalized.includes("playstation") ||
    normalized.includes("ps vita") ||
    normalized.includes("psp") ||
    /\bps[1-5]\b/.test(normalized)
  ) {
    return "playstation";
  }

  if (normalized.includes("xbox")) {
    return "xbox";
  }

  if (
    normalized.includes("nintendo") ||
    normalized.includes("switch") ||
    normalized.includes("wii") ||
    normalized.includes("gamecube") ||
    normalized.includes("game boy") ||
    normalized.includes("gameboy") ||
    normalized.includes("ds") ||
    normalized.includes("3ds")
  ) {
    return "nintendo";
  }

  if (
    normalized === "pc" ||
    normalized.includes("windows") ||
    normalized.includes("macos") ||
    normalized.includes("linux")
  ) {
    return "pc";
  }

  return "";
}

function getPlatformKey(platform = "") {
  const normalized = platform.toLowerCase();

  if (normalized.includes("playstation 5") || /\bps5\b/.test(normalized)) {
    return "ps5";
  }

  if (normalized.includes("playstation 4") || /\bps4\b/.test(normalized)) {
    return "ps4";
  }

  if (normalized.includes("playstation 3") || /\bps3\b/.test(normalized)) {
    return "ps3";
  }

  if (normalized.includes("xbox series")) {
    return "xboxSeries";
  }

  if (normalized.includes("xbox one")) {
    return "xboxOne";
  }

  if (normalized.includes("switch")) {
    return "switch";
  }

  if (
    normalized === "pc" ||
    normalized.includes("windows") ||
    normalized.includes("macos") ||
    normalized.includes("linux")
  ) {
    return "pc";
  }

  return "";
}

function isGameEligibleForPlatformBadge(game = {}) {
  const status = String(game.status || "").toLowerCase();

  return !status.includes("wishlist");
}

function getPlatformFamilyCounts(games = []) {
  const counts = {
    playstation: 0,
    xbox: 0,
    nintendo: 0,
    pc: 0,
  };

  games
    .filter(isGameFinishedStatus)
    .forEach((game) => {
      const platforms =
        game.playedPlatforms?.length > 0
          ? game.playedPlatforms
          : game.platformNames || [];

      const families = new Set(
        platforms
          .map(getPlatformFamily)
          .filter(Boolean)
      );

      families.forEach((family) => {
        counts[family] += 1;
      });
    });

  return counts;
}

function getPlatformFamilyBadgeCounts(games = []) {
  const counts = {
    playstation: 0,
    xbox: 0,
    nintendo: 0,
    pc: 0,
  };

  games
    .filter(isGameEligibleForPlatformBadge)
    .forEach((game) => {
      const platforms =
        game.playedPlatforms?.length > 0
          ? game.playedPlatforms
          : game.platformNames || [];

      const families = new Set(
        platforms
          .map(getPlatformFamily)
          .filter(Boolean)
      );

      families.forEach((family) => {
        counts[family] += 1;
      });
    });

  return counts;
}

function getPlatformBadgeCounts(games = []) {
  const counts = {
    ps5: 0,
    ps4: 0,
    ps3: 0,
    xboxSeries: 0,
    xboxOne: 0,
    switch: 0,
    pc: 0,
  };

  games
    .filter(isGameEligibleForPlatformBadge)
    .forEach((game) => {
      const platforms =
        game.playedPlatforms?.length > 0
          ? game.playedPlatforms
          : game.platformNames || [];

      const platformKeys = new Set(
        platforms
          .map(getPlatformKey)
          .filter(Boolean)
      );

      platformKeys.forEach((platformKey) => {
        counts[platformKey] += 1;
      });
    });

  return counts;
}

function calculateBadgeStats(
  games,
  level,
  hardware = [],
  socialProfile = DEFAULT_SOCIAL_PROFILE,
  quizProgress = DEFAULT_WEEKLY_QUIZ_PROGRESS
) {
  const currentHardware = hardware.filter((item) => {
    const status = getNormalizedStatus(item?.status || "");
    return status.includes("poss") || status.includes("reparer");
  });

  return {
    total: games.length,
    finished: games.filter(isGameFinishedStatus).length,
    favorites: games.filter(g => g.favorite).length,
    reviews: games.filter(g => g.review && g.review.length > 10).length,
    hours: games.reduce((sum, g) => sum + (Number(g.playtime) || 0), 0),
    level,
    hardware: currentHardware.length,
    consoles: currentHardware.filter((item) => item.type === "console").length,
    controllers: currentHardware.filter((item) => item.type === "controller").length,
    audio: currentHardware.filter((item) => item.type === "audio").length,
    topConsoleRating: Math.max(
      0,
      ...currentHardware
        .filter((item) => item.type === "console")
        .map((item) => Number(item.rating) || 0)
    ),
    platformFamilies: getPlatformFamilyBadgeCounts(games),
    platformCounts: getPlatformBadgeCounts(games),
    quizAnswered: Object.keys(quizProgress.answers || {}).length,
    quizBestStreak: quizProgress.bestStreak || 0,
    isCreator: isCreatorProfile(socialProfile),
  };
}

function getUnlockedBadgesV2(
  games,
  level,
  hardware = [],
  socialProfile = DEFAULT_SOCIAL_PROFILE,
  quizProgress = DEFAULT_WEEKLY_QUIZ_PROGRESS
) {
  const stats = calculateBadgeStats(games, level, hardware, socialProfile, quizProgress);
  return BADGES.map(b => ({
    ...b,
    unlocked: b.condition(stats)
  }));
}

const UNLOCKED_BADGES_STORAGE_KEY = "checkpoint-unlocked-badges";

function readStoredUnlockedBadgeIds() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(UNLOCKED_BADGES_STORAGE_KEY) || "[]"
    );

    return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
  } catch (error) {
    console.warn("Badges sauvegardes illisibles, reinitialisation.", error);
    return [];
  }
}

function storeUnlockedBadgeIds(ids) {
  localStorage.setItem(
    UNLOCKED_BADGES_STORAGE_KEY,
    JSON.stringify([...new Set(ids.filter(Boolean).map(String))])
  );
}

function getBadgeProgress(badge, stats) {
  if (badge.id.startsWith("collector_")) {
    return { current: stats.total, target: Number(badge.id.split("_")[1]) };
  }

  if (badge.id.startsWith("finisher_")) {
    return { current: stats.finished, target: Number(badge.id.split("_")[1]) };
  }

  if (badge.id.startsWith("favorites_")) {
    return { current: stats.favorites, target: Number(badge.id.split("_")[1]) };
  }

  if (badge.id.startsWith("reviews_")) {
    return { current: stats.reviews, target: Number(badge.id.split("_")[1]) };
  }

  if (badge.id === "quiz_first") {
    return { current: stats.quizAnswered, target: 1 };
  }

  if (badge.id === "quiz_5") {
    return { current: stats.quizAnswered, target: 5 };
  }

  if (badge.id === "quiz_streak_4") {
    return { current: stats.quizBestStreak, target: 4 };
  }

  if (badge.id.startsWith("hours_")) {
    return { current: stats.hours, target: Number(badge.id.split("_")[1]) };
  }

  if (badge.id.startsWith("level_")) {
    return { current: stats.level, target: Number(badge.id.split("_")[1]) };
  }

  if (badge.id.startsWith("hardware_")) {
    return { current: stats.hardware, target: Number(badge.id.split("_")[1]) };
  }

  if (badge.id.startsWith("consoles_")) {
    return { current: stats.consoles, target: Number(badge.id.split("_")[1]) };
  }

  if (badge.id.startsWith("controllers_")) {
    return { current: stats.controllers, target: Number(badge.id.split("_")[1]) };
  }

  if (badge.id.startsWith("audio_")) {
    return { current: stats.audio, target: Number(badge.id.split("_")[1]) };
  }

  if (badge.id === "top_console") {
    return { current: stats.topConsoleRating, target: 9 };
  }

  if (badge.id.startsWith("brand_")) {
    const family = badge.platformFamily || badge.id.split("_")[1];
    const target = Number(badge.id.split("_").at(-1));
    return { current: stats.platformFamilies[family] || 0, target };
  }

  if (badge.id.startsWith("platform_")) {
    if (badge.platformKey) {
      const target = Number(badge.id.split("_").at(-1));
      return { current: stats.platformCounts[badge.platformKey] || 0, target };
    }

    const family = badge.platformFamily || badge.id.split("_")[1];
    const target = Number(badge.id.split("_").at(-1));
    return { current: stats.platformFamilies[family] || 0, target };
  }

  return null;
}

function FeaturedBadgePill({ badge, compact = false }) {
  if (!badge) return null;

  return (
    <span
      className={`featured-badge-pill ${badge.rarity} ${
        badge.platformFamily ? `platform-${badge.platformFamily}` : ""
      } ${compact ? "compact" : ""}`}
    >
      <span className="featured-badge-gem">
        <BadgeVisualIcon badge={badge} size={15} />
      </span>
      {!compact && <span>{badge.name}</span>}
    </span>
  );
}

/* -------------------- XP SYSTEM -------------------- */

/* ==================== SYSTÈME XP & NIVEAUX ==================== */

const BASE_XP = 100;

const PROGRESS_OPTIONS = [
  { id: "not_started", label: "Non commencé", icon: "⬜", xp: 0 },
  { id: "tried", label: "Juste essayé", icon: "🎮", xp: 25 },
  { id: "playing", label: "En cours", icon: "▶️", xp: 60 },
  { id: "deep_play", label: "Bien avancé", icon: "🔥", xp: 100 },
  { id: "completed", label: "Terminé", icon: "🏆", xp: 150 },
];

const PLAYTIME_RANGE_OPTIONS = [
  { id: "none", label: "Non renseigné", xp: 0 },
  { id: "under_2", label: "Moins de 2h", xp: 5 },
  { id: "2_5", label: "2 à 5h", xp: 10 },
  { id: "5_15", label: "5 à 15h", xp: 20 },
  { id: "15_40", label: "15 à 40h", xp: 35 },
  { id: "40_80", label: "40 à 80h", xp: 50 },
  { id: "80_150", label: "80 à 150h", xp: 70 },
  { id: "150_plus", label: "150h+", xp: 90 },
  { id: "too_much", label: "Beaucoup trop joué 😅", xp: 110 },
];

function getProgressLabel(progressStatus) {
  return (
    PROGRESS_OPTIONS.find((option) => option.id === progressStatus)?.label ||
    "Non commencé"
  );
}

function getPlaytimeRangeLabel(playtimeRange) {
  return (
    PLAYTIME_RANGE_OPTIONS.find((option) => option.id === playtimeRange)?.label ||
    "Non renseigné"
  );
}

function getProgressXP(progressStatus) {
  return (
    PROGRESS_OPTIONS.find((option) => option.id === progressStatus)?.xp || 0
  );
}

function getPlaytimeRangeXP(playtimeRange) {
  return (
    PLAYTIME_RANGE_OPTIONS.find((option) => option.id === playtimeRange)?.xp || 0
  );
}

function getBonusXP(game) {
  let bonus = 0;
  if (game.favorite) bonus += 25;
  if (getGameRating(game) >= 9) bonus += 15;
  if (game.review && game.review.trim().length > 20) bonus += 20;
  if (averageDetailedRating(game) >= 9) bonus += 20;
  return bonus;
}

function calculateXP(game) {
  return (
    BASE_XP +
    getProgressXP(
      game.progressStatus || (isGameFinishedStatus(game) ? "completed" : "not_started")
    ) +
    getPlaytimeRangeXP(game.playtimeRange || "none") +
    0 +
    getBonusXP(game)
  );
}

function getConsoleXPStats(games) {
  const stats = {};

  games
    .filter(isGameFinishedStatus)
    .forEach((game) => {
      const playedPlatforms =
        game.playedPlatforms?.length > 0
          ? game.playedPlatforms
          : [];

      playedPlatforms.forEach((platform) => {
        if (!stats[platform]) {
          stats[platform] = {
            platform,
            games: 0,
            xp: 0,
          };
        }

        stats[platform].games += 1;
        stats[platform].xp += calculateXP(game);
      });
    });

  return Object.values(stats).sort((a, b) => b.xp - a.xp);
}

function getLevel(totalXP) {
  let level = 1;
  let xpNeeded = 180;
  let xp = totalXP;

  while (xp >= xpNeeded && level < 100) {
    xp -= xpNeeded;
    level++;
    xpNeeded = Math.floor(xpNeeded * 1.08);
  }

  if (level >= 100) return 100;
  return level;
}

function getProgress(totalXP) {
  let level = 1;
  let xpNeeded = 180;
  let xp = totalXP;

  while (xp >= xpNeeded && level < 100) {
    xp -= xpNeeded;
    level++;
    xpNeeded = Math.floor(xpNeeded * 1.08);
  }

  if (level >= 100) {
    return {
      currentXP: xpNeeded,
      xpToNext: xpNeeded,
      percent: 100,
    };
  }

  return {
    currentXP: xp,
    xpToNext: xpNeeded,
    percent: Math.floor((xp / xpNeeded) * 100),
  };
}

function getRankTitle(level) {
  if (level >= 100) return "Suprême";
  if (level >= 90) return "Légende V";
  if (level >= 80) return "Légende IV";
  if (level >= 70) return "Légende III";
  if (level >= 60) return "Légende II";
  if (level >= 50) return "Légende I";
  if (level >= 40) return "Maître";
  if (level >= 30) return "Expert";
  if (level >= 20) return "Confirmé";
  if (level >= 10) return "Joueur";
  return "Débutant";
}

const RANKS = [
  { min: 1, max: 9, title: "Débutant" },
  { min: 10, max: 19, title: "Joueur" },
  { min: 20, max: 29, title: "Confirmé" },
  { min: 30, max: 39, title: "Expert" },
  { min: 40, max: 49, title: "Maître" },
  { min: 50, max: 59, title: "Légende I" },
  { min: 60, max: 69, title: "Légende II" },
  { min: 70, max: 79, title: "Légende III" },
  { min: 80, max: 89, title: "Légende IV" },
  { min: 90, max: 99, title: "Légende V" },
  { min: 100, max: 100, title: "Suprême" },
];

function getSuggestedDifficulty(game) {
  const genres = (game.genres || []).map((g) => g.name.toLowerCase());
  const tags = (game.tags || []).map((t) => t.name.toLowerCase());
  const text = [...genres, ...tags].join(" ");

  if (
    text.includes("souls-like") ||
    text.includes("soulslike") ||
    text.includes("difficult") ||
    text.includes("hardcore")
  ) {
    return "hardcore";
  }

  if (
    text.includes("roguelike") ||
    text.includes("rogue-lite") ||
    text.includes("roguelite") ||
    text.includes("strategy") ||
    text.includes("tactical") ||
    text.includes("survival horror")
  ) {
    return "hard";
  }

  if (
    text.includes("casual") ||
    text.includes("family") ||
    text.includes("party") ||
    text.includes("simulation") ||
    text.includes("life sim")
  ) {
    return "casual";
  }

  return "normal";
}

function difficultyLabel(value) {
  switch (value) {
    case "casual":
      return "Casual";
    case "normal":
      return "Normal";
    case "hard":
      return "Exigeant";
    case "hardcore":
      return "Hardcore";
    default:
      return "Normal";
  }
}

/* -------------------- SMALL UI -------------------- */

/* ==================== COMPOSANTS UI DE BASE ==================== */

function Toast({ message }) {
  if (!message) return null;
  return <div className="toast">{message}</div>;
}

function BadgeUnlockToast({ badge }) {
  if (!badge) return null;

  return (
    <div className={`badge-unlock-toast ${badge.rarity}`}>
      <div className="badge-unlock-icon">
        <BadgeVisualIcon badge={badge} size={30} />
      </div>
      <div>
        <div className="badge-unlock-kicker">Badge débloqué</div>
        <div className="badge-unlock-name">{badge.name}</div>
        <div className="badge-unlock-desc">{badge.desc}</div>
      </div>
    </div>
  );
}

function Loader({ text = "Chargement..." }) {
  return (
    <div className="loader-wrap">
      <div className="loader-spinner" />
      <div className="loader-text">{text}</div>
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">✦</div>
      <div className="empty-state-title">{title}</div>
      {subtitle && <div className="empty-state-subtitle">{subtitle}</div>}
    </div>
  );
}

const playClick = () => {
  playSound("click");
};

function BottomTabs({ activeTab, setActiveTab, soundStyle }) {
  const tabs = [
  { id: "home", Icon: Home, label: "Accueil" },
  { id: "news", Icon: Newspaper, label: "Actu" },
  { id: "search", Icon: Search, label: "Recherche" },
  { id: "upcoming", Icon: CalendarDays, label: "Sorties" },
  { id: "deals", Icon: Sparkles, label: "Promos" },
  { id: "live", Icon: Radio, label: "Live" },
  { id: "social", Icon: Users, label: "Social" },
  { id: "library", Icon: Library, label: "Bibliothèque" },
  { id: "series", Icon: Puzzle, label: "Séries" },
  { id: "hardware", Icon: Joystick, label: "Matériel" },
  { id: "favorites", Icon: Heart, label: "Favoris" },
  { id: "top5", Icon: Trophy, label: "Top 5" },
  { id: "profile", Icon: Medal, label: "Profil" },
  { id: "options", Icon: Settings, label: "Options" },
  ];

  return (
    <div className="bottom-tabs">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => {
              playSound("click", soundStyle);
              setActiveTab(tab.id);
            }}
          type="button"
        >
          <span className="tab-icon">
            <tab.Icon size={20} strokeWidth={2.4} />
          </span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

function XPCard({ totalXP, level, title, progress }) {
  return (
    <div className="xp-card">
      <div className="xp-top">
        <div>
          <div className="xp-level">Niveau {level}</div>
          <div className="xp-title">{title}</div>
        </div>
        <div className="xp-total">{totalXP} XP</div>
      </div>

      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${progress.percent}%` }} />
      </div>

      <div className="xp-bottom">
        {level >= 100
          ? "Rang maximal atteint"
          : `${progress.currentXP} / ${progress.xpToNext} XP avant le niveau suivant`}
      </div>
    </div>
  );
}

function XPCardCompact({ totalXP, level, title, progress }) {
  return (
    <div className="xp-card compact">
      <div className="xp-top compact">
        <div className="xp-compact-left">
          <span className="xp-level compact">Nv {level}</span>
          <span className="xp-title compact">{title}</span>
        </div>
        <div className="xp-total compact">{totalXP} XP</div>
      </div>

      <div className="xp-bar compact">
        <div className="xp-fill" style={{ width: `${progress.percent}%` }} />
      </div>
    </div>
  );
}

function StatsBarCompact({ total, finished, favorites }) {
  return (
    <div className="stats-grid compact">
      <div className="stat-card compact">
        <div className="stat-value">{total}</div>
        <div className="stat-label">Jeux</div>
      </div>

      <div className="stat-card compact">
        <div className="stat-value">{finished}</div>
        <div className="stat-label">Terminés</div>
      </div>

      <div className="stat-card compact">
        <div className="stat-value">{favorites}</div>
        <div className="stat-label">Favoris</div>
      </div>
    </div>
  );
}

/* -------------------- SEARCH CARD -------------------- */

/* ==================== RECHERCHE ==================== */

function SearchResultCard({ game, games, onAdd, onWishlist, isOwned, onOpenSearchDetail }) {
  
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeState, setSwipeState] = useState("");

  const buildGamePayload = (status) => ({
    rawgId: game.id,
    name: game.name,
    rating: 0,
    favorite: false,
    image: game.background_image || "",
    status,
    released: game.released || "",
    platformNames: game.platforms?.map((p) => p.platform.name) || [],
    genreNames: game.genres?.map((g) => g.name) || [],
    playtime: game.playtime || null,
    difficulty: getSuggestedDifficulty(game),
    progressStatus: status === "wishlist" ? "not_started" : "not_started",
    playtimeRange: "none",
    review: "",
    ratingGraphics: 0,
    ratingGameplay: 0,
    ratingStory: 0,
    ratingSound: 0,
    ostRating: 0,
    ratingLongevity: 0,
  });

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
    setSwipeState("");
  };

  const handleTouchMove = (e) => {
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    const nextX = Math.max(Math.min(deltaX, 140), -140);
    setTranslateX(nextX);

    if (nextX > 70) setSwipeState("right-ready");
    else if (nextX < -70) setSwipeState("left-ready");
    else setSwipeState("");
  };

  const handleTouchEnd = async () => {
    setIsDragging(false);

    if (translateX > 100) {
      if (navigator.vibrate) navigator.vibrate(25);
      setTranslateX(140);
      setSwipeState("success-right");
      await onWishlist(buildGamePayload("wishlist"));
      setTimeout(() => {
        setTranslateX(0);
        setSwipeState("");
      }, 220);
      return;
    }

    if (translateX < -100) {
      if (navigator.vibrate) navigator.vibrate(25);
      setTranslateX(-140);
      setSwipeState("success-left");
      await onAdd(buildGamePayload("collection"));
      setTimeout(() => {
        setTranslateX(0);
        setSwipeState("");
      }, 220);
      return;
    }

    setTranslateX(0);
    setSwipeState("");
  };

  const existingGame = games.find(
  (g) =>
    g.rawgId === game.id ||
    g.name.toLowerCase() === game.name.toLowerCase()
  );

  return (
    <div className="swipe-wrapper">
      <div
        className={`swipe-bg swipe-bg-wishlist ${
          translateX > 60 ? "visible" : ""
        } ${swipeState === "success-right" ? "confirmed" : ""}`}
      >
        <div className="swipe-big-icon">
          <BookmarkPlus size={58} />
        </div>
      </div>

      <div
        className={`swipe-bg-left swipe-bg-collection ${
          translateX < -60 ? "visible" : ""
        } ${swipeState === "success-left" ? "confirmed" : ""}`}
      >
        <div className="swipe-big-icon">
          <Library size={58} />
        </div>
      </div>

      {game.status && (
        <div className={`status-badge ${game.status}`}>
          {game.status === "wishlist" ? (
            <List size={14} />
          ) : game.status === "en cours" ? (
            <Play size={14} />
          ) : (
            <Check size={14} />
          )}
        </div>
      )}

      <div
        className={`game-card swipe-card ${isDragging ? "dragging" : ""} ${
          translateX > 40 ? "swiping-wishlist" : ""
        } ${translateX < -40 ? "swiping-collection" : ""}`}
        onClick={() => {
          if (onOpenSearchDetail) {
            onOpenSearchDetail(game);
          }
        }}
                onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={(e) => {
          e.stopPropagation();
          handleTouchEnd();
        }}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging
          ? "none"
          : "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <img
          src={game.background_image}
          alt={game.name}
          className="game-image"
        />

        <div className="game-overlay">
          <div className="game-title">{game.name}</div>

          <div className="game-meta">
            <span>
              {game.released?.split("-")[0] || "—"} • ⭐{" "}
              {Math.round((game.rating || 0) * 10) / 10}
              {game.genres?.length > 0 &&
                ` • ${game.genres.slice(0, 2).map((g) => g.name).join(", ")}`}
            </span>
          </div>

          {isOwned && (
            <div className="already-owned-badge">
              <Check size={13} />
              Déjà ajouté
            </div>
          )}

          <div className="swipe-hints">
            <span className="hint-left">
              <BookmarkPlus size={15} /> Wishlist →
            </span>

            <span className="hint-right">
              ← <Library size={15} /> Collection
            </span>
          </div>
        </div>
      </div>
    </div>
        
  );
}

/* -------------------- UPCOMING CARD -------------------- */

/* ==================== SORTIES À VENIR ==================== */

function UpcomingGameCard({ game, onWishlist }) {
  const payload = {
    name: game.name,
    rating: 0,
    favorite: false,
    image: game.background_image || "",
    status: "wishlist",
    released: game.released || "",
    platformNames: game.platforms?.map((p) => p.platform.name) || [],
    genreNames: game.genres?.map((g) => g.name) || [],
    playtime: game.playtime || null,
    difficulty: getSuggestedDifficulty(game),
    review: "",
    ratingGraphics: 0,
    ratingGameplay: 0,
    ratingStory: 0,
    ratingSound: 0,
    ostRating: 0,
    ratingLongevity: 0,
  };

  return (
    <div className="upcoming-card">
      {game.background_image ? (
        <img src={game.background_image} alt={game.name} className="upcoming-image" />
      ) : (
        <div className="upcoming-image placeholder">🎮</div>
      )}

      <div className="upcoming-content">
        <div className="upcoming-title">{game.name}</div>
        <div className="upcoming-date">{formatReleaseDate(game.released)}</div>
        <div className="grid-countdown">
          {getReleaseCountdown(game.released)}
        </div>

        {game.platforms?.length > 0 && (
          <div className="upcoming-meta">
            {game.platforms.slice(0, 3).map((p) => p.platform.name).join(" • ")}
          </div>
        )}

        <button
          className="wishlist-upcoming-btn"
          type="button"
          onClick={() => onWishlist(payload)}
        >
          Ajouter à la wishlist
        </button>
      </div>
    </div>
  );
}

/* -------------------- RATING -------------------- */

/* ==================== SYSTÈME DE NOTATION ==================== */

function Star({ fill = 0, onHalfClick, onFullClick }) {
  return (
    <div className="star-hitbox">
      <button
        type="button"
        className="star-click left"
        onClick={onHalfClick}
        aria-label="Demi-étoile"
      />
      <button
        type="button"
        className="star-click right"
        onClick={onFullClick}
        aria-label="Étoile entière"
      />
      <span className="star-base">★</span>
      <span className="star-fill" style={{ width: `${fill * 100}%` }}>
        ★
      </span>
    </div>
  );
}

function RatingSlider({ rating = 0, onRate }) {
  const safeRating = clampRating(rating);
  const [draftRating, setDraftRating] = useState(safeRating);
  const sliderRef = useRef(null);
  const activePointerIdRef = useRef(null);

  useEffect(() => {
    setDraftRating(safeRating);
  }, [safeRating]);

  const commitRating = (value) => {
    const nextRating = clampRating(value);
    setDraftRating(nextRating);
    onRate(nextRating);
  };

  const commitPointerRating = (clientX) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    commitRating(Math.round(ratio * 20) / 2);
  };

  const stopPointerRating = (e) => {
    if (activePointerIdRef.current !== e.pointerId) return;

    activePointerIdRef.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div className="rating-slider-wrap">
      <div className="rating-slider-top">
        <span>Note</span>
        <strong className="rating-live-value">
          {formatRating10(draftRating, "Pas noté")}
        </strong>
      </div>

      <input
        ref={sliderRef}
        type="range"
        min="0"
        max="10"
        step="0.5"
        value={draftRating}
        className="rating-slider"
        style={{ "--rating-progress": `${draftRating * 10}%` }}
        onPointerDown={(e) => {
          e.preventDefault();
          activePointerIdRef.current = e.pointerId;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          commitPointerRating(e.clientX);

          if (navigator.vibrate) {
            navigator.vibrate(8);
          }
        }}
        onPointerMove={(e) => {
          if (activePointerIdRef.current !== e.pointerId) return;
          e.preventDefault();
          commitPointerRating(e.clientX);
        }}
        onPointerUp={stopPointerRating}
        onPointerCancel={stopPointerRating}
        onLostPointerCapture={() => {
          activePointerIdRef.current = null;
        }}
        onChange={(e) => {
          if (activePointerIdRef.current !== null) return;

          commitRating(e.target.value);

          if (navigator.vibrate) {
            navigator.vibrate(8);
          }
        }}
      />

      <div className="rating-scale">
        <span>0</span>
        <span>2.5</span>
        <span>5</span>
        <span>7.5</span>
        <span>10</span>
      </div>
    </div>
  );
}

const CONTEXTUAL_GAME_RATING_FIELDS = [
  {
    key: "ratingOpenWorld",
    label: "Open world",
    hint: "Monde ouvert, densité, exploration libre",
    topLabel: "Top open worlds",
    keywords: ["open world", "sandbox", "action-adventure", "rpg"],
  },
  {
    key: "ratingGunplay",
    label: "Sensation de tir",
    hint: "Impact, feeling des armes, lisibilité des affrontements",
    topLabel: "Top shooters",
    keywords: ["shooter", "fps", "tps", "first-person", "third-person", "gunplay"],
  },
  {
    key: "ratingDriving",
    label: "Conduite",
    hint: "Feeling, vitesse, précision, plaisir au volant",
    topLabel: "Top pilotage",
    keywords: ["racing", "driving", "course", "pilotage", "motorsport", "rally"],
  },
  {
    key: "ratingCombat",
    label: "Combat",
    hint: "Rythme, précision, profondeur des affrontements",
    topLabel: "Top combats",
    keywords: ["fighting", "soulslike", "hack and slash", "beat em up", "beat-em-up", "brawler", "action rpg"],
  },
  {
    key: "ratingExploration",
    label: "Exploration",
    hint: "Curiosité, récompenses, envie de fouiller",
    topLabel: "Top exploration",
    keywords: ["adventure", "open world", "metroidvania", "platformer", "rpg"],
  },
  {
    key: "ratingChallenge",
    label: "Challenge / boss",
    hint: "Difficulté, boss, tension et satisfaction",
    topLabel: "Top challenge",
    keywords: ["soulslike", "fighting", "platformer", "roguelike", "boss", "hardcore"],
  },
  {
    key: "ratingMultiplayer",
    label: "Coop / multi",
    hint: "Plaisir à plusieurs, équilibre, rejouabilité",
    topLabel: "Top coop / multi",
    keywords: ["multiplayer", "co-op", "coop", "online", "mmo"],
  },
  {
    key: "ratingStealth",
    label: "Infiltration",
    hint: "Discrétion, level design, tension et outils",
    topLabel: "Top infiltration",
    keywords: ["stealth", "infiltration", "tactical espionage", "assassin"],
  },
  {
    key: "ratingPuzzle",
    label: "Puzzle / réflexion",
    hint: "Logique, lisibilité, satisfaction des énigmes",
    topLabel: "Top puzzle",
    keywords: ["puzzle", "logic", "escape", "detective"],
  },
  {
    key: "ratingPlatforming",
    label: "Plateforme",
    hint: "Précision, rythme, level design et flow",
    topLabel: "Top plateforme",
    keywords: ["platformer", "platform", "metroidvania"],
  },
  {
    key: "ratingHorror",
    label: "Tension / survie",
    hint: "Ambiance, vulnérabilité, peur et gestion des ressources",
    topLabel: "Top horreur",
    keywords: ["horror", "survival horror", "survie", "terror"],
  },
];

function getContextualRatingFields(game) {
  const text = getTopGameSearchText(game);
  const genreLabels = getGameGenreSignals(game).map((genre) =>
    normalizeIdentityText(genre.label)
  );

  return CONTEXTUAL_GAME_RATING_FIELDS.filter((field) =>
    field.keywords.some((keyword) => {
      const normalizedKeyword = normalizeIdentityText(keyword);
      return text.includes(normalizedKeyword) || genreLabels.includes(normalizedKeyword);
    })
  );
}

function DetailedRatingsBlock({ game, onSetDetailedRating }) {
  const summary = getGameDetailedRatingSummary(game);

  return (
    <div className="game-ratings-panel">
      <div className="game-ratings-summary">
        <div>
          <span>Moyenne détaillée</span>
          <strong>{formatRating10(averageDetailedRating(game), "À construire")}</strong>
        </div>

        <div>
          <span>Critères essentiels</span>
          <strong>
            {summary.ratedBaseFields.length}/{summary.baseFields.length}
          </strong>
        </div>
      </div>

      {summary.bestField && (
        <div className="game-ratings-insights">
          <div className="game-ratings-insight strong">
            <span>Point fort</span>
            <strong>{summary.bestField.label}</strong>
            <small>{formatRating10(summary.bestField.value, "-")}</small>
          </div>
        </div>
      )}

      <div className="game-ratings-section-head">
        <div>
          <strong>Critères essentiels</strong>
          <span>La base commune à tous les jeux pour garder des notes comparables.</span>
        </div>
        <small>{summary.completion}%</small>
      </div>

      <div className="detailed-ratings-grid">
        {summary.baseFields.map((item) => (
          <div
            key={item.key}
            className={`detailed-rating-card ${item.value > 0 ? "rated" : ""}`}
          >
            <div className="detailed-rating-title">
              <span>{item.label}</span>
              <em>{formatRating10(item.value, "À noter")}</em>
            </div>
            <small className="detailed-rating-hint">{item.hint}</small>
            <RatingSlider
              rating={item.value}
              onRate={(value) => onSetDetailedRating(game.id, item.key, value)}
            />
          </div>
        ))}
      </div>

      {summary.contextualFields.length > 0 && (
        <div className="contextual-ratings-block">
          <div className="contextual-ratings-head">
            <div>
              <strong>Critères spécifiques</strong>
              <span>
                Ces notes servent aux Tops spécialisés quand le jeu s'y prête.
              </span>
            </div>
            <small>
              {summary.ratedContextualFields.length}/{summary.contextualFields.length} notés
            </small>
          </div>

          <div className="detailed-ratings-grid contextual">
            {summary.contextualFields.map((item) => (
              <div
                key={item.key}
                className={`detailed-rating-card contextual ${
                  item.value > 0 ? "rated" : ""
                }`}
              >
                <div className="detailed-rating-title">
                  <span>
                    {item.label}
                    <em>{item.topLabel}</em>
                  </span>
                  <small>{item.hint}</small>
                </div>
                <RatingSlider
                  rating={item.value}
                  onRate={(value) => onSetDetailedRating(game.id, item.key, value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- STATS -------------------- */

function StatsBar({ total, wishlist, inProgress, finished, favorites }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-value">{total}</div>
        <div className="stat-label">Total</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">{wishlist}</div>
        <div className="stat-label">Wishlist</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">{inProgress}</div>
        <div className="stat-label">En cours</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">{finished}</div>
        <div className="stat-label">Terminé</div>
      </div>

      <div className="stat-card favorite">
        <div className="stat-value">{favorites}</div>
        <div className="stat-label">Coups de cœur</div>
      </div>
    </div>
  );
}

/* -------------------- TOP 5 TAB -------------------- */

function Top5Section({ title, games, scoreKey }) {
  const sorted = [...games]
    .filter((g) => getGameScore(g, scoreKey) > 0)
    .sort((a, b) => {
      const aScore = getGameScore(a, scoreKey);
      const bScore = getGameScore(b, scoreKey);
      return bScore - aScore;
    })
    .slice(0, 5);

  return (
    <div className="search-panel">
      <h2 className="panel-title">{title}</h2>

      {sorted.length === 0 ? (
        <EmptyState
          title="Pas assez de notes"
          subtitle="Ajoute des notes pour voir ce top 5."
        />
      ) : (
        <div className="top5-list">
          {sorted.map((game, index) => {
            const score = getGameScore(game, scoreKey);
            return (
              <div key={`${title}-${game.id}`} className="top5-item">
                <div className="top5-rank">#{index + 1}</div>
                {game.image ? (
                  <img src={game.image} alt={game.name} className="top5-thumb" />
                ) : (
                  <div className="top5-thumb placeholder">🎮</div>
                )}
                <div className="top5-main">
                  <div className="top5-name">{game.name}</div>
                  <div className="top5-meta">
                    {formatTopScore(score, scoreKey)} • {game.released ? game.released.split("-")[0] : "—"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Top5Tab({ games }) {
  const scopedGames = games.filter(isTopEligibleGame);

  return (
    <div className="progression-stack">
      <Top5Section title="Top 5 global" games={scopedGames} scoreKey="rating" />
      <Top5Section title="Top 5 gameplay" games={scopedGames} scoreKey="ratingGameplay" />
      <Top5Section title="Top 5 histoire" games={scopedGames} scoreKey="ratingStory" />
      <Top5Section title="Top 5 graphismes" games={scopedGames} scoreKey="ratingGraphics" />
      <Top5Section title="Top 5 audio" games={scopedGames} scoreKey="ratingSound" />
    </div>
  );
}

const TOP5_SCORE_OPTIONS = [
  { id: "rating", label: "Global", title: "Top 5 global" },
  { id: "ratingGameplay", label: "Gameplay", title: "Top 5 gameplay" },
  { id: "ratingGraphics", label: "Graphismes", title: "Top 5 graphismes" },
  { id: "ratingStory", label: "Histoire", title: "Top 5 histoire" },
  { id: "ratingSound", label: "Audio", title: "Top 5 audio" },
  { id: "ratingLongevity", label: "Durée de vie", title: "Top 5 durée de vie" },
];

const TOP5_HARDWARE_GROUPS = [
  { id: "all", label: "Tout", title: "Top 5 matériel" },
  { id: "console", label: "Consoles", title: "Top 5 consoles" },
  { id: "controller", label: "Manettes", title: "Top 5 manettes" },
  { id: "audio", label: "Casques", title: "Top 5 casques" },
  { id: "speaker", label: "Enceintes", title: "Top 5 enceintes" },
  { id: "vr", label: "VR", title: "Top 5 VR" },
  { id: "mouse", label: "Souris", title: "Top 5 souris" },
  { id: "keyboard", label: "Claviers", title: "Top 5 claviers" },
  { id: "display", label: "Écrans / TV", title: "Top 5 écrans / TV" },
];

const TOP5_ADVANCED_LISTS = [
  {
    id: "open-world",
    label: "Open worlds",
    title: "Top open worlds",
    criterionLabel: "Open world",
    description: "Densité du monde, exploration libre, envie de s'y perdre.",
    scoreKey: "ratingOpenWorld",
    keywords: ["open world", "adventure", "action-adventure", "rpg"],
  },
  {
    id: "rpg",
    label: "RPG",
    title: "Top RPG",
    criterionLabel: "Histoire",
    description: "Aventure, progression, écriture et attachement au voyage.",
    scoreKey: "ratingStory",
    keywords: ["rpg", "role-playing", "jrpg", "soulslike"],
  },
  {
    id: "shooters",
    label: "Shooters",
    title: "Top shooters",
    criterionLabel: "Sensation de tir",
    description: "Impact des armes, précision, rythme des affrontements.",
    scoreKey: "ratingGunplay",
    keywords: ["shooter", "fps", "tps", "first-person", "third-person"],
  },
  {
    id: "pilotage",
    label: "Pilotage",
    title: "Top pilotage",
    criterionLabel: "Conduite",
    description: "Feeling, vitesse, maîtrise, plaisir manette en main.",
    scoreKey: "ratingDriving",
    keywords: ["racing", "driving", "simulation", "sports"],
  },
  {
    id: "ambiance",
    label: "Ambiance",
    title: "Top ambiance",
    criterionLabel: "Audio",
    description: "Immersion sonore, tension, identité et atmosphère.",
    scoreKey: "ratingSound",
    keywords: ["horror", "survival", "atmospheric", "adventure"],
  },
  {
    id: "combat",
    label: "Combat",
    title: "Top combats",
    criterionLabel: "Combat",
    description: "Rythme, profondeur, lisibilité et satisfaction des duels.",
    scoreKey: "ratingCombat",
    keywords: ["fighting", "soulslike", "hack and slash", "beat em up", "beat-em-up", "brawler", "action rpg"],
  },
  {
    id: "exploration",
    label: "Exploration",
    title: "Top exploration",
    criterionLabel: "Exploration",
    description: "Curiosité, secrets, récompenses et envie de fouiller.",
    scoreKey: "ratingExploration",
    keywords: ["adventure", "open world", "metroidvania", "platformer", "rpg"],
  },
  {
    id: "challenge",
    label: "Challenge",
    title: "Top challenge",
    criterionLabel: "Challenge / boss",
    description: "Difficulté, boss, tension et satisfaction après l'effort.",
    scoreKey: "ratingChallenge",
    keywords: ["soulslike", "fighting", "platformer", "roguelike", "boss", "hardcore"],
  },
  {
    id: "multi",
    label: "Coop / multi",
    title: "Top coop / multi",
    criterionLabel: "Coop / multi",
    description: "Plaisir à plusieurs, équilibre, rejouabilité et moments partagés.",
    scoreKey: "ratingMultiplayer",
    keywords: ["multiplayer", "co-op", "coop", "online", "mmo"],
  },
  {
    id: "indes",
    label: "Indes",
    title: "Top jeux indes",
    criterionLabel: "Global",
    description: "Les jeux plus personnels, inventifs ou surprenants de ta bibliothèque.",
    scoreKey: "rating",
    keywords: ["indie", "platformer", "puzzle", "metroidvania"],
  },
  {
    id: "infiltration",
    label: "Infiltration",
    title: "Top infiltration",
    criterionLabel: "Infiltration",
    description: "Discrétion, outils, tension et plaisir de passer sans bruit.",
    scoreKey: "ratingStealth",
    keywords: ["stealth", "infiltration", "tactical espionage", "assassin"],
  },
  {
    id: "puzzle",
    label: "Puzzle",
    title: "Top puzzle",
    criterionLabel: "Puzzle / réflexion",
    description: "Logique, élégance des énigmes et satisfaction quand tout s'emboîte.",
    scoreKey: "ratingPuzzle",
    keywords: ["puzzle", "logic", "escape", "detective"],
  },
  {
    id: "plateforme",
    label: "Plateforme",
    title: "Top plateforme",
    criterionLabel: "Plateforme",
    description: "Précision, rythme, level design et flow.",
    scoreKey: "ratingPlatforming",
    keywords: ["platformer", "platform", "metroidvania"],
  },
  {
    id: "horreur",
    label: "Horreur",
    title: "Top horreur",
    criterionLabel: "Tension / survie",
    description: "Ambiance, vulnérabilité, peur et gestion des ressources.",
    scoreKey: "ratingHorror",
    keywords: ["horror", "survival horror", "survie", "terror"],
  },
];

const TOP5_CONTEXT_SCORE_FALLBACKS = {
  ratingOpenWorld: "rating",
  ratingGunplay: "ratingGameplay",
  ratingDriving: "ratingGameplay",
  ratingCombat: "ratingGameplay",
  ratingExploration: "rating",
  ratingChallenge: "ratingGameplay",
  ratingMultiplayer: "ratingLongevity",
  ratingStealth: "ratingGameplay",
  ratingPuzzle: "ratingGameplay",
  ratingPlatforming: "ratingGameplay",
  ratingHorror: "ratingSound",
};

function getGameScore(game, scoreKey) {
  const contextualScore = clampRating(game?.[scoreKey]);
  if (contextualScore > 0) return contextualScore;

  const fallbackKey = TOP5_CONTEXT_SCORE_FALLBACKS[scoreKey];
  return fallbackKey ? clampRating(game?.[fallbackKey]) : contextualScore;
}

function getTopScoreSource(game, scoreKey) {
  if (clampRating(game?.[scoreKey]) > 0) return "Note spécialisée";

  const fallbackKey = TOP5_CONTEXT_SCORE_FALLBACKS[scoreKey];
  if (fallbackKey && clampRating(game?.[fallbackKey]) > 0) {
    return "Note approchée";
  }

  return "";
}

function getNormalizedStatus(status = "") {
  return normalizeIdentityText(status).replace(/\s+/g, " ").trim();
}

function isGameFinishedStatus(game = {}) {
  const status = getNormalizedStatus(game?.status || "");
  return (
    status.includes("termin") ||
    game?.completed === true ||
    game?.progressStatus === "completed"
  );
}

function isGameInCollection(game = {}) {
  const status = getNormalizedStatus(game?.status || "");
  return status === "collection" || isGameFinishedStatus(game);
}

function getNormalizedGameProgressPatch(game = {}) {
  const status = getNormalizedStatus(game.status || "");
  const isFinished = isGameFinishedStatus(game);
  const isInProgress = status.includes("cours") || game.progressStatus === "in_progress";
  const isWishlist = status === "wishlist";

  const nextState = isFinished
    ? { status: "collection", progressStatus: "completed", completed: true }
    : isInProgress
      ? { status: "en cours", progressStatus: "in_progress", completed: false }
      : isWishlist
        ? { status: "wishlist", progressStatus: "not_started", completed: false }
        : { status: "collection", progressStatus: "not_started", completed: false };

  const patch = {};
  if (game.status !== nextState.status) patch.status = nextState.status;
  if ((game.progressStatus || "not_started") !== nextState.progressStatus) {
    patch.progressStatus = nextState.progressStatus;
  }
  if (Boolean(game.completed) !== nextState.completed) {
    patch.completed = nextState.completed;
  }

  return Object.keys(patch).length ? patch : null;
}

function getGameProgressState(game = {}) {
  const status = getNormalizedStatus(game.status || "");
  if (isGameFinishedStatus(game)) return "finished";
  if (status.includes("cours") || game.progressStatus === "in_progress") return "inProgress";
  if (status === "wishlist") return "wishlist";
  return "collection";
}

function getGameProgressStateLabel(state) {
  return (
    {
      finished: "Terminé",
      inProgress: "En cours",
      wishlist: "Wishlist",
      collection: "Collection",
    }[state] || "Collection"
  );
}

function getGameIntegrityTargetLabel(game = {}, patch = {}) {
  return getGameProgressStateLabel(
    getGameProgressState({
      ...game,
      ...patch,
    })
  );
}

function getGameIntegrityChangeSummary(game = {}, patch = {}) {
  const changes = [];
  if (Object.prototype.hasOwnProperty.call(patch, "status")) {
    changes.push(`statut ${game.status || "-"} -> ${patch.status}`);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "progressStatus")) {
    changes.push(`progression ${game.progressStatus || "not_started"} -> ${patch.progressStatus}`);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "completed")) {
    changes.push(`terminé ${game.completed ? "oui" : "non"} -> ${patch.completed ? "oui" : "non"}`);
  }
  return changes.join(" · ");
}

function getGameDataIntegrityIssues(games = []) {
  return games
    .map((game) => {
      const patch = getNormalizedGameProgressPatch(game);
      if (!patch) return null;

      const reasons = [];
      const status = getNormalizedStatus(game.status || "");

      if (status.includes("termin")) {
        reasons.push("ancien statut terminé");
      }
      if (game.completed === true && game.progressStatus !== "completed") {
        reasons.push("terminé sans progression terminée");
      }
      if (game.progressStatus === "completed" && game.completed !== true) {
        reasons.push("progression terminée sans validation");
      }
      if (status.includes("cours") && game.progressStatus !== "in_progress") {
        reasons.push("en cours sans progression en cours");
      }
      if (game.progressStatus === "in_progress" && !status.includes("cours")) {
        reasons.push("progression en cours hors onglet en cours");
      }

      return {
        game,
        patch,
        reasons: reasons.length ? reasons : ["statut à normaliser"],
      };
    })
    .filter(Boolean);
}

function isTopFinishedGame(game) {
  return isGameFinishedStatus(game);
}

function isTopEligibleGame(game) {
  const status = getNormalizedStatus(game?.status);
  return isGameFinishedStatus(game) || status.includes("cours");
}

function formatTopScore(score, scoreKey = "rating") {
  const value = Number(score) || 0;
  if (!value) return "-";

  return formatRating10(value, "-");
}

function getTopGameMeta(game) {
  const year = game.released ? game.released.split("-")[0] : "";
  const platforms = game.playedPlatforms?.length
    ? game.playedPlatforms
    : game.platformNames || [];
  const genres = game.genreNames || [];

  return [year, platforms[0], genres[0]].filter(Boolean).join(" - ") || "Jeu classe";
}

function getTopGroups(games, field) {
  const counts = {};

  games.forEach((game) => {
    const values =
      field === "platform"
        ? game.playedPlatforms?.length
          ? game.playedPlatforms
          : game.platformNames || []
        : game.genreNames || [];

    values.forEach((value) => {
      if (!value) return;
      counts[value] = (counts[value] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));
}

function filterGamesForTop(games, mode, selectedGroup) {
  if (!selectedGroup) return games;

  if (mode === "platform") {
    return games.filter((game) => {
      const platforms = game.playedPlatforms?.length
        ? game.playedPlatforms
        : game.platformNames || [];

      return platforms.includes(selectedGroup);
    });
  }

  if (mode === "genre") {
    return games.filter((game) => (game.genreNames || []).includes(selectedGroup));
  }

  return games;
}

function getTopGamesForScore(games, scoreKey, limit = 3) {
  return [...games]
    .filter((game) => isTopEligibleGame(game) && getGameScore(game, scoreKey) > 0)
    .sort((a, b) => {
      const statusDiff = Number(isTopFinishedGame(b)) - Number(isTopFinishedGame(a));
      if (statusDiff !== 0) return statusDiff;
      const scoreDiff = getGameScore(b, scoreKey) - getGameScore(a, scoreKey);
      if (scoreDiff !== 0) return scoreDiff;
      return (a.name || "").localeCompare(b.name || "");
    })
    .slice(0, limit);
}

function getTopGameSearchText(game) {
  return [
    game.name,
    game.slug,
    ...(game.genreNames || []),
    ...(game.platformNames || []),
    ...(game.playedPlatforms || []),
    ...(game.tags || []).map((tag) => tag?.name || tag),
  ]
    .filter(Boolean)
    .map((value) => normalizeIdentityText(String(value)))
    .join(" ");
}

function getTopAdvancedGames(games, list) {
  const keywords = list.keywords.map((keyword) => normalizeIdentityText(keyword));
  const filtered = games.filter((game) => {
    const text = getTopGameSearchText(game);
    return keywords.some((keyword) => text.includes(keyword));
  });

  return getTopGamesForScore(filtered, list.scoreKey, 5);
}

function getTopOstGames(games, limit = 5) {
  return [...games]
    .filter((game) => isTopEligibleGame(game) && getGameScore(game, "ostRating") > 0)
    .sort((a, b) => {
      const scoreDiff =
        getGameScore(b, "ostRating") - getGameScore(a, "ostRating");
      if (scoreDiff !== 0) return scoreDiff;

      const aHasTrack = Boolean((a.ostTrack || "").trim());
      const bHasTrack = Boolean((b.ostTrack || "").trim());
      if (Number(bHasTrack) - Number(aHasTrack) !== 0) {
        return Number(bHasTrack) - Number(aHasTrack);
      }

      return (a.name || "").localeCompare(b.name || "");
    })
    .slice(0, limit);
}

function isTopEligibleHardware(item) {
  const status = getNormalizedStatus(item?.status);
  return (
    getHardwareAverageRating(item) > 0 &&
    !status.includes("wishlist") &&
    !status.includes("souhait")
  );
}

function getHardwareTypeLabel(type = "") {
  return (
    TOP5_HARDWARE_GROUPS.find((group) => group.id === type)?.label ||
    "Matériel"
  );
}

function getTopHardwareMeta(item) {
  return [getHardwareTypeLabel(item.type), item.brand, item.status]
    .filter(Boolean)
    .join(" - ");
}

function getTopHardwareItems(hardware, type = "all", limit = 5) {
  return [...hardware]
    .filter(
      (item) =>
        isTopEligibleHardware(item) && (type === "all" || item.type === type)
    )
    .sort((a, b) => {
      const ratingDiff = getHardwareAverageRating(b) - getHardwareAverageRating(a);
      if (ratingDiff !== 0) return ratingDiff;
      return (a.name || "").localeCompare(b.name || "");
    })
    .slice(0, limit);
}

function getHardwareCriterionScore(item, criterionKey = "average") {
  if (criterionKey === "average") return getHardwareAverageRating(item);
  return clampRating(item?.ratings?.[criterionKey]);
}

function getTopHardwareItemsForCriterion(
  hardware,
  type = "all",
  criterionKey = "average",
  limit = 5
) {
  return [...hardware]
    .filter(
      (item) =>
        isTopEligibleHardware(item) &&
        (type === "all" || item.type === type) &&
        getHardwareCriterionScore(item, criterionKey) > 0
    )
    .sort((a, b) => {
      const ratingDiff =
        getHardwareCriterionScore(b, criterionKey) -
        getHardwareCriterionScore(a, criterionKey);
      if (ratingDiff !== 0) return ratingDiff;
      return (a.name || "").localeCompare(b.name || "");
    })
    .slice(0, limit);
}

function getHardwareCriterionOptions(type = "all") {
  if (type === "all") {
    return [{ key: "average", label: "Moyenne globale", icon: "TOP" }];
  }

  return [
    { key: "average", label: "Moyenne globale", icon: "TOP" },
    ...getHardwareRatingFields(type),
  ];
}

function getGameYear(game) {
  const year = Number(String(game?.released || "").slice(0, 4));
  return Number.isFinite(year) && year > 1970 ? year : null;
}

function isGameOfYearEligible(game) {
  const status = getNormalizedStatus(game?.status);
  return (
    getGameYear(game) &&
    !status.includes("wishlist") &&
    !status.includes("souhait")
  );
}

function getGameOfYearYears(games) {
  return [...new Set(games.filter(isGameOfYearEligible).map(getGameYear))]
    .filter(Boolean)
    .sort((a, b) => b - a);
}

function serializeShowcaseGame(game, scoreKey = "rating") {
  if (!game) return null;

  return {
    id: game.id,
    name: game.name,
    image: game.image || "",
    score: getGameScore(game, scoreKey),
    meta: getTopGameMeta(game),
  };
}

function getProfileShowcase(games = [], hardware = []) {
  const topScores = TOP5_SCORE_OPTIONS.map((option) => {
    const game = getTopGamesForScore(games, option.id, 1)[0];

    return game
      ? {
          key: option.id,
          label: option.label,
          game: serializeShowcaseGame(game, option.id),
        }
      : null;
  })
    .filter(Boolean)
    .slice(0, 6);

  const specializedTops = TOP5_ADVANCED_LISTS.map((list) => {
    const game = getTopAdvancedGames(games, list)[0];

    return game
      ? {
          key: list.scoreKey,
          label: list.label,
          criterion: list.criterionLabel,
          game: serializeShowcaseGame(game, list.scoreKey),
        }
      : null;
  })
    .filter(Boolean)
    .slice(0, 4);

  const gotyHighlights = games
    .filter((game) => Number(game.gotyYear) > 0)
    .sort((a, b) => Number(b.gotyYear) - Number(a.gotyYear))
    .slice(0, 3)
    .map((game) => ({
      year: Number(game.gotyYear),
      game: serializeShowcaseGame(game, "rating"),
    }));

  const hardwareHighlights = getTopHardwareItems(
    getCurrentOwnedHardware(hardware),
    "all",
    3
  ).map((item) => ({
    id: item.id,
    name: item.name,
    image: item.image || "",
    type: item.type || "",
    label: getHardwareTypeLabel(item.type),
    score: getHardwareAverageRating(item),
  }));

  return {
    topScores,
    specializedTops,
    gotyHighlights,
    hardwareHighlights,
  };
}

function Top5RankingPanel({
  title,
  games,
  scoreKey,
  contextLabel = "",
  compact = false,
  advancedList = null,
}) {
  const sorted = [...games]
    .filter((game) => getGameScore(game, scoreKey) > 0)
    .sort((a, b) => {
      const statusDiff = Number(isTopFinishedGame(b)) - Number(isTopFinishedGame(a));
      if (statusDiff !== 0) return statusDiff;
      const scoreDiff = getGameScore(b, scoreKey) - getGameScore(a, scoreKey);
      if (scoreDiff !== 0) return scoreDiff;
      return (a.name || "").localeCompare(b.name || "");
    })
    .slice(0, 5);

  return (
    <div
      className={`search-panel top5-panel ${compact ? "compact" : ""} ${
        advancedList ? "advanced" : ""
      }`}
    >
      <div className="top5-section-head">
        <div>
          <h2 className="panel-title">{title}</h2>
          {contextLabel && <div className="option-value">{contextLabel}</div>}
          {advancedList && (
            <div className="top5-criterion-chip">
              Basé sur {advancedList.criterionLabel}
            </div>
          )}
        </div>
        <span className="top5-count">{sorted.length}/5</span>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="Pas assez de notes"
          subtitle="Ajoute des notes sur les jeux de cette sélection."
        />
      ) : (
        <div className="top5-list">
          {sorted.map((game, index) => {
            const scoreSource = advancedList
              ? getTopScoreSource(game, scoreKey)
              : "";

            return (
              <div key={`${title}-${game.id}`} className="top5-item">
                <div className="top5-rank">{index + 1}</div>
                {game.image ? (
                  <img src={game.image} alt={game.name} className="top5-thumb" />
                ) : (
                  <div className="top5-thumb placeholder">Jeu</div>
                )}
                <div className="top5-main">
                  <div className="top5-name">{game.name}</div>
                  <div className="top5-meta">{getTopGameMeta(game)}</div>
                  {scoreSource && (
                    <div className="top5-score-source">{scoreSource}</div>
                  )}
                </div>
                <div className="top5-score">
                  {formatTopScore(getGameScore(game, scoreKey), scoreKey)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Top5HardwarePanel({
  title,
  items,
  contextLabel = "",
  compact = false,
  criterion = null,
}) {
  const criterionKey = criterion?.key || "average";

  return (
    <div
      className={`search-panel top5-panel ${compact ? "compact" : ""} ${
        criterion ? "advanced" : ""
      }`}
    >
      <div className="top5-section-head">
        <div>
          <h2 className="panel-title">{title}</h2>
          {contextLabel && <div className="option-value">{contextLabel}</div>}
          {criterion && (
            <div className="top5-criterion-chip">
              Basé sur {criterion.label}
            </div>
          )}
        </div>
        <span className="top5-count">{items.length}/5</span>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Pas assez de notes"
          subtitle="Ajoute des notes sur ton matériel pour afficher ce classement."
        />
      ) : (
        <div className="top5-list">
          {items.map((item, index) => (
            <div key={`${title}-${item.id}`} className="top5-item">
              <div className="top5-rank">{index + 1}</div>
              {item.image ? (
                <img src={item.image} alt={item.name} className="top5-thumb" />
              ) : (
                <div className="top5-thumb placeholder">Mat</div>
              )}
              <div className="top5-main">
                <div className="top5-name">{item.name}</div>
                <div className="top5-meta">{getTopHardwareMeta(item)}</div>
                {criterion && criterionKey !== "average" && (
                  <div className="top5-score-source">Critère matériel</div>
                )}
              </div>
              <div className="top5-score">
                {formatRating10(getHardwareCriterionScore(item, criterionKey), "-")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Top5OstPanel({ games }) {
  const ostGames = getTopOstGames(games, 5);
  const featured = ostGames[0];

  return (
    <div className="progression-stack">
      <div className="search-panel top5-panel ost-top-panel">
        <div className="top5-section-head">
          <div>
            <h2 className="panel-title">Top 5 OST</h2>
            <div className="option-value">
              Classement basé sur ta note OST, enrichi avec tes morceaux favoris.
            </div>
          </div>
          <span className="top5-count">{ostGames.length}/5</span>
        </div>

        {ostGames.length === 0 ? (
          <EmptyState
            title="Pas encore d'OST classée"
            subtitle="Note l'OST d'un jeu pour alimenter ce Top 5."
          />
        ) : (
          <div className="top5-list ost-top-list">
            {ostGames.map((game, index) => (
              <div key={`ost-${game.id}`} className="top5-item ost-top-item">
                <div className="top5-rank">{index + 1}</div>
                {game.image ? (
                  <img src={game.image} alt={game.name} className="top5-thumb" />
                ) : (
                  <div className="top5-thumb placeholder">OST</div>
                )}
                <div className="top5-main">
                  <div className="top5-name">{game.name}</div>
                  <div className="top5-meta">
                    {(game.ostTrack || "").trim()
                      ? game.ostTrack
                      : getTopGameMeta(game)}
                  </div>
                </div>
                <div className="ost-top-actions">
                  {game.ostLink && (
                    <a href={game.ostLink} target="_blank" rel="noreferrer">
                      Écouter
                    </a>
                  )}
                  <div className="top5-score">
                    {formatTopScore(getGameScore(game, "ostRating"), "ostRating")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {featured && (
        <div className="search-panel ost-feature-card">
          <div>
            <span className="goty-kicker">OST favorite</span>
            <h2 className="panel-title">{featured.name}</h2>
            <div className="option-value">
              {(featured.ostTrack || "").trim()
                ? featured.ostTrack
                : "Ajoute un morceau préféré dans la fiche du jeu."}
            </div>
          </div>
          {featured.image ? (
            <img src={featured.image} alt={featured.name} />
          ) : (
            <div className="goty-empty-cover">OST</div>
          )}
        </div>
      )}
    </div>
  );
}

function GameOfYearPanel({ games, onSetGameOfYear }) {
  const years = getGameOfYearYears(games);
  const [selectedYear, setSelectedYear] = useState(years[0] || "");

  useEffect(() => {
    if (!years.length) {
      setSelectedYear("");
      return;
    }

    if (!years.includes(Number(selectedYear))) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  const year = Number(selectedYear);
  const candidates = games
    .filter((game) => isGameOfYearEligible(game) && getGameYear(game) === year)
    .sort((a, b) => {
      const ratingDiff = getGameRating(b) - getGameRating(a);
      if (ratingDiff !== 0) return ratingDiff;
      return (a.name || "").localeCompare(b.name || "");
    });
  const selectedGame = candidates.find((game) => Number(game.gotyYear) === year);

  return (
    <div className="progression-stack">
      <div className="search-panel goty-hero">
        <div>
          <h2 className="panel-title">Game of the Year</h2>
          <div className="option-value">
            Choisis ton jeu marquant pour chaque année parmi les jeux joués.
          </div>
        </div>

        {years.length > 0 && (
          <label className="goty-year-picker">
            <span>Année</span>
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
            >
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {!years.length ? (
        <EmptyState
          title="Aucune année disponible"
          subtitle="Ajoute des jeux joués avec une date de sortie pour créer tes GOTY."
        />
      ) : (
        <>
          <div className="search-panel goty-current-card">
            <div>
              <span className="goty-kicker">GOTY {year}</span>
              <h2 className="panel-title">
                {selectedGame ? selectedGame.name : "Aucun jeu sélectionné"}
              </h2>
              <div className="option-value">
                {selectedGame
                  ? `${formatRating10(getGameRating(selectedGame), "Non noté")} - ${getTopGameMeta(selectedGame)}`
                  : "Sélectionne un jeu dans la liste ci-dessous."}
              </div>
            </div>
            {selectedGame?.image ? (
              <img src={selectedGame.image} alt={selectedGame.name} />
            ) : (
              <div className="goty-empty-cover">GOTY</div>
            )}
          </div>

          <div className="search-panel top5-panel">
            <div className="top5-section-head">
              <div>
                <h2 className="panel-title">Candidats {year}</h2>
                <div className="option-value">
                  {candidates.length} jeux joués cette année-là.
                </div>
              </div>
              <span className="top5-count">{selectedGame ? "1/1" : "0/1"}</span>
            </div>

            <div className="top5-list">
              {candidates.map((game, index) => {
                const isSelected = Number(game.gotyYear) === year;

                return (
                  <button
                    key={game.id}
                    type="button"
                    className={`top5-item goty-candidate ${isSelected ? "active" : ""}`}
                    onClick={() => onSetGameOfYear(year, game.id)}
                  >
                    <div className="top5-rank">{index + 1}</div>
                    {game.image ? (
                      <img src={game.image} alt={game.name} className="top5-thumb" />
                    ) : (
                      <div className="top5-thumb placeholder">Jeu</div>
                    )}
                    <div className="top5-main">
                      <div className="top5-name">{game.name}</div>
                      <div className="top5-meta">{getTopGameMeta(game)}</div>
                    </div>
                    <div className="top5-score">
                      {isSelected ? "GOTY" : formatRating10(getGameRating(game), "-")}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Top5TabV2({ games, hardware = [], onSetGameOfYear }) {
  const scopedGames = games.filter(isTopEligibleGame);
  const scopedHardware = hardware.filter(isTopEligibleHardware);
  const [contentMode, setContentMode] = useState("games");
  const [mode, setMode] = useState("criteria");
  const [scoreKey, setScoreKey] = useState("rating");
  const [hardwareType, setHardwareType] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [hardwareRankingMode, setHardwareRankingMode] = useState("global");
  const [hardwareCriterionKey, setHardwareCriterionKey] = useState("average");
  const [selectedAdvancedTop, setSelectedAdvancedTop] = useState(
    TOP5_ADVANCED_LISTS[0].id
  );

  const selectedScore =
    TOP5_SCORE_OPTIONS.find((option) => option.id === scoreKey) ||
    TOP5_SCORE_OPTIONS[0];
  const selectedAdvancedList =
    TOP5_ADVANCED_LISTS.find((list) => list.id === selectedAdvancedTop) ||
    TOP5_ADVANCED_LISTS[0];
  const platformGroups = getTopGroups(scopedGames, "platform");
  const genreGroups = getTopGroups(scopedGames, "genre");
  const selectedGroup =
    mode === "platform" ? selectedPlatform : mode === "genre" ? selectedGenre : "";
  const visibleGames = filterGamesForTop(scopedGames, mode, selectedGroup);
  const visibleAdvancedGames = getTopAdvancedGames(
    scopedGames,
    selectedAdvancedList
  );
  const selectedHardwareGroup =
    TOP5_HARDWARE_GROUPS.find((group) => group.id === hardwareType) ||
    TOP5_HARDWARE_GROUPS[0];
  const hardwareCriterionOptions = getHardwareCriterionOptions(hardwareType);
  const selectedHardwareCriterion =
    hardwareCriterionOptions.find((option) => option.key === hardwareCriterionKey) ||
    hardwareCriterionOptions[0];
  const safeHardwareCriterionKey = selectedHardwareCriterion.key;
  const visibleHardware =
    hardwareRankingMode === "criteria"
      ? getTopHardwareItemsForCriterion(
          scopedHardware,
          hardwareType,
          safeHardwareCriterionKey,
          5
        )
      : getTopHardwareItems(scopedHardware, hardwareType, 5);
  const contextLabel =
    mode === "advanced"
      ? `${selectedAdvancedList.label} - ${visibleAdvancedGames.length} jeux classés`
      : mode === "criteria"
      ? "Jeux terminés en priorité, puis jeux en cours notés si besoin."
      : selectedGroup
        ? `${selectedGroup} - ${visibleGames.length} jeux`
        : "Choisis une catégorie pour afficher son classement.";
  const hardwareContextLabel =
    hardwareRankingMode === "criteria"
      ? `${selectedHardwareGroup.label} - ${selectedHardwareCriterion.label}`
      : hardwareType === "all"
      ? "Matériel noté, hors wishlist."
      : `${selectedHardwareGroup.label} - ${visibleHardware.length} matériel noté`;
  useEffect(() => {
    if (
      !hardwareCriterionOptions.some(
        (option) => option.key === hardwareCriterionKey
      )
    ) {
      setHardwareCriterionKey("average");
    }
  }, [hardwareCriterionOptions, hardwareCriterionKey]);

  return (
    <div className="progression-stack top5-page">
      <div className="search-panel top5-dashboard">
        <div>
          <h2 className="panel-title">Tes vrais Top 5</h2>
          <div className="option-value">
            Classe tes jeux, ton matériel, tes OST et tes GOTY sans mélanger les usages.
          </div>
        </div>

        <div className="top5-control-block">
          <span>Section</span>
          <div className="top5-content-tabs">
          {[
            { id: "games", label: "Jeux" },
            { id: "hardware", label: "Matériel" },
            { id: "ost", label: "OST" },
            { id: "goty", label: "GOTY" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={contentMode === item.id ? "active" : ""}
              onClick={() => setContentMode(item.id)}
            >
              {item.label}
            </button>
          ))}
          </div>
        </div>

        {contentMode === "games" ? (
          <>
        <div className="top5-control-block">
          <span>Classement</span>
        <div className="top5-mode-tabs">
          {[
            { id: "criteria", label: "Notes" },
            { id: "advanced", label: "Spécialisés" },
            { id: "platform", label: "Plateformes" },
            { id: "genre", label: "Genres" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={mode === item.id ? "active" : ""}
              onClick={() => setMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        </div>

        {mode !== "advanced" && (
          <div className="top5-control-block">
            <span>Critère</span>
          <div className="top5-score-tabs">
            {TOP5_SCORE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={scoreKey === option.id ? "active" : ""}
                onClick={() => setScoreKey(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          </div>
        )}

        {mode === "advanced" && (
          <div className="top5-control-block">
            <span>Top spécialisé</span>
          <div className="top5-group-picker top5-advanced-picker">
            {TOP5_ADVANCED_LISTS.map((list) => (
              <button
                key={list.id}
                type="button"
                className={selectedAdvancedTop === list.id ? "active" : ""}
                onClick={() => setSelectedAdvancedTop(list.id)}
              >
                <span>{list.label}</span>
                <small>
                  {list.criterionLabel} · {getTopAdvancedGames(scopedGames, list).length}
                </small>
              </button>
            ))}
          </div>
          </div>
        )}

        {mode !== "criteria" && mode !== "advanced" && (
          <div className="top5-control-block">
            <span>{mode === "platform" ? "Plateforme" : "Genre"}</span>
          <div className="top5-group-picker">
            {(mode === "platform" ? platformGroups : genreGroups).map((group) => (
              <button
                key={group.name}
                type="button"
                className={selectedGroup === group.name ? "active" : ""}
                onClick={() =>
                  mode === "platform"
                    ? setSelectedPlatform(group.name)
                    : setSelectedGenre(group.name)
                }
              >
                <span>{group.name}</span>
                <small>{group.count}</small>
              </button>
            ))}
          </div>
          </div>
        )}
          </>
        ) : contentMode === "hardware" ? (
          <>
            <div className="top5-control-block">
              <span>Classement</span>
            <div className="top5-mode-tabs hardware">
              {[
                { id: "global", label: "Global" },
                { id: "criteria", label: "Critères" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={hardwareRankingMode === item.id ? "active" : ""}
                  onClick={() => setHardwareRankingMode(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            </div>

            <div className="top5-control-block">
              <span>Type</span>
            <div className="top5-group-picker hardware">
              {TOP5_HARDWARE_GROUPS.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  className={hardwareType === group.id ? "active" : ""}
                  onClick={() => {
                    setHardwareType(group.id);
                    setHardwareCriterionKey("average");
                  }}
                >
                  <span>{group.label}</span>
                  <small>
                    {group.id === "all"
                      ? scopedHardware.length
                      : scopedHardware.filter((item) => item.type === group.id).length}
                  </small>
                </button>
              ))}
            </div>
            </div>

            {hardwareRankingMode === "criteria" && hardwareType !== "all" && (
              <div className="top5-control-block">
                <span>Critère matériel</span>
              <div className="top5-group-picker top5-hardware-criteria-picker">
                {hardwareCriterionOptions.map((criterion) => (
                  <button
                    key={criterion.key}
                    type="button"
                    className={safeHardwareCriterionKey === criterion.key ? "active" : ""}
                    onClick={() => setHardwareCriterionKey(criterion.key)}
                  >
                    <span>{criterion.label}</span>
                    <small>
                      {getTopHardwareItemsForCriterion(
                        scopedHardware,
                        hardwareType,
                        criterion.key,
                        5
                      ).length}
                    </small>
                  </button>
                ))}
              </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {contentMode === "games" ? (
        <>
          <Top5RankingPanel
            title={
              mode === "advanced"
                ? selectedAdvancedList.title
                : mode === "criteria"
                ? selectedScore.title
                : `${selectedScore.title}${selectedGroup ? ` - ${selectedGroup}` : ""}`
            }
            games={mode === "advanced" ? visibleAdvancedGames : visibleGames}
            scoreKey={mode === "advanced" ? selectedAdvancedList.scoreKey : scoreKey}
            contextLabel={contextLabel}
            advancedList={mode === "advanced" ? selectedAdvancedList : null}
          />

          {mode === "criteria" && (
            <>
              <div className="top5-mini-grid">
                {TOP5_SCORE_OPTIONS.filter((option) => option.id !== scoreKey)
                  .slice(0, 4)
                  .map((option) => (
                    <Top5RankingPanel
                      key={option.id}
                      title={option.title}
                      games={scopedGames}
                      scoreKey={option.id}
                      compact
                    />
                  ))}
              </div>

            </>
          )}
        </>
      ) : contentMode === "hardware" ? (
        <>
          {hardwareRankingMode === "criteria" && hardwareType === "all" && (
            <div className="search-panel top5-inline-note">
              <div>
                <h2 className="panel-title">Choisis un type de matériel</h2>
                <div className="option-value">
                  Les critères dépendent du type : manettes, casques, écrans, VR,
                  souris, claviers...
                </div>
              </div>
            </div>
          )}

          <Top5HardwarePanel
            title={
              hardwareRankingMode === "criteria" && hardwareType !== "all"
                ? `Top ${selectedHardwareCriterion.label}`
                : selectedHardwareGroup.title
            }
            items={visibleHardware}
            contextLabel={hardwareContextLabel}
            criterion={
              hardwareRankingMode === "criteria" && hardwareType !== "all"
                ? selectedHardwareCriterion
                : null
            }
          />

          {hardwareType === "all" && hardwareRankingMode === "global" && (
            <div className="top5-mini-grid">
              {TOP5_HARDWARE_GROUPS.filter((group) => group.id !== "all")
                .slice(0, 4)
                .map((group) => (
                  <Top5HardwarePanel
                    key={group.id}
                    title={group.title}
                    items={getTopHardwareItems(scopedHardware, group.id, 5)}
                    compact
                  />
                ))}
            </div>
          )}
        </>
      ) : contentMode === "ost" ? (
        <Top5OstPanel games={scopedGames} />
      ) : (
        <GameOfYearPanel games={games} onSetGameOfYear={onSetGameOfYear} />
      )}
    </div>
  );
}

/* -------------------- DETAIL MODAL -------------------- */

/* ==================== MODAL DÉTAIL JEU ==================== */

function GameDetailModal({
  game,
  onClose,
  onDelete,
  onSetStatus,
  onSetRating,
  onToggleFavorite,
  onSetDifficulty,
  onSetReview,
  onSetOstInfo,
  onSetDetailedRating,
  onToggleCompleted,
  onSetProgressStatus,
  onSetPlaytimeRange,
  onSetPlayedPlatforms,
  onAddGame,
  games = [],
  onNavigateGame,
  canGoPrevious,
  canGoNext,
}) {
  const [localReview, setLocalReview] = useState("");
  const [localOstRating, setLocalOstRating] = useState(0);
  const [localOstTrack, setLocalOstTrack] = useState("");
  const [localOstLink, setLocalOstLink] = useState("");
  const [dlcs, setDlcs] = useState([]);
  const [loadingDlcs, setLoadingDlcs] = useState(false);
  const swipeStartRef = useRef(null);

  useEffect(() => {
    setLocalReview(game?.review || "");
    setLocalOstRating(clampRating(game?.ostRating));
    setLocalOstTrack(game?.ostTrack || "");
    setLocalOstLink(game?.ostLink || "");
  }, [game]);

  useEffect(() => {
    if (!game) return;

    document.body.classList.add("modal-open");

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.target?.closest?.("input, textarea, select")) return;

      if (e.key === "ArrowLeft" && canGoPrevious) {
        onNavigateGame?.(-1);
      }

      if (e.key === "ArrowRight" && canGoNext) {
        onNavigateGame?.(1);
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleEsc);
    };
  }, [game, onClose, onNavigateGame, canGoPrevious, canGoNext]);

  useEffect(() => {
    if (!game?.name) {
      setDlcs([]);
      return;
    }

    const fetchDlcs = async () => {
      try {
        setLoadingDlcs(true);

        const rawgGameId = game.rawgId || game.rawg_id || game.rawgID;

        let foundDlcs = [];

        if (rawgGameId) {
          const additionsRes = await fetch(
            `https://api.rawg.io/api/games/${rawgGameId}/additions?key=${API_KEY}&page_size=20`
          );

          const additionsData = await additionsRes.json();
          foundDlcs = additionsData.results || [];
        }

        if (foundDlcs.length === 0) {
          const search = encodeURIComponent(`${game.name} DLC expansion`);
          const searchRes = await fetch(
            `https://api.rawg.io/api/games?key=${API_KEY}&search=${search}&page_size=20`
          );

          const searchData = await searchRes.json();
          const parentName = game.name.toLowerCase();
          const parentBaseName = parentName.split(":")[0].split("-")[0].trim();

          foundDlcs = (searchData.results || []).filter((item) => {
            const name = (item.name || "").toLowerCase();

            if (!name || name === parentName) return false;

            const positiveKeywords = [
              "dlc",
              "expansion",
              "season pass",
              "story expansion",
              "add-on",
              "addon",
              "chapter",
              "episode",
              "phantom liberty",
              "blood and wine",
              "hearts of stone",
              "frozen wilds",
              "shadow of the erdtree",
              "the old hunters",
              "left behind",
              "burning shores",
              "iceborne",
              "separate ways",
              "expansion",
              "chapter",
              "episode",
              "story",
              "pass",
              "quest",
              "campaign",
              "adventure",
              "content",
            ];

            const negativeKeywords = [
              "edition",
              "ultimate",
              "definitive",
              "complete",
              "collection",
              "bundle",
              "remastered",
              "remake",
              "game of the year",
              "goty",
              "trilogy",
              "anthology",
            ];

            const hasPositiveKeyword = positiveKeywords.some((keyword) =>
              name.includes(keyword)
            );

            const hasNegativeKeyword = negativeKeywords.some((keyword) =>
              name.includes(keyword)
            );

            const linkedToParent =
              parentBaseName.length > 3 && name.includes(parentBaseName);

            const isProbablyEdition = negativeKeywords.some((keyword) =>
              name.includes(keyword)
            );

            const knownDlcNames = [
              "phantom liberty",
              "blood and wine",
              "hearts of stone",
              "frozen wilds",
              "burning shores",
              "shadow of the erdtree",
              "the old hunters",
              "left behind",
              "iceborne",
              "separate ways",
            ];

            const isKnownDlc = knownDlcNames.some((keyword) =>
              name.includes(keyword)
            );

            const isLinkedDlc =
              linkedToParent &&
              name !== parentName &&
              name.length > parentName.length + 3 &&
              hasPositiveKeyword;

            return (isKnownDlc || isLinkedDlc) && !isProbablyEdition;
          });
        }

        const uniqueDlcs = foundDlcs.filter(
          (dlc, index, self) =>
            index === self.findIndex((item) => item.id === dlc.id)
        );

        setDlcs(uniqueDlcs);
      } catch (e) {
        if (isAbortError(e)) return;
        console.warn("Erreur recherche DLC ignorée :", e);
        setDlcs([]);
      } finally {
        setLoadingDlcs(false);
      }
    };

    fetchDlcs();
  }, [game]);

  if (!game) return null;

  const handleSwipeStart = (event) => {
    const target = event.target;

    if (
      target.closest("button, input, textarea, select") ||
      target.closest(".rating-slider")
    ) {
      swipeStartRef.current = null;
      return;
    }

    const touch = event.touches[0];
    swipeStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleSwipeEnd = (event) => {
    if (!swipeStartRef.current) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - swipeStartRef.current.x;
    const deltaY = touch.clientY - swipeStartRef.current.y;
    swipeStartRef.current = null;

    if (Math.abs(deltaX) < 70 || Math.abs(deltaY) > 60) return;

    if (deltaX > 0 && canGoPrevious) {
      onNavigateGame?.(-1);
    }

    if (deltaX < 0 && canGoNext) {
      onNavigateGame?.(1);
    }
  };

  const ratingSummary = getGameDetailedRatingSummary(game);
  const detailedAverage = averageDetailedRating(game);
  const hasSpecificCriteria = ratingSummary.contextualFields.length > 0;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="game-modal"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
      >
        <button
          className="modal-close-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          type="button"
        >
          ✕
        </button>

        <button
          className="game-detail-nav-btn prev"
          type="button"
          disabled={!canGoPrevious}
          onClick={() => onNavigateGame?.(-1)}
          aria-label="Jeu précédent"
        >
          ‹
        </button>

        <button
          className="game-detail-nav-btn next"
          type="button"
          disabled={!canGoNext}
          onClick={() => onNavigateGame?.(1)}
          aria-label="Jeu suivant"
        >
          ›
        </button>

        {game.image ? (
          <img src={game.image} alt={game.name} className="modal-image" />
        ) : (
          <div className="modal-image placeholder">🎮</div>
        )}

        <div className="modal-content">
          <div className="modal-title-row">
            <h2>{game.name}</h2>

            <button
              className={`heart-btn ${game.favorite ? "active" : ""}`}
              onClick={() => onToggleFavorite(game.id, game.favorite)}
              type="button"
            >
              <Heart size={18} fill={game.favorite ? "currentColor" : "none"} />
            </button>
          </div>

          {game.isDLC && game.parentGame && (
            <div className="modal-meta">
              <strong>DLC de :</strong> {game.parentGame}
            </div>
          )}

          {game.released && (
            <div className="modal-meta">
              <strong>Sortie :</strong> {formatReleaseDate(game.released)}
            </div>
          )}

          {game.platformNames?.length > 0 && (
            <div className="modal-meta">
              <strong>Plateformes :</strong> {game.platformNames.join(" • ")}
            </div>
          )}

          {game.genreNames?.length > 0 && (
            <div className="modal-meta">
              <strong>Genres :</strong> {game.genreNames.join(" • ")}
            </div>
          )}

          <div className="modal-meta">
            <strong>Temps joué :</strong> {getPlaytimeRangeLabel(game.playtimeRange)}
          </div>

          <div className="modal-meta">
            <strong>Difficulté :</strong> {difficultyLabel(game.difficulty)}
          </div>

          <div className="modal-meta">
            <strong>XP estimée :</strong> {calculateXP(game)} XP
          </div>

          <div className="game-detail-scoreboard">
            <div className="game-detail-score-main">
              <span>Note globale</span>
              <strong>{formatRating10(getGameRating(game), "À noter")}</strong>
              <small>Note principale</small>
            </div>

            <div className="game-detail-score-card">
              <span>Moyenne critères</span>
              <strong>{formatRating10(detailedAverage, "À construire")}</strong>
              <small>
                {ratingSummary.ratedBaseFields.length}/{ratingSummary.baseFields.length} essentiels
              </small>
            </div>

            <div className="game-detail-score-card">
              <span>Critères spécifiques</span>
              <strong>{ratingSummary.contextualFields.length || "-"}</strong>
              <small>
                {hasSpecificCriteria ? "Détectés pour ce jeu" : "Aucun critère en plus"}
              </small>
            </div>
          </div>

          <div className="modal-block">
            <div className="modal-block-title">Statut</div>

            <div className="status-row">
              <button
                className={`status-btn ${game.status === "wishlist" ? "active" : ""}`}
                onClick={() => onSetStatus(game.id, "wishlist")}
                type="button"
              >
                Wishlist
              </button>

              <button
                className={`status-btn ${game.status === "en cours" ? "active" : ""}`}
                onClick={() => onSetStatus(game.id, "en cours")}
                type="button"
              >
                En cours
              </button>

              <button
                className={`status-btn ${isGameInCollection(game) ? "active" : ""}`}
                onClick={() => onSetStatus(game.id, "collection")}
                type="button"
              >
                AJOUTÉ
              </button>
            </div>
          </div>

          <div className="modal-block">
            <div className="modal-block-title">Plateforme utilisée</div>

            <div className="choice-grid platform-choice-grid">
              {(game.platformNames || []).map((platform) => {
                const selected = (game.playedPlatforms || []).includes(platform);

                return (
                  <button
                    key={platform}
                    type="button"
                    className={`choice-pill small ${selected ? "active" : ""}`}
                    onClick={() => {
                      const current = game.playedPlatforms || [];
                      const next = selected
                        ? current.filter((p) => p !== platform)
                        : [...current, platform];

                      onSetPlayedPlatforms(game.id, next);
                    }}
                  >
                    {selected ? "✓ " : ""}
                    {platform}
                  </button>
                );
              })}
            </div>

            {(!game.platformNames || game.platformNames.length === 0) && (
              <div className="option-value">Aucune plateforme détectée pour ce jeu.</div>
            )}
          </div>

          <div className="modal-block">
            <div className="modal-block-title">DLC & Extensions</div>

            {loadingDlcs && <div className="option-value">Recherche des DLC...</div>}

            {!loadingDlcs && dlcs.length === 0 && (
              <div className="option-value">Aucun DLC trouvé automatiquement.</div>
            )}

            {!loadingDlcs && dlcs.length > 0 && (
              <div className="library-dlc-list">
                {dlcs.map((dlc) => {
                  const alreadyAdded = games.some(
                    (g) =>
                      g.rawgId === dlc.id ||
                      (g.name || "").toLowerCase() === (dlc.name || "").toLowerCase()
                  );

                  return (
                    <div key={dlc.id} className="library-dlc-card">
                      {dlc.background_image ? (
                        <img src={dlc.background_image} alt={dlc.name} />
                      ) : (
                        <div className="library-dlc-placeholder">🎮</div>
                      )}

                      <div className="library-dlc-content">
                        <div className="library-dlc-title">{dlc.name}</div>

                        <div className="library-dlc-meta">
                          {dlc.released ? formatReleaseDate(dlc.released) : "Date inconnue"}
                        </div>

                        {alreadyAdded ? (
                          <div className="already-added">✔ Déjà ajouté</div>
                        ) : (
                          <button
                            type="button"
                            className="library-dlc-btn"
                            onClick={() =>
                              onAddGame({
                                name: dlc.name,
                                rating: 0,
                                favorite: false,
                                image: dlc.background_image || "",
                                status: "collection",
                                released: dlc.released || "",
                                platformNames: game.platformNames || [],
                                genreNames: game.genreNames || [],
                                playtime: dlc.playtime || null,
                                difficulty: "normal",
                                progressStatus: "not_started",
                                playtimeRange: "none",
                                review: "",
                                ratingGraphics: 0,
                                ratingGameplay: 0,
                                ratingStory: 0,
                                ratingSound: 0,
                                ostRating: 0,
                                ratingLongevity: 0,
                                rawgId: dlc.id,
                                isDLC: true,
                                parentGame: game.name,
                              })
                            }
                          >
                            Ajouter à la collection
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="modal-block">
            <div className="modal-block-title">Progression</div>

            <div className="choice-grid progress-choice-grid">
              {PROGRESS_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={`choice-pill ${
                    (game.progressStatus ||
                      (isGameFinishedStatus(game) ? "completed" : "not_started")) === option.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => onSetProgressStatus(game.id, option.id)}
                  type="button"
                >
                  <span className="choice-icon">{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="modal-block">
            <div className="modal-block-title">Temps joué estimé</div>

            <div className="choice-grid time-choice-grid">
              {PLAYTIME_RANGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={`choice-pill small ${
                    (game.playtimeRange || "none") === option.id ? "active" : ""
                  }`}
                  onClick={() => onSetPlaytimeRange(game.id, option.id)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-block">
            <div className="modal-block-title">Difficulté</div>

            <div className="status-row">
              <button
                className={`status-btn ${game.difficulty === "casual" ? "active" : ""}`}
                onClick={() => onSetDifficulty(game.id, "casual")}
                type="button"
              >
                Casual
              </button>

              <button
                className={`status-btn ${game.difficulty === "normal" ? "active" : ""}`}
                onClick={() => onSetDifficulty(game.id, "normal")}
                type="button"
              >
                Normal
              </button>

              <button
                className={`status-btn ${game.difficulty === "hard" ? "active" : ""}`}
                onClick={() => onSetDifficulty(game.id, "hard")}
                type="button"
              >
                Hard
              </button>

              <button
                className={`status-btn ${game.difficulty === "hardcore" ? "active" : ""}`}
                onClick={() => onSetDifficulty(game.id, "hardcore")}
                type="button"
              >
                Hardcore
              </button>
            </div>
          </div>

          <div className="modal-block">
            <div className="modal-block-title">Note globale</div>

            <RatingSlider
              rating={getGameRating(game)}
              onRate={(value) => onSetRating(game.id, value)}
            />
          </div>

          <div className="modal-block">
            <div className="modal-block-title">Notes détaillées</div>

            <DetailedRatingsBlock
              game={game}
              onSetDetailedRating={onSetDetailedRating}
            />
          </div>

          <div className="modal-block ost-block">
            <div className="modal-block-title">OST / Musique</div>

            <div className="ost-summary">
              <div>
                <span>Note OST</span>
                <strong>{formatRating10(localOstRating, "Pas notée")}</strong>
              </div>
              {game.ostLink && (
                <a href={game.ostLink} target="_blank" rel="noreferrer">
                  Écouter
                </a>
              )}
            </div>

            <RatingSlider
              rating={localOstRating}
              onRate={(value) => setLocalOstRating(value)}
            />

            <div className="ost-fields">
              <label>
                <span>Morceau préféré</span>
                <input
                  value={localOstTrack}
                  onChange={(e) => setLocalOstTrack(e.target.value)}
                  placeholder="Ex : Snake Eater, Secunda, Bury the Light..."
                />
              </label>

              <label>
                <span>Lien d'écoute</span>
                <input
                  value={localOstLink}
                  onChange={(e) => setLocalOstLink(e.target.value)}
                  placeholder="Spotify, YouTube, Apple Music..."
                />
              </label>
            </div>

            <button
              className="save-review-btn"
              type="button"
              onClick={() =>
                onSetOstInfo(game.id, {
                  ostRating: localOstRating,
                  ostTrack: localOstTrack,
                  ostLink: localOstLink,
                })
              }
            >
              Enregistrer l'OST
            </button>
          </div>

          <div className="modal-block">
            <div className="modal-block-title">Avis personnel</div>

            <textarea
              className="review-textarea"
              value={localReview}
              onChange={(e) => setLocalReview(e.target.value)}
              placeholder="Ton avis sur ce jeu..."
            />

            <button
              className="save-review-btn"
              type="button"
              onClick={() => {
                onSetReview(game.id, localReview);

                setTimeout(() => {
                  onClose();
                }, 150);
              }}
            >
              Enregistrer
            </button>
          </div>

          <button
            className="delete-large-btn"
            onClick={() => onDelete(game.id)}
            type="button"
          >
            Supprimer ce jeu
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- LIBRARY SECTION -------------------- */

/* ==================== BIBLIOTHÈQUE ==================== */

function LibraryShelf3D({ games, onOpenDetail }) {
  const displayedGames = games;
  const gamesPerShelf = 24;

  const groupedByPlatform = displayedGames.reduce((acc, game) => {
    const platforms =
      game.playedPlatforms?.length > 0
        ? game.playedPlatforms
        : game.platformNames?.length > 0
        ? [game.platformNames[0]]
        : ["Autre"];

    platforms.forEach((platform) => {
      if (!acc[platform]) acc[platform] = [];
      acc[platform].push(game);
    });

    return acc;
  }, {});

  const platformGroups = Object.entries(groupedByPlatform).sort(
    ([a], [b]) => a.localeCompare(b)
  );

  if (!displayedGames.length) {
    return (
      <EmptyState
        title="Aucun jeu à afficher"
        subtitle="Ajoute des jeux à ta collection pour remplir l’étagère."
      />
    );
  }

  return (
    <div className="shelf3d-scene shelf3d-multi shelf3d-platforms">
      <div className="shelf3d-title-block">
        <h2>Bibliothèque 3D</h2>
        <p>
          {displayedGames.length} jeux rangés par console sur tes étagères.
        </p>
      </div>

      <div className="shelf3d-platform-list">
        {platformGroups.map(([platform, platformGames]) => {
          const shelves = [];

          for (let i = 0; i < platformGames.length; i += gamesPerShelf) {
            shelves.push(platformGames.slice(i, i + gamesPerShelf));
          }

          return (
            <section key={platform} className="shelf3d-platform-section">
              <div className="shelf3d-platform-header">
                <div>
                  <h3>{platform}</h3>
                  <p>{platformGames.length} jeux</p>
                </div>
              </div>

              <div className="shelf3d-cabinet">
                {shelves.map((shelfGames, shelfIndex) => (
                  <div key={`${platform}-${shelfIndex}`} className="shelf3d-level">
                    <div className="shelf3d-level-back" />

                    <div className="shelf3d-level-games">
                      {shelfGames.map((game) => (
                        <button
                          key={`${platform}-${game.id}`}
                          type="button"
                          className="shelf3d-case"
                          style={{
                            "--cover": `url(${game.image || ""})`,
                          }}
                          onClick={() => onOpenDetail(game)}
                        >
                          <span className="shelf3d-cover" />
                          <span className="shelf3d-label">{game.name}</span>
                        </button>
                      ))}
                    </div>

                    <div className="shelf3d-wood" />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function LibrarySection({
  title,
  games,
  onDelete,
  onSetStatus,
  onSetRating,
  onToggleFavorite,
  onOpenDetail,
  libraryCardMode,
  setLibraryCardMode,
}) {
  const [sortBy, setSortBy] = useState("recent");

  const sortedGames = [...games].sort((a, b) => {
    if (sortBy === "year") {
      return (b.released || "").localeCompare(a.released || "");
    }

    if (sortBy === "platform") {
      return (a.platformNames?.[0] || "Plateforme inconnue").localeCompare(
        b.platformNames?.[0] || "Plateforme inconnue"
      );
    }

    if (sortBy === "genre") {
      return (a.genreNames?.[0] || "Genre inconnu").localeCompare(
        b.genreNames?.[0] || "Genre inconnu"
      );
    }

    return 0;
  });

  const groupedGames = sortedGames.reduce((acc, game) => {
    let group = "Autres";

    if (sortBy === "year") {
      group = game.released?.split("-")[0] || "Année inconnue";
    }

    if (sortBy === "platform") {
      group = game.platformNames?.[0] || "Plateforme inconnue";
    }

    if (sortBy === "genre") {
      group = game.genreNames?.[0] || "Genre inconnu";
    }

    if (!acc[group]) acc[group] = [];
    acc[group].push(game);

    return acc;
  }, {});

  const renderGameCard = (game) => {
    const progressLabel = getProgressLabel(
      game.progressStatus ||
        (isGameFinishedStatus(game) ? "completed" : "not_started")
    );

    const playtimeLabel = getPlaytimeRangeLabel(game.playtimeRange);

    if (libraryCardMode === "compact") {
      return (
        <div
          key={game.id}
          className="game-grid-item"
          onClick={() => onOpenDetail(game)}
        >
          {game.image ? (
            <img src={game.image} alt={game.name} />
          ) : (
            <div className="game-grid-placeholder">🎮</div>
          )}

          <div className="grid-top-actions">
            <button
              className={`heart-btn grid-heart ${game.favorite ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(game.id, game.favorite);
              }}
              type="button"
            >
              <Heart size={18} fill={game.favorite ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="grid-overlay">
            <div className="grid-title">{game.name}</div>

            <div className="grid-meta">
              <span>
                {game.status === "wishlist"
                  ? formatFullDate(game.released)
                  : game.released?.split("-")[0] || "—"}
              </span>
              <span>⭐ {formatRating10(getGameRating(game), "-")}</span>
            </div>

            <div className={`grid-status ${game.status.replace(" ", "-")}`}>
              {game.status === "wishlist"
                ? "Wishlist"
                : game.status === "en cours"
                ? "En cours"
                : "Collection"}
            </div>

            {game.status === "wishlist" && (
              <div className="grid-countdown">
                {getReleaseCountdown(game.released)}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (libraryCardMode === "detailed") {
      return (
        <div
          key={game.id}
          className="game-item clickable library-simple-card"
          onClick={() => onOpenDetail(game)}
        >
          {game.image ? (
            <img src={game.image} alt={game.name} className="library-game-cover" />
          ) : (
            <div className="game-thumb placeholder">🎮</div>
          )}

          <div className="game-item-content">
            <div className="game-name">{game.name}</div>

            <div className="library-meta">
              {game.released?.split("-")[0] || "Année inconnue"}
              {game.genreNames?.length > 0 &&
                ` • ${game.genreNames.slice(0, 2).join(" • ")}`}
            </div>

            <div className="library-meta">
              {progressLabel} • {playtimeLabel}
            </div>
            <div className="library-meta">
              ⭐ {formatRating10(getGameRating(game), "Pas encore noté")}
            </div>
          </div>

          <button
            className={`heart-btn ${game.favorite ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(game.id, game.favorite);
            }}
            type="button"
          >
            <Heart size={18} fill={game.favorite ? "currentColor" : "none"} />
          </button>
        </div>
      );
    }

    return (
      <div
        key={game.id}
        className="game-item clickable detailed-card"
        onClick={() => onOpenDetail(game)}
      >
        <div className={`status-badge ${game.status.replace(" ", "-")}`}>
          {game.status === "wishlist" ? (
            <List size={14} />
          ) : game.status === "en cours" ? (
            <Play size={14} />
          ) : (
            <Check size={14} />
          )}
        </div>

        <div className="game-card-head">
          <div className="game-item-left">
            {game.image ? (
              <img src={game.image} alt={game.name} className="game-thumb" />
            ) : (
              <div className="game-thumb placeholder">🎮</div>
            )}
          </div>

          <div className="game-head-main">
            <div className="game-head-top">
              <div className="game-main-info">
                <div className="game-name">{game.name}</div>

                {game.released && (
                  <div className="library-meta">
                    <strong>Sortie :</strong> {game.released}
                  </div>
                )}

                {game.genreNames?.length > 0 && (
                  <div className="library-meta genre-text">
                    <strong>Genres :</strong>{" "}
                    {game.genreNames.slice(0, 2).join(" • ")}
                  </div>
                )}

                <div className="library-meta">
                  <strong>Progression :</strong> {progressLabel}
                </div>

                <div className="library-meta">
                  <strong>Temps joué :</strong> {playtimeLabel}
                </div>

                <div className="library-meta">
                  <strong>XP :</strong> {calculateXP(game)} XP
                </div>

                <div className="library-meta">
                  <strong>Moyenne détaillée :</strong>{" "}
                  {formatRating10(averageDetailedRating(game), "Pas encore notée")}
                </div>

                {game.platformNames?.length > 0 && (
                  <div className="library-meta platforms-text">
                    <strong>Plateformes :</strong>{" "}
                    {game.platformNames.slice(0, 2).join(" • ")}
                  </div>
                )}
              </div>

              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(game.id);
                }}
                type="button"
              >
                X
              </button>
            </div>
          </div>
        </div>

        <div className="game-card-actions">
          <div className="status-row">
            <button
              className={`status-btn ${game.status === "wishlist" ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onSetStatus(game.id, "wishlist");
              }}
              type="button"
            >
              Wishlist
            </button>

            <button
              className={`status-btn ${game.status === "en cours" ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onSetStatus(game.id, "en cours");
              }}
              type="button"
            >
              En cours
            </button>

            <button
              className={`status-btn ${isGameInCollection(game) ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onSetStatus(game.id, "collection");
              }}
              type="button"
            >
              Collection
            </button>
          </div>

          <div className="detailed-bottom-row">
            <RatingSlider
              rating={getGameRating(game)}
              onRate={(value) => onSetRating(game.id, value)}
            />

            <button
              className={`heart-btn ${game.favorite ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(game.id, game.favorite);
              }}
              type="button"
            >
              <Heart size={18} fill={game.favorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="library-section">
      <div className="section-header">
        <h2>{title}</h2>
        <span className="section-count">{games.length} jeux</span>
      </div>

      <div className="library-view-toggle">
        <button
          type="button"
          className={libraryCardMode === "compact" ? "active" : ""}
          onClick={() => setLibraryCardMode("compact")}
        >
          Compact
        </button>

        <button
          type="button"
          className={libraryCardMode === "complete" ? "active" : ""}
          onClick={() => setLibraryCardMode("complete")}
        >
          Complet
        </button>

        <button
          type="button"
          className={`library-switch-btn ${libraryCardMode === "shelf" ? "active" : ""}`}
          onClick={() => setLibraryCardMode("shelf")}
        >
          Étagère 3D
        </button>
      </div>

      <div className="library-sort">
        <button
          type="button"
          className={sortBy === "recent" ? "active" : ""}
          onClick={() => setSortBy("recent")}
        >
          Récent
        </button>

        <button
          type="button"
          className={sortBy === "year" ? "active" : ""}
          onClick={() => setSortBy("year")}
        >
          Année
        </button>

        <button
          type="button"
          className={sortBy === "platform" ? "active" : ""}
          onClick={() => setSortBy("platform")}
        >
          Plateforme
        </button>

        <button
          type="button"
          className={sortBy === "genre" ? "active" : ""}
          onClick={() => setSortBy("genre")}
        >
          Genre
        </button>
      </div>

      {games.length === 0 ? (
        <EmptyState
          title="Aucun jeu ici"
          subtitle="Ajoute des jeux ou change leur statut pour remplir cette section."
        />
      ) : libraryCardMode === "shelf" ? (
        <LibraryShelf3D
          games={games}
          onOpenDetail={onOpenDetail}
        />
      ) : (
        <div
          className={
            libraryCardMode === "compact"
              ? "games-grid library-compact-grid"
              : "games-list"
          }
        >
          {sortBy === "recent"
            ? sortedGames.map((game) => renderGameCard(game))
            : Object.entries(groupedGames).map(([groupName, groupGames]) => (
                <div key={groupName} className="library-group">
                  <div className="library-group-title">
                    <span>{groupName}</span>
                    <span>{groupGames.length}</span>
                  </div>

                  {groupGames.map((game) => renderGameCard(game))}
                </div>
              ))}
        </div>
      )}
    </div>
  );
}

/* -------------------- OPTIONS -------------------- */

const FALLBACK_GAMING_EVENTS = [
  {
    id: "summer-game-fest",
    name: "Summer Game Fest",
    date: "2026-06-06T21:00:00",
    durationHours: 2,
    youtubeId: "VIDEO_ID_ICI",
    type: "Showcase",
    description: "Conférence gaming avec annonces, trailers et nouveautés.",
  },
  {
    id: "game-awards",
    name: "The Game Awards",
    date: "2026-12-12T01:30:00",
    durationHours: 3,
    youtubeId: "VIDEO_ID_ICI",
    type: "Cérémonie",
    description: "Récompenses, annonces mondiales et gros trailers.",
  },
];

function getEventState(event) {
  const now = new Date();
  const start = new Date(event.date);
  const end = new Date(start);

  end.setHours(end.getHours() + (event.durationHours || 2));

  if (now >= start && now <= end) return "live";
  if (now < start) return "upcoming";
  return "ended";
}

function getSortedEvents(events = FALLBACK_GAMING_EVENTS) {
  return [...events].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
}

function getUpcomingEvents(events = FALLBACK_GAMING_EVENTS) {
  return getSortedEvents(events).filter(
    (event) => getEventState(event) !== "ended"
  );
}

function formatEventDate(date) {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const DEFAULT_SOCIAL_PROFILE = {
  displayName: "Player One",
  handle: "checkpoint",
  bio: "Je construis mon univers gaming, une partie après l'autre.",
  platform: "Multi-plateforme",
  visibility: "prive",
  featuredBadgeId: "",
  identityGameIds: [],
  setupPhotos: [],
  collectionPhotos: [],
  publicSections: DEFAULT_PUBLIC_SECTIONS,
};

function getInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "C";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function parseActivityDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatActivityTime(value) {
  const date = parseActivityDate(value);
  if (!date) return "Récemment";

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getSocialActivityFeed(games = [], hardware = [], badges = []) {
  const activities = [];

  games.forEach((game, index) => {
    const date = parseActivityDate(game.updatedAt || game.createdAt);
    const base = {
      id: `game-${game.id || index}`,
      image: game.image || "",
      title: game.name,
      date: game.updatedAt || game.createdAt,
      sortTime: date?.getTime() || 0,
      priority: 20 - index,
    };

    if (getGameRating(game) > 0) {
      activities.push({
        ...base,
        type: "Note",
        text: `a noté ${game.name}`,
        detail: formatRating10(getGameRating(game)),
        priority: base.priority + 50,
      });
      return;
    }

    if (game.review && game.review.trim().length > 10) {
      activities.push({
        ...base,
        type: "Avis",
        text: `a publié un avis sur ${game.name}`,
        detail: game.review.trim().slice(0, 90),
        priority: base.priority + 45,
      });
      return;
    }

    if (game.status === "wishlist") {
      activities.push({
        ...base,
        type: "Wishlist",
        text: `a ajouté ${game.name} à sa wishlist`,
        detail: game.released?.split("-")[0] || "Jeu à suivre",
        priority: base.priority + 10,
      });
      return;
    }

    if (game.status === "en cours") {
      activities.push({
        ...base,
        type: "En cours",
        text: `a commence ${game.name}`,
        detail: "Partie en cours",
        priority: base.priority + 30,
      });
      return;
    }

    activities.push({
      ...base,
      type: "Collection",
      text: `a ajouté ${game.name} à sa collection`,
      detail: game.released?.split("-")[0] || "Jeu ajouté",
      priority: base.priority + 15,
    });
  });

  hardware.forEach((item, index) => {
    const itemRating = clampRating(item.rating);
    const date = parseActivityDate(item.updatedAt || item.createdAt);
    activities.push({
      id: `hardware-${item.id || index}`,
      image: item.image || "",
      title: item.name,
      type: itemRating ? "Matériel noté" : "Matériel",
      text: itemRating
        ? `a noté ${item.name}`
        : `a ajouté ${item.name} à son matériel`,
      detail: itemRating ? formatRating10(itemRating) : item.status || "Collection",
      date: item.updatedAt || item.createdAt,
      sortTime: date?.getTime() || 0,
      priority: 8 - index,
    });
  });

  badges
    .filter((badge) => badge.unlocked)
    .slice(0, 5)
    .forEach((badge, index) => {
      activities.push({
        id: `badge-${badge.id}`,
        image: "",
        title: badge.name,
        type: "Badge",
        text: `a débloqué le badge ${badge.name}`,
        detail: badge.desc,
        date: null,
        sortTime: 0,
        priority: 35 - index,
      });
    });

  return activities
    .sort((a, b) => {
      if (b.sortTime !== a.sortTime) return b.sortTime - a.sortTime;
      return b.priority - a.priority;
    })
    .slice(0, 20);
}

function normalizeHandle(handle = "") {
  return handle.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");
}

function getProfileShareUrl(handle) {
  if (!handle) return "";

  return `${window.location.origin}${window.location.pathname}?profile=${encodeURIComponent(
    handle
  )}`;
}

function getCurrentOwnedHardware(hardware = []) {
  return hardware.filter((item) => {
    const status = getNormalizedStatus(item?.status || "");
    return status.includes("poss") || status.includes("reparer");
  });
}

function getHardwareConsoleGameStats(hardwareItem, games = []) {
  if (hardwareItem?.type !== "console") {
    return {
      games: 0,
      xp: 0,
      level: 1,
      progressPercent: 0,
    };
  }

  const consoleName = hardwareItem.name?.toLowerCase() || "";
  const parentName = hardwareItem.parentName?.toLowerCase() || "";
  const brand = hardwareItem.brand?.toLowerCase() || "";

  const matchedGames = games.filter((game) => {
    const platforms =
      game.playedPlatforms?.length > 0
        ? game.playedPlatforms
        : game.platformNames || [];

    return platforms.some((platform) => {
      const p = platform.toLowerCase();

      return (
        p.includes(consoleName) ||
        consoleName.includes(p) ||
        p.includes(parentName) ||
        parentName.includes(p) ||
        p.includes(brand)
      );
    });
  });

  const xp = matchedGames.reduce((sum, game) => sum + calculateXP(game), 0);

  return {
    games: matchedGames.length,
    xp,
    level: Math.max(1, Math.floor(xp / 500) + 1),
    progressPercent: Math.min(100, (xp % 500) / 5),
  };
}

const PUBLIC_HARDWARE_GROUPS = [
  { id: "console", label: "Consoles" },
  { id: "controller", label: "Manettes" },
  { id: "audio", label: "Audio" },
  { id: "speaker", label: "Enceintes" },
  { id: "vr", label: "VR" },
  { id: "display", label: "Ecrans & TV" },
  { id: "mouse", label: "Souris" },
  { id: "keyboard", label: "Claviers" },
  { id: "other", label: "Autre matériel" },
];

function getPublicHardwareGroup(type) {
  if (["console", "controller", "audio", "speaker", "vr", "display", "mouse", "keyboard"].includes(type)) {
    return type;
  }

  return "other";
}

function resizeSocialPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Format image invalide"));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxSize = 1100;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");

        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          src: canvas.toDataURL("image/jpeg", 0.78),
          name: file.name,
          addedAt: new Date().toISOString(),
        });
      };

      image.onerror = reject;
      image.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ActivityFeed({ activities = [], compact = false }) {
  if (!activities.length) {
    return (
      <EmptyState
        title="Aucune activité"
        subtitle="Ajoute des jeux, du matériel ou des notes pour alimenter ton feed."
      />
    );
  }

  return (
    <div className={`social-feed ${compact ? "compact" : ""}`}>
      {activities.map((activity) => (
        <div key={activity.id} className="social-feed-item">
          {activity.image ? (
            <img src={activity.image} alt={activity.title} />
          ) : (
            <div className="social-feed-placeholder">
              {activity.type === "Badge" ? "B" : "C"}
            </div>
          )}

          <div className="social-feed-main">
            <div className="social-feed-top">
              <span>{activity.type}</span>
              <small>{formatActivityTime(activity.date)}</small>
            </div>
            <strong>{activity.text}</strong>
            {activity.detail && <p>{activity.detail}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function PublicProfilePreview({
  profile,
  title = "Profil public",
  actionLabel,
  onAction,
  onClose,
}) {
  const [selectedHardware, setSelectedHardware] = useState(null);

  if (!profile) return null;
  const publicSections = {
    ...DEFAULT_PUBLIC_SECTIONS,
    ...(profile.publicSections || {}),
  };
  const profileShowcase = profile.showcase || {
    topScores: (profile.essentialTops || []).map((section) => ({
      key: section.key,
      label: section.label,
      game: section.game,
    })),
    specializedTops: [],
    gotyHighlights: [],
    hardwareHighlights: [],
  };

  return (
    <div className="search-panel social-public-profile">
      <div className="home-section-head">
        <div>
          <h2 className="panel-title">{title}</h2>
          <div className="option-value">@{profile.handle}</div>
        </div>
        {onClose && (
          <button type="button" onClick={onClose}>
            Fermer
          </button>
        )}
      </div>

      <div className="social-public-profile-body">
        <div className="social-avatar">{getInitials(profile.displayName)}</div>
        <div>
          <div className="public-profile-name-row">
            <h3>{profile.displayName}</h3>
            <FeaturedBadgePill badge={profile.featuredBadge} />
          </div>
          <p>{profile.bio || "Profil Checkpoint"}</p>
          <div className="social-profile-tags">
            <span>Niveau {profile.level || 1}</span>
            <span>{profile.platform || "Multi-plateforme"}</span>
            <span>{profile.finishedGames || 0} terminés</span>
            <span>{profile.averageRating || "-"} note moy.</span>
            <span>{profile.hardwareCount || 0} matériel</span>
          </div>
        </div>
      </div>

      {publicSections.photos && profile.setupPhotos?.length > 0 && (
        <div className="social-public-mini-section">
          <strong>Setup</strong>
          <div className="social-photo-gallery">
            {profile.setupPhotos.map((photo) => (
              <img key={photo.id || photo.src} src={photo.src} alt="Setup" />
            ))}
          </div>
        </div>
      )}

      {publicSections.photos && profile.collectionPhotos?.length > 0 && (
        <div className="social-public-mini-section">
          <strong>Collection physique</strong>
          <div className="social-photo-gallery">
            {profile.collectionPhotos.map((photo) => (
              <img
                key={photo.id || photo.src}
                src={photo.src}
                alt="Collection physique"
              />
            ))}
          </div>
        </div>
      )}

      {publicSections.essential &&
        (profile.identityTitle ||
          profileShowcase.topScores?.length > 0 ||
          profileShowcase.specializedTops?.length > 0 ||
          profileShowcase.gotyHighlights?.length > 0 ||
          profileShowcase.hardwareHighlights?.length > 0) && (
        <div className="social-public-mini-section">
          <strong>Vitrine Checkpoint</strong>
          <ProfileShowcase showcase={profileShowcase} identityTitle={profile.identityTitle} />
        </div>
      )}

      {publicSections.identityGames && profile.identityGames?.length > 0 && (
        <div className="social-public-mini-section">
          <strong>Mes 3 jeux fondateurs</strong>
          <div className="social-identity-games">
            {profile.identityGames.map((game, index) => (
              <div key={game.id || game.name} className="social-identity-game">
                <span className="social-identity-rank">{index + 1}</span>
                {game.image ? <img src={game.image} alt={game.name} /> : null}
                <div>
                  <strong>{game.name}</strong>
                  <span>
                    {game.platforms?.length
                      ? game.platforms.slice(0, 2).join(", ")
                      : game.rating
                        ? formatGameRating10(game.rating)
                        : "Jeu marquant"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {publicSections.hardware && profile.currentHardware?.length > 0 && (
        <div className="social-public-mini-section">
          <strong>Matériel actuel</strong>
          <div className="social-public-hardware-groups">
            {PUBLIC_HARDWARE_GROUPS.map((group) => {
              const items = profile.currentHardware.filter(
                (item) => getPublicHardwareGroup(item.type) === group.id
              );

              if (!items.length) return null;

              return (
                <div key={group.id} className="social-public-hardware-group">
                  <div className="social-public-hardware-group-title">
                    {group.label}
                  </div>
                  <div className="social-public-favorites">
                    {items.map((item) => (
                      <button
                        key={item.id || item.name}
                        type="button"
                        className="social-public-favorite hardware"
                        onClick={() =>
                          setSelectedHardware((current) =>
                            current?.id === item.id ? null : item
                          )
                        }
                      >
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : null}
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedHardware && (
        <div className="social-public-hardware-detail">
          <div>
            <strong>{selectedHardware.name}</strong>
            <span>
              {selectedHardware.type === "console"
                ? "Console"
                : selectedHardware.type === "controller"
                ? "Manette"
                : selectedHardware.type === "audio"
                ? "Audio"
                : selectedHardware.type === "display"
                ? "Ecran / TV"
                : "Matériel"}
              {" • "}
              {selectedHardware.status || "Possédé"}
            </span>
          </div>

          <div className="social-public-hardware-stats">
            <span>{formatRating10(selectedHardware.rating, "-")}</span>
            {selectedHardware.type === "console" && (
              <span>{selectedHardware.gameCount || 0} jeux joués</span>
            )}
          </div>

          {selectedHardware.ratings &&
            Object.keys(selectedHardware.ratings).length > 0 && (
              <div className="social-public-rating-grid">
                {getHardwareRatingFields(selectedHardware.type)
                  .filter((field) => selectedHardware.ratings[field.key])
                  .map((field) => (
                    <div key={field.key}>
                      <span>{field.label}</span>
                      <strong>{formatRating10(selectedHardware.ratings[field.key], "-")}</strong>
                    </div>
                  ))}
              </div>
            )}
        </div>
      )}

      {publicSections.activity && profile.recentActivity?.length > 0 && (
        <div className="social-public-mini-section">
          <strong>Activité récente</strong>
          <ActivityFeed activities={profile.recentActivity.slice(0, 4)} compact />
        </div>
      )}

      {actionLabel && onAction && (
        <button type="button" className="social-public-add" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function ProfileShowcase({ showcase, identityTitle = null }) {
  const hasTopScores = showcase?.topScores?.length > 0;
  const hasSpecialized = showcase?.specializedTops?.length > 0;
  const hasGoty = showcase?.gotyHighlights?.length > 0;
  const hasHardware = showcase?.hardwareHighlights?.length > 0;

  if (!identityTitle && !hasTopScores && !hasSpecialized && !hasGoty && !hasHardware) {
    return null;
  }

  return (
    <div className="profile-showcase">
      {identityTitle && (
        <div className="profile-showcase-signature">
          <span>Signature joueur</span>
          <strong>{identityTitle.title}</strong>
          <p>{identityTitle.subtitle}</p>
        </div>
      )}

      {hasTopScores && (
        <div className="profile-showcase-section">
          <div className="profile-showcase-section-title">Tops jeux</div>
          <div className="profile-showcase-grid">
            {showcase.topScores.map((item) => (
              <div
                key={item.key}
                className={`profile-showcase-card ${item.game.image ? "" : "no-image"}`}
              >
                {item.game.image ? <img src={item.game.image} alt={item.game.name} /> : null}
                <div>
                  <span>{item.label}</span>
                  <strong>{item.game.name}</strong>
                  <small>{formatTopScore(item.game.score, item.key)}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasSpecialized && (
        <div className="profile-showcase-section">
          <div className="profile-showcase-section-title">Tops spécialisés</div>
          <div className="profile-showcase-grid">
            {showcase.specializedTops.map((item) => (
              <div
                key={`${item.label}-${item.game.id}`}
                className={`profile-showcase-card ${item.game.image ? "" : "no-image"}`}
              >
                {item.game.image ? <img src={item.game.image} alt={item.game.name} /> : null}
                <div>
                  <span>{item.label}</span>
                  <strong>{item.game.name}</strong>
                  <small>{item.criterion} · {formatTopScore(item.game.score, item.key)}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasGoty && (
        <div className="profile-showcase-section">
          <div className="profile-showcase-section-title">GOTY personnels</div>
          <div className="profile-showcase-grid compact">
            {showcase.gotyHighlights.map((item) => (
              <div
                key={`${item.year}-${item.game.id}`}
                className={`profile-showcase-card ${item.game.image ? "" : "no-image"}`}
              >
                {item.game.image ? <img src={item.game.image} alt={item.game.name} /> : null}
                <div>
                  <span>GOTY {item.year}</span>
                  <strong>{item.game.name}</strong>
                  <small>{formatTopScore(item.game.score, "rating")}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasHardware && (
        <div className="profile-showcase-section">
          <div className="profile-showcase-section-title">Matériel préféré</div>
          <div className="profile-showcase-grid compact">
            {showcase.hardwareHighlights.map((item) => (
              <div
                key={item.id || item.name}
                className={`profile-showcase-card hardware ${item.image ? "" : "no-image"}`}
              >
                {item.image ? <img src={item.image} alt={item.name} /> : null}
                <div>
                  <span>{item.label}</span>
                  <strong>{item.name}</strong>
                  <small>{formatRating10(item.score, "-")}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SocialTab({
  games,
  hardware,
  badges,
  level,
  socialProfile,
  socialFriends,
  sharedProfile,
  onCloseSharedProfile,
  onProfileChange,
  onSetProfileVisibility,
  onCopyProfileLink,
  onAddProfilePhotos,
  onRemoveProfilePhoto,
  onAddFriend,
  onRemoveFriend,
}) {
  const [friendHandle, setFriendHandle] = useState("");
  const [socialMessage, setSocialMessage] = useState("");
  const [showPublicPreview, setShowPublicPreview] = useState(false);
  const activities = getSocialActivityFeed(games, hardware, badges);
  const stats = getAdvancedStats(games);
  const favorites = games.filter((game) => game.favorite).slice(0, 3);
  const identityGameIds = Array.isArray(socialProfile.identityGameIds)
    ? socialProfile.identityGameIds.slice(0, 3).map(String)
    : [];
  const identityGames = identityGameIds
    .map((id) => games.find((game) => String(game.id) === id))
    .filter(Boolean);
  const identityTitle = getIdentityPlayerTitle(identityGames);
  const essentialTopSections = [
    { key: "rating", label: "Global", games: getTopGamesForScore(games, "rating", 1) },
    { key: "ratingGameplay", label: "Gameplay", games: getTopGamesForScore(games, "ratingGameplay", 1) },
    { key: "ratingGraphics", label: "Graphismes", games: getTopGamesForScore(games, "ratingGraphics", 1) },
  ].filter((section) => section.games.length > 0);
  const currentHardware = getCurrentOwnedHardware(hardware);
  const profileShowcase = getProfileShowcase(games, hardware);
  const featuredBadge = getFeaturedBadgeFromSelection(
    badges,
    socialProfile.featuredBadgeId
  );
  const finishedCount = games.filter(isGameFinishedStatus).length;
  const avgRating = stats.avgRating ? stats.avgRating.toFixed(1) : "-";
  const shareUrl = getProfileShareUrl(socialProfile.handle);
  const ownPublicPreview = {
    displayName: socialProfile.displayName || DEFAULT_SOCIAL_PROFILE.displayName,
    handle: normalizeHandle(socialProfile.handle),
    bio: socialProfile.bio || "",
    platform: socialProfile.platform || "",
    visibility: socialProfile.visibility || "prive",
    publicSections: {
      ...DEFAULT_PUBLIC_SECTIONS,
      ...(socialProfile.publicSections || {}),
    },
    featuredBadge,
    level,
    totalGames: games.length,
    finishedGames: finishedCount,
    hardwareCount: currentHardware.length,
    averageRating: stats.avgRating ? Math.round(stats.avgRating * 10) / 10 : 0,
    setupPhotos: socialProfile.setupPhotos || [],
    collectionPhotos: socialProfile.collectionPhotos || [],
    identityTitle,
    showcase: profileShowcase,
    identityGames: identityGames.map((game) => ({
      id: game.id,
      name: game.name,
      image: game.image || "",
      rating: getGameRating(game),
      platforms: game.platforms || [],
    })),
    essentialTops: essentialTopSections.map((section) => {
      const game = section.games[0];

      return {
        key: section.key,
        label: section.label,
        game: {
          id: game.id,
          name: game.name,
          image: game.image || "",
          score: getGameScore(game, section.key),
        },
      };
    }),
    favoriteGames: favorites.map((game) => ({
      id: game.id,
      name: game.name,
      image: game.image || "",
      rating: getGameRating(game),
    })),
    currentHardware: currentHardware.slice(0, 6).map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image || "",
      type: item.type || "",
      status: item.status || "",
      rating: clampRating(item.rating),
      ratings: item.ratings || {},
      gameCount: getHardwareConsoleGameStats(item, games).games,
    })),
    recentActivity: activities.slice(0, 8),
  };

  const handleVisibilityChange = async (visibility) => {
    const result = await onSetProfileVisibility(visibility);
    setSocialMessage(result.message);
  };

  const handleCopy = async () => {
    const result = await onCopyProfileLink();
    setSocialMessage(result.message);
  };

  const handleAddFriend = async () => {
    const result = await onAddFriend(friendHandle);
    setSocialMessage(result.message);

    if (result.ok) {
      setFriendHandle("");
    }
  };

  const handlePhotoUpload = async (field, event) => {
    const result = await onAddProfilePhotos(field, event.target.files);
    event.target.value = "";
    setSocialMessage(result.message);
  };

  const handleIdentityGameChange = (index, value) => {
    const nextIds = [...identityGameIds];
    nextIds[index] = value;
    onProfileChange(
      "identityGameIds",
      nextIds.filter(Boolean).filter((id, itemIndex, list) => list.indexOf(id) === itemIndex)
    );
  };

  return (
    <div className="progression-stack social-tab">
      <div className="search-panel social-profile-card">
        <div className="social-avatar">
          {getInitials(socialProfile.displayName)}
        </div>

        <div className="social-profile-main">
          <div className="profile-kicker">Profil social</div>
          <div className="social-profile-name-row">
            <h2 className="profile-title">{socialProfile.displayName}</h2>
            <FeaturedBadgePill badge={featuredBadge} />
          </div>
          <div className="social-handle">@{socialProfile.handle}</div>
          <p>{socialProfile.bio}</p>

          <div className="social-profile-tags">
            <span>Niveau {level}</span>
            <span>{socialProfile.platform}</span>
            <span>
              {socialProfile.visibility === "public" ? "Public" : "Privé"}
            </span>
          </div>
        </div>
      </div>

      {sharedProfile && (
        <PublicProfilePreview
          profile={sharedProfile}
          title="Profil partagé"
          onClose={onCloseSharedProfile}
          actionLabel="Ajouter ce profil en ami"
          onAction={async () => {
            const result = await onAddFriend(sharedProfile.handle);
            setSocialMessage(result.message);
          }}
        />
      )}

      {showPublicPreview && (
        <PublicProfilePreview
          profile={ownPublicPreview}
          title="Aperçu de ton profil public"
          onClose={() => setShowPublicPreview(false)}
        />
      )}

      <div className="search-panel social-share-panel">
        <div>
          <h2 className="panel-title">Visibilité du profil</h2>
          <div className="option-value">
            Choisis si ton profil peut être trouvé et partagé par tes amis.
          </div>
        </div>

        <div className="social-visibility-toggle">
          <button
            type="button"
            className={socialProfile.visibility !== "public" ? "active" : ""}
            onClick={() => handleVisibilityChange("prive")}
          >
            Privé
          </button>
          <button
            type="button"
            className={socialProfile.visibility === "public" ? "active" : ""}
            onClick={() => handleVisibilityChange("public")}
          >
            Public
          </button>
        </div>

        <div className="social-share-row">
          <div className="social-share-link">{shareUrl}</div>
          <button type="button" onClick={handleCopy}>
            Copier
          </button>
          <button type="button" onClick={() => setShowPublicPreview(true)}>
            Aperçu
          </button>
        </div>

        {socialMessage && <div className="social-message">{socialMessage}</div>}
      </div>

      <div className="social-stats-grid">
        <div className="stat-card">
          <div className="stat-value">{games.length}</div>
          <div className="stat-label">Jeux</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{finishedCount}</div>
          <div className="stat-label">Terminés</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgRating}</div>
          <div className="stat-label">Note moy.</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{currentHardware.length}</div>
          <div className="stat-label">Matériel</div>
        </div>
      </div>

      <div className="search-panel social-editor">
        <h2 className="panel-title">Identite publique</h2>
        <div className="social-editor-grid">
          <label>
            Pseudo
            <input
              value={socialProfile.displayName}
              onChange={(e) => onProfileChange("displayName", e.target.value)}
              placeholder="Ton pseudo"
            />
          </label>

          <label>
            Identifiant
            <input
              value={socialProfile.handle}
              onChange={(e) =>
                onProfileChange(
                  "handle",
                  e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "")
                )
              }
              placeholder="checkpoint"
            />
          </label>

          <label>
            Plateforme favorite
            <input
              value={socialProfile.platform}
              onChange={(e) => onProfileChange("platform", e.target.value)}
              placeholder="PlayStation, Xbox, Switch..."
            />
          </label>

        </div>

        <label className="social-bio-field">
          Bio
          <textarea
            value={socialProfile.bio}
            onChange={(e) => onProfileChange("bio", e.target.value)}
            rows={3}
            placeholder="Ta petite présentation gaming"
          />
        </label>
      </div>

      <div className="search-panel social-identity-panel">
        <div>
          <h2 className="panel-title">Jeux fondateurs</h2>
          <div className="option-value">
            Choisis les 3 jeux qui ont construit ton identité de joueur.
          </div>
        </div>

        <div className="social-identity-selectors">
          {[0, 1, 2].map((slot) => (
            <label key={slot}>
              Jeu {slot + 1}
              <select
                value={identityGameIds[slot] || ""}
                onChange={(event) =>
                  handleIdentityGameChange(slot, event.target.value)
                }
              >
                <option value="">Choisir un jeu</option>
                {games.map((game) => {
                  const gameId = String(game.id);
                  const alreadySelected =
                    identityGameIds.includes(gameId) &&
                    identityGameIds[slot] !== gameId;

                  return (
                    <option
                      key={game.id}
                      value={gameId}
                      disabled={alreadySelected}
                    >
                      {game.name}
                    </option>
                  );
                })}
              </select>
            </label>
          ))}
        </div>

        {identityGames.length ? (
          <div className="social-identity-selection-summary">
            {identityGames.length}/3 jeux selectionnes - affiches dans l'essentiel du profil.
          </div>
        ) : (
          <div className="empty-small">Aucun jeu fondateur choisi.</div>
        )}
      </div>

      <div className="search-panel social-photo-panel">
        <div className="home-section-head">
          <div>
            <h2 className="panel-title">Photos publiques</h2>
            <div className="option-value">
              Ajoute ton setup et ta collection physique au profil public.
            </div>
          </div>
        </div>

        <div className="social-photo-sections">
          {[
            { field: "setupPhotos", title: "Setup" },
            { field: "collectionPhotos", title: "Collection physique" },
          ].map((section) => (
            <div key={section.field} className="social-photo-section">
              <div className="social-photo-section-head">
                <strong>{section.title}</strong>
                <label className="social-photo-add">
                  Ajouter
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) =>
                      handlePhotoUpload(section.field, event)
                    }
                  />
                </label>
              </div>

              {(socialProfile[section.field] || []).length ? (
                <div className="social-photo-gallery editable">
                  {socialProfile[section.field].map((photo, index) => (
                    <div key={photo.id || photo.src} className="social-photo-item">
                      <img src={photo.src} alt={section.title} />
                      <button
                        type="button"
                        onClick={() => onRemoveProfilePhoto(section.field, index)}
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-small">Aucune photo ajoutée.</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="search-panel social-friends-panel">
        <div className="home-section-head">
          <div>
            <h2 className="panel-title">Amis</h2>
            <div className="option-value">
              Ajoute un profil public avec son identifiant.
            </div>
          </div>
          <span className="social-section-count">{socialFriends.length}</span>
        </div>

        <div className="social-add-friend">
          <input
            value={friendHandle}
            onChange={(e) => setFriendHandle(normalizeHandle(e.target.value))}
            placeholder="identifiant ami"
          />
          <button type="button" onClick={handleAddFriend}>
            Ajouter
          </button>
        </div>

        {socialFriends.length ? (
          <div className="social-friends-list">
            {socialFriends.map((friend) => (
              <div key={friend.handle} className="social-friend-card">
                <div className="social-friend-avatar">
                  {getInitials(friend.displayName)}
                </div>
                <div>
                  <strong>{friend.displayName}</strong>
                  <span>@{friend.handle}</span>
                  <p>{friend.bio || "Profil Checkpoint"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFriend(friend.handle)}
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucun ami pour le moment"
            subtitle="Publie ton profil, partage ton identifiant, puis ajoute ceux de tes amis."
          />
        )}
      </div>

      <div className="search-panel">
        <div className="home-section-head">
          <h2 className="panel-title">Activite recente</h2>
          <span className="social-section-count">{Math.min(activities.length, 5)}</span>
        </div>
        <ActivityFeed activities={activities.slice(0, 5)} compact />
      </div>

      <div className="search-panel social-essential-panel">
        <div className="home-section-head">
          <div>
            <h2 className="panel-title">Essentiel du profil</h2>
            <div className="option-value">
              Ta signature, tes jeux fondateurs et tes meilleurs tops.
            </div>
          </div>
        </div>

        {identityGames.length || essentialTopSections.length ? (
          <div className="social-essential-grid">
            {identityGames.length > 0 && (
              <div className="social-essential-card signature">
                <span>Signature</span>
                <strong>{identityTitle.title}</strong>
                <p>{identityTitle.subtitle}</p>
              </div>
            )}

            {essentialTopSections.map((section) => {
              const game = section.games[0];

              return (
                <div key={section.key} className="social-essential-card">
                  <span>Top {section.label}</span>
                  <strong>{game.name}</strong>
                  <p>{formatTopScore(getGameScore(game, section.key), section.key)}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Essentiel en construction"
            subtitle="Choisis tes jeux fondateurs et ajoute quelques notes pour synchroniser ton profil."
          />
        )}

        {identityGames.length > 0 && (
          <div className="social-identity-games compact-essential">
            {identityGames.map((game, index) => (
              <div key={game.id} className="social-identity-game">
                <span className="social-identity-rank">{index + 1}</span>
                {game.image ? <img src={game.image} alt={game.name} /> : null}
                <div>
                  <strong>{game.name}</strong>
                  <span>
                    {game.platforms?.length
                      ? game.platforms.slice(0, 2).join(", ")
                      : game.rating
                        ? formatGameRating10(game.rating)
                        : "Jeu fondateur"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HomeTab({
  games,
  hardware = [],
  badges,
  level,
  totalXP,
  progress,
  setActiveTab,
  onOpenDetail,
  gamingEvents = [],
  socialActivities = [],
  weeklyQuiz,
  weeklyQuizProgress = DEFAULT_WEEKLY_QUIZ_PROGRESS,
  onAnswerWeeklyQuiz,
  checkpointGoalProgress = DEFAULT_CHECKPOINT_GOAL_PROGRESS,
  onClaimCheckpointGoal,
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(() => {
    if (WEEKLY_QUIZ_QUESTIONS.length === 0) return 0;
    return Math.abs(hashString(weeklyQuiz?.weekKey || "checkpoint")) % WEEKLY_QUIZ_QUESTIONS.length;
  });

  const profile = getPlayerProfile(games);
  const quizQuestion = WEEKLY_QUIZ_QUESTIONS[quizQuestionIndex] || weeklyQuiz?.question;
  const quizChoices = useMemo(() => getQuizAnswerChoices(quizQuestion), [quizQuestion]);
  const quizAnswerKey = quizQuestion ? `free-${quizQuestion.id}` : weeklyQuiz?.weekKey;
  const quizAnswer = weeklyQuizProgress.answers?.[quizAnswerKey];
  const quizLocked = Boolean(quizAnswer);

  const isFinishedGame = isGameFinishedStatus;
  const isOwnedHardware = (item) =>
    String(item.status || "").toLowerCase().includes("poss");

  const total = games.length;
  const finished = games.filter(isFinishedGame).length;
  const inProgressCount = games.filter((g) => g.status === "en cours").length;
  const wishlistCount = games.filter((g) => g.status === "wishlist").length;

  const completion = total ? Math.round((finished / total) * 100) : 0;
  const dashboardFinished = games.filter(isFinishedGame).length;
  const ownedHardwareCount = hardware.filter(isOwnedHardware).length;
  const ratedGames = games.filter((game) => getGameRating(game) > 0);
  const averageRating =
    ratedGames.length > 0
      ? ratedGames.reduce((sum, game) => sum + getGameRating(game), 0) / ratedGames.length
      : 0;

  const inProgressGames = games
    .filter((g) => g.status === "en cours")
    .slice(0, 3);

  const backlogCandidates = games
    .filter((game) => game.status === "collection" || game.status === "wishlist")
    .filter((game) => game.progressStatus !== "completed")
    .sort((a, b) => {
      const ratingGap = getGameRating(b) - getGameRating(a);
      if (ratingGap !== 0) return ratingGap;
      return String(b.released || "").localeCompare(String(a.released || ""));
    });

  const nextPlayCandidate = inProgressGames[0] || backlogCandidates[0] || null;
  const dashboardAction = !quizLocked
    ? {
        label: "Repondre",
        title: "Quiz disponible",
        detail: `+${WEEKLY_QUIZ_XP.correct} XP a prendre maintenant.`,
        tab: "home",
      }
    : nextPlayCandidate
    ? {
        label: nextPlayCandidate.status === "en cours" ? "Continuer" : "Voir le jeu",
        title: nextPlayCandidate.status === "en cours" ? "Reprendre ta partie" : "Prochain jeu conseille",
        detail: `${nextPlayCandidate.name} - ${formatRating10(getGameRating(nextPlayCandidate), "non note")}`,
        game: nextPlayCandidate,
      }
    : {
        label: "Ajouter",
        title: "Construire ta collection",
        detail: "Ajoute quelques jeux pour lancer les recommandations.",
        tab: "search",
      };

  const hardwareByType = hardware.reduce((acc, item) => {
    if (!isOwnedHardware(item)) return acc;
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  const dashboardStats = [
    { label: "Jeux", value: total, detail: `${dashboardFinished} termines` },
    { label: "En cours", value: inProgressCount, detail: `${wishlistCount} wishlist` },
    { label: "Note moy.", value: averageRating ? formatRating10(averageRating, "-") : "-", detail: `${ratedGames.length} notes` },
    { label: "Materiel", value: ownedHardwareCount, detail: `${hardwareByType.console || 0} plateformes` },
  ];

  const badgeStats = calculateBadgeStats(games, level, hardware);

  const nextBadge = badges
    .filter((b) => !b.unlocked)
    .map((b) => ({
      ...b,
      progressData: getBadgeProgress(b, badgeStats),
    }))
    .sort((a, b) => {
      const aPercent = a.progressData
        ? a.progressData.current / a.progressData.target
        : 0;

      const bPercent = b.progressData
        ? b.progressData.current / b.progressData.target
        : 0;

      return bPercent - aPercent;
    })[0];

  const unratedGames = games.filter(
    (game) => game.status !== "wishlist" && getGameRating(game) <= 0
  );

  const unratedOwnedHardware = hardware.filter((item) => {
    if (!isOwnedHardware(item)) return false;

    const mainRating = Number(item.rating || 0);
    const detailedRatings = Object.values(item.ratings || {}).map((value) =>
      Number(value || 0)
    );

    return mainRating <= 0 && !detailedRatings.some((value) => value > 0);
  });

  const claimedGoalIds = checkpointGoalProgress.claimed || {};
  const ratedHardwareCount = Math.max(0, ownedHardwareCount - unratedOwnedHardware.length);
  const makeCheckpointGoal = (goal) => {
    const current = Math.min(Number(goal.current || 0), Number(goal.target || 1));
    const target = Math.max(Number(goal.target || 1), 1);
    const progress = Math.min((current / target) * 100, 100);
    const claimed = Boolean(claimedGoalIds[goal.id]);

    return {
      ...goal,
      current,
      target,
      progress,
      claimed,
      claimable: progress >= 100 && Number(goal.xp || 0) > 0 && !claimed,
      reward: goal.xp ? `+${goal.xp} XP` : goal.reward,
    };
  };

  const measurableGoals = [
    makeCheckpointGoal({
      id: `quiz-${weeklyQuiz?.weekKey || "free"}`,
      title: "Checkpoint quiz",
      detail: "Repondre au quiz actif pour entretenir ta serie.",
      actionLabel: quizLocked ? "Valider" : "Repondre",
      tab: "home",
      current: quizLocked ? 1 : 0,
      target: 1,
      xp: 60,
    }),
    makeCheckpointGoal({
      id: "rated-games-25",
      title: "Profil fiable",
      detail: "Atteindre 25 jeux notes pour fiabiliser tes tops.",
      actionLabel: "Valider",
      tab: "library",
      current: ratedGames.length,
      target: 25,
      xp: 120,
    }),
    makeCheckpointGoal({
      id: "rated-hardware-10",
      title: "Materiel calibre",
      detail: "Noter 10 materiels possedes pour solidifier le classement.",
      actionLabel: "Valider",
      tab: "hardware",
      current: ratedHardwareCount,
      target: 10,
      xp: 100,
    }),
    makeCheckpointGoal({
      id: "finished-games-25",
      title: "Archive solide",
      detail: "Valider 25 jeux termines dans ta collection.",
      actionLabel: "Valider",
      tab: "library",
      current: dashboardFinished,
      target: 25,
      xp: 150,
    }),
  ].filter((goal) => !goal.claimed);

  const shortcutGoals = [
    inProgressGames[0] && {
      id: "resume-game",
      title: "Reprendre une partie",
      detail: inProgressGames[0].name,
      actionLabel: "Ouvrir",
      game: inProgressGames[0],
      progress: Math.min((dashboardFinished / Math.max(total, 1)) * 100, 100),
      reward: "Raccourci",
    },
    unratedGames.length > 0 && {
      id: "rate-games",
      title: "Notes a completer",
      detail: `${unratedGames.length} jeux sans note dans la collection.`,
      actionLabel: "Bibliotheque",
      tab: "library",
      progress: Math.min((ratedGames.length / Math.max(total, 1)) * 100, 100),
      reward: "Action utile",
    },
    nextBadge?.progressData && {
      id: "badge",
      title: "Badge a portee",
      detail: `${nextBadge.name} - ${nextBadge.progressData.current}/${nextBadge.progressData.target}`,
      actionLabel: "Badges",
      tab: "profile",
      progress: Math.min(
        (nextBadge.progressData.current / Math.max(nextBadge.progressData.target, 1)) * 100,
        100
      ),
      reward: nextBadge.rarity,
    },
  ].filter(Boolean);

  const checkpointGoals = [
    ...measurableGoals.sort((a, b) => Number(b.claimable) - Number(a.claimable) || b.progress - a.progress),
    ...shortcutGoals,
  ].slice(0, 3);

  const claimedGoals = Object.values(claimedGoalIds);
  const claimedGoalsXP = checkpointGoalProgress.totalXP || 0;

  const upcomingEvents = getUpcomingEvents(gamingEvents);
  const nextEvent = upcomingEvents[0];

  useEffect(() => {
    setSelectedQuizAnswer(null);
  }, [quizAnswerKey]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const likedGames = games.filter(
        (game) => game.favorite || getGameRating(game) >= 8
      );

      const sourceGames = likedGames.length > 0 ? likedGames : games;

      if (sourceGames.length === 0) {
        setRecommendations([]);
        return;
      }

      try {
        setLoadingRecommendations(true);

        const genreScores = {};
        const platformScores = {};

        sourceGames.forEach((game) => {
          (game.genreNames || []).forEach((genre) => {
            genreScores[genre] = (genreScores[genre] || 0) + 1;
          });

          (game.platformNames || []).forEach((platform) => {
            platformScores[platform] = (platformScores[platform] || 0) + 1;
          });
        });

        const favoriteGenres = Object.entries(genreScores)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([genre]) => genre);

        const favoritePlatforms = Object.entries(platformScores)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([platform]) => platform);

        const genreQuery = favoriteGenres
          .map((genre) => genre.toLowerCase().replaceAll(" ", "-"))
          .join(",");

        const res = await fetch(
          `https://api.rawg.io/api/games?key=${API_KEY}&genres=${genreQuery}&ordering=-rating&page_size=40`
        );

        const data = await res.json();

        const ownedNames = games.map((game) => game.name.toLowerCase());

        const scored = (data.results || [])
          .filter((rawgGame) => {
            const name = rawgGame.name.toLowerCase();

            return !ownedNames.some(
              (owned) =>
                owned === name ||
                owned.includes(name) ||
                name.includes(owned)
            );
          })
          .map((rawgGame) => {
            let score = 0;

            const rawgGenres = rawgGame.genres?.map((g) => g.name) || [];
            const rawgPlatforms =
              rawgGame.platforms?.map((p) => p.platform.name) || [];

            score += (rawgGame.rating || 0) * 25;
            score += Math.min(rawgGame.ratings_count || 0, 8000) / 120;

            favoriteGenres.forEach((genre) => {
              if (rawgGenres.includes(genre)) score += 40;
            });

            favoritePlatforms.forEach((platform) => {
              if (rawgPlatforms.includes(platform)) score += 25;
            });

            const year = Number(rawgGame.released?.split("-")[0]);
            if (year >= 2015) score += 8;
            if (year >= 2020) score += 10;

            if ((rawgGame.rating || 0) < 3.5) score -= 30;
            if ((rawgGame.ratings_count || 0) < 50) score -= 20;

            return {
              ...rawgGame,
              recommendationScore: score,
            };
          })
          .sort((a, b) => b.recommendationScore - a.recommendationScore);

        setRecommendations(scored.slice(0, 5));
      } catch (e) {
        if (isAbortError(e)) return;
        console.warn("Erreur recommandations ignorée :", e);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [games]);

  return (
    <div className="home-page">
      <div className="home-hero">
        <div>
          <div className="home-kicker">Bienvenue sur Checkpoint</div>
          <h2>{profile.title}</h2>
          <p>{profile.subtitle}</p>
        </div>

        <div className="home-level-pill">
          <span>Niv.</span>
          <strong>{level}</strong>
        </div>
      </div>

      <XPCard
        totalXP={totalXP}
        level={level}
        title={getRankTitle(level)}
        progress={progress}
      />

      <div className="home-dashboard-panel">
        <div className="home-focus-card">
          <div className="home-focus-content">
            <span className="home-kicker">Checkpoint du jour</span>
            <h3>{dashboardAction.title}</h3>
            <p>{dashboardAction.detail}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (dashboardAction.game) {
                onOpenDetail(dashboardAction.game);
                return;
              }
              if (dashboardAction.tab && dashboardAction.tab !== "home") {
                setActiveTab(dashboardAction.tab);
              }
            }}
          >
            {dashboardAction.label}
          </button>
        </div>

        <div className="home-dashboard-stats">
          {dashboardStats.map((stat) => (
            <div key={stat.label} className="home-dashboard-stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
              <small>{stat.detail}</small>
            </div>
          ))}
        </div>
      </div>

      {quizQuestion && (
        <div className="weekly-quiz-card">
          <div className="weekly-quiz-top">
            <div>
              <div className="home-card-title">Quiz gaming</div>
              <p>Mode libre pour tester toute la base. Le rythme hebdo pourra être activé au lancement public.</p>
            </div>

            <div className="weekly-quiz-reward">
              <span>Récompense</span>
              <strong>+{WEEKLY_QUIZ_XP.correct} XP</strong>
            </div>
          </div>

          <div className="weekly-quiz-meta">
            <span>{quizQuestion.category}</span>
            <span>{quizQuestion.difficulty}</span>
            <span>Question {quizQuestionIndex + 1} / {WEEKLY_QUIZ_QUESTIONS.length}</span>
          </div>

          <h3 className="weekly-quiz-question">{quizQuestion.question}</h3>

          <div className="weekly-quiz-controls">
            <button
              type="button"
              onClick={() =>
                setQuizQuestionIndex((index) =>
                  index === 0 ? WEEKLY_QUIZ_QUESTIONS.length - 1 : index - 1
                )
              }
            >
              Précédente
            </button>

            <button
              type="button"
              onClick={() =>
                setQuizQuestionIndex((index) =>
                  (index + 1) % WEEKLY_QUIZ_QUESTIONS.length
                )
              }
            >
              Suivante
            </button>
          </div>

          <div className="weekly-quiz-answers">
            {quizChoices.map((choice, index) => {
              const isSelected =
                selectedQuizAnswer === choice.originalIndex ||
                quizAnswer?.answerIndex === choice.originalIndex;
              const isCorrect = quizLocked && choice.originalIndex === quizQuestion.correctIndex;
              const isWrong =
                quizLocked &&
                quizAnswer?.answerIndex === choice.originalIndex &&
                !quizAnswer.correct;

              return (
                <button
                  key={`${choice.answer}-${choice.originalIndex}`}
                  type="button"
                  className={[
                    "weekly-quiz-answer",
                    isSelected ? "selected" : "",
                    isCorrect ? "correct" : "",
                    isWrong ? "wrong" : "",
                  ].join(" ")}
                  disabled={quizLocked}
                  onClick={() => {
                    setSelectedQuizAnswer(choice.originalIndex);
                    onAnswerWeeklyQuiz?.(choice.originalIndex, {
                      question: quizQuestion,
                      answerKey: quizAnswerKey,
                      mode: "free",
                    });
                  }}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  {choice.answer}
                </button>
              );
            })}
          </div>

          {quizLocked && (
            <div className={`weekly-quiz-result ${quizAnswer.correct ? "correct" : "wrong"}`}>
              <strong>{quizAnswer.correct ? "Bonne réponse" : "Réponse validée"}</strong>
              <span>
                +{quizAnswer.earnedXP} XP · {quizQuestion.explanation}
              </span>
            </div>
          )}

          <div className="weekly-quiz-stats">
            <span>Série : {weeklyQuizProgress.streak || 0}</span>
            <span>Record : {weeklyQuizProgress.bestStreak || 0}</span>
            <span>XP quiz : {weeklyQuizProgress.totalXP || 0}</span>
          </div>
        </div>
      )}

      <div className="home-card checkpoint-goals-card">
        <div className="checkpoint-goals-head">
          <div>
            <div className="home-card-title">Objectifs Checkpoint</div>
            <p>Des objectifs utiles pour faire progresser ton hub sans remplir l'app de missions inutiles.</p>
          </div>

          <div className="checkpoint-goals-xp">
            <strong>{claimedGoals.length}</strong>
            <span>{claimedGoalsXP} XP</span>
          </div>
        </div>

        {checkpointGoals.length > 0 ? (
          <div className="checkpoint-goals-list">
            {checkpointGoals.map((goal) => (
              <div key={goal.id} className={`checkpoint-goal-row ${goal.claimable ? "claimable" : ""}`}>
                <div className="checkpoint-goal-main">
                  <div>
                    <strong>{goal.title}</strong>
                    <span>{goal.detail}</span>
                  </div>

                  <small>{goal.reward}</small>

                  <div className="checkpoint-goal-progress">
                    <div style={{ width: `${goal.progress}%` }} />
                  </div>

                  {goal.target && (
                    <em>{goal.current} / {goal.target}</em>
                  )}
                </div>

                <button
                  type="button"
                  className="checkpoint-goal-action"
                  onClick={() => {
                    if (goal.claimable) {
                      onClaimCheckpointGoal?.(goal);
                      return;
                    }

                    if (goal.game) {
                      onOpenDetail(goal.game);
                      return;
                    }

                    if (goal.tab === "home") {
                      document
                        .querySelector(".weekly-quiz-card")
                        ?.scrollIntoView({ behavior: "smooth", block: "center" });
                      return;
                    }

                    if (goal.tab) {
                      setActiveTab(goal.tab);
                    }
                  }}
                >
                  {goal.claimable ? "Valider" : goal.actionLabel}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="checkpoint-goals-empty">
            Ton hub est propre. Ajoute une nouvelle envie, une note ou un objectif pour relancer la machine.
          </div>
        )}
      </div>

      <div className="home-actions-grid">
        <button type="button" onClick={() => setActiveTab("search")}>
          🔎 Ajouter un jeu
        </button>

        <button type="button" onClick={() => setActiveTab("library")}>
          📚 Bibliothèque
        </button>

        <button type="button" onClick={() => setActiveTab("profile")}>
          🏅 Profil
        </button>
      </div>

      <div className="home-card">
        <div className="home-card-title">📊 Progression</div>

        <div className="home-stats">
          <div>🎮 {total}</div>
          <div>✅ {finished}</div>
          <div>▶️ {inProgressCount}</div>
          <div>📋 {wishlistCount}</div>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      <div className="search-panel">
        <div className="home-section-head">
          <h2 className="panel-title">Activité récente</h2>
          <button type="button" onClick={() => setActiveTab("social")}>
            Voir le social
          </button>
        </div>

        <ActivityFeed activities={socialActivities.slice(0, 4)} compact />
      </div>

      <div className="search-panel">
        <div className="home-section-head">
          <h2 className="panel-title">Jeux en cours</h2>
          <button type="button" onClick={() => setActiveTab("library")}>
            Voir tout
          </button>
        </div>

        {inProgressGames.length === 0 ? (
          <EmptyState
            title="Aucun jeu en cours"
            subtitle="Passe un jeu en statut En cours pour le retrouver ici."
          />
        ) : (
          <div className="home-game-list">
            {inProgressGames.map((game) => (
              <button
                key={game.id}
                type="button"
                className="home-game-row improved"
                onClick={() => onOpenDetail(game)}
              >
                <div className="home-game-meta">▶️ En cours</div>

                {game.image ? (
                  <img src={game.image} alt={game.name} />
                ) : (
                  <div className="home-game-placeholder">🎮</div>
                )}

                <div>
                  <strong>{game.name}</strong>
                  <span>{game.released?.split("-")[0] || "Année inconnue"}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="search-panel">
        <h2 className="panel-title">Recommandations</h2>

        {loadingRecommendations ? (
          <div className="empty-small">Chargement des suggestions...</div>
        ) : recommendations.length === 0 ? (
          <div className="empty-small">
            Ajoute plus de jeux pour obtenir des suggestions personnalisées.
          </div>
        ) : (
          <div className="home-game-list">
            {recommendations.map((game) => (
              <button
                key={game.id}
                type="button"
                className="home-game-row improved"
              >
                {game.background_image ? (
                  <img src={game.background_image} alt={game.name} />
                ) : (
                  <div className="home-game-placeholder">🎮</div>
                )}

                <div>
                  <strong>{game.name}</strong>
                  <span>
                    {game.released?.split("-")[0] || "Année inconnue"} • ⭐{" "}
                    {game.rating || "-"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="search-panel">
        <h2 className="panel-title">Prochain objectif</h2>

        {nextBadge ? (
          <div className="home-goal-card">
            <div className="badge-icon">
              <BadgeVisualIcon badge={nextBadge} />
            </div>

            <div className="home-goal-main">
              <div className="badge-name">{nextBadge.name}</div>
              <div className="badge-desc">{nextBadge.desc}</div>

              {nextBadge.progressData && (
                <div className="badge-progress">
                  {nextBadge.progressData.current} /{" "}
                  {nextBadge.progressData.target}

                  <div className="badge-progress-bar">
                    <div
                      className="badge-progress-fill"
                      style={{
                        width: `${Math.min(
                          (nextBadge.progressData.current /
                            nextBadge.progressData.target) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            title="Tous les badges sont débloqués"
            subtitle="Tu as explosé le système."
          />
        )}
      </div>

      <div className="search-panel live-event-card">
        <div className="home-section-head">
          <h2 className="panel-title">Événements à venir</h2>

          <button type="button" onClick={() => setActiveTab("live")}>
            Voir les lives
          </button>
        </div>

        {nextEvent ? (
          <>
            <div className="live-event-title">{nextEvent.name}</div>

            <div className="event-date">
              📅 {formatEventDate(nextEvent.date)}
            </div>

            <div className="empty-small">
              Prochain événement gaming à suivre.
            </div>
          </>
        ) : (
          <EmptyState
            title="Aucun événement prévu"
            subtitle="Les prochains lives seront ajoutés ici."
          />
        )}
      </div>
    </div>
  );
}

function LiveTab({
  gamingEvents, setMiniPlayerLive, setMiniPlayerCollapsed }) {

  const events = getUpcomingEvents(gamingEvents);
  const liveEvents = events.filter((event) => getEventState(event) === "live");
  const upcomingEvents = events.filter((event) => getEventState(event) === "upcoming");

  const renderEventCard = (event) => {
    const state = getEventState(event);

    return (
      <div key={event.id} className={`live-card ${state}`}>
        <div className="live-card-top">
          <div>
            <div className="live-type">{event.type || "Événement"}</div>
            <div className="live-title">{event.name}</div>
          </div>

          <span className={`live-status ${state}`}>
            {state === "live" ? "LIVE" : "À venir"}
          </span>
        </div>

        <div className="event-date">📅 {formatEventDate(event.date)}</div>

        {event.description && (
          <div className="live-description">{event.description}</div>
        )}

        <button
          type="button"
          className="save-review-btn live-open-btn"
          onClick={() => {
            setMiniPlayerLive(event);
            setMiniPlayerCollapsed(false);
          }}
          disabled={!event.youtubeId || event.youtubeId === "VIDEO_ID_ICI"}
        >
          {event.youtubeId && event.youtubeId !== "VIDEO_ID_ICI"
            ? "Ouvrir le live"
            : "Lien bientôt disponible"}
        </button>
      </div>
    );
  };

  return (
    <div className="live-page">
      <div className="section-header">
        <h2>Lives & événements</h2>
        <span className="section-count">{events.length}</span>
      </div>

      {liveEvents.length > 0 && (
        <div className="live-section">
          <h3 className="live-section-title">🔴 En direct maintenant</h3>
          <div className="live-list">
            {liveEvents.map(renderEventCard)}
          </div>
        </div>
      )}

      <div className="live-section">
        <h3 className="live-section-title">📅 À venir</h3>

        {upcomingEvents.length > 0 ? (
          <div className="live-list">
            {upcomingEvents.map(renderEventCard)}
          </div>
        ) : (
          <EmptyState
            title="Aucun événement à venir"
            subtitle="Les prochains lives gaming apparaîtront ici."
          />
        )}
      </div>
    </div>
  );
}

function AddEventForm({ editingEvent, onCancelEdit }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(2);
  const [youtubeId, setYoutubeId] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editingEvent) {
      setName(editingEvent.name || "");
      setDate(editingEvent.date || "");
      setDuration(editingEvent.durationHours || 2);
      setYoutubeId(editingEvent.youtubeId || "");
      setType(editingEvent.type || "");
      setDescription(editingEvent.description || "");
    }
  }, [editingEvent]);

  const resetForm = () => {
    setName("");
    setDate("");
    setDuration(2);
    setYoutubeId("");
    setType("");
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!name || !date) {
      alert("Nom et date obligatoires");
      return;
    }

    const eventData = {
      name,
      date,
      durationHours: Number(duration),
      youtubeId,
      type,
      description,
    };

    try {
      if (editingEvent?.firebaseId) {
        await updateDoc(doc(db, "events", editingEvent.firebaseId), eventData);
        alert("Événement modifié ✅");
        onCancelEdit();
      } else {
        await addDoc(collection(db, "events"), eventData);
        alert("Événement ajouté ✅");
      }

      resetForm();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l’enregistrement");
    }
  };

  return (
    <div className="search-panel">
      <h2 className="panel-title">
        {editingEvent ? "Modifier l’événement" : "Ajouter un événement"}
      </h2>

      <div className="input-container">
        <input
          placeholder="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="input-container">
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="input-container">
        <input
          type="number"
          placeholder="Durée (heures)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>

      <div className="input-container">
        <input
          placeholder="YouTube ID"
          value={youtubeId}
          onChange={(e) => setYoutubeId(e.target.value)}
        />
      </div>

      <div className="input-container">
        <input
          placeholder="Type (Showcase, Awards...)"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
      </div>

      <div className="input-container">
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button onClick={handleSubmit}>
        {editingEvent ? "Mettre à jour" : "Ajouter l’événement"}
      </button>

      {editingEvent && (
        <button
          type="button"
          className="filter-toggle-btn"
          style={{ marginTop: "10px" }}
          onClick={() => {
            resetForm();
            onCancelEdit();
          }}
        >
          Annuler la modification
        </button>
      )}
    </div>
  );
}

function ConsoleXPSection({ games }) {
  const consoleStats = getConsoleXPStats(games);

  if (!consoleStats.length) {
    return (
      <div className="search-panel">
        <h2 className="panel-title">XP par console</h2>

        <EmptyState
          title="Aucune donnée console"
          subtitle="Ajoute des plateformes jouées pour débloquer les stats."
        />
      </div>
    );
  }

  return (
    <div className="search-panel">
      <h2 className="panel-title">XP par console</h2>

      <div className="console-xp-list">
        {consoleStats.map((item) => {
          const level = Math.max(1, Math.floor(item.xp / 500) + 1);

          let rank = "Débutant";

          if (level >= 20) rank = "Légende";
          else if (level >= 15) rank = "Expert";
          else if (level >= 10) rank = "Confirmé";
          else if (level >= 5) rank = "Passionné";

          return (
            <div key={item.platform} className="console-xp-card">
              <div className="console-xp-top">
                <div>
                  <div className="console-xp-name">
                    {item.platform}
                  </div>

                  <div className="console-xp-rank">
                    {rank}
                  </div>
                </div>

                <div className="console-xp-level">
                  Nv {level}
                </div>
              </div>

              <div className="console-xp-bar">
                <div
                  className="console-xp-fill"
                  style={{
                    width: `${(item.xp % 500) / 5}%`,
                  }}
                />
              </div>

              <div className="console-xp-bottom">
                <span>{item.games} jeux</span>
                <strong>{item.xp} XP</strong>
              </div>

              <div className="console-badges">
                {item.games >= 5 && (
                  <span className="console-badge">
                    📚 Collectionneur
                  </span>
                )}

                {item.games >= 15 && (
                  <span className="console-badge">
                    🏆 Vétéran
                  </span>
                )}

                {item.xp >= 3000 && (
                  <span className="console-badge legendary">
                    👑 Maître
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileTab({
  badges,
  level,
  totalXP,
  progress,
  games,
  hardware = [],
  featuredBadgeId,
  onSelectFeaturedBadge,
}) {
  const unlockedBadges = badges.filter((b) => b.unlocked);
  const lockedBadges = badges.filter((b) => !b.unlocked && !b.hiddenWhenLocked);
  const nextBadges = lockedBadges.slice(0, 3);
  const [showAllBadges, setShowAllBadges] = useState(false);

  const nextRank = RANKS.find((rank) => rank.min > level);
  const stats = getAdvancedStats(games);
  const profile = getPlayerProfile(games);
  const badgeStats = calculateBadgeStats(games, level, hardware);
  const featuredBadge = getFeaturedBadgeFromSelection(badges, featuredBadgeId);
  const profileInsights = getProfileInsights(games, hardware, badges);
  const profileShowcase = getProfileShowcase(games, hardware);
  const hasProfileShowcase =
    profileShowcase.topScores.length > 0 ||
    profileShowcase.specializedTops.length > 0 ||
    profileShowcase.gotyHighlights.length > 0 ||
    profileShowcase.hardwareHighlights.length > 0;
  const currentRank =
    [...RANKS].reverse().find((rank) => level >= rank.min) || RANKS[0];
  const completedCount = games.filter(isGameFinishedStatus).length;

  return (
    <div className="progression-stack profile-tab">
      <div className="search-panel profile-hero">
        <div className="profile-hero-main">
          <div className="profile-kicker">Profil joueur</div>
          <div className="social-profile-name-row">
            <h2 className="profile-title">{profile.title}</h2>
            <FeaturedBadgePill badge={featuredBadge} />
          </div>
          <div className="profile-subtitle">{profile.subtitle}</div>

          <div className="profile-hero-tags">
            <span>Niveau {level}</span>
            <span>{currentRank.title}</span>
            <span>{profileInsights.maturity}</span>
          </div>
        </div>

        <div className="profile-hero-side">
          <div className="profile-badge-count">
            <strong>{unlockedBadges.length}</strong>
            <span>/ {badges.length} badges</span>
          </div>

          <div className="profile-hero-xp">
            <div className="profile-hero-xp-top">
              <span>{totalXP} XP</span>
              <strong>{progress.percent}%</strong>
            </div>
            <div className="xp-bar compact">
              <div className="xp-fill" style={{ width: `${progress.percent}%` }} />
            </div>
            <small>
              {level >= 100
                ? "Rang maximal atteint"
                : `${progress.currentXP} / ${progress.xpToNext} XP avant le niveau suivant`}
            </small>
          </div>
        </div>
      </div>

      <div className="profile-stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalPlaytime}h</div>
          <div className="stat-label">Temps total</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            {stats.avgRating ? stats.avgRating.toFixed(1) : "-"}
          </div>
          <div className="stat-label">Note moyenne</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{completedCount}</div>
          <div className="stat-label">Terminés</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{profileInsights.completionRate}%</div>
          <div className="stat-label">Complétion</div>
        </div>
      </div>

      {hasProfileShowcase && (
        <div className="search-panel profile-showcase-panel">
          <div className="profile-section-header">
            <div>
              <h2 className="panel-title">Vitrine Checkpoint</h2>
              <div className="option-value">
                Tes meilleurs Tops, GOTY et matériels préférés au même endroit.
              </div>
            </div>
          </div>

          <ProfileShowcase showcase={profileShowcase} />
        </div>
      )}

      <div className="search-panel profile-insights-panel">
        <div className="profile-section-header">
          <div>
            <h2 className="panel-title">Insights joueur</h2>
            <div className="option-value">
              Une lecture de ton identité à partir de tes jeux, notes, badges et matériel.
            </div>
          </div>
        </div>

        <div className="profile-insights-lead">
          <span>Lecture Checkpoint</span>
          <strong>{profileInsights.headline}</strong>
          <p>{profileInsights.summary}</p>
          <div>
            <small>{profileInsights.completionRate}% de complétion</small>
            <small>{profileInsights.badgeCompletion}% badges</small>
            <small>{profileInsights.maturity}</small>
          </div>
        </div>

        <div className="profile-insights-grid">
          {profileInsights.cards.map((card) => (
            <div
              key={card.label}
              className={`profile-insight-card tone-${card.tone || "neutral"}`}
            >
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.detail}</small>
            </div>
          ))}
        </div>

        {profileInsights.focus.length > 0 && (
          <div className="profile-insights-focus">
            <span>À faire évoluer</span>
            {profileInsights.focus.map((item) => (
              <div key={item} className="profile-insights-focus-item">
                {item}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="search-panel profile-growth-panel">
        <div className="profile-section-header">
          <div>
            <h2 className="panel-title">Progression</h2>
            <div className="option-value">
              Rang actuel, prochain cap et objectifs utiles à court terme.
            </div>
          </div>
        </div>

        <div className="profile-growth-grid">
          {nextBadges[0] ? (
            <div className="next-goal-card profile-next-goal">
              <div className="badge-icon">
                <BadgeVisualIcon badge={nextBadges[0]} />
              </div>
              <div>
                <span>Prochain badge</span>
                <div className="badge-name">{nextBadges[0].name}</div>
                <div className="badge-desc">{nextBadges[0].desc}</div>
              </div>
            </div>
          ) : nextRank ? (
            <div className="next-goal-card profile-next-goal">
              <div className="badge-icon">⬆️</div>
              <div>
                <span>Prochain rang</span>
                <div className="badge-name">{nextRank.title}</div>
                <div className="badge-desc">Atteindre le niveau {nextRank.min}</div>
              </div>
            </div>
          ) : (
            <div className="option-value">Tous les objectifs principaux sont débloqués.</div>
          )}

          <div className="profile-rank-summary">
            <span>Rang actuel</span>
            <strong>{currentRank.title}</strong>
            <small>
              {nextRank
                ? `Prochain cap : ${nextRank.title} au niveau ${nextRank.min}`
                : "Tu es sur le dernier palier de rang."}
            </small>
          </div>
        </div>

        <div className="rank-list compact-ranks">
          {RANKS.map((rank) => {
            const unlocked = level >= rank.min;
            const active = level >= rank.min && level <= rank.max;

            return (
              <div
                key={rank.title}
                className={`rank-item ${unlocked ? "unlocked" : "locked"} ${active ? "active" : ""}`}
              >
                <div>
                  <div className="rank-name">{rank.title}</div>
                  <div className="rank-range">
                    {rank.min === rank.max
                      ? `Niveau ${rank.min}`
                      : `Niveaux ${rank.min} à ${rank.max}`}
                  </div>
                </div>

                <div className="rank-state">
                  {active ? "Actuel" : unlocked ? "Débloqué" : "Verrouillé"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <GenreStatsChart games={games} />

      <div className="search-panel">
        <div className="profile-section-header">
          <div>
            <h2 className="panel-title">Badges</h2>
            <div className="option-value">
              {unlockedBadges.length} débloqués / {badges.length}
              {featuredBadge ? ` • Mis en avant : ${featuredBadge.name}` : ""}
            </div>
          </div>

          <button
            type="button"
            className="profile-toggle-btn"
            onClick={() => setShowAllBadges((prev) => !prev)}
          >
            {showAllBadges ? "Réduire" : "Voir tous"}
          </button>
        </div>

        <div className="profile-badges-section">
          {(showAllBadges ? unlockedBadges : unlockedBadges.slice(0, 6)).map((b) => (
            <button
              key={b.id}
              type="button"
              className={`badge-card unlocked ${b.rarity} ${
                featuredBadgeId === b.id ? "featured" : ""
              }${b.platformFamily ? ` platform-${b.platformFamily}` : ""}${
                b.platformKey ? " platform-specific" : " brand-family"
              }${b.special ? ` badge-special-${b.special}` : ""}`}
              onClick={() => onSelectFeaturedBadge?.(b.id)}
            >
              <span className="badge-sheen" aria-hidden="true" />
              <span className="badge-sparkles" aria-hidden="true" />
              <div className="badge-topline">
                <div className="badge-emblem">
                  <span className="badge-icon">
                    <BadgeVisualIcon badge={b} />
                  </span>
                </div>
                <span className="badge-rarity-chip">{b.rarity}</span>
              </div>
              <div className="badge-name">{b.name}</div>
              <div className="badge-desc">{b.desc}</div>
              <div className="badge-status">
                {featuredBadgeId === b.id ? "Badge affiché" : "Choisir ce badge"}
              </div>
            </button>
          ))}

          {(showAllBadges ? lockedBadges : nextBadges).map((b) => {
              const progress = getBadgeProgress(b, badgeStats);

              return (
                <div
                  key={b.id}
                  className={`badge-card locked ${b.rarity}${
                    b.platformFamily ? ` platform-${b.platformFamily}` : ""
                  }${b.platformKey ? " platform-specific" : " brand-family"}${
                    b.special ? ` badge-special-${b.special}` : ""
                  }`}
                >
                  <span className="badge-sheen" aria-hidden="true" />
                  <span className="badge-sparkles" aria-hidden="true" />
                  <div className="badge-topline">
                    <div className="badge-emblem">
                      <span className="badge-icon">
                        <BadgeVisualIcon badge={b} />
                      </span>
                    </div>
                    <span className="badge-rarity-chip">{b.rarity}</span>
                  </div>
                  <div className="badge-name">{b.name}</div>
                  <div className="badge-desc">{b.desc}</div>

                  {progress && (
                    <div className="badge-progress">
                      {progress.current} / {progress.target}
                      <div className="badge-progress-bar">
                        <div
                          className="badge-progress-fill"
                          style={{
                            width: `${Math.min(
                              (progress.current / progress.target) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="badge-status">
                    {showAllBadges ? "🔒 Verrouillé" : "🎯 Prochain objectif"}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      <ConsoleXPSection games={games} />
    </div>
  );
}

function normalizeGameName(name) {
  return name
    .toLowerCase()
    .replace(/[™®]/g, "")
    .replace(/\b(remastered|remake|definitive edition|complete edition|deluxe edition|game of the year|goty)\b/g, "")
    .replace(/[0-9]+/g, "")
    .replace(/[:–—-].*$/g, "")
    .trim();
}

function normalizeSearchText(value = "") {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchRelevanceScore(game, query) {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedName = normalizeSearchText(game?.name || "");

  if (!normalizedQuery || !normalizedName) return 0;

  const queryWords = normalizedQuery.split(" ").filter(Boolean);
  const nameWords = normalizedName.split(" ").filter(Boolean);
  let score = 0;

  if (normalizedName === normalizedQuery) score += 10000;
  if (normalizedName.startsWith(normalizedQuery)) score += 5000;
  if (normalizedName.includes(normalizedQuery)) score += 2500;

  queryWords.forEach((word, index) => {
    if (nameWords[index] === word) score += 450;
    if (nameWords.includes(word)) score += 260;
    if (normalizedName.includes(word)) score += 120;
  });

  const missingWords = queryWords.filter((word) => !normalizedName.includes(word)).length;
  score -= missingWords * 900;
  score -= Math.abs(nameWords.length - queryWords.length) * 35;
  score += Math.min(Number(game?.ratings_count) || 0, 12000) / 40;
  score += (Number(game?.rating) || 0) * 35;

  return score;
}

function sortSearchResultsByRelevance(results, query) {
  if (!query?.trim()) return results;

  return [...results].sort((a, b) => {
    const relevanceDiff =
      getSearchRelevanceScore(b, query) - getSearchRelevanceScore(a, query);

    if (relevanceDiff !== 0) return relevanceDiff;

    return (Number(b.ratings_count) || 0) - (Number(a.ratings_count) || 0);
  });
}

function getRawgSlugCandidates(query = "") {
  const base = normalizeSearchText(query)
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const withoutArticles = normalizeSearchText(query)
    .replace(/\b(the|a|an)\b/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return Array.from(new Set([base, withoutArticles].filter(Boolean)));
}

const KNOWN_SEARCH_FALLBACKS = [
  {
    id: 989329,
    slug: "ghost-of-yotei",
    name: "Ghost of Yotei",
    playtime: 0,
    released: "2025-10-02",
    tba: false,
    background_image:
      "https://media.rawg.io/media/games/30b/30b195c2321d763f807366967ffad793.jpg",
    rating: 4.18,
    ratings_count: 41,
    platforms: [
      {
        platform: {
          id: 187,
          name: "PlayStation 5",
          slug: "playstation5",
        },
      },
    ],
    parent_platforms: [
      {
        platform: {
          id: 2,
          name: "PlayStation",
          slug: "playstation",
        },
      },
    ],
    genres: [
      { id: 4, name: "Action", slug: "action" },
      { id: 5, name: "RPG", slug: "role-playing-games-rpg" },
    ],
  },
];

function getKnownSearchFallbacks(query = "") {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  return KNOWN_SEARCH_FALLBACKS.filter((game) => {
    const normalizedName = normalizeSearchText(game.name);
    const queryWords = normalizedQuery.split(" ").filter(Boolean);

    return (
      normalizedName.includes(normalizedQuery) ||
      queryWords.every((word) => normalizedName.includes(word))
    );
  });
}

function gameMatchesSearchFilters(game, filters = {}) {
  const { yearFilter, platformFilter, genreFilter } = filters;

  if (yearFilter && !String(game.released || "").startsWith(String(yearFilter))) {
    return false;
  }

  if (platformFilter) {
    const platformIds = (game.platforms || []).map((entry) =>
      String(entry?.platform?.id || "")
    );

    if (!platformIds.includes(String(platformFilter))) {
      return false;
    }
  }

  if (genreFilter) {
    const genreIds = (game.genres || []).map((genre) => String(genre?.id || ""));

    if (!genreIds.includes(String(genreFilter))) {
      return false;
    }
  }

  return true;
}

function detectSeriesName(gameName) {
  const name = normalizeGameName(gameName);

  const seriesRules = [
    { key: "lego star wars", label: "Lego Star Wars" },
    { key: "star wars", label: "Star Wars" },
    { key: "lord of the rings", label: "The Lord of the Rings" },
    { key: "the lord", label: "The Lord of the Rings" },
    { key: "resident evil", label: "Resident Evil" },
    { key: "assassin", label: "Assassin’s Creed" },
    { key: "grand theft", label: "Grand Theft Auto" },
    { key: "gta", label: "Grand Theft Auto" },
    { key: "metal gear", label: "Metal Gear" },
    { key: "tomb raider", label: "Tomb Raider" },
    { key: "dead space", label: "Dead Space" },
    { key: "fight night", label: "Fight Night" },
    { key: "mortal kombat", label: "Mortal Kombat" },
    { key: "saints row", label: "Saints Row" },
    { key: "devil may cry", label: "Devil May Cry" },
    { key: "deus ex", label: "Deus Ex" },
    { key: "max payne", label: "Max Payne" },
    { key: "a plague", label: "A Plague Tale" },
    { key: "uncharted", label: "Uncharted" },
    { key: "gran turismo", label: "Gran Turismo" },
    { key: "mafia", label: "Mafia" },
    { key: "zelda", label: "The Legend of Zelda" },
    { key: "super mario", label: "Super Mario" },
    { key: "mario kart", label: "Mario Kart" },
    { key: "god of war", label: "God of War" },
    { key: "the last of us", label: "The Last of Us" },
  ];

  const found = seriesRules.find((series) => name.includes(series.key));
  if (found) return found.label;

  const words = name.split(" ").filter(Boolean);
  if (words.length < 2) return null;

  return words
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getDetectedGameSeries(games) {
  const groups = {};

  games.forEach((game) => {
    const seriesName = detectSeriesName(game.name);
    if (!seriesName) return;

    if (!groups[seriesName]) groups[seriesName] = [];

    groups[seriesName].push(game);
  });

  return Object.entries(groups)
    .filter(([, items]) => items.length >= 2)
    .map(([name, items]) => {
      const finished = items.filter(isGameFinishedStatus).length;

      const total = items.length;

      return {
        name,
        games: items,
        finished,
        total,
        percent: Math.round((finished / total) * 100),
      };
    });
}

function GameSeriesTab({ games, onAddGameToLibrary }) {
  const [seriesDisplayMode, setSeriesDisplayMode] = useState("compact");
  const [enrichedSeries, setEnrichedSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [seriesView, setSeriesView] = useState("owned");
  const [seriesSuggestions, setSeriesSuggestions] = useState([]);
  const [seriesScrollY, setSeriesScrollY] = useState(0);

  const openSeries = (series) => {
    setSeriesScrollY(window.scrollY);
    setSelectedSeries(series);
    setSeriesView("owned");
    setSeriesSuggestions([]);
  };

  const closeSeries = () => {
    setSelectedSeries(null);
    setSeriesSuggestions([]);
    setSeriesView("owned");

    requestAnimationFrame(() => {
      window.scrollTo(0, seriesScrollY);
    });
  };

  const loadSeriesSuggestions = async (seriesName) => {
    const query = encodeURIComponent(seriesName);

    const res = await fetch(
      `https://api.rawg.io/api/games?key=${API_KEY}&search=${query}&page_size=30`
    );

    const data = await res.json();
    const cleanSeriesName = seriesName.toLowerCase();

    const filteredGames = (data.results || []).filter((game) => {
      const name = (game.name || "").toLowerCase();

      if (cleanSeriesName === "the last of us") {
        return name.startsWith("the last of us") || name.startsWith("last of us");
      }

      return name.includes(cleanSeriesName);
    });

    setSeriesSuggestions(filteredGames);
    setSeriesView("suggestions");
  };

  useEffect(() => {
    const baseSeries = getDetectedGameSeries(games);

    setEnrichedSeries(
      baseSeries.map((series) => ({
        ...series,
        apiTotal: series.total,
        missing: 0,
      }))
    );
  }, [games]);

  if (selectedSeries) {
    return (
      <div className="progression-stack">
        <div className="search-panel">
          <button
            type="button"
            className="back-btn"
            onClick={() => {
              if (seriesView === "suggestions") {
                setSeriesView("owned");
                return;
              }

              closeSeries();
            }}
          >
            <ArrowLeft size={18} />
            Retour
          </button>

          <h2 className="panel-title">{selectedSeries.name}</h2>

          {seriesView === "owned" && (
            <>
              <h3 className="hardware-group-title">Ma série</h3>

              <div className="series-list">
                {selectedSeries.games.map((game) => (
                  <div key={game.id} className="series-game-row">
                    <span>{game.name}</span>
                    <span>
                      {isGameFinishedStatus(game)
                        ? "✅ Terminé"
                        : game.status === "collection"
                        ? "Collection"
                        : game.status}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="save-review-btn series-suggestions-btn"
                onClick={() => loadSeriesSuggestions(selectedSeries.name)}
              >
                Dans la même série...
              </button>
            </>
          )}

          {seriesView === "suggestions" && (
            <>
              <h3 className="hardware-group-title">Propositions RAWG</h3>

              <div className="series-list">
                {seriesSuggestions.map((rawgGame) => {
                  const alreadyInLibrary = games.some(
                    (game) =>
                      game.rawgId === rawgGame.id ||
                      game.name.toLowerCase() === rawgGame.name.toLowerCase()
                  );

                  return (
                    <div key={rawgGame.id} className="series-game-row">
                      <span>{rawgGame.name}</span>

                      {alreadyInLibrary ? (
                        <span className="already-added">✔ Déjà ajouté</span>
                      ) : (
                        <div className="quick-status-actions">
                          <button
                            type="button"
                            className="quick-status-btn"
                            title="Wishlist"
                            onClick={() =>
                              onAddGameToLibrary({
                                name: rawgGame.name,
                                rating: 0,
                                favorite: false,
                                image: rawgGame.background_image || "",
                                status: "wishlist",
                                progressStatus: "not_started",
                                playtimeRange: "none",
                                released: rawgGame.released || "",
                                platformNames:
                                  rawgGame.platforms?.map((p) => p.platform.name) || [],
                                genreNames: rawgGame.genres?.map((g) => g.name) || [],
                                playtime: rawgGame.playtime || null,
                                difficulty: getSuggestedDifficulty(rawgGame),
                                review: "",
                                ratingGraphics: 0,
                                ratingGameplay: 0,
                                ratingStory: 0,
                                ratingSound: 0,
                                ostRating: 0,
                                ratingLongevity: 0,
                                rawgId: rawgGame.id,
                              })
                            }
                          >
                            <BookmarkPlus size={18} />
                          </button>

                          <button
                            type="button"
                            className="quick-status-btn"
                            title="Collection"
                            onClick={() =>
                              onAddGameToLibrary({
                                name: rawgGame.name,
                                rating: 0,
                                favorite: false,
                                image: rawgGame.background_image || "",
                                status: "collection",
                                progressStatus: "not_started",
                                playtimeRange: "none",
                                released: rawgGame.released || "",
                                platformNames:
                                  rawgGame.platforms?.map((p) => p.platform.name) || [],
                                genreNames: rawgGame.genres?.map((g) => g.name) || [],
                                playtime: rawgGame.playtime || null,
                                difficulty: getSuggestedDifficulty(rawgGame),
                                review: "",
                                ratingGraphics: 0,
                                ratingGameplay: 0,
                                ratingStory: 0,
                                ratingSound: 0,
                                ostRating: 0,
                                ratingLongevity: 0,
                                rawgId: rawgGame.id,
                              })
                            }
                          >
                            <Library size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
  <div className="progression-stack">
    <div className="search-panel">
      <div className="section-header">
        <h2>Séries détectées</h2>
        <span className="section-count">{enrichedSeries.length}</span>
      </div>

      <div className="library-view-toggle">
        <button
          className={seriesDisplayMode === "compact" ? "active" : ""}
          onClick={() => setSeriesDisplayMode("compact")}
          type="button"
        >
          Compact
        </button>

        <button
          className={seriesDisplayMode === "detailed" ? "active" : ""}
          onClick={() => setSeriesDisplayMode("detailed")}
          type="button"
        >
          Détaillé
        </button>
      </div>

      {enrichedSeries.length === 0 ? (
        <EmptyState
          title="Aucune série détectée"
          subtitle="Ajoute plusieurs jeux d’une même licence pour voir la complétion."
        />
      ) : seriesDisplayMode === "compact" ? (
        <div className="series-grid compact-series-grid">
          {enrichedSeries.map((series) => (
            <button
              key={series.name}
              type="button"
              className="series-card compact-series-card"
              onClick={() => openSeries(series)}
            >
              <div className="series-card-top">
                <strong>{series.name}</strong>
                <span>{series.percent}%</span>
              </div>

              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${series.percent}%` }} />
              </div>

              <div className="series-card-meta">
                {series.finished} / {series.total} jeux terminés
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="series-list">
          {enrichedSeries.map((series) => (
            <div
              key={series.name}
              className="series-card detailed-series-card"
              onClick={() => openSeries(series)}
            >
              <div className="series-top">
                <div>
                  <div className="series-title">{series.name}</div>
                  <div className="hardware-meta">
                    {series.finished} / {series.total} jeux terminés
                  </div>
                </div>

                <div className="series-percent">{series.percent}%</div>
              </div>

              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${series.percent}%` }} />
              </div>

              <div className="series-games">
                {series.games.map((game) => (
                  <div key={game.id} className="series-game-row">
                    <span>{game.name}</span>
                    <span>
                      {isGameFinishedStatus(game)
                        ? "✅"
                        : "◌"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
}

function HardwareDropdown({
  id,
  label,
  value,
  options,
  onChange,
  openedDropdown,
  setOpenedDropdown,
}) {
  const open = openedDropdown === id;

  const selectedOption =
    options.find((option) => option.id === value) || options[0];

  return (
    <div className={`hardware-dropdown ${open ? "open" : ""}`}>
      <span className="hardware-dropdown-label">{label}</span>

      <div className="hardware-dropdown-wrap">
        <button
          type="button"
          className={`hardware-dropdown-trigger ${open ? "open" : ""}`}
          onClick={() =>
            setOpenedDropdown(open ? null : id)
          }
        >
          {selectedOption?.label}
          <span>⌄</span>
        </button>

        {open && (
          <div className="hardware-dropdown-menu">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`hardware-dropdown-option ${
                  option.id === value ? "active" : ""
                }`}
                onClick={() => {
                  onChange(option.id);
                  setOpenedDropdown(null);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const HARDWARE_RATING_FIELDS = {
  console: [
    { key: "catalog", label: "Catalogue", icon: "📚" },
    { key: "controller", label: "Manette", icon: "🕹️" },
    { key: "design", label: "Design", icon: "🎨" },
    { key: "interface", label: "Interface / fonctionnalités", icon: "⚙️" },
    { key: "reliability", label: "Fiabilité", icon: "🔧" },
    { key: "nostalgia", label: "Nostalgie / attachement", icon: "❤️" },
  ],
  controller: [
    { key: "ergonomics", label: "Ergonomie", icon: "✋" },
    { key: "precision", label: "Précision", icon: "🎯" },
    { key: "buttons", label: "Boutons / gâchettes", icon: "🔘" },
    { key: "vibrations", label: "Vibrations / fonctionnalités", icon: "📳" },
    { key: "battery", label: "Autonomie", icon: "🔋" },
    { key: "comfort", label: "Confort longue session", icon: "🏆" },
  ],
  audio: [
    { key: "sound", label: "Qualité sonore", icon: "🎧" },
    { key: "comfort", label: "Confort", icon: "☁️" },
    { key: "microphone", label: "Micro", icon: "🎤" },
    { key: "isolation", label: "Isolation", icon: "🔇" },
    { key: "battery", label: "Autonomie", icon: "🔋" },
    { key: "value", label: "Rapport qualité / prix", icon: "💰" },
  ],
  speaker: [
    { key: "sound", label: "Qualite sonore", icon: "SND" },
    { key: "spatial", label: "Scene sonore / spatialisation", icon: "3D" },
    { key: "bass", label: "Basses / impact", icon: "BASS" },
    { key: "latency", label: "Latence / synchro", icon: "MS" },
    { key: "connectivity", label: "Connectique", icon: "I/O" },
    { key: "setup", label: "Integration setup", icon: "SET" },
    { key: "value", label: "Rapport qualite / prix", icon: "EUR" },
  ],
  vr: [
    { key: "image", label: "Nettete / effet grille", icon: "IMG" },
    { key: "comfort", label: "Confort / poids", icon: "ERG" },
    { key: "tracking", label: "Tracking / manettes", icon: "TRK" },
    { key: "immersion", label: "Immersion / FOV", icon: "FOV" },
    { key: "performance", label: "Fluidite / latence", icon: "HZ" },
    { key: "ecosystem", label: "Catalogue / ecosysteme", icon: "APP" },
    { key: "setup", label: "Installation / autonomie", icon: "SET" },
    { key: "value", label: "Rapport qualite / prix", icon: "EUR" },
  ],
  display: [
    { key: "image", label: "Qualite d'image", icon: "IMG" },
    { key: "hdr", label: "HDR / luminosite", icon: "HDR" },
    { key: "motion", label: "Fluidite", icon: "HZ" },
    { key: "latency", label: "Latence / reactivite", icon: "MS" },
    { key: "features", label: "HDMI 2.1 / VRR / ALLM", icon: "VRR" },
    { key: "comfort", label: "Confort / ergonomie", icon: "ERG" },
  ],
  mouse: [
    { key: "shape", label: "Forme / prise en main", icon: "ERG" },
    { key: "sensor", label: "Capteur / precision", icon: "DPI" },
    { key: "clicks", label: "Clics / molette", icon: "BTN" },
    { key: "weight", label: "Poids / equilibre", icon: "G" },
    { key: "wireless", label: "Connexion / latence", icon: "MS" },
    { key: "battery", label: "Autonomie", icon: "BAT" },
  ],
  keyboard: [
    { key: "switches", label: "Switches / sensation", icon: "SW" },
    { key: "latency", label: "Latence / rapid trigger", icon: "MS" },
    { key: "build", label: "Construction", icon: "BLD" },
    { key: "layout", label: "Layout / ergonomie", icon: "KEY" },
    { key: "software", label: "Logiciel / profils", icon: "APP" },
    { key: "sound", label: "Son / stabilisateurs", icon: "SND" },
  ],
};

function getHardwareRatingFields(type) {
  return HARDWARE_RATING_FIELDS[type] || HARDWARE_RATING_FIELDS.console;
}

function getHardwareTypeIcon(type) {
  return "";
}

function handleHardwareImageError(event) {
  const image = event.currentTarget;
  const holder = image.closest(
    ".hardware-image-zoom-btn, .hardware-image-wrapper, .hardware-card-image-zone"
  );

  image.style.display = "none";
  holder?.classList.add("hardware-image-missing");
}

function getHardwareAverageRating(item) {
  const fields = getHardwareRatingFields(item.type);
  const ratings = item.ratings || {};

  const values = fields
    .map((field) => clampRating(ratings[field.key]))
    .filter((value) => value > 0);

  if (!values.length) return 0;

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(average * 10) / 10;
}

function normalizeHardwareRatings(item = {}) {
  const ratings = Object.fromEntries(
    Object.entries(item.ratings || {}).map(([key, value]) => [
      key,
      clampRating(value),
    ])
  );
  const normalizedItem = {
    ...item,
    ratings,
    rating: clampRating(item.rating),
  };

  return {
    ...normalizedItem,
    rating: normalizedItem.rating || getHardwareAverageRating(normalizedItem),
  };
}

function getHardwareCatalogVersionSizes(item) {
  if (item.displaySizes?.length) return item.displaySizes;

  for (const catalogItem of HARDWARE_CATALOG) {
    for (const variant of catalogItem.variants || []) {
      const version = variant.versions?.find(
        (candidate) => candidate.id === item.versionId
      );

      if (version?.sizes?.length) return version.sizes;
    }
  }

  return [];
}

function isConfigurablePcHardware(item = {}) {
  const text = [
    item.name,
    item.parentName,
    item.variantName,
    item.brand,
    item.category,
    item.versionId,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    item.versionId === "desktop-pc" ||
    item.versionId === "gaming-laptop" ||
    text.includes("pc fixe") ||
    text.includes("pc portable") ||
    text.includes("gaming pc") ||
    text.includes("pc gaming")
  );
}

function HardwareDetailModal({
  item,
  detailRef,
  onClose,
  onDeleteHardware,
  openedDropdown,
  setOpenedDropdown,
  statusOptions,
  conditionOptions,
  displaySizeOptions = [],
  onUpdateHardwareStatus,
  onUpdateHardwareCondition,
  onUpdateHardwareDisplaySize,
  onUpdateHardwareComponent,
  onUpdateHardwareRating,
  onUpdateHardwareReview,
  onToggleHardwareFavorite,
  consoleGameStats,
  getHardwareStatusLabel = (status) => status || "Possédé",
}) {
  const [localReview, setLocalReview] = useState(item?.review || "");

  useEffect(() => {
    setLocalReview(item?.review || "");
  }, [item]);

  if (!item) return null;

  const fields = getHardwareRatingFields(item.type);
  const averageRating = getHardwareAverageRating(item);
  const catalogDisplaySizes = getHardwareCatalogVersionSizes(item);
  const showPcConfiguration = isConfigurablePcHardware(item);
  const currentDisplaySizeOptions =
    item.type === "display" && catalogDisplaySizes.length
      ? [
          { id: "", label: "Taille non précisée" },
          ...catalogDisplaySizes.map((size) => {
            const option = displaySizeOptions.find((entry) => entry.id === size);
            return option || { id: size, label: `${size} pouces` };
          }),
        ]
      : displaySizeOptions;
  const hardwareTypeLabel = getHardwareTypeLabel(item.type);
  const displaySizeLabel =
    item.type === "display" && item.displaySize
      ? currentDisplaySizeOptions.find((option) => option.id === item.displaySize)?.label ||
        `${item.displaySize} pouces`
      : "";
  const hardwareFacts = [
    { label: "Type", value: hardwareTypeLabel },
    { label: "Marque", value: item.brand || "Marque inconnue" },
    item.variantName && { label: "Gamme", value: item.variantName },
    item.storage && { label: "Stockage", value: item.storage },
    displaySizeLabel && { label: "Taille", value: displaySizeLabel },
    { label: "Statut", value: getHardwareStatusLabel(item.status) },
  ].filter(Boolean);
  const highlightedFields = fields.slice(0, 3);
  const ratedFields = fields
    .map((field) => ({
      ...field,
      value: clampRating(item.ratings?.[field.key]),
    }))
    .filter((field) => field.value > 0)
    .sort((a, b) => b.value - a.value);
  const bestRatedField = ratedFields[0];
  const weakestRatedField =
    ratedFields.length > 1 ? ratedFields[ratedFields.length - 1] : null;
  const ratingCompletion = fields.length
    ? Math.round((ratedFields.length / fields.length) * 100)
    : 0;

  return (
    <div className="hardware-inline-detail" ref={detailRef}>
      <div className="hardware-inline-detail-panel">
        <button className="hardware-inline-close" type="button" onClick={onClose}>
          ✕
        </button>

        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="modal-image hardware-detail-image"
            onError={handleHardwareImageError}
          />
        ) : (
          <div className="modal-image placeholder">
            {item.type === "audio" ? "🎧" : item.type === "controller" ? "🕹️" : "🎮"}
          </div>
        )}

        <div className="modal-content">
          <div className="modal-title-row">
            <h2>{item.name}</h2>

            <button
              className={`heart-btn ${item.favorite ? "active" : ""}`}
              type="button"
              onClick={() => onToggleHardwareFavorite(item.id, item.favorite)}
            >
              <Heart size={18} fill={item.favorite ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="hardware-detail-score">
            <div className="hardware-detail-score-main">
              <span>⭐ {formatRating10(averageRating, "Non noté")}</span>
              <small>Moyenne critères</small>
            </div>

            <div className="hardware-detail-score-progress">
              <strong>
                {ratedFields.length}/{fields.length}
              </strong>
              <small>critères notés</small>
              <div className="hardware-detail-score-bar">
                <span style={{ width: `${ratingCompletion}%` }} />
              </div>
            </div>
          </div>

          {ratedFields.length > 0 && (
            <div className="hardware-detail-insights">
              {bestRatedField && (
                <div className="hardware-detail-insight strong">
                  <span>Point fort</span>
                  <strong>
                    {bestRatedField.icon} {bestRatedField.label}
                  </strong>
                  <small>{formatRating10(bestRatedField.value, "-")}</small>
                </div>
              )}

              {weakestRatedField && weakestRatedField.key !== bestRatedField?.key && (
                <div className="hardware-detail-insight">
                  <span>À surveiller</span>
                  <strong>
                    {weakestRatedField.icon} {weakestRatedField.label}
                  </strong>
                  <small>{formatRating10(weakestRatedField.value, "-")}</small>
                </div>
              )}
            </div>
          )}

          <div className="hardware-detail-profile">
            <div className="hardware-detail-profile-head">
              <span>Profil {hardwareTypeLabel.toLowerCase()}</span>
              <strong>
                {item.storage ||
                  displaySizeLabel ||
                  item.variantName ||
                  getHardwareStatusLabel(item.status)}
              </strong>
            </div>

            <div className="hardware-detail-facts">
              {hardwareFacts.map((fact) => (
                <div key={`${fact.label}-${fact.value}`} className="hardware-detail-fact">
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                </div>
              ))}
            </div>

            {highlightedFields.length > 0 && (
              <div className="hardware-detail-focus">
                <span>Critères de notation</span>
                <div>
                  {highlightedFields.map((field) => (
                    <small key={field.key}>
                      {field.icon} {field.label}
                    </small>
                  ))}
                </div>
              </div>
            )}
          </div>

          {item.type === "console" && consoleGameStats && (
            <div className="hardware-detail-console-stats">
              <div>
                <strong>{consoleGameStats.games}</strong>
                <span>jeux joués</span>
              </div>
              <div>
                <strong>{consoleGameStats.level}</strong>
                <span>niveau console</span>
              </div>
              <div>
                <strong>{consoleGameStats.xp}</strong>
                <span>XP plateforme</span>
              </div>
            </div>
          )}

          <div className="modal-block hardware-detail-controls">
            <div className="modal-block-title">État et statut</div>

            <div className="hardware-card-dropdowns">
              {item.type === "console" && String(item.status || "").toLowerCase().includes("poss") && (
                <HardwareDropdown
                  id={`detail-condition-${item.id}`}
                  label="État"
                  value={item.condition || "bon"}
                  options={conditionOptions}
                  openedDropdown={openedDropdown}
                  setOpenedDropdown={setOpenedDropdown}
                  onChange={(value) => onUpdateHardwareCondition?.(item.id, value)}
                />
              )}

              {item.type === "display" && (
                <HardwareDropdown
                  id={`detail-display-size-${item.id}`}
                  label="Taille"
                  value={item.displaySize || ""}
                  options={currentDisplaySizeOptions}
                  openedDropdown={openedDropdown}
                  setOpenedDropdown={setOpenedDropdown}
                  onChange={(value) => onUpdateHardwareDisplaySize?.(item.id, value)}
                />
              )}

              <HardwareDropdown
                id={`detail-status-${item.id}`}
                label="Statut"
                value={item.status || "possédé"}
                options={statusOptions}
                openedDropdown={openedDropdown}
                setOpenedDropdown={setOpenedDropdown}
                onChange={(value) => onUpdateHardwareStatus?.(item.id, value)}
              />
            </div>
          </div>

          {showPcConfiguration && (
            <div className="modal-block hardware-pc-config-block">
              <div className="modal-block-title">Configuration PC</div>

              <div className="hardware-pc-config-grid">
                {PC_COMPONENT_FIELDS.map((field) => (
                  <HardwareDropdown
                    key={field.key}
                    id={`detail-pc-${field.key}-${item.id}`}
                    label={field.label}
                    value={item.pcConfig?.[field.key] || ""}
                    options={getPcComponentOptions(field.key)}
                    openedDropdown={openedDropdown}
                    setOpenedDropdown={setOpenedDropdown}
                    onChange={(value) =>
                      onUpdateHardwareComponent?.(item.id, field.key, value)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          <div className="modal-block">
            <div className="modal-block-title">Notes détaillées</div>

            <div className="hardware-rating-list">
              {fields.map((field) => {
                const fieldRating = clampRating(item.ratings?.[field.key]);

                return (
                  <div
                    key={field.key}
                    className={`hardware-rating-row ${fieldRating > 0 ? "rated" : ""}`}
                  >
                    <div className="hardware-rating-label">
                      <span className="hardware-rating-icon">{field.icon}</span>
                      <strong>{field.label}</strong>
                      <em>{formatRating10(fieldRating, "À noter")}</em>
                    </div>

                    <RatingSlider
                      rating={fieldRating}
                      onRate={(value) =>
                        onUpdateHardwareRating(item.id, field.key, value, item.type)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="modal-block">
            <div className="modal-block-title">Mon avis</div>

            <textarea
              className="review-textarea"
              value={localReview}
              placeholder="Note ce que tu penses de ce matériel..."
              onChange={(e) => setLocalReview(e.target.value)}
              onBlur={() => onUpdateHardwareReview(item.id, localReview)}
            />

            <button
              type="button"
              className="save-review-btn"
              onClick={() => onUpdateHardwareReview(item.id, localReview)}
            >
              Enregistrer l’avis
            </button>
          </div>

          <div className="hardware-detail-actions">
            <button
              type="button"
              className="hardware-detail-delete"
              onClick={() => {
                onDeleteHardware(item.id);
                onClose();
              }}
            >
              Supprimer ce matériel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HardwareTab({
  hardware,
  games,
  onAddHardware,
  onDeleteHardware,
  onToggleHardwareFavorite,
  onUpdateHardwareStatus,
  onUpdateHardwareCondition,
  onUpdateHardwareDisplaySize,
  onUpdateHardwareRank,
  onUpdateHardwareRating,
  onUpdateHardwareReview,
  onUpdateHardwareComponent,
}) {
  const [hardwareSearch, setHardwareSearch] = useState("");
  const [selectedHardwareId, setSelectedHardwareId] = useState(null);
  const [selectedHardwareBrandView, setSelectedHardwareBrandView] = useState(null);
  const [showAllHardwareByBrand, setShowAllHardwareByBrand] = useState(false);
  const [returnToAllHardware, setReturnToAllHardware] = useState(false);
  const [selectedCatalogVersionId, setSelectedCatalogVersionId] = useState(null);
  const [openedDropdown, setOpenedDropdown] = useState(null);
  const [hardwareCategory, setHardwareCategory] = useState("console");
  const [zoomedHardwareImage, setZoomedHardwareImage] = useState(null);
  const [selectedHardwareDetail, setSelectedHardwareDetail] = useState(null);
  const [showHardwareCatalog, setShowHardwareCatalog] = useState(false);
  const [hardwareCollectionFilter, setHardwareCollectionFilter] = useState("all");

  const autoControllerSyncRef = useRef(new Set());
  const hardwareTopRef = useRef(null);
  const hardwareCatalogPanelRef = useRef(null);
  const hardwareDetailRef = useRef(null);

  const scrollToHardwareArea = (ref, offset = 96) => {
    window.requestAnimationFrame(() => {
      if (!ref.current) return;

      const mobileOffset = window.matchMedia("(max-width: 700px)").matches
        ? Math.max(offset, 132)
        : offset;

      const top =
        ref.current.getBoundingClientRect().top + window.scrollY - mobileOffset;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth",
      });
    });
  };

  useEffect(() => {
    if (!selectedHardwareDetail) return;
    scrollToHardwareArea(hardwareDetailRef, 116);
  }, [selectedHardwareDetail?.instanceKey]);

  useEffect(() => {
    if (!selectedHardwareId || !selectedCatalogVersionId) return;

    const scrollTimer = window.setTimeout(() => {
      const selectedVersionCard = document.querySelector(
        `[data-catalog-version-id="${selectedCatalogVersionId}"]`
      );

      selectedVersionCard?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 80);

    return () => window.clearTimeout(scrollTimer);
  }, [selectedHardwareId, selectedCatalogVersionId]);

  const brandLogos = {
    Sony: "/images/brands/sony-corporate.png",
    PlayStation: "/images/brands/sony.png",
    Microsoft: "/images/brands/xbox.png",
    Nintendo: "/images/brands/nintendo.png",
    SEGA: "/images/brands/sega.png",
    PC: "/images/brands/pc.png",
    Valve: "/images/brands/steam.png",
    Atari: "/images/brands/atari.png",
    SNK: "/images/brands/snk.png",
    NEC: "/images/brands/nec.png",
    "3DO": "/images/brands/3do.png",
    Retro: "/images/brands/retro.png",
    Alternative: "/images/brands/retro.png",
    Xbox: "/images/brands/xbox.png",
    Bose: "/images/brands/bose.png",
    SteelSeries: "/images/brands/steelseries.png",
    HyperX: "/images/brands/hyperx.png",
    Logitech: "/images/brands/logitech.png",
    Beyerdynamic: "/images/brands/beyerdynamic.png",
    Sennheiser: "/images/brands/sennheiser.png",
    JBL: "/images/brands/jbl.png",
    Creative: "/images/brands/creative.png",
    Edifier: "/images/brands/edifier.png",
    Klipsch: "/images/brands/klipsch.png",
    Panasonic: "/images/brands/panasonic.png",
    EPOS: "/images/brands/epos.png",
    Audeze: "/images/brands/audeze.png",
    "Audio-Technica": "/images/brands/audio-technica.png",
    Apple: "/images/brands/apple.png",
    Meta: "/images/brands/meta.png",
    HTC: "/images/brands/htc.png",
    Pimax: "/images/brands/pimax.png",
    Bigscreen: "/images/brands/bigscreen.png",
    Pico: "/images/brands/pico.png",
    HP: "/images/brands/hp.png",
    Razer: "/images/brands/razer.png",
    Astro: "/images/brands/astro.png",
    Corsair: "/images/brands/corsair.png",
    "Turtle Beach": "/images/brands/turtlebeach.png",
    LG: "/images/brands/lg.png",
    Samsung: "/images/brands/samsung.png",
    TCL: "/images/brands/tcl.png",
    Hisense: "/images/brands/hisense.png",
    ASUS: "/images/brands/asus.png",
    Alienware: "/images/brands/alienware.png",
    MSI: "/images/brands/msi.png",
    Gigabyte: "/images/brands/gigabyte.png",
    Zowie: "/images/brands/zowie.png",
    Pulsar: "/images/brands/pulsar.png",
    VAXEE: "/images/brands/vaxee.png",
    "Endgame Gear": "/images/brands/endgame-gear.png",
    Lamzu: "/images/brands/lamzu.png",
    ROCCAT: "/images/brands/roccat.png",
    "Cooler Master": "/images/brands/cooler-master.png",
    Glorious: "/images/brands/glorious.png",
    Finalmouse: "/images/brands/finalmouse.png",
    Xtrfy: "/images/brands/xtrfy.png",
    Fnatic: "/images/brands/fnatic.png",
    Wooting: "/images/brands/wooting.png",
    Tryhard: "/images/brands/tryhard.png",
    Keychron: "/images/brands/keychron.png",
    Ducky: "/images/brands/ducky.png",
    Mountain: "/images/brands/mountain.png",
    Akko: "/images/brands/akko.png",
    DrunkDeer: "/images/brands/drunkdear.png",
    "8BitDo": "/images/brands/8bitdo.png",
    SCUF: "/images/brands/scuf.png",
    Victrix: "/images/brands/victrix.png",
    Nacon: "/images/brands/nacon.png",
    Thrustmaster: "/images/brands/thrustmaster.png",
    HORI: "/images/brands/hori.png",
    PowerA: "/images/brands/powera.png",
    Backbone: "/images/brands/backbone.png",
    Gulikit: "/images/brands/gulikit.png",
  };

  const getHardwareBrandLogo = (brand, type = hardwareCategory) => {
    if (brand === "Sony" && (type === "console" || type === "controller")) {
      return brandLogos.PlayStation;
    }

    return brandLogos[brand];
  };

  const HARDWARE_STATUS_OPTIONS = [
    { id: "possédé", label: "Possédé" },
    { id: "historique", label: "Historique" },
    { id: "wishlist", label: "Wishlist" },
    { id: "vendu", label: "Vendue" },
    { id: "à réparer", label: "À réparer" },
  ];

  const CONDITION_OPTIONS = [
    { id: "neuf", label: "Neuf" },
    { id: "très bon", label: "Très bon" },
    { id: "bon", label: "Bon" },
    { id: "usé", label: "Usé" },
    { id: "à réparer", label: "À réparer" },
  ];

  const DISPLAY_SIZE_OPTIONS = [
    { id: "", label: "Taille non précisée" },
    { id: "24", label: "24 pouces" },
    { id: "25", label: "25 pouces" },
    { id: "27", label: "27 pouces" },
    { id: "32", label: "32 pouces" },
    { id: "34", label: "34 pouces ultrawide" },
    { id: "38", label: "38 pouces ultrawide" },
    { id: "42", label: "42 pouces" },
    { id: "45", label: "45 pouces ultrawide" },
    { id: "48", label: "48 pouces" },
    { id: "49", label: "49 pouces super ultrawide" },
    { id: "55", label: "55 pouces" },
    { id: "57", label: "57 pouces super ultrawide" },
    { id: "65", label: "65 pouces" },
    { id: "75", label: "75 pouces" },
    { id: "77", label: "77 pouces" },
    { id: "83", label: "83 pouces" },
    { id: "85", label: "85 pouces" },
    { id: "98", label: "98 pouces" },
  ];

  const DEFAULT_CONTROLLER_BY_CONSOLE = {
    ps5: "dualsense",
    ps4: "dualshock-4",
    ps3: "dualshock-3",
    ps2: "dualshock-2",
    ps1: "dualshock",
    "xbox-series": "xbox-series-controller",
    "xbox-one": "xbox-one-controller",
    "xbox-360": "xbox-360-controller",
    "xbox-original": "xbox-controller-s",
    switch: "joy-con",
    wii: "wii-remote",
    "wii-u": "wii-u-pro-controller",
    gamecube: "gamecube-controller",
    "nintendo-64": "n64-controller",
    snes: "snes-controller",
    nes: "nes-controller",
    dreamcast: "dreamcast-controller",
    saturn: "saturn-controller",
    "mega-drive": "mega-drive-3b",
    "master-system": "master-system-controller",
  };

  const getHardwareStatusLabel = (status) => {
    const statusKey = getHardwareStatusKey(status);
    return (
      HARDWARE_STATUS_OPTIONS.find(
        (option) => getHardwareStatusKey(option.id) === statusKey
      )?.label || "Possédé"
    );
  };

  const getHardwareStatusKey = (status = "") => {
    const raw = String(status || "").toLowerCase();
    const normalized = getNormalizedStatus(raw);

    if (normalized.includes("wishlist")) return "wishlist";
    if (normalized.includes("historique")) return "historique";
    if (normalized.includes("vend")) return "vendu";
    if (normalized.includes("reparer")) return "reparer";
    if (normalized.includes("poss") || raw.includes("poss")) return "possede";

    return normalized;
  };

  const hasHardwareStatus = (item, statusKey) =>
    getHardwareStatusKey(item?.status) === statusKey;

  const isCurrentHardware = (item) =>
    hasHardwareStatus(item, "possede") || hasHardwareStatus(item, "reparer");

  const isRankableHardware = (item) =>
    ["possede", "historique", "vendu", "reparer"].includes(
      getHardwareStatusKey(item?.status)
    );
  const findControllerByVersionId = (versionId) => {
    for (const item of HARDWARE_CATALOG) {
      if (item.type !== "controller") continue;

      for (const variant of item.variants || []) {
        for (const version of variant.versions || []) {
          if (version.id === versionId) return { item, variant, version };
        }
      }
    }

    return null;
  };

  const hardwareRankingStatuses = [
    "possédé",
    "historique",
    "vendu",
    "à réparer",
  ];
  const hardwareStatusPriority = {
    possede: 3,
    reparer: 3,
    historique: 2,
    vendu: 1,
  };
  const getRankedHardware = (type) =>
    Object.values(
    hardware
      .filter(
        (item) =>
          item.type === type && isRankableHardware(item)
      )
      .reduce((rankedItems, item) => {
        const hardwareKey =
          item.versionId || `${item.catalogId}-${item.variantId}-${item.name}`;
        const currentItem = rankedItems[hardwareKey];

        if (
          !currentItem ||
          (hardwareStatusPriority[getHardwareStatusKey(item.status)] || 0) >
            (hardwareStatusPriority[getHardwareStatusKey(currentItem.status)] || 0) ||
          getHardwareAverageRating(item) > getHardwareAverageRating(currentItem)
        ) {
          rankedItems[hardwareKey] = item;
        }

        return rankedItems;
      }, {})
  ).sort((a, b) => {
      const ratingDiff =
        getHardwareAverageRating(b) - getHardwareAverageRating(a);
      if (ratingDiff !== 0) return ratingDiff;
      return (a.name || "").localeCompare(b.name || "");
    });

  const rankedControllers = getRankedHardware("controller");
  const rankedConsoles = getRankedHardware("console");
  const rankedAudio = getRankedHardware("audio");
  const rankedSpeakers = getRankedHardware("speaker");
  const rankedVr = getRankedHardware("vr");
  const rankedDisplays = getRankedHardware("display");
  const rankedMice = getRankedHardware("mouse");
  const rankedKeyboards = getRankedHardware("keyboard");

  useEffect(() => {
    const syncDefaultControllers = async () => {
      const currentOrPastConsoles = hardware.filter(
        (item) =>
          item.type === "console" &&
          ["possede", "historique", "vendu"].includes(getHardwareStatusKey(item.status))
      );

      for (const consoleItem of currentOrPastConsoles) {
        const controllerVersionId =
          DEFAULT_CONTROLLER_BY_CONSOLE[consoleItem.catalogId];

        if (!controllerVersionId) continue;

        const controllerData = findControllerByVersionId(controllerVersionId);
        if (!controllerData) continue;

        const ownedStatusId = HARDWARE_STATUS_OPTIONS[0].id;
        const controllerStatus = hasHardwareStatus(consoleItem, "possede")
          ? ownedStatusId
          : "historique";
        const syncKey = `controller-${controllerVersionId}-${controllerStatus}`;

        const alreadySynced = hardware.some((item) => {
          if (item.type !== "controller" || item.versionId !== controllerVersionId) {
            return false;
          }

          return controllerStatus === "historique"
            ? isRankableHardware(item)
            : hasHardwareStatus(item, "possede");
        });

        if (!alreadySynced && !autoControllerSyncRef.current.has(syncKey)) {
          autoControllerSyncRef.current.add(syncKey);

          await onAddHardware({
            catalogId: controllerData.item.id,
            variantId: controllerData.variant.id,
            versionId: controllerData.version.id,
            name: controllerData.version.name,
            parentName: controllerData.item.name,
            variantName: controllerData.variant.name,
            brand: controllerData.item.brand,
            type: "controller",
            image: controllerData.version.image || "",
            status: controllerStatus,
            rating: 0,
            ratings: {},
            review: "",
            favorite: false,
            source:
              controllerStatus === ownedStatusId
                ? "auto-controller"
                : "auto-controller-history",
            createdAt: Date.now(),
          });
        }
      }
    };

    syncDefaultControllers();
  }, [hardware]);
  const catalogByType = HARDWARE_CATALOG.filter(
    (item) => item.type === hardwareCategory
  );

  const hardwareBrands = [...new Set(catalogByType.map((item) => item.brand))];

  const preferredOrder = [
    "Sony",
    "Microsoft",
    "Nintendo",
    "SEGA",
    "PC",
    "Valve",
    "Atari",
    "SNK",
    "NEC",
    "3DO",
    "Retro",
    "Alternative",
    "Xbox",
    "Bose",
    "SteelSeries",
    "HyperX",
    "Logitech",
    "Beyerdynamic",
    "Sennheiser",
    "JBL",
    "Creative",
    "Edifier",
    "Klipsch",
    "Panasonic",
    "EPOS",
    "Audeze",
    "Audio-Technica",
    "Apple",
    "Meta",
    "PlayStation",
    "HTC",
    "Pimax",
    "Bigscreen",
    "Pico",
    "HP",
    "Razer",
    "Astro",
    "Corsair",
    "Turtle Beach",
    "LG",
    "Samsung",
    "TCL",
    "Hisense",
    "ASUS",
    "Alienware",
    "MSI",
    "Gigabyte",
    "Zowie",
    "Pulsar",
    "VAXEE",
    "Endgame Gear",
    "Lamzu",
    "ROCCAT",
    "Cooler Master",
    "Glorious",
    "Finalmouse",
    "Xtrfy",
    "Fnatic",
    "Wooting",
    "Tryhard",
    "Keychron",
    "Ducky",
    "Mountain",
    "Akko",
    "DrunkDeer",
    "8BitDo",
    "SCUF",
    "Victrix",
    "Nacon",
    "Thrustmaster",
    "HORI",
    "PowerA",
    "Backbone",
    "PDP",
    "Gulikit",
  ];

  const brandList = [
    ...new Set([
      ...preferredOrder.filter((brand) => hardwareBrands.includes(brand)),
      ...hardwareBrands.filter((brand) => !preferredOrder.includes(brand)).sort(),
    ]),
  ];

  const itemsBySelectedBrand = selectedHardwareBrandView
    ? catalogByType.filter((item) => item.brand === selectedHardwareBrandView)
    : [];

  const getCatalogModelCount = (catalogItem) =>
    catalogItem.variants?.reduce(
      (sum, variant) => sum + (variant.versions?.length || 0),
      0
    ) || 0;

  const catalogGroupsByBrand = brandList
    .map((brand) => ({
      brand,
      items: catalogByType.filter((item) => item.brand === brand),
    }))
    .filter((group) => group.items.length > 0);

  const catalogModelTotal = catalogByType.reduce(
    (sum, catalogItem) => sum + getCatalogModelCount(catalogItem),
    0
  );

  const findExistingCatalogHardware = (catalogItem, variant, version) =>
    hardware.find(
      (item) =>
        item.catalogId === catalogItem.id &&
        item.variantId === variant.id &&
        item.versionId === version.id &&
        item.type === catalogItem.type &&
        item.status !== "ranked"
    ) ||
    hardware.find(
      (item) =>
        item.versionId === version.id &&
        item.type === catalogItem.type &&
        item.status !== "ranked"
    );

  const selectedHardware = catalogByType.find(
    (item) => item.id === selectedHardwareId
  );

  const filteredCatalog = catalogByType.filter((item) => {
    const query = hardwareSearch.trim().toLowerCase();
    if (!query) return true;

    return (
      item.name.toLowerCase().includes(query) ||
      item.brand.toLowerCase().includes(query) ||
      item.variants?.some((variant) =>
        variant.versions?.some((version) =>
          version.name.toLowerCase().includes(query)
        )
      )
    );
  });

  const openCatalogItem = (catalogItem, options = {}) => {
    setSelectedHardwareBrandView(catalogItem.brand);
    setSelectedHardwareId(catalogItem.id);
    setReturnToAllHardware(Boolean(options.fromAll));
    setSelectedCatalogVersionId(options.versionId || null);
    setShowAllHardwareByBrand(false);
    setHardwareSearch("");
    if (!options.fromAll) {
      scrollToHardwareArea(hardwareTopRef);
    }
  };

  const addFromCatalog = async (
    catalogItem,
    variant,
    version,
    status = "possédé"
  ) => {
    const alreadyExists = hardware.some(
      (item) =>
        item.type === catalogItem.type &&
        item.versionId === version.id &&
        getHardwareStatusKey(item.status) === getHardwareStatusKey(status)
    );

    if (alreadyExists) return;

    await onAddHardware({
      catalogId: catalogItem.id,
      variantId: variant.id,
      versionId: version.id,
      name: version.name,
      parentName: catalogItem.name,
      variantName: variant.name,
      brand: catalogItem.brand,
      type: catalogItem.type,
      storage: version.storage || "",
      disc: version.disc ?? null,
      backwardCompatible: version.backwardCompatible ?? null,
      image: version.image || "",
      status,
      condition: catalogItem.type === "console" ? "bon" : "",
      displaySizes: catalogItem.type === "display" ? version.sizes || [] : [],
      displaySize:
        catalogItem.type === "display" && version.sizes?.length === 1
          ? version.sizes[0]
          : "",
      rating: 0,
      ratings: {},
      review: "",
      favorite: false,
      source: "local-catalog",
      createdAt: Date.now(),
    });
  };

  const getHardwareCompletion = () => {
    const completionCatalog = HARDWARE_CATALOG.filter(
      (item) => item.type === hardwareCategory
    );

    const totalVersions = completionCatalog.reduce((sum, hardwareItem) => {
      return (
        sum +
        (hardwareItem.variants || []).reduce((variantSum, variant) => {
          return variantSum + (variant.versions || []).length;
        }, 0)
      );
    }, 0);

    const ownedOrHistoryVersionIds = new Set(
      hardware
        .filter(
          (item) =>
            item.type === hardwareCategory &&
            isRankableHardware(item)
        )
        .map((item) => item.versionId)
        .filter(Boolean)
    );

    return {
      owned: ownedOrHistoryVersionIds.size,
      total: totalVersions,
      percent: totalVersions
        ? Math.round((ownedOrHistoryVersionIds.size / totalVersions) * 100)
        : 0,
    };
  };

  const hardwareCompletion = getHardwareCompletion();

  const collectionGroups =
    hardwareCategory === "controller"
      ? [
          {
            id: "controllers",
            title: "Manettes utilisées actuellement",
            items: hardware.filter(
              (item) => item.type === "controller" && hasHardwareStatus(item, "possede")
            ),
          },
          {
            id: "controller-ranking",
            title: "Classement automatique par note",
            items: rankedControllers,
          },
        ]
      : hardwareCategory === "audio"
      ? [
          {
            id: "audio-owned",
            title: "Casques utilisés actuellement",
            items: hardware.filter(
              (item) => item.type === "audio" && hasHardwareStatus(item, "possede")
            ),
          },
          {
            id: "audio-ranking",
            title: "Classement des casques par note",
            items: rankedAudio,
          },
          {
            id: "audio-wishlist",
            title: "Wishlist audio",
            items: hardware.filter(
              (item) => item.type === "audio" && hasHardwareStatus(item, "wishlist")
            ),
          },
        ]
      : hardwareCategory === "speaker"
      ? [
          {
            id: "speaker-owned",
            title: "Enceintes utilisées actuellement",
            items: hardware.filter(
              (item) => item.type === "speaker" && hasHardwareStatus(item, "possede")
            ),
          },
          {
            id: "speaker-ranking",
            title: "Classement des enceintes par note",
            items: rankedSpeakers,
          },
          {
            id: "speaker-wishlist",
            title: "Wishlist enceintes",
            items: hardware.filter(
              (item) => item.type === "speaker" && hasHardwareStatus(item, "wishlist")
            ),
          },
        ]
      : hardwareCategory === "vr"
      ? [
          {
            id: "vr-owned",
            title: "Casques VR utilisés actuellement",
            items: hardware.filter(
              (item) =>
                item.type === "vr" &&
                hasHardwareStatus(item, "possede")
            ),
          },
          {
            id: "vr-ranking",
            title: "Classement des casques VR par note",
            items: rankedVr,
          },
          {
            id: "vr-wishlist",
            title: "Wishlist VR",
            items: hardware.filter(
              (item) => item.type === "vr" && hasHardwareStatus(item, "wishlist")
            ),
          },
        ]
      : hardwareCategory === "mouse"
      ? [
          {
            id: "mouse-owned",
            title: "Souris utilisées actuellement",
            items: hardware.filter(
              (item) => item.type === "mouse" && hasHardwareStatus(item, "possede")
            ),
          },
          {
            id: "mouse-ranking",
            title: "Classement des souris par note",
            items: rankedMice,
          },
          {
            id: "mouse-wishlist",
            title: "Wishlist souris",
            items: hardware.filter(
              (item) => item.type === "mouse" && hasHardwareStatus(item, "wishlist")
            ),
          },
        ]
      : hardwareCategory === "keyboard"
      ? [
          {
            id: "keyboard-owned",
            title: "Claviers utilisés actuellement",
            items: hardware.filter(
              (item) => item.type === "keyboard" && hasHardwareStatus(item, "possede")
            ),
          },
          {
            id: "keyboard-ranking",
            title: "Classement des claviers par note",
            items: rankedKeyboards,
          },
          {
            id: "keyboard-wishlist",
            title: "Wishlist claviers",
            items: hardware.filter(
              (item) => item.type === "keyboard" && hasHardwareStatus(item, "wishlist")
            ),
          },
        ]
      : hardwareCategory === "display"
      ? [
          {
            id: "display-owned",
            title: "Écrans et TV utilisés actuellement",
            items: hardware.filter(
              (item) => item.type === "display" && hasHardwareStatus(item, "possede")
            ),
          },
          {
            id: "display-ranking",
            title: "Classement des écrans et TV par note",
            items: rankedDisplays,
          },
          {
            id: "display-wishlist",
            title: "Wishlist écrans & TV",
            items: hardware.filter(
              (item) => item.type === "display" && hasHardwareStatus(item, "wishlist")
            ),
          },
        ]
      : [
          {
            id: "possédé",
            title: "Ma collection actuelle",
            items: hardware.filter(
              (item) =>
                item.type === "console" &&
                isCurrentHardware(item)
            ),
          },
          {
            id: "console-ranking",
            title: "Classement des consoles par note",
            items: rankedConsoles,
          },
          {
            id: "wishlist",
            title: "Wishlist matériel",
            items: hardware.filter(
              (item) => item.type === "console" && hasHardwareStatus(item, "wishlist")
            ),
          },
        ];

  const hardwareCollectionFilters = [
    { id: "all", label: "Tout" },
    { id: "current", label: "Actuel" },
    { id: "history", label: "Historique" },
    { id: "wishlist", label: "Wishlist" },
  ];

  const matchesHardwareCollectionFilter = (item) => {
    if (hardwareCollectionFilter === "current") return isCurrentHardware(item);
    if (hardwareCollectionFilter === "wishlist") return hasHardwareStatus(item, "wishlist");
    if (hardwareCollectionFilter === "history") {
      return ["historique", "vendu"].includes(getHardwareStatusKey(item.status));
    }

    return true;
  };

  const visibleCollectionGroups = collectionGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(matchesHardwareCollectionFilter),
    }))
    .filter((group) => group.items.length > 0);

  const hasVisibleHardware = visibleCollectionGroups.some(
    (group) => group.items.length > 0
  );

  const getConsoleGameStats = (hardwareItem) => {
    return getHardwareConsoleGameStats(hardwareItem, games);
  };

  const hardwareTitle =
    hardwareCategory === "controller"
      ? "Mes manettes"
      : hardwareCategory === "audio"
      ? "Mon audio"
      : hardwareCategory === "speaker"
      ? "Mes enceintes"
      : hardwareCategory === "vr"
      ? "Mes casques VR"
      : hardwareCategory === "display"
      ? "Mes écrans & TV"
      : hardwareCategory === "mouse"
      ? "Mes souris"
      : hardwareCategory === "keyboard"
      ? "Mes claviers"
      : "Mon matériel";

  const allHardwareCatalogLabel =
    hardwareCategory === "controller"
      ? "Toutes les manettes"
      : hardwareCategory === "audio"
      ? "Tous les casques audio"
      : hardwareCategory === "speaker"
      ? "Toutes les enceintes"
      : hardwareCategory === "vr"
      ? "Tous les casques VR"
      : hardwareCategory === "display"
      ? "Tous les écrans & TV"
      : hardwareCategory === "mouse"
      ? "Toutes les souris"
      : hardwareCategory === "keyboard"
      ? "Tous les claviers"
      : "Toutes les consoles";

  const emptyTitle =
    hardwareCategory === "controller"
      ? "Aucune manette ajoutée"
      : hardwareCategory === "audio"
      ? "Aucun casque ajouté"
      : hardwareCategory === "speaker"
      ? "Aucune enceinte ajoutée"
      : hardwareCategory === "vr"
      ? "Aucun casque VR ajouté"
      : hardwareCategory === "mouse"
      ? "Aucune souris ajoutée"
      : hardwareCategory === "keyboard"
      ? "Aucun clavier ajouté"
      : "Aucun matériel ajouté";

  const emptySubtitle =
    hardwareCategory === "controller"
      ? "Ajoute une manette depuis le catalogue."
      : hardwareCategory === "audio"
      ? "Ajoute ton premier casque depuis le catalogue."
      : hardwareCategory === "speaker"
      ? "Ajoute tes premières enceintes gaming depuis le catalogue."
      : hardwareCategory === "vr"
      ? "Ajoute ton premier casque VR gaming depuis le catalogue."
      : hardwareCategory === "mouse"
      ? "Ajoute ta première souris gaming depuis le catalogue."
      : hardwareCategory === "keyboard"
      ? "Ajoute ton premier clavier gaming depuis le catalogue."
      : "Ajoute ta première console depuis le catalogue.";

  return (
    <div className="progression-stack">
      {hardwareCategory === "console" && (
        <div className="search-panel">
          <h2 className="panel-title">Complétion matériel</h2>

          <div className="completion-top">
            <strong>{hardwareCompletion.percent}%</strong>
            <span>
              {hardwareCompletion.owned} / {hardwareCompletion.total} versions
            </span>
          </div>

          <div className="xp-bar">
            <div
              className="xp-fill"
              style={{ width: `${hardwareCompletion.percent}%` }}
            />
          </div>
        </div>
      )}

      <div
        className={`search-panel hardware-catalog-panel ${showHardwareCatalog ? "open" : "collapsed"}`}
        ref={hardwareCatalogPanelRef}
      >
        <h2 className="panel-title">Catalogue matériel</h2>

        <div className="hardware-catalog-header">
          <h2 className="panel-title">Matériel</h2>

          <button
            type="button"
            className={`hardware-catalog-toggle ${showHardwareCatalog ? "active" : ""}`}
            onClick={() => {
              setShowHardwareCatalog((open) => !open);
              setSelectedHardwareId(null);
              setSelectedHardwareBrandView(null);
              setSelectedHardwareDetail(null);
              setShowAllHardwareByBrand(false);
              setReturnToAllHardware(false);
              setSelectedCatalogVersionId(null);
              setHardwareSearch("");
              scrollToHardwareArea(hardwareCatalogPanelRef);
            }}
          >
            {showHardwareCatalog ? "Fermer" : "Ajouter / rechercher"}
          </button>
        </div>

        <div className="hardware-type-switch">
          {[
            { id: "console", label: "Consoles" },
            { id: "controller", label: "Manettes" },
            { id: "audio", label: "Audio" },
            { id: "speaker", label: "Enceintes" },
            { id: "vr", label: "VR" },
            { id: "display", label: "Écrans & TV" },
            { id: "mouse", label: "Souris" },
            { id: "keyboard", label: "Claviers" },
          ].map((category) => (
            <button
              key={category.id}
              type="button"
              className={hardwareCategory === category.id ? "active" : ""}
              onClick={() => {
                setHardwareCategory(category.id);
                setSelectedHardwareId(null);
                setSelectedHardwareBrandView(null);
                setSelectedHardwareDetail(null);
                setShowAllHardwareByBrand(false);
                setReturnToAllHardware(false);
                setSelectedCatalogVersionId(null);
                setHardwareSearch("");
                setHardwareCollectionFilter("all");
                scrollToHardwareArea(hardwareCatalogPanelRef);
              }}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="input-container">
          <input
            value={hardwareSearch}
            onChange={(e) => {
              setHardwareSearch(e.target.value);
              setSelectedHardwareId(null);
              setSelectedHardwareBrandView(null);
              setShowAllHardwareByBrand(false);
              setReturnToAllHardware(false);
              setSelectedCatalogVersionId(null);
              setSelectedHardwareDetail(null);
            }}
            placeholder={
              hardwareCategory === "controller"
                ? "Rechercher une manette..."
                : hardwareCategory === "audio"
                ? "Rechercher un casque..."
                : hardwareCategory === "speaker"
                ? "Rechercher des enceintes gaming..."
                : hardwareCategory === "vr"
                ? "Rechercher un casque VR gaming..."
                : hardwareCategory === "display"
                ? "Rechercher un écran ou une TV gaming..."
                : hardwareCategory === "mouse"
                ? "Rechercher une souris gaming..."
                : hardwareCategory === "keyboard"
                ? "Rechercher un clavier gaming..."
                : "Rechercher une console..."
            }
          />
        </div>

        {hardwareSearch.trim() ? (
          <div className="hardware-console-list">
            {filteredCatalog.map((catalogItem) => (
              <button
                key={catalogItem.id}
                type="button"
                className="hardware-console-card"
                data-brand={catalogItem.brand}
                data-type={catalogItem.type}
                onClick={() => openCatalogItem(catalogItem)}
              >
                <div className="hardware-image-wrapper">
                  {catalogItem.variants?.[0]?.versions?.[0]?.image ? (
                    <img
                      src={catalogItem.variants?.[0]?.versions?.[0]?.image}
                      alt={catalogItem.name}
                      className="hardware-catalog-image"
                      onError={handleHardwareImageError}
                    />
                  ) : (
                    <div className="hardware-collection-placeholder">
                      {getHardwareTypeIcon(catalogItem.type)}
                    </div>
                  )}
                </div>

                <div className="hardware-console-info">
                  <div className="hardware-name">{catalogItem.name}</div>
                  <div className="hardware-meta">{catalogItem.brand}</div>
                </div>

                <div className="hardware-console-arrow">›</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="hardware-view-container" ref={hardwareTopRef}>
            {showAllHardwareByBrand ? (
              <div className="hardware-view hardware-all-view">
                <button
                  type="button"
                  className="hardware-back-button"
                  onClick={() => {
                    setShowAllHardwareByBrand(false);
                    setSelectedHardwareBrandView(null);
                    setSelectedHardwareId(null);
                    setReturnToAllHardware(false);
                    setSelectedCatalogVersionId(null);
                    scrollToHardwareArea(hardwareTopRef);
                  }}
                >
                  <ArrowLeft size={16} /> Marques
                </button>

                <div className="hardware-all-heading">
                  <h3 className="hardware-group-title">
                    {allHardwareCatalogLabel}
                  </h3>
                  <span>
                    {catalogByType.reduce(
                      (sum, catalogItem) => sum + getCatalogModelCount(catalogItem),
                      0
                    )}{" "}
                    modèles
                  </span>
                </div>

                <div className="hardware-all-groups">
                  {catalogGroupsByBrand.map((group) => (
                    <section key={group.brand} className="hardware-all-group">
                      <div className="hardware-all-brand-head">
                        <div className="hardware-brand-line">
                          {getHardwareBrandLogo(group.brand) && (
                            <img
                              src={getHardwareBrandLogo(group.brand)}
                              alt={group.brand}
                              className="brand-logo"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                          <span className="hardware-brand-name">
                            {group.brand}
                          </span>
                        </div>
                      </div>

                      {group.items.map((catalogItem) => (
                        <div key={catalogItem.id} className="hardware-all-model">
                          <div className="hardware-all-model-title">
                            <span>{catalogItem.name}</span>
                            <small>{getCatalogModelCount(catalogItem)} modèles</small>
                          </div>

                          <div className="hardware-console-list">
                            {catalogItem.variants?.flatMap((variant) =>
                              (variant.versions || []).map((version) => {
                                const existingItem = findExistingCatalogHardware(
                                  catalogItem,
                                  variant,
                                  version
                                );
                                const metaParts = [
                                  version.storage || "",
                                  variant.name &&
                                  variant.name !== catalogItem.name &&
                                  variant.name !== version.name
                                    ? variant.name
                                    : "",
                                ].filter(Boolean);
                                const detailInstanceKey = `all-${catalogItem.id}-${version.id}`;
                                const detailItem =
                                  hardware.find((item) => item.id === existingItem?.id) ||
                                  existingItem;

                                return (
                                  <Fragment key={version.id}>
                                  <div
                                    className={`hardware-console-card hardware-all-version-card ${existingItem ? "is-openable" : ""} ${
                                      selectedHardwareDetail?.instanceKey === detailInstanceKey
                                        ? "active"
                                        : ""
                                    }`}
                                    data-brand={catalogItem.brand}
                                    data-type={catalogItem.type}
                                    onClick={() => {
                                      if (!existingItem) return;
                                      setSelectedHardwareDetail((current) =>
                                        current?.instanceKey === detailInstanceKey
                                          ? null
                                          : { ...existingItem, instanceKey: detailInstanceKey }
                                      );
                                    }}
                                  >
                                    <div className="hardware-image-wrapper">
                                      {version.image ? (
                                        <img
                                          src={version.image}
                                          alt={version.name}
                                          className="hardware-catalog-image"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            setZoomedHardwareImage({
                                              image: version.image,
                                              name: version.name,
                                              x: event.clientX,
                                              y: event.clientY,
                                            });
                                          }}
                                          onError={handleHardwareImageError}
                                        />
                                      ) : (
                                        <div className="hardware-collection-placeholder">
                                          {getHardwareTypeIcon(catalogItem.type)}
                                        </div>
                                      )}
                                    </div>

                                    <div className="hardware-console-info">
                                      <div className="hardware-name">
                                        {version.name}
                                      </div>
                                      {metaParts.length > 0 && (
                                        <div className="hardware-meta">
                                          {metaParts.join(" - ")}
                                        </div>
                                      )}

                                      {existingItem ? (
                                        <div className="hardware-status-badge">
                                          {getHardwareStatusLabel(existingItem.status)}
                                        </div>
                                      ) : (
                                        <div className="hardware-status-actions hardware-all-status-actions">
                                          {[
                                            ["possédé", "Je l'ai"],
                                            ["historique", "Historique"],
                                            ["wishlist", "Wishlist"],
                                          ].map(([status, label]) => (
                                            <button
                                              key={status}
                                              type="button"
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                addFromCatalog(catalogItem, variant, version, status);
                                              }}
                                            >
                                              {label}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                  </div>
                                  {selectedHardwareDetail?.instanceKey === detailInstanceKey &&
                                    detailItem && (
                                      <HardwareDetailModal
                                        item={{
                                          ...detailItem,
                                          instanceKey: detailInstanceKey,
                                        }}
                                        detailRef={hardwareDetailRef}
                                        onClose={() => setSelectedHardwareDetail(null)}
                                        onDeleteHardware={onDeleteHardware}
                                        openedDropdown={openedDropdown}
                                        setOpenedDropdown={setOpenedDropdown}
                                        statusOptions={HARDWARE_STATUS_OPTIONS}
                                        conditionOptions={CONDITION_OPTIONS}
                                        displaySizeOptions={DISPLAY_SIZE_OPTIONS}
                                        onUpdateHardwareStatus={onUpdateHardwareStatus}
                                        onUpdateHardwareCondition={onUpdateHardwareCondition}
                                        onUpdateHardwareDisplaySize={onUpdateHardwareDisplaySize}
                                        onUpdateHardwareComponent={onUpdateHardwareComponent}
                                        onUpdateHardwareRating={onUpdateHardwareRating}
                                        onUpdateHardwareReview={onUpdateHardwareReview}
                                        onToggleHardwareFavorite={onToggleHardwareFavorite}
                                        consoleGameStats={getConsoleGameStats(detailItem)}
                                        getHardwareStatusLabel={getHardwareStatusLabel}
                                      />
                                    )}
                                  </Fragment>
                                );
                              })
                            )}
                          </div>
                        </div>
                      ))}
                    </section>
                  ))}
                </div>
              </div>
            ) : !selectedHardwareBrandView ? (
              <div className="hardware-brand-grid">
                <button
                  type="button"
                  className="hardware-brand-card hardware-all-card"
                  onClick={() => {
                    setShowAllHardwareByBrand(true);
                    setSelectedHardwareBrandView(null);
                    setSelectedHardwareId(null);
                    setSelectedHardwareDetail(null);
                    setReturnToAllHardware(false);
                    setSelectedCatalogVersionId(null);
                    scrollToHardwareArea(hardwareTopRef);
                  }}
                >
                  <span>{allHardwareCatalogLabel}</span>
                  <small>{catalogModelTotal} modèles</small>
                </button>

                {brandList.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    className="hardware-brand-card"
                    onClick={() => {
                      setSelectedHardwareBrandView(brand);
                      setSelectedHardwareId(null);
                      setSelectedHardwareDetail(null);
                      setSelectedCatalogVersionId(null);
                      scrollToHardwareArea(hardwareTopRef);
                    }}
                  >
                    {getHardwareBrandLogo(brand) && (
                      <img
                        src={getHardwareBrandLogo(brand)}
                        alt={brand}
                        className="hardware-brand-card-logo"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <span>{brand}</span>
                  </button>
                ))}
              </div>
            ) : !selectedHardware ? (
              <div className="hardware-view">
                <button
                  type="button"
                  className="hardware-back-button"
                  onClick={() => {
                    setSelectedHardwareBrandView(null);
                    setSelectedHardwareId(null);
                    scrollToHardwareArea(hardwareTopRef);
                  }}
                >
                  <span>⬅</span> Marques
                </button>

                <h3 className="hardware-group-title">
                  {selectedHardwareBrandView}
                </h3>

                <div className="hardware-console-list">
                  {itemsBySelectedBrand.map((catalogItem) => (
                    <button
                      key={catalogItem.id}
                      type="button"
                      className="hardware-console-card"
                      data-brand={catalogItem.brand}
                      data-type={catalogItem.type}
                      onClick={() => openCatalogItem(catalogItem)}
                    >
                      <div className="hardware-image-wrapper">
                        {catalogItem.variants?.[0]?.versions?.[0]?.image ? (
                            <img
                              src={catalogItem.variants?.[0]?.versions?.[0]?.image}
                              alt={catalogItem.name}
                              className="hardware-catalog-image"
                              onError={handleHardwareImageError}
                            />
                        ) : (
                          <div className="hardware-collection-placeholder">
                            {getHardwareTypeIcon(catalogItem.type)}
                          </div>
                        )}
                      </div>

                      <div className="hardware-console-info">
                        <div className="hardware-name">{catalogItem.name}</div>
                        <div className="hardware-meta">
                          {catalogItem.variants?.reduce(
                            (sum, v) => sum + (v.versions?.length || 0),
                            0
                          )} modèles
                        </div>
                      </div>

                      <div className="hardware-console-arrow">›</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="hardware-view hardware-detail-view">
                <button
                  type="button"
                  className="hardware-back-button"
                  onClick={() => {
                    setSelectedHardwareId(null);
                    if (returnToAllHardware) {
                      setSelectedHardwareBrandView(null);
                      setShowAllHardwareByBrand(true);
                    }
                    scrollToHardwareArea(hardwareTopRef);
                  }}
                >
                  <span>⬅</span>{" "}
                  {returnToAllHardware ? allHardwareCatalogLabel : selectedHardwareBrandView}
                </button>

                <h3 className="hardware-group-title">
                  {selectedHardware.name}
                </h3>

                {selectedHardware.variants?.map((variant) => (
                  <div key={variant.id} className="hardware-variant-block">
                    <div className="hardware-variant-title">{variant.name}</div>

                    <div className="hardware-catalog-grid">
                      {variant.versions?.map((version) => {
                        const existingItem = findExistingCatalogHardware(
                          selectedHardware,
                          variant,
                          version
                        );

                        const ownedItem =
                          existingItem && hasHardwareStatus(existingItem, "possede")
                            ? existingItem
                            : null;

                        return (
                          <div
                            key={version.id}
                            className={`hardware-catalog-card ${
                              selectedCatalogVersionId === version.id
                                ? "selected-catalog-version"
                                : ""
                            }`}
                            data-type={selectedHardware.type}
                            data-catalog-version-id={version.id}
                          >
                            <div className="hardware-image-wrapper">
                              {version.image ? (
                                <button
                                  type="button"
                                  className="hardware-image-zoom-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setZoomedHardwareImage({
                                      image: version.image,
                                      name: version.name,
                                      x: e.clientX,
                                      y: e.clientY,
                                    });
                                  }}
                                >
                                  <img
                                    src={version.image}
                                    alt={version.name}
                                    className="hardware-catalog-image"
                                    onError={handleHardwareImageError}
                                  />
                                </button>
                              ) : (
                                <div className="hardware-collection-placeholder">
                                  {getHardwareTypeIcon(selectedHardware.type)}
                                </div>
                              )}
                            </div>

                            <div className="hardware-catalog-content">
                              <div className="hardware-name">
                                {version.name}
                              </div>

                              <div className="hardware-meta">
                                {selectedHardware.brand}
                                {version.storage ? ` • ${version.storage}` : ""}
                              </div>

                              {selectedHardware.type === "controller" ? (
                                <div className="hardware-status-actions">
                                  {!ownedItem && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        addFromCatalog(
                                          selectedHardware,
                                          variant,
                                          version,
                                          "possédé"
                                        )
                                      }
                                    >
                                      J’utilise cette manette
                                    </button>
                                  )}

                                  {ownedItem && (
                                    <div className="hardware-status-badge">
                                      Utilisée
                                    </div>
                                  )}

                                </div>
                              ) : existingItem ? (
                                <div className="hardware-status-badge">
                                  {getHardwareStatusLabel(existingItem.status)}
                                </div>
                              ) : (
                                <div className="hardware-status-actions">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addFromCatalog(
                                        selectedHardware,
                                        variant,
                                        version,
                                        "possédé"
                                      )
                                    }
                                  >
                                    Je l’ai
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      addFromCatalog(
                                        selectedHardware,
                                        variant,
                                        version,
                                        "historique"
                                      )
                                    }
                                  >
                                    Historique
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      addFromCatalog(
                                        selectedHardware,
                                        variant,
                                        version,
                                        "wishlist"
                                      )
                                    }
                                  >
                                    Wishlist
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>



      <div className="search-panel">
        <div className="hardware-collection-head">
          <h2 className="panel-title">{hardwareTitle}</h2>

          <div className="hardware-collection-filters">
            {hardwareCollectionFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={hardwareCollectionFilter === filter.id ? "active" : ""}
                onClick={() => setHardwareCollectionFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {!hasVisibleHardware ? (
          <EmptyState title={emptyTitle} subtitle={emptySubtitle} />
        ) : (
          <div className="hardware-collection-sections">
            {visibleCollectionGroups.map((group) => (
                <div key={group.id} className="hardware-collection-section">
                  <h3 className="hardware-group-title">{group.title}</h3>

                  <div className="hardware-collection-grid">
                    {group.items.map((item, index) => {
                      const detailInstanceKey = `${group.id}-${item.id}`;

                      return (
                      <Fragment key={detailInstanceKey}>
                      {selectedHardwareDetail?.instanceKey === detailInstanceKey ? (
                        <HardwareDetailModal
                          item={hardware.find((h) => h.id === item.id) || item}
                          detailRef={hardwareDetailRef}
                          onClose={() => setSelectedHardwareDetail(null)}
                          onDeleteHardware={onDeleteHardware}
                          openedDropdown={openedDropdown}
                          setOpenedDropdown={setOpenedDropdown}
                          statusOptions={HARDWARE_STATUS_OPTIONS}
                          conditionOptions={CONDITION_OPTIONS}
                          displaySizeOptions={DISPLAY_SIZE_OPTIONS}
                          onUpdateHardwareStatus={onUpdateHardwareStatus}
                          onUpdateHardwareCondition={onUpdateHardwareCondition}
                          onUpdateHardwareDisplaySize={onUpdateHardwareDisplaySize}
                          onUpdateHardwareComponent={onUpdateHardwareComponent}
                          onUpdateHardwareRating={onUpdateHardwareRating}
                          onUpdateHardwareReview={onUpdateHardwareReview}
                          onToggleHardwareFavorite={onToggleHardwareFavorite}
                          consoleGameStats={getConsoleGameStats(
                            hardware.find((h) => h.id === item.id) || item
                          )}
                          getHardwareStatusLabel={getHardwareStatusLabel}
                        />
                      ) : (
                      <div
                        className="hardware-collection-card hardware-card-v3"
                        data-type={item.type}
                        onClick={() => {
                          setSelectedHardwareDetail((current) =>
                            current?.instanceKey === detailInstanceKey
                              ? null
                              : { ...item, instanceKey: detailInstanceKey }
                          );
                        }}
                      >
                        <div className="hardware-card-image-zone">
                          {item.image ? (
                            <button
                              type="button"
                              className="hardware-image-zoom-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setZoomedHardwareImage({
                                  image: item.image,
                                  name: item.name,
                                  x: e.clientX,
                                  y: e.clientY,
                                });
                              }}
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="hardware-collection-image"
                                onError={handleHardwareImageError}
                              />
                            </button>
                          ) : (
                            <div className="hardware-collection-placeholder">
                              {getHardwareTypeIcon(item.type)}
                            </div>
                          )}
                        </div>

                        <div className="hardware-card-main">
                          <div className="hardware-card-head">
                            <div className="hardware-card-title-zone">
                              <div className="hardware-name">
                                {group.id === "controller-ranking" ? `#${index + 1} ${item.name}` : item.name}
                              </div>

                              <div className="hardware-brand-rating">
                                <span>{item.brand || "Marque inconnue"}</span>
                                <span className="hardware-card-rating">
                                  ⭐{" "}
                                  {formatRating10(
                                    getHardwareAverageRating(item),
                                    "Non noté"
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="hardware-card-actions">

                              <button
                                type="button"
                                className="delete-btn hardware-delete-floating"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteHardware(item.id);
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          <div className="hardware-card-bottom">
                            <div className="hardware-card-badges">
                              {item.type === "console" && String(item.status || "").toLowerCase().includes("poss") && (
                                <span className="hardware-card-badge">
                                  {CONDITION_OPTIONS.find((option) => option.id === (item.condition || "bon"))?.label || "Bon"}
                                </span>
                              )}

                              <span className="hardware-card-badge strong">
                                {getHardwareStatusLabel(item.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      )}
                      </Fragment>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      

      

      {zoomedHardwareImage && createPortal(
        <div
          className="hardware-zoom-backdrop"
          onClick={() => setZoomedHardwareImage(null)}
        >
          <div
            className="hardware-zoom-modal"
            style={{
              "--hardware-zoom-x": `${zoomedHardwareImage.x || window.innerWidth / 2}px`,
              "--hardware-zoom-y": `${zoomedHardwareImage.y || window.innerHeight / 2}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="hardware-zoom-close"
              onClick={() => setZoomedHardwareImage(null)}
            >
              ✕
            </button>

            <img
              src={zoomedHardwareImage.image}
              alt={zoomedHardwareImage.name}
              className="hardware-zoom-image"
            />

            <div className="hardware-zoom-title">
              {zoomedHardwareImage.name}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ==================== OPTIONS ==================== */

function OptionsTab({
  theme,
  setTheme,
  uiMode,
  setUiMode,
  soundEnabled,
  setSoundEnabled,
  appOptions,
  onOptionChange,
  socialProfile,
  onProfileChange,
  onProfileVisibilityChange,
  onExportBackup,
  onImportBackup,
  onResetOptions,
  games = [],
  onRepairGameData,
}) {
  const [helpTopic, setHelpTopic] = useState(null);
  const [isRepairingGameData, setIsRepairingGameData] = useState(false);
  const [showIntegrityDetails, setShowIntegrityDetails] = useState(false);
  const themes = [
  { id: "theme-indigo", label: "Aurora Neon" },
  { id: "theme-playstation", label: "PS5 Premium" },
  { id: "theme-xbox", label: "Xbox Dashboard" },
  { id: "theme-steamdeck", label: "Steam Deck" },
  { id: "theme-emerald", label: "Circuit Mint" },
  { id: "theme-crimson", label: "Redline" },
  { id: "theme-graphite", label: "Carbon Ice" },
  { id: "theme-retro", label: "Arcade Sunset" },
  { id: "theme-cyberpunk", label: "Neon Tokyo" },
];
  const startTabs = [
    { id: "home", label: "Accueil" },
    { id: "library", label: "Bibliothèque" },
    { id: "social", label: "Social" },
    { id: "top5", label: "Top 5" },
    { id: "hardware", label: "Matériel" },
  ];
  const afterAddActions = [
    { id: "stay", label: "Rester" },
    { id: "library", label: "Bibliothèque" },
    { id: "detail", label: "Fiche" },
  ];
  const publicSections = {
    ...DEFAULT_PUBLIC_SECTIONS,
    ...(socialProfile.publicSections || {}),
  };
  const dealSources = {
    ...DEFAULT_APP_OPTIONS.dealSources,
    ...(appOptions.dealSources || {}),
  };
  const gameIntegrityIssues = useMemo(
    () => getGameDataIntegrityIssues(games),
    [games]
  );
  const gameIntegrityPreview = gameIntegrityIssues.slice(
    0,
    showIntegrityDetails ? 8 : 3
  );
  const handleRepairGameData = async () => {
    if (!gameIntegrityIssues.length || !onRepairGameData) return;

    setIsRepairingGameData(true);
    try {
      await onRepairGameData(gameIntegrityIssues);
      setShowIntegrityDetails(false);
    } finally {
      setIsRepairingGameData(false);
    }
  };
  const updateDealSource = (source, enabled) => {
    onOptionChange("dealSources", {
      ...dealSources,
      [source]: enabled,
    });
  };
  const updatePublicSection = (section, enabled) => {
    onProfileChange("publicSections", {
      ...publicSections,
      [section]: enabled,
    });
  };
  const helpTopics = {
    icon: {
      title: "Icône de l'app",
      lead: "Change l'icône utilisée par le navigateur et la PWA.",
      bullets: [
        "Sur iPhone, l'icône déjà ajoutée à l'écran d'accueil ne se met pas toujours à jour seule.",
        "Si elle ne change pas, supprime le raccourci puis ajoute à nouveau l'app à l'écran d'accueil.",
      ],
    },
    animations: {
      title: "Transition d'onglet",
      lead: "Ce réglage concerne uniquement l'animation pixel quand tu changes d'onglet.",
      bullets: [
        "Activée garde l'effet pixel entre deux onglets.",
        "Désactivée change d'onglet plus directement, utile si l'animation paraît lente.",
      ],
    },
    navigation: {
      title: "Démarrage",
      lead: "Décide où l'app s'ouvre quand tu la relances.",
      bullets: [
        "Dernier onglet reprend automatiquement l'endroit où tu t'étais arrêté.",
        "Onglet fixe ouvre toujours la section choisie.",
        "Accueil reste le choix le plus neutre si tu veux un point de départ stable.",
      ],
    },
    ergonomics: {
      title: "Ergonomie",
      lead: "Règle les comportements qui changent vraiment le confort d'utilisation au quotidien.",
      bullets: [
        "Confirmation protège les suppressions de jeux et de matériel.",
        "Après ajout décide si la recherche reste ouverte, si tu vas à la bibliothèque ou si la fiche du jeu s'ouvre directement.",
      ],
    },
    publicProfile: {
      title: "Profil public",
      lead: "Contrôle ce que les autres peuvent voir de ton profil.",
      bullets: [
        "Privé garde le profil uniquement dans ton app.",
        "Public permet de partager ton profil avec ton identifiant.",
        "Les blocs visibles masquent ou affichent photos, matériel, activité et jeux fondateurs.",
      ],
    },
    rating: {
      title: "Notation",
      lead: "Change seulement la façon d'afficher les notes.",
      bullets: [
        "Le calcul interne reste toujours sur 10 pour éviter les erreurs.",
        "Les étoiles et le mode compact sont uniquement des affichages.",
      ],
    },
    deals: {
      title: "Promos",
      lead: "Filtre les boutiques et la région utilisées pour les promotions.",
      bullets: [
        "Steam et Epic peuvent être chargés automatiquement quand leurs sources répondent.",
        "PSN reste un lien public, car Sony ne fournit pas de flux stable équivalent.",
        "La région change les prix ou les pages quand la boutique le permet.",
      ],
    },
    data: {
      title: "Données",
      lead: "Garde une porte de secours pour tes réglages et vérifie les anciennes données.",
      bullets: [
        "Exporter crée une sauvegarde JSON locale.",
        "Importer restaure les options et le profil social depuis une sauvegarde.",
        "Reset options remet uniquement les réglages d'options par défaut.",
        "Le diagnostic aligne statut, progression et jeu terminé pour éviter les compteurs faux.",
      ],
    },
  };
  const SectionTitle = ({ title, help }) => (
    <div className="option-section-headline">
      <h3>{title}</h3>
      {help && (
        <button
          type="button"
          className="option-help-btn"
          onClick={() => setHelpTopic(helpTopics[help])}
          aria-label={`Aide ${title}`}
        >
          ?
        </button>
      )}
    </div>
  );

  return (
    <div className="progression-stack options-tab">
      <div className="search-panel options-panel">
        <div className="options-header">
          <div>
            <h2 className="panel-title">Options</h2>
            <div className="option-value">
              Règle l'app sans toucher à tes jeux ni à ton matériel.
            </div>
          </div>
        </div>

        <div className="options-group">
          <div className="options-group-head">
            <span>Interface</span>
            <p>Ce qui change l'identité visuelle et les retours de l'app.</p>
          </div>

          <div className="option-section">
            <SectionTitle title="Thème" />

            <div className="option-pill-grid themes">
              {themes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`option-pill theme-${item.id} ${
                    theme === item.id ? "active" : ""
                  }`}
                  onClick={() => setTheme(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="option-section option-section-split">
            <div className="option-setting-card">
              <div>
                <SectionTitle title="Transition d'onglet" help="animations" />
                <span>Active ou désactive uniquement l'effet pixel entre les onglets.</span>
              </div>
              <div className="option-pill-grid two compact">
                <button
                  type="button"
                  className={`option-pill ${uiMode === "modern" ? "active" : ""}`}
                  onClick={() => setUiMode("modern")}
                >
                  Activée
                </button>

                <button
                  type="button"
                  className={`option-pill ${uiMode === "reduced" ? "active" : ""}`}
                  onClick={() => setUiMode("reduced")}
                >
                  Désactivée
                </button>
              </div>
            </div>

            <div className="option-setting-card">
              <div>
                <strong>En-tête</strong>
                <span>Standard garde les infos XP en haut. Compact libère de la hauteur pour les listes longues.</span>
              </div>
              <div className="option-pill-grid two compact">
                <button
                  type="button"
                  className={`option-pill ${appOptions.headerMode !== "compact" ? "active" : ""}`}
                  onClick={() => onOptionChange("headerMode", "standard")}
                >
                  Standard
                </button>
                <button
                  type="button"
                  className={`option-pill ${appOptions.headerMode === "compact" ? "active" : ""}`}
                  onClick={() => onOptionChange("headerMode", "compact")}
                >
                  Compact
                </button>
              </div>
            </div>

            <div className="option-setting-card">
              <div>
                <strong>Icône de l'app</strong>
                <span>Choisis l'icône utilisée par le navigateur et l'app installée.</span>
              </div>
              <div className="option-pill-grid two compact">
                <button
                  type="button"
                  className={`option-pill ${appOptions.appIcon === "theme" ? "active" : ""}`}
                  onClick={() => onOptionChange("appIcon", "theme")}
                >
                  Thème
                </button>
                <button
                  type="button"
                  className={`option-pill ${appOptions.appIcon === "classic" ? "active" : ""}`}
                  onClick={() => onOptionChange("appIcon", "classic")}
                >
                  CP
                </button>
              </div>
            </div>

            <div className="option-setting-card">
              <div>
                <strong>Son</strong>
                <span>Active les retours sonores de l'interface ou teste le son actuel.</span>
              </div>
              <div className="option-pill-grid three compact">
                <button
                  type="button"
                  className={`option-pill ${soundEnabled ? "active" : ""}`}
                  onClick={() => {
                    setSoundEnabled(true);
                    localStorage.setItem("checkpoint-sound-enabled", "true");
                    playSound("success", { force: true });
                  }}
                >
                  Activé
                </button>

                <button
                  type="button"
                  className={`option-pill ${!soundEnabled ? "active" : ""}`}
                  onClick={() => setSoundEnabled(false)}
                >
                  Désactivé
                </button>
                <button
                  type="button"
                  className="option-pill"
                  onClick={() => playSound("success", { force: true })}
                >
                  Test
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="options-group">
          <div className="options-group-head">
            <span>Comportement</span>
            <p>Les choix qui évitent des gestes inutiles ou des erreurs.</p>
          </div>

          <div className="option-section">
            <SectionTitle title="Démarrage" help="navigation" />

            <div className="option-setting-card">
              <div>
                <strong>Ouverture de l'app</strong>
                <span>Reprendre où tu t'étais arrêté ou ouvrir toujours le même onglet.</span>
              </div>
              <div className="option-pill-grid two startup-primary">
                <button
                  type="button"
                  className={`option-pill ${appOptions.rememberLastTab ? "active" : ""}`}
                  onClick={() => onOptionChange("rememberLastTab", true)}
                >
                  Dernier onglet
                </button>
                <button
                  type="button"
                  className={`option-pill ${!appOptions.rememberLastTab ? "active" : ""}`}
                  onClick={() => onOptionChange("rememberLastTab", false)}
                >
                  Onglet fixe
                </button>
              </div>
            </div>

            {!appOptions.rememberLastTab && (
              <div className="option-pill-grid compact option-subgrid startup-target-grid">
                {startTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`option-pill ${appOptions.startTab === tab.id ? "active" : ""}`}
                    onClick={() => onOptionChange("startTab", tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="option-section">
            <SectionTitle title="Ergonomie" help="ergonomics" />

            <div className="option-setting-card">
              <div>
                <strong>Navigation mobile</strong>
                <span>Confort agrandit la barre du bas et les zones tactiles sur iPhone.</span>
              </div>
              <div className="option-pill-grid two compact">
                <button
                  type="button"
                  className={`option-pill ${appOptions.mobileNavMode !== "comfort" ? "active" : ""}`}
                  onClick={() => onOptionChange("mobileNavMode", "standard")}
                >
                  Standard
                </button>
                <button
                  type="button"
                  className={`option-pill ${appOptions.mobileNavMode === "comfort" ? "active" : ""}`}
                  onClick={() => onOptionChange("mobileNavMode", "comfort")}
                >
                  Confort
                </button>
              </div>
            </div>

            <div className="option-setting-card">
              <div>
                <strong>Suppressions</strong>
                <span>Demander une validation avant de supprimer un jeu ou un matériel.</span>
              </div>
              <div className="option-pill-grid two compact">
                <button
                  type="button"
                  className={`option-pill ${appOptions.confirmDangerActions ? "active" : ""}`}
                  onClick={() => onOptionChange("confirmDangerActions", true)}
                >
                  Confirmer
                </button>
                <button
                  type="button"
                  className={`option-pill ${!appOptions.confirmDangerActions ? "active" : ""}`}
                  onClick={() => onOptionChange("confirmDangerActions", false)}
                >
                  Direct
                </button>
              </div>
            </div>

            <div className="option-setting-card">
              <div>
                <strong>Après ajout d'un jeu</strong>
                <span>Choisir ce que fait l'app quand tu ajoutes un résultat de recherche.</span>
              </div>
              <div className="option-pill-grid three compact">
                {afterAddActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={`option-pill ${
                      appOptions.afterAddAction === action.id ? "active" : ""
                    }`}
                    onClick={() => onOptionChange("afterAddAction", action.id)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="options-group">
          <div className="options-group-head">
            <span>Profil & services</span>
            <p>Ce qui sort de ta bibliothèque personnelle : profil public, notes et promos.</p>
          </div>

          <div className="option-section option-section-split">
            <div className="option-setting-card">
              <div>
                <SectionTitle title="Profil public" help="publicProfile" />
                <span>Choisis si ton profil peut être partagé ou reste seulement visible par toi.</span>
              </div>
              <div className="option-pill-grid two startup-primary">
                <button
                  type="button"
                  className={`option-pill ${socialProfile.visibility !== "public" ? "active" : ""}`}
                  onClick={() => onProfileVisibilityChange("prive")}
                >
                  Privé
                </button>
                <button
                  type="button"
                  className={`option-pill ${socialProfile.visibility === "public" ? "active" : ""}`}
                  onClick={() => onProfileVisibilityChange("public")}
                >
                  Public
                </button>
              </div>
            </div>

            <div className="option-setting-card">
              <div>
                <strong>Sections visibles</strong>
                <span>Active uniquement les blocs que tu veux montrer dans l'aperçu public.</span>
              </div>
              <div className="option-pill-grid compact public-section-grid">
                {[
                  ["photos", "Photos"],
                  ["essential", "Essentiel"],
                  ["identityGames", "Jeux fondateurs"],
                  ["hardware", "Matériel"],
                  ["activity", "Activité"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`option-pill ${publicSections[id] ? "active" : ""}`}
                    onClick={() => updatePublicSection(id, !publicSections[id])}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="option-section option-section-split">
            <div className="option-setting-card">
              <div>
                <SectionTitle title="Notation" help="rating" />
                <span>Définis comment les notes sont affichées dans les cartes et les tops.</span>
              </div>
              <div className="option-pill-grid three compact rating-display-grid">
                <button
                  type="button"
                  className={`option-pill ${appOptions.ratingDisplay === "number" ? "active" : ""}`}
                  onClick={() => onOptionChange("ratingDisplay", "number")}
                >
                  8.5/10
                </button>
                <button
                  type="button"
                  className={`option-pill ${appOptions.ratingDisplay === "stars" ? "active" : ""}`}
                  onClick={() => onOptionChange("ratingDisplay", "stars")}
                >
                  Étoiles
                </button>
                <button
                  type="button"
                  className={`option-pill ${appOptions.ratingDisplay === "compact" ? "active" : ""}`}
                  onClick={() => onOptionChange("ratingDisplay", "compact")}
                >
                  Compact
                </button>
              </div>
            </div>
          </div>

          <div className="option-section option-section-split">
            <div className="option-setting-card">
              <div>
                <SectionTitle title="Promos" help="deals" />
                <span>Choisis la région utilisée pour récupérer les prix et offres affichées.</span>
              </div>
              <div className="option-pill-grid three compact deal-region-grid">
                {["FR", "EU", "US"].map((region) => (
                  <button
                    key={region}
                    type="button"
                    className={`option-pill ${appOptions.dealRegion === region ? "active" : ""}`}
                    onClick={() => onOptionChange("dealRegion", region)}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-setting-card">
              <div>
                <strong>Sources des promos</strong>
                <span>Garde uniquement les boutiques que tu veux voir dans l'onglet Promos.</span>
              </div>
              <div className="option-pill-grid three compact deal-source-grid">
                {[
                  ["steam", "Steam"],
                  ["epic", "Epic"],
                  ["psn", "PSN"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`option-pill ${dealSources[id] ? "active" : ""}`}
                    onClick={() => updateDealSource(id, !dealSources[id])}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="options-group">
          <div className="options-group-head">
            <span>Données</span>
            <p>Sauvegarde, import et contrôle de cohérence de ta bibliothèque.</p>
          </div>

          <div className="option-section">
            <div className="option-setting-card option-setting-card-featured">
              <div>
                <SectionTitle title="Données" help="data" />
                <span>Contrôle la cohérence de la bibliothèque et prépare les sauvegardes.</span>
              </div>

          <div
            className={`data-health-card ${
              gameIntegrityIssues.length ? "needs-action" : "clean"
            }`}
          >
            <div className="data-health-main">
              <div>
                <span className="data-health-kicker">Diagnostic bibliothèque</span>
                <strong>
                  {gameIntegrityIssues.length
                    ? `${gameIntegrityIssues.length} fiche${gameIntegrityIssues.length > 1 ? "s" : ""} à aligner`
                    : "Bibliothèque cohérente"}
                </strong>
                <p>
                  {gameIntegrityIssues.length
                    ? "L'app peut synchroniser statut, progression et compteur terminé."
                    : "Les compteurs utilisent déjà la même logique partout."}
                </p>
              </div>

              <button
                type="button"
                className="option-pill data-health-action"
                onClick={handleRepairGameData}
                disabled={!gameIntegrityIssues.length || isRepairingGameData}
              >
                {isRepairingGameData ? "Réparation..." : "Réparer"}
              </button>
            </div>

            {gameIntegrityPreview.length > 0 && (
              <div className="data-health-preview">
                {gameIntegrityPreview.map(({ game, patch, reasons }) => (
                  <div key={game.id || game.name} className="data-health-row">
                    <div className="data-health-game">
                      <span>{game.name}</span>
                      <em>{reasons[0]}</em>
                    </div>
                    <div className="data-health-flow">
                      <b>{getGameProgressStateLabel(getGameProgressState(game))}</b>
                      <i>-></i>
                      <b>{getGameIntegrityTargetLabel(game, patch)}</b>
                    </div>
                    {showIntegrityDetails && (
                      <small>{getGameIntegrityChangeSummary(game, patch)}</small>
                    )}
                  </div>
                ))}
                {gameIntegrityIssues.length > gameIntegrityPreview.length && (
                  <div className="data-health-row muted">
                    <div className="data-health-game">
                      <span>
                        +{gameIntegrityIssues.length - gameIntegrityPreview.length} autre
                      {gameIntegrityIssues.length - gameIntegrityPreview.length > 1 ? "s" : ""}
                      </span>
                      <em>corrigé avec le même bouton</em>
                    </div>
                  </div>
                )}
                {gameIntegrityIssues.length > 3 && (
                  <button
                    type="button"
                    className="data-health-toggle"
                    onClick={() => setShowIntegrityDetails((value) => !value)}
                  >
                    {showIntegrityDetails ? "Masquer le détail" : "Voir le détail"}
                  </button>
                )}
              </div>
            )}
          </div>
            </div>

            <div className="option-section-split">
              <div className="option-setting-card">
                <div>
                  <strong>Sauvegarde locale</strong>
                  <span>Exporte un fichier JSON avec tes données pour le garder de côté.</span>
                </div>
                <button type="button" className="option-pill option-wide-action" onClick={onExportBackup}>
                  Exporter
                </button>
              </div>

              <div className="option-setting-card">
                <div>
                  <strong>Restaurer</strong>
                  <span>Importe une sauvegarde JSON existante dans l'application.</span>
                </div>
                <label className="option-pill option-file-pill option-wide-action">
                  Importer
                  <input
                    type="file"
                    accept="application/json"
                    onChange={onImportBackup}
                  />
                </label>
              </div>

              <div className="option-setting-card option-setting-card-danger">
                <div>
                  <strong>Réinitialiser les options</strong>
                  <span>Remet uniquement les préférences de l'app à leur état par défaut.</span>
                </div>
                <button type="button" className="option-pill option-wide-action" onClick={onResetOptions}>
                  Reset options
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {helpTopic && (
        <div className="option-help-backdrop" onClick={() => setHelpTopic(null)}>
          <div className="option-help-modal" onClick={(event) => event.stopPropagation()}>
            <div className="option-help-modal-head">
              <h3>{helpTopic.title}</h3>
              <button type="button" onClick={() => setHelpTopic(null)}>
                Fermer
              </button>
            </div>
            <p className="option-help-lead">{helpTopic.lead}</p>
            {helpTopic.bullets?.length > 0 && (
              <div className="option-help-points">
                {helpTopic.bullets.map((item) => (
                  <div key={item} className="option-help-point">
                    <span />
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LiveMiniPlayer({ live, collapsed, setCollapsed, onClose }) {
  if (!live || !live.youtubeId || live.youtubeId === "VIDEO_ID_ICI") return null;

  return (
    <div className={`live-mini-player ${collapsed ? "collapsed" : ""}`}>
      <div className="live-mini-header">
        <div>
          <div className="live-mini-kicker">🔴 Live en cours</div>
          <div className="live-mini-title">{live.name}</div>
        </div>

        <div className="live-mini-actions">
          <button type="button" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "▴" : "▾"}
          </button>

          <button type="button" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="live-mini-video">
          <iframe
            src={`https://www.youtube.com/embed/${live.youtubeId}`}
            title={live.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}

function EventsAdminList({ events, onEdit }) {
  const handleDelete = async (event) => {
    if (!event.isFirebaseEvent || !event.firebaseId) {
      alert("Impossible de supprimer un événement de secours.");
      return;
    }

    const confirmDelete = window.confirm(
      `Supprimer l’événement "${event.name}" ?`
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "events", event.firebaseId));
      alert("Événement supprimé ✅");
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la suppression");
    }
  };

  if (!events.length) {
    return (
      <EmptyState
        title="Aucun événement"
        subtitle="Ajoute un premier événement depuis le formulaire."
      />
    );
  }

  return (
    <div className="admin-events-list">
      <h3 className="admin-section-title">Événements enregistrés</h3>

      {events.map((event) => (
        <div key={event.id} className="admin-event-item">
          <div>
            <div className="admin-event-name">{event.name}</div>
            <div className="admin-event-date">
              {formatEventDate(event.date)}
            </div>
          </div>

          <div className="admin-event-actions">
            <button
              type="button"
              className="filter-toggle-btn"
              onClick={() => onEdit(event)}
            >
              Modifier
            </button>

            <button
              type="button"
              className="delete-btn"
              onClick={() => handleDelete(event)}
            >
              Supprimer
            </button>
          </div>

        <button onClick={importNewsFromRSS}>
          📰 Importer les actus
        </button>
        </div>
      ))}
    </div>
  );
}

function AdminPanel({ events, onImportNews }) {
  const [editingEvent, setEditingEvent] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);

  const SECRET = "1102"; // 🔑 change ça

  const handleLogin = () => {
    if (password === SECRET) {
      setIsAdmin(true);
      setPassword("");
    } else {
      alert("Code incorrect");
    }
  };

  return (
    <div className="search-panel">
      {!isAdmin ? (
        <>
          <h2 className="panel-title">🔒 Accès administrateur</h2>

          <div className="input-container">
            <input
              type="password"
              placeholder="Entrer le code"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button onClick={handleLogin}>
            Se connecter
          </button>
        </>
      ) : (
        <>
          <div className="home-section-head">
            <h2 className="panel-title">⚙️ Gestion des événements</h2>

            <button
              type="button"
              onClick={() => setOpen(!open)}
            >
              {open ? "Fermer" : "Ouvrir"}
            </button>
          </div>

          <button
            type="button"
            className="filter-toggle-btn"
            onClick={() => onImportNews({ force: true })}
          >
            📰 Importer les actus RSS
          </button>

          {open && (
            <div style={{ marginTop: "14px" }}>
              <AddEventForm
                editingEvent={editingEvent}
                onCancelEdit={() => setEditingEvent(null)}
              />

              <EventsAdminList
                events={events}
                onEdit={(event) => setEditingEvent(event)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NewsTab({ newsItems }) {
  const sortedNews = [...newsItems].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="news-page">
      <div className="section-header">
        <h2>Actualités gaming</h2>
        <span className="section-count">{sortedNews.length}</span>
      </div>

      {sortedNews.length === 0 ? (
        <EmptyState
          title="Aucune actu pour le moment"
          subtitle="Importe les actus depuis le panneau administrateur."
        />
      ) : (
        <div className="news-list">
          {sortedNews.map((news) => (
            <article key={news.id} className="news-card">
              {news.image && (
                <img src={news.image} alt={news.title} className="news-image" />
              )}

              <div className="news-content">
                <div className="news-meta">
                  {news.category || "Gaming"} • {news.source || "Source inconnue"}
                </div>

                <h3>{news.title}</h3>

                <div className="news-date">{formatFullDate(news.date)}</div>

                <p>{news.summary}</p>

                {news.url && (
                  <a href={news.url} target="_blank" rel="noreferrer">
                    Lire l’article
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

const DEAL_SOURCES = [
  { id: "all", label: "Tout" },
  { id: "steam", label: "Steam" },
  { id: "epic", label: "Epic" },
  { id: "psn", label: "PSN" },
];

const PSN_DEALS_URL = "https://store.playstation.com/fr-fr/pages/deals";
const DEAL_REGION_CONFIG = {
  FR: { country: "FR", locale: "fr-FR", steamLang: "french", currency: "EUR", psn: "fr-fr" },
  EU: { country: "DE", locale: "fr-FR", steamLang: "french", currency: "EUR", psn: "fr-fr" },
  US: { country: "US", locale: "en-US", steamLang: "english", currency: "USD", psn: "en-us" },
};

function formatSteamPrice(value, currency = "EUR") {
  if (typeof value !== "number") return "";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(value / 100);
}

function getEpicImage(images = []) {
  const preferred =
    images.find((image) => image.type === "OfferImageWide") ||
    images.find((image) => image.type === "featuredMedia") ||
    images.find((image) => image.type === "Thumbnail") ||
    images[0];

  return preferred?.url || "";
}

function getEpicDealUrl(item) {
  const mappingSlug = item.offerMappings?.[0]?.pageSlug;
  const productSlug = item.productSlug?.split("/")[0];
  const slug = productSlug || mappingSlug || item.urlSlug;

  return slug ? `https://store.epicgames.com/fr/p/${slug}` : "https://store.epicgames.com/fr/free-games";
}

function normalizeSteamDeals(data) {
  return (data?.specials?.items || [])
    .filter((item) => item.discounted && item.discount_percent > 0)
    .slice(0, 24)
    .map((item) => ({
      id: `steam-${item.id}`,
      store: "steam",
      storeLabel: "Steam",
      title: item.name,
      image: item.large_capsule_image || item.header_image || item.small_capsule_image,
      discount: item.discount_percent,
      normalPrice: formatSteamPrice(item.original_price, item.currency),
      salePrice: formatSteamPrice(item.final_price, item.currency),
      url: `https://store.steampowered.com/app/${item.id}`,
      endsAt: item.discount_expiration ? new Date(item.discount_expiration * 1000).toISOString() : "",
    }));
}

function normalizeEpicDeals(data) {
  return (data?.data?.Catalog?.searchStore?.elements || [])
    .filter((item) => {
      const currentPromos = item.promotions?.promotionalOffers || [];
      const hasFreePromo = currentPromos.some((promoGroup) =>
        (promoGroup.promotionalOffers || []).some(
          (promo) => promo.discountSetting?.discountPercentage === 0
        )
      );
      const price = item.price?.totalPrice;
      return hasFreePromo || (price && price.discount > 0);
    })
    .slice(0, 24)
    .map((item) => {
      const price = item.price?.totalPrice;
      const promo = item.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0];
      const isFree = promo?.discountSetting?.discountPercentage === 0;

      return {
        id: `epic-${item.id}`,
        store: "epic",
        storeLabel: "Epic",
        title: item.title,
        image: getEpicImage(item.keyImages),
        discount: isFree ? 100 : Math.round(((price?.discount || 0) / Math.max(price?.originalPrice || 1, 1)) * 100),
        normalPrice: price?.fmtPrice?.originalPrice || "",
        salePrice: isFree ? "Gratuit" : price?.fmtPrice?.discountPrice || "",
        url: getEpicDealUrl(item),
        endsAt: promo?.endDate || "",
      };
    });
}

function DealsTab({ dealPreferences = DEFAULT_APP_OPTIONS }) {
  const sourcePreferences = {
    ...DEFAULT_APP_OPTIONS.dealSources,
    ...(dealPreferences.dealSources || {}),
  };
  const region = DEAL_REGION_CONFIG[dealPreferences.dealRegion] || DEAL_REGION_CONFIG.FR;
  const enabledSources = DEAL_SOURCES.filter(
    (source) => source.id === "all" || sourcePreferences[source.id]
  );
  const [activeSource, setActiveSource] = useState("all");
  const [deals, setDeals] = useState([]);
  const [sourceStatus, setSourceStatus] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const loadDeals = async () => {
    setIsLoading(true);
    setSourceStatus({});

    const fetchWithTimeout = async (url, timeout = 9000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        return await fetch(url, { signal: controller.signal });
      } finally {
        clearTimeout(timeoutId);
      }
    };

    try {
      const apiResponse = await fetchWithTimeout("/api/deals");
      const contentType = apiResponse.headers.get("content-type") || "";

      if (apiResponse.ok && contentType.includes("application/json")) {
        const payload = await apiResponse.json();
        setDeals(payload.deals || []);
        setSourceStatus(
          payload.status || {
            steam: "Source indisponible pour le moment.",
            epic: "Source indisponible pour le moment.",
            psn: "PSN demande une source serveur fiable avant affichage automatique.",
          }
        );
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.warn("Proxy promos indisponible, tentative directe :", error);
    }

    const requests = [
      {
        id: "steam",
        label: "Steam",
        url: `https://store.steampowered.com/api/featuredcategories?cc=${region.country}&l=${region.steamLang}`,
        normalize: normalizeSteamDeals,
      },
      {
        id: "epic",
        label: "Epic",
        url: `https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=${region.locale}&country=${region.country}&allowCountries=${region.country}`,
        normalize: normalizeEpicDeals,
      },
    ].filter((source) => sourcePreferences[source.id]);

    const results = await Promise.allSettled(
      requests.map(async (source) => {
        const response = await fetchWithTimeout(source.url);
        if (!response.ok) throw new Error(`${source.label}: ${response.status}`);
        const data = await response.json();
        return { source, items: source.normalize(data) };
      })
    );

    const nextDeals = [];
    const nextStatus = {};

    if (sourcePreferences.psn) {
      nextStatus.psn = "PSN demande une source serveur fiable avant affichage automatique.";
    }

    results.forEach((result, index) => {
      const source = requests[index];
      if (result.status === "fulfilled") {
        nextDeals.push(...result.value.items);
        nextStatus[source.id] =
          result.value.items.length > 0 ? "OK" : "Aucune promo trouvee.";
      } else {
        nextStatus[source.id] = "Source indisponible pour le moment.";
      }
    });

    setDeals(nextDeals);
    setSourceStatus(nextStatus);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!enabledSources.some((source) => source.id === activeSource)) {
      setActiveSource("all");
    }
  }, [dealPreferences.dealSources, activeSource]);

  useEffect(() => {
    loadDeals();
  }, [dealPreferences.dealRegion, dealPreferences.dealSources]);

  const visibleDeals =
    activeSource === "all"
      ? deals
      : deals.filter((deal) => deal.store === activeSource);

  return (
    <div className="deals-page">
      <div className="section-header deals-header">
        <div>
          <h2>Promos du moment</h2>
          <p>Les offres PC sont chargees en direct, en euros quand la boutique le permet.</p>
        </div>
        <button type="button" className="deals-refresh-btn" onClick={loadDeals} disabled={isLoading}>
          {isLoading ? "Actualisation..." : "Actualiser"}
        </button>
      </div>

      <div className="deals-source-tabs">
        {enabledSources.map((source) => (
          <button
            key={source.id}
            type="button"
            className={activeSource === source.id ? "active" : ""}
            onClick={() => setActiveSource(source.id)}
          >
            {source.label}
          </button>
        ))}
      </div>

      {activeSource === "psn" && (
        <div className="deals-source-note">
          <strong>PSN</strong>
          <span>
            Sony n'expose pas un flux public stable comme Steam. Pour une vraie synchro propre, on passera
            par une petite fonction serveur qui cache les offres.
          </span>
          <a href={`https://store.playstation.com/${region.psn}/pages/deals`} target="_blank" rel="noreferrer">
            Voir les promos PlayStation
          </a>
        </div>
      )}

      <div className="deals-status-row">
        {["steam", "epic", "psn"].filter((source) => sourcePreferences[source]).map((source) => (
          <span key={source} className={`deals-status-pill ${sourceStatus[source] === "OK" ? "ok" : ""}`}>
            {source.toUpperCase()} - {sourceStatus[source] || "Chargement"}
          </span>
        ))}
      </div>

      {isLoading && visibleDeals.length === 0 ? (
        <EmptyState title="Chargement des promos" subtitle="Je contacte les boutiques disponibles." />
      ) : visibleDeals.length === 0 ? (
        <EmptyState
          title="Aucune promo a afficher"
          subtitle="Essaie une autre boutique ou relance l'actualisation."
        />
      ) : (
        <div className="deals-grid">
          {visibleDeals.map((deal) => (
            <a key={deal.id} className="deal-card" href={deal.url} target="_blank" rel="noreferrer">
              <div className="deal-image-wrap">
                {deal.image ? (
                  <img src={deal.image} alt={deal.title} />
                ) : (
                  <div className="deal-image-placeholder">{deal.storeLabel}</div>
                )}
                {deal.discount > 0 && <span className="deal-discount">-{deal.discount}%</span>}
              </div>

              <div className="deal-content">
                <span className={`deal-store deal-store-${deal.store}`}>{deal.storeLabel}</span>
                <h3>{deal.title}</h3>
                <div className="deal-prices">
                  {deal.normalPrice && <span className="deal-normal-price">{deal.normalPrice}</span>}
                  <strong>{deal.salePrice}</strong>
                </div>
                {deal.endsAt && (
                  <span className="deal-end-date">Jusqu'au {formatFullDate(deal.endsAt)}</span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------- MAIN APP -------------------- */

/* ==================== APP PRINCIPALE ==================== */

export default function App() {
  const [selectedSearchGame, setSelectedSearchGame] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [results, setResults] = useState([]);
  const [games, setGames] = useState([]);
  const [weeklyQuizProgress, setWeeklyQuizProgress] = useState(() =>
    getStoredWeeklyQuizProgress()
  );
  const [checkpointGoalProgress, setCheckpointGoalProgress] = useState(() =>
    getStoredCheckpointGoalProgress()
  );
  const [appOptions, setAppOptions] = useState(() => getStoredAppOptions());
  const [activeTab, setActiveTab] = useState(() => {
    const savedOptions = getStoredAppOptions();
    const savedTab = localStorage.getItem("checkpoint-last-tab");
    if (savedOptions.rememberLastTab && APP_TAB_IDS.includes(savedTab)) {
      return savedTab;
    }
    return APP_TAB_IDS.includes(savedOptions.startTab)
      ? savedOptions.startTab
      : "home";
  })
  
  const [theme, setTheme] = useState(
    localStorage.getItem("checkpoint-theme") || "theme-indigo"
  );
  const [uiMode, setUiMode] = useState(
    localStorage.getItem("checkpoint-ui-mode") === "pixel"
      ? "reduced"
      : localStorage.getItem("checkpoint-ui-mode") || "modern"
  );
  const [showSplash, setShowSplash] = useState(() => {
    return sessionStorage.getItem("checkpoint-splash-seen") !== "true";
  });
  const [splashProgress, setSplashProgress] = useState(() =>
    sessionStorage.getItem("checkpoint-splash-seen") === "true" ? 100 : 4
  );
  const [bootReady, setBootReady] = useState({
    events: false,
    news: false,
    hardware: false,
    games: false,
  });
  const [splashTargetProgress, setSplashTargetProgress] = useState(() =>
    sessionStorage.getItem("checkpoint-splash-seen") === "true" ? 100 : 18
  );
  const splashStartedAtRef = useRef(Date.now());

  const [yearFilter, setYearFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [sortBy, setSortBy] = useState("-rating");
  const [newsItems, setNewsItems] = useState([]);
  const [bootWave, setBootWave] = useState(true);

  const [showFilters, setShowFilters] = useState(false);
  const [platforms, setPlatforms] = useState([]);
  const [genres, setGenres] = useState([]);
  const [toast, setToast] = useState("");
  const [seenBadgeIds, setSeenBadgeIds] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);
  const [detailGameList, setDetailGameList] = useState([]);
  const [hardware, setHardware] = useState([]);
  const [socialProfile, setSocialProfile] = useState(() => {
    try {
      return {
        ...DEFAULT_SOCIAL_PROFILE,
        ...JSON.parse(localStorage.getItem("checkpoint-social-profile") || "{}"),
        publicSections: {
          ...DEFAULT_PUBLIC_SECTIONS,
          ...(JSON.parse(localStorage.getItem("checkpoint-social-profile") || "{}").publicSections || {}),
        },
      };
    } catch (error) {
      return DEFAULT_SOCIAL_PROFILE;
    }
  });
  const [socialFriends, setSocialFriends] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("checkpoint-social-friends") || "[]");
    } catch (error) {
      return [];
    }
  });
  const [sharedProfile, setSharedProfile] = useState(null);
  const [miniPlayerLive, setMiniPlayerLive] = useState(null);
  const [miniPlayerCollapsed, setMiniPlayerCollapsed] = useState(false);
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [isUpcomingLoading, setIsUpcomingLoading] = useState(false);
  const [upcomingMonthFilter, setUpcomingMonthFilter] = useState("");
  const [libraryView, setLibraryView] = useState("collection");
  const [nextPage, setNextPage] = useState(null);
  const [gamingEvents, setGamingEvents] = useState(FALLBACK_GAMING_EVENTS);
  const [pixelTransition, setPixelTransition] = useState(null);
  const [soundStyle, setSoundStyle] = useState("balanced");
  const tabSwitchTimerRef = useRef(null);
  const tabTransitionTimerRef = useRef(null);
  const pixelTransitionParticles = useMemo(
    () => {
      const particleCount =
        appOptions.visualEffects === "boost"
          ? 128
          : appOptions.visualEffects === "calm"
            ? 64
            : 96;

      return Array.from({ length: particleCount }).map((_, i) => {
        const x = (i * 37) % 100;
        const wave = Math.sin(i * 0.24) * 24;
        const y = (i / (particleCount + 28)) * 100 + wave;

        return {
          id: i,
          x: `${x}vw`,
          y: `${y}vh`,
          delay: `${(i % 18) * 0.01}s`,
          size: `${4 + (i % 6)}px`,
        };
      });
    },
    [appOptions.visualEffects]
  );

const tabOrder = [
  "home",
  "news",
  "search",
  "upcoming",
  "deals",
  "live",
  "social",
  "library",
  "series",
  "hardware",
  "favorites",
  "top5",
  "profile",
  "options",
];

const [soundEnabled, setSoundEnabled] = useState(
  localStorage.getItem("checkpoint-sound-enabled") !== "false"
);

const updateAppOption = (key, value) => {
  setAppOptions((prev) => {
    const nextOptions = {
      ...prev,
      [key]: value,
    };

    localStorage.setItem("checkpoint-app-options", JSON.stringify(nextOptions));
    return nextOptions;
  });
};

const resetAppOptions = () => {
  setAppOptions(DEFAULT_APP_OPTIONS);
  localStorage.setItem("checkpoint-app-options", JSON.stringify(DEFAULT_APP_OPTIONS));
  showToast("Options remises par defaut.");
};

const exportCheckpointBackup = () => {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    options: appOptions,
    socialProfile,
    socialFriends,
    games,
    hardware,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `checkpoint-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Sauvegarde exportee.");
};

const importCheckpointBackup = async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";

  if (!file) return;

  try {
    const text = await file.text();
    const payload = JSON.parse(text);

    if (payload.options) {
      const nextOptions = {
        ...DEFAULT_APP_OPTIONS,
        ...payload.options,
        dealSources: {
          ...DEFAULT_APP_OPTIONS.dealSources,
          ...(payload.options.dealSources || {}),
        },
      };
      setAppOptions(nextOptions);
      localStorage.setItem("checkpoint-app-options", JSON.stringify(nextOptions));
    }

    if (payload.socialProfile) {
      const nextProfile = {
        ...DEFAULT_SOCIAL_PROFILE,
        ...payload.socialProfile,
        publicSections: {
          ...DEFAULT_PUBLIC_SECTIONS,
          ...(payload.socialProfile.publicSections || {}),
        },
      };
      setSocialProfile(nextProfile);
      localStorage.setItem("checkpoint-social-profile", JSON.stringify(nextProfile));
      await syncPublicProfileIfNeeded(nextProfile);
    }

    if (Array.isArray(payload.socialFriends)) {
      setSocialFriends(payload.socialFriends);
      localStorage.setItem("checkpoint-social-friends", JSON.stringify(payload.socialFriends));
    }

    showToast("Sauvegarde importee.");
  } catch (error) {
    console.error("Erreur import sauvegarde :", error);
    showToast("Sauvegarde illisible.");
  }
};

const updateHardwareRank = async (id, rank) => {
  setHardware((prev) =>
    prev.map((item) =>
      item.id === id
        ? { ...item, controllerRank: rank }
        : item
    )
  );

  try {
    await updateDoc(doc(db, "hardware", id), {
      controllerRank: rank,
    });
  } catch (error) {
    if (isAbortError(error)) return;
    console.error(error);
  }
};

const importNewsFromRSS = async ({ silent = false, force = false } = {}) => {
  try {
    const lastImport = localStorage.getItem("checkpoint-last-news-import");
    const extractImage = (item) => {
      if (item.thumbnail) return item.thumbnail;
      if (item.enclosure?.link) return item.enclosure.link;

      const match = item.description?.match(/<img[^>]+src="([^">]+)"/);
      if (match?.[1]) return match[1];

      return "";
    };
    const now = Date.now();
    const sixHours = 6 * 60 * 60 * 1000;

    if (!force && lastImport && now - Number(lastImport) < sixHours) {
      if (!silent) alert("Actus déjà importées aujourd’hui");
      return;
    }

    const res = await fetch(
      "https://api.rss2json.com/v1/api.json?rss_url=https://www.jeuxvideo.com/rss/rss.xml"
    );

    const data = await res.json();
    const news = (data.items || []).slice(0, 10);

    for (const item of news) {
      const safeId = encodeURIComponent(item.link || item.guid || item.title);

      await setDoc(doc(db, "news", safeId), {
        title: item.title || "Sans titre",
        summary: item.description || "",
        url: item.link || "",
        date: item.pubDate || new Date().toISOString(),
        source: "JeuxVideo.com",
        category: "Gaming",
        image: extractImage(item),
        importedAt: new Date(),
      });
    }

    localStorage.setItem("checkpoint-last-news-import", String(now));

    if (!silent) alert("Actus importées ✅");
  } catch (error) {
    const message = String(error?.message || error).toLowerCase();

    if (
      error?.name === "AbortError" ||
      message.includes("aborted") ||
      message.includes("user aborted")
    ) {
      return;
    }

    console.error("Erreur import RSS :", error);
    if (!silent) alert("Erreur import RSS");
  }
};

const [newUnlockedBadge, setNewUnlockedBadge] = useState(null);
const badgeToastInitializedRef = useRef(false);

const addHardware = async (item) => {
  try {
    await addDoc(collection(db, "hardware"), item);
    showToast("Matériel ajouté !");
    playSound("success", soundStyle);
  } catch (error) {
    if (isAbortError(error)) return;
    console.error("Erreur ajout matériel :", error);
    showToast("Erreur lors de l’ajout du matériel.");
  }
};

const deleteHardware = async (id) => {
  const item = hardware.find((hardwareItem) => hardwareItem.id === id);
  if (
    appOptions.confirmDangerActions &&
    !window.confirm(`Supprimer "${item?.name || "ce matériel"}" ?`)
  ) {
    return;
  }

  try {
    await deleteDoc(doc(db, "hardware", id));
    showToast("Matériel supprimé.");
    playSound("delete", soundStyle);
  } catch (error) {
    if (isAbortError(error)) return;
    console.error("Erreur suppression matériel :", error);
    showToast("Erreur lors de la suppression.");
  }
};

const toggleHardwareFavorite = async (id, currentFavorite) => {
  try {
    await updateDoc(doc(db, "hardware", id), {
      favorite: !currentFavorite,
    });
  } catch (error) {
    if (isAbortError(error)) return;
    console.error("Erreur favori matériel :", error);
  }
};

const showToast = (message, duration = 2000) => {
  setToast(message);
  setTimeout(() => setToast(""), duration);
};

const weeklyQuiz = useMemo(() => {
  const weekKey = getWeeklyQuizKey();
  return {
    weekKey,
    question: getWeeklyQuizQuestion(weekKey),
  };
}, []);

const handleWeeklyQuizAnswer = (answerIndex, options = {}) => {
  const question = options.question || weeklyQuiz.question;
  if (!question) return;

  const answerKey = options.answerKey || weeklyQuiz.weekKey;
  if (weeklyQuizProgress.answers?.[answerKey]) return;

  const correct = answerIndex === question.correctIndex;
  const previousWeekKey = getPreviousWeeklyQuizKey(weeklyQuiz.weekKey);
  const nextStreak =
    options.mode === "free"
      ? correct
        ? (weeklyQuizProgress.streak || 0) + 1
        : 0
      : correct
        ? weeklyQuizProgress.lastCorrectWeek === previousWeekKey
          ? (weeklyQuizProgress.streak || 0) + 1
          : 1
        : 0;

  const earnedXP = correct
    ? WEEKLY_QUIZ_XP.correct +
      Math.min(Math.max(nextStreak - 1, 0), 4) * WEEKLY_QUIZ_XP.streakBonus
    : WEEKLY_QUIZ_XP.participation;

  const nextProgress = {
    ...weeklyQuizProgress,
    totalXP: (weeklyQuizProgress.totalXP || 0) + earnedXP,
    streak: nextStreak,
    bestStreak: Math.max(weeklyQuizProgress.bestStreak || 0, nextStreak),
    lastCorrectWeek: correct ? weeklyQuiz.weekKey : weeklyQuizProgress.lastCorrectWeek,
    answers: {
      ...(weeklyQuizProgress.answers || {}),
      [answerKey]: {
        questionId: question.id,
        answerIndex,
        correct,
        earnedXP,
        mode: options.mode || "weekly",
        answeredAt: new Date().toISOString(),
      },
    },
  };

  setWeeklyQuizProgress(nextProgress);
  storeWeeklyQuizProgress(nextProgress);
  playSound(correct ? "success" : "click", soundStyle);
  showToast(correct ? `Bonne réponse ! +${earnedXP} XP` : `Participation validée. +${earnedXP} XP`);
};

const handleClaimCheckpointGoal = (goal) => {
  if (!goal?.id || !goal.claimable || checkpointGoalProgress.claimed?.[goal.id]) return;

  const earnedXP = Number(goal.xp || 0);
  const nextProgress = {
    ...checkpointGoalProgress,
    totalXP: (checkpointGoalProgress.totalXP || 0) + earnedXP,
    claimed: {
      ...(checkpointGoalProgress.claimed || {}),
      [goal.id]: {
        title: goal.title,
        earnedXP,
        claimedAt: new Date().toISOString(),
      },
    },
  };

  setCheckpointGoalProgress(nextProgress);
  storeCheckpointGoalProgress(nextProgress);
  playSound("success", soundStyle);
  showToast(`${goal.title} valide. +${earnedXP} XP`);
};
const updateSocialProfile = (field, value) => {
  const nextProfile = {
    ...socialProfile,
    [field]: field === "handle" ? normalizeHandle(value) : value,
  };

  setSocialProfile(nextProfile);
  localStorage.setItem(
    "checkpoint-social-profile",
    JSON.stringify(nextProfile)
  );

  syncPublicProfileIfNeeded(nextProfile).catch((error) => {
    console.error("Erreur synchronisation profil public :", error);
  });
};

const syncPublicProfileIfNeeded = async (profile) => {
  const handle = normalizeHandle(profile.handle);

  if (profile.visibility !== "public" || !handle) return;

  await setDoc(
    doc(db, "publicProfiles", handle),
    { ...buildPublicSocialProfile(profile), visibility: "public" },
    { merge: true }
  );
};

const addSocialProfilePhotos = async (field, fileList) => {
  const files = Array.from(fileList || []).slice(0, 6);

  if (!files.length) {
    return { ok: false, message: "Aucune photo sélectionnée." };
  }

  try {
    const photos = await Promise.all(files.map((file) => resizeSocialPhoto(file)));
    const nextProfile = {
      ...socialProfile,
      [field]: [...(socialProfile[field] || []), ...photos].slice(0, 9),
    };

    setSocialProfile(nextProfile);
    localStorage.setItem(
      "checkpoint-social-profile",
      JSON.stringify(nextProfile)
    );
    await syncPublicProfileIfNeeded(nextProfile);

    return { ok: true, message: "Photos ajoutées au profil." };
  } catch (error) {
    console.error("Erreur ajout photos :", error);
    return { ok: false, message: "Impossible d'ajouter ces photos." };
  }
};

const removeSocialProfilePhoto = async (field, index) => {
  const nextProfile = {
    ...socialProfile,
    [field]: (socialProfile[field] || []).filter(
      (_, itemIndex) => itemIndex !== index
    ),
  };

  setSocialProfile(nextProfile);
  localStorage.setItem(
    "checkpoint-social-profile",
    JSON.stringify(nextProfile)
  );

  try {
    await syncPublicProfileIfNeeded(nextProfile);
  } catch (error) {
    console.error("Erreur suppression photo publique :", error);
  }
};

const buildPublicSocialProfile = (profileOverride = socialProfile) => {
  const handle = normalizeHandle(profileOverride.handle);
  const activities = getSocialActivityFeed(games, hardware, badges).slice(0, 8);
  const stats = getAdvancedStats(games);
  const currentHardware = getCurrentOwnedHardware(hardware);
  const identityGameIds = Array.isArray(profileOverride.identityGameIds)
    ? profileOverride.identityGameIds.slice(0, 3).map(String)
    : [];
  const identityGames = identityGameIds
    .map((id) => games.find((game) => String(game.id) === id))
    .filter(Boolean);
  const identityTitle = getIdentityPlayerTitle(identityGames);
  const essentialTopSections = [
    { key: "rating", label: "Global", games: getTopGamesForScore(games, "rating", 1) },
    { key: "ratingGameplay", label: "Gameplay", games: getTopGamesForScore(games, "ratingGameplay", 1) },
    { key: "ratingGraphics", label: "Graphismes", games: getTopGamesForScore(games, "ratingGraphics", 1) },
  ].filter((section) => section.games.length > 0);
  const profileShowcase = getProfileShowcase(games, hardware);
  const featuredBadge = getFeaturedBadgeFromSelection(
    badges,
    profileOverride.featuredBadgeId
  );

  return {
    displayName: profileOverride.displayName || DEFAULT_SOCIAL_PROFILE.displayName,
    handle,
    bio: profileOverride.bio || "",
    platform: profileOverride.platform || "",
    visibility: profileOverride.visibility || "prive",
    publicSections: {
      ...DEFAULT_PUBLIC_SECTIONS,
      ...(profileOverride.publicSections || {}),
    },
    featuredBadge: featuredBadge
      ? {
          id: featuredBadge.id,
          icon: featuredBadge.icon,
          name: featuredBadge.name,
          rarity: featuredBadge.rarity,
          platformFamily: featuredBadge.platformFamily || "",
          platformKey: featuredBadge.platformKey || "",
          special: featuredBadge.special || "",
        }
      : null,
    level,
    totalGames: games.length,
    finishedGames: games.filter(isGameFinishedStatus).length,
    hardwareCount: currentHardware.length,
    averageRating: stats.avgRating ? Math.round(stats.avgRating * 10) / 10 : 0,
    setupPhotos: profileOverride.setupPhotos || [],
    collectionPhotos: profileOverride.collectionPhotos || [],
    identityTitle,
    showcase: profileShowcase,
    identityGames: identityGames.map((game) => ({
      id: game.id,
      name: game.name,
      image: game.image || "",
      rating: getGameRating(game),
      platforms: game.platforms || [],
    })),
    essentialTops: essentialTopSections.map((section) => {
      const game = section.games[0];

      return {
        key: section.key,
        label: section.label,
        game: {
          id: game.id,
          name: game.name,
          image: game.image || "",
          score: getGameScore(game, section.key),
        },
      };
    }),
    favoriteGames: games
      .filter((game) => game.favorite)
      .slice(0, 3)
      .map((game) => ({
        id: game.id,
        name: game.name,
        image: game.image || "",
        rating: getGameRating(game),
      })),
    currentHardware: currentHardware.slice(0, 6).map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image || "",
      type: item.type || "",
      status: item.status || "",
      rating: clampRating(item.rating),
      ratings: item.ratings || {},
      gameCount: getHardwareConsoleGameStats(item, games).games,
    })),
    recentActivity: activities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      text: activity.text,
      detail: activity.detail || "",
      image: activity.image || "",
      date: activity.date || null,
    })),
    updatedAt: serverTimestamp(),
  };
};

const setSocialProfileVisibility = async (visibility) => {
  const handle = normalizeHandle(socialProfile.handle);

  if (!handle) {
    return { ok: false, message: "Choisis d'abord un identifiant public." };
  }

  try {
    const nextProfile = {
      ...socialProfile,
      handle,
      visibility,
    };

    setSocialProfile(nextProfile);
    localStorage.setItem(
      "checkpoint-social-profile",
      JSON.stringify(nextProfile)
    );

    if (visibility === "public") {
      await setDoc(
        doc(db, "publicProfiles", handle),
        { ...buildPublicSocialProfile(), visibility: "public" },
        { merge: true }
      );

      showToast("Profil passé en public.");
      return { ok: true, message: "Profil public. Tes amis peuvent te trouver." };
    }

    await deleteDoc(doc(db, "publicProfiles", handle));
    showToast("Profil passé en privé.");
    return { ok: true, message: "Profil privé. Il n'est plus trouvable." };
  } catch (error) {
    console.error("Erreur visibilité profil :", error);
    return {
      ok: false,
      message: "Impossible de changer la visibilité pour le moment.",
    };
  }
};

const copySocialProfileLink = async () => {
  const handle = normalizeHandle(socialProfile.handle);

  if (!handle) {
    return { ok: false, message: "Choisis d'abord un identifiant public." };
  }

  if (socialProfile.visibility !== "public") {
    return {
      ok: false,
      message: "Passe le profil en public avant de partager le lien.",
    };
  }

  try {
    await setDoc(
      doc(db, "publicProfiles", handle),
      { ...buildPublicSocialProfile(), visibility: "public" },
      { merge: true }
    );

    const shareUrl = getProfileShareUrl(handle);
    await navigator.clipboard.writeText(shareUrl);
    showToast("Lien du profil copié.");
    return { ok: true, message: "Lien copié dans le presse-papiers." };
  } catch (error) {
    console.error("Erreur copie profil :", error);
    return { ok: false, message: "Impossible de copier le lien pour le moment." };
  }
};

const addSocialFriend = async (handleValue) => {
  const handle = normalizeHandle(handleValue);
  const ownHandle = normalizeHandle(socialProfile.handle);

  if (!handle) {
    return { ok: false, message: "Entre l'identifiant d'un ami." };
  }

  if (handle === ownHandle) {
    return { ok: false, message: "Tu ne peux pas t'ajouter toi-même." };
  }

  if (socialFriends.some((friend) => friend.handle === handle)) {
    return { ok: false, message: "Cet ami est déjà dans ta liste." };
  }

  try {
    const profileSnap = await getDoc(doc(db, "publicProfiles", handle));

    if (!profileSnap.exists()) {
      return { ok: false, message: "Aucun profil public trouvé avec cet identifiant." };
    }

    const profile = profileSnap.data();
    const friend = {
      displayName: profile.displayName || handle,
      handle,
      bio: profile.bio || "",
      platform: profile.platform || "",
      level: profile.level || 1,
      addedAt: new Date().toISOString(),
    };

    setSocialFriends((prev) => {
      const nextFriends = [...prev, friend];
      localStorage.setItem("checkpoint-social-friends", JSON.stringify(nextFriends));
      return nextFriends;
    });

    showToast("Ami ajouté.");
    return { ok: true, message: `${friend.displayName} a été ajouté.` };
  } catch (error) {
    console.error("Erreur ajout ami :", error);
    return { ok: false, message: "Impossible d'ajouter cet ami pour le moment." };
  }
};

const removeSocialFriend = (handle) => {
  setSocialFriends((prev) => {
    const nextFriends = prev.filter((friend) => friend.handle !== handle);
    localStorage.setItem("checkpoint-social-friends", JSON.stringify(nextFriends));
    return nextFriends;
  });
};

const closeSharedProfile = () => {
  setSharedProfile(null);
  const url = new URL(window.location.href);
  url.searchParams.delete("profile");
  window.history.replaceState({}, "", url.toString());
};

useEffect(() => {
  const handle = normalizeHandle(
    new URLSearchParams(window.location.search).get("profile") || ""
  );

  if (!handle) return;

  const fetchSharedProfile = async () => {
    try {
      const profileSnap = await getDoc(doc(db, "publicProfiles", handle));

      if (profileSnap.exists()) {
        setSharedProfile(profileSnap.data());
        setActiveTab("social");
      } else {
        showToast("Profil partagé introuvable.");
      }
    } catch (error) {
      console.error("Erreur chargement profil partagé :", error);
      showToast("Impossible de charger le profil partagé.");
    }
  };

  fetchSharedProfile();
}, []);

useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
    const eventsData = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

    setGamingEvents(eventsData);
    setBootReady((ready) => ({ ...ready, events: true }));
  });

  return () => unsubscribe();
}, []);

useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "news"), (snapshot) => {
    const newsData = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

    setNewsItems(newsData);
    setBootReady((ready) => ({ ...ready, news: true }));
  });

  return () => unsubscribe();
}, []);

useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "hardware"), (snapshot) => {
    const hardwareData = snapshot.docs.map((docItem) =>
      normalizeHardwareRatings({
        id: docItem.id,
        ...docItem.data(),
      })
    );

    setHardware(hardwareData);
    setBootReady((ready) => ({ ...ready, hardware: true }));
  });

  return () => unsubscribe();
}, []);

const updateHardwareStatus = async (id, status) => {
  try {
    await updateDoc(doc(db, "hardware", id), { status });
    setToast("Statut matériel mis à jour");
  } catch (error) {
    if (isAbortError(error)) return;
    console.error("Erreur statut matériel :", error);
    setToast("Erreur lors de la mise à jour.");
  }
};

const updateHardwareCondition = async (id, condition) => {
  try {
    await updateDoc(doc(db, "hardware", id), { condition });
    setToast("État matériel mis à jour");
  } catch (error) {
    if (isAbortError(error)) return;
    console.error("Erreur état matériel :", error);
    setToast("Erreur lors de la mise à jour.");
  }
};

const updateHardwareDisplaySize = async (id, displaySize) => {
  try {
    await updateDoc(doc(db, "hardware", id), { displaySize });
    setToast("Taille d'ecran mise a jour");
  } catch (error) {
    if (isAbortError(error)) return;
    console.error("Erreur taille ecran :", error);
    setToast("Erreur lors de la mise a jour.");
  }
};

useEffect(() => {
  localStorage.setItem("checkpoint-sound-enabled", String(soundEnabled));
}, [soundEnabled]);

useEffect(() => {
  if (soundStyle === "retro") {
    setSoundStyle("nes");
    return;
  }

  localStorage.setItem("checkpoint-sound", soundStyle);
}, [soundStyle]);

const [libraryCardMode, setLibraryCardMode] = useState(() => {
  const savedMode = localStorage.getItem("checkpoint-library-card-mode");
  return savedMode === "detailed" ? "compact" : savedMode || "compact";
});

useEffect(() => {
  if (libraryCardMode === "detailed") {
    setLibraryCardMode("compact");
    return;
  }

  localStorage.setItem("checkpoint-library-card-mode", libraryCardMode);
}, [libraryCardMode]);

  const years = useMemo(() => {
    const arr = [];
    for (let year = 2026; year >= 1980; year--) arr.push(String(year));
    return arr;
  }, []);


  useEffect(() => {
  const handleClick = (e) => {
    if (document.body.dataset.ui === "pixel") {
      createPixelEffect(e.clientX, e.clientY);
    }
  };

  window.addEventListener("click", handleClick);

  return () => window.removeEventListener("click", handleClick);
}, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("checkpoint-theme", theme);

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const colors = {
      "theme-indigo": "#07091f",
      "theme-emerald": "#031712",
      "theme-crimson": "#16060b",
      "theme-graphite": "#090d12",
      "theme-retro": "#111025",
      "theme-cyberpunk": "#080716",
      "theme-playstation": "#101827",
      "theme-xbox": "#07120b",
      "theme-steamdeck": "#171717",
          };

    if (metaTheme) {
      metaTheme.setAttribute("content", colors[theme] || "#060611");
    }
  }, [theme]);

  useEffect(() => {
    document.body.setAttribute("data-ui", uiMode);
    localStorage.setItem("checkpoint-ui-mode", uiMode);
  }, [uiMode]);

useEffect(() => {
  localStorage.setItem("checkpoint-app-options", JSON.stringify(appOptions));
  document.body.setAttribute("data-effects", appOptions.visualEffects || "balanced");
  document.body.setAttribute(
      "data-background-motion",
      appOptions.animatedBackground ? "on" : "off"
    );
    document.body.setAttribute("data-app-icon", appOptions.appIcon || "theme");
    document.body.setAttribute("data-header-mode", appOptions.headerMode || "standard");
    document.body.setAttribute("data-mobile-nav", appOptions.mobileNavMode || "standard");

    let iconLink = document.querySelector('link[rel="icon"]');
    if (!iconLink) {
      iconLink = document.createElement("link");
      iconLink.setAttribute("rel", "icon");
      document.head.appendChild(iconLink);
    }

    iconLink.setAttribute(
      "href",
      appOptions.appIcon === "classic" ? "/favicon.ico" : "/logo-cp-transparent.png"
    );
  }, [appOptions]);

useEffect(() => {
  if (!appOptions.rememberLastTab) return;
  if (!APP_TAB_IDS.includes(activeTab)) return;

  localStorage.setItem("checkpoint-last-tab", activeTab);
}, [activeTab, appOptions.rememberLastTab]);

  useEffect(() => {
    return () => {
      window.clearTimeout(tabSwitchTimerRef.current);
      window.clearTimeout(tabTransitionTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!showSplash) return;

    const fallbackTimer = setTimeout(() => {
      setBootReady({
        events: true,
        news: true,
        hardware: true,
        games: true,
      });
    }, 6500);

    return () => clearTimeout(fallbackTimer);
  }, [showSplash]);

  useEffect(() => {
    if (!showSplash) return;

    const readyCount = Object.values(bootReady).filter(Boolean).length;
    const targetProgress = Math.min(92, 18 + readyCount * 16);

    setSplashTargetProgress((current) =>
      current < targetProgress ? targetProgress : current
    );
  }, [bootReady, showSplash]);

  useEffect(() => {
    if (!showSplash) return;

    const progressTimer = setInterval(() => {
      setSplashProgress((current) => {
        if (current >= splashTargetProgress) return current;

        const gap = splashTargetProgress - current;
        const step = Math.max(1, Math.min(5, Math.ceil(gap * 0.18)));
        return Math.min(splashTargetProgress, current + step);
      });
    }, 90);

    return () => clearInterval(progressTimer);
  }, [showSplash, splashTargetProgress]);

  useEffect(() => {
    if (!showSplash) return;

    const allReady = Object.values(bootReady).every(Boolean);
    const elapsed = Date.now() - splashStartedAtRef.current;
    const minimumDuration = 2600;

    if (!allReady) return;

    let closeTimer;
    const timer = setTimeout(() => {
      setSplashTargetProgress(100);

      closeTimer = setTimeout(() => {
        requestAnimationFrame(() => {
          setShowSplash(false);
          sessionStorage.setItem("checkpoint-splash-seen", "true");
        });
      }, 820);
    }, Math.max(0, minimumDuration - elapsed));

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [bootReady, showSplash]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "games"), (snapshot) => {
      const gamesData = snapshot.docs.map((docItem) =>
        normalizeGameRatings({
          id: docItem.id,
          ...docItem.data(),
        })
      );

      setGames(gamesData);
      setBootReady((ready) => ({ ...ready, games: true }));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showSplash) return;
    const fetchFilterData = async () => {
      try {
        const [platformsRes, genresRes] = await Promise.all([
          fetch(`https://api.rawg.io/api/platforms?key=${API_KEY}&page_size=40`),
          fetch(`https://api.rawg.io/api/genres?key=${API_KEY}&page_size=40`),
        ]);

        const platformsData = await platformsRes.json();
        const genresData = await genresRes.json();

        setPlatforms(platformsData.results || []);
        setGenres(genresData.results || []);
      } catch (e) {
        if (isAbortError(e)) return;
        console.error("Erreur chargement filtres :", e);
      }
    };

    fetchFilterData();
  }, [showSplash]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (showSplash) return;
    const fetchUpcomingGames = async () => {
      try {
        setIsUpcomingLoading(true);

        const today = new Date();
const startDate = today.toISOString().split("T")[0];

const future = new Date();
future.setMonth(future.getMonth() + 6);
const endDate = future.toISOString().split("T")[0];

const url = `https://api.rawg.io/api/games?key=${API_KEY}&dates=${startDate},${endDate}&ordering=released&page_size=40`;
        const response = await fetch(url);
        const data = await response.json();

        setUpcomingGames(data.results || []);
      } catch (e) {
        if (isAbortError(e)) return;
        console.error("Erreur chargement sorties :", e);
      } finally {
        setIsUpcomingLoading(false);
      }
    };

    fetchUpcomingGames();
  }, [showSplash]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const totalXP = useMemo(() => {
    const gamesXP = games
      .filter((g) => g.status !== "wishlist")
      .reduce((sum, g) => sum + calculateXP(g), 0);

    return gamesXP + (weeklyQuizProgress.totalXP || 0) + (checkpointGoalProgress.totalXP || 0);
  }, [games, weeklyQuizProgress.totalXP, checkpointGoalProgress.totalXP]);

  const level = getLevel(totalXP);
  const progress = getProgress(totalXP);
  const title = getRankTitle(level);

  const [prevLevel, setPrevLevel] = useState(1);

useEffect(() => {
  if (level > prevLevel) {
    playSound("levelup", soundStyle);
    setPrevLevel(level);
  }
}, [level, prevLevel, soundStyle]);

  const badges = useMemo(
    () => getUnlockedBadgesV2(games, level, hardware, socialProfile, weeklyQuizProgress),
    [games, level, hardware, socialProfile, weeklyQuizProgress]
  );
  const socialActivities = useMemo(
    () => getSocialActivityFeed(games, hardware, badges),
    [games, hardware, badges]
  );

useEffect(() => {
  if (!badges || badges.length === 0) return;

  const unlockedIds = badges.filter((b) => b.unlocked).map((b) => String(b.id));
  const savedIds = readStoredUnlockedBadgeIds();
  const savedSet = new Set(savedIds);

  if (!badgeToastInitializedRef.current) {
    badgeToastInitializedRef.current = true;
    storeUnlockedBadgeIds([...savedIds, ...unlockedIds]);
    return;
  }

  const newlyUnlocked = badges.find(
    (badge) => badge.unlocked && !savedSet.has(String(badge.id))
  );

  if (newlyUnlocked) {
    setNewUnlockedBadge(newlyUnlocked);
    playSound("badge", soundStyle);

    if (navigator.vibrate) {
      navigator.vibrate([40, 40, 60]);
    }

    setTimeout(() => {
      setNewUnlockedBadge(null);
    }, 2800);
  }

  storeUnlockedBadgeIds([...savedIds, ...unlockedIds]);
}, [badges, soundStyle]);

useEffect(() => {
  const timer = setTimeout(() => {
    setBootWave(false);
  }, 1800);

  return () => clearTimeout(timer);
}, []);

useEffect(() => {
  if (!selectedGame && !selectedSearchGame) {
    document.body.classList.remove("modal-open");
  }
}, [selectedGame, selectedSearchGame]);

useEffect(() => {
  const handleWheel = (e) => {
    const target = e.target;

    if (
      target.closest("input, textarea, select") ||
      target.closest(".modal-backdrop") ||
      target.closest(".search-detail-backdrop") ||
      target.closest(".hardware-modal-backdrop") ||
      target.closest(".hardware-zoom-backdrop")
    ) {
      return;
    }

    window.scrollBy({
      top: e.deltaY,
      left: 0,
      behavior: "auto",
    });
  };

  window.addEventListener("wheel", handleWheel, { passive: true });

  return () => {
    window.removeEventListener("wheel", handleWheel);
  };
}, []);

  const upcomingMonthOptions = useMemo(() => {
    const set = new Set(
      upcomingGames.map((g) => getMonthKey(g.released)).filter(Boolean)
    );
    return Array.from(set).sort();
  }, [upcomingGames]);

  const filteredUpcomingGames = useMemo(() => {
    const list = upcomingMonthFilter
      ? upcomingGames.filter(
          (g) => getMonthKey(g.released) === upcomingMonthFilter
        )
      : upcomingGames;

    return [...list].sort((a, b) => {
      const dateA = a.released ? new Date(a.released) : null;
      const dateB = b.released ? new Date(b.released) : null;

      if (dateA && dateB) return dateA - dateB;
      if (dateA && !dateB) return -1;
      if (!dateA && dateB) return 1;

      return 0;
    });
  }, [upcomingGames, upcomingMonthFilter]);

  const filteredLibraryGames = useMemo(() => {
    const q = librarySearch.trim().toLowerCase();
    if (!q) return games;

    return games.filter((game) => {
      const name = game.name?.toLowerCase() || "";
      const platforms = (game.platformNames || []).join(" ").toLowerCase();
      const genres = (game.genreNames || []).join(" ").toLowerCase();
      const review = (game.review || "").toLowerCase();

      return (
        name.includes(q) ||
        platforms.includes(q) ||
        genres.includes(q) ||
        review.includes(q)
      );
    });
  }, [games, librarySearch]);

  const wishlistGames = filteredLibraryGames
  .filter((game) => game.status === "wishlist")
  .sort((a, b) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateA = a.released ? new Date(a.released) : null;
    const dateB = b.released ? new Date(b.released) : null;

    const isFutureA = dateA && dateA >= today;
    const isFutureB = dateB && dateB >= today;

    // futurs en premier
    if (isFutureA && !isFutureB) return -1;
    if (!isFutureA && isFutureB) return 1;

    // deux futurs → tri par date croissante
    if (isFutureA && isFutureB) {
      return dateA - dateB;
    }

    // deux déjà sortis → plus récents en premier
    if (dateA && dateB) {
      return dateB - dateA;
    }

    return 0;
  });
  const inProgressGames = filteredLibraryGames.filter((game) => game.status === "en cours");
  const collectionGames = filteredLibraryGames.filter(isGameInCollection);
  const favoriteGames = filteredLibraryGames.filter((game) => game.favorite);
  const detailSourceGames = detailGameList.length ? detailGameList : games;
  const selectedDetailIndex = selectedGame
    ? detailSourceGames.findIndex((game) => game.id === selectedGame.id)
    : -1;
  const canGoPreviousGame = selectedDetailIndex > 0;
  const canGoNextGame =
    selectedDetailIndex >= 0 && selectedDetailIndex < detailSourceGames.length - 1;

  const getFreshGame = (game) =>
    games.find((currentGame) => currentGame.id === game?.id) || game;

  const openGameDetail = (game, sourceGames = []) => {
    const navigationList = sourceGames.length ? sourceGames : games;
    setDetailGameList(navigationList.map(getFreshGame).filter(Boolean));
    setSelectedGame(getFreshGame(game));
  };

  const navigateSelectedGame = (direction) => {
    if (selectedDetailIndex < 0) return;

    const nextIndex = selectedDetailIndex + direction;
    if (nextIndex < 0 || nextIndex >= detailSourceGames.length) return;

    setSelectedGame(getFreshGame(detailSourceGames[nextIndex]));
  };

  const gameExists = (name) =>
    games.some(
      (game) =>
        game.name?.trim().toLowerCase() === name.trim().toLowerCase()
    );

  const loadMoreResults = async () => {
    if (!nextPage) {
      console.log("Pas de nextPage");
      return;
    }

    try {
      let url = nextPage;
      let validResults = [];
      let nextUrl = null;
      let safety = 0;

      while (url && validResults.length === 0 && safety < 3) {
        console.log("LOAD MORE URL:", url);

        const response = await fetch(url);
        const data = await response.json();

        const pageResults = (data.results || []).filter(isMainGameResult);

        validResults = pageResults;
        nextUrl = data.next || null;
        url = nextUrl;
        safety++;
      }

      setResults((prev) => {
        const merged = [...prev, ...validResults];

        const uniqueResults = merged.filter(
          (game, index, self) => index === self.findIndex((g) => g.id === game.id)
        );

        return sortSearchResultsByRelevance(uniqueResults, search);
      });

      setNextPage(nextUrl);
    } catch (e) {
      if (isAbortError(e)) return;
      console.error("Erreur pagination :", e);
    }
  };

  const addGameToFirebase = async (game) => {
    try {
      if (gameExists(game.name)) {
        setToast("Ce jeu est déjà dans ta liste.");
        return false;
      }

      const isFinished = isGameFinishedStatus(game);
      const newGame = {
        rawgId: game.rawgId || game.id || null,
        name: game.name,
        completed: game.completed || isFinished || false,
        rating: getGameRating(game),
        favorite: game.favorite || false,
        image: game.image || "",
        status: isFinished ? "collection" : game.status || "wishlist",
        released: game.released || "",
        platformNames: game.platformNames || [],
        genreNames: game.genreNames || [],
        playtime: game.playtime || null,
        difficulty: game.difficulty || "normal",
        review: game.review || "",
        ostRating: clampRating(game.ostRating),
        ostTrack: game.ostTrack || "",
        ostLink: game.ostLink || "",
        ratingGraphics: clampRating(game.ratingGraphics),
        ratingGameplay: clampRating(game.ratingGameplay),
        ratingStory: clampRating(game.ratingStory),
        ratingSound: clampRating(game.ratingSound),
        ratingLongevity: clampRating(game.ratingLongevity),
        createdAt: new Date(),
      };

      const ref = await addDoc(collection(db, "games"), newGame);
      const savedGame = { ...newGame, id: ref.id };

      if (appOptions.afterAddAction === "library") {
        setSelectedSearchGame(null);
        changeTab("library");
      }

      if (appOptions.afterAddAction === "detail") {
        setSelectedSearchGame(null);
        setDetailGameList([savedGame]);
        setSelectedGame(savedGame);
      }

      return true;
    } catch (e) {
      console.error("Erreur ajout Firebase :", e);
      setToast("Erreur lors de l’ajout.");
      return false;
    }
  };

  const addGameToSeries = async (seriesName, game) => {
  try {
    const ref = doc(db, "gameCollections", seriesName);

    await setDoc(
      ref,
      {
        name: seriesName,
        games: arrayUnion({
          rawgId: game.id,
          name: game.name,
          image: game.background_image || "",
          released: game.released || "",
        }),
      },
      { merge: true }
    );

    setToast("Ajouté à la série");
  } catch (e) {
    if (isAbortError(e)) return;
    console.error(e);
    setToast("Erreur série");
  }
};

  const addFromSearch = async (game) => {
    const ok = await addGameToFirebase({ ...game, status: "terminé" });

    if (ok) {
      playSound("success", soundStyle);
      setToast("Ajouté à Terminé");
    }
  };

  const addToWishlistFromSearch = async (game) => {
      const ok = await addGameToFirebase({ ...game, status: "wishlist" });

      if (ok) {
        playSound("success", soundStyle);
        setToast("Ajouté à Wishlist");
      }
    };

  const clearSearchResults = () => {
    setSearch("");
    setDebouncedSearch("");
    setResults([]);
    setNextPage(null);
  };

  const chooseSort = (value) => {
    setSortBy(value);
  };

  const isMainGameResult = (game) => {
  const name = (game.name || "").toLowerCase();

  const allowedWords = [
    "complete edition",
    "definitive edition",
    "ultimate edition",
    "deluxe edition",
    "gold edition",
    "game of the year",
    "goty",
    "remastered",
    "remake",
    "director's cut",
    "anniversary edition",
    "collection",
    "trilogy",
  ];

  if (allowedWords.some((word) => name.includes(word))) {
    return true;
  }

  const blockedWords = [
    "dlc",
    "season pass",
    "battle pass",
    "expansion",
    "add-on",
    "addon",
    "skin",
    "costume",
    "soundtrack",
    "ost",
    "demo",
    "beta",
  ];

  return !blockedWords.some((word) => name.includes(word));
};

  const searchGames = async (forcedSearch = null) => {
  const cleanSearch = (forcedSearch ?? search ?? debouncedSearch).trim();

  if (!cleanSearch && !yearFilter && !platformFilter && !genreFilter) {
    alert("Tape un jeu ou choisis au moins un filtre.");
    return;
  }

  try {
    setIsSearching(true);

    const params = new URLSearchParams();
    params.append("key", API_KEY);
    params.append("page_size", "20");
    params.append("page", "1");

    if (cleanSearch) params.append("search", cleanSearch);
    if (yearFilter) params.append("dates", `${yearFilter}-01-01,${yearFilter}-12-31`);
    if (platformFilter) params.append("platforms", platformFilter);
    if (genreFilter) params.append("genres", genreFilter);

    if (cleanSearch) {
      params.append("search_precise", "true");
    } else {
      params.append("ordering", sortBy);
    }

    const url = `https://api.rawg.io/api/games?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    let resultsList = (data.results || []).filter(isMainGameResult);

    if (cleanSearch) {
      for (const slug of getRawgSlugCandidates(cleanSearch)) {
        try {
          const detailResponse = await fetch(
            `https://api.rawg.io/api/games/${slug}?key=${API_KEY}`
          );

          if (detailResponse.ok) {
            const exactGame = await detailResponse.json();
            if (exactGame?.id && isMainGameResult(exactGame)) {
              resultsList = [
                exactGame,
                ...resultsList.filter((game) => game.id !== exactGame.id),
              ];
              break;
            }
          }
        } catch (error) {
          if (!isAbortError(error)) {
            console.warn("Recherche directe RAWG ignorée :", error);
          }
        }
      }

      const fallbackResults = getKnownSearchFallbacks(cleanSearch).filter((game) =>
        gameMatchesSearchFilters(game, {
          yearFilter,
          platformFilter,
          genreFilter,
        })
      );

      if (fallbackResults.length > 0) {
        resultsList = [
          ...fallbackResults,
          ...resultsList.filter(
            (game) => !fallbackResults.some((fallback) => fallback.id === game.id)
          ),
        ];
      }
    }

    resultsList = sortSearchResultsByRelevance(resultsList, cleanSearch);

    const nextParams = new URLSearchParams(params);
    nextParams.set("page", "2");

    setResults(resultsList);

    setNextPage(
      data.next ||
        (resultsList.length === 20
          ? `https://api.rawg.io/api/games?${nextParams.toString()}`
          : null)
    );

    setShowFilters(false);
  } catch (e) {
    if (isAbortError(e)) return;
    console.error("Erreur recherche RAWG :", e);
    setToast("Erreur pendant la recherche.");
  } finally {
    setIsSearching(false);
  }
};

  useEffect(() => {
    if (activeTab !== "search") return;
    if (debouncedSearch.trim().length < 3) return;

    searchGames();
  }, [debouncedSearch]);

  const deleteGame = async (id) => {
  const game = games.find((currentGame) => currentGame.id === id);
  if (
    appOptions.confirmDangerActions &&
    !window.confirm(`Supprimer "${game?.name || "ce jeu"}" ?`)
  ) {
    return;
  }

  try {
    await deleteDoc(doc(db, "games", id));

    playSound("delete", soundStyle); // 🔊 AJOUT

    setToast("Jeu supprimé");

    if (selectedGame?.id === id) {
      setSelectedGame(null);
    }
  } catch (e) {
    console.error("Erreur suppression Firebase :", e);
    setToast("Erreur lors de la suppression.");
  }
};

  const ratingUpdateTimeoutRef = useRef(null);

const hardwareUpdateTimersRef = useRef({});

const updateHardwareFieldDebounced = (hardwareId, payload) => {
  clearTimeout(hardwareUpdateTimersRef.current[hardwareId]);

  hardwareUpdateTimersRef.current[hardwareId] = setTimeout(async () => {
    try {
      await updateDoc(doc(db, "hardware", hardwareId), payload);
    } catch (e) {
      console.error("Erreur mise à jour matériel :", e);
    }
  }, 350);
};

const updateHardwareRating = (hardwareId, key, value, type) => {
  const nextValue = clampRating(value);
  const currentItem = hardware.find((item) => item.id === hardwareId);
  const currentRatings = currentItem?.ratings || {};
  const nextRatings = {
    ...currentRatings,
    [key]: nextValue,
  };

  const fields = getHardwareRatingFields(type);
  const values = fields
    .map((field) => clampRating(nextRatings[field.key]))
    .filter((ratingValue) => ratingValue > 0);

  const nextAverage = values.length
    ? Math.round((values.reduce((sum, ratingValue) => sum + ratingValue, 0) / values.length) * 10) / 10
    : 0;

  updateHardwareFieldDebounced(hardwareId, {
    ratings: nextRatings,
    rating: nextAverage,
  });
};

const updateHardwareReview = async (hardwareId, review) => {
  try {
    await updateDoc(doc(db, "hardware", hardwareId), { review });
  } catch (e) {
    console.error("Erreur mise à jour avis matériel :", e);
  }
};

const updateHardwareComponent = (hardwareId, key, value) => {
  const currentItem = hardware.find((item) => item.id === hardwareId);
  const nextConfig = {
    ...(currentItem?.pcConfig || {}),
    [key]: value,
  };

  updateHardwareFieldDebounced(hardwareId, { pcConfig: nextConfig });
};

const setRating = (id, rating) => {
    const nextRating = clampRating(rating);

    setGames((prev) =>
      prev.map((game) =>
        game.id === id ? { ...game, rating: nextRating } : game
      )
    );

    if (selectedGame?.id === id) {
      setSelectedGame((prev) => ({ ...prev, rating: nextRating }));
    }

    clearTimeout(ratingUpdateTimeoutRef.current);

    ratingUpdateTimeoutRef.current = setTimeout(async () => {
      try {
        await updateDoc(doc(db, "games", id), { rating: nextRating });
      } catch (e) {
        console.error("Erreur mise à jour note :", e);
      }
    }, 450);
  };

  const setDetailedRating = async (id, key, value) => {
    const nextRating = clampRating(value);

    try {
      await updateDoc(doc(db, "games", id), { [key]: nextRating });
      setGames((prev) =>
        prev.map((game) =>
          game.id === id ? { ...game, [key]: nextRating } : game
        )
      );
      if (selectedGame?.id === id) {
        setSelectedGame((prev) => ({ ...prev, [key]: nextRating }));
      }
    } catch (e) {
      console.error("Erreur note détaillée :", e);
    }
  };

  const toggleFavorite = async (id, currentValue) => {
    try {
      await updateDoc(doc(db, "games", id), { favorite: !currentValue });
      if (selectedGame?.id === id) {
        setSelectedGame((prev) => ({ ...prev, favorite: !currentValue }));
      }
    } catch (e) {
      console.error("Erreur mise à jour favori :", e);
    }
  };

  const setStatus = async (id, status) => {
    try {
      const progressStatus =
        status === "en cours"
          ? "in_progress"
          : isGameFinishedStatus({ status })
            ? "completed"
            : "not_started";
      const completed = progressStatus === "completed";

      await updateDoc(doc(db, "games", id), { status, progressStatus, completed });
      if (selectedGame?.id === id) {
        setSelectedGame((prev) => ({
          ...prev,
          status,
          progressStatus,
          completed,
        }));
      }
      if (["wishlist", "en cours", "collection"].includes(status)) {
        setLibraryView(status);
      }
    } catch (e) {
      console.error("Erreur mise à jour statut :", e);
    }
  };

  const setProgressStatus = async (id, progressStatus) => {
  try {
    const completed = progressStatus === "completed";
    const currentGame = games.find((game) => game.id === id);
    const status = completed
      ? "collection"
      : progressStatus === "in_progress"
        ? "en cours"
        : currentGame?.status === "wishlist"
          ? "wishlist"
          : "collection";

    await updateDoc(doc(db, "games", id), {
      progressStatus,
      completed,
      status,
    });

    if (selectedGame?.id === id) {
      setSelectedGame((prev) => ({
        ...prev,
        progressStatus,
        completed,
        status,
      }));
    }

    setToast(`Progression : ${getProgressLabel(progressStatus)}`);
  } catch (e) {
    console.error("Erreur progression :", e);
    }
  };

  const setGameOfYear = async (year, gameId) => {
    const numericYear = Number(year);
    if (!numericYear || !gameId) return;

    const selectedGame = games.find((game) => game.id === gameId);
    const isAlreadySelected = Number(selectedGame?.gotyYear) === numericYear;
    const affectedGames = games.filter(
      (game) => Number(game.gotyYear) === numericYear || game.id === gameId
    );

    setGames((prev) =>
      prev.map((game) => {
        if (game.id === gameId) {
          return {
            ...game,
            gotyYear: isAlreadySelected ? null : numericYear,
          };
        }

        if (Number(game.gotyYear) === numericYear) {
          return { ...game, gotyYear: null };
        }

        return game;
      })
    );

    try {
      await Promise.all(
        affectedGames.map((game) =>
          updateDoc(doc(db, "games", game.id), {
            gotyYear:
              game.id === gameId && !isAlreadySelected ? numericYear : null,
          })
        )
      );
      setToast(isAlreadySelected ? "GOTY retiré" : `GOTY ${numericYear} sélectionné`);
    } catch (e) {
      console.error("Erreur Game of the Year :", e);
      setToast("Erreur lors de la sélection GOTY.");
    }
  };

  const setPlaytimeRange = async (id, playtimeRange) => {
  try {
    await updateDoc(doc(db, "games", id), {
      playtimeRange,
    });

    if (selectedGame?.id === id) {
      setSelectedGame((prev) => ({
        ...prev,
        playtimeRange,
      }));
    }

    setToast(`Temps joué : ${getPlaytimeRangeLabel(playtimeRange)}`);
  } catch (e) {
    console.error("Erreur temps joué :", e);
  }
};

const setPlayedPlatforms = async (id, platforms) => {
  try {
    await updateDoc(doc(db, "games", id), {
      playedPlatforms: platforms,
    });

    if (selectedGame?.id === id) {
      setSelectedGame((prev) => ({
        ...prev,
        playedPlatforms: platforms,
      }));
    }

    setToast("Plateforme utilisée mise à jour");
  } catch (error) {
    if (isAbortError(error)) return;
    console.error("Erreur plateformes jouées :", error);
  }
};

  const repairGameDataIntegrity = async (providedIssues = null) => {
    const issues = providedIssues || getGameDataIntegrityIssues(games);

    if (!issues.length) {
      showToast("Bibliothèque déjà cohérente.");
      return;
    }

    try {
      await Promise.all(
        issues.map(({ game, patch }) => updateDoc(doc(db, "games", game.id), patch))
      );

      setGames((prev) =>
        prev.map((game) => {
          const issue = issues.find((item) => item.game.id === game.id);
          return issue ? { ...game, ...issue.patch } : game;
        })
      );

      setSelectedGame((prev) => {
        if (!prev) return prev;
        const issue = issues.find((item) => item.game.id === prev.id);
        return issue ? { ...prev, ...issue.patch } : prev;
      });

      showToast(`${issues.length} fiche${issues.length > 1 ? "s" : ""} synchronisée${issues.length > 1 ? "s" : ""}`);
    } catch (error) {
      console.error("Erreur diagnostic bibliothèque :", error);
      showToast("Impossible de réparer les données pour le moment.");
    }
  };

  const toggleCompleted = async (id, currentValue) => {
    try {
      const completed = !currentValue;
      const currentGame = games.find((game) => game.id === id);
      const status =
        completed || currentGame?.status === "terminé"
          ? "collection"
          : currentGame?.status || "collection";
      const progressStatus = completed ? "completed" : "not_started";

      await updateDoc(doc(db, "games", id), {
        completed,
        progressStatus,
        status,
      });

      if (selectedGame?.id === id) {
        setSelectedGame((prev) => ({
          ...prev,
          completed,
          progressStatus,
          status,
        }));
      }

      setToast(!currentValue ? "Jeu marqué comme terminé" : "Jeu marqué comme non terminé");
    } catch (e) {
      console.error("Erreur mise à jour terminé :", e);
    }
  };

  const setDifficulty = async (id, difficulty) => {
    try {
      await updateDoc(doc(db, "games", id), { difficulty });
      if (selectedGame?.id === id) {
        setSelectedGame((prev) => ({ ...prev, difficulty }));
      }
      setToast("Difficulté mise à jour");
    } catch (e) {
      console.error("Erreur mise à jour difficulté :", e);
    }
  };

  const setReview = async (id, review) => {
    try {
      await updateDoc(doc(db, "games", id), { review });
      if (selectedGame?.id === id) {
        setSelectedGame((prev) => ({ ...prev, review }));
      }
      setToast("Avis enregistré");
    } catch (e) {
      console.error("Erreur mise à jour avis :", e);
    }
  };

  const setOstInfo = async (id, ostInfo) => {
    const payload = {
      ostRating: clampRating(ostInfo.ostRating),
      ostTrack: (ostInfo.ostTrack || "").trim(),
      ostLink: (ostInfo.ostLink || "").trim(),
    };

    try {
      await updateDoc(doc(db, "games", id), payload);
      setGames((prev) =>
        prev.map((game) => (game.id === id ? { ...game, ...payload } : game))
      );
      if (selectedGame?.id === id) {
        setSelectedGame((prev) => ({ ...prev, ...payload }));
      }
      setToast("OST enregistrée");
    } catch (e) {
      console.error("Erreur mise à jour OST :", e);
      setToast("Erreur lors de l'enregistrement OST.");
    }
  };

  const setDLCs = async (id, dlcs) => {
    try {
      await updateDoc(doc(db, "games", id), { dlcs });

      if (selectedGame?.id === id) {
        setSelectedGame((prev) => ({
          ...prev,
          dlcs,
        }));
      }

      setToast("DLC mis à jour");
    } catch (e) {
      console.error("Erreur mise à jour DLC :", e);
    }
  };

  const changeTab = (nextTab) => {
    if (nextTab === activeTab) return;

    setSelectedGame(null);
    setSelectedSearchGame(null);
    document.body.classList.remove("modal-open");

    const currentIndex = tabOrder.indexOf(activeTab);
    const nextIndex = tabOrder.indexOf(nextTab);
    const nextDirection = nextIndex > currentIndex ? "right" : "left";

    window.clearTimeout(tabSwitchTimerRef.current);
    window.clearTimeout(tabTransitionTimerRef.current);

    // Transition visuelle très courte, par-dessus
    if (uiMode === "reduced") {
      setPixelTransition(null);
      setActiveTab(nextTab);
      return;
    }

    setPixelTransition(null);

    window.setTimeout(() => {
      setPixelTransition(nextDirection);

      tabSwitchTimerRef.current = window.setTimeout(() => {
        setActiveTab(nextTab);
      }, 90);

      tabTransitionTimerRef.current = window.setTimeout(() => {
        setPixelTransition(null);
      }, 540);
    }, 16);
  };

  useEffect(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    });
  }, [activeTab]);

  function getBadgeProgress(badge, stats) {
  if (badge.id.startsWith("collector_")) {
    const target = parseInt(badge.id.split("_")[1]);
    return { current: stats.total, target };
  }

  if (badge.id.startsWith("finisher_")) {
    const target = parseInt(badge.id.split("_")[1]);
    return { current: stats.finished, target };
  }

  if (badge.id.startsWith("favorites_")) {
    const target = parseInt(badge.id.split("_")[1]);
    return { current: stats.favorites, target };
  }

  if (badge.id.startsWith("reviews_")) {
    const target = parseInt(badge.id.split("_")[1]);
    return { current: stats.reviews, target };
  }

  if (badge.id.startsWith("hours_")) {
    const target = parseInt(badge.id.split("_")[1]);
    return { current: stats.hours, target };
  }

  if (badge.id.startsWith("level_")) {
    const target = parseInt(badge.id.split("_")[1]);
    return { current: stats.level, target };
  }

  return null;
}

  const showFullHeader = activeTab === "library";

  const showCompactHeader =
  activeTab !== "home" &&
  activeTab !== "library" &&
  activeTab !== "hardware" &&
  activeTab !== "profile" &&
  activeTab !== "options";
  return (

     <>
<>
    </>

          <Toast message={toast} />
          <BadgeUnlockToast badge={newUnlockedBadge} />
{ <SplashScreen showSplash={showSplash} progress={splashProgress} /> }
      <div className={`app-shell ${showSplash ? "app-hidden" : "app-visible"}`}>
        <div className="container">
          <h1 className="title" data-title="Checkpoint">Checkpoint</h1>

          {showFullHeader && (
  <>
    <XPCard
      totalXP={totalXP}
      level={level}
      title={title}
      progress={progress}
    />

    <StatsBar
      total={games.length}
      wishlist={games.filter((g) => g.status === "wishlist").length}
      inProgress={games.filter((g) => g.status === "en cours").length}
      finished={games.filter(isGameFinishedStatus).length}
      favorites={games.filter((g) => g.favorite).length}
    />

  </>
)}

{showCompactHeader && (
  <>
    <XPCardCompact
      totalXP={totalXP}
      level={level}
      title={title}
      progress={progress}
    />

    <StatsBarCompact
      total={games.length}
      finished={games.filter(isGameFinishedStatus).length}
      favorites={games.filter((g) => g.favorite).length}
    />
  </>
)}

{activeTab === "home" && (
  <HomeTab
  games={games}
  hardware={hardware}
  badges={badges}
  level={level}
  totalXP={totalXP}
  progress={progress}
  setActiveTab={changeTab}
  onOpenDetail={(game) => openGameDetail(game, games)}
  gamingEvents={gamingEvents}
  socialActivities={socialActivities}
  weeklyQuiz={weeklyQuiz}
  weeklyQuizProgress={weeklyQuizProgress}
  onAnswerWeeklyQuiz={handleWeeklyQuizAnswer}
  checkpointGoalProgress={checkpointGoalProgress}
  onClaimCheckpointGoal={handleClaimCheckpointGoal}
/>
)}

{activeTab === "news" && (
  <NewsTab newsItems={newsItems} />
)}

{activeTab === "deals" && (
  <DealsTab dealPreferences={appOptions} />
)}

          {activeTab === "search" && (
            <>
              <div className="search-panel">
                <div className="input-container">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un jeu ou utiliser les filtres"
                  />
                  <button
                    onClick={() => {
                      playClick(soundStyle);
                      searchGames(search);
                    }}
                    type="button"
                  >
                    Rechercher
                  </button>
                </div>

                <div className="toolbar-row">
                  <button
                    className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
                    onClick={() => setShowFilters(!showFilters)}
                    type="button"
                  >
                    {showFilters ? "Fermer les filtres" : "Ouvrir les filtres"}
                  </button>
                </div>

                {showFilters && (
                  <div className="filters-panel">
                    <div className="filter-block">
                      <div className="filter-label">Trier par</div>
                      <div className="chips-group">
                        <button
                          className={`chip ${sortBy === "-rating" ? "active" : ""}`}
                          onClick={() => chooseSort("-rating")}
                          type="button"
                        >
                          Mieux notés
                        </button>
                        <button
                          className={`chip ${sortBy === "-released" ? "active" : ""}`}
                          onClick={() => chooseSort("-released")}
                          type="button"
                        >
                          Plus récents
                        </button>
                        <button
                          className={`chip ${sortBy === "released" ? "active" : ""}`}
                          onClick={() => chooseSort("released")}
                          type="button"
                        >
                          Plus anciens
                        </button>
                        <button
                          className={`chip ${sortBy === "name" ? "active" : ""}`}
                          onClick={() => chooseSort("name")}
                          type="button"
                        >
                          Nom A-Z
                        </button>
                      </div>
                    </div>

                    <div className="filter-block">
                      <div className="filter-label">Année</div>
                      <div className="chips-group">
                        <button
                          className={`chip ${yearFilter === "" ? "active" : ""}`}
                          onClick={() => setYearFilter("")}
                          type="button"
                        >
                          Toutes
                        </button>

                        {years.map((year) => (
                          <button
                            key={year}
                            className={`chip ${yearFilter === year ? "active" : ""}`}
                            onClick={() => setYearFilter(year)}
                            type="button"
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="filter-block">
                      <div className="filter-label">Plateforme</div>
                      <div className="chips-group">
                        <button
                          className={`chip ${platformFilter === "" ? "active" : ""}`}
                          onClick={() => setPlatformFilter("")}
                          type="button"
                        >
                          Toutes
                        </button>

                        {platforms.map((platform) => (
                          <button
                            key={platform.id}
                            className={`chip ${
                              String(platformFilter) === String(platform.id)
                                ? "active"
                                : ""
                            }`}
                            onClick={() => setPlatformFilter(String(platform.id))}
                            type="button"
                          >
                            {platform.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="filter-block">
                      <div className="filter-label">Genre</div>
                      <div className="chips-group">
                        <button
                          className={`chip ${genreFilter === "" ? "active" : ""}`}
                          onClick={() => setGenreFilter("")}
                          type="button"
                        >
                          Tous
                        </button>

                        {genres.map((genre) => (
                          <button
                            key={genre.id}
                            className={`chip ${
                              String(genreFilter) === String(genre.id) ? "active" : ""
                            }`}
                            onClick={() => setGenreFilter(String(genre.id))}
                            type="button"
                          >
                            {genre.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="filter-actions">
                      <button
                        className="reset-filters-btn"
                        onClick={() => {
                          setYearFilter("");
                          setPlatformFilter("");
                          setGenreFilter("");
                          setSortBy("-rating");
                        }}
                        type="button"
                      >
                        Réinitialiser les filtres
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isSearching && <Loader text="Recherche des jeux..." />}

              {!isSearching && results.length > 0 && (
                <div className="search-results-block">
                  <div className="search-results-header">
                    <h2>Résultats</h2>
                    <button
                      className="close-search-btn"
                      onClick={clearSearchResults}
                      type="button"
                    >
                      Fermer
                    </button>
                  </div>

                  <div className="results-container">
                    {results.map((game) => (
                      <SearchResultCard
                        key={game.id}
                        game={game}
                        games={games}
                        onAdd={addGameToFirebase}
                        onWishlist={addGameToFirebase}
                        isOwned={games.some((g) => g.rawgId === game.id || g.name.toLowerCase() === game.name.toLowerCase())}
                        onOpenSearchDetail={setSelectedSearchGame}
                      />
                    ))}
                    {nextPage && (
                      <button className="load-more-btn" onClick={loadMoreResults}>
                        Charger plus
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!isSearching &&
                results.length === 0 &&
                (search || yearFilter || platformFilter || genreFilter) && (
                  <EmptyState
                    title="Aucun résultat"
                    subtitle="Essaie un autre mot-clé ou modifie tes filtres."
                  />
                )}
            </>
          )}

          {activeTab === "upcoming" && (
            <div className="progression-stack">
              <div className="search-panel">
                <h2 className="panel-title">Prochaines sorties</h2>
                <div className="option-value">
                  Jeux à venir sur les prochains mois.
                </div>

                <div className="filter-block month-filter-block">
                  <div className="filter-label">Filtrer par mois</div>
                  <div className="chips-group">
                    <button
                      className={`chip ${upcomingMonthFilter === "" ? "active" : ""}`}
                      type="button"
                      onClick={() => setUpcomingMonthFilter("")}
                    >
                      Tous les mois
                    </button>

                    {upcomingMonthOptions.map((monthKey) => (
                      <button
                        key={monthKey}
                        className={`chip ${upcomingMonthFilter === monthKey ? "active" : ""}`}
                        type="button"
                        onClick={() => setUpcomingMonthFilter(monthKey)}
                      >
                        {formatMonthLabel(monthKey)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {isUpcomingLoading && <Loader text="Chargement des sorties..." />}

              {!isUpcomingLoading && filteredUpcomingGames.length > 0 && (
                <div className="upcoming-list">
                  {filteredUpcomingGames.map((game) => (
                    <UpcomingGameCard
                      key={game.id}
                      game={game}
                      onWishlist={addToWishlistFromSearch}
                    />
                  ))}
                </div>
              )}

              {!isUpcomingLoading && filteredUpcomingGames.length === 0 && (
                <EmptyState
                  title="Aucune sortie trouvée"
                  subtitle="Essaie un autre mois."
                />
              )}
            </div>
          )}

          {activeTab === "library" && (
  <>
    <div className="search-panel">
      <div className="input-container">
        <input
          value={librarySearch}
          onChange={(e) => setLibrarySearch(e.target.value)}
          placeholder="Rechercher dans ta bibliothèque"
        />
        <button
          type="button"
          onClick={() => {
            playClick(soundStyle);
            setLibrarySearch("");
          }}
        >
          Effacer
        </button>
      </div>
    </div>

    <div className="library-switch">
  <button
    type="button"
    className={`library-switch-btn ${libraryView === "collection" ? "active" : ""}`}
    onClick={() => setLibraryView("collection")}
  >
    Collection
  </button>

  <button
    type="button"
    className={`library-switch-btn ${libraryView === "en cours" ? "active" : ""}`}
    onClick={() => setLibraryView("en cours")}
  >
    En cours
  </button>

  <button
    type="button"
    className={`library-switch-btn ${libraryView === "wishlist" ? "active" : ""}`}
    onClick={() => setLibraryView("wishlist")}
  >
    Wishlist
  </button>

</div>

{libraryView === "collection" && (
  <LibrarySection
  title="Collection"
  games={collectionGames}
  onDelete={deleteGame}
  onSetStatus={setStatus}
  onSetRating={setRating}
  onToggleFavorite={toggleFavorite}
  onOpenDetail={(game) => openGameDetail(game, collectionGames)}
  libraryCardMode={libraryCardMode}
  setLibraryCardMode={setLibraryCardMode}
/>
)}

{libraryView === "en cours" && (
  <LibrarySection
    title="Jeux en cours"
    games={inProgressGames}
    onDelete={deleteGame}
    onSetStatus={setStatus}
    onSetRating={setRating}
    onToggleFavorite={toggleFavorite}
    onOpenDetail={(game) => openGameDetail(game, inProgressGames)}
    libraryCardMode={libraryCardMode}
    setLibraryCardMode={setLibraryCardMode}
  />
)}

{libraryView === "wishlist" && (
  <LibrarySection
    title="Wishlist"
    games={wishlistGames}
    onDelete={deleteGame}
    onSetStatus={setStatus}
    onSetRating={setRating}
    onToggleFavorite={toggleFavorite}
    onOpenDetail={(game) => openGameDetail(game, wishlistGames)}
    libraryCardMode={libraryCardMode}
    setLibraryCardMode={setLibraryCardMode}
  />
)}

  </>
)}

{activeTab === "series" && (
  <GameSeriesTab
  games={games}
  onAddGameToLibrary={addGameToFirebase}
  onAddGameToSeries={addGameToSeries}
/>
)}

{activeTab === "hardware" && (
  <HardwareTab
    hardware={hardware}
    onAddHardware={addHardware}
    onDeleteHardware={deleteHardware}
    onToggleHardwareFavorite={toggleHardwareFavorite}
    games={games}
    onUpdateHardwareStatus={updateHardwareStatus}
    onUpdateHardwareCondition={updateHardwareCondition}
    onUpdateHardwareDisplaySize={updateHardwareDisplaySize}
    onUpdateHardwareRank={updateHardwareRank}
    onUpdateHardwareRating={updateHardwareRating}
    onUpdateHardwareReview={updateHardwareReview}
    onUpdateHardwareComponent={updateHardwareComponent}
  />
)}

          {activeTab === "favorites" && (
            <>
              <div className="search-panel">
                <div className="input-container">
                  <input
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    placeholder="Rechercher dans tes favoris"
                  />
                  <button type="button" onClick={() => setLibrarySearch("")}>
                    Effacer
                  </button>
                </div>
              </div>

              <LibrarySection
                title="Coups de cœur"
                games={favoriteGames}
                onDelete={deleteGame}
                onSetStatus={setStatus}
                onSetRating={setRating}
                onToggleFavorite={toggleFavorite}
                onOpenDetail={(game) => openGameDetail(game, favoriteGames)}
                libraryCardMode={libraryCardMode}
                setLibraryCardMode={setLibraryCardMode}
              />
            </>
          )}

          {activeTab === "live" && (
            <LiveTab
              gamingEvents={gamingEvents}
              setMiniPlayerLive={setMiniPlayerLive}
              setMiniPlayerCollapsed={setMiniPlayerCollapsed}
            />
          )}

          {activeTab === "social" && (
            <SocialTab
              games={games}
              hardware={hardware}
              badges={badges}
              level={level}
              socialProfile={socialProfile}
              socialFriends={socialFriends}
              sharedProfile={sharedProfile}
              onCloseSharedProfile={closeSharedProfile}
              onProfileChange={updateSocialProfile}
              onSetProfileVisibility={setSocialProfileVisibility}
              onCopyProfileLink={copySocialProfileLink}
              onAddProfilePhotos={addSocialProfilePhotos}
              onRemoveProfilePhoto={removeSocialProfilePhoto}
              onAddFriend={addSocialFriend}
              onRemoveFriend={removeSocialFriend}
            />
          )}

          {activeTab === "top5" && (
            <Top5TabV2
              games={games}
              hardware={hardware}
              onSetGameOfYear={setGameOfYear}
            />
          )}

          {activeTab === "profile" && (
            <ProfileTab
              badges={badges}
              level={level}
              totalXP={totalXP}
              progress={progress}
              games={games}
              hardware={hardware}
              featuredBadgeId={socialProfile.featuredBadgeId}
              onSelectFeaturedBadge={(badgeId) =>
                updateSocialProfile("featuredBadgeId", badgeId)
              }
            />
          )}

          {activeTab === "options" && (
            <>
              <OptionsTab
                theme={theme}
                setTheme={setTheme}
                uiMode={uiMode}
                setUiMode={setUiMode}
                soundEnabled={soundEnabled}
                setSoundEnabled={setSoundEnabled}
                appOptions={appOptions}
                onOptionChange={updateAppOption}
                socialProfile={socialProfile}
                onProfileChange={updateSocialProfile}
                onProfileVisibilityChange={async (visibility) => {
                  const result = await setSocialProfileVisibility(visibility);
                  showToast(result.message);
                }}
                onExportBackup={exportCheckpointBackup}
                onImportBackup={importCheckpointBackup}
                onResetOptions={resetAppOptions}
                games={games}
                onRepairGameData={repairGameDataIntegrity}
              />

              <AdminPanel events={gamingEvents} onImportNews={importNewsFromRSS} />
            </>
          )}

          
        </div>
        <SearchGameDetailModal
          game={selectedSearchGame}
          onClose={() => setSelectedSearchGame(null)}
          onWishlist={addGameToFirebase}
          onCollection={addGameToFirebase}
        />
      </div>

      <LiveMiniPlayer
          live={miniPlayerLive}
          collapsed={miniPlayerCollapsed}
          setCollapsed={setMiniPlayerCollapsed}
          onClose={() => setMiniPlayerLive(null)}
        /> 

        {pixelTransition && (
          <div className={`pixel-transition ${pixelTransition}`}>
            {pixelTransitionParticles.map((particle) => (
              <span
                key={particle.id}
                style={{
                  "--x": particle.x,
                  "--y": particle.y,
                  "--delay": particle.delay,
                  "--size": particle.size,
                }}
              />
            ))}
          </div>
        )}


      {!showSplash && (

        <BottomTabs 
        activeTab={activeTab} 
        setActiveTab={changeTab}
        soundStyle={soundStyle}
      />
      )}

      <GameDetailModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        onDelete={deleteGame}
        onSetStatus={setStatus}
        onSetRating={setRating}
        onToggleFavorite={toggleFavorite}
        onSetDifficulty={setDifficulty}
        onSetReview={setReview}
        onSetOstInfo={setOstInfo}
        onSetDetailedRating={setDetailedRating}
        onToggleCompleted={toggleCompleted}
        onSetProgressStatus={setProgressStatus}
        onSetPlaytimeRange={setPlaytimeRange}
        onSetPlayedPlatforms={setPlayedPlatforms}
        onSetDLCs={setDLCs}
        onAddGame={addGameToFirebase}
        games={games}
        onNavigateGame={navigateSelectedGame}
        canGoPrevious={canGoPreviousGame}
        canGoNext={canGoNextGame}
      />
    </>
  );
}
