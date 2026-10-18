import { WEEKLY_QUIZ_ADDITIONS } from "./weeklyQuizExpansion";

export const WEEKLY_QUIZ_XP = { correct: 120, streakBonus: 30, participation: 20 };

// Retained questions were reviewed; duplicates, ambiguous prompts and unrelated
// joke alternatives have been removed. Keep IDs stable for existing history.
const REVIEWED_QUESTIONS = [
  {
    "id": "zelda-master-sword",
    "category": "Nintendo",
    "difficulty": "facile",
    "question": "Dans quelle série trouve-t-on l'épée de légende appelée Master Sword ?",
    "answers": [
      "The Legend of Zelda",
      "Final Fantasy",
      "Fire Emblem",
      "Dragon Quest"
    ],
    "correctIndex": 0,
    "explanation": "La Master Sword est l'arme emblématique de Link dans The Legend of Zelda."
  },
  {
    "id": "halo-hero",
    "category": "Xbox",
    "difficulty": "facile",
    "question": "Quel est le héros principal de la série Halo ?",
    "answers": [
      "Marcus Fenix",
      "Master Chief",
      "Doom Slayer",
      "Sam Fisher"
    ],
    "correctIndex": 1,
    "explanation": "Master Chief est le Spartan au centre de la saga Halo."
  },
  {
    "id": "god-of-war-kratos",
    "category": "PlayStation",
    "difficulty": "facile",
    "question": "Quel personnage est le héros de God of War ?",
    "answers": [
      "Dante",
      "Kratos",
      "Aloy",
      "Nathan Drake"
    ],
    "correctIndex": 1,
    "explanation": "Kratos est le protagoniste historique de God of War."
  },
  {
    "id": "pokemon-pikachu-type",
    "category": "Nintendo",
    "difficulty": "facile",
    "question": "Quel est le type principal de Pikachu ?",
    "answers": [
      "Feu",
      "Eau",
      "Électrik",
      "Plante"
    ],
    "correctIndex": 2,
    "explanation": "Pikachu est un Pokémon de type Électrik."
  },
  {
    "id": "portal-companion-cube",
    "category": "PC",
    "difficulty": "facile",
    "question": "Dans quel jeu trouve-t-on le Companion Cube ?",
    "answers": [
      "Half-Life 2",
      "Portal",
      "BioShock",
      "Prey"
    ],
    "correctIndex": 1,
    "explanation": "Le Companion Cube est l'un des objets cultes de Portal."
  },
  {
    "id": "metal-gear-snake",
    "category": "Culture gaming",
    "difficulty": "facile",
    "question": "Quel héros est associé à la série Metal Gear Solid ?",
    "answers": [
      "Solid Snake",
      "Leon Kennedy",
      "Cloud Strife",
      "Jin Kazama"
    ],
    "correctIndex": 0,
    "explanation": "Solid Snake est l'un des personnages majeurs de Metal Gear Solid."
  },
  {
    "id": "final-fantasy-vii-cloud",
    "category": "JRPG",
    "difficulty": "facile",
    "question": "Quel héros manie une immense épée dans Final Fantasy VII ?",
    "answers": [
      "Squall",
      "Cloud Strife",
      "Noctis",
      "Tidus"
    ],
    "correctIndex": 1,
    "explanation": "Cloud Strife est célèbre pour sa Buster Sword."
  },
  {
    "id": "dragon-quest-slime",
    "category": "JRPG",
    "difficulty": "facile",
    "question": "Quel monstre bleu en forme de goutte est emblématique de Dragon Quest ?",
    "answers": [
      "Chocobo",
      "Slime",
      "Moogle",
      "Cactuar"
    ],
    "correctIndex": 1,
    "explanation": "Le Slime est la mascotte la plus connue de Dragon Quest."
  },
  {
    "id": "street-fighter-hadouken",
    "category": "Combat",
    "difficulty": "facile",
    "question": "Quel projectile Ryu lance-t-il dans Street Fighter ?",
    "answers": [
      "Hadouken",
      "Sonic Boom",
      "Kikoken",
      "Tiger Shot"
    ],
    "correctIndex": 0,
    "explanation": "Le Hadouken est la boule d’énergie emblématique de Ryu et Ken."
  },
  {
    "id": "mortal-kombat-fatality",
    "category": "Combat",
    "difficulty": "facile",
    "question": "Quelle série est connue pour ses Fatalities ?",
    "answers": [
      "Tekken",
      "Virtua Fighter",
      "Mortal Kombat",
      "SoulCalibur"
    ],
    "correctIndex": 2,
    "explanation": "Les Fatalities sont l'une des signatures de Mortal Kombat."
  },
  {
    "id": "tekken-mishima",
    "category": "Combat",
    "difficulty": "moyen",
    "question": "Quelle famille est au cœur de nombreux conflits dans Tekken ?",
    "answers": [
      "Belmont",
      "Mishima",
      "Redfield",
      "Auditore"
    ],
    "correctIndex": 1,
    "explanation": "La famille Mishima structure une grande partie de l'histoire de Tekken."
  },
  {
    "id": "dreamcast-sega",
    "category": "SEGA",
    "difficulty": "moyen",
    "question": "Quelle console est la dernière machine de salon de SEGA ?",
    "answers": [
      "Saturn",
      "Mega Drive",
      "Dreamcast",
      "Master System"
    ],
    "correctIndex": 2,
    "explanation": "La Dreamcast est la dernière console de salon produite par SEGA."
  },
  {
    "id": "playstation-memory-card",
    "category": "PlayStation",
    "difficulty": "facile",
    "question": "Quel accessoire servait principalement à sauvegarder sur la première PlayStation ?",
    "answers": [
      "Memory Card",
      "VMU",
      "Expansion Pak",
      "Transfer Pak"
    ],
    "correctIndex": 0,
    "explanation": "La Memory Card PlayStation permettait de stocker les sauvegardes."
  },
  {
    "id": "n64-four-ports",
    "category": "Nintendo",
    "difficulty": "moyen",
    "question": "Combien de manettes peut-on brancher directement à une Nintendo 64 ?",
    "answers": [
      "Quatre",
      "Deux",
      "Trois",
      "Six"
    ],
    "correctIndex": 0,
    "explanation": "La Nintendo 64 dispose de quatre ports manette en façade."
  },
  {
    "id": "gamecube-mini-disc",
    "category": "Nintendo",
    "difficulty": "facile",
    "question": "Quelle console Nintendo utilise de petits disques optiques propriétaires ?",
    "answers": [
      "Wii",
      "GameCube",
      "PlayStation 2",
      "Dreamcast"
    ],
    "correctIndex": 1,
    "explanation": "La GameCube utilise des mini-disques optiques."
  },
  {
    "id": "xbox-duke",
    "category": "Xbox",
    "difficulty": "moyen",
    "question": "Quel surnom donne-t-on souvent à la grande manette de la première Xbox ?",
    "answers": [
      "Duke",
      "Elite",
      "Joy-Con",
      "WaveBird"
    ],
    "correctIndex": 0,
    "explanation": "La grande manette Xbox originale est souvent appelée The Duke."
  },
  {
    "id": "wavebird",
    "category": "Nintendo",
    "difficulty": "moyen",
    "question": "La WaveBird est une manette sans fil associée à quelle console ?",
    "answers": [
      "Dreamcast",
      "GameCube",
      "PlayStation 2",
      "Xbox 360"
    ],
    "correctIndex": 1,
    "explanation": "La WaveBird est la manette sans fil officielle de la GameCube."
  },
  {
    "id": "doom-id",
    "category": "FPS",
    "difficulty": "facile",
    "question": "Quel studio est historiquement associé à DOOM ?",
    "answers": [
      "id Software",
      "Valve",
      "Bungie",
      "Rare"
    ],
    "correctIndex": 0,
    "explanation": "id Software est le studio derrière DOOM."
  },
  {
    "id": "half-life-gordon",
    "category": "PC",
    "difficulty": "facile",
    "question": "Quel scientifique est le héros principal de Half-Life ?",
    "answers": [
      "Gordon Freeman",
      "Isaac Kleiner",
      "Eli Vance",
      "Wallace Breen"
    ],
    "correctIndex": 0,
    "explanation": "Gordon Freeman est le protagoniste de Half-Life."
  },
  {
    "id": "bioshock-rapture",
    "category": "Immersive sim",
    "difficulty": "facile",
    "question": "Dans quelle cité sous-marine se déroule BioShock ?",
    "answers": [
      "Columbia",
      "Rapture",
      "City 17",
      "Dunwall"
    ],
    "correctIndex": 1,
    "explanation": "Rapture est la ville sous-marine créée par Andrew Ryan."
  },
  {
    "id": "dishonored-dunwall",
    "category": "Immersive sim",
    "difficulty": "moyen",
    "question": "Dans quelle ville se déroule l’essentiel du premier Dishonored ?",
    "answers": [
      "Dunwall",
      "Rapture",
      "Novigrad",
      "Bowerstone"
    ],
    "correctIndex": 0,
    "explanation": "Dishonored se déroule notamment dans la ville de Dunwall."
  },
  {
    "id": "mass-effect-shepard",
    "category": "RPG",
    "difficulty": "facile",
    "question": "Quel commandant est au centre de la trilogie Mass Effect ?",
    "answers": [
      "Shepard",
      "Anderson",
      "Hackett",
      "Ryder"
    ],
    "correctIndex": 0,
    "explanation": "Commander Shepard dirige l'équipage du Normandy."
  },
  {
    "id": "skyrim-dragonborn",
    "category": "RPG",
    "difficulty": "facile",
    "question": "Quel titre porte le héros de The Elder Scrolls V: Skyrim ?",
    "answers": [
      "Dragonborn",
      "Grey Warden",
      "Spectre",
      "Vault Hunter"
    ],
    "correctIndex": 0,
    "explanation": "Le héros de Skyrim est le Dovahkiin, ou Dragonborn."
  },
  {
    "id": "fallout-vault-boy-mascot",
    "category": "RPG",
    "difficulty": "facile",
    "question": "Quelle mascotte souriante représente souvent Fallout ?",
    "answers": [
      "Vault Boy",
      "Pip-Boy",
      "Big Daddy",
      "Mr. Saturn"
    ],
    "correctIndex": 0,
    "explanation": "Vault Boy est la mascotte iconique de Fallout."
  },
  {
    "id": "witcher-geralt",
    "category": "RPG",
    "difficulty": "facile",
    "question": "Quel sorceleur est le héros principal de The Witcher ?",
    "answers": [
      "Geralt de Riv",
      "Vesemir",
      "Eskel",
      "Dandelion"
    ],
    "correctIndex": 0,
    "explanation": "Geralt de Riv est le personnage central de The Witcher."
  },
  {
    "id": "elden-ring-fromsoftware",
    "category": "Action RPG",
    "difficulty": "facile",
    "question": "Quel studio a développé Elden Ring ?",
    "answers": [
      "FromSoftware",
      "Capcom",
      "Square Enix",
      "PlatinumGames"
    ],
    "correctIndex": 0,
    "explanation": "Elden Ring est développé par FromSoftware."
  },
  {
    "id": "bloodborne-city",
    "category": "Action RPG",
    "difficulty": "moyen",
    "question": "Dans quelle ville gothique se déroule Bloodborne ?",
    "answers": [
      "Yharnam",
      "Lordran",
      "Boletaria",
      "Ashina"
    ],
    "correctIndex": 0,
    "explanation": "Yharnam est la ville centrale de Bloodborne."
  },
  {
    "id": "uncharted-nathan",
    "category": "PlayStation",
    "difficulty": "facile",
    "question": "Quel aventurier est le héros de la série Uncharted ?",
    "answers": [
      "Nathan Drake",
      "Joel Miller",
      "Cole MacGrath",
      "Deacon St. John"
    ],
    "correctIndex": 0,
    "explanation": "Nathan Drake est le chasseur de trésors d'Uncharted."
  },
  {
    "id": "last-of-us-ellie-expanded",
    "category": "PlayStation",
    "difficulty": "facile",
    "question": "Quel personnage accompagne Joel dans The Last of Us ?",
    "answers": [
      "Ellie",
      "Aloy",
      "Ciri",
      "Chloe"
    ],
    "correctIndex": 0,
    "explanation": "Ellie accompagne Joel dans The Last of Us."
  },
  {
    "id": "horizon-aloy",
    "category": "PlayStation",
    "difficulty": "facile",
    "question": "Quelle héroïne chasse des machines dans Horizon ?",
    "answers": [
      "Aloy",
      "Samus",
      "Jill",
      "Lara"
    ],
    "correctIndex": 0,
    "explanation": "Aloy est l'héroïne de Horizon Zero Dawn et Forbidden West."
  },
  {
    "id": "metroid-samus",
    "category": "Nintendo",
    "difficulty": "facile",
    "question": "Quelle chasseuse de primes porte l'armure de Metroid ?",
    "answers": [
      "Samus Aran",
      "Bayonetta",
      "Jill Valentine",
      "Joanna Dark"
    ],
    "correctIndex": 0,
    "explanation": "Samus Aran est l'héroïne de Metroid."
  },
  {
    "id": "castlevania-belmont",
    "category": "Action",
    "difficulty": "moyen",
    "question": "Quelle famille affronte régulièrement Dracula dans Castlevania ?",
    "answers": [
      "Belmont",
      "Mishima",
      "Redfield",
      "Fenix"
    ],
    "correctIndex": 0,
    "explanation": "La famille Belmont est centrale dans de nombreux Castlevania."
  },
  {
    "id": "megaman-capcom",
    "category": "Capcom",
    "difficulty": "facile",
    "question": "Quel éditeur est associé à Mega Man ?",
    "answers": [
      "Capcom",
      "Konami",
      "Namco",
      "SEGA"
    ],
    "correctIndex": 0,
    "explanation": "Mega Man est une licence Capcom."
  },
  {
    "id": "monster-hunter",
    "category": "Capcom",
    "difficulty": "facile",
    "question": "Dans quelle série chasse-t-on Rathalos, Diablos ou Zinogre ?",
    "answers": [
      "Monster Hunter",
      "Dark Souls",
      "Turok",
      "Dragon's Dogma"
    ],
    "correctIndex": 0,
    "explanation": "Ces monstres appartiennent à la série Monster Hunter."
  },
  {
    "id": "devil-may-cry-dante",
    "category": "Action",
    "difficulty": "facile",
    "question": "Quel chasseur de démons porte souvent un manteau rouge dans Devil May Cry ?",
    "answers": [
      "Dante",
      "Nero",
      "Vergil",
      "Leon"
    ],
    "correctIndex": 0,
    "explanation": "Dante est le héros emblématique de Devil May Cry."
  },
  {
    "id": "bayonetta-umbra",
    "category": "Action",
    "difficulty": "moyen",
    "question": "Bayonetta appartient à quel clan de sorcières ?",
    "answers": [
      "Umbra",
      "Lumen",
      "Belmont",
      "Makai"
    ],
    "correctIndex": 0,
    "explanation": "Bayonetta est une sorcière de l'Umbra."
  },
  {
    "id": "kingdom-hearts-keyblade",
    "category": "Action RPG",
    "difficulty": "facile",
    "question": "Quelle arme utilise Sora dans Kingdom Hearts ?",
    "answers": [
      "La Keyblade",
      "La Gunblade",
      "La Buster Sword",
      "La Master Sword"
    ],
    "correctIndex": 0,
    "explanation": "Sora combat avec une Keyblade."
  },
  {
    "id": "persona-5-phantom",
    "category": "JRPG",
    "difficulty": "moyen",
    "question": "Comment s'appelle le groupe de héros de Persona 5 ?",
    "answers": [
      "Phantom Thieves",
      "SeeD",
      "Avalanche",
      "N7"
    ],
    "correctIndex": 0,
    "explanation": "Les héros de Persona 5 forment les Phantom Thieves."
  },
  {
    "id": "tomb-raider-lara",
    "category": "Aventure",
    "difficulty": "facile",
    "question": "Quelle archéologue est l'héroïne de Tomb Raider ?",
    "answers": [
      "Lara Croft",
      "Chloe Frazer",
      "Jill Valentine",
      "Alyx Vance"
    ],
    "correctIndex": 0,
    "explanation": "Lara Croft est l'héroïne de Tomb Raider."
  },
  {
    "id": "red-dead-john",
    "category": "Rockstar",
    "difficulty": "moyen",
    "question": "Quel personnage est le héros principal du premier Red Dead Redemption ?",
    "answers": [
      "John Marston",
      "Arthur Morgan",
      "Dutch van der Linde",
      "Jack Baker"
    ],
    "correctIndex": 0,
    "explanation": "John Marston est le protagoniste principal de Red Dead Redemption."
  },
  {
    "id": "gta-liberty-city",
    "category": "Rockstar",
    "difficulty": "facile",
    "question": "Quelle ville fictive de GTA est inspirée de New York ?",
    "answers": [
      "Liberty City",
      "Vice City",
      "Los Santos",
      "San Fierro"
    ],
    "correctIndex": 0,
    "explanation": "Liberty City est la grande ville inspirée de New York dans GTA."
  },
  {
    "id": "gta-vice-city",
    "category": "Rockstar",
    "difficulty": "facile",
    "question": "Quelle ville de GTA s'inspire fortement de Miami ?",
    "answers": [
      "Vice City",
      "Liberty City",
      "Los Santos",
      "Las Venturas"
    ],
    "correctIndex": 0,
    "explanation": "Vice City reprend l'ambiance colorée et criminelle de Miami."
  },
  {
    "id": "gran-turismo-polyphony",
    "category": "Course",
    "difficulty": "moyen",
    "question": "Quel studio développe historiquement Gran Turismo ?",
    "answers": [
      "Polyphony Digital",
      "Turn 10",
      "Criterion",
      "Codemasters"
    ],
    "correctIndex": 0,
    "explanation": "Gran Turismo est développé par Polyphony Digital."
  },
  {
    "id": "forza-turn10",
    "category": "Course",
    "difficulty": "moyen",
    "question": "Quel studio est associé à la série Forza Motorsport ?",
    "answers": [
      "Turn 10 Studios",
      "Playground Games",
      "Polyphony Digital",
      "Milestone"
    ],
    "correctIndex": 0,
    "explanation": "Forza Motorsport est développé par Turn 10 Studios."
  },
  {
    "id": "animal-crossing-tom-nook",
    "category": "Simulation",
    "difficulty": "facile",
    "question": "Quel tanuki est associé à Animal Crossing ?",
    "answers": [
      "Tom Nook",
      "K.K. Slider",
      "Resetti",
      "Blathers"
    ],
    "correctIndex": 0,
    "explanation": "Tom Nook est l'un des personnages emblématiques d'Animal Crossing."
  },
  {
    "id": "stardew-valley-creator",
    "category": "Indé",
    "difficulty": "moyen",
    "question": "Quel créateur solo est associé à Stardew Valley ?",
    "answers": [
      "ConcernedApe",
      "Toby Fox",
      "Jonathan Blow",
      "Lucas Pope"
    ],
    "correctIndex": 0,
    "explanation": "Stardew Valley a été créé par Eric Barone, connu sous le nom ConcernedApe."
  },
  {
    "id": "undertale-toby",
    "category": "Indé",
    "difficulty": "facile",
    "question": "Quel créateur est associé à Undertale ?",
    "answers": [
      "Toby Fox",
      "Phil Fish",
      "Edmund McMillen",
      "Davey Wreden"
    ],
    "correctIndex": 0,
    "explanation": "Undertale est créé par Toby Fox."
  },
  {
    "id": "hades-supergiant",
    "category": "Indé",
    "difficulty": "facile",
    "question": "Quel studio a développé Hades ?",
    "answers": [
      "Supergiant Games",
      "Team Cherry",
      "Motion Twin",
      "Klei"
    ],
    "correctIndex": 0,
    "explanation": "Hades est développé par Supergiant Games."
  },
  {
    "id": "hollow-knight-studio",
    "category": "Indé",
    "difficulty": "facile",
    "question": "Quel studio a développé Hollow Knight ?",
    "answers": [
      "Team Cherry",
      "Supergiant Games",
      "Subset Games",
      "Housemarque"
    ],
    "correctIndex": 0,
    "explanation": "Hollow Knight est développé par Team Cherry."
  },
  {
    "id": "celeste-mountain",
    "category": "Indé",
    "difficulty": "facile",
    "question": "Dans Celeste, que cherche principalement à gravir Madeline ?",
    "answers": [
      "Une montagne",
      "Une tour",
      "Un château",
      "Une station spatiale"
    ],
    "correctIndex": 0,
    "explanation": "Celeste raconte l'ascension d'une montagne par Madeline."
  },
  {
    "id": "cuphead-style",
    "category": "Indé",
    "difficulty": "facile",
    "question": "Cuphead est surtout connu pour son style inspiré de quoi ?",
    "answers": [
      "Dessins animés des années 1930",
      "Mangas cyberpunk",
      "Films noirs",
      "BD franco-belges"
    ],
    "correctIndex": 0,
    "explanation": "Cuphead reprend l'esthétique des cartoons des années 1930."
  },
  {
    "id": "tetris-shapes",
    "category": "Puzzle",
    "difficulty": "facile",
    "question": "Comment appelle-t-on les pièces de Tetris ?",
    "answers": [
      "Tétrominos",
      "Dominos",
      "Polybugs",
      "Hexacubes"
    ],
    "correctIndex": 0,
    "explanation": "Les pièces de Tetris sont des tétrominos."
  },
  {
    "id": "donkey-kong-jumpman",
    "category": "Arcade",
    "difficulty": "moyen",
    "question": "Quel nom portait Mario dans Donkey Kong à l'origine ?",
    "answers": [
      "Jumpman",
      "Mr. Video",
      "Carpenter",
      "Plumber Boy"
    ],
    "correctIndex": 0,
    "explanation": "Mario était d'abord appelé Jumpman dans Donkey Kong."
  },
  {
    "id": "sam-fisher-night-vision",
    "category": "Infiltration",
    "difficulty": "facile",
    "question": "Quel héros est associé aux lunettes de vision nocturne de Splinter Cell ?",
    "answers": [
      "Sam Fisher",
      "Solid Snake",
      "Agent 47",
      "Garrett"
    ],
    "correctIndex": 0,
    "explanation": "Sam Fisher est le protagoniste de Splinter Cell."
  },
  {
    "id": "dead-space-isaac",
    "category": "Survival horror",
    "difficulty": "facile",
    "question": "Quel ingénieur est le héros de Dead Space ?",
    "answers": [
      "Isaac Clarke",
      "Gordon Freeman",
      "Leon Kennedy",
      "Alan Wake"
    ],
    "correctIndex": 0,
    "explanation": "Isaac Clarke est le protagoniste principal de Dead Space."
  },
  {
    "id": "alan-wake-writer",
    "category": "Survival horror",
    "difficulty": "facile",
    "question": "Quelle profession exerce Alan Wake ?",
    "answers": [
      "Écrivain",
      "Policier",
      "Pilote",
      "Archéologue"
    ],
    "correctIndex": 0,
    "explanation": "Alan Wake est un écrivain au centre d'événements surnaturels."
  },
  {
    "id": "control-fbc",
    "category": "Action",
    "difficulty": "moyen",
    "question": "Dans Control, quelle organisation explore les phénomènes paranormaux ?",
    "answers": [
      "Fédéral Bureau of Control",
      "Black Mesa",
      "Aperture Science",
      "Umbrella"
    ],
    "correctIndex": 0,
    "explanation": "Le FBC est l'organisation centrale de Control."
  },
  {
    "id": "aperture-science",
    "category": "PC",
    "difficulty": "moyen",
    "question": "Quel laboratoire est au cœur de Portal ?",
    "answers": [
      "Aperture Science",
      "Black Mesa",
      "Shinra",
      "Abstergo"
    ],
    "correctIndex": 0,
    "explanation": "Portal se déroule dans les installations d'Aperture Science."
  },
  {
    "id": "black-mesa",
    "category": "PC",
    "difficulty": "facile",
    "question": "Quel complexe scientifique est lié à Half-Life ?",
    "answers": [
      "Black Mesa",
      "Aperture Science",
      "Raccoon Lab",
      "Shinra HQ"
    ],
    "correctIndex": 0,
    "explanation": "Black Mesa est le complexe scientifique du premier Half-Life."
  },
  {
    "id": "cyberpunk-night-city",
    "category": "RPG",
    "difficulty": "facile",
    "question": "Dans quelle ville se déroule Cyberpunk 2077 ?",
    "answers": [
      "Night City",
      "Vice City",
      "City 17",
      "Rapture"
    ],
    "correctIndex": 0,
    "explanation": "Cyberpunk 2077 se déroule principalement à Night City."
  },
  {
    "id": "ghost-of-tsushima-jin",
    "category": "Action aventure",
    "difficulty": "facile",
    "question": "Quel samouraï est le héros de Ghost of Tsushima ?",
    "answers": [
      "Jin Sakai",
      "Kazuma Kiryu",
      "Sekiro",
      "Ryu Hayabusa"
    ],
    "correctIndex": 0,
    "explanation": "Jin Sakai est le protagoniste de Ghost of Tsushima."
  },
  {
    "id": "yakuza-kiryu",
    "category": "Action aventure",
    "difficulty": "facile",
    "question": "Quel personnage est surnommé le Dragon de Dojima ?",
    "answers": [
      "Kazuma Kiryu",
      "Goro Majima",
      "Ichiban Kasuga",
      "Jin Sakai"
    ],
    "correctIndex": 0,
    "explanation": "Kazuma Kiryu est connu comme le Dragon de Dojima."
  },
  {
    "id": "death-stranding-sam",
    "category": "Action aventure",
    "difficulty": "facile",
    "question": "Quel livreur traverse l'Amérique dans Death Stranding ?",
    "answers": [
      "Sam Porter Bridges",
      "Cliff Unger",
      "Fragile",
      "Die-Hardman"
    ],
    "correctIndex": 0,
    "explanation": "Sam Porter Bridges est le protagoniste de Death Stranding."
  },
  {
    "id": "life-is-strange-max",
    "category": "Aventure narrative",
    "difficulty": "facile",
    "question": "Quel pouvoir possède Max dans Life is Strange ?",
    "answers": [
      "Remonter le temps",
      "Lire les pensées",
      "Se téléporter",
      "Contrôler le feu"
    ],
    "correctIndex": 0,
    "explanation": "Max peut remonter le temps dans Life is Strange."
  },
  {
    "id": "walking-dead-clementine",
    "category": "Aventure narrative",
    "difficulty": "facile",
    "question": "Quel personnage devient central dans The Walking Dead de Telltale ?",
    "answers": [
      "Clementine",
      "Ellie",
      "Alyx",
      "Jill"
    ],
    "correctIndex": 0,
    "explanation": "Clementine est l'un des personnages les plus importants de la série Telltale."
  },
  {
    "id": "rocket-league",
    "category": "Sport",
    "difficulty": "facile",
    "question": "Rocket League mélange principalement football et quoi ?",
    "answers": [
      "Voitures",
      "Avions",
      "Motos",
      "Robots géants"
    ],
    "correctIndex": 0,
    "explanation": "Rocket League oppose des voitures dans des matchs inspirés du football."
  },
  {
    "id": "tony-hawk",
    "category": "Sport",
    "difficulty": "facile",
    "question": "Quelle discipline est au cœur de Tony Hawk's Pro Skater ?",
    "answers": [
      "Skateboard",
      "Snowboard",
      "BMX",
      "Surf"
    ],
    "correctIndex": 0,
    "explanation": "Tony Hawk's Pro Skater est une série de jeux de skateboard."
  },
  {
    "id": "zelda-ocarina-platform",
    "category": "Nintendo",
    "difficulty": "moyen",
    "question": "Sur quelle console Ocarina of Time est-il sorti à l’origine ?",
    "answers": [
      "Nintendo 64",
      "GameCube",
      "Super Nintendo",
      "Wii"
    ],
    "correctIndex": 0,
    "explanation": "Ocarina of Time est sorti sur Nintendo 64 en 1998."
  },
  {
    "id": "zelda-breath-wild-system",
    "category": "Nintendo",
    "difficulty": "facile",
    "question": "Quel Zelda est sorti le même jour que la Nintendo Switch en 2017 ?",
    "answers": [
      "Breath of the Wild",
      "Skyward Sword",
      "Twilight Princess",
      "A Link Between Worlds"
    ],
    "correctIndex": 0,
    "explanation": "Breath of the Wild est sorti en meme temps que la Switch en 2017."
  },
  {
    "id": "pokemon-first-gen-starters",
    "category": "Nintendo",
    "difficulty": "facile",
    "question": "Quels sont les trois Pokémon de départ proposés par le professeur Chen dans Pokémon Rouge et Bleu ?",
    "answers": [
      "Bulbizarre, Salamèche, Carapuce",
      "Germignon, Héricendre, Kaiminus",
      "Arcko, Poussifeu, Gobou",
      "Tortipouss, Ouisticram, Tiplouf"
    ],
    "correctIndex": 0,
    "explanation": "Bulbizarre, Salamèche et Carapuce sont les starters de Rouge/Bleu/Jaune."
  },
  {
    "id": "smash-bros-creator",
    "category": "Nintendo",
    "difficulty": "moyen",
    "question": "Quel créateur est fortement associé à Super Smash Bros. ?",
    "answers": [
      "Masahiro Sakurai",
      "Hideo Kojima",
      "Shinji Mikami",
      "Yu Suzuki"
    ],
    "correctIndex": 0,
    "explanation": "Masahiro Sakurai est le créateur et visage historique de Smash Bros."
  },
  {
    "id": "god-of-war-2018-setting",
    "category": "PlayStation",
    "difficulty": "facile",
    "question": "Quelle mythologie est au centre de God of War 2018 ?",
    "answers": [
      "Nordique",
      "Égyptienne",
      "Japonaise",
      "Aztèque"
    ],
    "correctIndex": 0,
    "explanation": "God of War 2018 deplace Kratos vers la mythologie nordique."
  },
  {
    "id": "steam-deck-company",
    "category": "PC",
    "difficulty": "facile",
    "question": "Quelle entreprise fabrique le Steam Deck ?",
    "answers": [
      "Valve",
      "Asus",
      "Lenovo",
      "Razer"
    ],
    "correctIndex": 0,
    "explanation": "Le Steam Deck est la console PC portable de Valve."
  },
  {
    "id": "counter-strike-origin",
    "category": "PC",
    "difficulty": "moyen",
    "question": "Counter-Strike était à l’origine un mod de quel jeu ?",
    "answers": [
      "Half-Life",
      "Quake",
      "Doom",
      "Unreal Tournament"
    ],
    "correctIndex": 0,
    "explanation": "Counter-Strike a commencé comme mod de Half-Life avant de devenir une série majeure."
  },
  {
    "id": "dota-acronym",
    "category": "PC",
    "difficulty": "moyen",
    "question": "Dota vient de l'expression Defense of the...",
    "answers": [
      "Ancients",
      "Arena",
      "Abyss",
      "Alliance"
    ],
    "correctIndex": 0,
    "explanation": "Dota signifie Defense of the Ancients."
  },
  {
    "id": "world-of-warcraft-faction",
    "category": "PC",
    "difficulty": "facile",
    "question": "Dans World of Warcraft, quelle faction s'oppose historiquement à l'Alliance ?",
    "answers": [
      "La Horde",
      "Le Fléau",
      "La Légion ardente",
      "Le Marteau du crépuscule"
    ],
    "correctIndex": 0,
    "explanation": "Alliance et Horde sont les deux grandes factions historiques de WoW."
  },
  {
    "id": "starcraft-races",
    "category": "Strategie",
    "difficulty": "moyen",
    "question": "Quel groupe n’est pas l’un des trois camps jouables du premier StarCraft ?",
    "answers": [
      "Covenant",
      "Terrans",
      "Zergs",
      "Protoss"
    ],
    "correctIndex": 0,
    "explanation": "StarCraft oppose Terrans, Zergs et Protoss."
  },
  {
    "id": "final-fantasy-vii-villain",
    "category": "RPG",
    "difficulty": "facile",
    "question": "Quel antagoniste est emblématique de Final Fantasy VII ?",
    "answers": [
      "Sephiroth",
      "Kefka",
      "Sin",
      "Ardyn"
    ],
    "correctIndex": 0,
    "explanation": "Sephiroth est l'un des mechants les plus connus du jeu video."
  },
  {
    "id": "baldurs-gate-rules",
    "category": "RPG",
    "difficulty": "moyen",
    "question": "De quel jeu de rôle sur table Baldur’s Gate reprend-il l’univers et les règles ?",
    "answers": [
      "Donjons & Dragons",
      "Warhammer Fantasy",
      "Shadowrun",
      "L’Œil noir"
    ],
    "correctIndex": 0,
    "explanation": "Baldur's Gate prend place dans les Royaumes Oublies de Donjons & Dragons."
  },
  {
    "id": "elden-ring-author",
    "category": "RPG",
    "difficulty": "moyen",
    "question": "Quel auteur a collaboré à la mythologie d'Elden Ring ?",
    "answers": [
      "George R. R. Martin",
      "Stephen King",
      "Neil Gaiman",
      "Brandon Sanderson"
    ],
    "correctIndex": 0,
    "explanation": "George R. R. Martin a participé à la construction du monde d'Elden Ring."
  },
  {
    "id": "hollow-knight-kingdom",
    "category": "Indé",
    "difficulty": "moyen",
    "question": "Dans Hollow Knight, quel royaume explore-t-on principalement ?",
    "answers": [
      "Hallownest",
      "Hyrule",
      "Rapture",
      "Albion"
    ],
    "correctIndex": 0,
    "explanation": "Hallownest est le royaume souterrain de Hollow Knight."
  },
  {
    "id": "call-of-duty-zombies",
    "category": "FPS",
    "difficulty": "facile",
    "question": "Quel mode cooperatif populaire de Call of Duty met en scene des vagues de morts-vivants ?",
    "answers": [
      "Zombies",
      "Forge",
      "MyClub",
      "Ultimate Team"
    ],
    "correctIndex": 0,
    "explanation": "Le mode Zombies est devenu l'un des piliers de plusieurs Call of Duty."
  },
  {
    "id": "assassins-creed-animus",
    "category": "Aventure",
    "difficulty": "facile",
    "question": "Dans Assassin's Creed, quelle machine permet d'explorer les souvenirs genetiques ?",
    "answers": [
      "L'Animus",
      "Le Codec",
      "Le Normandy",
      "Le Pip-Boy"
    ],
    "correctIndex": 0,
    "explanation": "L'Animus permet de revivre les souvenirs d'ancetres."
  },
  {
    "id": "red-dead-2-hero",
    "category": "Aventure",
    "difficulty": "facile",
    "question": "Qui est le protagoniste principal de Red Dead Redemption 2 ?",
    "answers": [
      "Arthur Morgan",
      "John Marston",
      "Dutch van der Linde",
      "Jack Marston"
    ],
    "correctIndex": 0,
    "explanation": "Arthur Morgan est le personnage principal de Red Dead Redemption 2."
  },
  {
    "id": "gta-v-three",
    "category": "Aventure",
    "difficulty": "facile",
    "question": "GTA V permet de jouer principalement combien de protagonistes ?",
    "answers": [
      "Trois",
      "Un",
      "Deux",
      "Cinq"
    ],
    "correctIndex": 0,
    "explanation": "GTA V alterne entre Michael, Franklin et Trevor."
  },
  {
    "id": "dragon-age-grey-wardens",
    "category": "RPG",
    "difficulty": "moyen",
    "question": "Dans Dragon Age: Origins, quel ordre combat l'Enclin ?",
    "answers": [
      "Les Templiers",
      "Les Gardes des ombres",
      "Les Spectres",
      "Les Lames"
    ],
    "correctIndex": 1,
    "explanation": "Les Gardes des ombres sont l'ordre charge de combattre l'Enclin."
  },
  {
    "id": "fallout-new-vegas-studio",
    "category": "RPG",
    "difficulty": "moyen",
    "question": "Quel studio a développé Fallout: New Vegas ?",
    "answers": [
      "Bethesda Game Studios",
      "Obsidian Entertainment",
      "BioWare",
      "Arkane Studios"
    ],
    "correctIndex": 1,
    "explanation": "Fallout: New Vegas a été développé par Obsidian Entertainment."
  },
  {
    "id": "prey-2017-station",
    "category": "Immersive sim",
    "difficulty": "difficile",
    "question": "Comment s'appelle la station spatiale principale de Prey 2017 ?",
    "answers": [
      "Talos I",
      "Sevastopol",
      "Citadel",
      "Nexus"
    ],
    "correctIndex": 0,
    "explanation": "Prey 2017 se déroule sur la station Talos I."
  },
  {
    "id": "thief-protagonist",
    "category": "Infiltration",
    "difficulty": "moyen",
    "question": "Quel voleur est le protagoniste de la série Thief ?",
    "answers": [
      "Garrett",
      "Corvo",
      "Ezio",
      "Sam Fisher"
    ],
    "correctIndex": 0,
    "explanation": "Garrett est le maitre voleur de la série Thief."
  },
  {
    "id": "ico-companion",
    "category": "Aventure",
    "difficulty": "difficile",
    "question": "Dans Ico, comment s'appelle la jeune fille que le joueur accompagne ?",
    "answers": [
      "Yorda",
      "Agro",
      "Mono",
      "Kairi"
    ],
    "correctIndex": 0,
    "explanation": "Yorda est la compagne que le joueur protege dans Ico."
  },
  {
    "id": "shadow-colossus-horse",
    "category": "Aventure",
    "difficulty": "moyen",
    "question": "Comment s’appelle le cheval de Wander dans Shadow of the Colossus ?",
    "answers": [
      "Agro",
      "Epona",
      "Ablette",
      "Buell"
    ],
    "correctIndex": 0,
    "explanation": "Agro est le cheval fidele de Wander."
  },
  {
    "id": "okami-brush",
    "category": "Aventure",
    "difficulty": "moyen",
    "question": "Dans Okami, quel outil permet d'interagir avec le monde ?",
    "answers": [
      "Le pinceau céleste",
      "La flute du temps",
      "Le grappin",
      "Le gant magnetique"
    ],
    "correctIndex": 0,
    "explanation": "Le pinceau céleste est la mecanique centrale d'Okami."
  },
  {
    "id": "psychonauts-raz",
    "category": "Plateforme",
    "difficulty": "moyen",
    "question": "Quel est le surnom du héros de Psychonauts ?",
    "answers": [
      "Raz",
      "Jak",
      "Sly",
      "Banjo"
    ],
    "correctIndex": 0,
    "explanation": "Razputin Aquato, surnomme Raz, est le héros de Psychonauts."
  },
  {
    "id": "banjo-kazooie-dev",
    "category": "Plateforme",
    "difficulty": "moyen",
    "question": "Quel studio a développé Banjo-Kazooie ?",
    "answers": [
      "Rare",
      "Insomniac",
      "Naughty Dog",
      "HAL Laboratory"
    ],
    "correctIndex": 0,
    "explanation": "Banjo-Kazooie est un jeu Rare sorti sur Nintendo 64."
  },
  {
    "id": "crash-bandicoot-dev",
    "category": "Plateforme",
    "difficulty": "moyen",
    "question": "Quel studio a créé les premiers Crash Bandicoot ?",
    "answers": [
      "Naughty Dog",
      "Sucker Punch",
      "Rare",
      "Traveller's Tales"
    ],
    "correctIndex": 0,
    "explanation": "Les premiers Crash Bandicoot ont été développés par Naughty Dog."
  },
  {
    "id": "spyro-dev",
    "category": "Plateforme",
    "difficulty": "moyen",
    "question": "Quel studio a créé les premiers Spyro the Dragon ?",
    "answers": [
      "Insomniac Games",
      "Naughty Dog",
      "Rare",
      "Media Molecule"
    ],
    "correctIndex": 0,
    "explanation": "Spyro the Dragon est une creation d'Insomniac Games."
  },
  {
    "id": "sly-cooper-studio",
    "category": "Plateforme",
    "difficulty": "moyen",
    "question": "Quel studio a créé Sly Cooper ?",
    "answers": [
      "Sucker Punch",
      "Insomniac",
      "Bend Studio",
      "Housemarque"
    ],
    "correctIndex": 0,
    "explanation": "Sly Cooper a été créé par Sucker Punch."
  },
  {
    "id": "returnal-studio",
    "category": "Action",
    "difficulty": "moyen",
    "question": "Quel studio a développé Returnal ?",
    "answers": [
      "Housemarque",
      "Bluepoint",
      "Bungie",
      "Remedy"
    ],
    "correctIndex": 0,
    "explanation": "Returnal est développé par Housemarque."
  },
  {
    "id": "control-oldest-house",
    "category": "Action",
    "difficulty": "moyen",
    "question": "Dans Control, quel bâtiment abrite le Bureau fédéral de contrôle ?",
    "answers": [
      "The Oldest House",
      "The Citadel",
      "The Black Lodge",
      "The Spire"
    ],
    "correctIndex": 0,
    "explanation": "The Oldest House est le lieu central de Control."
  },
  {
    "id": "vanquish-studio",
    "category": "Action",
    "difficulty": "difficile",
    "question": "Quel studio a développé Vanquish ?",
    "answers": [
      "PlatinumGames",
      "Grasshopper Manufacture",
      "Team Ninja",
      "Treasure"
    ],
    "correctIndex": 0,
    "explanation": "Vanquish est un TPS nerveux développé par PlatinumGames."
  },
  {
    "id": "ninja-gaiden-ryu",
    "category": "Action",
    "difficulty": "moyen",
    "question": "Quel ninja est le protagoniste principal de Ninja Gaiden ?",
    "answers": [
      "Ryu Hayabusa",
      "Ryu Hoshi",
      "Hanzo Hasashi",
      "Joe Musashi"
    ],
    "correctIndex": 0,
    "explanation": "Ryu Hayabusa est le héros de Ninja Gaiden."
  },
  {
    "id": "castlevania-sotn-hero",
    "category": "Metroidvania",
    "difficulty": "moyen",
    "question": "Qui est le protagoniste de Castlevania: Symphony of the Night ?",
    "answers": [
      "Alucard",
      "Simon Belmont",
      "Richter Belmont",
      "Gabriel Belmont"
    ],
    "correctIndex": 0,
    "explanation": "Alucard est le personnage jouable principal de Symphony of the Night."
  },
  {
    "id": "into-the-breach-studio",
    "category": "Tactique",
    "difficulty": "difficile",
    "question": "Quel studio a développé Into the Breach ?",
    "answers": [
      "Subset Games",
      "Klei",
      "Supergiant Games",
      "Motion Twin"
    ],
    "correctIndex": 0,
    "explanation": "Into the Breach a été développé par Subset Games, le studio de FTL."
  },
  {
    "id": "papers-please-country",
    "category": "Indé",
    "difficulty": "moyen",
    "question": "Dans Papers, Please, le joueur travaille pour quel pays fictif ?",
    "answers": [
      "Arstotzka",
      "Kolechia",
      "Obristan",
      "Antegria"
    ],
    "correctIndex": 0,
    "explanation": "Le joueur est inspecteur frontalier pour Arstotzka."
  },
  {
    "id": "obra-dinn-device",
    "category": "Enquête",
    "difficulty": "difficile",
    "question": "Quel objet permet de découvrir les derniers instants des morts dans Return of the Obra Dinn ?",
    "answers": [
      "Une montre de poche",
      "Une longue-vue",
      "Un journal de bord",
      "Une boussole"
    ],
    "correctIndex": 0,
    "explanation": "La montre Memento Mortem permet d'observer les moments du décès."
  },
  {
    "id": "disco-elysium-city",
    "category": "RPG",
    "difficulty": "difficile",
    "question": "Dans quelle ville se trouve Martinaise, le quartier où se déroule Disco Elysium ?",
    "answers": [
      "Revachol",
      "Novigrad",
      "Sigil",
      "Whiterun"
    ],
    "correctIndex": 0,
    "explanation": "Disco Elysium se déroule à Revachol, notamment dans le quartier de Martinaise."
  },
  {
    "id": "quake-engine",
    "category": "FPS",
    "difficulty": "difficile",
    "question": "Quel studio a développé Quake ?",
    "answers": [
      "id Software",
      "Valve",
      "Bungie",
      "Raven Software"
    ],
    "correctIndex": 0,
    "explanation": "Quake a été développé par id Software."
  },
  {
    "id": "system-shock-ai",
    "category": "Immersive sim",
    "difficulty": "moyen",
    "question": "Quelle IA antagoniste est célèbre dans System Shock ?",
    "answers": [
      "SHODAN",
      "GLaDOS",
      "Cortana",
      "EDI"
    ],
    "correctIndex": 0,
    "explanation": "SHODAN est l'IA antagoniste iconique de System Shock."
  },
  {
    "id": "portal-ai",
    "category": "Puzzle",
    "difficulty": "facile",
    "question": "Quelle IA guide et manipule le joueur dans Portal ?",
    "answers": [
      "GLaDOS",
      "SHODAN",
      "Cortana",
      "Mother Brain"
    ],
    "correctIndex": 0,
    "explanation": "GLaDOS est l'IA centrale de Portal."
  },
  {
    "id": "metal-gear-la-li-lu-le-lo",
    "category": "Infiltration",
    "difficulty": "difficile",
    "question": "Dans Metal Gear Solid 2, quelle expression est liée aux Patriots ?",
    "answers": [
      "La-li-lu-le-lo",
      "Fox Die",
      "Outer Heaven",
      "Diamond Dogs"
    ],
    "correctIndex": 0,
    "explanation": "La-li-lu-le-lo est une expression associée au contrôle des Patriots."
  },
  {
    "id": "dreamcast-memory-card",
    "category": "Hardware",
    "difficulty": "moyen",
    "question": "Comment s'appelait la carte mémoire avec écran de la Dreamcast ?",
    "answers": [
      "VMU",
      "PocketStation",
      "Memory Stick",
      "Expansion Pak"
    ],
    "correctIndex": 0,
    "explanation": "La VMU servait de carte mémoire et de mini-écran pour la Dreamcast."
  },
  {
    "id": "n64-expansion-pak",
    "category": "Hardware",
    "difficulty": "moyen",
    "question": "Quel accessoire Nintendo 64 ajoutait de la mémoire vive à la console ?",
    "answers": [
      "Expansion Pak",
      "Rumble Pak",
      "Transfer Pak",
      "Memory Card 251"
    ],
    "correctIndex": 0,
    "explanation": "L'Expansion Pak ajoutait de la RAM à la Nintendo 64."
  },
  {
    "id": "psp-disc",
    "category": "Hardware",
    "difficulty": "moyen",
    "question": "Quel format de disque la PSP utilise-t-elle pour ses jeux ?",
    "answers": [
      "UMD",
      "MiniDisc",
      "GD-ROM",
      "HuCard"
    ],
    "correctIndex": 0,
    "explanation": "Les jeux physiques de la PSP utilisent des UMD (Universal Media Disc)."
  },
  {
    "id": "arcade-jamma",
    "category": "Arcade",
    "difficulty": "difficile",
    "question": "Dans l'arcade, JAMMA désigne surtout...",
    "answers": [
      "Un standard de connectique",
      "Un genre de jeu",
      "Une marque de console",
      "Un moteur graphique"
    ],
    "correctIndex": 0,
    "explanation": "JAMMA est un standard de câblage/connectique pour bornes d'arcade."
  },
  {
    "id": "space-invaders-year",
    "category": "Arcade",
    "difficulty": "difficile",
    "question": "Space Invaders est sorti en...",
    "answers": [
      "1978",
      "1985",
      "1991",
      "2001"
    ],
    "correctIndex": 0,
    "explanation": "Space Invaders est sorti en 1978."
  }
];

export const WEEKLY_QUIZ_QUESTIONS = [...REVIEWED_QUESTIONS, ...WEEKLY_QUIZ_ADDITIONS];
