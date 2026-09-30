// CONTENU EXEMPLE À REMPLACER — PRIX EXEMPLE (MAD).
export type Activity = {
  slug: string;
  title: { fr: string; en: string };
  image: string;
  icon: string; // lucide icon name
  short: { fr: string; en: string };
  text: { fr: string; en: string };
  bullets: { fr: string[]; en: string[] };
  price: number; // PRIX EXEMPLE, par personne
};

export const activities: Activity[] = [
  {
    slug: "guide-local",
    title: { fr: "Guide local", en: "Local guide" },
    image: "activity-guide",
    icon: "Compass",
    short: { fr: "Un accompagnateur sur tout le parcours.", en: "A guide for the whole ride." },
    text: {
      fr: "Un accompagnateur connaît les pistes et règle le rythme du groupe. Contenu exemple à remplacer.",
      en: "A guide who knows the tracks and sets the group pace. Sample content to replace.",
    },
    bullets: {
      fr: ["Rythme adapté au groupe", "Français, anglais, arabe", "Conseils de conduite"],
      en: ["Pace adapted to the group", "French, English, Arabic", "Riding tips"],
    },
    price: 350,
  },
  {
    slug: "pique-nique",
    title: { fr: "Pique-nique en montagne", en: "Mountain picnic" },
    image: "activity-picnic",
    icon: "UtensilsCrossed",
    short: {
      fr: "Pause repas préparée sur le parcours.",
      en: "A prepared meal stop on the route.",
    },
    text: {
      fr: "Une pause repas installée sur un point calme du parcours. Contenu exemple à remplacer.",
      en: "A meal break set up at a quiet point on the route. Sample content to replace.",
    },
    bullets: {
      fr: ["Produits locaux", "Option végétarienne", "Installation par l'équipe"],
      en: ["Local produce", "Vegetarian option", "Set up by the team"],
    },
    price: 180,
  },
  {
    slug: "coucher-de-soleil",
    title: { fr: "Coucher de soleil", en: "Sunset stop" },
    image: "activity-sunset",
    icon: "Sunset",
    short: { fr: "Arrêt au point de vue en fin de journée.", en: "Late-day viewpoint stop." },
    text: {
      fr: "Un arrêt prolongé sur un point de vue orienté ouest. Contenu exemple à remplacer.",
      en: "An extended stop at a west-facing viewpoint. Sample content to replace.",
    },
    bullets: {
      fr: ["Boisson chaude", "Retour éclairé", "Durée +45 min"],
      en: ["Hot drink", "Lit return", "+45 min duration"],
    },
    price: 150,
  },
  {
    slug: "photographe",
    title: { fr: "Photographe", en: "Photographer" },
    image: "activity-photographer",
    icon: "Camera",
    short: { fr: "Photos de votre sortie.", en: "Photos of your ride." },
    text: {
      fr: "Un photographe suit une partie du parcours et vous transmet les images. Contenu exemple à remplacer.",
      en: "A photographer follows part of the route and sends you the images. Sample content to replace.",
    },
    bullets: {
      fr: ["Galerie numérique", "Livraison sous 72 h (placeholder)", "Photos de groupe"],
      en: ["Digital gallery", "Delivery within 72 h (placeholder)", "Group photos"],
    },
    price: 450,
  },
  {
    slug: "equipement",
    title: { fr: "Casque et équipement", en: "Helmet and gear" },
    image: "activity-gear",
    icon: "ShieldCheck",
    short: { fr: "Équipement complet fourni.", en: "Full gear provided." },
    text: {
      fr: "Casque, gants et protections adaptés à votre taille. Contenu exemple à remplacer.",
      en: "Helmet, gloves and protection in your size. Sample content to replace.",
    },
    bullets: {
      fr: ["Toutes tailles", "Nettoyé entre chaque sortie", "Protections en option"],
      en: ["All sizes", "Cleaned between rides", "Optional body armour"],
    },
    price: 120,
  },
  {
    slug: "transfert-hotel",
    title: { fr: "Transfert hôtel", en: "Hotel transfer" },
    image: "activity-transfer",
    icon: "Car",
    short: { fr: "Aller-retour depuis votre hébergement.", en: "Return trip from your stay." },
    text: {
      fr: "Prise en charge depuis votre hébergement à Midelt et retour. Contenu exemple à remplacer.",
      en: "Pick-up from your accommodation in Midelt and back. Sample content to replace.",
    },
    bullets: {
      fr: ["Dans Midelt", "Horaire à convenir", "Véhicule climatisé"],
      en: ["Within Midelt", "Time to agree", "Air-conditioned vehicle"],
    },
    price: 200,
  },
  {
    slug: "hebergement-partenaire",
    title: { fr: "Hébergement partenaire", en: "Partner stay" },
    image: "about-eco",
    icon: "BedDouble",
    short: {
      fr: "Nuit chez un partenaire (placeholder).",
      en: "Night at a partner (placeholder).",
    },
    text: {
      fr: "Option d'hébergement pour les circuits multi-jours. Détails à confirmer par l'agence. Contenu exemple à remplacer.",
      en: "Accommodation option for multi-day circuits. Details to be confirmed by the agency. Sample content to replace.",
    },
    bullets: {
      fr: ["Chambre double", "Petit-déjeuner", "À confirmer selon disponibilité"],
      en: ["Double room", "Breakfast", "Subject to availability"],
    },
    price: 600,
  },
];

export const activityBySlug = (slug: string) => activities.find((a) => a.slug === slug);
