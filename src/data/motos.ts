// CONTENU EXEMPLE À REMPLACER — sample data only. PRIX EXEMPLE (MAD).
export type MotoCategory = "trail" | "decouverte" | "confort";

export type Moto = {
  slug: string;
  name: string;
  category: MotoCategory;
  images: string[]; // ImageSlot keys
  specs: {
    autonomyKm: number;
    topSpeedKmh: number;
    chargeHours: number;
    powerKw: number;
    seats: number;
    weightKg: number;
  };
  pricePerDay: number; // PRIX EXEMPLE
  pricePerHalfDay: number; // PRIX EXEMPLE
  description: { fr: string; en: string };
  features: { fr: string[]; en: string[] };
  included: { fr: string[]; en: string[] };
};

export const motos: Moto[] = [
  {
    slug: "e-trail-1",
    name: "E-Trail 1",
    category: "trail",
    images: ["moto-trail", "moto-trail-detail-1", "moto-trail-detail-2"],
    specs: {
      autonomyKm: 110,
      topSpeedKmh: 90,
      chargeHours: 4,
      powerKw: 11,
      seats: 1,
      weightKg: 98,
    },
    pricePerDay: 900,
    pricePerHalfDay: 550,
    description: {
      fr: "Moto trail électrique polyvalente, à l'aise sur les pistes de montagne comme sur les routes d'accès. Contenu exemple à remplacer.",
      en: "Versatile electric trail bike, at ease on mountain tracks and access roads alike. Sample content to replace.",
    },
    features: {
      fr: ["Suspensions longue course", "Mode éco et mode sport", "Freins à disque avant/arrière"],
      en: ["Long-travel suspension", "Eco and sport modes", "Front/rear disc brakes"],
    },
    included: {
      fr: ["Casque", "Gants", "Briefing de prise en main"],
      en: ["Helmet", "Gloves", "Handover briefing"],
    },
  },
  {
    slug: "e-trail-2",
    name: "E-Trail 2",
    category: "trail",
    images: ["moto-trail-2", "moto-trail-detail-1", "moto-trail-detail-2"],
    specs: {
      autonomyKm: 130,
      topSpeedKmh: 100,
      chargeHours: 5,
      powerKw: 14,
      seats: 1,
      weightKg: 104,
    },
    pricePerDay: 1050,
    pricePerHalfDay: 620,
    description: {
      fr: "Version plus puissante du trail, pour les itinéraires sportifs et les dénivelés marqués. Contenu exemple à remplacer.",
      en: "A more powerful trail version for sporty routes and steeper climbs. Sample content to replace.",
    },
    features: {
      fr: ["Batterie grande capacité", "Pneus crantés", "Protège-mains"],
      en: ["High-capacity battery", "Knobby tyres", "Hand guards"],
    },
    included: {
      fr: ["Casque", "Gants", "Briefing de prise en main"],
      en: ["Helmet", "Gloves", "Handover briefing"],
    },
  },
  {
    slug: "e-discovery",
    name: "E-Discovery",
    category: "decouverte",
    images: ["moto-discovery", "moto-discovery-detail-1", "moto-discovery-detail-2"],
    specs: { autonomyKm: 90, topSpeedKmh: 75, chargeHours: 3, powerKw: 8, seats: 1, weightKg: 88 },
    pricePerDay: 750,
    pricePerHalfDay: 450,
    description: {
      fr: "Modèle accessible et léger, idéal pour une première sortie en moto électrique. Contenu exemple à remplacer.",
      en: "Accessible, lightweight model, ideal for a first electric ride. Sample content to replace.",
    },
    features: {
      fr: ["Selle basse", "Conduite souple", "Faible poids"],
      en: ["Low seat", "Smooth delivery", "Light weight"],
    },
    included: {
      fr: ["Casque", "Gants", "Briefing de prise en main"],
      en: ["Helmet", "Gloves", "Handover briefing"],
    },
  },
  {
    slug: "e-comfort",
    name: "E-Comfort",
    category: "confort",
    images: ["moto-comfort", "moto-comfort-detail-1", "moto-comfort-detail-2"],
    specs: {
      autonomyKm: 120,
      topSpeedKmh: 85,
      chargeHours: 4,
      powerKw: 10,
      seats: 2,
      weightKg: 112,
    },
    pricePerDay: 980,
    pricePerHalfDay: 590,
    description: {
      fr: "Deux places et position de conduite confortable pour rouler à deux sur les pistes faciles. Contenu exemple à remplacer.",
      en: "Two seats and a comfortable riding position for easy tracks in pairs. Sample content to replace.",
    },
    features: {
      fr: ["Selle biplace", "Repose-pieds passager", "Porte-bagages"],
      en: ["Two-up seat", "Passenger footpegs", "Luggage rack"],
    },
    included: {
      fr: ["2 casques", "Gants", "Briefing de prise en main"],
      en: ["2 helmets", "Gloves", "Handover briefing"],
    },
  },
  {
    slug: "e-adventure",
    name: "E-Adventure",
    category: "trail",
    images: ["moto-adventure", "moto-adventure-detail-1", "moto-adventure-detail-2"],
    specs: {
      autonomyKm: 150,
      topSpeedKmh: 105,
      chargeHours: 6,
      powerKw: 16,
      seats: 1,
      weightKg: 118,
    },
    pricePerDay: 1200,
    pricePerHalfDay: 700,
    description: {
      fr: "Conçue pour les longues distances et les traversées sur plusieurs jours. Contenu exemple à remplacer.",
      en: "Built for long distances and multi-day crossings. Sample content to replace.",
    },
    features: {
      fr: ["Autonomie étendue", "Sacoches latérales", "Protection moteur"],
      en: ["Extended range", "Side panniers", "Motor guard"],
    },
    included: {
      fr: ["Casque", "Gants", "Briefing de prise en main"],
      en: ["Helmet", "Gloves", "Handover briefing"],
    },
  },
];

export const motoBySlug = (slug: string) => motos.find((m) => m.slug === slug);

export const motoCategoryLabel: Record<MotoCategory, { fr: string; en: string }> = {
  trail: { fr: "Trail", en: "Trail" },
  decouverte: { fr: "Découverte", en: "Discovery" },
  confort: { fr: "Confort", en: "Comfort" },
};
