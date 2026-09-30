import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImageSlot } from "@/components/brand/ImageSlot";
import { TfLink } from "@/components/brand/Buttons";
import { CircuitCard } from "@/components/cards/CircuitCard";
import { CircuitMap } from "@/components/map/CircuitMap";
import { circuitBySlug, circuits, difficultyLabel } from "@/data/circuits";
import { activities } from "@/data/activities";
import { useT } from "@/i18n";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/circuits/$slug")({
  loader: ({ params }) => {
    const circuit = circuitBySlug(params.slug);
    if (!circuit) throw notFound();
    return { circuit };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return seo({
        title: "Circuit introuvable — TiziFlow",
        description: "Ce circuit n'est pas disponible.",
        path: "/circuits",
        noindex: true,
      });
    return seo({
      title: `${loaderData.circuit.title.fr} — circuit guidé | TiziFlow`,
      description: loaderData.circuit.description.fr,
      path: `/circuits/${loaderData.circuit.slug}`,
    });
  },
  component: CircuitDetail,
});

function CircuitDetail() {
  const { circuit } = Route.useLoaderData();
  const { t, lang } = useT();
  const related = circuits.filter((c) => c.slug !== circuit.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        title={circuit.title[lang]}
        subtitle={circuit.description[lang]}
        crumbs={[{ label: t.nav.circuits, to: "/circuits" }, { label: circuit.title[lang] }]}
      />

      <section className="bg-white section-y">
        <div className="container-tf grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <ImageSlot slot={circuit.image} alt={circuit.title[lang]} className="aspect-16/9 rounded-2xl" />

            <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-sand p-4 sm:grid-cols-3">
              <Fact label={t.common.duration} value={circuit.durationLabel[lang]} />
              <Fact label={t.common.distance} value={`${circuit.distanceKm} km`} />
              <Fact label={lang === "fr" ? "Dénivelé" : "Elevation"} value={`${circuit.elevationM} m`} />
              <Fact label={t.common.difficulty} value={difficultyLabel[circuit.difficulty][lang]} />
              <Fact
                label={lang === "fr" ? "Participants max" : "Max participants"}
                value={String(circuit.maxParticipants)}
              />
              <Fact label="PRIX EXEMPLE" value={`${circuit.pricePerPerson} MAD`} />
            </div>

            <h2 className="mt-10 font-display text-2xl font-bold text-petrol">
              {lang === "fr" ? "Itinéraire" : "Itinerary"}
            </h2>
            <ol className="mt-5 space-y-5 border-l-2 border-dashed border-aqua/50 pl-6">
              {circuit.stops.map((s) => (
                <li key={s.name[lang]} className="relative">
                  <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-terracotta" />
                  <p className="font-display font-bold text-petrol">{s.name[lang]}</p>
                  <p className="text-sm text-muted-foreground">{s.text[lang]}</p>
                </li>
              ))}
            </ol>

            <div className="mt-10 overflow-hidden rounded-2xl border border-petrol/10">
              <CircuitMap height={380} visible={[circuit.slug]} selectedSlug={circuit.slug} lang={lang} />
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-display font-bold text-petrol">
                  {lang === "fr" ? "Inclus" : "Included"}
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {circuit.included[lang].map((x) => (
                    <li key={x}>• {x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-display font-bold text-petrol">
                  {lang === "fr" ? "Non inclus" : "Not included"}
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {circuit.excluded[lang].map((x) => (
                    <li key={x}>• {x}</li>
                  ))}
                </ul>
              </div>
            </div>

            <h3 className="mt-10 font-display text-xl font-bold text-petrol">
              {lang === "fr" ? "Activités complémentaires" : "Add-on activities"}
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {activities.slice(0, 3).map((a) => (
                <div key={a.slug} className="rounded-xl border border-petrol/10 p-4">
                  <p className="font-semibold text-petrol">{a.title[lang]}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.short[lang]}</p>
                  <p className="mt-2 text-sm font-bold text-terracotta">{a.price} MAD</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-petrol/10 bg-white p-6 shadow-warm">
              <p className="text-xs uppercase tracking-wide text-terracotta">PRIX EXEMPLE</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-petrol">
                {circuit.pricePerPerson} MAD
                <span className="text-base font-medium text-muted-foreground">
                  {lang === "fr" ? " / personne" : " / person"}
                </span>
              </p>
              <TfLink
                to="/reservation"
                search={{ type: "circuit", id: circuit.slug }}
                variant="primary"
                size="lg"
                className="mt-5 w-full"
                withArrow
              >
                {lang === "fr" ? "Réserver ce circuit" : "Book this circuit"}
              </TfLink>
            </div>
          </aside>
        </div>

        <div className="container-tf mt-16">
          <h2 className="font-display text-2xl font-bold text-petrol">
            {lang === "fr" ? "Circuits similaires" : "Related circuits"}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <CircuitCard key={c.slug} circuit={c} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display font-bold text-petrol">{value}</p>
    </div>
  );
}
