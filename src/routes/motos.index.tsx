import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { MotoCard } from "@/components/cards/MotoCard";
import { motos, motoCategoryLabel, type MotoCategory } from "@/data/motos";
import { useT } from "@/i18n";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/motos/")({
  head: () =>
    seo({
      title: "Motos électriques à louer à Midelt — TiziFlow",
      description:
        "Découvrez la flotte de motos électriques TiziFlow : autonomie, vitesse, confort et tarifs indicatifs pour vos excursions dans l'Atlas.",
      path: "/motos",
    }),
  component: MotosPage,
});

function MotosPage() {
  const { t, lang } = useT();
  const [cat, setCat] = useState<MotoCategory | "all">("all");
  const [sort, setSort] = useState<"price" | "autonomy">("price");

  const list = useMemo(() => {
    const filtered = motos.filter((m) => cat === "all" || m.category === cat);
    return [...filtered].sort((a, b) =>
      sort === "price" ? a.pricePerDay - b.pricePerDay : b.specs.autonomyKm - a.specs.autonomyKm,
    );
  }, [cat, sort]);

  return (
    <>
      <PageHeader
        title={lang === "fr" ? "Nos motos" : "Our"}
        flowWord={lang === "fr" ? "électriques" : "motorbikes"}
        subtitle={
          lang === "fr"
            ? "Une flotte 100% électrique, silencieuse et adaptée aux pistes de montagne."
            : "A 100% electric, silent fleet built for mountain tracks."
        }
        crumbs={[{ label: t.nav.motos }]}
      />

      <section className="bg-sand section-y">
        <div className="container-tf">
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "trail", "decouverte", "confort"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  cat === c
                    ? "border-terracotta bg-terracotta text-white"
                    : "border-petrol/15 bg-white text-petrol hover:bg-white/70",
                )}
              >
                {c === "all"
                  ? lang === "fr"
                    ? "Toutes"
                    : "All"
                  : motoCategoryLabel[c][lang]}
              </button>
            ))}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "price" | "autonomy")}
              className="ml-auto h-10 rounded-full border border-petrol/15 bg-white px-4 text-sm font-medium"
              aria-label={t.common.sort}
            >
              <option value="price">{lang === "fr" ? "Prix" : "Price"}</option>
              <option value="autonomy">{t.common.autonomy}</option>
            </select>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {list.length} {t.common.results}
          </p>

          <motion.div layout className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((m) => (
                <motion.div
                  key={m.slug}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <MotoCard moto={m} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </>
  );
}
