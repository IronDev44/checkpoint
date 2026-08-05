export const OFFICIAL_GOTY_AWARDS = [
  {
    seasonYear: 2025,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2025, winner: "Clair Obscur: Expedition 33" },
      { ceremony: "BAFTA Games Awards", awardYear: 2026, winner: "Clair Obscur: Expedition 33" },
      { ceremony: "D.I.C.E. Awards", awardYear: 2026, winner: "Clair Obscur: Expedition 33" },
    ],
  },
  {
    seasonYear: 2024,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2024, winner: "Astro Bot" },
      { ceremony: "BAFTA Games Awards", awardYear: 2025, winner: "Astro Bot" },
      { ceremony: "D.I.C.E. Awards", awardYear: 2025, winner: "Astro Bot" },
    ],
  },
  {
    seasonYear: 2023,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2023, winner: "Baldur's Gate 3" },
      { ceremony: "BAFTA Games Awards", awardYear: 2024, winner: "Baldur's Gate 3" },
      { ceremony: "D.I.C.E. Awards", awardYear: 2024, winner: "Baldur's Gate 3" },
    ],
  },
  {
    seasonYear: 2022,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2022, winner: "Elden Ring" },
      { ceremony: "BAFTA Games Awards", awardYear: 2023, winner: "Vampire Survivors" },
      { ceremony: "D.I.C.E. Awards", awardYear: 2023, winner: "Elden Ring" },
    ],
  },
  {
    seasonYear: 2021,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2021, winner: "It Takes Two" },
      { ceremony: "BAFTA Games Awards", awardYear: 2022, winner: "Returnal" },
      { ceremony: "D.I.C.E. Awards", awardYear: 2022, winner: "It Takes Two" },
    ],
  },
  {
    seasonYear: 2020,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2020, winner: "The Last of Us Part II" },
      { ceremony: "BAFTA Games Awards", awardYear: 2021, winner: "Hades" },
      { ceremony: "D.I.C.E. Awards", awardYear: 2021, winner: "Hades" },
    ],
  },
  {
    seasonYear: 2019,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2019, winner: "Sekiro: Shadows Die Twice" },
      { ceremony: "BAFTA Games Awards", awardYear: 2020, winner: "Outer Wilds" },
      { ceremony: "D.I.C.E. Awards", awardYear: 2020, winner: "Untitled Goose Game" },
    ],
  },
  {
    seasonYear: 2018,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2018, winner: "God of War" },
      { ceremony: "BAFTA Games Awards", awardYear: 2019, winner: "God of War" },
      { ceremony: "D.I.C.E. Awards", awardYear: 2019, winner: "God of War" },
    ],
  },
  {
    seasonYear: 2017,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2017, winner: "The Legend of Zelda: Breath of the Wild" },
      { ceremony: "BAFTA Games Awards", awardYear: 2018, winner: "What Remains of Edith Finch" },
      { ceremony: "D.I.C.E. Awards", awardYear: 2018, winner: "The Legend of Zelda: Breath of the Wild" },
    ],
  },
  {
    seasonYear: 2016,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2016, winner: "Overwatch" },
      { ceremony: "BAFTA Games Awards", awardYear: 2017, winner: "Uncharted 4" },
      { ceremony: "D.I.C.E. Awards", awardYear: 2017, winner: "Overwatch" },
    ],
  },
  {
    seasonYear: 2015,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2015, winner: "The Witcher 3: Wild Hunt" },
      { ceremony: "BAFTA Games Awards", awardYear: 2016, winner: "Fallout 4" },
      { ceremony: "D.I.C.E. Awards", awardYear: 2016, winner: "Fallout 4" },
    ],
  },
  {
    seasonYear: 2014,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2014, winner: "Dragon Age: Inquisition" },
      { ceremony: "BAFTA Games Awards", awardYear: 2015, winner: "Destiny" },
      { ceremony: "D.I.C.E. Awards", awardYear: 2015, winner: "Dragon Age: Inquisition" },
    ],
  },
];

export function getOfficialGotyForSeason(year) {
  return OFFICIAL_GOTY_AWARDS.find((entry) => entry.seasonYear === Number(year));
}
