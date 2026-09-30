// MOCK bookings service — localStorage only.
export type BookingStatus = "upcoming" | "done" | "cancelled";

export type Booking = {
  id: string;
  reference: string; // TF-2026-XXXX
  ownerEmail: string;
  type: "moto" | "circuit";
  itemSlug: string;
  itemName: string;
  date: string; // ISO date
  slot: "matin" | "apres-midi" | "journee";
  people: number;
  quantity: number;
  addons: string[];
  total: number;
  status: BookingStatus;
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string; phone: string };
};

const KEY = "tiziflow.bookings";
const SEED_FLAG = "tiziflow.bookings.seeded";
const isBrowser = () => typeof window !== "undefined";

export function makeReference() {
  const year = new Date().getFullYear();
  const n = Math.floor(1000 + Math.random() * 9000);
  return `TF-${year}-${n}`;
}

function readAll(): Booking[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeAll(list: Booking[]) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function listBookings(email: string): Booking[] {
  seedDemo();
  return readAll()
    .filter((b) => b.ownerEmail.toLowerCase() === email.toLowerCase())
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getBooking(id: string): Booking | undefined {
  seedDemo();
  return readAll().find((b) => b.id === id || b.reference === id);
}

export async function createBooking(data: Omit<Booking, "id" | "reference" | "createdAt" | "status">) {
  await delay(400);
  const booking: Booking = {
    ...data,
    id: crypto.randomUUID(),
    reference: makeReference(),
    createdAt: new Date().toISOString(),
    status: "upcoming",
  };
  writeAll([...readAll(), booking]);
  return booking;
}

export async function cancelBooking(id: string) {
  await delay(400);
  writeAll(readAll().map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b)));
}

/** Seed 3 sample bookings for the demo account (demo behaviour only). */
export function seedDemo() {
  if (!isBrowser() || localStorage.getItem(SEED_FLAG)) return;
  const today = new Date();
  const iso = (offsetDays: number) =>
    new Date(today.getTime() + offsetDays * 86400000).toISOString().slice(0, 10);
  const base = {
    ownerEmail: "demo@tiziflow.ma",
    customer: {
      firstName: "Demo",
      lastName: "TiziFlow",
      email: "demo@tiziflow.ma",
      phone: "+212 600 000 000",
    },
    addons: [] as string[],
    quantity: 1,
  };
  const seeded: Booking[] = [
    {
      ...base,
      id: "seed-1",
      reference: "TF-2026-1001",
      type: "circuit",
      itemSlug: "panorama-des-cretes",
      itemName: "Panorama des crêtes",
      date: iso(14),
      slot: "journee",
      people: 2,
      total: 2300,
      status: "upcoming",
      createdAt: new Date().toISOString(),
    },
    {
      ...base,
      id: "seed-2",
      reference: "TF-2026-1002",
      type: "moto",
      itemSlug: "e-trail-1",
      itemName: "E-Trail 1",
      date: iso(-30),
      slot: "matin",
      people: 1,
      total: 550,
      status: "done",
      createdAt: new Date().toISOString(),
    },
    {
      ...base,
      id: "seed-3",
      reference: "TF-2026-1003",
      type: "circuit",
      itemSlug: "coucher-de-soleil-en-montagne",
      itemName: "Coucher de soleil en montagne",
      date: iso(-7),
      slot: "apres-midi",
      people: 3,
      total: 2160,
      status: "cancelled",
      createdAt: new Date().toISOString(),
    },
  ];
  writeAll([...readAll(), ...seeded]);
  localStorage.setItem(SEED_FLAG, "1");
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
