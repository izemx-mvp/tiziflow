import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Home,
  Lock,
  User,
  UserCheck,
} from "lucide-react";
import { seo } from "@/lib/seo";
import { ImageSlot } from "@/components/brand/ImageSlot";
import { Counter, DemoBanner, ErrorText, Field, SuccessCheck, btn, inputCls, textareaCls } from "@/components/forms/ui";
import { circuits } from "@/data/circuits";
import { activities } from "@/data/activities";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  activityName,
  activityPrice,
  activityShort,
  circuitDifficulty,
  circuitDuration,
  circuitImage,
  circuitName,
  circuitPrice,
  compatibleMotos,
  findActivity,
  findCircuit,
  findMoto,
  formatDate,
  formatMAD,
  motoImage,
  motoName,
  motoRange,
  motoSupplement,
  slotLabel,
  toISO,
  todayISO,
  type Lang,
  type TimeSlot,
} from "@/lib/catalog";
import { availabilityFor, bookingsApi, mockPay, useAuth, type Booking } from "@/services/demo-store";

type Search = { type?: "moto" | "circuit"; id?: string; date?: string; people?: number; moto?: string };

export const Route = createFileRoute("/reservation")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const people = typeof s["people"] === "number" ? s["people"] : Number(s["people"]);
    return {
      type: s["type"] === "circuit" ? "circuit" : s["type"] === "moto" ? "moto" : undefined,
      id: typeof s["id"] === "string" ? s["id"] : undefined,
      date: typeof s["date"] === "string" ? s["date"] : undefined,
      people: Number.isFinite(people) && people > 0 ? people : undefined,
      moto: typeof s["moto"] === "string" ? s["moto"] : undefined,
    };
  },
  head: () =>
    seo({
      title: "Réserver un circuit — TiziFlow",
      description:
        "Réservez votre circuit guidé en moto électrique à Midelt : date, motos, options et paiement en ligne.",
      path: "/reservation",
    }),
  component: ReservationRoute,
});

/* ------------------------------------------------------------------ */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const DRAFT_KEY = "tf:booking-draft";
const MAX_RIDERS = 8;

type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  prefix: string;
  phone: string;
  nationality: string;
  experience: string;
  notes: string;
};
type Draft = {
  circuit: string;
  riders: number;
  date: string;
  slot: TimeSlot | "";
  motos: string[];
  options: string[];
  customer: Customer;
  cgv: boolean;
};
type ErrorKey =
  | "circuit" | "date" | "slot" | "motos"
  | "firstName" | "lastName" | "email" | "phone" | "cgv"
  | "number" | "exp" | "cvc" | "name";
/** Exact keys (no index signature) so `errors.date` is valid under strict tsconfig. */
type Errors = Partial<Record<ErrorKey, string>>;

const EMPTY_CUSTOMER: Customer = {
  firstName: "",
  lastName: "",
  email: "",
  prefix: "+212",
  phone: "",
  nationality: "",
  experience: "beginner",
  notes: "",
};

const STEPS = [
  { fr: "Circuit", en: "Circuit" },
  { fr: "Date", en: "Date" },
  { fr: "Motos", en: "Motorbikes" },
  { fr: "Options", en: "Extras" },
  { fr: "Vos infos", en: "Your details" },
  { fr: "Paiement", en: "Payment" },
] as const;

const clampRiders = (n: number) => Math.min(MAX_RIDERS, Math.max(1, Math.round(n)));

/** Child routes (e.g. /reservation/confirmation/$id) render through the Outlet. */
function ReservationRoute() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.replace(/\/$/, "") !== "/reservation") return <Outlet />;
  return <BookingFlow />;
}

function BookingFlow() {
  const search = Route.useSearch();
  const { lang } = useT();
  const fr = lang === "fr";
  const { user } = useAuth();
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [loaded, setLoaded] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);
  const [draft, setDraft] = useState<Draft>(() => ({
    circuit: findCircuit(search.id)?.slug ?? "",
    riders: clampRiders(search.people ?? 1),
    date: search.date ?? "",
    slot: "",
    motos: search.moto && findMoto(search.moto) ? [search.moto] : [],
    options: [],
    customer: EMPTY_CUSTOMER,
    cgv: false,
  }));

  // Restore an unfinished booking (only when not arriving with a chosen circuit)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { draft: Partial<Draft>; step?: number; maxStep?: number };
        if (!search.id) {
          // Full restore of an unfinished booking
          setDraft((d) => ({
            ...d,
            ...saved.draft,
            riders: saved.draft.riders ?? d.riders,
            customer: { ...EMPTY_CUSTOMER, ...saved.draft.customer },
          }));
          setStep(Math.min(saved.step ?? 0, 4));
          setMaxStep(Math.min(saved.maxStep ?? 0, 4));
        } else if (saved.draft.options?.length) {
          // Arriving from a circuit page: keep extras picked on /activites
          setDraft((d) => ({ ...d, options: saved.draft.options ?? [] }));
        }
      }
    } catch {
      /* ignore corrupted draft */
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded || done) return;
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ draft: { ...draft, cgv: false }, step: Math.min(step, 4), maxStep: Math.min(maxStep, 4) }),
      );
    } catch {
      /* ignore */
    }
  }, [draft, step, maxStep, loaded, done]);

  // Prefill contact details for logged-in users
  useEffect(() => {
    if (!user) return;
    setDraft((d) =>
      d.customer.email
        ? d
        : {
            ...d,
            customer: {
              ...d.customer,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone.replace(/^\+\d{1,3}\s?/, ""),
            },
          },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  /* ---------- derived ---------- */
  const circuit = findCircuit(draft.circuit);
  const unitPrice = circuit ? circuitPrice(circuit) : 0;
  const riderMotos = draft.motos.slice(0, draft.riders);
  const motoSupp = riderMotos.reduce((s, slug) => {
    const m = findMoto(slug);
    return s + (m ? motoSupplement(m) : 0);
  }, 0);
  const optionsTotal = draft.options.reduce((s, slug) => {
    const a = findActivity(slug);
    return s + (a ? activityPrice(a) : 0);
  }, 0);
  const total = unitPrice * draft.riders + motoSupp + optionsTotal;

  /* ---------- setters ---------- */
  const setCircuit = (slug: string) =>
    setDraft((d) => {
      const allowed = compatibleMotos(findCircuit(slug)).map((m) => m.slug);
      return { ...d, circuit: slug, motos: d.motos.map((m) => (allowed.includes(m) ? m : "")) };
    });
  const setRiders = (n: number) => setDraft((d) => ({ ...d, riders: clampRiders(n) }));
  const setMotoFor = (i: number, slug: string) =>
    setDraft((d) => {
      const next = [...d.motos];
      while (next.length < d.riders) next.push("");
      next[i] = slug;
      return { ...d, motos: next };
    });
  const sameForAll = () => setDraft((d) => ({ ...d, motos: Array.from({ length: d.riders }, () => d.motos[0] ?? "") }));
  const toggleOption = (slug: string) =>
    setDraft((d) => ({
      ...d,
      options: d.options.includes(slug) ? d.options.filter((o) => o !== slug) : [...d.options, slug],
    }));
  const setCustomer = (patch: Partial<Customer>) => setDraft((d) => ({ ...d, customer: { ...d.customer, ...patch } }));

  /* ---------- validation & navigation ---------- */
  const validate = (s: number): Errors => {
    const e: Errors = {};
    if (s === 0 && !circuit) e.circuit = fr ? "Choisissez un circuit pour continuer." : "Choose a circuit to continue.";
    if (s === 1) {
      if (!draft.date) e.date = fr ? "Choisissez une date." : "Choose a date.";
      else if (draft.date < todayISO()) e.date = fr ? "Cette date est passée." : "This date is in the past.";
      else if (circuit) {
        const a = availabilityFor(circuit.slug, draft.date);
        if (a.remaining < draft.riders)
          e.date = fr
            ? `Il reste ${a.remaining} moto(s) ce jour-là pour ${draft.riders} pilote(s). Choisissez une autre date.`
            : `Only ${a.remaining} motorbike(s) left that day for ${draft.riders} rider(s). Pick another date.`;
      }
      if (!draft.slot) e.slot = fr ? "Choisissez un créneau." : "Choose a time slot.";
    }
    if (s === 2) {
      for (let i = 0; i < draft.riders; i++) {
        if (!draft.motos[i]) {
          e.motos = fr ? "Choisissez une moto pour chaque pilote." : "Choose a motorbike for each rider.";
          break;
        }
      }
    }
    if (s === 4) {
      const c = draft.customer;
      if (!c.firstName.trim()) e.firstName = fr ? "Indiquez votre prénom." : "Enter your first name.";
      if (!c.lastName.trim()) e.lastName = fr ? "Indiquez votre nom." : "Enter your last name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) e.email = fr ? "Adresse e-mail invalide." : "Invalid email address.";
      const digits = c.phone.replace(/\D/g, "");
      if (digits.length < 8 || digits.length > 12)
        e.phone = fr ? "Numéro de téléphone invalide (8 à 12 chiffres)." : "Invalid phone number (8 to 12 digits).";
      if (!draft.cgv) e.cgv = fr ? "Acceptez les conditions générales pour continuer." : "Accept the terms to continue.";
    }
    return e;
  };

  const scrollToCard = () =>
    cardRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });

  const goTo = (n: number) => {
    setErrors({});
    setStep(n);
    scrollToCard();
  };

  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) {
      scrollToCard();
      return;
    }
    const n = step + 1;
    setMaxStep((m) => Math.max(m, n));
    goTo(n);
  };

  const finalize = () => {
    const c = draft.customer;
    const booking = bookingsApi.add({
      ownerEmail: user?.email ?? c.email,
      circuitSlug: draft.circuit,
      date: draft.date,
      slot: draft.slot as TimeSlot,
      riders: draft.riders,
      motos: riderMotos,
      options: draft.options,
      customer: {
        firstName: c.firstName.trim(),
        lastName: c.lastName.trim(),
        email: c.email.trim(),
        phone: `${c.prefix} ${c.phone.trim()}`,
        nationality: c.nationality.trim(),
        experience: c.experience,
        notes: c.notes.trim(),
      },
      total,
    });
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setDone(booking);
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  if (done) return <Confirmation booking={done} lang={lang} />;

  return (
    <div className="min-h-screen bg-sand pb-20 pt-28">
      <div className="container-tf">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal">{fr ? "Réservation" : "Booking"}</p>
            <h1 className="mt-1 h-section text-petrol">{fr ? "Réservez votre circuit" : "Book your circuit"}</h1>
          </div>
          <DemoBanner className="max-w-md" />
        </div>

        <Stepper step={step} maxStep={maxStep} lang={lang} onGo={goTo} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          <div
            ref={cardRef}
            className="scroll-mt-28 rounded-3xl border border-petrol/10 bg-white p-5 shadow-warm sm:p-8"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={reduced ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                {step === 0 && (
                  <StepCircuit
                    lang={lang}
                    draft={draft}
                    error={errors.circuit}
                    onCircuit={setCircuit}
                    onRiders={setRiders}
                  />
                )}
                {step === 1 && <StepDate lang={lang} draft={draft} setDraft={setDraft} errors={errors} />}
                {step === 2 && (
                  <StepMotos
                    lang={lang}
                    draft={draft}
                    error={errors.motos}
                    onPick={setMotoFor}
                    onSameForAll={sameForAll}
                  />
                )}
                {step === 3 && <StepOptions lang={lang} draft={draft} onToggle={toggleOption} />}
                {step === 4 && (
                  <StepDetails
                    lang={lang}
                    draft={draft}
                    errors={errors}
                    loggedIn={!!user}
                    onChange={setCustomer}
                    onCgv={(v) => setDraft((d) => ({ ...d, cgv: v }))}
                  />
                )}
                {step === 5 && <StepPayment lang={lang} total={total} onPaid={finalize} />}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-petrol/10 pt-6">
              <button type="button" onClick={() => goTo(Math.max(0, step - 1))} disabled={step === 0} className={btn.ghost}>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                {fr ? "Retour" : "Back"}
              </button>
              {step < 5 && (
                <button type="button" onClick={next} className={btn.primary}>
                  {step === 4 ? (fr ? "Continuer vers le paiement" : "Continue to payment") : fr ? "Continuer" : "Continue"}
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <Summary
            lang={lang}
            draft={draft}
            unitPrice={unitPrice}
            motoSupp={motoSupp}
            optionsTotal={optionsTotal}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stepper                                                             */
/* ------------------------------------------------------------------ */

function Stepper({ step, maxStep, lang, onGo }: { step: number; maxStep: number; lang: Lang; onGo: (i: number) => void }) {
  return (
    <nav aria-label={lang === "fr" ? "Étapes de réservation" : "Booking steps"} className="mt-8">
      <div className="h-1.5 overflow-hidden rounded-full bg-petrol/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-terracotta to-aqua"
          animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
        />
      </div>
      <ol className="mt-4 grid grid-cols-6 gap-1">
        {STEPS.map((s, i) => {
          const current = i === step;
          const completed = i < step;
          const reachable = i <= maxStep && !current;
          return (
            <li key={s.fr}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onGo(i)}
                aria-current={current ? "step" : undefined}
                aria-label={`${i + 1}. ${s[lang]}`}
                className="group flex w-full flex-col items-center gap-1.5 rounded-xl py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:cursor-default"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                    current && "bg-petrol text-white ring-4 ring-petrol/15",
                    completed && "bg-teal text-white group-hover:bg-petrol",
                    !current && !completed && "border border-petrol/15 bg-white text-petrol/50",
                  )}
                >
                  {completed ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-xs font-semibold sm:block",
                    current ? "text-petrol" : completed ? "text-petrol/70" : "text-petrol/40",
                  )}
                >
                  {s[lang]}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepTitle({ title, text }: { title: string; text?: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-petrol">{title}</h2>
      {text && <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1 — circuit                                                    */
/* ------------------------------------------------------------------ */

function StepCircuit({
  lang,
  draft,
  error,
  onCircuit,
  onRiders,
}: {
  lang: Lang;
  draft: Draft;
  error?: string;
  onCircuit: (slug: string) => void;
  onRiders: (n: number) => void;
}) {
  const fr = lang === "fr";
  return (
    <div>
      <StepTitle
        title={fr ? "Choisissez votre circuit" : "Choose your circuit"}
        text={
          fr
            ? "Vous choisirez ensuite votre moto, parmi celles adaptées à ce circuit."
            : "You'll then pick your motorbike, among those suited to this circuit."
        }
      />
      <div role="radiogroup" aria-label={fr ? "Circuits" : "Circuits"} className="mt-6 grid gap-4 sm:grid-cols-2">
        {circuits.map((c) => {
          const active = draft.circuit === c.slug;
          const chips = [circuitDuration(c, lang), circuitDifficulty(c, lang)].filter(Boolean);
          return (
            <button
              key={c.slug}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onCircuit(c.slug)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border-2 bg-white text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2",
                active ? "border-teal shadow-warm" : "border-petrol/10 hover:border-petrol/30",
              )}
            >
              <div className="relative h-32 overflow-hidden bg-sand">
                <ImageSlot
                  slot={circuitImage(c)}
                  alt=""
                  className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  className={cn(
                    "absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all",
                    active ? "border-teal bg-teal text-white" : "border-white bg-white/70 text-transparent",
                  )}
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <div className="p-4">
                <p className="font-display font-bold text-petrol">{circuitName(c, lang)}</p>
                {chips.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {chips.map((x) => (
                      <span key={x} className="rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-petrol/80">
                        {x}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-sm text-muted-foreground">
                  {fr ? "À partir de " : "From "}
                  <span className="font-bold text-petrol">{formatMAD(circuitPrice(c), lang)}</span>
                  {fr ? " / pers." : " / person"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      {error && <ErrorText>{error}</ErrorText>}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-sand p-4 sm:p-5">
        <div>
          <p className="font-semibold text-petrol">{fr ? "Nombre de pilotes" : "Number of riders"}</p>
          <p className="text-xs text-muted-foreground">
            {fr ? `Une moto par pilote, ${MAX_RIDERS} maximum.` : `One motorbike per rider, ${MAX_RIDERS} max.`}
          </p>
        </div>
        <Counter
          value={draft.riders}
          min={1}
          max={MAX_RIDERS}
          onChange={onRiders}
          labelMinus={fr ? "Retirer un pilote" : "Remove a rider"}
          labelPlus={fr ? "Ajouter un pilote" : "Add a rider"}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — date & slot                                                */
/* ------------------------------------------------------------------ */

function StepDate({
  lang,
  draft,
  setDraft,
  errors,
}: {
  lang: Lang;
  draft: Draft;
  setDraft: Dispatch<SetStateAction<Draft>>;
  errors: Errors;
}) {
  const fr = lang === "fr";
  const today = todayISO();
  const [month, setMonth] = useState(() => {
    const base = draft.date ? new Date(`${draft.date}T00:00:00`) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const days = useMemo(() => {
    const offset = (month.getDay() + 6) % 7; // Monday first
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
    ];
  }, [month]);

  const now = new Date();
  const canPrev = month > new Date(now.getFullYear(), now.getMonth(), 1);
  const monthLabel = new Intl.DateTimeFormat(fr ? "fr-FR" : "en-GB", { month: "long", year: "numeric" }).format(month);
  const weekdays = fr ? ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"] : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const selected = draft.date ? availabilityFor(draft.circuit, draft.date) : null;
  const shift = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));

  const slots: TimeSlot[] = ["morning", "afternoon", "day"];

  return (
    <div>
      <StepTitle
        title={fr ? "Date et créneau" : "Date and time slot"}
        text={fr ? "Les disponibilités dépendent du nombre de motos libres ce jour-là." : "Availability depends on how many motorbikes are free that day."}
      />

      <div className="mt-6 grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-petrol/10 p-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => shift(-1)}
              disabled={!canPrev}
              aria-label={fr ? "Mois précédent" : "Previous month"}
              className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="font-display font-bold capitalize text-petrol" aria-live="polite">
              {monthLabel}
            </p>
            <button
              type="button"
              onClick={() => shift(1)}
              aria-label={fr ? "Mois suivant" : "Next month"}
              className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-petrol/50">
            {weekdays.map((d, i) => (
              <span key={`${d}-${i}`}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              if (!d) return <span key={`empty-${i}`} />;
              const iso = toISO(d);
              const past = iso < today;
              const a = availabilityFor(draft.circuit, iso);
              const full = a.status === "full";
              const isSel = draft.date === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={past || full}
                  onClick={() => setDraft((dr) => ({ ...dr, date: iso }))}
                  aria-pressed={isSel}
                  aria-label={`${formatDate(iso, lang, true)}${full ? (fr ? ", complet" : ", full") : ""}`}
                  title={full ? (fr ? "Complet" : "Full") : undefined}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
                    isSel && "bg-petrol text-white shadow-lift",
                    !isSel && !past && !full && "text-petrol hover:bg-sand",
                    past && "text-petrol/25",
                    full && !past && "text-petrol/30 line-through",
                  )}
                >
                  {d.getDate()}
                  {!past && !full && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute bottom-1.5 h-1 w-1 rounded-full",
                        isSel ? "bg-aqua" : a.status === "few" ? "bg-terracotta" : "bg-teal",
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal" /> {fr ? "Disponible" : "Available"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-terracotta" /> {fr ? "Dernières places" : "Last spots"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="line-through">15</span> {fr ? "Complet" : "Full"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div role="radiogroup" aria-label={fr ? "Créneau" : "Time slot"} className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-petrol">{fr ? "Créneau" : "Time slot"}</p>
            {slots.map((s) => {
              const active = draft.slot === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDraft((d) => ({ ...d, slot: s }))}
                  className={cn(
                    "flex h-12 items-center justify-between rounded-xl border-2 px-4 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
                    active ? "border-teal bg-teal/5 text-petrol" : "border-petrol/10 text-petrol/80 hover:border-petrol/30",
                  )}
                >
                  {slotLabel(s, lang)}
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border-2",
                      active ? "border-teal bg-teal text-white" : "border-petrol/20",
                    )}
                  >
                    {active && <Check className="h-3 w-3" aria-hidden="true" />}
                  </span>
                </button>
              );
            })}
            {errors.slot && <ErrorText>{errors.slot}</ErrorText>}
          </div>

          <AnimatePresence mode="wait">
            {selected && draft.date && (
              <motion.div
                key={draft.date}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "rounded-2xl p-4 text-sm",
                  selected.remaining >= draft.riders ? "bg-teal/10 text-petrol" : "bg-terracotta/10 text-petrol",
                )}
              >
                <p className="flex items-center gap-2 font-semibold">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  {formatDate(draft.date, lang, true)}
                </p>
                <p className="mt-1">
                  {fr
                    ? `${selected.remaining} moto(s) disponible(s) · ${draft.riders} pilote(s)`
                    : `${selected.remaining} motorbike(s) available · ${draft.riders} rider(s)`}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {errors.date && <ErrorText>{errors.date}</ErrorText>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — motos per rider                                            */
/* ------------------------------------------------------------------ */

function StepMotos({
  lang,
  draft,
  error,
  onPick,
  onSameForAll,
}: {
  lang: Lang;
  draft: Draft;
  error?: string;
  onPick: (i: number, slug: string) => void;
  onSameForAll: () => void;
}) {
  const fr = lang === "fr";
  const list = compatibleMotos(findCircuit(draft.circuit));

  return (
    <div>
      <StepTitle
        title={fr ? "Choisissez vos motos" : "Choose your motorbikes"}
        text={
          fr
            ? "Seules les motos adaptées à ce circuit sont proposées. Une moto par pilote."
            : "Only motorbikes suited to this circuit are shown. One motorbike per rider."
        }
      />
      <div className="mt-6 space-y-4">
        {Array.from({ length: draft.riders }, (_, i) => (
          <div key={i} className="rounded-2xl border border-petrol/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 font-semibold text-petrol">
                <User className="h-4 w-4 text-teal" aria-hidden="true" />
                {fr ? `Pilote ${i + 1}` : `Rider ${i + 1}`}
              </p>
              {i === 0 && draft.riders > 1 && draft.motos[0] && (
                <button
                  type="button"
                  onClick={onSameForAll}
                  className="rounded-full px-3 py-1 text-xs font-semibold text-teal transition hover:bg-teal/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                >
                  {fr ? "Même moto pour tous" : "Same motorbike for all"}
                </button>
              )}
            </div>
            <div
              role="radiogroup"
              aria-label={fr ? `Moto du pilote ${i + 1}` : `Rider ${i + 1} motorbike`}
              className="-mx-1 mt-3 flex gap-3 overflow-x-auto px-1 pb-2"
            >
              {list.map((m) => {
                const active = draft.motos[i] === m.slug;
                const supp = motoSupplement(m);
                const range = motoRange(m, lang);
                return (
                  <button
                    key={m.slug}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onPick(i, m.slug)}
                    className={cn(
                      "w-44 shrink-0 overflow-hidden rounded-xl border-2 bg-white text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
                      active ? "border-teal shadow-warm" : "border-petrol/10 hover:border-petrol/30",
                    )}
                  >
                    <div className="relative h-24 overflow-hidden bg-sand">
                      <ImageSlot slot={motoImage(m)} alt="" className="h-full w-full" />
                      {active && (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-teal text-white">
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-petrol">{motoName(m, lang)}</p>
                      {range && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {fr ? "Autonomie" : "Range"} {range}
                        </p>
                      )}
                      <p className="mt-1 text-xs font-semibold text-teal">
                        {supp > 0 ? `+ ${formatMAD(supp, lang)}` : fr ? "Incluse" : "Included"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — options                                                    */
/* ------------------------------------------------------------------ */

function StepOptions({ lang, draft, onToggle }: { lang: Lang; draft: Draft; onToggle: (slug: string) => void }) {
  const fr = lang === "fr";
  return (
    <div>
      <StepTitle
        title={fr ? "Activités et services" : "Activities and services"}
        text={fr ? "Facultatif : ajoutez ce qui complète votre sortie." : "Optional: add what completes your ride."}
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {activities.map((a) => {
          const active = draft.options.includes(a.slug);
          const price = activityPrice(a);
          return (
            <button
              key={a.slug}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(a.slug)}
              className={cn(
                "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
                active ? "border-teal bg-teal/5" : "border-petrol/10 hover:border-petrol/30",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                  active ? "border-teal bg-teal text-white" : "border-petrol/25",
                )}
              >
                {active && <Check className="h-3 w-3" aria-hidden="true" />}
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-petrol">{activityName(a, lang)}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{activityShort(a, lang)}</span>
              </span>
              <span className="shrink-0 text-sm font-bold text-petrol">
                {price > 0 ? `+ ${formatMAD(price, lang)}` : fr ? "Offert" : "Free"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 5 — details                                                    */
/* ------------------------------------------------------------------ */

const PREFIXES = ["+212", "+33", "+34", "+49", "+44", "+39", "+31", "+1"];

function StepDetails({
  lang,
  draft,
  errors,
  loggedIn,
  onChange,
  onCgv,
}: {
  lang: Lang;
  draft: Draft;
  errors: Errors;
  loggedIn: boolean;
  onChange: (patch: Partial<Customer>) => void;
  onCgv: (v: boolean) => void;
}) {
  const fr = lang === "fr";
  const c = draft.customer;
  const inv = (k: ErrorKey) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `${k}-error` } : {});

  return (
    <div>
      <StepTitle
        title={fr ? "Vos informations" : "Your details"}
        text={fr ? "Le téléphone permet à l'agence de vous joindre le jour du départ." : "Your phone lets the agency reach you on the day."}
      />

      {!loggedIn && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sand p-4 text-sm">
          <p className="text-petrol">
            {fr ? "Vous avez un compte ? Retrouvez vos réservations en vous connectant." : "Have an account? Sign in to keep your bookings."}
          </p>
          <Link to="/connexion" search={{ redirect: "/reservation" }} className="font-semibold text-teal hover:underline">
            {fr ? "Se connecter" : "Sign in"}
          </Link>
        </div>
      )}
      {loggedIn && (
        <p className="mt-5 flex items-center gap-2 text-sm text-teal">
          <UserCheck className="h-4 w-4" aria-hidden="true" />
          {fr ? "Informations préremplies depuis votre compte." : "Details prefilled from your account."}
        </p>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label={fr ? "Prénom" : "First name"} htmlFor="firstName" error={errors.firstName}>
          <input id="firstName" autoComplete="given-name" className={inputCls} value={c.firstName} onChange={(e) => onChange({ firstName: e.target.value })} {...inv("firstName")} />
        </Field>
        <Field label={fr ? "Nom" : "Last name"} htmlFor="lastName" error={errors.lastName}>
          <input id="lastName" autoComplete="family-name" className={inputCls} value={c.lastName} onChange={(e) => onChange({ lastName: e.target.value })} {...inv("lastName")} />
        </Field>
        <Field label="E-mail" htmlFor="email" error={errors.email}>
          <input id="email" type="email" autoComplete="email" className={inputCls} value={c.email} onChange={(e) => onChange({ email: e.target.value })} {...inv("email")} />
        </Field>
        <Field label={fr ? "Téléphone" : "Phone"} htmlFor="phone" error={errors.phone}>
          <div className="flex gap-2">
            <select
              aria-label={fr ? "Indicatif" : "Country code"}
              className={cn(inputCls, "w-28 shrink-0 px-3")}
              value={c.prefix}
              onChange={(e) => onChange({ prefix: e.target.value })}
            >
              {PREFIXES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input id="phone" type="tel" autoComplete="tel-national" inputMode="tel" placeholder="6 12 34 56 78" className={inputCls} value={c.phone} onChange={(e) => onChange({ phone: e.target.value })} {...inv("phone")} />
          </div>
        </Field>
        <Field label={fr ? "Nationalité" : "Nationality"} htmlFor="nationality">
          <input id="nationality" autoComplete="country-name" className={inputCls} value={c.nationality} onChange={(e) => onChange({ nationality: e.target.value })} />
        </Field>
        <Field label={fr ? "Expérience de la moto" : "Riding experience"} htmlFor="experience">
          <select id="experience" className={inputCls} value={c.experience} onChange={(e) => onChange({ experience: e.target.value })}>
            <option value="beginner">{fr ? "Débutant" : "Beginner"}</option>
            <option value="intermediate">{fr ? "Intermédiaire" : "Intermediate"}</option>
            <option value="advanced">{fr ? "Confirmé" : "Experienced"}</option>
          </select>
        </Field>
        <Field label={fr ? "Demandes particulières" : "Special requests"} htmlFor="notes" className="sm:col-span-2">
          <textarea id="notes" className={textareaCls} value={c.notes} onChange={(e) => onChange({ notes: e.target.value })} />
        </Field>
      </div>

      <label className="mt-6 flex items-start gap-3 text-sm text-petrol">
        <input
          type="checkbox"
          checked={draft.cgv}
          onChange={(e) => onCgv(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-petrol/30 accent-[var(--teal)]"
          aria-invalid={!!errors.cgv}
        />
        <span>
          {fr ? "J'accepte les " : "I accept the "}
          <Link to="/cgv" className="font-semibold text-teal underline-offset-2 hover:underline">
            {fr ? "conditions générales de vente" : "terms and conditions"}
          </Link>
          .
        </span>
      </label>
      {errors.cgv && <ErrorText>{errors.cgv}</ErrorText>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 6 — payment (mock)                                             */
/* ------------------------------------------------------------------ */

function StepPayment({ lang, total, onPaid }: { lang: Lang; total: number; onPaid: () => void }) {
  const fr = lang === "fr";
  const [card, setCard] = useState({ number: "", exp: "", cvc: "", name: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "declined">("idle");

  const fmtNumber = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const fmtExp = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };
  const brand = /^4/.test(card.number) ? "VISA" : /^5[1-5]/.test(card.number) ? "Mastercard" : "";

  const submit = async () => {
    const e: Errors = {};
    if (card.number.replace(/\s/g, "").length !== 16) e.number = fr ? "Le numéro doit contenir 16 chiffres." : "Card number must have 16 digits.";
    const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(card.exp);
    if (!m) e.exp = fr ? "Format MM/AA." : "Format MM/YY.";
    else if (new Date(2000 + Number(m[2]), Number(m[1])) <= new Date()) e.exp = fr ? "Carte expirée." : "Card expired.";
    if (!/^\d{3,4}$/.test(card.cvc)) e.cvc = fr ? "3 ou 4 chiffres." : "3 or 4 digits.";
    if (card.name.trim().length < 2) e.name = fr ? "Nom du titulaire requis." : "Cardholder name required.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setStatus("loading");
    const r = await mockPay(card.number);
    if (r.ok) onPaid();
    else setStatus("declined");
  };

  const inv = (k: ErrorKey) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `card-${k}-error` } : {});

  return (
    <div>
      <StepTitle title={fr ? "Paiement" : "Payment"} text={fr ? "Paiement par carte bancaire (simulé)." : "Card payment (simulated)."} />

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-start">
        {/* Card preview */}
        <div className="relative aspect-[1.6] overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--petrol),color-mix(in_oklab,var(--petrol)_70%,var(--teal)))] p-5 text-white shadow-lift">
          <div aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-aqua/20 blur-2xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="h-8 w-11 rounded-md bg-[linear-gradient(135deg,#e9d8a6,#c9a227)]" aria-hidden="true" />
              <span className="font-display text-sm font-bold tracking-wide">{brand}</span>
            </div>
            <p className="font-mono text-lg tracking-[0.12em] tabular-nums">{card.number || "•••• •••• •••• ••••"}</p>
            <div className="flex items-end justify-between text-xs">
              <span className="max-w-[70%] truncate uppercase">{card.name || (fr ? "Titulaire" : "Cardholder")}</span>
              <span className="tabular-nums">{card.exp || "MM/AA"}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <Field label={fr ? "Numéro de carte" : "Card number"} htmlFor="card-number" error={errors.number}>
            <div className="relative">
              <CreditCard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-petrol/40" aria-hidden="true" />
              <input id="card-number" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" className={cn(inputCls, "pl-11 tabular-nums")} value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: fmtNumber(e.target.value) }))} {...inv("number")} />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={fr ? "Expiration" : "Expiry"} htmlFor="card-exp" error={errors.exp}>
              <input id="card-exp" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" className={cn(inputCls, "tabular-nums")} value={card.exp} onChange={(e) => setCard((c) => ({ ...c, exp: fmtExp(e.target.value) }))} {...inv("exp")} />
            </Field>
            <Field label="CVC" htmlFor="card-cvc" error={errors.cvc}>
              <input id="card-cvc" inputMode="numeric" autoComplete="cc-csc" placeholder="123" className={cn(inputCls, "tabular-nums")} value={card.cvc} onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))} {...inv("cvc")} />
            </Field>
          </div>
          <Field label={fr ? "Nom du titulaire" : "Cardholder name"} htmlFor="card-name" error={errors.name}>
            <input id="card-name" autoComplete="cc-name" className={inputCls} value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} {...inv("name")} />
          </Field>
        </div>
      </div>

      <AnimatePresence>
        {status === "declined" && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 rounded-2xl bg-terracotta/10 p-4 text-sm font-medium text-petrol"
          >
            {fr
              ? "Paiement refusé par la banque (carte de test). Vérifiez les informations ou utilisez une autre carte."
              : "Payment declined by the bank (test card). Check the details or use another card."}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-4 w-4 text-teal" aria-hidden="true" />
          {fr ? "Paiement sécurisé (démo). Carte de test refusée : 4000 0000 0000 0002." : "Secure payment (demo). Declined test card: 4000 0000 0000 0002."}
        </p>
        <button type="button" onClick={submit} disabled={status === "loading"} className={cn(btn.primary, "sm:min-w-[220px]")}>
          {status === "loading" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
              {fr ? "Paiement en cours…" : "Processing…"}
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" aria-hidden="true" />
              {fr ? `Payer ${formatMAD(total, lang)}` : `Pay ${formatMAD(total, lang)}`}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Summary                                                             */
/* ------------------------------------------------------------------ */

function Summary({
  lang,
  draft,
  unitPrice,
  motoSupp,
  optionsTotal,
  total,
}: {
  lang: Lang;
  draft: Draft;
  unitPrice: number;
  motoSupp: number;
  optionsTotal: number;
  total: number;
}) {
  const fr = lang === "fr";
  const circuit = findCircuit(draft.circuit);
  const chosenMotos = draft.motos
    .slice(0, draft.riders)
    .map(findMoto)
    .filter((m): m is NonNullable<typeof m> => !!m);
  const chosenOptions = draft.options.map(findActivity).filter((a): a is NonNullable<typeof a> => !!a);

  return (
    <aside
      aria-label={fr ? "Récapitulatif" : "Summary"}
      className="overflow-hidden rounded-3xl border border-petrol/10 bg-white shadow-warm lg:sticky lg:top-28"
    >
      <div className="relative h-36 bg-petrol">
        {circuit && <ImageSlot slot={circuitImage(circuit)} alt="" className="h-full w-full opacity-80" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--petrol)] to-transparent" />
        <div className="absolute inset-x-5 bottom-4 text-white">
          <p className="text-xs text-white/70">{fr ? "Votre circuit" : "Your circuit"}</p>
          <p className="font-display text-lg font-bold">{circuit ? circuitName(circuit, lang) : fr ? "Aucun circuit choisi" : "No circuit chosen"}</p>
        </div>
      </div>

      <dl className="space-y-3 p-5 text-sm">
        <Row label={fr ? "Date" : "Date"} value={draft.date ? formatDate(draft.date, lang) : "—"} />
        <Row label={fr ? "Créneau" : "Slot"} value={draft.slot ? slotLabel(draft.slot, lang) : "—"} />
        <Row
          label={fr ? `${draft.riders} pilote(s) × ${formatMAD(unitPrice, lang)}` : `${draft.riders} rider(s) × ${formatMAD(unitPrice, lang)}`}
          value={formatMAD(unitPrice * draft.riders, lang)}
        />
        {chosenMotos.length > 0 && (
          <div>
            <dt className="text-muted-foreground">{fr ? "Motos" : "Motorbikes"}</dt>
            <dd className="mt-1 space-y-0.5">
              {chosenMotos.map((m, i) => (
                <p key={`${m.slug}-${i}`} className="flex justify-between gap-3 text-petrol">
                  <span>{motoName(m, lang)}</span>
                  <span className="text-muted-foreground">{motoSupplement(m) > 0 ? `+ ${formatMAD(motoSupplement(m), lang)}` : fr ? "incluse" : "included"}</span>
                </p>
              ))}
            </dd>
          </div>
        )}
        {motoSupp > 0 && <Row label={fr ? "Suppléments motos" : "Motorbike supplements"} value={formatMAD(motoSupp, lang)} />}
        {chosenOptions.length > 0 && (
          <div>
            <dt className="text-muted-foreground">{fr ? "Options" : "Extras"}</dt>
            <dd className="mt-1 space-y-0.5">
              {chosenOptions.map((a) => (
                <p key={a.slug} className="flex justify-between gap-3 text-petrol">
                  <span>{activityName(a, lang)}</span>
                  <span className="text-muted-foreground">{formatMAD(activityPrice(a), lang)}</span>
                </p>
              ))}
            </dd>
          </div>
        )}
        {optionsTotal > 0 && <Row label={fr ? "Total options" : "Extras total"} value={formatMAD(optionsTotal, lang)} />}
      </dl>

      <div className="flex items-end justify-between border-t border-dashed border-petrol/15 bg-sand/60 px-5 py-4">
        <div>
          <p className="text-xs text-muted-foreground">{fr ? "Total à payer" : "Total to pay"}</p>
          <p className="text-[11px] text-muted-foreground">{fr ? "Prix d'exemple" : "Sample prices"}</p>
        </div>
        <motion.p
          key={total}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-display text-2xl font-extrabold text-petrol tabular-nums"
        >
          {formatMAD(total, lang)}
        </motion.p>
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold text-petrol">{value}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Confirmation                                                        */
/* ------------------------------------------------------------------ */

function Confirmation({ booking, lang }: { booking: Booking; lang: Lang }) {
  const fr = lang === "fr";
  const reduced = useReducedMotion();
  const circuit = findCircuit(booking.circuitSlug);
  const name = circuit ? circuitName(circuit, lang) : booking.circuitSlug;
  const motoNames = booking.motos.map((s) => {
    const m = findMoto(s);
    return m ? motoName(m, lang) : s;
  });
  const optionNames = booking.options.map((s) => {
    const a = findActivity(s);
    return a ? activityName(a, lang) : s;
  });

  const downloadIcs = () => {
    const d = booking.date.replace(/-/g, "");
    const next = new Date(`${booking.date}T00:00:00`);
    next.setDate(next.getDate() + 1);
    const end = toISO(next).replace(/-/g, "");
    const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//TiziFlow//Demo//FR",
      "BEGIN:VEVENT",
      `UID:${booking.id}@tiziflow`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:TiziFlow - ${name}`,
      "LOCATION:Midelt, Maroc",
      `DESCRIPTION:${fr ? "Réservation" : "Booking"} ${booking.ref} - ${slotLabel(booking.slot, lang)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `tiziflow-${booking.ref}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Deterministic "QR-like" pattern from the reference (visual placeholder only)
  const cells = Array.from({ length: 81 }, (_, i) => {
    let h = i * 17;
    for (const ch of booking.ref) h = (h * 31 + ch.charCodeAt(0)) % 997;
    const corner = [0, 1, 9, 10, 7, 8, 16, 17, 63, 64, 72, 73].includes(i);
    return corner || h % 3 === 0;
  });

  return (
    <div className="min-h-screen bg-sand pb-20 pt-28">
      <div className="container-tf max-w-3xl">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="rounded-3xl bg-white p-6 text-center shadow-warm sm:p-10"
        >
          <SuccessCheck />
          <h1 className="mt-6 h-section text-petrol">{fr ? "Réservation confirmée" : "Booking confirmed"}</h1>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            {fr
              ? `Merci ${booking.customer.firstName}. En production, un récapitulatif serait envoyé à ${booking.customer.email}.`
              : `Thank you ${booking.customer.firstName}. In production, a summary would be sent to ${booking.customer.email}.`}
          </p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border-2 border-dashed border-teal/40 bg-teal/5 px-5 py-3">
            <span className="text-xs font-semibold text-muted-foreground">{fr ? "Référence" : "Reference"}</span>
            <span className="font-display text-xl font-extrabold tracking-wide text-petrol">{booking.ref}</span>
          </div>

          <div className="mt-8 grid gap-6 text-left sm:grid-cols-[1fr_auto] sm:items-start">
            <dl className="grid gap-3 text-sm">
              <Row label="Circuit" value={name} />
              <Row label="Date" value={formatDate(booking.date, lang, true)} />
              <Row label={fr ? "Créneau" : "Slot"} value={slotLabel(booking.slot, lang)} />
              <Row label={fr ? "Pilotes" : "Riders"} value={String(booking.riders)} />
              <Row label={fr ? "Motos" : "Motorbikes"} value={motoNames.join(", ")} />
              {optionNames.length > 0 && <Row label={fr ? "Options" : "Extras"} value={optionNames.join(", ")} />}
              <Row label={fr ? "Téléphone" : "Phone"} value={booking.customer.phone} />
              <div className="flex justify-between gap-3 border-t border-petrol/10 pt-3">
                <dt className="font-semibold text-petrol">{fr ? "Total payé" : "Total paid"}</dt>
                <dd className="font-display text-lg font-extrabold text-petrol">{formatMAD(booking.total, lang)}</dd>
              </div>
            </dl>
            <div className="mx-auto">
              <div aria-hidden="true" className="grid h-32 w-32 grid-cols-9 gap-[2px] rounded-xl border border-petrol/10 bg-white p-2">
                {cells.map((on, i) => (
                  <span key={i} className={on ? "rounded-[1px] bg-petrol" : ""} />
                ))}
              </div>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">{fr ? "À présenter au départ" : "Show at departure"}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={downloadIcs} className={btn.petrol}>
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              {fr ? "Ajouter à mon calendrier" : "Add to my calendar"}
            </button>
            <Link to="/compte/reservations" className={btn.ghost}>
              {fr ? "Voir mes réservations" : "See my bookings"}
            </Link>
            <Link to="/" className={btn.ghost}>
              <Home className="h-4 w-4" aria-hidden="true" />
              {fr ? "Retour à l'accueil" : "Back to home"}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}