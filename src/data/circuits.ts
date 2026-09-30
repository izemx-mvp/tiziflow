// CONTENU EXEMPLE À REMPLACER — sample circuits around Midelt (~32.68 N, -4.74 W).
// Coordinates are approximate and illustrative only. PRIX EXEMPLE (MAD).
export type Difficulty = "facile" | "intermediaire" | "sportif";
export type CircuitDuration = "demi-journee" | "journee" | "multi-jours";
export type CircuitTheme = "nature" | "culture" | "panorama";

export type Stop = {
  name: { fr: string; en: string };
  text: { fr: string; en: string };
  coords: [number, number];
};

export type Circuit = {
  slug: string;
  title: { fr: string; en: string };
  image: string;
  gallery: string[];
  durationType: CircuitDuration;
  durationLabel: { fr: string; en: string };
  distanceKm: number;
  elevationM: number;
  difficulty: Difficulty;
  theme: CircuitTheme;
  maxParticipants: number;
  pricePerPerson: number; // PRIX EXEMPLE
  color: string;
  description: { fr: string; en: string };
  included: { fr: string[]; en: string[] };
  excluded: { fr: string[]; en: string[] };
  route: [number, number][];
  stops: Stop[];
};

export const circuits: Circuit[] = [
  {
    slug: "boucle-decouverte-midelt",
    title: { fr: "Boucle Découverte de Midelt", en: "Midelt Discovery Loop" },
    image: "circuit-decouverte",
    gallery: ["circuit-decouverte", "circuit-panorama", "activity-guide"],
    durationType: "demi-journee",
    durationLabel: { fr: "Demi-journée · 3 h", en: "Half day · 3 h" },
    distanceKm: 35,
    elevationM: 320,
    difficulty: "facile",
    theme: "nature",
    maxParticipants: 8,
    pricePerPerson: 650,
    color: "#C4622B",
    description: {
      fr: "Une première boucle accessible autour de Midelt, sur pistes larges et roulantes. Contenu exemple à remplacer.",
      en: "An accessible first loop around Midelt on wide, rolling tracks. Sample content to replace.",
    },
    included: {
      fr: ["Moto électrique", "Guide accompagnateur", "Casque et équipement"],
      en: ["Electric motorbike", "Guide", "Helmet and gear"],
    },
    excluded: { fr: ["Repas", "Transport jusqu'à Midelt"], en: ["Meals", "Transport to Midelt"] },
    route: [
      [32.68, -4.74],
      [32.7, -4.72],
      [32.72, -4.7],
      [32.71, -4.66],
      [32.68, -4.67],
      [32.68, -4.74],
    ],
    stops: [
      {
        name: { fr: "Point de départ", en: "Start point" },
        text: { fr: "Briefing et prise en main des motos.", en: "Briefing and bike handover." },
        coords: [32.68, -4.74],
      },
      {
        name: { fr: "Plateau ouvert", en: "Open plateau" },
        text: { fr: "Pause photo sur un plateau dégagé.", en: "Photo stop on an open plateau." },
        coords: [32.72, -4.7],
      },
      {
        name: { fr: "Retour", en: "Return" },
        text: { fr: "Retour à la base et débriefing.", en: "Back to base and debrief." },
        coords: [32.68, -4.74],
      },
    ],
  },
  {
    slug: "panorama-des-cretes",
    title: { fr: "Panorama des crêtes", en: "Ridge Panorama" },
    image: "circuit-panorama",
    gallery: ["circuit-panorama", "circuit-decouverte", "activity-sunset"],
    durationType: "journee",
    durationLabel: { fr: "Journée · 6 h", en: "Full day · 6 h" },
    distanceKm: 70,
    elevationM: 900,
    difficulty: "intermediaire",
    theme: "panorama",
    maxParticipants: 6,
    pricePerPerson: 1150,
    color: "#0F9A8B",
    description: {
      fr: "Montée progressive vers une ligne de crêtes et points de vue étendus sur la vallée. Contenu exemple à remplacer.",
      en: "A gradual climb to a ridge line with wide views over the valley. Sample content to replace.",
    },
    included: {
      fr: ["Moto électrique", "Guide accompagnateur", "Pique-nique"],
      en: ["Electric motorbike", "Guide", "Picnic"],
    },
    excluded: { fr: ["Boissons supplémentaires"], en: ["Extra drinks"] },
    route: [
      [32.68, -4.74],
      [32.65, -4.78],
      [32.62, -4.83],
      [32.6, -4.88],
      [32.63, -4.92],
    ],
    stops: [
      {
        name: { fr: "Départ Midelt", en: "Midelt start" },
        text: { fr: "Départ depuis la base.", en: "Departure from the base." },
        coords: [32.68, -4.74],
      },
      {
        name: { fr: "Col intermédiaire", en: "Mid pass" },
        text: { fr: "Pause et vue sur la vallée.", en: "Break with a valley view." },
        coords: [32.62, -4.83],
      },
      {
        name: { fr: "Crête panoramique", en: "Panoramic ridge" },
        text: { fr: "Point de vue principal du circuit.", en: "Main viewpoint of the circuit." },
        coords: [32.63, -4.92],
      },
    ],
  },
  {
    slug: "vallee-et-villages",
    title: { fr: "Vallée et villages", en: "Valley and Villages" },
    image: "circuit-vallee",
    gallery: ["circuit-vallee", "activity-guide", "activity-picnic"],
    durationType: "journee",
    durationLabel: { fr: "Journée · 5 h", en: "Full day · 5 h" },
    distanceKm: 55,
    elevationM: 480,
    difficulty: "facile",
    theme: "culture",
    maxParticipants: 8,
    pricePerPerson: 980,
    color: "#17C3AB",
    description: {
      fr: "Itinéraire tranquille le long d'une vallée verte, avec arrêts dans les environs habités. Contenu exemple à remplacer.",
      en: "A calm route along a green valley with stops in the inhabited surroundings. Sample content to replace.",
    },
    included: {
      fr: ["Moto électrique", "Guide local", "Thé en cours de route"],
      en: ["Electric motorbike", "Local guide", "Tea along the way"],
    },
    excluded: { fr: ["Déjeuner"], en: ["Lunch"] },
    route: [
      [32.68, -4.74],
      [32.71, -4.79],
      [32.74, -4.83],
      [32.76, -4.79],
      [32.72, -4.75],
    ],
    stops: [
      {
        name: { fr: "Départ", en: "Start" },
        text: { fr: "Départ depuis Midelt.", en: "Departure from Midelt." },
        coords: [32.68, -4.74],
      },
      {
        name: { fr: "Bord de vallée", en: "Valley edge" },
        text: { fr: "Arrêt au bord de la vallée.", en: "Stop at the valley edge." },
        coords: [32.74, -4.83],
      },
    ],
  },
  {
    slug: "coucher-de-soleil-en-montagne",
    title: { fr: "Coucher de soleil en montagne", en: "Mountain Sunset" },
    image: "circuit-sunset",
    gallery: ["circuit-sunset", "activity-sunset", "circuit-panorama"],
    durationType: "demi-journee",
    durationLabel: { fr: "Demi-journée · 3 h", en: "Half day · 3 h" },
    distanceKm: 30,
    elevationM: 350,
    difficulty: "facile",
    theme: "panorama",
    maxParticipants: 8,
    pricePerPerson: 720,
    color: "#12303A",
    description: {
      fr: "Sortie de fin de journée vers un point de vue orienté ouest pour le coucher de soleil. Contenu exemple à remplacer.",
      en: "Late-day ride to a west-facing viewpoint for sunset. Sample content to replace.",
    },
    included: {
      fr: ["Moto électrique", "Guide", "Boisson chaude au point de vue"],
      en: ["Electric motorbike", "Guide", "Hot drink at the viewpoint"],
    },
    excluded: { fr: ["Dîner"], en: ["Dinner"] },
    route: [
      [32.68, -4.74],
      [32.66, -4.7],
      [32.64, -4.66],
      [32.66, -4.62],
    ],
    stops: [
      {
        name: { fr: "Départ", en: "Start" },
        text: { fr: "Départ en fin d'après-midi.", en: "Late afternoon departure." },
        coords: [32.68, -4.74],
      },
      {
        name: { fr: "Point de vue ouest", en: "West viewpoint" },
        text: { fr: "Arrêt pour le coucher de soleil.", en: "Sunset stop." },
        coords: [32.66, -4.62],
      },
    ],
  },
  {
    slug: "grande-traversee-2-jours",
    title: { fr: "Grande traversée 2 jours", en: "Two-Day Crossing" },
    image: "circuit-traversee",
    gallery: ["circuit-traversee", "circuit-panorama", "activity-picnic"],
    durationType: "multi-jours",
    durationLabel: { fr: "2 jours · 1 nuit", en: "2 days · 1 night" },
    distanceKm: 160,
    elevationM: 1800,
    difficulty: "sportif",
    theme: "nature",
    maxParticipants: 5,
    pricePerPerson: 2800,
    color: "#8A5A2B",
    description: {
      fr: "Traversée sur deux jours entre montagne et plateaux, avec une nuit en hébergement partenaire. Contenu exemple à remplacer.",
      en: "Two-day crossing between mountains and plateaus, with one night at a partner stay. Sample content to replace.",
    },
    included: {
      fr: ["Moto électrique", "Guide", "Nuitée (placeholder)", "Repas (placeholder)"],
      en: ["Electric motorbike", "Guide", "Overnight (placeholder)", "Meals (placeholder)"],
    },
    excluded: { fr: ["Dépenses personnelles"], en: ["Personal expenses"] },
    route: [
      [32.68, -4.74],
      [32.6, -4.8],
      [32.52, -4.86],
      [32.46, -4.78],
      [32.5, -4.68],
      [32.6, -4.66],
    ],
    stops: [
      {
        name: { fr: "Jour 1 — départ", en: "Day 1 — start" },
        text: { fr: "Départ matinal depuis Midelt.", en: "Early departure from Midelt." },
        coords: [32.68, -4.74],
      },
      {
        name: { fr: "Étape nuit", en: "Overnight stage" },
        text: { fr: "Hébergement partenaire (placeholder).", en: "Partner stay (placeholder)." },
        coords: [32.46, -4.78],
      },
      {
        name: { fr: "Jour 2 — retour", en: "Day 2 — return" },
        text: { fr: "Retour par un autre itinéraire.", en: "Return on a different route." },
        coords: [32.6, -4.66],
      },
    ],
  },
];

export const circuitBySlug = (slug: string) => circuits.find((c) => c.slug === slug);

export const difficultyLabel: Record<Difficulty, { fr: string; en: string; level: number }> = {
  facile: { fr: "Facile", en: "Easy", level: 1 },
  intermediaire: { fr: "Intermédiaire", en: "Intermediate", level: 2 },
  sportif: { fr: "Sportif", en: "Demanding", level: 3 },
};

export const durationLabelMap: Record<CircuitDuration, { fr: string; en: string }> = {
  "demi-journee": { fr: "Demi-journée", en: "Half day" },
  journee: { fr: "Journée", en: "Full day" },
  "multi-jours": { fr: "Multi-jours", en: "Multi-day" },
};

export const themeLabel: Record<CircuitTheme, { fr: string; en: string }> = {
  nature: { fr: "Nature", en: "Nature" },
  culture: { fr: "Culture", en: "Culture" },
  panorama: { fr: "Panorama", en: "Panorama" },
};
