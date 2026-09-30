import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImageSlot } from "@/components/brand/ImageSlot";
import { TfButton } from "@/components/brand/Buttons";
import { Reveal } from "@/components/brand/Reveal";
import { activities } from "@/data/activities";
import { useBooking } from "@/context/BookingContext";
import { useT } from "@/i18n";
import { seo } from "@/lib/seo";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/activites")({
  head: () =>
    seo({
      title: "Activités & services — TiziFlow Midelt",
      description:
        "Guide local, pique-nique en montagne, coucher de soleil, photographe, équipement et transfert : complétez votre excursion TiziFlow.",
      path: "/activites",
    }),
  component: ActivitiesPage,
});

function ActivitiesPage() {
  const { t, lang } = useT();
  const { state, dispatch } = useBooking();

  return (
    <>
      <PageHeader
        title={lang === "fr" ? "Activités &" : "Activities &"}
        flowWord={lang === "fr" ? "services" : "services"}
        subtitle={
          lang === "fr"
            ? "Des options à ajouter à votre réservation pour compléter l'expérience."
            : "Options to add to your booking to round out the experience."
        }
        crumbs={[{ label: t.nav.activities }]}
      />

      <div className="bg-white">
        <div className="container-tf flex gap-10 py-16">
          <nav className="sticky top-24 hidden h-fit w-56 shrink-0 space-y-1 lg:block" aria-label="Sections">
            {activities.map((a) => (
              <a
                key={a.slug}
                href={`#${a.slug}`}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-petrol transition-colors hover:bg-sand"
              >
                {a.title[lang]}
              </a>
            ))}
          </nav>

          <div className="flex-1 space-y-20">
            {activities.map((a, i) => {
              const selected = state.addons.includes(a.slug);
              return (
                <Reveal key={a.slug}>
                  <section
                    id={a.slug}
                    className={cn(
                      "grid items-center gap-8 scroll-mt-28 md:grid-cols-2",
                      i % 2 === 1 && "md:[&>div:first-child]:order-2",
                    )}
                  >
                    <ImageSlot slot={a.image} alt={a.title[lang]} className="aspect-4/3 rounded-2xl" />
                    <div>
                      <h2 className="font-display text-2xl font-bold text-petrol">{a.title[lang]}</h2>
                      <p className="mt-3 text-muted-foreground">{a.text[lang]}</p>
                      <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                        {a.bullets[lang].map((b) => (
                          <li key={b}>• {b}</li>
                        ))}
                      </ul>
                      <p className="mt-4 text-xs uppercase tracking-wide text-terracotta">PRIX EXEMPLE</p>
                      <p className="font-display text-2xl font-extrabold text-petrol">{a.price} MAD</p>
                      <TfButton
                        variant={selected ? "teal" : "primary"}
                        size="lg"
                        className="mt-4"
                        onClick={() => {
                          dispatch({ type: "toggleAddon", slug: a.slug });
                          toast.success(
                            selected
                              ? lang === "fr"
                                ? "Retiré de votre réservation"
                                : "Removed from your booking"
                              : lang === "fr"
                                ? "Ajouté à votre réservation"
                                : "Added to your booking",
                          );
                        }}
                      >
                        {selected
                          ? lang === "fr"
                            ? "Ajouté ✓"
                            : "Added ✓"
                          : lang === "fr"
                            ? "Ajouter à ma réservation"
                            : "Add to my booking"}
                      </TfButton>
                    </div>
                  </section>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
