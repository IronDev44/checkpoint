export type RootTab = "home" | "library" | "social" | "top" | "profile";

export type GameStatus =
  | "collection"
  | "completed"
  | "playing"
  | "wishlist"
  | "backlog"
  | string;

export type GameDocument = {
  id: string;
  name?: string;
  title?: string;
  status?: GameStatus;
  completed?: boolean;
  favorite?: boolean;
  rating?: number;
  platform?: string;
  platforms?: string[];
};

export type HardwareDocument = {
  id: string;
  name?: string;
  type?: string;
  status?: string;
};

export type DashboardSnapshot = {
  totalGames: number;
  completedGames: number;
  activeGames: number;
  favoriteGames: number;
  hardwareCount: number;
  averageRating: number | null;
  recentGames: GameDocument[];
};
