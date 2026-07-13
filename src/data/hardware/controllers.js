const controllerImage = (id) => `/images/controllers/${id}.png`;
const controllerVersion = (id, name) => ({ id, name, image: controllerImage(id) });

export const CONTROLLERS_HARDWARE = [
  {
    id: "sony-controllers",
    name: "Manettes PlayStation",
    brand: "Sony",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "sony-playstation-main",
        name: "PlayStation",

        versions: [
          {
            id: "playstation-controller",
            name: "Manette PlayStation",
            image: "/images/controllers/playstation-controller.png",
          },

          {
            id: "dualshock",
            name: "DualShock",
            image: "/images/controllers/dualshock.png",
          },

          {
            id: "dualshock-2",
            name: "DualShock 2",
            image: "/images/controllers/dualshock-2.png",
          },

          {
            id: "dualshock-3",
            name: "DualShock 3",
            image: "/images/controllers/dualshock-3.png",
          },

          {
            id: "dualshock-4",
            name: "DualShock 4",
            image: "/images/controllers/dualshock-4.png",
          },

          {
            id: "dualsense",
            name: "DualSense",
            image: "/images/controllers/dualsense.png",
          },

          {
            id: "dualsense-edge",
            name: "DualSense Edge",
            image: "/images/controllers/dualsense-edge.png",
          },
        ],
      },
    ],
  },

  {
    id: "microsoft-controllers",
    name: "Manettes Xbox",
    brand: "Microsoft",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "xbox-standard",
        name: "Xbox Standard",

        versions: [
          {
            id: "xbox-duke",
            name: "Xbox Duke",
            image: "/images/controllers/xbox-duke.png",
          },

          {
            id: "xbox-controller-s",
            name: "Xbox Controller S",
            image: "/images/controllers/xbox-controller-s.png",
          },

          {
            id: "xbox-360-controller",
            name: "Manette Xbox 360",
            image: "/images/controllers/xbox-360-controller.png",
          },

          {
            id: "xbox-one-controller",
            name: "Manette Xbox One",
            image: "/images/controllers/xbox-one-controller.png",
          },

          {
            id: "xbox-series-controller",
            name: "Manette Xbox Series",
            image: "/images/controllers/xbox-series-controller.png",
          },
        ],
      },

      {
        id: "xbox-elite",
        name: "Xbox Elite",

        versions: [
          {
            id: "xbox-elite-v1",
            name: "Xbox Elite Controller",
            image: "/images/controllers/xbox-elite-v1.png",
          },

          {
            id: "xbox-elite-series-2",
            name: "Xbox Elite Series 2",
            image: "/images/controllers/xbox-elite-series-2.png",
          },

          {
            id: "xbox-elite-series-2-core",
            name: "Xbox Elite Series 2 Core",
            image: "/images/controllers/xbox-elite-series-2-core.png",
          },
        ],
      },
    ],
  },

  {
    id: "nintendo-controllers",
    name: "Manettes Nintendo",
    brand: "Nintendo",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "nintendo-main",
        name: "Nintendo",

        versions: [
          {
            id: "nes-controller",
            name: "Manette NES",
            image: "/images/controllers/nes-controller.png",
          },

          {
            id: "snes-controller",
            name: "Manette Super Nintendo",
            image: "/images/controllers/snes-controller.png",
          },

          {
            id: "n64-controller",
            name: "Manette Nintendo 64",
            image: "/images/controllers/n64-controller.png",
          },

          {
            id: "gamecube-controller",
            name: "Manette GameCube",
            image: "/images/controllers/gamecube-controller.png",
          },

          {
            id: "wii-remote",
            name: "Wiimote",
            image: "/images/controllers/wii-remote.png",
          },

          {
            id: "wii-classic-controller",
            name: "Wii Classic Controller",
            image: "/images/controllers/wii-classic-controller.png",
          },

          {
            id: "wii-u-pro-controller",
            name: "Wii U Pro Controller",
            image: "/images/controllers/wii-u-pro-controller.png",
          },

          {
            id: "joy-con",
            name: "Joy-Con",
            image: "/images/controllers/joy-con.png",
          },

          {
            id: "switch-pro-controller",
            name: "Nintendo Switch Pro Controller",
            image: "/images/controllers/switch-pro-controller.png",
          },
        ],
      },
    ],
  },

  {
    id: "sega-controllers",
    name: "Manettes SEGA",
    brand: "SEGA",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "sega-main",
        name: "SEGA",

        versions: [
          {
            id: "master-system-controller",
            name: "Manette Master System",
            image: "/images/controllers/master-system-controller.png",
          },

          {
            id: "mega-drive-3b",
            name: "Manette Mega Drive 3 boutons",
            image: "/images/controllers/mega-drive-3b.png",
          },

          {
            id: "mega-drive-6b",
            name: "Manette Mega Drive 6 boutons",
            image: "/images/controllers/mega-drive-6b.png",
          },

          {
            id: "saturn-controller",
            name: "Manette Saturn",
            image: "/images/controllers/saturn-controller.png",
          },

          {
            id: "dreamcast-controller",
            name: "Manette Dreamcast",
            image: "/images/controllers/dreamcast-controller.png",
          },
        ],
      },
    ],
  },

  {
    id: "atari-controllers",
    name: "Manettes Atari",
    brand: "Atari",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "atari-main",
        name: "Atari",

        versions: [
          {
            id: "atari-2600-joystick",
            name: "Joystick Atari 2600",
            image: "/images/controllers/atari-2600-joystick.png",
          },

          {
            id: "atari-jaguar-controller",
            name: "Manette Atari Jaguar",
            image: "/images/controllers/atari-jaguar-controller.png",
          },
        ],
      },
    ],
  },

  {
    id: "snk-controllers",
    name: "Manettes SNK",
    brand: "SNK",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "snk-main",
        name: "SNK",

        versions: [
          {
            id: "neo-geo-cd-controller",
            name: "Manette Neo Geo CD",
            image: "/images/controllers/neo-geo-cd-controller.png",
          },

          {
            id: "neo-geo-stick",
            name: "Neo Geo Arcade Stick",
            image: "/images/controllers/neo-geo-stick.png",
          },
        ],
      },
    ],
  },

  {
    id: "8bitdo-controllers",
    name: "Manettes 8BitDo",
    brand: "8BitDo",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "8bitdo-modern",
        name: "Bluetooth / Ultimate",

        versions: [
          controllerVersion("8bitdo-ultimate-2-4g", "8BitDo Ultimate 2.4G"),
          controllerVersion("8bitdo-ultimate-bluetooth", "8BitDo Ultimate Bluetooth"),
          controllerVersion("8bitdo-ultimate-2c", "8BitDo Ultimate 2C"),
          controllerVersion("8bitdo-pro-2", "8BitDo Pro 2"),
          controllerVersion("8bitdo-sn30-pro", "8BitDo SN30 Pro"),
          controllerVersion("8bitdo-m30", "8BitDo M30"),
          controllerVersion("8bitdo-arcade-stick", "8BitDo Arcade Stick"),
        ],
      },
    ],
  },

  {
    id: "scuf-controllers",
    name: "Manettes SCUF",
    brand: "SCUF",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "scuf-performance",
        name: "Performance",

        versions: [
          controllerVersion("scuf-reflex", "SCUF Reflex"),
          controllerVersion("scuf-reflex-pro", "SCUF Reflex Pro"),
          controllerVersion("scuf-reflex-fps", "SCUF Reflex FPS"),
          controllerVersion("scuf-instinct", "SCUF Instinct"),
          controllerVersion("scuf-instinct-pro", "SCUF Instinct Pro"),
          controllerVersion("scuf-envision", "SCUF Envision"),
          controllerVersion("scuf-envision-pro", "SCUF Envision Pro"),
          controllerVersion("scuf-impact", "SCUF Impact"),
        ],
      },
    ],
  },

  {
    id: "victrix-controllers",
    name: "Manettes Victrix",
    brand: "Victrix",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "victrix-pro",
        name: "Pro",

        versions: [
          controllerVersion("victrix-pro-bfg", "Victrix Pro BFG"),
          controllerVersion("victrix-pro-bfg-xbox", "Victrix Pro BFG Xbox"),
          controllerVersion("victrix-gambit", "Victrix Gambit"),
          controllerVersion("victrix-pro-fs", "Victrix Pro FS"),
          controllerVersion("victrix-pro-fs-12", "Victrix Pro FS-12"),
        ],
      },
    ],
  },

  {
    id: "razer-controllers",
    name: "Manettes Razer",
    brand: "Razer",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "razer-console-pc",
        name: "Console / PC",

        versions: [
          controllerVersion("razer-wolverine-v2", "Razer Wolverine V2"),
          controllerVersion("razer-wolverine-v2-chroma", "Razer Wolverine V2 Chroma"),
          controllerVersion("razer-wolverine-v2-pro", "Razer Wolverine V2 Pro"),
          controllerVersion("razer-wolverine-v3-tournament", "Razer Wolverine V3 Tournament Edition"),
          controllerVersion("razer-wolverine-v3-pro", "Razer Wolverine V3 Pro"),
          controllerVersion("razer-kishi-v2", "Razer Kishi V2"),
          controllerVersion("razer-kishi-v2-pro", "Razer Kishi V2 Pro"),
          controllerVersion("razer-kishi-ultra", "Razer Kishi Ultra"),
          controllerVersion("razer-raion", "Razer Raion Fightpad"),
        ],
      },
    ],
  },

  {
    id: "nacon-controllers",
    name: "Manettes Nacon",
    brand: "Nacon",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "nacon-revolution",
        name: "Revolution",

        versions: [
          controllerVersion("nacon-revolution-pro", "Nacon Revolution Pro Controller"),
          controllerVersion("nacon-revolution-pro-2", "Nacon Revolution Pro Controller 2"),
          controllerVersion("nacon-revolution-pro-3", "Nacon Revolution Pro Controller 3"),
          controllerVersion("nacon-revolution-unlimited", "Nacon Revolution Unlimited"),
          controllerVersion("nacon-revolution-5-pro", "Nacon Revolution 5 Pro"),
          controllerVersion("nacon-rig-pro-compact", "Nacon RIG Pro Compact"),
          controllerVersion("nacon-gc-400es", "Nacon GC-400ES"),
        ],
      },
    ],
  },

  {
    id: "thrustmaster-controllers",
    name: "Manettes Thrustmaster",
    brand: "Thrustmaster",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "thrustmaster-eswap",
        name: "eSwap",

        versions: [
          controllerVersion("thrustmaster-eswap-pro", "Thrustmaster eSwap Pro Controller"),
          controllerVersion("thrustmaster-eswap-x-pro", "Thrustmaster eSwap X Pro"),
          controllerVersion("thrustmaster-eswap-s-pro", "Thrustmaster eSwap S Pro"),
          controllerVersion("thrustmaster-eswap-x2", "Thrustmaster eSwap X2"),
          controllerVersion("thrustmaster-eswap-xr-pro", "Thrustmaster eSwap XR Pro"),
          controllerVersion("thrustmaster-heart-controller", "Thrustmaster HEART Controller"),
        ],
      },
    ],
  },

  {
    id: "turtle-beach-controllers",
    name: "Manettes Turtle Beach",
    brand: "Turtle Beach",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "turtle-beach-main",
        name: "Recon / Stealth",

        versions: [
          controllerVersion("turtle-beach-recon-controller", "Turtle Beach Recon Controller"),
          controllerVersion("turtle-beach-react-r", "Turtle Beach React-R"),
          controllerVersion("turtle-beach-recon-cloud", "Turtle Beach Recon Cloud"),
          controllerVersion("turtle-beach-stealth-ultra", "Turtle Beach Stealth Ultra"),
          controllerVersion("turtle-beach-velocityone-race", "Turtle Beach VelocityOne Race"),
        ],
      },
    ],
  },

  {
    id: "hori-controllers",
    name: "Manettes HORI",
    brand: "HORI",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "hori-console",
        name: "Console",

        versions: [
          controllerVersion("hori-fighting-commander-octa", "HORI Fighting Commander OCTA"),
          controllerVersion("hori-fighting-stick-alpha", "HORI Fighting Stick Alpha"),
          controllerVersion("hori-split-pad-pro", "HORI Split Pad Pro"),
          controllerVersion("hori-split-pad-compact", "HORI Split Pad Compact"),
          controllerVersion("hori-horipad", "HORI Horipad"),
          controllerVersion("hori-horipad-pro", "HORI Horipad Pro"),
          controllerVersion("hori-onyx", "HORI Onyx"),
        ],
      },
    ],
  },

  {
    id: "powera-controllers",
    name: "Manettes PowerA",
    brand: "PowerA",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "powera-main",
        name: "Enhanced / Fusion",

        versions: [
          controllerVersion("powera-enhanced-wired", "PowerA Enhanced Wired Controller"),
          controllerVersion("powera-enhanced-wireless-switch", "PowerA Enhanced Wireless Controller Switch"),
          controllerVersion("powera-fusion-pro", "PowerA Fusion Pro"),
          controllerVersion("powera-fusion-pro-2", "PowerA Fusion Pro 2"),
          controllerVersion("powera-fusion-pro-3", "PowerA Fusion Pro 3"),
          controllerVersion("powera-fusion-pro-wireless", "PowerA Fusion Pro Wireless"),
          controllerVersion("powera-moga-xp7-x", "PowerA MOGA XP7-X Plus"),
        ],
      },
    ],
  },

  {
    id: "backbone-controllers",
    name: "Manettes Backbone",
    brand: "Backbone",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "backbone-one",
        name: "Backbone One",

        versions: [
          controllerVersion("backbone-one-lightning", "Backbone One Lightning"),
          controllerVersion("backbone-one-usb-c", "Backbone One USB-C"),
          controllerVersion("backbone-one-playstation-lightning", "Backbone One PlayStation Edition Lightning"),
          controllerVersion("backbone-one-playstation-usb-c", "Backbone One PlayStation Edition USB-C"),
          controllerVersion("backbone-one-xbox-usb-c", "Backbone One Xbox Edition USB-C"),
        ],
      },
    ],
  },

  {
    id: "pdp-controllers",
    name: "Manettes PDP",
    brand: "PDP",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "pdp-main",
        name: "Rematch / Victrix",

        versions: [
          controllerVersion("pdp-rematch-wired", "PDP Rematch Wired Controller"),
          controllerVersion("pdp-rematch-wireless-switch", "PDP Rematch Wireless Switch"),
          controllerVersion("pdp-afterglow-wave", "PDP Afterglow Wave"),
          controllerVersion("pdp-victrix-pro-bfg", "PDP Victrix Pro BFG"),
        ],
      },
    ],
  },

  {
    id: "gulikit-controllers",
    name: "Manettes Gulikit",
    brand: "Gulikit",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "gulikit-main",
        name: "KingKong / KK",

        versions: [
          controllerVersion("gulikit-kingkong-2-pro", "Gulikit KingKong 2 Pro"),
          controllerVersion("gulikit-kk3-max", "Gulikit KK3 Max"),
          controllerVersion("gulikit-kk3-pro", "Gulikit KK3 Pro"),
          controllerVersion("gulikit-kk3-standard", "Gulikit KK3 Standard"),
        ],
      },
    ],
  },

  {
    id: "logitech-controllers",
    name: "Manettes Logitech",
    brand: "Logitech",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "logitech-gamepads",
        name: "Gamepads",

        versions: [
          controllerVersion("logitech-f310", "Logitech F310"),
          controllerVersion("logitech-f510", "Logitech F510"),
          controllerVersion("logitech-f710", "Logitech F710"),
        ],
      },
    ],
  },

  {
    id: "steelseries-controllers",
    name: "Manettes SteelSeries",
    brand: "SteelSeries",
    type: "controller",
    category: "Manettes",

    variants: [
      {
        id: "steelseries-mobile",
        name: "Mobile / Apple",

        versions: [
          controllerVersion("steelseries-stratus-xl", "SteelSeries Stratus XL"),
          controllerVersion("steelseries-stratus-duo", "SteelSeries Stratus Duo"),
          controllerVersion("steelseries-nimbus", "SteelSeries Nimbus"),
          controllerVersion("steelseries-nimbus-plus", "SteelSeries Nimbus+"),
        ],
      },
    ],
  },
];
