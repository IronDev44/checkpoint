const displayImage = (id) => `/images/hardware/displays/${id}.png`;
const displayVersion = (id, name, sizes = []) => ({
  id,
  name,
  image: displayImage(id),
  sizes,
});

export const DISPLAYS_HARDWARE = [
  {
    id: "lg-oled-tv",
    name: "LG OLED Gaming TV",
    brand: "LG",
    type: "display",
    category: "TV gaming",
    variants: [
      {
        id: "lg-oled-c-series",
        name: "OLED C Series",
        versions: [
          displayVersion("lg-c2", "LG OLED C2"),
          displayVersion("lg-c3", "LG OLED C3"),
          displayVersion("lg-c4", "LG OLED C4"),
          displayVersion("lg-c5", "LG OLED C5"),
          displayVersion("lg-c6", "LG OLED C6"),
        ],
      },
      {
        id: "lg-oled-g-series",
        name: "OLED G Series",
        versions: [
          displayVersion("lg-g3", "LG OLED G3"),
          displayVersion("lg-g4", "LG OLED G4"),
          displayVersion("lg-g5", "LG OLED G5"),
          displayVersion("lg-g6", "LG OLED G6"),
        ],
      },
      {
        id: "lg-oled-b-series",
        name: "OLED B Series",
        versions: [
          displayVersion("lg-b3", "LG OLED B3"),
          displayVersion("lg-b4", "LG OLED B4"),
          displayVersion("lg-b5", "LG OLED B5"),
          displayVersion("lg-b6", "LG OLED B6"),
        ],
      },
    ],
  },
  {
    id: "samsung-gaming-tv",
    name: "Samsung Gaming TV",
    brand: "Samsung",
    type: "display",
    category: "TV gaming",
    variants: [
      {
        id: "samsung-s90-series",
        name: "OLED S90 Series",
        versions: [
          displayVersion("samsung-s90c", "Samsung OLED S90C"),
          displayVersion("samsung-s90d", "Samsung OLED S90D"),
          displayVersion("samsung-s90f", "Samsung OLED S90F"),
        ],
      },
      {
        id: "samsung-s95-series",
        name: "OLED S95 Series",
        versions: [
          displayVersion("samsung-s95c", "Samsung OLED S95C"),
          displayVersion("samsung-s95d", "Samsung OLED S95D"),
          displayVersion("samsung-s95f", "Samsung OLED S95F"),
        ],
      },
      {
        id: "samsung-qn90-series",
        name: "Neo QLED QN90 Series",
        versions: [
          displayVersion("samsung-qn90c", "Samsung Neo QLED QN90C"),
          displayVersion("samsung-qn90d", "Samsung Neo QLED QN90D"),
          displayVersion("samsung-qn90f", "Samsung Neo QLED QN90F"),
        ],
      },
    ],
  },
  {
    id: "sony-bravia-gaming-tv",
    name: "Sony BRAVIA Gaming TV",
    brand: "Sony",
    type: "display",
    category: "TV gaming",
    variants: [
      {
        id: "sony-bravia-oled",
        name: "BRAVIA OLED / QD-OLED",
        versions: [
          displayVersion("sony-a80l", "Sony BRAVIA XR A80L"),
          displayVersion("sony-a95l", "Sony BRAVIA XR A95L"),
          displayVersion("sony-bravia-8", "Sony BRAVIA 8"),
        ],
      },
      {
        id: "sony-bravia-mini-led",
        name: "BRAVIA Mini LED",
        versions: [
          displayVersion("sony-x90l", "Sony BRAVIA XR X90L"),
          displayVersion("sony-bravia-7", "Sony BRAVIA 7"),
          displayVersion("sony-bravia-9", "Sony BRAVIA 9"),
        ],
      },
    ],
  },
  {
    id: "tcl-gaming-tv",
    name: "TCL Gaming TV",
    brand: "TCL",
    type: "display",
    category: "TV gaming",
    variants: [
      {
        id: "tcl-mini-led",
        name: "Mini LED Gaming",
        versions: [
          displayVersion("tcl-c845", "TCL C845"),
          displayVersion("tcl-c855", "TCL C855"),
          displayVersion("tcl-qm8", "TCL QM8"),
          displayVersion("tcl-qm8k", "TCL QM8K"),
        ],
      },
    ],
  },
  {
    id: "hisense-gaming-tv",
    name: "Hisense Gaming TV",
    brand: "Hisense",
    type: "display",
    category: "TV gaming",
    variants: [
      {
        id: "hisense-u-series",
        name: "ULED / Mini LED",
        versions: [
          displayVersion("hisense-u7k", "Hisense U7K"),
          displayVersion("hisense-u7n", "Hisense U7N"),
          displayVersion("hisense-u8k", "Hisense U8K"),
          displayVersion("hisense-u8n", "Hisense U8N"),
        ],
      },
    ],
  },
  {
    id: "samsung-odyssey",
    name: "Samsung Odyssey",
    brand: "Samsung",
    type: "display",
    category: "Ecrans gaming",
    variants: [
      {
        id: "samsung-odyssey-oled",
        name: "Odyssey OLED",
        versions: [
          displayVersion("samsung-odyssey-oled-g6", "Samsung Odyssey OLED G6", ["27"]),
          displayVersion("samsung-odyssey-oled-g8-34-curved", "Samsung Odyssey OLED G8 34 incurve", ["34"]),
          displayVersion("samsung-odyssey-oled-g8-32-flat", "Samsung Odyssey OLED G8 32 plat", ["32"]),
          displayVersion("samsung-odyssey-oled-g9", "Samsung Odyssey OLED G9", ["49"]),
        ],
      },
      {
        id: "samsung-odyssey-neo",
        name: "Odyssey Neo",
        versions: [
          displayVersion("samsung-odyssey-neo-g7", "Samsung Odyssey Neo G7", ["32"]),
          displayVersion("samsung-odyssey-neo-g8", "Samsung Odyssey Neo G8", ["32"]),
          displayVersion("samsung-odyssey-neo-g9-49", "Samsung Odyssey Neo G9 49", ["49"]),
          displayVersion("samsung-odyssey-neo-g9-57", "Samsung Odyssey Neo G9 57", ["57"]),
        ],
      },
    ],
  },
  {
    id: "lg-ultragear",
    name: "LG UltraGear",
    brand: "LG",
    type: "display",
    category: "Ecrans gaming",
    variants: [
      {
        id: "lg-ultragear-oled",
        name: "UltraGear OLED",
        versions: [
          displayVersion("lg-27gr95qe", "LG UltraGear 27GR95QE", ["27"]),
          displayVersion("lg-27gs95qe", "LG UltraGear 27GS95QE", ["27"]),
          displayVersion("lg-32gs95ue", "LG UltraGear 32GS95UE", ["32"]),
          displayVersion("lg-45gr95qe", "LG UltraGear 45GR95QE", ["45"]),
        ],
      },
      {
        id: "lg-ultragear-fast-ips",
        name: "UltraGear IPS",
        versions: [
          displayVersion("lg-27gp850", "LG UltraGear 27GP850", ["27"]),
          displayVersion("lg-27gr83q", "LG UltraGear 27GR83Q", ["27"]),
          displayVersion("lg-32gq950", "LG UltraGear 32GQ950", ["32"]),
        ],
      },
    ],
  },
  {
    id: "asus-rog",
    name: "ASUS ROG Gaming Monitors",
    brand: "ASUS",
    type: "display",
    category: "Ecrans gaming",
    variants: [
      {
        id: "asus-rog-swift-oled",
        name: "ROG Swift OLED",
        versions: [
          displayVersion("asus-pg27aqdm", "ASUS ROG Swift OLED PG27AQDM", ["27"]),
          displayVersion("asus-pg32ucdm", "ASUS ROG Swift OLED PG32UCDM", ["32"]),
          displayVersion("asus-pg34wcdm", "ASUS ROG Swift OLED PG34WCDM", ["34"]),
        ],
      },
      {
        id: "asus-rog-swift",
        name: "ROG Swift",
        versions: [
          displayVersion("asus-pg27aqn", "ASUS ROG Swift PG27AQN", ["27"]),
          displayVersion("asus-pg32uqx", "ASUS ROG Swift PG32UQX", ["32"]),
        ],
      },
    ],
  },
  {
    id: "alienware-monitors",
    name: "Alienware Gaming Monitors",
    brand: "Alienware",
    type: "display",
    category: "Ecrans gaming",
    variants: [
      {
        id: "alienware-qd-oled",
        name: "QD-OLED",
        versions: [
          displayVersion("alienware-aw3423dw", "Alienware AW3423DW", ["34"]),
          displayVersion("alienware-aw2725df", "Alienware AW2725DF", ["27"]),
          displayVersion("alienware-aw3225qf", "Alienware AW3225QF", ["32"]),
        ],
      },
    ],
  },
  {
    id: "msi-gaming-monitors",
    name: "MSI Gaming Monitors",
    brand: "MSI",
    type: "display",
    category: "Ecrans gaming",
    variants: [
      {
        id: "msi-qd-oled",
        name: "QD-OLED",
        versions: [
          displayVersion("msi-mpg-271qrx", "MSI MPG 271QRX QD-OLED", ["27"]),
          displayVersion("msi-mpg-321urx", "MSI MPG 321URX QD-OLED", ["32"]),
          displayVersion("msi-mag-341cqp", "MSI MAG 341CQP QD-OLED", ["34"]),
        ],
      },
    ],
  },
  {
    id: "gigabyte-aorus",
    name: "Gigabyte AORUS",
    brand: "Gigabyte",
    type: "display",
    category: "Ecrans gaming",
    variants: [
      {
        id: "gigabyte-aorus-oled",
        name: "AORUS OLED",
        versions: [
          displayVersion("gigabyte-fo27q3", "Gigabyte AORUS FO27Q3", ["27"]),
          displayVersion("gigabyte-fo32u2p", "Gigabyte AORUS FO32U2P", ["32"]),
          displayVersion("gigabyte-fo48u", "Gigabyte AORUS FO48U", ["48"]),
        ],
      },
    ],
  },
  {
    id: "sony-inzone-monitors",
    name: "Sony INZONE Monitors",
    brand: "Sony",
    type: "display",
    category: "Ecrans gaming",
    variants: [
      {
        id: "sony-inzone-display",
        name: "INZONE Display",
        versions: [
          displayVersion("sony-inzone-m3", "Sony INZONE M3", ["27"]),
          displayVersion("sony-inzone-m9", "Sony INZONE M9", ["27"]),
          displayVersion("sony-inzone-m10s", "Sony INZONE M10S", ["27"]),
        ],
      },
    ],
  },
];
