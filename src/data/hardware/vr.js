const vrImage = (id) => `/images/hardware/vr/${id}.png`;
const vrVersion = (id, name) => ({ id, name, image: vrImage(id) });

export const VR_HARDWARE = [
  {
    id: "meta-vr",
    name: "Meta Quest",
    brand: "Meta",
    type: "vr",
    category: "Casques VR gaming",
    variants: [
      {
        id: "meta-quest-modern",
        name: "Quest actuel",
        versions: [
          vrVersion("meta-quest-3s", "Meta Quest 3S"),
          vrVersion("meta-quest-3", "Meta Quest 3"),
          vrVersion("meta-quest-pro", "Meta Quest Pro"),
        ],
      },
      {
        id: "meta-quest-legacy",
        name: "Quest historique",
        versions: [
          vrVersion("oculus-quest-2", "Oculus Quest 2"),
          vrVersion("oculus-quest", "Oculus Quest"),
          vrVersion("oculus-rift-s", "Oculus Rift S"),
          vrVersion("oculus-rift-cv1", "Oculus Rift CV1"),
        ],
      },
    ],
  },
  {
    id: "playstation-vr",
    name: "PlayStation VR",
    brand: "PlayStation",
    type: "vr",
    category: "Casques VR gaming",
    variants: [
      {
        id: "playstation-vr-main",
        name: "PS VR",
        versions: [
          vrVersion("playstation-vr2", "PlayStation VR2"),
          vrVersion("playstation-vr2-horizon-bundle", "PlayStation VR2 Horizon Bundle"),
          vrVersion("playstation-vr", "PlayStation VR"),
          vrVersion("playstation-vr-v2", "PlayStation VR V2"),
        ],
      },
    ],
  },
  {
    id: "valve-vr",
    name: "Valve VR",
    brand: "Valve",
    type: "vr",
    category: "Casques VR PC",
    variants: [
      {
        id: "valve-index",
        name: "Index",
        versions: [
          vrVersion("valve-index-vr-kit", "Valve Index VR Kit"),
          vrVersion("valve-index-headset", "Valve Index Headset"),
        ],
      },
    ],
  },
  {
    id: "htc-vive-vr",
    name: "HTC Vive",
    brand: "HTC",
    type: "vr",
    category: "Casques VR PC",
    variants: [
      {
        id: "htc-vive-modern",
        name: "Vive moderne",
        versions: [
          vrVersion("htc-vive-focus-vision", "HTC Vive Focus Vision"),
          vrVersion("htc-vive-xr-elite", "HTC Vive XR Elite"),
          vrVersion("htc-vive-pro-2", "HTC Vive Pro 2"),
          vrVersion("htc-vive-cosmos-elite", "HTC Vive Cosmos Elite"),
          vrVersion("htc-vive-cosmos", "HTC Vive Cosmos"),
        ],
      },
      {
        id: "htc-vive-legacy",
        name: "Vive historique",
        versions: [
          vrVersion("htc-vive-pro", "HTC Vive Pro"),
          vrVersion("htc-vive", "HTC Vive"),
        ],
      },
    ],
  },
  {
    id: "pimax-vr",
    name: "Pimax VR",
    brand: "Pimax",
    type: "vr",
    category: "Casques VR simulation",
    variants: [
      {
        id: "pimax-crystal",
        name: "Crystal",
        versions: [
          vrVersion("pimax-crystal-light", "Pimax Crystal Light"),
          vrVersion("pimax-crystal-super", "Pimax Crystal Super"),
          vrVersion("pimax-crystal", "Pimax Crystal"),
        ],
      },
      {
        id: "pimax-wide-fov",
        name: "Wide FOV",
        versions: [
          vrVersion("pimax-8kx", "Pimax 8K X"),
          vrVersion("pimax-5k-super", "Pimax 5K Super"),
        ],
      },
    ],
  },
  {
    id: "bigscreen-vr",
    name: "Bigscreen Beyond",
    brand: "Bigscreen",
    type: "vr",
    category: "Casques VR PC",
    variants: [
      {
        id: "bigscreen-beyond",
        name: "Beyond",
        versions: [
          vrVersion("bigscreen-beyond-2e", "Bigscreen Beyond 2e"),
          vrVersion("bigscreen-beyond-2", "Bigscreen Beyond 2"),
          vrVersion("bigscreen-beyond", "Bigscreen Beyond"),
        ],
      },
    ],
  },
  {
    id: "pico-vr",
    name: "Pico VR",
    brand: "Pico",
    type: "vr",
    category: "Casques VR standalone",
    variants: [
      {
        id: "pico-4",
        name: "Pico 4",
        versions: [
          vrVersion("pico-4-ultra", "Pico 4 Ultra"),
          vrVersion("pico-4-enterprise", "Pico 4 Enterprise"),
          vrVersion("pico-4", "Pico 4"),
          vrVersion("pico-neo-3-link", "Pico Neo 3 Link"),
        ],
      },
    ],
  },
  {
    id: "hp-vr",
    name: "HP Reverb",
    brand: "HP",
    type: "vr",
    category: "Casques VR PC",
    variants: [
      {
        id: "hp-reverb",
        name: "Reverb",
        versions: [
          vrVersion("hp-reverb-g2", "HP Reverb G2"),
          vrVersion("hp-reverb-g2-omnicept", "HP Reverb G2 Omnicept"),
          vrVersion("hp-reverb", "HP Reverb"),
        ],
      },
    ],
  },
  {
    id: "samsung-vr",
    name: "Samsung Odyssey",
    brand: "Samsung",
    type: "vr",
    category: "Casques VR PC",
    variants: [
      {
        id: "samsung-odyssey",
        name: "Odyssey",
        versions: [
          vrVersion("samsung-hmd-odyssey-plus", "Samsung HMD Odyssey+"),
          vrVersion("samsung-hmd-odyssey", "Samsung HMD Odyssey"),
        ],
      },
    ],
  },
];
