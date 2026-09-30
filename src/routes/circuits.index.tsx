import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { CircuitCard } from "@/components/cards/CircuitCard";
import {
  circuits,
  difficultyLabel,
  durationLabelMap,
  themeLabel,
  type CircuitDuration,
  type Difficulty,
  type CircuitTheme,
} from "@/data/circuits";
import { useT } from "@/i18n";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/circuits/")({
  head: () =>
    seo({
      title: "Circuits guidés en moto électrique autour de Midelt — TiziFlow",
      description:
        "Demi-journée, journée ou traversée de deux jours : découvrez les circuits guidés TiziFlow dans l'Atlas.",
      path: "/circuits",
    }),
  component: CircuitsPage,
});

function CircuitsPage() {
  const { t, lang } = useT();
  const [duration, setDuration] = useState<CircuitDuration | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [theme, setTheme] = useState<CircuitTheme | "all">("all");

  const list = useMemo(
    () =>
      circuits.filter(
        (c) =>
          (duration === "all" || c.durationType === duration) &&
          (difficulty === "all" || c.difficulty === difficulty) &&
          (theme === "all" || c.theme === theme),
      ),
    [duration, difficulty, theme],
  );

  return (
    <>
      <PageHeader
        title={lang === "fr" ? "Nos" : "Our guided"}
        flowWord={lang === "fr" ? "circuits" : "circuits"}
        subtitle={
          lang === "fr"
            ? "Des itinéraires accompagnés au départ de Midelt, du plateau roulant à la traversée sportive."
            : "Guided itineraries from Midelt, from easy plateaus to demanding crossings."
        }
        crumbs={[{ label: t.nav.circuits }]}
      />

      <section className="bg-sand section-y">
        <div className="container-tf">
          <div className="flex flex-wrap gap-2">
            <Pills
              value={duration}
              onChange={setDuration}
              options={(["demi-journee", "journee", "multi-jours"] as CircuitDuration[]).map((d) => ({
                value: d,
                label: durationLabelMap[d][lang],
              }))}
              allLabel={t.common.duration}
            />
            <Pills
              value={difficulty}
              onChange={setDifficulty}
              options={(["facile", "intermediaire", "sportif"] as Difficulty[]).map((d) => ({
                value: d,
                label: difficultyLabel[d][lang],
              }))}
              allLabel={t.common.difficulty}
            />
            <Pills
              value={theme}
              onChange={setTheme}
              options={(["nature", "culture", "panorama"] as CircuitTheme[]).map((d) => ({
                value: d,
                label: themeLabel[d][lang],
              }))}
              allLabel="Type"
            />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {list.length} {t.common.results}
          </p>

          <motion.div layout className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((c) => (
                <motion.div
                  key={c.slug}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <CircuitCard circuit={c} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </>
  );
}

function Pills<T extends string>({
  value,
  onChange,
  options,
  allLabel,
}: {
  value: T | "all";
  onChange: (v: T | "all") => void;
  options: { value: T; label: string }[];
  allLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-full bg-white p-1">
      <span className="px-2 text-xs font-semibold uppercase text-muted-foreground">{allLabel}</span>
      <button
        onClick={() => onChange("all")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-semibold",
          value === "all" ? "bg-petrol text-white" : "text-petrol",
        )}
      >
        ×
      </button>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold",
            value === o.value ? "bg-terracotta text-white" : "text-petrol hover:bg-sand",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
