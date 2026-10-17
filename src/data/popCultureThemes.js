export const POP_CULTURE_THEMES = [
  { id: "theme-tron", label: "Tron · 1982", chrome: "#060719", universe: "TRON · 1982", subtitle: "De l’autre côté de l’écran.", motif: "original" },
  { id: "theme-tronlegacy", label: "Tron : L’Héritage", chrome: "#020b10", universe: "TRON : L’HÉRITAGE", subtitle: "Bienvenue sur la Grille.", motif: "legacy" },
  { id: "theme-future", label: "Retour vers le futur", chrome: "#180e0a", universe: "RETOUR VERS LE FUTUR", subtitle: "La suite de ton histoire t’attend.", motif: "future", sceneTitle: "LE TEMPS DÉRAILLE" },
  { id: "theme-jurassic", label: "Jurassic Park", chrome: "#0c120b", universe: "JURASSIC PARK", subtitle: "Une collection pleine de découvertes.", motif: "jurassic", sceneTitle: "RÉSERVE DES ORIGINES" },
];
export const getPopCultureTheme = id => POP_CULTURE_THEMES.find(theme => theme.id === id);
