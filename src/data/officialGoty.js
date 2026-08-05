export const OFFICIAL_GOTY_AWARDS = [
  {
    seasonYear: 2025,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2025, winner: "Clair Obscur: Expedition 33" },
    ],
  },
  {
    seasonYear: 2024,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2024, winner: "Astro Bot" },
    ],
  },
  {
    seasonYear: 2023,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2023, winner: "Baldur's Gate 3" },
    ],
  },
  {
    seasonYear: 2022,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2022, winner: "Elden Ring" },
    ],
  },
  {
    seasonYear: 2021,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2021, winner: "It Takes Two" },
    ],
  },
  {
    seasonYear: 2020,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2020, winner: "The Last of Us Part II" },
    ],
  },
  {
    seasonYear: 2019,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2019, winner: "Sekiro: Shadows Die Twice" },
    ],
  },
  {
    seasonYear: 2018,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2018, winner: "God of War" },
    ],
  },
  {
    seasonYear: 2017,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2017, winner: "The Legend of Zelda: Breath of the Wild" },
    ],
  },
  {
    seasonYear: 2016,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2016, winner: "Overwatch" },
    ],
  },
  {
    seasonYear: 2015,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2015, winner: "The Witcher 3: Wild Hunt" },
    ],
  },
  {
    seasonYear: 2014,
    awards: [
      { ceremony: "The Game Awards", awardYear: 2014, winner: "Dragon Age: Inquisition" },
    ],
  },
];

export function getOfficialGotyForSeason(year) {
  return OFFICIAL_GOTY_AWARDS.find((entry) => entry.seasonYear === Number(year));
}
