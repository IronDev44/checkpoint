const speakerImage = (id) => `/images/hardware/speakers/${id}.png`;
const speakerVersion = (id, name) => ({ id, name, image: speakerImage(id) });

export const SPEAKERS_HARDWARE = [
  {
    id: "razer-speakers",
    name: "Razer Gaming Speakers",
    brand: "Razer",
    type: "speaker",
    category: "Enceintes gaming",
    variants: [
      {
        id: "razer-nommo",
        name: "Nommo",
        versions: [
          speakerVersion("razer-nommo-v2-pro", "Razer Nommo V2 Pro"),
          speakerVersion("razer-nommo-v2", "Razer Nommo V2"),
          speakerVersion("razer-nommo-v2-x", "Razer Nommo V2 X"),
          speakerVersion("razer-nommo-pro", "Razer Nommo Pro"),
          speakerVersion("razer-nommo-chroma", "Razer Nommo Chroma"),
          speakerVersion("razer-nommo", "Razer Nommo"),
        ],
      },
      {
        id: "razer-leviathan",
        name: "Leviathan",
        versions: [
          speakerVersion("razer-leviathan-v2-pro", "Razer Leviathan V2 Pro"),
          speakerVersion("razer-leviathan-v2", "Razer Leviathan V2"),
          speakerVersion("razer-leviathan-v2-x", "Razer Leviathan V2 X"),
          speakerVersion("razer-leviathan", "Razer Leviathan"),
        ],
      },
    ],
  },
  {
    id: "logitech-speakers",
    name: "Logitech Gaming Speakers",
    brand: "Logitech",
    type: "speaker",
    category: "Enceintes gaming",
    variants: [
      {
        id: "logitech-g-series",
        name: "G / Gaming",
        versions: [
          speakerVersion("logitech-g560", "Logitech G560 LIGHTSYNC"),
          speakerVersion("logitech-g51", "Logitech G51"),
          speakerVersion("logitech-z906", "Logitech Z906"),
          speakerVersion("logitech-z625", "Logitech Z625"),
          speakerVersion("logitech-z623", "Logitech Z623"),
          speakerVersion("logitech-z533", "Logitech Z533"),
          speakerVersion("logitech-z407", "Logitech Z407"),
        ],
      },
    ],
  },
  {
    id: "creative-speakers",
    name: "Creative / Sound Blaster",
    brand: "Creative",
    type: "speaker",
    category: "Enceintes gaming",
    variants: [
      {
        id: "creative-katana",
        name: "Sound Blaster Katana",
        versions: [
          speakerVersion("creative-sound-blaster-katana-se", "Creative Sound Blaster Katana SE"),
          speakerVersion("creative-sound-blaster-katana-v2", "Creative Sound Blaster Katana V2"),
          speakerVersion("creative-sound-blaster-katana-v2x", "Creative Sound Blaster Katana V2X"),
          speakerVersion("creative-sound-blasterx-katana", "Creative Sound BlasterX Katana"),
        ],
      },
      {
        id: "creative-pebble",
        name: "Pebble / Desktop",
        versions: [
          speakerVersion("creative-pebble-x-plus", "Creative Pebble X Plus"),
          speakerVersion("creative-pebble-x", "Creative Pebble X"),
          speakerVersion("creative-pebble-pro", "Creative Pebble Pro"),
          speakerVersion("creative-pebble-v3", "Creative Pebble V3"),
          speakerVersion("creative-t60", "Creative T60"),
        ],
      },
    ],
  },
  {
    id: "steelseries-speakers",
    name: "SteelSeries Arena",
    brand: "SteelSeries",
    type: "speaker",
    category: "Enceintes gaming",
    variants: [
      {
        id: "steelseries-arena",
        name: "Arena",
        versions: [
          speakerVersion("steelseries-arena-9", "SteelSeries Arena 9"),
          speakerVersion("steelseries-arena-7", "SteelSeries Arena 7"),
          speakerVersion("steelseries-arena-3", "SteelSeries Arena 3"),
        ],
      },
    ],
  },
  {
    id: "jbl-speakers",
    name: "JBL Quantum Speakers",
    brand: "JBL",
    type: "speaker",
    category: "Enceintes gaming",
    variants: [
      {
        id: "jbl-quantum",
        name: "Quantum",
        versions: [
          speakerVersion("jbl-quantum-duo", "JBL Quantum Duo"),
        ],
      },
    ],
  },
  {
    id: "edifier-speakers",
    name: "Edifier Gaming Speakers",
    brand: "Edifier",
    type: "speaker",
    category: "Enceintes gaming",
    variants: [
      {
        id: "edifier-gaming",
        name: "Gaming / Desktop",
        versions: [
          speakerVersion("edifier-g5000", "Edifier G5000"),
          speakerVersion("edifier-g2000", "Edifier G2000"),
          speakerVersion("edifier-mg300", "Edifier MG300"),
          speakerVersion("edifier-hecate-g1500", "Edifier Hecate G1500"),
        ],
      },
    ],
  },
  {
    id: "lg-speakers",
    name: "LG UltraGear Speakers",
    brand: "LG",
    type: "speaker",
    category: "Enceintes gaming",
    variants: [
      {
        id: "lg-ultragear",
        name: "UltraGear",
        versions: [
          speakerVersion("lg-ultragear-gp9", "LG UltraGear GP9"),
        ],
      },
    ],
  },
  {
    id: "panasonic-speakers",
    name: "Panasonic SoundSlayer",
    brand: "Panasonic",
    type: "speaker",
    category: "Enceintes gaming",
    variants: [
      {
        id: "panasonic-soundslayer",
        name: "SoundSlayer",
        versions: [
          speakerVersion("panasonic-soundslayer-sc-gn01", "Panasonic SoundSlayer SC-GN01"),
          speakerVersion("panasonic-soundslayer-sc-htb01", "Panasonic SoundSlayer SC-HTB01"),
        ],
      },
    ],
  },
  {
    id: "bose-speakers",
    name: "Bose Desktop Speakers",
    brand: "Bose",
    type: "speaker",
    category: "Enceintes premium setup",
    variants: [
      {
        id: "bose-companion",
        name: "Companion",
        versions: [
          speakerVersion("bose-companion-2-series-iii", "Bose Companion 2 Series III"),
          speakerVersion("bose-companion-20", "Bose Companion 20"),
          speakerVersion("bose-companion-50", "Bose Companion 50"),
        ],
      },
    ],
  },
  {
    id: "klipsch-speakers",
    name: "Klipsch Desktop Speakers",
    brand: "Klipsch",
    type: "speaker",
    category: "Enceintes premium setup",
    variants: [
      {
        id: "klipsch-promedia",
        name: "ProMedia",
        versions: [
          speakerVersion("klipsch-promedia-2-1", "Klipsch ProMedia 2.1"),
          speakerVersion("klipsch-promedia-heritage-2-1", "Klipsch ProMedia Heritage 2.1"),
        ],
      },
    ],
  },
];
