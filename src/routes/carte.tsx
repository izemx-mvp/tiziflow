import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CircuitMap } from "@/components/map/CircuitMap";
import { circuits, difficultyLabel } from "@/data/circuits";
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

function MapPage() {
  const { t, lang } = useT();
  const [visible, setVisible] = useState<string[]>(circuits.map((c) => c.slug));
  const [selected, setSelected] = useState<string | undefined>();
  const selectedCircuit = circuits.find((c) => c.slug === selected);

  const toggle = (slug: string) =>
    setVisible((v) => (v.includes(slug) ? v.filter((s) => s !== slug) : [...v, slug]));

  return (
    <>
      <PageHeader
        title={lang === "fr" ? "La" : "The"}
        flowWord="carte"
        subtitle={
          lang === "fr"
            ? "Tracés indicatifs autour de Midelt. Contenu exemple à remplacer."
            : "Indicative routes around Midelt. Sample content to replace."
        }
        crumbs={[{ label: t.nav.map }]}
      />

      <section className="bg-sand py-10">
        <div className="container-tf grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-2">
            <h2 className="font-display text-lg font-bold text-petrol">{t.nav.circuits}</h2>
            {circuits.map((c) => (
              <div
                key={c.slug}
                className={cn(
                  "rounded-xl border bg-white p-3 transition-colors",
                  selected === c.slug ? "border-terracotta" : "border-petrol/10",
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={visible.includes(c.slug)}
                    onChange={() => toggle(c.slug)}
                    aria-label={c.title[lang]}
                    className="h-4 w-4 accent-[var(--terracotta)]"
                  />
                  <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                  <button
                    onClick={() => setSelected(c.slug)}
                    className="flex-1 text-left text-sm font-semibold text-petrol"
                  >
                    {c.title[lang]}
                  </button>
                </div>
                {selected === c.slug && (
                  <div className="mt-3 border-t border-petrol/10 pt-3 text-xs text-muted-foreground">
                    <p>
                      {c.durationLabel[lang]} · {c.distanceKm} km ·{" "}
                      {difficultyLabel[c.difficulty][lang]}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Link
                        to="/circuits/$slug"
                        params={{ slug: c.slug }}
                        className="rounded-full border border-petrol/20 px-3 py-1.5 font-semibold text-petrol"
                      >
                        {lang === "fr" ? "Voir le circuit" : "View circuit"}
                      </Link>
                      <Link
                        to="/reservation"
                        search={{ type: "circuit", id: c.slug }}
                        className="rounded-full bg-terracotta px-3 py-1.5 font-semibold text-white"
                      >
                        {t.common.book}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <p className="pt-2 text-[11px] text-muted-foreground">
              {lang === "fr"
                ? "Légende : chaque couleur correspond à un circuit. Les repères marquent les arrêts."
                : "Legend: each colour is a circuit. Pins mark the stops."}
            </p>
          </aside>

          <div className="overflow-hidden rounded-2xl border border-petrol/10 bg-white">
            <CircuitMap
              height={620}
              visible={visible}
              selectedSlug={selected}
              onSelect={setSelected}
              lang={lang}
            />
          </div>
        </div>
        {selectedCircuit && <span className="sr-only">{selectedCircuit.title[lang]}</span>}
      </section>
    </>
  );
}
