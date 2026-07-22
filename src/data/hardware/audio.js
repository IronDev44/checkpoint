const audioImage = (id) => `/images/hardware/audio/${id}.png`;
const audioVersion = (id, name) => ({ id, name, image: audioImage(id) });

export const AUDIO_HARDWARE = [

 /* =========================
   SONY / PLAYSTATION
========================= */

{
  id: "sony-audio",
  brand: "Sony",
  name: "Casques Sony / PlayStation",
  type: "audio",
  variants: [
    {
      id: "sony-playstation-pulse",
      name: "PlayStation Pulse",
      versions: [
        {
          id: "playstation-pulse-elite",
          name: "PlayStation PULSE Elite",
          image: "/images/hardware/audio/playstation-pulse-elite.png",
        },
        {
          id: "playstation-pulse-explore",
          name: "PlayStation PULSE Explore",
          image: "/images/hardware/audio/playstation-pulse-explore.png",
        },
        {
          id: "playstation-pulse-3d",
          name: "PlayStation PULSE 3D",
          image: "/images/hardware/audio/playstation-pulse-3d.png",
        },
      ],
    },

    {
      id: "sony-playstation-legacy",
      name: "PlayStation Legacy",
      versions: [
        {
          id: "playstation-gold-wireless",
          name: "PlayStation Gold Wireless Headset",
          image: "/images/hardware/audio/playstation-gold-wireless.png",
        },
        {
          id: "playstation-platinum-wireless",
          name: "PlayStation Platinum Wireless Headset",
          image: "/images/hardware/audio/playstation-platinum-wireless.png",
        },
      ],
    },

    {
      id: "sony-inzone",
      name: "INZONE Gaming",
      versions: [
        {
          id: "sony-inzone-h3",
          name: "Sony INZONE H3",
          image: "/images/hardware/audio/sony-inzone-h3.png",
        },
        {
          id: "sony-inzone-h5",
          name: "Sony INZONE H5",
          image: "/images/hardware/audio/sony-inzone-h5.png",
        },
        {
          id: "sony-inzone-h7",
          name: "Sony INZONE H7",
          image: "/images/hardware/audio/sony-inzone-h7.png",
        },
        {
          id: "sony-inzone-h9",
          name: "Sony INZONE H9",
          image: "/images/hardware/audio/sony-inzone-h9.png",
        },
        {
            id: "sony-inzone-h9-2",
            name: "Sony INZONE H9 2",
            image: "/images/hardware/audio/sony-inzone-h9-2.png",
        },
      ],
    },

    {
      id: "sony-wh-series",
      name: "WH Series",
      versions: [
        {
          id: "sony-wh1000xm3",
          name: "Sony WH-1000XM3",
          image: "/images/hardware/audio/sony-wh1000xm3.png",
        },
        {
          id: "sony-wh1000xm4",
          name: "Sony WH-1000XM4",
          image: "/images/hardware/audio/sony-wh1000xm4.png",
        },
        {
          id: "sony-wh1000xm5",
          name: "Sony WH-1000XM5",
          image: "/images/hardware/audio/sony-wh1000xm5.png",
        },
      ],
    },

    {
      id: "sony-xb-series",
      name: "Extra Bass",
      versions: [
        {
          id: "sony-whxb700",
          name: "Sony WH-XB700",
          image: "/images/hardware/audio/sony-whxb700.png",
        },
        {
          id: "sony-whxb900n",
          name: "Sony WH-XB900N",
          image: "/images/hardware/audio/sony-whxb900n.png",
        },
        {
          id: "sony-ult-wear",
          name: "Sony ULT Wear",
          image: "/images/hardware/audio/sony-ult-wear.png",
        },
      ],
    },
  ],
},

  /* =========================
     BOSE
  ========================= */

  {
    id: "bose-audio",
    brand: "Bose",
    name: "Casques Bose",
    type: "audio",
    variants: [
      {
        id: "bose-qc",
        name: "QuietComfort",
        versions: [
          {
            id: "bose-qc45",
            name: "Bose QuietComfort 45",
            image: "/images/hardware/audio/bose-qc45.png",
          },
          {
            id: "bose-qc-ultra",
            name: "Bose QuietComfort Ultra",
            image: "/images/hardware/audio/bose-qc-ultra.png",
          },
          {
            id: "bose-qc-ultra-2",
            name: "Bose QuietComfort Ultra 2nd gen",
            image: "/images/hardware/audio/bose-qc-ultra-2.png",
          },
        ],
      },

      {
        id: "bose-700",
        name: "700",
        versions: [
          {
            id: "bose-700-headphones",
            name: "Bose 700",
            image: "/images/hardware/audio/bose-700.png",
          },
        ],
      },
    ],
  },

  /* =========================
     STEELSERIES
  ========================= */

  {
  id: "steelseries-audio",
  brand: "SteelSeries",
  name: "Casques SteelSeries",
  type: "audio",
  variants: [
    {
      id: "steelseries-arctis",
      name: "Arctis",
      versions: [
        {
          id: "arctis-1",
          name: "SteelSeries Arctis 1",
          image: "/images/hardware/audio/arctis-1.png",
        },
        {
          id: "arctis-3",
          name: "SteelSeries Arctis 3",
          image: "/images/hardware/audio/arctis-3.png",
        },
        {
          id: "arctis-5",
          name: "SteelSeries Arctis 5",
          image: "/images/hardware/audio/arctis-5.png",
        },
        {
          id: "arctis-7",
          name: "SteelSeries Arctis 7",
          image: "/images/hardware/audio/arctis-7.png",
        },
        {
          id: "arctis-9",
          name: "SteelSeries Arctis 9",
          image: "/images/hardware/audio/arctis-9.png",
        },
        {
          id: "arctis-pro",
          name: "SteelSeries Arctis Pro",
          image: "/images/hardware/audio/arctis-pro.png",
        },
        {
          id: "arctis-nova-1",
          name: "SteelSeries Arctis Nova 1",
          image: "/images/hardware/audio/arctis-nova-1.png",
        },
        {
          id: "arctis-nova-3",
          name: "SteelSeries Arctis Nova 3",
          image: "/images/hardware/audio/arctis-nova-3.png",
        },
        {
            id: "arctis-nova-3-wireless",
            name: "SteelSeries Arctis Nova 3 Wireless",
            image: "/images/hardware/audio/arctis-nova-3-wireless.png",
        },
        audioVersion("arctis-nova-5", "SteelSeries Arctis Nova 5"),
        audioVersion("arctis-nova-5x", "SteelSeries Arctis Nova 5X"),
        audioVersion("arctis-nova-5p", "SteelSeries Arctis Nova 5P"),
        {
          id: "arctis-nova-7",
          name: "SteelSeries Arctis Nova 7",
          image: "/images/hardware/audio/arctis-nova-7.png",
        },
        audioVersion("arctis-nova-7x", "SteelSeries Arctis Nova 7X"),
        audioVersion("arctis-nova-7p", "SteelSeries Arctis Nova 7P"),
        {
          id: "arctis-nova-pro",
          name: "SteelSeries Arctis Nova Pro Wireless",
          image: "/images/hardware/audio/arctis-nova-pro.png",
        },
        audioVersion("arctis-nova-pro-x", "SteelSeries Arctis Nova Pro X Wireless"),
        audioVersion("arctis-nova-pro-p", "SteelSeries Arctis Nova Pro P Wireless"),
      ],
    },
  ],
},

  /* =========================
     HYPERX
  ========================= */

  {
  id: "hyperx-audio",
  brand: "HyperX",
  name: "Casques HyperX",
  type: "audio",
  variants: [
    {
      id: "hyperx-cloud",
      name: "Cloud",
      versions: [
        {
          id: "hyperx-cloud-stinger",
          name: "HyperX Cloud Stinger",
          image: "/images/hardware/audio/hyperx-cloud-stinger.png",
        },
        {
          id: "hyperx-cloud-stinger-2",
          name: "HyperX Cloud Stinger 2",
          image: "/images/hardware/audio/hyperx-cloud-stinger-2.png",
        },
        {
          id: "hyperx-cloud-core",
          name: "HyperX Cloud Core",
          image: "/images/hardware/audio/hyperx-cloud-core.png",
        },
        {
          id: "hyperx-cloud-2",
          name: "HyperX Cloud II",
          image: "/images/hardware/audio/hyperx-cloud-2.png",
        },
        {
          id: "hyperx-cloud-3",
          name: "HyperX Cloud III Wireless",
          image: "/images/hardware/audio/hyperx-cloud-3.png",
        },
        {
          id: "hyperx-cloud-alpha",
          name: "HyperX Cloud Alpha",
          image: "/images/hardware/audio/hyperx-cloud-alpha.png",
        },
        {
          id: "hyperx-cloud-alpha-2",
          name: "HyperX Cloud Alpha 2",
          image: "/images/hardware/audio/hyperx-cloud-alpha-2.png",
        },
        {
          id: "hyperx-cloud-alpha-s",
          name: "HyperX Cloud Alpha S",
          image: "/images/hardware/audio/hyperx-cloud-alpha-s.png",
        },
        {
          id: "hyperx-cloud-alpha-wireless",
          name: "HyperX Cloud Alpha Wireless",
          image: "/images/hardware/audio/hyperx-cloud-alpha-wireless.png",
        },
        {
          id: "hyperx-cloud-flight",
          name: "HyperX Cloud Flight",
          image: "/images/hardware/audio/hyperx-cloud-flight.png",
        },
        {
          id: "hyperx-cloud-flight-2",
          name: "HyperX Cloud Flight 2",
          image: "/images/hardware/audio/hyperx-cloud-flight-2.png",
        },
        {
          id: "hyperx-cloud-flight-s",
          name: "HyperX Cloud Flight S",
          image: "/images/hardware/audio/hyperx-cloud-flight-s.png",
        },
        {
          id: "hyperx-cloud-mix",
          name: "HyperX Cloud MIX",
          image: "/images/hardware/audio/hyperx-cloud-mix.png",
        },
        {
          id: "hyperx-cloud-mix-2",
          name: "HyperX Cloud MIX 2",
          image: "/images/hardware/audio/hyperx-cloud-mix-2.png",
        },
        {
          id: "hyperx-cloud-orbit-s",
          name: "HyperX Cloud Orbit S",
          image: "/images/hardware/audio/hyperx-cloud-orbit-s.png",
        },
      ],
    },
  ],
},

  /* =========================
     LOGITECH
  ========================= */

  {
  id: "logitech-audio",
  brand: "Logitech",
  name: "Casques Logitech",
  type: "audio",
  variants: [
    {
      id: "logitech-gpro",
      name: "G Pro",
      versions: [
        {
          id: "logitech-gpro-x",
          name: "Logitech G Pro X Wireless",
          image: "/images/hardware/audio/logitech-gpro-x.png",
        },
        audioVersion("logitech-g-pro-x", "Logitech G PRO X"),
        {
          id: "logitech-gpro-x2",
          name: "Logitech G Pro X 2 Lightspeed",
          image: "/images/hardware/audio/logitech-gpro-x2.png",
        },
        audioVersion("logitech-g-pro-x-2-lightspeed", "Logitech G PRO X 2 LIGHTSPEED"),
      ],
    },

    {
      id: "logitech-gseries",
      name: "G Series",
      versions: [
        {
          id: "logitech-g435",
          name: "Logitech G435",
          image: "/images/hardware/audio/logitech-g435.png",
        },
        audioVersion("logitech-g432", "Logitech G432"),
        {
          id: "logitech-g533",
          name: "Logitech G533",
          image: "/images/hardware/audio/logitech-g533.png",
        },
        audioVersion("logitech-g535", "Logitech G535 LIGHTSPEED"),
        audioVersion("logitech-g635", "Logitech G635"),
        {
          id: "logitech-g733",
          name: "Logitech G733",
          image: "/images/hardware/audio/logitech-g733.png",
        },
        audioVersion("logitech-g735", "Logitech G735"),
        {
          id: "logitech-g935",
          name: "Logitech G935",
          image: "/images/hardware/audio/logitech-g935.png",
        },
      ],
    },
  ],
},


  /* =========================
     BEYERDYNAMIC
  ========================= */

  {
  id: "beyerdynamic-audio",
  brand: "Beyerdynamic",
  name: "Casques Beyerdynamic",
  type: "audio",
  variants: [
    {
      id: "beyerdynamic-gaming",
      name: "Gaming",
      versions: [
        {
          id: "mmx100",
          name: "Beyerdynamic MMX 100",
          image: "/images/hardware/audio/mmx100.png",
        },
        {
          id: "mmx150",
          name: "Beyerdynamic MMX 150",
          image: "/images/hardware/audio/mmx150.png",
        },
        {
          id: "mmx300",
          name: "Beyerdynamic MMX 300",
          image: "/images/hardware/audio/mmx300.png",
        },
        {
          id: "mmx300-pro",
          name: "Beyerdynamic MMX 300 Pro",
          image: "/images/hardware/audio/mmx300-pro.png",
        },
        {
          id: "mmx330-pro",
          name: "Beyerdynamic MMX 330 Pro",
          image: "/images/hardware/audio/mmx330-pro.png",
        },
      ],
    },

    {
      id: "beyerdynamic-dt",
      name: "DT Series",
      versions: [
        {
          id: "dt770-pro",
          name: "Beyerdynamic DT 770 Pro",
          image: "/images/hardware/audio/dt770-pro.png",
        },
        {
          id: "dt880-pro",
          name: "Beyerdynamic DT 880 Pro",
          image: "/images/hardware/audio/dt880-pro.png",
        },
        {
          id: "dt990-pro",
          name: "Beyerdynamic DT 990 Pro",
          image: "/images/hardware/audio/dt990-pro.png",
        },
        {
          id: "dt700-pro-x",
          name: "Beyerdynamic DT 700 Pro X",
          image: "/images/hardware/audio/dt700-pro-x.png",
        },
        {
          id: "dt900-pro-x",
          name: "Beyerdynamic DT 900 Pro X",
          image: "/images/hardware/audio/dt900-pro-x.png",
        },
      ],
    },
  ],
},

  /* =========================
     SENNHEISER
  ========================= */

  {
    id: "sennheiser-audio",
    brand: "Sennheiser",
    name: "Casques Sennheiser",
    type: "audio",
    variants: [
      {
        id: "sennheiser-momentum",
        name: "Momentum",
        versions: [
          {
            id: "momentum-3",
            name: "Sennheiser Momentum 3",
            image: "/images/hardware/audio/momentum-3.png",
          },
          {
            id: "momentum-4",
            name: "Sennheiser Momentum 4",
            image: "/images/hardware/audio/momentum-4.png",
          },
          {
            id: "momentum-5",
            name: "Sennheiser Momentum 5",
            image: "/images/hardware/audio/momentum-5.png",
          },
        ],
      },
    ],
  },

  /* =========================
     RAZER
  ========================= */

  {
  id: "razer-audio",
  brand: "Razer",
  name: "Casques Razer",
  type: "audio",
  variants: [
    {
      id: "razer-blackshark",
      name: "BlackShark",
      versions: [
        {
          id: "blackshark-v2-x",
          name: "Razer BlackShark V2 X",
          image: "/images/hardware/audio/blackshark-v2-x.png",
        },
        {
          id: "blackshark-v2",
          name: "Razer BlackShark V2",
          image: "/images/hardware/audio/blackshark-v2.png",
        },
        {
          id: "blackshark-v2-pro",
          name: "Razer BlackShark V2 Pro",
          image: "/images/hardware/audio/blackshark-v2-pro.png",
        },
        {
          id: "blackshark-v3",
          name: "Razer BlackShark V3",
          image: "/images/hardware/audio/blackshark-v3.png",
        },
        {
          id: "blackshark-v3-pro",
          name: "Razer BlackShark V3 Pro",
          image: "/images/hardware/audio/blackshark-v3-pro.png",
        },
      ],
    },

    {
      id: "razer-barracuda-series",
      name: "Barracuda",
      versions: [
        {
          id: "razer-barracuda-x",
          name: "Razer Barracuda X",
          image: "/images/hardware/audio/barracuda-x.png",
        },
        {
          id: "razer-barracuda",
          name: "Razer Barracuda",
          image: "/images/hardware/audio/barracuda.png",
        },
        {
          id: "razer-barracuda-x-chroma",
          name: "Razer Barracuda X Chroma",
          image: "/images/hardware/audio/barracuda-x-chroma.png",
        },
        {
          id: "razer-barracuda-pro",
          name: "Razer Barracuda Pro",
          image: "/images/hardware/audio/barracuda-pro.png",
        },
      ],
    },

    {
      id: "razer-kraken-series",
      name: "Kraken",
      versions: [
        {
          id: "razer-kraken",
          name: "Razer Kraken",
          image: "/images/hardware/audio/kraken.png",
        },
        {
          id: "razer-kraken-v2",
          name: "Razer Kraken V2",
          image: "/images/hardware/audio/kraken-v2.png",
        },
        {
          id: "razer-kraken-v3",
          name: "Razer Kraken V3",
          image: "/images/hardware/audio/kraken-v3.png",
        },
        {
          id: "razer-kraken-v3-x",
          name: "Razer Kraken V3 X",
          image: "/images/hardware/audio/kraken-v3-x.png",
        },
        audioVersion("razer-kraken-v4", "Razer Kraken V4"),
        audioVersion("razer-kraken-v4-x", "Razer Kraken V4 X"),
        audioVersion("razer-kraken-v4-pro", "Razer Kraken V4 Pro"),
        {
          id: "razer-kraken-kitty",
          name: "Razer Kraken Kitty",
          image: "/images/hardware/audio/kraken-kitty.png",
        },
      ],
    },

    {
      id: "razer-nari",
      name: "Nari",
      versions: [
        {
          id: "razer-nari-essential",
          name: "Razer Nari Essential",
          image: "/images/hardware/audio/nari-essential.png",
        },
        {
          id: "razer-nari-ultimate",
          name: "Razer Nari Ultimate",
          image: "/images/hardware/audio/nari-ultimate.png",
        },
      ],
    },

    {
        id: "razer-manowar-series",
        name: "Man O'War",
        versions: [
            {
                id: "razer-manowar",
                name: "Razer Man O'War",
                image: "/images/hardware/audio/razer-manowar.png",
            },
        ],
    },
    {
      id: "razer-kaira-series",
      name: "Kaira",
      versions: [
        audioVersion("razer-kaira-x", "Razer Kaira X"),
        audioVersion("razer-kaira", "Razer Kaira"),
        audioVersion("razer-kaira-pro", "Razer Kaira Pro"),
        audioVersion("razer-kaira-hyperspeed", "Razer Kaira HyperSpeed"),
      ],
    },
  ],
},

  /* =========================
     ASTRO
  ========================= */

  {
  id: "astro-audio",
  brand: "Astro",
  name: "Casques Astro",
  type: "audio",
  variants: [
    {
      id: "astro-a-series",
      name: "A Series",
      versions: [
        {
          id: "astro-a10",
          name: "ASTRO A10",
          image: "/images/hardware/audio/astro-a10.png",
        },
        {
          id: "astro-a20",
          name: "ASTRO A20 Wireless",
          image: "/images/hardware/audio/astro-a20.png",
        },
        {
          id: "astro-a30",
          name: "ASTRO A30 Wireless",
          image: "/images/hardware/audio/astro-a30.png",
        },
        {
          id: "astro-a40",
          name: "ASTRO A40 TR",
          image: "/images/hardware/audio/astro-a40.png",
        },
        {
          id: "astro-a50",
          name: "ASTRO A50 Wireless",
          image: "/images/hardware/audio/astro-a50.png",
        },
      ],
    },
  ],
},

  /* =========================
   CORSAIR
========================= */

{
  id: "corsair-audio",
  brand: "Corsair",
  name: "Casques Corsair",
  type: "audio",
  variants: [
    {
      id: "corsair-hs-series",
      name: "HS Series",
      versions: [
        {
          id: "corsair-hs35",
          name: "Corsair HS35",
          image: "/images/hardware/audio/corsair-hs35.png",
        },
        {
          id: "corsair-hs50",
          name: "Corsair HS50",
          image: "/images/hardware/audio/corsair-hs50.png",
        },
        {
          id: "corsair-hs55",
          name: "Corsair HS55 Stereo",
          image: "/images/hardware/audio/corsair-hs55.png",
        },
        audioVersion("corsair-hs55-wireless", "Corsair HS55 Wireless"),
        {
          id: "corsair-hs60-pro",
          name: "Corsair HS60 Pro",
          image: "/images/hardware/audio/corsair-hs60-pro.png",
        },
        {
          id: "corsair-hs65",
          name: "Corsair HS65 Surround",
          image: "/images/hardware/audio/corsair-hs65.png",
        },
        {
          id: "corsair-hs70",
          name: "Corsair HS70 Wireless",
          image: "/images/hardware/audio/corsair-hs70.png",
        },
        {
          id: "corsair-hs80",
          name: "Corsair HS80 RGB Wireless",
          image: "/images/hardware/audio/corsair-hs80.png",
        },
        audioVersion("corsair-hs80-max", "Corsair HS80 MAX Wireless"),
      ],
    },

    {
      id: "corsair-virtuoso-series",
      name: "Virtuoso",
      versions: [
        {
          id: "corsair-virtuoso-rgb",
          name: "Corsair Virtuoso RGB Wireless",
          image: "/images/hardware/audio/corsair-virtuoso-rgb.png",
        },
        {
          id: "corsair-virtuoso-se",
          name: "Corsair Virtuoso SE",
          image: "/images/hardware/audio/corsair-virtuoso-se.png",
        },
        {
          id: "corsair-virtuoso-xt",
          name: "Corsair Virtuoso XT",
          image: "/images/hardware/audio/corsair-virtuoso-xt.png",
        },
        audioVersion("corsair-virtuoso-pro", "Corsair Virtuoso Pro"),
        {
          id: "corsair-virtuoso-max",
          name: "Corsair Virtuoso MAX",
          image: "/images/hardware/audio/corsair-virtuoso-max.png",
        },
      ],
    },

    {
      id: "corsair-void-series",
      name: "VOID",
      versions: [
        {
          id: "corsair-void-elite",
          name: "Corsair VOID RGB Elite",
          image: "/images/hardware/audio/corsair-void-elite.png",
        },
        {
          id: "corsair-void-pro",
          name: "Corsair VOID PRO RGB",
          image: "/images/hardware/audio/corsair-void-pro.png",
        },
        {
          id: "corsair-void-v2",
          name: "Corsair VOID V2 Wireless",
          image: "/images/hardware/audio/corsair-void-v2.png",
        },
        {
          id: "corsair-void-v2-max",
          name: "Corsair VOID V2 MAX",
          image: "/images/hardware/audio/corsair-void-v2-max.png",
        },
      ],
    },
  ],
},

  /* =========================
   TURTLE BEACH
========================= */

{
  id: "turtlebeach-audio",
  brand: "Turtle Beach",
  name: "Casques Turtle Beach",
  type: "audio",
  variants: [
    {
      id: "turtlebeach-stealth",
      name: "Stealth",
      versions: [
        {
          id: "stealth-600",
          name: "Turtle Beach Stealth 600",
          image: "/images/hardware/audio/stealth-600.png",
        },
        {
          id: "stealth-600-gen2",
          name: "Turtle Beach Stealth 600 Gen 2",
          image: "/images/hardware/audio/stealth-600-gen2.png",
        },
        {
          id: "stealth-600-gen3",
          name: "Turtle Beach Stealth 600 Gen 3",
          image: "/images/hardware/audio/stealth-600-gen3.png",
        },
        {
          id: "stealth-700",
          name: "Turtle Beach Stealth 700",
          image: "/images/hardware/audio/stealth-700.png",
        },
        {
          id: "stealth-700-gen2",
          name: "Turtle Beach Stealth 700 Gen 2",
          image: "/images/hardware/audio/stealth-700-gen2.png",
        },
        {
          id: "stealth-700-gen3",
          name: "Turtle Beach Stealth 700 Gen 3",
          image: "/images/hardware/audio/stealth-700-gen3.png",
        },
        {
          id: "stealth-pro",
          name: "Turtle Beach Stealth Pro",
          image: "/images/hardware/audio/stealth-pro.png",
        },
        {
          id: "stealth-pro-2",
          name: "Turtle Beach Stealth Pro 2",
          image: "/images/hardware/audio/stealth-pro-2.png",
        },
      ],
    },

    {
      id: "turtlebeach-recon",
      name: "Recon",
      versions: [
        {
          id: "recon-50",
          name: "Turtle Beach Recon 50",
          image: "/images/hardware/audio/recon-50.png",
        },
        {
          id: "recon-70",
          name: "Turtle Beach Recon 70",
          image: "/images/hardware/audio/recon-70.png",
        },
        {
          id: "recon-200",
          name: "Turtle Beach Recon 200",
          image: "/images/hardware/audio/recon-200.png",
        },
        {
          id: "recon-500",
          name: "Turtle Beach Recon 500",
          image: "/images/hardware/audio/recon-500.png",
        },
      ],
    },

    {
      id: "turtlebeach-elite",
      name: "Elite",
      versions: [
        {
          id: "elite-atlas",
          name: "Turtle Beach Elite Atlas",
          image: "/images/hardware/audio/elite-atlas.png",
        },
        {
          id: "elite-pro-2",
          name: "Turtle Beach Elite Pro 2",
          image: "/images/hardware/audio/elite-pro-2.png",
        },
      ],
    },

    {
      id: "turtlebeach-earforce",
      name: "Ear Force",
      versions: [
        {
          id: "ear-force-x12",
          name: "Turtle Beach Ear Force X12",
          image: "/images/hardware/audio/ear-force-x12.png",
        },
        {
          id: "ear-force-px22",
          name: "Turtle Beach Ear Force PX22",
          image: "/images/hardware/audio/ear-force-px22.png",
        },
      ],
    },
  ],
},

/* =========================
   ASUS ROG
========================= */

{
  id: "asus-audio",
  brand: "ASUS",
  name: "Casques ASUS ROG",
  type: "audio",
  variants: [
    {
      id: "asus-rog-delta-series",
      name: "ROG Delta",
      versions: [
        audioVersion("asus-rog-delta", "ASUS ROG Delta"),
        audioVersion("asus-rog-delta-s", "ASUS ROG Delta S"),
        audioVersion("asus-rog-delta-s-animate", "ASUS ROG Delta S Animate"),
        audioVersion("asus-rog-delta-s-wireless", "ASUS ROG Delta S Wireless"),
        audioVersion("asus-rog-delta-ii", "ASUS ROG Delta II"),
      ],
    },
    {
      id: "asus-rog-fusion",
      name: "ROG Fusion / Cetra",
      versions: [
        audioVersion("asus-rog-fusion-ii-500", "ASUS ROG Fusion II 500"),
        audioVersion("asus-rog-fusion-ii-300", "ASUS ROG Fusion II 300"),
        audioVersion("asus-rog-cetra-true-wireless", "ASUS ROG Cetra True Wireless"),
        audioVersion("asus-rog-cetra-true-wireless-speednova", "ASUS ROG Cetra True Wireless SpeedNova"),
      ],
    },
  ],
},

/* =========================
   JBL QUANTUM
========================= */

{
  id: "jbl-audio",
  brand: "JBL",
  name: "Casques JBL Quantum",
  type: "audio",
  variants: [
    {
      id: "jbl-quantum",
      name: "Quantum",
      versions: [
        audioVersion("jbl-quantum-100", "JBL Quantum 100"),
        audioVersion("jbl-quantum-200", "JBL Quantum 200"),
        audioVersion("jbl-quantum-300", "JBL Quantum 300"),
        audioVersion("jbl-quantum-400", "JBL Quantum 400"),
        audioVersion("jbl-quantum-600", "JBL Quantum 600"),
        audioVersion("jbl-quantum-800", "JBL Quantum 800"),
        audioVersion("jbl-quantum-910", "JBL Quantum 910"),
        audioVersion("jbl-quantum-910-wireless", "JBL Quantum 910 Wireless"),
        audioVersion("jbl-quantum-one", "JBL Quantum ONE"),
      ],
    },
  ],
},

/* =========================
   EPOS
========================= */

{
  id: "epos-audio",
  brand: "EPOS",
  name: "Casques EPOS",
  type: "audio",
  variants: [
    {
      id: "epos-h-series",
      name: "H Series",
      versions: [
        audioVersion("epos-h3", "EPOS H3"),
        audioVersion("epos-h3-hybrid", "EPOS H3 Hybrid"),
        audioVersion("epos-h3pro-hybrid", "EPOS H3PRO Hybrid"),
        audioVersion("epos-h6pro-open", "EPOS H6PRO Open"),
        audioVersion("epos-h6pro-closed", "EPOS H6PRO Closed"),
      ],
    },
    {
      id: "epos-gsp",
      name: "GSP",
      versions: [
        audioVersion("epos-gsp-300", "EPOS GSP 300"),
        audioVersion("epos-gsp-370", "EPOS GSP 370"),
        audioVersion("epos-gsp-500", "EPOS GSP 500"),
        audioVersion("epos-gsp-600", "EPOS GSP 600"),
        audioVersion("epos-gsp-670", "EPOS GSP 670"),
      ],
    },
  ],
},

/* =========================
   AUDEZE
========================= */

{
  id: "audeze-audio",
  brand: "Audeze",
  name: "Casques Audeze",
  type: "audio",
  variants: [
    {
      id: "audeze-gaming",
      name: "Gaming",
      versions: [
        audioVersion("audeze-maxwell", "Audeze Maxwell"),
        audioVersion("audeze-maxwell-2", "Audeze Maxwell 2"),
        audioVersion("audeze-penrose", "Audeze Penrose"),
        audioVersion("audeze-penrose-x", "Audeze Penrose X"),
        audioVersion("audeze-mobius", "Audeze Mobius"),
        audioVersion("audeze-lcd-gx", "Audeze LCD-GX"),
      ],
    },
  ],
},

/* =========================
   AUDIO-TECHNICA
========================= */

{
  id: "audio-technica-audio",
  brand: "Audio-Technica",
  name: "Casques Audio-Technica",
  type: "audio",
  variants: [
    {
      id: "audio-technica-ath",
      name: "ATH",
      versions: [
        audioVersion("audio-technica-ath-g1", "Audio-Technica ATH-G1"),
        audioVersion("audio-technica-ath-g1wl", "Audio-Technica ATH-G1WL"),
        audioVersion("audio-technica-ath-m50xsts", "Audio-Technica ATH-M50xSTS"),
        audioVersion("audio-technica-ath-m50xsts-usb", "Audio-Technica ATH-M50xSTS USB"),
        audioVersion("audio-technica-ath-adg1x", "Audio-Technica ATH-ADG1X"),
        audioVersion("audio-technica-ath-ag1x", "Audio-Technica ATH-AG1X"),
      ],
    },
  ],
},

/* =========================
   COOLER MASTER
========================= */

{
  id: "cooler-master-audio",
  brand: "Cooler Master",
  name: "Casques Cooler Master",
  type: "audio",
  variants: [
    {
      id: "cooler-master-mh",
      name: "MH Series",
      versions: [
        audioVersion("cooler-master-mh630", "Cooler Master MH630"),
        audioVersion("cooler-master-mh650", "Cooler Master MH650"),
        audioVersion("cooler-master-mh670", "Cooler Master MH670"),
        audioVersion("cooler-master-mh751", "Cooler Master MH751"),
        audioVersion("cooler-master-mh752", "Cooler Master MH752"),
      ],
    },
  ],
},

/* =========================
   ROCCAT
========================= */

{
  id: "roccat-audio",
  brand: "ROCCAT",
  name: "Casques ROCCAT",
  type: "audio",
  variants: [
    {
      id: "roccat-elo",
      name: "Elo",
      versions: [
        audioVersion("roccat-elo-7-1-air", "ROCCAT Elo 7.1 Air"),
        audioVersion("roccat-elo-7-1-usb", "ROCCAT Elo 7.1 USB"),
        audioVersion("roccat-elo-x-stereo", "ROCCAT Elo X Stereo"),
      ],
    },
    {
      id: "roccat-syn",
      name: "Syn",
      versions: [
        audioVersion("roccat-syn-max-air", "ROCCAT Syn Max Air"),
        audioVersion("roccat-syn-pro-air", "ROCCAT Syn Pro Air"),
        audioVersion("roccat-syn-buds", "ROCCAT Syn Buds"),
        audioVersion("roccat-syn-buds-core", "ROCCAT Syn Buds Core"),
        audioVersion("roccat-syn-buds-air", "ROCCAT Syn Buds Air"),
      ],
    },
    {
      id: "roccat-khan-kave",
      name: "Khan / Kave",
      versions: [
        audioVersion("roccat-khan-aimo", "ROCCAT Khan AIMO"),
        audioVersion("roccat-khan-pro", "ROCCAT Khan Pro"),
        audioVersion("roccat-kave-xtd-5-1-analog", "ROCCAT Kave XTD 5.1 Analog"),
        audioVersion("roccat-kave-xtd-5-1-digital", "ROCCAT Kave XTD 5.1 Digital"),
      ],
    },
    {
      id: "roccat-legacy-audio",
      name: "Legacy",
      versions: [
        audioVersion("roccat-renga", "ROCCAT Renga"),
        audioVersion("roccat-renga-boost", "ROCCAT Renga Boost"),
        audioVersion("roccat-cross", "ROCCAT Cross"),
      ],
    },
  ],
},

/* =========================
   MSI / ALIENWARE
========================= */

{
  id: "msi-audio",
  brand: "MSI",
  name: "Casques MSI",
  type: "audio",
  variants: [
    {
      id: "msi-immerse",
      name: "Immerse",
      versions: [
        audioVersion("msi-immerse-gh20", "MSI Immerse GH20"),
        audioVersion("msi-immerse-gh30", "MSI Immerse GH30"),
        audioVersion("msi-immerse-gh50", "MSI Immerse GH50"),
        audioVersion("msi-immerse-gh61", "MSI Immerse GH61"),
      ],
    },
  ],
},

{
  id: "alienware-audio",
  brand: "Alienware",
  name: "Casques Alienware",
  type: "audio",
  variants: [
    {
      id: "alienware-aw",
      name: "AW Series",
      versions: [
        audioVersion("alienware-aw510h", "Alienware AW510H"),
        audioVersion("alienware-aw520h", "Alienware AW520H"),
        audioVersion("alienware-aw720h", "Alienware AW720H"),
        audioVersion("alienware-aw920h", "Alienware AW920H"),
      ],
    },
  ],
},

/* =========================
   XBOX / MICROSOFT
========================= */

{
  id: "xbox-audio",
  brand: "Xbox",
  name: "Casques Xbox",
  type: "audio",
  variants: [
    {
      id: "xbox-wireless",
      name: "Xbox Wireless",
      versions: [
        {
          id: "xbox-wireless-headset",
          name: "Xbox Wireless Headset",
          image: "/images/hardware/audio/xbox-wireless-headset.png",
        },
        {
          id: "xbox-wireless-headset-2024",
          name: "Xbox Wireless Headset 2024",
          image: "/images/hardware/audio/xbox-wireless-headset-2024.png",
        },
      ],
    },

    {
      id: "xbox-stereo",
      name: "Xbox Stereo",
      versions: [
        {
          id: "xbox-stereo-headset",
          name: "Xbox Stereo Headset",
          image: "/images/hardware/audio/xbox-stereo-headset.png",
        },
      ],
    },

    {
      id: "xbox-limited",
      name: "Éditions limitées",
      versions: [
        {
          id: "xbox-starfield-headset",
          name: "Xbox Wireless Headset Starfield",
          image: "/images/hardware/audio/xbox-starfield-headset.png",
        },
      ],
    },
  ],
},

/* =========================
   NINTENDO
========================= */

{
  id: "nintendo-audio",
  brand: "Nintendo",
  name: "Casques Nintendo",
  type: "audio",
  variants: [
    {
      id: "nintendo-official",
      name: "Officiels",
      versions: [

        {
          id: "nintendo-switch-headset-2",
          name: "Nintendo Switch 2 Gaming Headset ",
          image: "/images/hardware/audio/nintendo-switch-headset-2.png",
        },

      ],
    },

    {
      id: "nintendo-pdp",
      name: "PDP",
      versions: [
        {
          id: "pdp-mario-headset",
          name: "PDP Mario Headset",
          image: "/images/hardware/audio/pdp-mario-headset.png",
        },

        {
          id: "pdp-zelda-headset",
          name: "PDP Zelda Headset",
          image: "/images/hardware/audio/pdp-zelda-headset.png",
        },

        {
          id: "pdp-lvl40",
          name: "PDP LVL40",
          image: "/images/hardware/audio/pdp-lvl40.png",
        },
      ],
    },

    {
      id: "nintendo-hori",
      name: "HORI",
      versions: [
        {
          id: "hori-gaming-headset",
          name: "HORI Gaming Headset",
          image: "/images/hardware/audio/hori-gaming-headset.png",
        },

        {
          id: "hori-pikachu-headset",
          name: "HORI Pikachu Headset",
          image: "/images/hardware/audio/hori-pikachu-headset.png",
        },

        {
          id: "hori-splatoon-3-headset",
          name: "Hori Splatoon 3 Headset",
          image: "/images/hardware/audio/hori-splatoon-3-headset.png",
        },
      ],
    },

    {
      id: "nintendo-powera",
      name: "PowerA",
      versions: [
        {
          id: "powera-mario-headset",
          name: "PowerA Mario Headset",
          image: "/images/hardware/audio/powera-mario-headset.png",
        },

        {
          id: "powera-animalcrossing-headset",
          name: "PowerA Animal Crossing Headset",
          image: "/images/hardware/audio/powera-animalcrossing-headset.png",
        },
      ],
    },
  ],
},

{
  id: "apple-audio",
  brand: "Apple",
  name: "Apple Audio",
  type: "audio",
  category: "Audio premium",
  variants: [
    {
      id: "apple-airpods",
      name: "AirPods",
      versions: [
        audioVersion("airpods-max", "AirPods Max"),
        audioVersion("airpods-max-2", "AirPods Max 2"),
        audioVersion("airpods-pro-2", "AirPods Pro 2"),
        audioVersion("airpods-1", "AirPods"),
        audioVersion("airpods-2", "AirPods 2"),
        audioVersion("airpods-3", "AirPods 3"),
        audioVersion("airpods-4", "AirPods 4"),
      ],
    },
    {
      id: "apple-beats",
      name: "Beats",
      versions: [
        audioVersion("beats-studio-pro", "Beats Studio Pro"),
        audioVersion("beats-solo-4", "Beats Solo 4"),
        audioVersion("beats-fit-pro", "Beats Fit Pro"),
      ],
    },
  ],
},

];
