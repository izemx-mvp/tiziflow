import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BatteryCharging,
  Compass,
  CalendarCheck,
  ShieldCheck,
  ArrowRight,
  Camera,
  Car,
  Sunset,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { seo } from "@/lib/seo";
import { ImageSlot } from "@/components/brand/ImageSlot";
import { AmazighBand, MountainLayers, RoadLine } from "@/components/brand/Motifs";
import { CountUp, FlowHeading, Reveal, Stagger, StaggerItem } from "@/components/brand/Reveal";
import { TfAnchor, TfLink } from "@/components/brand/Buttons";
import { MotoCard } from "@/components/cards/MotoCard";
import { CircuitCard } from "@/components/cards/CircuitCard";
import { CircuitMap } from "@/components/map/CircuitMap";
import { motos } from "@/data/motos";
import { circuits } from "@/data/circuits";
import { activities } from "@/data/activities";
import { site, whatsappLink } from "@/config/site";
import { useT } from "@/i18n";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "TiziFlow — Motos électriques & excursions guidées à Midelt, Atlas",
      description:
        "Louez une moto électrique et partez en excursion guidée dans l'Atlas, au départ de Midelt. Circuits, activités et réservation en ligne.",
      path: "/",
    }),
  component: Home,
});

function Home() {
  const { t, lang } = useT();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            name: site.name,
            address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: "MA" },
            email: site.email,
            telephone: site.phone,
            areaServed: "Midelt, Maroc",
          }),
        }}
      />
      <Hero />
      <Why />
      <FeaturedMotos />
      <PopularCircuits />
      <ActivitiesGrid />
      <HowToBook />
      <MapPreview />
      <Figures />
      <Reviews />
      <FaqShort />
      <CtaBand />
      {/* i18n context consumed by children */}
      <span className="sr-only">{t.home.badge}</span>
      <span className="sr-only">{lang}</span>
    </>
  );
}

function Hero() {
  const { t } = useT();
  const reduced = useReducedMotion();
  const [type, setType] = useState<"moto" | "circuit">("circuit");
  const [date, setDate] = useState("");
  const [people, setPeople] = useState(2);

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-petrol">
      <ImageSlot
        slot="hero-main"
        alt="Moto électrique sur une piste de montagne de l'Atlas au coucher du soleil"
        className="absolute inset-0 hidden h-full w-full sm:block"
        priority
      />
      <ImageSlot
        slot="hero-mobile"
        alt="Moto électrique sur une piste de montagne de l'Atlas"
        className="absolute inset-0 h-full w-full sm:hidden"
        priority
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--petrol)_75%,transparent)_0%,color-mix(in_oklab,var(--petrol)_45%,transparent)_45%,color-mix(in_oklab,var(--petrol)_92%,transparent)_100%)]" />
      <MountainLayers />

      <div className="container-tf relative z-10 pb-40 pt-32 text-white">
        <motion.span
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-aqua" />
          </span>
          {t.home.badge}
        </motion.span>

        <h1 className="mt-6 h-hero max-w-4xl overflow-hidden">
          <motion.span
            initial={reduced ? false : { y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            {t.home.h1a} <span className="flow-word">{t.home.h1flow}</span> {t.home.h1b}
          </motion.span>
        </h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-5 max-w-xl text-base text-white/80 sm:text-lg"
        >
          {t.home.sub}
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <TfLink to="/reservation" variant="primary" size="lg" withArrow>
            {t.home.ctaBook}
          </TfLink>
          <TfLink to="/circuits" variant="outlineLight" size="lg">
            {t.home.ctaCircuits}
          </TfLink>
        </motion.div>
      </div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute inset-x-0 bottom-6 z-20"
      >
        <div className="container-tf">
          <div className="glass-light grid gap-3 rounded-2xl p-4 shadow-lift md:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="flex flex-col gap-1 text-xs font-semibold text-petrol">
              {t.home.quickType}
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "moto" | "circuit")}
                className="h-11 rounded-full border border-petrol/15 bg-white px-4 text-sm font-medium"
              >
                <option value="circuit">{t.booking.typeCircuit}</option>
                <option value="moto">{t.booking.typeMoto}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-petrol">
              {t.home.quickDate}
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 rounded-full border border-petrol/15 bg-white px-4 text-sm font-medium"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-petrol">
              {t.home.quickPeople}
              <input
                type="number"
                min={1}
                max={8}
                value={people}
                onChange={(e) => setPeople(Number(e.target.value))}
                className="h-11 rounded-full border border-petrol/15 bg-white px-4 text-sm font-medium"
              />
            </label>
            <TfLink
              to="/reservation"
              search={{ type, date: date || undefined, people }}
              variant="primary"
              size="lg"
              className="self-end"
              withArrow
            >
              {t.home.quickCheck}
            </TfLink>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Why() {
  const { t } = useT();
  const icons = [BatteryCharging, Compass, CalendarCheck, ShieldCheck];

  return (
    <section className="relative bg-sand section-y">
      <RoadLine className="absolute left-1/2 top-0 hidden h-[200%] w-24 -translate-x-1/2 lg:block" />
      <div className="container-tf relative">
        <Reveal>
          <FlowHeading before={t.home.whyTitle} word={t.home.whyFlow} className="h-section text-petrol" />
        </Reveal>
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.why.map((f, i) => {
            const Icon = icons[i];
            return (
              <StaggerItem key={f.t}>
                <div className="group h-full overflow-hidden rounded-2xl border border-petrol/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-warm">
                  <span className="absolute inset-x-0 top-0 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100">
                    <AmazighBand height={5} />
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand text-terracotta">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-petrol">{f.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

function FeaturedMotos() {
  const { t } = useT();
  return (
    <section className="bg-white section-y">
      <div className="container-tf">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Reveal>
            <FlowHeading
              before={t.home.motosTitle}
              word={t.home.motosFlow}
              className="h-section text-petrol"
            />
          </Reveal>
          <Link
            to="/motos"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-terracotta"
          >
            {t.home.motosAll}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <Stagger className="mt-10 grid gap-6 md:grid-cols-3">
          {motos.slice(0, 3).map((m) => (
            <StaggerItem key={m.slug}>
              <MotoCard moto={m} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function PopularCircuits() {
  const { t } = useT();
  return (
    <section className="relative overflow-hidden bg-petrol topo-texture section-y text-white">
      <div className="container-tf">
        <Reveal>
          <FlowHeading
            before={t.home.circuitsTitle}
            word={t.home.circuitsFlow}
            className="h-section"
          />
        </Reveal>
      </div>
      <div className="container-tf mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
        {circuits.map((c) => (
          <div key={c.slug} className="w-[300px] shrink-0 snap-start sm:w-[340px]">
            <CircuitCard circuit={c} dark />
          </div>
        ))}
      </div>
    </section>
  );
}

function ActivitiesGrid() {
  const { t, lang } = useT();
  const icons: Record<string, typeof Compass> = {
    Compass,
    UtensilsCrossed,
    Sunset,
    Camera,
    ShieldCheck,
    Car,
  };

  return (
    <section className="bg-sand section-y">
      <div className="container-tf">
        <Reveal>
          <FlowHeading
            before={t.home.activitiesTitle}
            word={t.home.activitiesFlow}
            className="h-section text-petrol"
          />
        </Reveal>
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.slice(0, 6).map((a) => {
            const Icon = icons[a.icon] ?? Compass;
            return (
              <StaggerItem key={a.slug}>
                <Link
                  to="/activites"
                  hash={a.slug}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-petrol/10 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-warm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sand text-teal">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-display font-bold text-petrol">{a.title[lang]}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{a.short[lang]}</span>
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

function HowToBook() {
  const { t } = useT();
  return (
    <section className="relative bg-white section-y">
      <div className="container-tf">
        <Reveal>
          <FlowHeading before={t.home.howTitle} word={t.home.howFlow} className="h-section text-petrol" />
        </Reveal>
        <Stagger className="mt-12 grid gap-8 md:grid-cols-4">
          {t.home.steps.map((s, i) => (
            <StaggerItem key={s.t}>
              <div className="relative">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta font-display text-lg font-bold text-white">
                  {i + 1}
                </span>
                {i < 3 && (
                  <svg
                    className="absolute left-14 top-6 hidden h-4 w-[calc(100%-3rem)] md:block"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M0 5 C 25 0, 50 10, 100 4"
                      stroke="var(--aqua)"
                      strokeWidth="2"
                      strokeDasharray="6 6"
                      fill="none"
                    />
                  </svg>
                )}
                <h3 className="mt-4 font-display text-lg font-bold text-petrol">{s.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function MapPreview() {
  const { t, lang } = useT();
  return (
    <section className="bg-sand section-y">
      <div className="container-tf grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <FlowHeading before={t.home.mapTitle} word={t.home.mapFlow} className="h-section text-petrol" />
          <p className="mt-4 max-w-md text-muted-foreground">
            {lang === "fr"
              ? "Visualisez les itinéraires proposés autour de Midelt, leurs arrêts et leurs points de départ."
              : "See the proposed itineraries around Midelt, their stops and start points."}
          </p>
          <TfLink to="/carte" variant="petrol" size="lg" className="mt-6" withArrow>
            {t.home.mapCta}
          </TfLink>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-2xl border border-petrol/10 shadow-warm">
            <CircuitMap height={380} interactive={false} lang={lang} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Figures() {
  const { t, lang } = useT();
  return (
    <section className="bg-petrol topo-texture section-y text-white">
      <div className="container-tf">
        <Reveal>
          <FlowHeading before={t.home.figuresTitle} word={t.home.figuresFlow} className="h-section" />
        </Reveal>
        <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {site.figures.map((f) => (
            <StaggerItem key={f.labelFr}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                <p className="font-display text-4xl font-extrabold text-aqua">
                  <CountUp value={f.valueFr} suffix={f.suffix} />
                </p>
                <p className="mt-2 text-sm text-white/70">{lang === "fr" ? f.labelFr : f.labelEn}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Reviews() {
  const { t, lang } = useT();
  const items = [
    { name: "Sofia", flag: "🇪🇸", fr: "Sortie très bien organisée, paysages superbes.", en: "Very well organised ride, superb landscapes." },
    { name: "Yassine", flag: "🇲🇦", fr: "Moto silencieuse, on entend la montagne.", en: "Silent bike, you can hear the mountain." },
    { name: "Lena", flag: "🇩🇪", fr: "Parfait pour une première expérience.", en: "Perfect for a first experience." },
  ];

  return (
    <section className="bg-white section-y">
      <div className="container-tf">
        <Reveal>
          <FlowHeading before={t.home.reviewsTitle} word={t.home.reviewsFlow} className="h-section text-petrol" />
          <p className="mt-2 text-xs uppercase tracking-wide text-terracotta">{t.home.reviewsNote}</p>
        </Reveal>
        <Stagger className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((r) => (
            <StaggerItem key={r.name}>
              <figure className="h-full rounded-2xl border border-petrol/10 bg-sand p-6">
                <blockquote className="text-sm text-slate-ink">
                  « {lang === "fr" ? r.fr : r.en} »
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-2 text-sm font-semibold text-petrol">
                  <Users className="h-4 w-4 text-teal" /> {r.name} {r.flag}
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function FaqShort() {
  const { t } = useT();
  return (
    <section className="bg-sand section-y">
      <div className="container-tf max-w-3xl">
        <Reveal>
          <FlowHeading before={t.home.faqTitle} word={t.home.faqFlow} className="h-section text-petrol" />
        </Reveal>
        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="mt-8">
            {t.faq.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-petrol/10">
                <AccordionTrigger className="text-left font-display font-semibold text-petrol">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

function CtaBand() {
  const { t } = useT();
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(120deg,var(--terracotta),color-mix(in_oklab,var(--terracotta)_60%,var(--petrol)))] py-16 text-white">
      <AmazighBand className="absolute inset-x-0 top-0" height={10} />
      <div className="container-tf relative flex flex-col items-center gap-6 text-center">
        <h2 className="h-section max-w-2xl">{t.home.ctaTitle}</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <TfLink to="/reservation" variant="white" size="lg" withArrow>
            {t.home.ctaBook}
          </TfLink>
          <TfAnchor
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlineLight"
            size="lg"
          >
            {t.home.ctaWhatsapp}
          </TfAnchor>
        </div>
      </div>
      <AmazighBand className="absolute inset-x-0 bottom-0" height={10} />
    </section>
  );
}
