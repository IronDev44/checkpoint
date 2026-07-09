export const SONY_HARDWARE = [
{
    id: "ps5",
    name: "PlayStation 5",
    brand: "Sony",
    type: "console",
    category: "PlayStation",
    variants: [
      {
        id: "ps5-standard",
        name: "PS5 Standard",
        versions: [
          {
            id: "ps5-standard-disc",
            name: "PS5 Standard",
            storage: "825 Go",
            disc: true,
            image: "/images/consoles/ps5-standard.png",
          },
        ],
      },
      {
        id: "ps5-digital",
        name: "PS5 Digital Edition",
        versions: [
          {
            id: "ps5-digital-825",
            name: "PS5 Digital Edition",
            storage: "825 Go",
            disc: false,
            image: "/images/consoles/ps5-digital.png",
          },
        ],
      },
      {
        id: "ps5-slim",
        name: "PS5 Slim",
        versions: [
          {
            id: "ps5-slim-disc-1tb",
            name: "PS5 Slim avec lecteur",
            storage: "1 To",
            disc: true,
            image: "/images/consoles/ps5-slim.png",
          },
          {
            id: "ps5-slim-digital-1tb",
            name: "PS5 Slim Digital",
            storage: "1 To",
            disc: false,
            image: "/images/consoles/ps5-slim-digital.png",
          },
        ],
      },
      {
        id: "ps5-pro",
        name: "PS5 Pro",
        versions: [
          {
            id: "ps5-pro-2tb",
            name: "PS5 Pro",
            storage: "2 To",
            disc: false,
            image: "/images/consoles/ps5-pro.png",
          },
        ],
      },
    ],
  },

  {
    id: "ps4",
    name: "PlayStation 4",
    brand: "Sony",
    type: "console",
    category: "PlayStation",
    variants: [
      {
        id: "ps4-fat",
        name: "PS4 Fat",
        versions: [
          {
            id: "ps4-fat-500",
            name: "PS4 Fat 500 Go",
            storage: "500 Go",
            disc: true,
            image: "/images/consoles/ps4-fat.png",
          },
          {
            id: "ps4-fat-1tb",
            name: "PS4 Fat 1 To",
            storage: "1 To",
            disc: true,
            image: "/images/consoles/ps4-fat.png",
          },
        ],
      },
      {
        id: "ps4-slim",
        name: "PS4 Slim",
        versions: [
          {
            id: "ps4-slim-500",
            name: "PS4 Slim 500 Go",
            storage: "500 Go",
            disc: true,
            image: "/images/consoles/ps4-slim.png",
          },
          {
            id: "ps4-slim-1tb",
            name: "PS4 Slim 1 To",
            storage: "1 To",
            disc: true,
            image: "/images/consoles/ps4-slim.png",
          },
        ],
      },
      {
        id: "ps4-pro",
        name: "PS4 Pro",
        versions: [
          {
            id: "ps4-pro-1tb",
            name: "PS4 Pro 1 To",
            storage: "1 To",
            disc: true,
            image: "/images/consoles/ps4-pro.png",
          },
          {
            id: "ps4-pro-2tb",
            name: "PS4 Pro 2 To",
            storage: "2 To",
            disc: true,
            image: "/images/consoles/ps4-pro.png",
          },
        ],
      },
    ],
  },

  {
    id: "ps3",
    name: "PlayStation 3",
    brand: "Sony",
    type: "console",
    category: "PlayStation",
    variants: [
      {
        id: "ps3-fat",
        name: "PS3 Fat",
        versions: [
          {
            id: "ps3-fat-20",
            name: "PS3 Fat 20 Go",
            storage: "20 Go",
            disc: true,
            backwardCompatible: true,
            image: "/images/consoles/ps3-fat.png",
          },
          {
            id: "ps3-fat-40",
            name: "PS3 Fat 40 Go",
            storage: "40 Go",
            disc: true,
            backwardCompatible: false,
            image: "/images/consoles/ps3-fat.png",
          },
          {
            id: "ps3-fat-60",
            name: "PS3 Fat 60 Go",
            storage: "60 Go",
            disc: true,
            backwardCompatible: true,
            image: "/images/consoles/ps3-fat.png",
          },
          {
            id: "ps3-fat-80",
            name: "PS3 Fat 80 Go",
            storage: "80 Go",
            disc: true,
            backwardCompatible: "selon modèle",
            image: "/images/consoles/ps3-fat.png",
          },
        ],
      },
      {
        id: "ps3-slim",
        name: "PS3 Slim",
        versions: [
          {
            id: "ps3-slim-120",
            name: "PS3 Slim 120 Go",
            storage: "120 Go",
            disc: true,
            backwardCompatible: false,
            image: "/images/consoles/ps3-slim.png",
          },
          {
            id: "ps3-slim-160",
            name: "PS3 Slim 160 Go",
            storage: "160 Go",
            disc: true,
            backwardCompatible: false,
            image: "/images/consoles/ps3-slim.png",
          },
          {
            id: "ps3-slim-250",
            name: "PS3 Slim 250 Go",
            storage: "250 Go",
            disc: true,
            backwardCompatible: false,
            image: "/images/consoles/ps3-slim.png",
          },
          {
            id: "ps3-slim-320",
            name: "PS3 Slim 320 Go",
            storage: "320 Go",
            disc: true,
            backwardCompatible: false,
            image: "/images/consoles/ps3-slim.png",
          },
        ],
      },
      {
        id: "ps3-super-slim",
        name: "PS3 Super Slim",
        versions: [
          {
            id: "ps3-super-slim-12",
            name: "PS3 Super Slim 12 Go",
            storage: "12 Go",
            disc: true,
            backwardCompatible: false,
            image: "/images/consoles/ps3-super-slim.png",
          },
          {
            id: "ps3-super-slim-250",
            name: "PS3 Super Slim 250 Go",
            storage: "250 Go",
            disc: true,
            backwardCompatible: false,
            image: "/images/consoles/ps3-super-slim.png",
          },
          {
            id: "ps3-super-slim-500",
            name: "PS3 Super Slim 500 Go",
            storage: "500 Go",
            disc: true,
            backwardCompatible: false,
            image: "/images/consoles/ps3-super-slim.png",
          },
        ],
      },
    ],
  },

    {
    id: "ps2",
    name: "PlayStation 2",
    brand: "Sony",
    type: "console",
    category: "PlayStation",
    variants: [
      {
        id: "ps2-fat",
        name: "PS2 Fat",
        versions: [
          {
            id: "ps2-fat",
            name: "PlayStation 2 Fat",
            storage: "",
            disc: true,
            image: "/images/consoles/ps2-fat.png",
          },
        ],
      },
      {
        id: "ps2-slim",
        name: "PS2 Slim",
        versions: [
          {
            id: "ps2-slim",
            name: "PlayStation 2 Slim",
            storage: "",
            disc: true,
            image: "/images/consoles/ps2-slim.png",
          },
        ],
      },
    ],
  },

  {
    id: "ps1",
    name: "PlayStation",
    brand: "Sony",
    type: "console",
    category: "PlayStation",
    variants: [
      {
        id: "ps1-original",
        name: "PlayStation",
        versions: [
          {
            id: "ps1-original",
            name: "PlayStation",
            storage: "",
            disc: true,
            image: "/images/consoles/ps1.png",
          },
        ],
      },
      {
        id: "psone",
        name: "PS One",
        versions: [
          {
            id: "psone",
            name: "PS One",
            storage: "",
            disc: true,
            image: "/images/consoles/psone.png",
          },
        ],
      },
      {
        id: "playstation-classic",
        name: "PlayStation Classic",
        versions: [
        {
          id: "playstation-classic",
          name: "PlayStation Classic",
          storage: "",
          disc: false,
          mini: true,
          image: "/images/consoles/playstation-classic.png",
        },
      ],
    },
    ],
  },

  {
    id: "psp",
    name: "PlayStation Portable",
    brand: "Sony",
    type: "console",
    category: "PlayStation",
    variants: [
      {
        id: "psp-models",
        name: "PSP",
        versions: [
          {
            id: "psp-1000",
            name: "PSP-1000",
            storage: "",
            disc: true,
            image: "/images/consoles/psp-1000.png",
          },
          {
            id: "psp-2000",
            name: "PSP-2000",
            storage: "",
            disc: true,
            image: "/images/consoles/psp-2000.png",
          },
          {
            id: "psp-3000",
            name: "PSP-3000",
            storage: "",
            disc: true,
            image: "/images/consoles/psp-3000.png",
          },
          {
            id: "psp-street",
            name:"PSP Street",
            storage: "",
            disc: true,
            image: "/images/consoles/psp-street.png",
          },
          {
            id: "psp-go",
            name: "PSP Go",
            storage: "16 Go",
            disc: false,
            image: "/images/consoles/psp-go.png",
          },
        ],
      },
    ],
  },

  {
    id: "ps-vita",
    name: "PlayStation Vita",
    brand: "Sony",
    type: "console",
    category: "PlayStation",
    variants: [
      {
        id: "ps-vita-models",
        name: "PS Vita",
        versions: [
          {
            id: "ps-vita-oled",
            name: "PS Vita OLED",
            storage: "",
            disc: false,
            image: "/images/consoles/ps-vita-oled.png",
          },
          {
            id: "ps-vita-slim",
            name: "PS Vita Slim",
            storage: "1 Go",
            disc: false,
            image: "/images/consoles/ps-vita-slim.png",
          },
          {
            id: "ps-tv",
            name: "PlayStation TV",
            storage: "1 Go",
            disc: false,
            image: "/images/consoles/ps-tv.png",
          },
        ],
      },
    ],
  },
]