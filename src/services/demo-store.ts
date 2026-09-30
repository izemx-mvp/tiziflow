/**
 * DEMO MODE — everything is stored in the visitor's browser (localStorage).
 * No backend, no database, no real payment. Replace these functions with API
 * calls when the real backend exists; the pages only use the exports below.
 */
import { useSyncExternalStore } from "react";
import { circuits } from "@/data/circuits";
import { motos } from "@/data/motos";
import type { TimeSlot } from "@/lib/catalog";

export type DemoUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};
type StoredUser = DemoUser & { password: string };

export type BookingStatus = "upcoming" | "completed" | "cancelled";
export type Booking = {
  id: string;
  ref: string;
  createdAt: string;
  ownerEmail: string;
  circuitSlug: string;
  date: string;
  slot: TimeSlot;
  riders: number;
  motos: string[];
  options: string[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality: string;
    experience: string;
    notes: string;
  };
  total: number;
  status: BookingStatus;
};

export type ClaimStatus = "received" | "in_progress" | "answered" | "closed";
export type Claim = {
  id: string;
  ref: string;
  ownerEmail: string;
  bookingRef?: string;
  category: string;
  subject: string;
  message?: string;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
};

export const DEMO_EMAIL = "demo@tiziflow.ma";
export const DEMO_PASSWORD = "Demo1234";

const K = {
  users: "tf:users",
  session: "tf:session",
  bookings: "tf:bookings",
  claims: "tf:claims",
  seeded: "tf:seeded:v1",
};

const isBrowser = typeof window !== "undefined";
let version = 0;
const listeners = new Set<() => void>();
const emit = () => {
  version++;
  listeners.forEach((l) => l());
};

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or disabled: demo keeps working in memory for this render */
  }
  emit();
}

const uid = () => Math.random().toString(36).slice(2, 10);
export const makeRef = (prefix: "TF" | "RC") =>
  `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

const isoIn = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

/** Seeds the demo account with sample bookings and claims (once per browser). */
function ensureSeed() {
  if (!isBrowser || localStorage.getItem(K.seeded)) return;

  const demo: StoredUser = {
    id: "demo",
    firstName: "Compte",
    lastName: "Démo",
    email: DEMO_EMAIL,
    phone: "+212 600 000 000",
    password: DEMO_PASSWORD,
  };
  const c = (i: number) => circuits[i % Math.max(circuits.length, 1)]?.slug ?? "circuit";
  const m = (i: number) => motos[i % Math.max(motos.length, 1)]?.slug ?? "moto";
  const customer = {
    firstName: demo.firstName,
    lastName: demo.lastName,
    email: DEMO_EMAIL,
    phone: demo.phone,
    nationality: "",
    experience: "beginner",
    notes: "",
  };

  const bookings: Booking[] = [
    {
      id: uid(),
      ref: "TF-2026-1042",
      createdAt: isoIn(-8),
      ownerEmail: DEMO_EMAIL,
      circuitSlug: c(0),
      date: isoIn(14),
      slot: "morning",
      riders: 2,
      motos: [m(0), m(1)],
      options: [],
      customer,
      total: 1400,
      status: "upcoming",
    },
    {
      id: uid(),
      ref: "TF-2026-0987",
      createdAt: isoIn(-40),
      ownerEmail: DEMO_EMAIL,
      circuitSlug: c(1),
      date: isoIn(-25),
      slot: "day",
      riders: 1,
      motos: [m(2)],
      options: [],
      customer,
      total: 900,
      status: "completed",
    },
    {
      id: uid(),
      ref: "TF-2026-0911",
      createdAt: isoIn(-60),
      ownerEmail: DEMO_EMAIL,
      circuitSlug: c(2),
      date: isoIn(-45),
      slot: "afternoon",
      riders: 3,
      motos: [m(0), m(0), m(1)],
      options: [],
      customer,
      total: 1800,
      status: "cancelled",
    },
  ];

  const claims: Claim[] = [
    {
      id: uid(),
      ref: "RC-2026-2031",
      ownerEmail: DEMO_EMAIL,
      bookingRef: "TF-2026-0987",
      category: "service",
      subject: "Heure de départ du circuit",
      status: "answered",
      createdAt: isoIn(-22),
      updatedAt: isoIn(-20),
    },
    {
      id: uid(),
      ref: "RC-2026-2077",
      ownerEmail: DEMO_EMAIL,
      bookingRef: "TF-2026-1042",
      category: "moto",
      subject: "Changement de moto",
      status: "received",
      createdAt: isoIn(-2),
      updatedAt: isoIn(-2),
    },
  ];

  const users = read<StoredUser[]>(K.users, []);
  if (!users.some((u) => u.email === DEMO_EMAIL)) users.push(demo);
  try {
    localStorage.setItem(K.users, JSON.stringify(users));
    localStorage.setItem(
      K.bookings,
      JSON.stringify([...read<Booking[]>(K.bookings, []), ...bookings]),
    );
    localStorage.setItem(K.claims, JSON.stringify([...read<Claim[]>(K.claims, []), ...claims]));
    localStorage.setItem(K.seeded, "1");
  } catch {
    /* ignore */
  }
}

/* ---------------- subscriptions ---------------- */

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith("tf:")) emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const noopSubscribe = () => () => {};
/** false on the server and during hydration, true afterwards (avoids SSR mismatches). */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
function useStoreVersion() {
  return useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
}

/* ---------------- auth ---------------- */

function currentUser(): DemoUser | null {
  ensureSeed();
  const email = read<string | null>(K.session, null);
  if (!email) return null;
  const u = read<StoredUser[]>(K.users, []).find((x) => x.email === email);
  if (!u) return null;
  const { password: _password, ...user } = u;
  return user;
}

export const auth = {
  login(email: string, password: string): DemoUser | null {
    ensureSeed();
    const u = read<StoredUser[]>(K.users, []).find(
      (x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password,
    );
    if (!u) return null;
    write(K.session, u.email);
    const { password: _password, ...user } = u;
    return user;
  },
  register(
    data: Omit<DemoUser, "id"> & { password: string },
  ): { ok: true } | { ok: false; error: "exists" } {
    ensureSeed();
    const users = read<StoredUser[]>(K.users, []);
    const email = data.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === email)) return { ok: false, error: "exists" };
    users.push({ ...data, email, id: uid() });
    write(K.users, users);
    write(K.session, email);
    return { ok: true };
  },
  logout() {
    write(K.session, null);
  },
  update(patch: Partial<Omit<DemoUser, "id" | "email">>) {
    const email = read<string | null>(K.session, null);
    if (!email) return;
    write(
      K.users,
      read<StoredUser[]>(K.users, []).map((u) => (u.email === email ? { ...u, ...patch } : u)),
    );
  },
};

export function useAuth() {
  const hydrated = useHydrated();
  useStoreVersion();
  const user = hydrated ? currentUser() : null;
  return {
    user,
    ready: hydrated,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    updateProfile: auth.update,
  };
}

/* ---------------- bookings & claims ---------------- */

export const bookingsApi = {
  list(email: string): Booking[] {
    ensureSeed();
    return read<Booking[]>(K.bookings, [])
      .filter((b) => b.ownerEmail.toLowerCase() === email.toLowerCase())
      .sort((a, b) => b.date.localeCompare(a.date));
  },
  add(data: Omit<Booking, "id" | "ref" | "createdAt" | "status">): Booking {
    const booking: Booking = {
      ...data,
      id: uid(),
      ref: makeRef("TF"),
      createdAt: new Date().toISOString().slice(0, 10),
      status: "upcoming",
    };
    write(K.bookings, [...read<Booking[]>(K.bookings, []), booking]);
    return booking;
  },
};

export const claimsApi = {
  list(email: string): Claim[] {
    ensureSeed();
    return read<Claim[]>(K.claims, [])
      .filter((c) => c.ownerEmail.toLowerCase() === email.toLowerCase())
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  add(data: Pick<Claim, "ownerEmail" | "bookingRef" | "category" | "subject" | "message">): Claim {
    const today = new Date().toISOString().slice(0, 10);
    const claim: Claim = {
      ...data,
      id: uid(),
      ref: makeRef("RC"),
      status: "received",
      createdAt: today,
      updatedAt: today,
    };
    write(K.claims, [...read<Claim[]>(K.claims, []), claim]);
    return claim;
  },
};

export function useBookings(email?: string | null) {
  const hydrated = useHydrated();
  useStoreVersion();
  return hydrated && email ? bookingsApi.list(email) : [];
}

export function useClaims(email?: string | null) {
  const hydrated = useHydrated();
  useStoreVersion();
  return hydrated && email ? claimsApi.list(email) : [];
}

/* ---------------- availability & payment ---------------- */

export type Availability = "available" | "few" | "full";

/** Deterministic mock availability: same circuit + date always gives the same result. */
export function availabilityFor(
  circuitSlug: string,
  date: string,
): { status: Availability; remaining: number } {
  let h = 7;
  for (const ch of `${circuitSlug}|${date}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const remaining = h % 9; // 0..8 motorbikes left
  return { status: remaining === 0 ? "full" : remaining <= 2 ? "few" : "available", remaining };
}

/** Mock card payment: always succeeds after 1.5s, except test card 4000 0000 0000 0002. */
export async function mockPay(cardNumber: string): Promise<{ ok: true } | { ok: false }> {
  await new Promise((r) => setTimeout(r, 1500));
  return cardNumber.replace(/\s/g, "") === "4000000000000002" ? { ok: false } : { ok: true };
}
