import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronUp,
  Clock,
  Eye,
  EyeOff,
  Flag,
  List,
  MapPin,
  Mountain,
  Route as RouteIcon,
  Search,
  X,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CircuitMap } from "@/components/map/CircuitMap";
import { ImageSlot } from "@/components/brand/ImageSlot";
import {
  circuits,
  difficultyLabel,
  durationLabelMap,
  type CircuitDuration,
  type Difficulty,
} from "@/data/circuits";
import { useT } from "@/i18n";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/carte")({
  head: () =>
    seo({
      title: "Carte des circuits autour de Midelt — TiziFlow",
      description:
        "Explorez sur la carte les itinéraires guidés TiziFlow autour de Midelt : tracés, arrêts et points de départ.",
      path: "/carte",
    }),
  component: MapPage,
});

type Circuit = (typeof circuits)[number];
type Lang = "fr" | "en";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const DIFF_ORDER: Difficulty[] = ["facile", "intermediaire", "sportif"];
const DURATIONS: CircuitDuration[] = ["demi-journee", "journee", "multi-jours"];
const HEADER_H = 64;

/** Leaflet needs a stable size at mount: measure once, then render the map. */
function useMapHeight() {
  const [h, setH] = useState<number | null>(null);
  useEffect(() => {
    setH(Math.min(900, Math.max(560, window.innerHeight - HEADER_H)));
  }, []);
  return h;
}

function useIsDesktop() {
  const [d, setD] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setD(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return d;
}

function MapPage() {
  const { t, lang } = useT();
  const fr = lang === "fr";
  const reduced = useReducedMotion();
  const mapH = useMapHeight();
  const isDesktop = useIsDesktop();

  const [hidden, setHidden] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const [duration, setDuration] = useState<CircuitDuration | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [sheetOpen, setSheetOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return circuits.filter(
      (c) =>
        (duration === "all" || c.durationType === duration) &&
        (difficulty === "all" || c.difficulty === difficulty) &&
        (!q || c.title.fr.toLowerCase().includes(q) || c.title.en.toLowerCase().includes(q)),
    );
  }, [query, duration, difficulty]);

  // Drawn on the map: matching + not hidden, and the selected one is always kept
  const visible = useMemo(() => {
    const v = matches.filter((c) => !hidden.includes(c.slug)).map((c) => c.slug);
    return selected && !v.includes(selected) ? [...v, selected] : v;
  }, [matches, hidden, selected]);

  const totalKm = circuits.filter((c) => visible.includes(c.slug)).reduce((s, c) => s + c.distanceKm, 0);
  const selectedCircuit = circuits.find((c) => c.slug === selected);
  const filtered = duration !== "all" || difficulty !== "all" || query.trim() !== "";

  const toggleHidden = (slug: string) =>
    setHidden((h) => (h.includes(slug) ? h.filter((s) => s !== slug) : [...h, slug]));
  const select = (slug?: string) => {
    setSelected(slug);
    if (slug) setSheetOpen(true);
  };
  const resetFilters = () => {
    setQuery("");
    setDuration("all");
    setDifficulty("all");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(undefined);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const panelProps = {
    lang,
    matches,
    hidden,
    selected,
    visibleCount: visible.length,
    totalKm,
    query,
    duration,
    difficulty,
    filtered,
    onQuery: setQuery,
    onDuration: setDuration,
    onDifficulty: setDifficulty,
    onReset: resetFilters,
    onToggle: toggleHidden,
    onSelect: select,
    onShowAll: () => setHidden([]),
    onHideAll: () => setHidden(matches.map((c) => c.slug)),
  };

  return (
    <>
      <PageHeader
        title={fr ? "La" : "The"}
        flowWord={fr ? "carte" : "map"}
        subtitle={
          fr
            ? "Tous les itinéraires guidés au départ de Midelt, leurs arrêts et leurs tracés. Tracés indicatifs."
            : "Every guided itinerary from Midelt, with stops and routes. Indicative routes."
        }
        crumbs={[{ label: t.nav.map }]}
        image={{
          slot: "circuit-decouverte" as never,
          alt: fr ? "Motos électriques sur un chemin près d'un village de l'Atlas" : "Electric motorbikes on a path near an Atlas village",
        }}
        fadeTo="none"
      >
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#explorer"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-terracotta px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua"
          >
            {fr ? "Explorer la carte" : "Explore the map"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
            <Flag className="h-4 w-4 text-aqua" aria-hidden="true" />
            {fr ? `${circuits.length} circuits · départ Midelt` : `${circuits.length} circuits · from Midelt`}
          </span>
        </div>
      </PageHeader>

      <section id="explorer" aria-label={fr ? "Carte interactive des circuits" : "Interactive circuit map"} className="scroll-mt-16 bg-petrol">
        <div className="relative" style={{ height: mapH ?? 680 }}>
          {mapH ? (
            <CircuitMap
              height={mapH}
              visible={visible}
              selectedSlug={selected}
              onSelect={(slug: string) => select(slug)}
              lang={lang}
            />
          ) : (
            <div className="h-full w-full animate-pulse bg-[color-mix(in_oklab,var(--petrol)_85%,white)]" />
          )}

          {/* Indicative-route badge (top center, clear of Leaflet's zoom control) */}
          <div className="pointer-events-none absolute left-1/2 top-4 z-[1000] -translate-x-1/2">
            <span className="flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-petrol shadow-warm backdrop-blur">
              <MapPin className="h-3.5 w-3.5 text-terracotta" aria-hidden="true" />
              {fr ? "Tracés indicatifs autour de Midelt" : "Indicative routes around Midelt"}
            </span>
          </div>

          {/* Desktop: floating circuits panel on the right */}
          {isDesktop && (
            <div className="absolute bottom-10 right-4 top-4 z-[1000] flex w-[360px] flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-lift backdrop-blur-xl">
              <CircuitPanel {...panelProps} />
            </div>
          )}

          {/* Desktop: selected circuit card, bottom-left */}
          <AnimatePresence>
            {isDesktop && selectedCircuit && (
              <motion.div
                key={selectedCircuit.slug}
                initial={reduced ? false : { opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, y: 16, scale: 0.97 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="absolute bottom-4 left-4 z-[1000] w-[380px] overflow-hidden rounded-3xl bg-white shadow-lift"
              >
                <CircuitDetail circuit={selectedCircuit} lang={lang} onClose={() => setSelected(undefined)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile: bottom sheet (list or selected detail) */}
          {!isDesktop && (
            <motion.div
              initial={false}
              animate={{ height: sheetOpen ? "72%" : 132 }}
              transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
              className="absolute inset-x-0 bottom-0 z-[1000] flex flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-12px_40px_-12px_rgba(18,48,58,0.45)]"
            >
              <button
                type="button"
                onClick={() => setSheetOpen((o) => !o)}
                aria-expanded={sheetOpen}
                className="flex w-full shrink-0 flex-col items-center gap-2 px-5 pb-3 pt-2.5 focus-visible:outline-none"
              >
                <span className="h-1.5 w-10 rounded-full bg-petrol/15" aria-hidden="true" />
                <span className="flex w-full items-center justify-between text-sm font-semibold text-petrol">
                  <span className="flex items-center gap-2">
                    {selectedCircuit ? (
                      <>
                        <span className="h-3 w-3 rounded-full" style={{ background: selectedCircuit.color }} />
                        {selectedCircuit.title[lang]}
                      </>
                    ) : (
                      <>
                        <List className="h-4 w-4 text-teal" aria-hidden="true" />
                        {fr ? `${visible.length} circuits affichés` : `${visible.length} circuits shown`}
                      </>
                    )}
                  </span>
                  <ChevronUp className={cn("h-5 w-5 transition-transform", sheetOpen && "rotate-180")} aria-hidden="true" />
                </span>
              </button>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {selectedCircuit ? (
                  <CircuitDetail circuit={selectedCircuit} lang={lang} onClose={() => setSelected(undefined)} compact />
                ) : (
                  <CircuitPanel {...panelProps} compact />
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Panel: search, filters, list                                        */
/* ------------------------------------------------------------------ */

function CircuitPanel({
  lang,
  matches,
  hidden,
  selected,
  visibleCount,
  totalKm,
  query,
  duration,
  difficulty,
  filtered,
  onQuery,
  onDuration,
  onDifficulty,
  onReset,
  onToggle,
  onSelect,
  onShowAll,
  onHideAll,
  compact = false,
}: {
  lang: Lang;
  matches: Circuit[];
  hidden: string[];
  selected?: string;
  visibleCount: number;
  totalKm: number;
  query: string;
  duration: CircuitDuration | "all";
  difficulty: Difficulty | "all";
  filtered: boolean;
  onQuery: (q: string) => void;
  onDuration: (d: CircuitDuration | "all") => void;
  onDifficulty: (d: Difficulty | "all") => void;
  onReset: () => void;
  onToggle: (slug: string) => void;
  onSelect: (slug?: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
  compact?: boolean;
}) {
  const fr = lang === "fr";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!compact && (
        <div className="border-b border-petrol/10 px-5 pb-4 pt-5">
          <h2 className="font-display text-lg font-bold text-petrol">{fr ? "Circuits" : "Circuits"}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground" aria-live="polite">
            {fr
              ? `${visibleCount} affiché(s) · ${totalKm} km de tracés`
              : `${visibleCount} shown · ${totalKm} km of routes`}
          </p>
        </div>
      )}

      <div className="space-y-3 border-b border-petrol/10 px-5 py-4">
        <label className="relative block">
          <span className="sr-only">{fr ? "Rechercher un circuit" : "Search a circuit"}</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-petrol/40" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={fr ? "Rechercher un circuit…" : "Search a circuit…"}
            className="h-10 w-full rounded-full border border-petrol/15 bg-white pl-10 pr-4 text-sm text-petrol outline-none transition focus:border-teal focus:ring-4 focus:ring-teal/15"
          />
        </label>
        <Chips
          label={fr ? "Durée" : "Duration"}
          value={duration}
          onChange={onDuration}
          options={DURATIONS.map((d) => ({ value: d, label: durationLabelMap[d][lang] }))}
          allLabel={fr ? "Toutes" : "All"}
        />
        <Chips
          label={fr ? "Niveau" : "Level"}
          value={difficulty}
          onChange={onDifficulty}
          options={DIFF_ORDER.map((d) => ({ value: d, label: difficultyLabel[d][lang] }))}
          allLabel={fr ? "Tous" : "All"}
        />
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex gap-3">
            <button type="button" onClick={onShowAll} className="text-teal hover:underline">
              {fr ? "Tout afficher" : "Show all"}
            </button>
            <button type="button" onClick={onHideAll} className="text-petrol/60 hover:text-petrol hover:underline">
              {fr ? "Tout masquer" : "Hide all"}
            </button>
          </div>
          {filtered && (
            <button type="button" onClick={onReset} className="text-terracotta hover:underline">
              {fr ? "Réinitialiser" : "Reset"}
            </button>
          )}
        </div>
      </div>

      <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-3">
        {matches.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            {fr ? "Aucun circuit ne correspond." : "No circuit matches."}
          </li>
        )}
        {matches.map((c) => {
          const isSel = selected === c.slug;
          const isHidden = hidden.includes(c.slug);
          return (
            <li key={c.slug}>
              <div
                className={cn(
                  "group flex items-center gap-2 rounded-2xl border p-2 pr-1.5 transition-all",
                  isSel ? "border-transparent bg-petrol text-white shadow-warm" : "border-petrol/10 bg-white hover:border-petrol/25",
                  isHidden && !isSel && "opacity-50",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(isSel ? undefined : c.slug)}
                  aria-pressed={isSel}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                >
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                    <ImageSlot slot={c.image} alt="" className="h-full w-full" />
                    <span className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: c.color }} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{c.title[lang]}</span>
                    <span className={cn("block text-xs", isSel ? "text-white/70" : "text-muted-foreground")}>
                      {c.durationLabel[lang]} · {c.distanceKm} km
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggle(c.slug)}
                  aria-pressed={!isHidden}
                  aria-label={
                    isHidden
                      ? fr ? `Afficher ${c.title.fr} sur la carte` : `Show ${c.title.en} on the map`
                      : fr ? `Masquer ${c.title.fr} de la carte` : `Hide ${c.title.en} from the map`
                  }
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
                    isSel ? "text-white/80 hover:bg-white/10" : "text-petrol/60 hover:bg-sand hover:text-petrol",
                  )}
                >
                  {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-petrol/10 px-5 py-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-5 rounded-full bg-terracotta" aria-hidden="true" />
          {fr ? "Tracé" : "Route"}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-petrol" aria-hidden="true" />
          {fr ? "Arrêts" : "Stops"}
        </span>
        <span>{fr ? "Une couleur par circuit" : "One colour per circuit"}</span>
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto hover:text-petrol hover:underline"
        >
          © OpenStreetMap
        </a>
      </div>
    </div>
  );
}

function Chips<T extends string>({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: T | "all";
  onChange: (v: T | "all") => void;
  options: { value: T; label: string }[];
  allLabel: string;
}) {
  const all = [{ value: "all" as const, label: allLabel }, ...options];
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      <span className="w-14 text-xs font-semibold text-petrol/60">{label}</span>
      {all.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
              on ? (o.value === "all" ? "bg-petrol text-white" : "bg-terracotta text-white") : "bg-sand text-petrol hover:bg-petrol/10",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Selected circuit detail                                             */
/* ------------------------------------------------------------------ */

function CircuitDetail({
  circuit,
  lang,
  onClose,
  compact = false,
}: {
  circuit: Circuit;
  lang: Lang;
  onClose: () => void;
  compact?: boolean;
}) {
  const fr = lang === "fr";
  const level = DIFF_ORDER.indexOf(circuit.difficulty) + 1;
  const facts = [
    { Icon: Clock, v: circuit.durationLabel[lang] },
    { Icon: RouteIcon, v: `${circuit.distanceKm} km` },
    { Icon: Mountain, v: `${circuit.elevationM} m` },
  ];

  return (
    <div>
      {!compact && (
        <div className="relative h-32">
          <ImageSlot slot={circuit.image} alt={circuit.title[lang]} className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: circuit.color }} aria-hidden="true" />
          <button
            type="button"
            onClick={onClose}
            aria-label={fr ? "Fermer" : "Close"}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-petrol shadow transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="p-5">
        {!compact && <h3 className="font-display text-xl font-bold text-petrol">{circuit.title[lang]}</h3>}

        <div className={cn("flex flex-wrap items-center gap-2 text-xs", !compact && "mt-3")}>
          {facts.map(({ Icon, v }) => (
            <span key={v} className="flex items-center gap-1.5 rounded-full bg-sand px-2.5 py-1 font-semibold text-petrol">
              <Icon className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
              {v}
            </span>
          ))}
          <span className="flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 font-semibold text-petrol">
            <span className="flex" aria-hidden="true">
              {[1, 2, 3].map((n) => (
                <Zap key={n} className={cn("h-3 w-3", n <= level ? "fill-terracotta text-terracotta" : "text-petrol/20")} />
              ))}
            </span>
            {difficultyLabel[circuit.difficulty][lang]}
          </span>
        </div>

        {circuit.stops.length > 0 && (
          <ol className="relative mt-4 max-h-40 space-y-2 overflow-y-auto pr-1">
            {circuit.stops.map((s, i) => (
              <li key={`${i}-${s.name[lang]}`} className="flex items-center gap-2.5 text-sm text-petrol">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    i === 0 ? "bg-terracotta text-white" : "bg-sand text-petrol",
                  )}
                >
                  {i + 1}
                </span>
                <span className="truncate">{s.name[lang]}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-petrol/10 pt-4">
          <p className="text-xs text-muted-foreground">
            {fr ? "À partir de" : "From"}
            <span className="block font-display text-lg font-extrabold text-petrol">
              {circuit.pricePerPerson} MAD<span className="text-xs font-medium text-muted-foreground">{fr ? " / pers." : " / person"}</span>
            </span>
          </p>
          <div className="flex gap-2">
            <Link
              to="/circuits/$slug"
              params={{ slug: circuit.slug }}
              className="inline-flex h-10 items-center rounded-full border border-petrol/15 px-4 text-xs font-semibold text-petrol transition hover:border-petrol hover:bg-petrol hover:text-white"
            >
              {fr ? "Voir" : "View"}
            </Link>
            <Link
              to="/reservation"
              search={{ type: "circuit", id: circuit.slug }}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-terracotta px-4 text-xs font-semibold text-white transition hover:-translate-y-0.5"
            >
              {fr ? "Réserver" : "Book"}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {compact && (
          <button type="button" onClick={onClose} className="mt-4 w-full text-center text-xs font-semibold text-petrol/60 hover:text-petrol">
            {fr ? "← Retour à la liste" : "← Back to the list"}
          </button>
        )}
      </div>
    </div>
  );
}