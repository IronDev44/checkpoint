export const CHECKPOINT_LEVELS = [25, 50, 75, 100];

export const CHECKPOINT_TRIALS = [
  {
    level: 25,
    title: "Premier Seuil",
    guardian: "Le Gardien du Signal",
    rewardRank: "Éclaireur du Nexus",
    reward: {
      badgeId: "trial_seal_25",
      badgeName: "Sceau du Signal",
      badgeIcon: "25",
      rarity: "epic",
      title: "Badge exclusif",
      description: "Premier sceau de la Salle des Epreuves.",
      accent: "#67e8f9",
    },
    intro:
      "Tu as accumulé assez d'XP pour atteindre ton premier vrai cap. Le rang ne s'ouvre qu'à ceux qui gardent leur sang-froid.",
    passScore: 3,
    questions: [
      {
        id: "cp25-q1",
        prompt: "Quel studio est historiquement associé à la création de The Legend of Zelda ?",
        answers: ["Nintendo EAD", "Naughty Dog", "BioWare", "Bungie"],
        correctIndex: 0,
      },
      {
        id: "cp25-q2",
        prompt: "Dans quel genre classe-t-on généralement Street Fighter ?",
        answers: ["Jeu de combat", "RPG tactique", "Survival horror", "Simulation"],
        correctIndex: 0,
      },
      {
        id: "cp25-q3",
        prompt: "Quelle console a popularisé les cartouches Game Boy Advance ?",
        answers: ["Game Boy Advance", "Nintendo DS", "PlayStation Portable", "Neo Geo Pocket"],
        correctIndex: 0,
      },
      {
        id: "cp25-q4",
        prompt: "Dans un jeu, que désigne le terme HUD ?",
        answers: ["L'interface affichée à l'écran", "Le moteur physique", "La bande-son dynamique", "Le mode multijoueur"],
        correctIndex: 0,
      },
    ],
  },
  {
    level: 50,
    title: "Chambre du Rang",
    guardian: "Le Gardien des Archives",
    rewardRank: "Légende I",
    reward: {
      badgeId: "trial_seal_50",
      badgeName: "Sceau des Archives",
      badgeIcon: "50",
      rarity: "legendary",
      title: "Badge exclusif",
      description: "Le sceau des joueurs qui ont franchi la Chambre du Rang.",
      accent: "#facc15",
    },
    intro:
      "La moitié du parcours est derrière toi. Cette épreuve vérifie ta culture, ta mémoire et ta lecture des licences.",
    passScore: 4,
    questions: [
      {
        id: "cp50-q1",
        prompt: "Quelle licence met en scène les Assassins et les Templiers à travers différentes époques ?",
        answers: ["Assassin's Creed", "Deus Ex", "Dishonored", "Hitman"],
        correctIndex: 0,
      },
      {
        id: "cp50-q2",
        prompt: "Quel jeu est connu pour la ville de Night City ?",
        answers: ["Cyberpunk 2077", "Watch Dogs", "Mirror's Edge", "The Ascent"],
        correctIndex: 0,
      },
      {
        id: "cp50-q3",
        prompt: "Quel terme désigne un jeu où la mort relance souvent une nouvelle tentative procédurale ?",
        answers: ["Roguelite", "Soulslike", "Metroidvania", "Visual novel"],
        correctIndex: 0,
      },
      {
        id: "cp50-q4",
        prompt: "Quelle série est associée au personnage Solid Snake ?",
        answers: ["Metal Gear", "Splinter Cell", "Syphon Filter", "Ghost Recon"],
        correctIndex: 0,
      },
      {
        id: "cp50-q5",
        prompt: "Dans les jeux vidéo, que mesure souvent le framerate ?",
        answers: ["Le nombre d'images par seconde", "La résolution des textures", "La durée de chargement", "La latence réseau uniquement"],
        correctIndex: 0,
      },
    ],
  },
  {
    level: 75,
    title: "Noyau des Maîtres",
    guardian: "Le Gardien du Core",
    rewardRank: "Architecte du Checkpoint",
    reward: {
      badgeId: "trial_seal_75",
      badgeName: "Sceau du Core",
      badgeIcon: "75",
      rarity: "mythic",
      title: "Badge exclusif",
      description: "Un sceau rare pour les profils qui maitrisent leur univers.",
      accent: "#c084fc",
    },
    intro:
      "Ici, les réponses faciles ne suffisent plus. Le checkpoint juge ta capacité à relier mécanique, plateforme et héritage.",
    passScore: 4,
    questions: [
      {
        id: "cp75-q1",
        prompt: "Quelle mécanique est centrale dans un metroidvania ?",
        answers: ["Revenir dans d'anciennes zones avec de nouveaux pouvoirs", "Gérer une équipe sportive", "Construire une ville", "Résoudre uniquement des dialogues"],
        correctIndex: 0,
      },
      {
        id: "cp75-q2",
        prompt: "Quelle série est souvent citée comme référence moderne du jeu exigeant et punitif ?",
        answers: ["Dark Souls", "Forza Horizon", "Animal Crossing", "Just Dance"],
        correctIndex: 0,
      },
      {
        id: "cp75-q3",
        prompt: "Quel constructeur est associé à la Dreamcast ?",
        answers: ["Sega", "Sony", "Microsoft", "Atari"],
        correctIndex: 0,
      },
      {
        id: "cp75-q4",
        prompt: "Quel élément différencie surtout un remake d'un remaster ?",
        answers: ["Un remake reconstruit largement le jeu", "Un remake change seulement la boîte", "Un remake retire toujours le gameplay", "Un remake est forcément multijoueur"],
        correctIndex: 0,
      },
      {
        id: "cp75-q5",
        prompt: "Quelle licence est liée à Rapture et Columbia ?",
        answers: ["BioShock", "Fallout", "Prey", "Half-Life"],
        correctIndex: 0,
      },
    ],
  },
  {
    level: 100,
    title: "Porte Suprême",
    guardian: "Le Gardien du Dernier Rang",
    rewardRank: "Suprême",
    reward: {
      badgeId: "trial_seal_100",
      badgeName: "Sceau Supreme",
      badgeIcon: "100",
      rarity: "creator",
      title: "Badge exclusif",
      description: "Le sceau ultime de la premiere saison des Epreuves.",
      accent: "#f97316",
    },
    intro:
      "Dernier seuil actuel. Cette épreuve valide ton statut au sommet de Checkpoint.",
    passScore: 5,
    questions: [
      {
        id: "cp100-q1",
        prompt: "Quelle licence est historiquement associée à Hideo Kojima ?",
        answers: ["Metal Gear", "Mass Effect", "Halo", "Far Cry"],
        correctIndex: 0,
      },
      {
        id: "cp100-q2",
        prompt: "Quel type de jeu met souvent l'accent sur loot, builds et progression de personnage ?",
        answers: ["Action-RPG", "Jeu de rythme", "Party game", "Visual novel"],
        correctIndex: 0,
      },
      {
        id: "cp100-q3",
        prompt: "Quel jeu a fortement popularisé le battle royale auprès du grand public ?",
        answers: ["Fortnite", "Portal", "Gran Turismo", "Celeste"],
        correctIndex: 0,
      },
      {
        id: "cp100-q4",
        prompt: "Quelle série est liée à Geralt de Riv ?",
        answers: ["The Witcher", "Dragon Age", "Elder Scrolls", "Kingdom Come"],
        correctIndex: 0,
      },
      {
        id: "cp100-q5",
        prompt: "Que désigne généralement l'input lag ?",
        answers: ["Le délai entre une action et sa réponse à l'écran", "La taille du disque dur", "Le nombre de trophées", "La résolution native"],
        correctIndex: 0,
      },
      {
        id: "cp100-q6",
        prompt: "Quelle console a introduit les succès Xbox à grande échelle ?",
        answers: ["Xbox 360", "Xbox One", "Xbox Series X", "Xbox originale"],
        correctIndex: 0,
      },
    ],
  },
];

export function getCheckpointTrial(level) {
  return CHECKPOINT_TRIALS.find((trial) => trial.level === Number(level)) || null;
}

export function getCheckpointRewardBadges(progress = {}) {
  const completed = progress.completed || {};

  return CHECKPOINT_TRIALS
    .filter((trial) => completed[String(trial.level)] && trial.reward)
    .map((trial) => ({
      id: trial.reward.badgeId,
      icon: trial.reward.badgeIcon,
      name: trial.reward.badgeName,
      desc: trial.reward.description,
      rarity: trial.reward.rarity || "legendary",
      special: "trial",
      checkpointLevel: trial.level,
      accent: trial.reward.accent,
      unlocked: true,
    }));
}
