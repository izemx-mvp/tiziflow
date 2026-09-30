/**
 * Read-only helpers over the data files (circuits, motos, activities).
 * Field names are read defensively so the pages keep working if a data file
 * uses `price` or `priceFrom`, `image` or `images`, etc. Adjust the key lists
 * below if your data files use other names.
 */
import type { ComponentProps } from "react";
import type { ImageSlot } from "@/components/brand/ImageSlot";
import { circuits, difficultyLabel } from "@/data/circuits";
import { motos } from "@/data/motos";
import { activities } from "@/data/activities";

export type Lang = "fr" | "en";
export type Slot = ComponentProps<typeof ImageSlot>["slot"];
export type Circuit = (typeof circuits)[number];
export type Moto = (typeof motos)[number];
export type Activity = (typeof activities)[number];
export type TimeSlot = "morning" | "afternoon" | "day";

const FALLBACK_SLOT = "hero-main" as Slot;

function get(o: unknown, keys: string[]): unknown {
  if (!o || typeof o !== "object") return undefined;
  for (const k of keys) {
    const v = (o as Record<string, unknown>)[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

function toText(v: unknown, lang: Lang): string | undefined {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (v && typeof v === "object") {
    const r = v as Record<string, unknown>;
    const x = r[lang] ?? r["fr"];
    if (typeof x === "string") return x;
  }
  return undefined;
}

function toNum(v: unknown): number | undefined {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return undefined;
}

function toSlot(v: unknown): Slot | undefined {
  if (typeof v === "string") return v as Slot;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0] as Slot;
  if (Array.isArray(v) && v[0] && typeof v[0] === "object") return toSlot(get(v[0], ["slot", "src"]));
  if (v && typeof v === "object") return toSlot(get(v, ["slot", "src"]));
  return undefined;
}

/* Lookups */
export const findCircuit = (slug?: string) => (slug ? circuits.find((c) => c.slug === slug) : undefined);
export const findMoto = (slug?: string) => (slug ? motos.find((m) => m.slug === slug) : undefined);
export const findActivity = (slug?: string) => (slug ? activities.find((a) => a.slug === slug) : undefined);

/* Circuits */
export const circuitName = (c: Circuit, lang: Lang) => c.title[lang];
export const circuitPrice = (c: Circuit) =>
  toNum(get(c, ["price", "priceFrom", "fromPrice", "basePrice", "pricePerPerson"])) ?? 0;
export const circuitDuration = (c: Circuit, lang: Lang) => toText(get(c, ["durationLabel", "duration"]), lang) ?? "";
export const circuitDifficulty = (c: Circuit, lang: Lang) => difficultyLabel[c.difficulty][lang];
export const circuitImage = (c: Circuit): Slot =>
  toSlot(get(c, ["image", "cover", "heroImage", "images", "slot"])) ?? FALLBACK_SLOT;
/** Motos allowed on a circuit (all motos if the circuit has no `compatibleMotos` list). */
export const compatibleMotos = (c?: Circuit): Moto[] => {
  const list = c ? get(c, ["compatibleMotos"]) : undefined;
  return Array.isArray(list) ? motos.filter((m) => list.includes(m.slug)) : [...motos];
};

/* Motos */
export const motoName = (m: Moto, lang: Lang) => toText(get(m, ["name", "title"]), lang) ?? m.slug;
export const motoSupplement = (m: Moto) => toNum(get(m, ["supplement"])) ?? 0;
export const motoImage = (m: Moto): Slot => toSlot(get(m, ["image", "cover", "images", "slot"])) ?? FALLBACK_SLOT;
export const motoRange = (m: Moto, lang: Lang) => {
  const km = toNum(get(get(m, ["specs"]), ["autonomyKm", "autonomy", "range"]));
  return km !== undefined ? `${km} km` : toText(get(m, ["autonomy", "range"]), lang);
};

/* Activities */
export const activityName = (a: Activity, lang: Lang) => a.title[lang];
export const activityShort = (a: Activity, lang: Lang) => a.short[lang];
export const activityPrice = (a: Activity) => toNum(get(a, ["price", "priceFrom"])) ?? 0;

/* Formatting */
export const formatMAD = (n: number, lang: Lang) =>
  `${new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-GB").format(n)} MAD`;

export const formatDate = (iso: string, lang: Lang, withWeekday = false) =>
  new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    weekday: withWeekday ? "long" : undefined,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));

const pad = (n: number) => String(n).padStart(2, "0");
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISO(new Date());

const SLOT_LABELS: Record<TimeSlot, Record<Lang, string>> = {
  morning: { fr: "Matin", en: "Morning" },
  afternoon: { fr: "Après-midi", en: "Afternoon" },
  day: { fr: "Journée complète", en: "Full day" },
};
export const slotLabel = (s: TimeSlot, lang: Lang) => SLOT_LABELS[s][lang];