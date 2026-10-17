import { MORE_GAME_THEMES } from "./moreGameThemes";

export const GAME_UNIVERSE_THEMES = [
  { id:"theme-elden", label:"Elden Ring", chrome:"#14130c", motif:"elden", universe:"ELDEN RING", kicker:"LA GRÂCE T’ACCOMPAGNE", subtitle:"Ton prochain voyage commence ici.", transition:"GUIDÉ PAR LA GRÂCE" },
  { id:"theme-halo", label:"Halo", chrome:"#0d1718", motif:"halo", sceneTitle: "ORBITES LOINTAINES", universe:"HALO", kicker:"AU-DELÀ DE L’HORIZON", subtitle:"Un nouvel horizon pour ta collection.", transition:"RELAIS ORBITAL" },
  { id:"theme-bioshock", label:"BioShock · Rapture", chrome:"#061d22", motif:"bioshock", universe:"BIOSHOCK · RAPTURE", kicker:"UNE CITÉ SOUS L’OCÉAN", subtitle:"Tes découvertes ont toute leur place ici.", transition:"DESCENTE VERS RAPTURE" },
  { id:"theme-portal", label:"Portal", chrome:"#161c23", motif:"portal", sceneTitle: "LABORATOIRE DES PASSAGES", universe:"PORTAL", kicker:"LE PROCHAIN TEST T’ATTEND", subtitle:"Entre deux portails, retrouve tes jeux.", transition:"PASSAGE INTERDIMENSIONNEL" },
  { id:"theme-godwar", label:"God of War · Nordique", chrome:"#111e26", motif:"godwar", sceneTitle: "LES BRUMES DU NORD", universe:"GOD OF WAR", kicker:"EN ROUTE POUR MIDGARD", subtitle:"Chaque aventure laisse une trace.", transition:"LE GIVRE S’ÉVEILLE" },
  { id:"theme-crossing", label:"Animal Crossing · Soir d’été", chrome:"#17332e", motif:"crossing", universe:"ANIMAL CROSSING", kicker:"UN MOMENT SUR TON ÎLE", subtitle:"Installe-toi, tes jeux peuvent attendre.", transition:"BIENVENUE SUR TON ÎLE" },
  ...MORE_GAME_THEMES,
];
export const getGameUniverseTheme = id => GAME_UNIVERSE_THEMES.find(theme => theme.id === id);
