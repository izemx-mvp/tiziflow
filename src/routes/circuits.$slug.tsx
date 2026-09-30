import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, useReducedMotion, type MotionProps } from "framer-motion";
import {
  Camera,
  Car,
  Check,
  Clock,
  Compass,
  Gauge,
  Lock,
  MessageCircle,
  Mountain,
  Route as RouteIcon,
  ShieldCheck,
  Sunset,
  Users,
  UtensilsCrossed,
  X,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImageSlot } from "@/components/brand/ImageSlot";
import { TfLink } from "@/components/brand/Buttons";
import { CircuitCard } from "@/components/cards/CircuitCard";
import { CircuitMap } from "@/components/map/CircuitMap";
import { Counter, btn } from "@/components/forms/ui";
import { circuitBySlug, circuits, difficultyLabel, themeLabel } from "@/data/circuits";
import { activities } from "@/data/activities";
import { whatsappLink } from "@/config/site";
import { compatibleMotos, formatMAD, motoImage, motoName, motoRange, motoSupplement } from "@/lib/catalog";
import { useT } from "@/i18n";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

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

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const ACTIVITY_ICONS: Record<string, typeof Compass> = { Compass, UtensilsCrossed, Sunset, Camera, ShieldCheck, Car };
const DIFFICULTY_ORDER = ["facile", "intermediaire", "sportif"];

function useFadeUp() {
  const reduced = useReducedMotion();
  return (i = 0): MotionProps =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.55, delay: i * 0.08, ease: EASE },
        };
}

/** Highlights the in-page nav item of the section currently in view. */
function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return active;
}

function CircuitDetail() {
  const { circuit } = Route.useLoaderData();
  const { t, lang } = useT();
  const fr = lang === "fr";
  const reduced = useReducedMotion();
  const fade = useFadeUp();
  const [riders, setRiders] = useState(2);

  const bikes = compatibleMotos(circuit);
  const related = circuits.filter((c) => c.slug !== circuit.slug).slice(0, 3);
  const level = DIFFICULTY_ORDER.indexOf(circuit.difficulty) + 1;
  const diff = difficultyLabel[circuit.difficulty][lang];

  const sections = [
    { id: "apercu", label: fr ? "Aperçu" : "Overview" },
    { id: "itineraire", label: fr ? "Itinéraire" : "Itinerary" },
    { id: "carte", label: fr ? "Carte" : "Map" },
    { id: "motos", label: fr ? "Motos" : "Motorbikes" },
    { id: "inclus", label: fr ? "Inclus" : "Included" },
    { id: "options", label: fr ? "Options" : "Extras" },
  ];
  const active = useScrollSpy(sections.map((s) => s.id));

  const facts = [
    { Icon: Clock, label: t.common.duration, value: circuit.durationLabel[lang] },
    { Icon: RouteIcon, label: t.common.distance, value: `${circuit.distanceKm} km` },
    { Icon: Mountain, label: fr ? "Dénivelé" : "Elevation", value: `${circuit.elevationM} m` },
    { Icon: Gauge, label: t.common.difficulty, value: diff },
    { Icon: Users, label: fr ? "Participants max" : "Max participants", value: String(circuit.maxParticipants) },
  ];

  const tripLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: circuit.title[lang],
    description: circuit.description[lang],
    touristType: diff,
    itinerary: {
      "@type": "ItemList",
      itemListElement: circuit.stops.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name[lang] })),
    },
    offers: { "@type": "Offer", price: circuit.pricePerPerson, priceCurrency: "MAD" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tripLd) }} />

      <PageHeader
        title={circuit.title[lang]}
        subtitle={circuit.description[lang]}
        crumbs={[{ label: t.nav.circuits, to: "/circuits" }, { label: circuit.title[lang] }]}
        image={{ slot: circuit.image, alt: circuit.title[lang] }}
      >
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-terracotta px-3.5 py-1.5 font-semibold">{themeLabel[circuit.theme][lang]}</span>
          <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur">
            <Clock className="h-4 w-4 text-aqua" aria-hidden="true" />
            {circuit.durationLabel[lang]}
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur">
            <DifficultyBolts level={level} light />
            {diff}
          </span>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <TfLink
            to="/reservation"
            search={{ type: "circuit", id: circuit.slug }}
            variant="primary"
            size="lg"
            withArrow
          >
            {fr ? "Réserver ce circuit" : "Book this circuit"}
          </TfLink>
          <p className="text-sm text-white/80">
            {fr ? "À partir de " : "From "}
            <span className="font-display text-xl font-bold text-white">{formatMAD(circuit.pricePerPerson, lang)}</span>
            {fr ? " / pers." : " / person"}
          </p>
        </div>
      </PageHeader>

      {/* Key facts, overlapping the header edge */}
      <div className="relative z-10 bg-white">
        <div className="container-tf">
          <motion.dl
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
            className="-mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-petrol/10 bg-petrol/10 shadow-warm sm:grid-cols-3 lg:grid-cols-5"
          >
            {facts.map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 bg-white p-4 sm:p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand text-teal">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="truncate font-display font-bold text-petrol">{value}</dd>
                </div>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>

      {/* Sticky in-page nav */}
      <nav
        aria-label={fr ? "Sections du circuit" : "Circuit sections"}
        className="sticky top-16 z-20 mt-10 border-y border-petrol/10 bg-white/85 backdrop-blur-md"
      >
        <div className="container-tf flex gap-1 overflow-x-auto py-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={active === s.id ? "true" : undefined}
              className={cn(
                "relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
                active === s.id ? "text-petrol" : "text-petrol/55 hover:text-petrol",
              )}
            >
              {s.label}
              {active === s.id && (
                <motion.span
                  layoutId="circuit-section"
                  className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-terracotta"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
            </a>
          ))}
        </div>
      </nav>

      <section className="bg-white pb-20 pt-10 sm:pb-28">
        <div className="container-tf grid gap-12 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="min-w-0 space-y-16">
            {/* Overview */}
            <section id="apercu" className="scroll-mt-36">
              <SectionTitle>{fr ? "Le circuit en bref" : "The circuit at a glance"}</SectionTitle>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-ink">{circuit.description[lang]}</p>
              <motion.div {...fade()} className="mt-8 overflow-hidden rounded-3xl">
                <ImageSlot slot={circuit.image} alt={circuit.title[lang]} className="aspect-[16/9] w-full" />
              </motion.div>
            </section>

            {/* Itinerary */}
            <section id="itineraire" className="scroll-mt-36">
              <SectionTitle>{fr ? "Itinéraire" : "Itinerary"}</SectionTitle>
              <ol className="relative mt-8">
                <motion.span
                  aria-hidden="true"
                  initial={{ scaleY: reduced ? 1 : 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 1.2, ease: EASE }}
                  className="absolute bottom-6 left-[19px] top-6 w-0.5 origin-top bg-[repeating-linear-gradient(to_bottom,var(--aqua)_0_8px,transparent_8px_14px)]"
                />
                {circuit.stops.map((s, i) => {
                  const last = i === circuit.stops.length - 1;
                  return (
                    <motion.li key={`${i}-${s.name[lang]}`} {...fade(i)} className="relative flex gap-5 pb-8 last:pb-0">
                      <span
                        className={cn(
                          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ring-4 ring-white",
                          i === 0 ? "bg-terracotta text-white" : last ? "bg-petrol text-white" : "bg-sand text-petrol",
                        )}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 rounded-2xl border border-petrol/10 p-4 transition-colors hover:border-teal/40 hover:bg-sand/40">
                        <p className="font-display font-bold text-petrol">{s.name[lang]}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{s.text[lang]}</p>
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
            </section>

            {/* Map */}
            <section id="carte" className="scroll-mt-36">
              <SectionTitle>{fr ? "Le parcours sur la carte" : "The route on the map"}</SectionTitle>
              <div className="mt-6 overflow-hidden rounded-3xl border-4 border-white shadow-lift ring-1 ring-petrol/10">
                <CircuitMap height={420} visible={[circuit.slug]} selectedSlug={circuit.slug} lang={lang} />
              </div>
            </section>

            {/* Compatible motos */}
            <section id="motos" className="scroll-mt-36">
              <SectionTitle>{fr ? "Motos disponibles pour ce circuit" : "Motorbikes available for this circuit"}</SectionTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                {fr
                  ? "Vous choisirez votre moto parmi celles-ci lors de la réservation, une par pilote."
                  : "You'll pick your motorbike from these when booking, one per rider."}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {bikes.map((m, i) => {
                  const supp = motoSupplement(m);
                  const range = motoRange(m, lang);
                  return (
                    <motion.div key={m.slug} {...fade(i)}>
                      <Link
                        to="/motos"
                        hash={m.slug}
                        className="group block overflow-hidden rounded-2xl border border-petrol/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                      >
                        <div className="h-36 overflow-hidden bg-sand">
                          <ImageSlot
                            slot={motoImage(m)}
                            alt={motoName(m, lang)}
                            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4">
                          <p className="font-display font-bold text-petrol">{motoName(m, lang)}</p>
                          <div className="mt-1 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{range ? `${fr ? "Autonomie" : "Range"} ${range}` : ""}</span>
                            <span className="font-semibold text-teal">
                              {supp > 0 ? `+ ${formatMAD(supp, lang)}` : fr ? "Incluse" : "Included"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Included */}
            <section id="inclus" className="scroll-mt-36">
              <SectionTitle>{fr ? "Ce qui est inclus" : "What's included"}</SectionTitle>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-teal/5 p-6 ring-1 ring-teal/15">
                  <h3 className="font-display font-bold text-petrol">{fr ? "Inclus" : "Included"}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {circuit.included[lang].map((x) => (
                      <li key={x} className="flex items-start gap-2.5 text-sm text-slate-ink">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal text-white">
                          <Check className="h-3 w-3" aria-hidden="true" />
                        </span>
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl bg-sand p-6 ring-1 ring-petrol/10">
                  <h3 className="font-display font-bold text-petrol">{fr ? "Non inclus" : "Not included"}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {circuit.excluded[lang].map((x) => (
                      <li key={x} className="flex items-start gap-2.5 text-sm text-slate-ink">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-petrol/15 text-petrol">
                          <X className="h-3 w-3" aria-hidden="true" />
                        </span>
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Extras */}
            <section id="options" className="scroll-mt-36">
              <SectionTitle>{fr ? "Activités complémentaires" : "Add-on activities"}</SectionTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                {fr ? "À ajouter à l'étape « Options » de la réservation." : "Add them at the \"Extras\" step when booking."}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {activities.map((a, i) => {
                  const Icon = ACTIVITY_ICONS[a.icon] ?? Compass;
                  return (
                    <motion.div
                      key={a.slug}
                      {...fade(i % 3)}
                      className="group flex h-full flex-col rounded-2xl border border-petrol/10 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-teal/30 hover:shadow-warm"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand text-teal transition-all duration-300 group-hover:-rotate-6 group-hover:bg-teal group-hover:text-white">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <p className="mt-4 font-semibold text-petrol">{a.title[lang]}</p>
                      <p className="mt-1 flex-1 text-xs text-muted-foreground">{a.short[lang]}</p>
                      <p className="mt-3 text-sm font-bold text-terracotta">
                        {a.price > 0 ? `+ ${formatMAD(a.price, lang)}` : fr ? "Offert" : "Free"}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Booking card */}
          <aside className="lg:sticky lg:top-36">
            <div className="overflow-hidden rounded-3xl border border-petrol/10 bg-white shadow-warm">
              <div className="bg-petrol p-6 text-white topo-texture">
                <p className="text-xs text-white/60">{fr ? "Prix d'exemple" : "Sample price"}</p>
                <p className="mt-1 font-display text-3xl font-extrabold">
                  {formatMAD(circuit.pricePerPerson, lang)}
                  <span className="text-base font-medium text-white/70">{fr ? " / pers." : " / person"}</span>
                </p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-petrol">{fr ? "Pilotes" : "Riders"}</p>
                  <Counter
                    value={riders}
                    min={1}
                    max={Math.min(8, circuit.maxParticipants)}
                    onChange={setRiders}
                    labelMinus={fr ? "Retirer un pilote" : "Remove a rider"}
                    labelPlus={fr ? "Ajouter un pilote" : "Add a rider"}
                  />
                </div>
                <div className="mt-5 flex items-end justify-between border-t border-dashed border-petrol/15 pt-4">
                  <p className="text-sm text-muted-foreground">{fr ? "Total estimé" : "Estimated total"}</p>
                  <motion.p
                    key={riders}
                    initial={reduced ? false : { y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="font-display text-2xl font-extrabold text-petrol tabular-nums"
                  >
                    {formatMAD(circuit.pricePerPerson * riders, lang)}
                  </motion.p>
                </div>
                <p className="mt-1 text-right text-[11px] text-muted-foreground">
                  {fr ? "Hors suppléments motos et options" : "Excluding motorbike supplements and extras"}
                </p>

                <TfLink
                  to="/reservation"
                  search={{ type: "circuit", id: circuit.slug, people: riders }}
                  variant="primary"
                  size="lg"
                  className="mt-5 w-full justify-center"
                  withArrow
                >
                  {fr ? "Réserver ce circuit" : "Book this circuit"}
                </TfLink>

                <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-teal" aria-hidden="true" />
                    {fr ? "Choix de la moto à l'étape suivante" : "Motorbike chosen at the next step"}
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-teal" aria-hidden="true" />
                    {fr ? "Paiement en ligne par carte" : "Online card payment"}
                  </li>
                </ul>

                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(btn.ghost, "mt-5 w-full")}
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  {fr ? "Une question ? WhatsApp" : "A question? WhatsApp"}
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Related */}
        <div className="container-tf mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle>{fr ? "Autres circuits" : "Other circuits"}</SectionTitle>
            <Link to="/circuits" className="text-sm font-semibold text-teal hover:underline">
              {fr ? "Tous les circuits" : "All circuits"}
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c, i) => (
              <motion.div key={c.slug} {...fade(i)}>
                <CircuitCard circuit={c} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-petrol">
      <span aria-hidden="true" className="h-6 w-1 rounded-full bg-terracotta" />
      {children}
    </h2>
  );
}

function DifficultyBolts({ level, light = false }: { level: number; light?: boolean }) {
  return (
    <span className="flex items-center" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <Zap
          key={n}
          className={cn(
            "h-3.5 w-3.5",
            n <= level ? "fill-aqua text-aqua" : light ? "text-white/30" : "text-petrol/20",
          )}
        />
      ))}
    </span>
  );
}