import { motos } from "@/data/motos";
import { circuits } from "@/data/circuits";
import { activities } from "@/data/activities";
import { site } from "@/config/site";

/** Compact JSON summary sent with each request. No storage anywhere. */
export function buildCatalog(lang: "fr" | "en") {
  return {
    agency: {
      name: site.name,
      city: site.city,
      email: site.email,
      phone: site.phone,
      hours: site.hours,
      note:
        lang === "fr"
          ? "Agence récente. Prix et conditions indicatifs, à confirmer par l'agence."
          : "New agency. Prices and conditions are indicative and confirmed by the agency.",
    },
    motos: motos.map((m) => ({
      slug: m.slug,
      name: m.name,
      category: m.category,
      autonomyKm: m.specs.autonomyKm,
      topSpeedKmh: m.specs.topSpeedKmh,
      seats: m.specs.seats,
      pricePerDayMAD: m.pricePerDay,
      pricePerHalfDayMAD: m.pricePerHalfDay,
      description: m.description[lang],
    })),
    circuits: circuits.map((c) => ({
      slug: c.slug,
      title: c.title[lang],
      duration: c.durationLabel[lang],
      distanceKm: c.distanceKm,
      difficulty: c.difficulty,
      theme: c.theme,
      maxParticipants: c.maxParticipants,
      pricePerPersonMAD: c.pricePerPerson,
      description: c.description[lang],
    })),
    activities: activities.map((a) => ({
      slug: a.slug,
      title: a.title[lang],
      priceMAD: a.price,
      short: a.short[lang],
    })),
    booking: {
      steps: ["choice", "date", "options", "details", "payment"],
      guestAllowed: true,
      claimsFrom: "/compte/reclamations",
      url: "/reservation",
    },
  };
}
