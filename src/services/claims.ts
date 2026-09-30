// MOCK claims service — localStorage only, with simulated status progression (demo behaviour).
export type ClaimStatus = "recue" | "en-cours" | "reponse" | "cloturee";
export type ClaimCategory = "moto" | "circuit" | "paiement" | "service" | "autre";

export type ClaimMessage = { from: "client" | "agence"; text: string; at: string };

export type Claim = {
  id: string;
  reference: string; // RC-2026-XXXX
  ownerEmail: string;
  bookingRef?: string | undefined;
  category: ClaimCategory;
  subject: string;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
  messages: ClaimMessage[];
};

const KEY = "tiziflow.claims";
const SEED_FLAG = "tiziflow.claims.seeded";
const isBrowser = () => typeof window !== "undefined";

export function makeClaimReference() {
  return `RC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function readAll(): Claim[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writeAll(list: Claim[]) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(list));
  listeners.forEach((l) => l());
}

export function listClaims(email: string) {
  seedDemoClaims();
  return readAll()
    .filter((c) => c.ownerEmail.toLowerCase() === email.toLowerCase())
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getClaim(id: string) {
  seedDemoClaims();
  return readAll().find((c) => c.id === id || c.reference === id);
}

export async function createClaim(data: {
  ownerEmail: string;
  bookingRef?: string | undefined;
  category: ClaimCategory;
  subject: string;
  description: string;
}) {
  await new Promise((r) => setTimeout(r, 600));
  const now = new Date().toISOString();
  const claim: Claim = {
    id: crypto.randomUUID(),
    reference: makeClaimReference(),
    ownerEmail: data.ownerEmail,
    bookingRef: data.bookingRef,
    category: data.category,
    subject: data.subject,
    status: "recue",
    createdAt: now,
    updatedAt: now,
    messages: [{ from: "client", text: data.description, at: now }],
  };
  writeAll([...readAll(), claim]);
  scheduleDemoProgress(claim.id);
  return claim;
}

export async function replyToClaim(id: string, text: string) {
  await new Promise((r) => setTimeout(r, 400));
  const now = new Date().toISOString();
  writeAll(
    readAll().map((c) =>
      c.id === id
        ? { ...c, updatedAt: now, messages: [...c.messages, { from: "client" as const, text, at: now }] }
        : c,
    ),
  );
}

/**
 * DEMO BEHAVIOUR ONLY: a claim created during the session moves to "En cours"
 * after 20s and receives a placeholder agency response after 45s.
 */
function scheduleDemoProgress(id: string) {
  if (!isBrowser()) return;
  setTimeout(() => patch(id, { status: "en-cours" }), 20000);
  setTimeout(() => {
    const claim = readAll().find((c) => c.id === id);
    if (!claim) return;
    const now = new Date().toISOString();
    patch(id, {
      status: "reponse",
      messages: [
        ...claim.messages,
        {
          from: "agence",
          text: "Bonjour, nous avons bien reçu votre réclamation et nous l'examinons. Un membre de l'équipe revient vers vous. (Réponse exemple de démonstration.)",
          at: now,
        },
      ],
    });
  }, 45000);
}

function patch(id: string, p: Partial<Claim>) {
  writeAll(
    readAll().map((c) => (c.id === id ? { ...c, ...p, updatedAt: new Date().toISOString() } : c)),
  );
}

export function seedDemoClaims() {
  if (!isBrowser() || localStorage.getItem(SEED_FLAG)) return;
  const now = new Date().toISOString();
  const seeded: Claim[] = [
    {
      id: "claim-1",
      reference: "RC-2026-2001",
      ownerEmail: "demo@tiziflow.ma",
      bookingRef: "TF-2026-1002",
      category: "moto",
      subject: "Question sur l'autonomie constatée",
      status: "reponse",
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          from: "client",
          text: "L'autonomie constatée m'a semblé inférieure à l'indication. (Message exemple.)",
          at: now,
        },
        {
          from: "agence",
          text: "Merci pour votre retour, nous vérifions avec l'équipe technique. (Réponse exemple.)",
          at: now,
        },
      ],
    },
    {
      id: "claim-2",
      reference: "RC-2026-2002",
      ownerEmail: "demo@tiziflow.ma",
      bookingRef: "TF-2026-1003",
      category: "paiement",
      subject: "Remboursement après annulation",
      status: "cloturee",
      createdAt: now,
      updatedAt: now,
      messages: [
        { from: "client", text: "Demande de suivi après annulation. (Message exemple.)", at: now },
        { from: "agence", text: "Dossier clôturé. (Réponse exemple.)", at: now },
      ],
    },
  ];
  writeAll([...readAll(), ...seeded]);
  localStorage.setItem(SEED_FLAG, "1");
}

const listeners = new Set<() => void>();
export function subscribeClaims(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
