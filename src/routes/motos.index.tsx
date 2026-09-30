import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type MotionProps } from "framer-motion";
import {
  ArrowRight,
  BatteryCharging,
  Bike,
  Check,
  Compass,
  Gauge,
  MapPin,
  PlugZap,
  ShieldCheck,
  Users,
  Weight,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImageSlot } from "@/components/brand/ImageSlot";
import { AmazighBand } from "@/components/brand/Motifs";
import { FlowHeading, Reveal } from "@/components/brand/Reveal";
import { TfAnchor, TfLink } from "@/components/brand/Buttons";
import { btn } from "@/components/forms/ui";
import { motos, motoCategoryLabel } from "@/data/motos";
import { circuits } from "@/data/circuits";
import { whatsappLink } from "@/config/site";
import { compatibleMotos, formatMAD, motoSupplement, type Lang, type Moto } from "@/lib/catalog";
import { useT } from "@/i18n";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/motos/")({
  head: () =>
    seo({
      title: "La flotte de motos électriques — TiziFlow, circuits guidés à Midelt",
      description:
        "Découvrez les motos électriques TiziFlow : autonomie, vitesse, confort. Choisissez la vôtre au moment de réserver votre circuit guidé dans l'Atlas.",
      path: "/motos",
    }),
  component: FleetPage,
});

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function useFadeUp() {
  const reduced = useReducedMotion();
  return (i = 0): MotionProps =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.6, delay: i * 0.08, ease: EASE },
        };
}

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
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

const circuitsFor = (m: Moto) => circuits.filter((c) => compatibleMotos(c).some((x) => x.slug === m.slug));

function FleetPage() {
  const { t, lang } = useT();
  const fr = lang === "fr";
  const fade = useFadeUp();
  const active = useScrollSpy(motos.map((m) => m.slug));

  const steps = [
    { Icon: Compass, t: fr ? "Choisissez un circuit" : "Choose a circuit" },
    { Icon: Bike, t: fr ? "Choisissez votre moto" : "Choose your motorbike" },
    { Icon: MapPin, t: fr ? "Partez de Midelt" : "Set off from Midelt" },
  ];

  return (
    <>
      <PageHeader
        title={fr ? "La flotte" : "The electric"}
        flowWord={fr ? "électrique" : "fleet"}
        subtitle={
          fr
            ? "Des motos silencieuses, adaptées aux pistes de montagne. Vous choisissez la vôtre au moment de réserver votre circuit."
            : "Quiet motorbikes built for mountain tracks. You choose yours when you book your circuit."
        }
        crumbs={[{ label: t.nav.motos }]}
        image={{
          slot: motos[0].images[0],
          alt: fr ? "Moto électrique TiziFlow sur une piste de montagne" : "TiziFlow electric motorbike on a mountain track",
        }}
        fadeTo="sand"
      >
        {/* The business rule, stated up front */}
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          {steps.map(({ Icon, t: label }, i) => (
            <li key={label} className="flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-aqua text-[11px] font-bold text-petrol">
                  {i + 1}
                </span>
                <Icon className="h-4 w-4 text-aqua" aria-hidden="true" />
                {label}
              </span>
              {i < steps.length - 1 && <ArrowRight className="h-4 w-4 text-white/40" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </PageHeader>

      {/* Sticky quick nav */}
      <nav
        aria-label={fr ? "Motos de la flotte" : "Fleet motorbikes"}
        className="sticky top-16 z-20 border-b border-petrol/10 bg-sand/85 backdrop-blur-md"
      >
        <div className="container-tf flex gap-2 overflow-x-auto py-3">
          {motos.map((m) => {
            const on = active === m.slug;
            return (
              <a
                key={m.slug}
                href={`#${m.slug}`}
                aria-current={on ? "true" : undefined}
                className={cn(
                  "relative isolate flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
                  on ? "text-white" : "text-petrol hover:bg-white",
                )}
              >
                {on && (
                  <motion.span
                    layoutId="fleet-nav"
                    className="absolute inset-0 -z-10 rounded-full bg-petrol"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="h-8 w-8 overflow-hidden rounded-full bg-white">
                  <ImageSlot slot={m.images[0]} alt="" className="h-full w-full" />
                </span>
                {m.name}
              </a>
            );
          })}
          <a
            href="#comparer"
            className="flex shrink-0 items-center rounded-full border border-petrol/15 px-4 text-sm font-semibold text-petrol transition hover:bg-white"
          >
            {fr ? "Comparer" : "Compare"}
          </a>
        </div>
      </nav>

      {/* One section per motorbike */}
      <div className="bg-sand">
        {motos.map((m, i) => (
          <MotoSection key={m.slug} moto={m} index={i} lang={lang} />
        ))}
      </div>

      {/* Comparison */}
      <section id="comparer" className="scroll-mt-32 bg-white section-y">
        <div className="container-tf">
          <Reveal>
            <FlowHeading before={fr ? "Comparer les" : "Compare the"} word={fr ? "motos" : "motorbikes"} className="h-section text-petrol" />
            <p className="mt-3 max-w-xl text-muted-foreground">
              {fr ? "Les meilleures valeurs de chaque ligne sont mises en avant." : "The best value in each row is highlighted."}
            </p>
          </Reveal>
          <motion.div {...fade()} className="mt-10">
            <Comparison lang={lang} />
          </motion.div>
        </div>
      </section>

      {/* Good to know + CTA */}
      <section className="bg-sand pb-20 sm:pb-28">
        <div className="container-tf">
          <div className="flex items-start gap-3 rounded-2xl border border-petrol/10 bg-white p-5 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
            <p>
              {fr
                ? "Bon à savoir : conditions de conduite (permis, âge minimum), caution et assurance à confirmer par l'agence. Briefing et équipement fournis avant chaque départ."
                : "Good to know: riding requirements (licence, minimum age), deposit and insurance to be confirmed by the agency. Briefing and gear provided before every departure."}
            </p>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[linear-gradient(120deg,var(--terracotta),color-mix(in_oklab,var(--terracotta)_60%,var(--petrol)))] py-20 text-white">
        <AmazighBand className="absolute inset-x-0 top-0" height={10} />
        <div className="container-tf flex flex-col items-center gap-6 text-center">
          <h2 className="h-section max-w-2xl">{fr ? "Commencez par choisir votre circuit" : "Start by choosing your circuit"}</h2>
          <p className="max-w-lg text-white/80">
            {fr ? "La moto se choisit ensuite, parmi celles adaptées au parcours." : "The motorbike comes next, among those suited to the route."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <TfLink to="/circuits" variant="white" size="lg" withArrow>
              {fr ? "Voir les circuits" : "See the circuits"}
            </TfLink>
            <TfAnchor href={whatsappLink()} target="_blank" rel="noopener noreferrer" variant="outlineLight" size="lg">
              {t.home.ctaWhatsapp}
            </TfAnchor>
          </div>
        </div>
        <AmazighBand className="absolute inset-x-0 bottom-0" height={10} />
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */

function MotoSection({ moto, index, lang }: { moto: Moto; index: number; lang: Lang }) {
  const fr = lang === "fr";
  const reduced = useReducedMotion();
  const [img, setImg] = useState(0);
  const flip = index % 2 === 1;
  const available = circuitsFor(moto);
  const supp = motoSupplement(moto);

  const specs = [
    { Icon: BatteryCharging, label: fr ? "Autonomie" : "Range", value: `${moto.specs.autonomyKm} km` },
    { Icon: Gauge, label: fr ? "Vitesse max" : "Top speed", value: `${moto.specs.topSpeedKmh} km/h` },
    { Icon: PlugZap, label: fr ? "Recharge" : "Charging", value: `${moto.specs.chargeHours} h` },
    { Icon: Zap, label: fr ? "Puissance" : "Power", value: `${moto.specs.powerKw} kW` },
    { Icon: Users, label: fr ? "Places" : "Seats", value: String(moto.specs.seats) },
    { Icon: Weight, label: fr ? "Poids" : "Weight", value: `${moto.specs.weightKg} kg` },
  ];

  const enter = (x: number): MotionProps =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, x },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.7, ease: EASE },
        };

  return (
    <section
      id={moto.slug}
      aria-labelledby={`${moto.slug}-title`}
      className={cn("scroll-mt-32 py-16 sm:py-20", index % 2 === 1 && "bg-white")}
    >
      <div className="container-tf grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <motion.div {...enter(flip ? 40 : -40)} className={cn("lg:sticky lg:top-36", flip && "lg:order-2")}>
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-lift">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={img}
                initial={reduced ? false : { opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <ImageSlot slot={moto.images[img] ?? moto.images[0]} alt={moto.name} className="aspect-[4/3] w-full" />
              </motion.div>
            </AnimatePresence>
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-petrol backdrop-blur">
              {motoCategoryLabel[moto.category][lang]}
            </span>
          </div>
          {moto.images.length > 1 && (
            <div className="mt-3 grid grid-cols-3 gap-3" role="group" aria-label={fr ? "Photos" : "Photos"}>
              {moto.images.slice(0, 3).map((s, i) => (
                <button
                  key={`${s}-${i}`}
                  type="button"
                  onClick={() => setImg(i)}
                  aria-label={fr ? `Photo ${i + 1}` : `Photo ${i + 1}`}
                  aria-pressed={img === i}
                  className={cn(
                    "overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-sand transition-all focus-visible:outline-none focus-visible:ring-teal",
                    img === i ? "ring-teal" : "ring-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <ImageSlot slot={s} alt="" className="aspect-[4/3] w-full" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div {...enter(flip ? -40 : 40)}>
          <p className="text-sm font-semibold text-teal">
            {motoCategoryLabel[moto.category][lang]} · {supp > 0 ? `+ ${formatMAD(supp, lang)} / ${fr ? "pilote" : "rider"}` : fr ? "Incluse dans le circuit" : "Included in the circuit"}
          </p>
          <h2 id={`${moto.slug}-title`} className="mt-1 h-section text-petrol">
            {moto.name}
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-slate-ink">{moto.description[lang]}</p>

          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {specs.map(({ Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-petrol/10 bg-white p-4">
                <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                <dt className="mt-2 text-xs text-muted-foreground">{label}</dt>
                <dd className="font-display text-lg font-bold text-petrol">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="font-display font-bold text-petrol">{fr ? "Points forts" : "Highlights"}</h3>
              <ul className="mt-3 space-y-2">
                {moto.features[lang].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold text-petrol">{fr ? "Équipement fourni" : "Gear provided"}</h3>
              <ul className="mt-3 space-y-2">
                {moto.included[lang].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Where you can ride it */}
          <div className="mt-8 rounded-3xl bg-petrol p-6 text-white topo-texture">
            <p className="font-display font-bold">
              {fr ? `Disponible sur ${available.length} circuit(s)` : `Available on ${available.length} circuit(s)`}
            </p>
            {available.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {available.map((c) => (
                  <li key={c.slug}>
                    <Link
                      to="/circuits/$slug"
                      params={{ slug: c.slug }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium transition hover:bg-aqua hover:text-petrol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua"
                    >
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {c.title[lang]}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-white/70">{fr ? "Circuits à confirmer par l'agence." : "Circuits to be confirmed by the agency."}</p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/reservation"
                search={{ type: "circuit", moto: moto.slug }}
                className={cn(btn.primary, "h-11")}
              >
                {fr ? "Réserver un circuit avec cette moto" : "Book a circuit with this motorbike"}
              </Link>
              <Link
                to="/circuits"
                search={{ moto: moto.slug }}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-5 text-sm font-semibold transition hover:bg-white hover:text-petrol"
              >
                {fr ? "Voir ces circuits" : "See these circuits"}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Comparison({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  type Row = { label: string; get: (m: Moto) => number; unit: string; best: "max" | "min" };
  const rows: Row[] = [
    { label: fr ? "Autonomie" : "Range", get: (m) => m.specs.autonomyKm, unit: "km", best: "max" },
    { label: fr ? "Vitesse max" : "Top speed", get: (m) => m.specs.topSpeedKmh, unit: "km/h", best: "max" },
    { label: fr ? "Recharge" : "Charging", get: (m) => m.specs.chargeHours, unit: "h", best: "min" },
    { label: fr ? "Puissance" : "Power", get: (m) => m.specs.powerKw, unit: "kW", best: "max" },
    { label: fr ? "Places" : "Seats", get: (m) => Number(m.specs.seats), unit: "", best: "max" },
    { label: fr ? "Poids" : "Weight", get: (m) => m.specs.weightKg, unit: "kg", best: "min" },
  ];

  return (
    <div className="overflow-x-auto rounded-3xl border border-petrol/10">
      <table className="w-full min-w-[640px] text-sm">
        <caption className="sr-only">{fr ? "Comparatif des motos" : "Motorbike comparison"}</caption>
        <thead>
          <tr className="bg-petrol text-white">
            <th scope="col" className="sticky left-0 z-10 bg-petrol px-4 py-4 text-left font-semibold">
              {fr ? "Caractéristique" : "Spec"}
            </th>
            {motos.map((m) => (
              <th key={m.slug} scope="col" className="px-4 py-4 text-left font-display font-bold">
                <a href={`#${m.slug}`} className="hover:text-aqua">
                  {m.name}
                </a>
                <span className="block text-xs font-normal text-white/60">{motoCategoryLabel[m.category][lang]}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const values = motos.map(r.get);
            const target = r.best === "max" ? Math.max(...values) : Math.min(...values);
            return (
              <tr key={r.label} className={i % 2 ? "bg-sand/60" : "bg-white"}>
                <th scope="row" className={cn("sticky left-0 z-10 px-4 py-3 text-left font-medium text-muted-foreground", i % 2 ? "bg-[color-mix(in_oklab,var(--sand)_60%,white)]" : "bg-white")}>
                  {r.label}
                </th>
                {motos.map((m) => {
                  const v = r.get(m);
                  const top = v === target;
                  return (
                    <td key={m.slug} className="px-4 py-3">
                      <span className={cn("font-semibold tabular-nums", top ? "rounded-full bg-teal/10 px-2.5 py-1 text-teal" : "text-petrol")}>
                        {v} {r.unit}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
          <tr className="border-t border-petrol/10 bg-white">
            <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-3 text-left font-medium text-muted-foreground">
              {fr ? "Circuits" : "Circuits"}
            </th>
            {motos.map((m) => (
              <td key={m.slug} className="px-4 py-3 font-semibold text-petrol">
                {circuitsFor(m).length}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}