// MOCK auth service — localStorage only. Replaceable by a real backend later.
export type Account = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  lang: "fr" | "en";
};

const USERS_KEY = "tiziflow.users";
const SESSION_KEY = "tiziflow.session";

const DEMO: Account = {
  id: "demo",
  firstName: "Demo",
  lastName: "TiziFlow",
  email: "demo@tiziflow.ma",
  phone: "+212 600 000 000",
  password: "Demo1234",
  lang: "fr",
};

const isBrowser = () => typeof window !== "undefined";

function readUsers(): Account[] {
  if (!isBrowser()) return [DEMO];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const list: Account[] = raw ? JSON.parse(raw) : [];
    if (!list.some((u) => u.email === DEMO.email)) list.unshift(DEMO);
    return list;
  } catch {
    return [DEMO];
  }
}

function writeUsers(users: Account[]) {
  if (!isBrowser()) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): Account | null {
  if (!isBrowser()) return null;
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return readUsers().find((u) => u.id === id) ?? null;
}

export async function signIn(email: string, password: string): Promise<Account> {
  await delay(600);
  const user = readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) throw new Error("INVALID_CREDENTIALS");
  localStorage.setItem(SESSION_KEY, user.id);
  notify();
  return user;
}

export async function signUp(
  data: Omit<Account, "id" | "lang"> & { lang?: "fr" | "en" },
): Promise<Account> {
  await delay(700);
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase()))
    throw new Error("EMAIL_TAKEN");
  const user: Account = { ...data, lang: data.lang ?? "fr", id: crypto.randomUUID() };
  users.push(user);
  writeUsers(users);
  localStorage.setItem(SESSION_KEY, user.id);
  notify();
  return user;
}

export function signOut() {
  if (!isBrowser()) return;
  localStorage.removeItem(SESSION_KEY);
  notify();
}

export async function updateProfile(patch: Partial<Account>): Promise<Account> {
  await delay(500);
  const current = getCurrentUser();
  if (!current) throw new Error("NOT_AUTHENTICATED");
  const users = readUsers().map((u) => (u.id === current.id ? { ...u, ...patch } : u));
  writeUsers(users);
  notify();
  return users.find((u) => u.id === current.id)!;
}

export async function requestPasswordReset(email: string) {
  await delay(600);
  return { ok: true, email };
}

export const DEMO_CREDENTIALS = { email: DEMO.email, password: DEMO.password };

/* --- tiny subscription so React can react to auth changes --- */
const listeners = new Set<() => void>();
export function subscribeAuth(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
function notify() {
  listeners.forEach((l) => l());
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
