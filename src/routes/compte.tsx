import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarCheck,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  MessageSquareWarning,
  Plus,
  UserRound,
  Users,
} from "lucide-react";
import { seo } from "@/lib/seo";
import { ImageSlot } from "@/components/brand/ImageSlot";
import { DemoBanner, btn } from "@/components/forms/ui";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  circuitImage,
  circuitName,
  findCircuit,
  findMoto,
  formatDate,
  formatMAD,
  motoName,
  slotLabel,
  todayISO,
  type Lang,
} from "@/lib/catalog";
import {
  useAuth,
  useBookings,
  useClaims,
  type Booking,
  type BookingStatus,
  type ClaimStatus,
} from "@/services/demo-store";

export const Route = createFileRoute("/compte")({
  head: () =>
    seo({
      title: "Mon compte — TiziFlow",
      description: "Votre espace TiziFlow : circuits réservés, profil et réclamations.",
      path: "/compte",
    }),
  component: AccountLayout,
});

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const NAV = [
  { to: "/compte", fr: "Tableau de bord", en: "Dashboard", Icon: LayoutDashboard, exact: true },
  {
    to: "/compte/reservations",
    fr: "Mes réservations",
    en: "My bookings",
    Icon: CalendarCheck,
    exact: false,
  },
  {
    to: "/compte/reclamations",
    fr: "Mes réclamations",
    en: "My claims",
    Icon: MessageSquareWarning,
    exact: false,
  },
  { to: "/compte/profil", fr: "Mon profil", en: "My profile", Icon: UserRound, exact: false },
] as const;

function AccountLayout() {
  const { lang } = useT();
  const fr = lang === "fr";
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname }).replace(/\/$/, "");
  const { user, ready, logout } = useAuth();

  // Route guard (demo auth lives in the browser, so it runs after hydration)
  useEffect(() => {
    if (ready && !user) navigate({ to: "/connexion", search: { redirect: pathname || "/compte" } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user?.email]);

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-sand pt-28">
        <div className="container-tf grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="h-64 animate-pulse rounded-3xl bg-white/70" />
          <div className="h-96 animate-pulse rounded-3xl bg-white/70" />
        </div>
      </div>
    );
  }

  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-sand pb-20 pt-28">
      <div className="container-tf">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal">
              {fr ? "Espace client" : "Client area"}
            </p>
            <h1 className="mt-1 h-section text-petrol">
              {fr ? `Bonjour ${user.firstName}` : `Hello ${user.firstName}`}
            </h1>
          </div>
          <DemoBanner className="max-w-md" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
          <aside className="rounded-3xl border border-petrol/10 bg-white p-3 shadow-warm lg:sticky lg:top-28">
            <div className="flex items-center gap-3 border-b border-petrol/10 px-3 pb-4 pt-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal font-display font-bold text-white">
                {`${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-petrol">
                  {user.firstName} {user.lastName}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
              </span>
            </div>
            <nav
              aria-label={fr ? "Espace client" : "Client area"}
              className="mt-2 flex gap-1 overflow-x-auto lg:flex-col"
            >
              {NAV.map((n) => {
                const active = isActive(n.to, n.exact);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex shrink-0 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
                      active ? "text-white" : "text-petrol/75 hover:bg-sand hover:text-petrol",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="account-nav"
                        className="absolute inset-0 -z-0 rounded-2xl bg-petrol"
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      />
                    )}
                    <n.Icon className="relative h-4 w-4" aria-hidden="true" />
                    <span className="relative">{fr ? n.fr : n.en}</span>
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
                className="flex shrink-0 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-terracotta transition-colors hover:bg-terracotta/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal lg:mt-2"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {fr ? "Déconnexion" : "Sign out"}
              </button>
            </nav>
          </aside>

          <main>
            {pathname === "/compte" ? <Dashboard lang={lang} email={user.email} /> : <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const BOOKING_STATUS: Record<BookingStatus, { fr: string; en: string; cls: string }> = {
  upcoming: { fr: "À venir", en: "Upcoming", cls: "bg-teal/10 text-teal" },
  completed: { fr: "Terminée", en: "Completed", cls: "bg-petrol/10 text-petrol" },
  cancelled: { fr: "Annulée", en: "Cancelled", cls: "bg-terracotta/10 text-terracotta" },
};

const CLAIM_STATUS: Record<ClaimStatus, { fr: string; en: string; cls: string }> = {
  received: { fr: "Reçue", en: "Received", cls: "bg-aqua/15 text-petrol" },
  in_progress: { fr: "En cours", en: "In progress", cls: "bg-terracotta/10 text-terracotta" },
  answered: { fr: "Réponse reçue", en: "Answered", cls: "bg-teal/10 text-teal" },
  closed: { fr: "Clôturée", en: "Closed", cls: "bg-petrol/10 text-petrol" },
};

function Dashboard({ lang, email }: { lang: Lang; email: string }) {
  const fr = lang === "fr";
  const reduced = useReducedMotion();
  const bookings = useBookings(email);
  const claims = useClaims(email);
  const today = todayISO();

  const upcoming = bookings
    .filter((b) => b.status === "upcoming" && b.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const next = upcoming[0];
  const openClaims = claims.filter((c) => c.status !== "closed");

  const stats = [
    { label: fr ? "Réservations" : "Bookings", value: bookings.length, Icon: CalendarCheck },
    { label: fr ? "À venir" : "Upcoming", value: upcoming.length, Icon: Users },
    {
      label: fr ? "Réclamations ouvertes" : "Open claims",
      value: openClaims.length,
      Icon: MessageSquareWarning,
    },
  ];

  const item = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: i * 0.07, duration: 0.45, ease: EASE },
        };

  return (
    <div className="grid gap-6">
      <motion.div {...item(0)}>
        {next ? <NextBooking booking={next} lang={lang} /> : <EmptyNext lang={lang} />}
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            {...item(i + 1)}
            className="rounded-3xl border border-petrol/10 bg-white p-5"
          >
            <s.Icon className="h-5 w-5 text-teal" aria-hidden="true" />
            <p className="mt-3 font-display text-3xl font-extrabold text-petrol tabular-nums">
              {s.value}
            </p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <motion.section {...item(4)} className="rounded-3xl border border-petrol/10 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-petrol">
              {fr ? "Dernières réservations" : "Latest bookings"}
            </h2>
            <Link
              to="/compte/reservations"
              className="text-sm font-semibold text-teal hover:underline"
            >
              {fr ? "Tout voir" : "See all"}
            </Link>
          </div>
          {bookings.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {fr ? "Aucune réservation pour le moment." : "No bookings yet."}
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-petrol/10">
              {bookings.slice(0, 3).map((b) => {
                const c = findCircuit(b.circuitSlug);
                const st = BOOKING_STATUS[b.status];
                return (
                  <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-petrol">
                        {c ? circuitName(c, lang) : b.circuitSlug}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(b.date, lang)} · {b.ref}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                        st.cls,
                      )}
                    >
                      {fr ? st.fr : st.en}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.section>

        <motion.section {...item(5)} className="rounded-3xl border border-petrol/10 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-petrol">
              {fr ? "Réclamations" : "Claims"}
            </h2>
            <Link
              to="/compte/reclamations"
              className="text-sm font-semibold text-teal hover:underline"
            >
              {fr ? "Tout voir" : "See all"}
            </Link>
          </div>
          {claims.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {fr ? "Aucune réclamation." : "No claims."}
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-petrol/10">
              {claims.slice(0, 3).map((c) => {
                const st = CLAIM_STATUS[c.status];
                return (
                  <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-petrol">{c.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.ref} · {formatDate(c.updatedAt, lang)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                        st.cls,
                      )}
                    >
                      {fr ? st.fr : st.en}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <Link to="/compte/reclamations" className={cn(btn.ghost, "mt-4 h-10 w-full text-xs")}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {fr ? "Faire une réclamation" : "Submit a claim"}
          </Link>
        </motion.section>
      </div>
    </div>
  );
}

function NextBooking({ booking, lang }: { booking: Booking; lang: Lang }) {
  const fr = lang === "fr";
  const c = findCircuit(booking.circuitSlug);
  const motoNames = booking.motos.map((s) => {
    const m = findMoto(s);
    return m ? motoName(m, lang) : s;
  });
  const days = Math.round(
    (new Date(`${booking.date}T00:00:00`).getTime() -
      new Date(`${todayISO()}T00:00:00`).getTime()) /
      86400000,
  );

  return (
    <article className="relative isolate overflow-hidden rounded-3xl bg-petrol text-white shadow-lift">
      {c && (
        <ImageSlot
          slot={circuitImage(c)}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full opacity-40"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--petrol)_35%,transparent)]" />
      <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-aqua/15 px-3 py-1 text-xs font-semibold text-aqua">
            <span className="h-1.5 w-1.5 rounded-full bg-aqua" />
            {fr ? "Prochain circuit" : "Next circuit"}
            {days >= 0 &&
              ` · ${days === 0 ? (fr ? "aujourd'hui" : "today") : fr ? `dans ${days} j` : `in ${days} d`}`}
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
            {c ? circuitName(c, lang) : booking.circuitSlug}
          </h2>
          <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm text-white/80 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-white/55">Date</dt>
              <dd className="font-semibold text-white">
                {formatDate(booking.date, lang, true)} · {slotLabel(booking.slot, lang)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-white/55">
                {fr ? "Pilotes et motos" : "Riders and motorbikes"}
              </dt>
              <dd className="font-semibold text-white">
                {booking.riders} · {motoNames.join(", ")}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-white/55">{fr ? "Référence" : "Reference"}</dt>
              <dd className="font-semibold text-white">{booking.ref}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/55">Total</dt>
              <dd className="font-semibold text-white">{formatMAD(booking.total, lang)}</dd>
            </div>
          </dl>
        </div>
        <Link
          to="/compte/reservations"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-petrol transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua"
        >
          {fr ? "Voir le détail" : "See details"}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function EmptyNext({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  return (
    <div className="rounded-3xl border-2 border-dashed border-petrol/15 bg-white p-8 text-center">
      <p className="font-display text-xl font-bold text-petrol">
        {fr ? "Aucun circuit à venir" : "No upcoming circuit"}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        {fr
          ? "Choisissez un circuit, puis votre moto, et réservez en quelques minutes."
          : "Pick a circuit, then your motorbike, and book in minutes."}
      </p>
      <Link to="/circuits" className={cn(btn.primary, "mt-6")}>
        {fr ? "Voir les circuits" : "See circuits"}
      </Link>
    </div>
  );
}
