// CONTENU EXEMPLE À REMPLACER — all placeholders below are editable.
export const site = {
  name: "TiziFlow",
  city: "Midelt",
  country: "Maroc",
  // Coordonnées approximatives de Midelt
  coords: { lat: 32.68, lng: -4.74 },
  phone: "+212 6 00 00 00 00",
  whatsapp: "212600000000", // wa.me placeholder
  whatsappMessage: "Bonjour, je souhaite réserver une excursion…",
  email: "contact@tiziflow.ma",
  address: "Avenue exemple, Midelt, Maroc",
  hours: "Lun – Dim · 08:00 – 19:00",
  socials: {
    instagram: "#",
    facebook: "#",
    youtube: "#",
  },
  currency: "MAD",
  // CHIFFRES — placeholders éditables
  figures: [
    { valueFr: 5, suffix: "", labelFr: "circuits guidés", labelEn: "guided circuits" },
    { valueFr: 5, suffix: "", labelFr: "motos électriques", labelEn: "electric motorbikes" },
    { valueFr: 120, suffix: " km", labelFr: "de pistes explorées", labelEn: "of tracks explored" },
    { valueFr: 7, suffix: "", labelFr: "activités & services", labelEn: "activities & services" },
  ],
} as const;

export const whatsappLink = (message = site.whatsappMessage) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
