import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImageSlot } from "@/components/brand/ImageSlot";
import { TfLink } from "@/components/brand/Buttons";
import { MotoCard } from "@/components/cards/MotoCard";
import { motoBySlug, motos, motoCategoryLabel } from "@/data/motos";
import { useT } from "@/i18n";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/motos/$slug")({
  loader: ({ params }) => {
    const moto = motoBySlug(params.slug);
    if (!moto) throw notFound();
    return { moto };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return seo({
        title: "Moto introuvable — TiziFlow",
        description: "Cette moto n'est pas disponible.",
        path: "/motos",
        noindex: true,
      });
    return seo({
      title: `${loaderData.moto.name} — moto électrique | TiziFlow`,
      description: loaderData.moto.description.fr,
      path: `/motos/${loaderData.moto.slug}`,
    });
  },
  component: MotoDetail,
});

function MotoDetail() {
  const { moto } = Route.useLoaderData();
  const { t, lang } = useT();
  const similar = motos.filter((m) => m.slug !== moto.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        title={moto.name}
        subtitle={moto.description[lang]}
        crumbs={[{ label: t.nav.motos, to: "/motos" }, { label: moto.name }]}
      />

      <section className="bg-white section-y">
        <div className="container-tf grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <ImageSlot
              slot={moto.images[0]}
              alt={moto.name}
              className="aspect-16/10 rounded-2xl"
            />
            <div className="mt-3 grid grid-cols-3 gap-3">
              {moto.images.map((img) => (
                <ImageSlot key={img} slot={img} alt={moto.name} className="aspect-4/3 rounded-xl" />
              ))}
            </div>

            <h2 className="mt-10 font-display text-2xl font-bold text-petrol">
              {lang === "fr" ? "Caractéristiques" : "Specifications"}
            </h2>
            <table className="mt-4 w-full overflow-hidden rounded-xl text-sm">
              <tbody>
                {[
                  [t.common.category, motoCategoryLabel[moto.category][lang]],
                  [t.common.autonomy, `${moto.specs.autonomyKm} km`],
                  [t.common.topSpeed, `${moto.specs.topSpeedKmh} km/h`],
                  [t.common.chargeTime, `${moto.specs.chargeHours} h`],
                  [t.common.power, `${moto.specs.powerKw} kW`],
                  [t.common.seats, moto.specs.seats],
                  ["Poids / Weight", `${moto.specs.weightKg} kg`],
                ].map(([k, v], i) => (
                  <tr key={String(k)} className={i % 2 ? "bg-sand" : "bg-white"}>
                    <th scope="row" className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                      {k}
                    </th>
                    <td className="px-4 py-2.5 font-semibold text-petrol">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-display font-bold text-petrol">
                  {lang === "fr" ? "Points forts" : "Highlights"}
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {moto.features[lang].map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-display font-bold text-petrol">
                  {lang === "fr" ? "Équipement inclus" : "Included gear"}
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {moto.included[lang].map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-8 rounded-xl bg-sand p-4 text-xs text-muted-foreground">
              {lang === "fr"
                ? "Conditions de location : prérequis, caution et assurance à confirmer par l'agence. (Placeholder à compléter.)"
                : "Rental conditions: prerequisites, deposit and insurance to be confirmed by the agency. (Placeholder.)"}
            </p>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-petrol/10 bg-white p-6 shadow-warm">
              <p className="text-xs uppercase tracking-wide text-terracotta">PRIX EXEMPLE</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-petrol">
                {moto.pricePerDay} MAD
                <span className="text-base font-medium text-muted-foreground"> {t.common.perDay}</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {lang === "fr" ? "Demi-journée" : "Half day"} : {moto.pricePerHalfDay} MAD
              </p>
              <TfLink
                to="/reservation"
                search={{ type: "moto", id: moto.slug }}
                variant="primary"
                size="lg"
                className="mt-5 w-full"
                withArrow
              >
                {lang === "fr" ? "Réserver cette moto" : "Book this motorbike"}
              </TfLink>
            </div>
          </aside>
        </div>

        <div className="container-tf mt-16">
          <h2 className="font-display text-2xl font-bold text-petrol">
            {lang === "fr" ? "Motos similaires" : "Similar motorbikes"}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((m) => (
              <MotoCard key={m.slug} moto={m} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
