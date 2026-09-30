import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bike, List, Map as MapIcon, MapPin, MessageCircle, RotateCcw, X, Zap } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CircuitCard } from "@/components/cards/CircuitCard";
import { CircuitMap } from "@/components/map/CircuitMap";
import { TfAnchor, TfLink } from "@/components/brand/Buttons";
import {
  circuits,
  difficultyLabel,
  durationLabelMap,
  themeLabel,
  type CircuitDuration,
  type CircuitTheme,
  type Difficulty,
} from "@/data/circuits";
import { whatsappLink } from "@/config/site";
import { compatibleMotos, findMoto, motoName } from "@/lib/catalog";
import { useT } from "@/i18n";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/circuits/")({
  // ?moto=slug shows only the circuits where that motorbike is available
  validateSearch: (s: Record<string, unknown>): { moto?: string } => ({
    moto: typeof s["moto"] === "string" ? s["moto"] : undefined,
  }),
  head: () =>
    seo({
      title: "Circuits guidés en moto électrique autour de Midelt — TiziFlow",
      description:
        "Demi-journée, journée ou traversée de deux jours : découvrez les circuits guidés TiziFlow dans l'Atlas.",
      path: "/circuits",
    }),
  component: CircuitsPage,
});

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function CircuitsPage() {
  const { t, lang } = useT();
  const fr = lang === "fr";
  const reduced = useReducedMotion();
  const { moto } = Route.useSearch();
  const navigate = useNavigate({ from: "/circuits/" });
  const motoObj = findMoto(moto);

  const [duration, setDuration] = useState<CircuitDuration | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [theme, setTheme] = useState<CircuitTheme | "all">("all");
  const [hovered, setHovered] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list"); // mobile only

  const list = useMemo(
    () =>
      circuits.filter(
        (c) =>
          (duration === "all" || c.durationType === duration) &&
          (difficulty === "all" || c.difficulty === difficulty) &&
          (theme === "all" || c.theme === theme) &&
          (!motoObj || compatibleMotos(c).some((m) => m.slug === motoObj.slug)),
      ),
    [duration, difficulty, theme, motoObj],
  );

  const filtered = duration !== "all" || difficulty !== "all" || theme !== "all" || !!motoObj;
  const reset = () => {
    setDuration("all");
    setDifficulty("all");
    setTheme("all");
    if (moto) navigate({ search: {} });
  };
  const hoveredCircuit = circuits.find((c) => c.slug === hovered);

  return (
    <>
      <PageHeader
        title={fr ? "Nos" : "Our guided"}
        flowWord="circuits"
        subtitle={
          fr
            ? "Des itinéraires accompagnés au départ de Midelt, du plateau roulant à la traversée sportive. Vous choisissez le circuit, puis votre moto."
            : "Guided itineraries from Midelt, from easy plateaus to demanding crossings. Choose the circuit, then your motorbike."
        }
        crumbs={[{ label: t.nav.circuits }]}
        image={{
          slot: "circuit-traversee" as never,
          alt: fr ? "Motos électriques sur une piste de l'Atlas" : "Electric motorbikes on an Atlas track",
        }}
        fadeTo="sand"
      >
        <ul className="flex flex-wrap gap-2 text-sm">
          {[
            { Icon: MapPin, label: fr ? "Départ de Midelt" : "From Midelt" },
            { Icon: Zap, label: fr ? "Motos 100 % électriques" : "100% electric motorbikes" },
            { Icon: Bike, label: fr ? `${circuits.length} circuits au choix` : `${circuits.length} circuits to choose from` },
          ].map(({ Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur"
            >
              <Icon className="h-4 w-4 text-aqua" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </PageHeader>

      <section className="bg-sand pb-20 pt-6 sm:pb-28">
        <div className="container-tf">
          {/* Sticky filter bar */}
          <div className="sticky top-[4.5rem] z-30 rounded-3xl border border-petrol/10 bg-white/85 p-3 shadow-[0_10px_30px_-24px_rgba(18,48,58,0.6)] backdrop-blur-md">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 xl:pb-0">
                <FilterGroup
                  id="duration"
                  label={t.common.duration}
                  value={duration}
                  onChange={setDuration}
                  allLabel={fr ? "Toutes" : "All"}
                  options={(["demi-journee", "journee", "multi-jours"] as CircuitDuration[]).map((d) => ({
                    value: d,
                    label: durationLabelMap[d][lang],
                  }))}
                />
                <FilterGroup
                  id="difficulty"
                  label={t.common.difficulty}
                  value={difficulty}
                  onChange={setDifficulty}
                  allLabel={fr ? "Tous" : "All"}
                  options={(["facile", "intermediaire", "sportif"] as Difficulty[]).map((d) => ({
                    value: d,
                    label: difficultyLabel[d][lang],
                  }))}
                />
                <FilterGroup
                  id="theme"
                  label={fr ? "Type" : "Type"}
                  value={theme}
                  onChange={setTheme}
                  allLabel={fr ? "Tous" : "All"}
                  options={(["nature", "culture", "panorama"] as CircuitTheme[]).map((d) => ({
                    value: d,
                    label: themeLabel[d][lang],
                  }))}
                />
              </div>

              <div className="flex items-center justify-between gap-3 px-1">
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  <motion.span
                    key={list.length}
                    initial={reduced ? false : { y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="inline-block font-display font-bold text-petrol"
                  >
                    {list.length}
                  </motion.span>{" "}
                  {t.common.results}
                </p>
                <div className="flex items-center gap-2">
                  <AnimatePresence>
                    {filtered && (
                      <motion.button
                        type="button"
                        onClick={reset}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-terracotta transition hover:bg-terracotta/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        {fr ? "Réinitialiser" : "Reset"}
                      </motion.button>
                    )}
                  </AnimatePresence>
                  <div className="flex rounded-full bg-sand p-1 lg:hidden" role="group" aria-label={fr ? "Affichage" : "View"}>
                    {(["list", "map"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setView(v)}
                        aria-pressed={view === v}
                        aria-label={v === "list" ? (fr ? "Liste" : "List") : fr ? "Carte" : "Map"}
                        className={cn(
                          "flex h-8 w-9 items-center justify-center rounded-full transition-colors",
                          view === v ? "bg-petrol text-white" : "text-petrol",
                        )}
                      >
                        {v === "list" ? <List className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {motoObj && (
              <div className="mt-3 flex items-center gap-2 border-t border-petrol/10 px-1 pt-3 text-sm">
                <span className="text-muted-foreground">{fr ? "Circuits disponibles avec :" : "Circuits available with:"}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 py-1 pl-3 pr-1 font-semibold text-petrol">
                  {motoName(motoObj, lang)}
                  <button
                    type="button"
                    onClick={() => navigate({ search: {} })}
                    aria-label={fr ? "Retirer le filtre moto" : "Remove motorbike filter"}
                    className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-teal hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* List + synced map */}
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_minmax(340px,0.75fr)] xl:grid-cols-[1fr_440px]">
            <div className={cn(view === "map" && "hidden lg:block")}>
              {list.length > 0 ? (
                <motion.div layout={!reduced} className="grid gap-6 sm:grid-cols-2">
                  <AnimatePresence mode="popLayout">
                    {list.map((c, i) => (
                      <motion.div
                        key={c.slug}
                        layout={!reduced}
                        initial={reduced ? false : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduced ? undefined : { opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.4, delay: reduced ? 0 : Math.min(i, 5) * 0.05, ease: EASE }}
                        onMouseEnter={() => setHovered(c.slug)}
                        onMouseLeave={() => setHovered(null)}
                        onFocusCapture={() => setHovered(c.slug)}
                        onBlurCapture={() => setHovered(null)}
                        className={cn(
                          "rounded-2xl transition-shadow duration-300",
                          hovered === c.slug && "ring-2 ring-teal ring-offset-4 ring-offset-sand",
                        )}
                      >
                        <CircuitCard circuit={c} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="rounded-3xl border-2 border-dashed border-petrol/15 bg-white p-10 text-center">
                  <p className="font-display text-xl font-bold text-petrol">
                    {fr ? "Aucun circuit ne correspond à ces filtres" : "No circuit matches these filters"}
                  </p>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                    {fr ? "Élargissez la durée ou la difficulté pour voir plus d'itinéraires." : "Widen the duration or difficulty to see more itineraries."}
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-petrol px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    {fr ? "Voir tous les circuits" : "See all circuits"}
                  </button>
                </div>
              )}
            </div>

            <div className={cn(view === "list" && "hidden lg:block")}>
              <div className="lg:sticky lg:top-44">
                <div className="overflow-hidden rounded-3xl border-4 border-white bg-white shadow-lift">
                  <CircuitMap
                    height={520}
                    visible={list.map((c) => c.slug)}
                    selectedSlug={hovered ?? undefined}
                    lang={lang}
                  />
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
                  <MapPin className="h-4 w-4 text-terracotta" aria-hidden="true" />
                  {hoveredCircuit
                    ? hoveredCircuit.title[lang]
                    : fr
                      ? "Survolez un circuit pour le repérer sur la carte."
                      : "Hover a circuit to spot it on the map."}
                </p>
              </div>
            </div>
          </div>

          {/* Help band */}
          <div className="relative mt-16 overflow-hidden rounded-3xl bg-petrol p-8 text-white topo-texture sm:p-10">
            <div aria-hidden="true" className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-aqua/15 blur-3xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">
                  {fr ? "Vous hésitez entre deux circuits ?" : "Can't choose between two circuits?"}
                </h2>
                <p className="mt-2 max-w-lg text-white/75">
                  {fr
                    ? "Dites-nous votre niveau et le temps dont vous disposez, l'équipe vous conseille le bon itinéraire."
                    : "Tell us your level and how much time you have, and the team will suggest the right itinerary."}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <TfAnchor href={whatsappLink()} target="_blank" rel="noopener noreferrer" variant="primary" size="lg">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </TfAnchor>
                <TfLink to="/contact" variant="outlineLight" size="lg">
                  {fr ? "Nous écrire" : "Write to us"}
                </TfLink>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {fr ? "Envie de voir les motos d'abord ? " : "Want to see the motorbikes first? "}
            <Link to="/motos" className="font-semibold text-teal hover:underline">
              {fr ? "Découvrir les motos" : "Discover the motorbikes"}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

function FilterGroup<T extends string>({
  id,
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  id: string;
  label: string;
  value: T | "all";
  onChange: (v: T | "all") => void;
  options: { value: T; label: string }[];
  allLabel: string;
}) {
  const all = [{ value: "all" as const, label: allLabel }, ...options];
  return (
    <div role="radiogroup" aria-label={label} className="flex shrink-0 items-center gap-1 rounded-full bg-sand p-1">
      <span className="px-2.5 text-xs font-semibold text-petrol/60">{label}</span>
      {all.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative isolate whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
              active ? "text-white" : "text-petrol hover:text-terracotta",
            )}
          >
            {active && (
              <motion.span
                layoutId={`filter-${id}`}
                className={cn("absolute inset-0 -z-10 rounded-full", o.value === "all" ? "bg-petrol" : "bg-terracotta")}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}