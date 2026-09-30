import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionProps,
  type MotionValue,
} from "framer-motion";
import {
  ArrowRight,
  BatteryCharging,
  CalendarCheck,
  Camera,
  Car,
  ChevronLeft,
  ChevronRight,
  Compass,
  Flag,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Quote,
  Route as RouteIcon,
  ShieldCheck,
  Sunset,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { seo } from "@/lib/seo";
import { ImageSlot } from "@/components/brand/ImageSlot";
import { AmazighBand, MountainLayers } from "@/components/brand/Motifs";
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
      title: "TiziFlow — Excursions guidées en moto électrique à Midelt, Atlas",
      description:
        "Partez en excursion guidée en moto électrique dans l'Atlas, au départ de Midelt. Choisissez votre circuit, votre moto et vos activités, puis réservez en ligne.",
      path: "/",
    }),
  component: Home,
});

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Fade-up on scroll for grid items that need their own className (grid spans etc.). */
function useFadeUp() {
  const reduced = useReducedMotion();
  return (i = 0): MotionProps =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.6, delay: i * 0.09, ease: EASE },
        };
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function Home() {
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
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  const { t, lang } = useT();
  const reduced = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 639px)");
  const ref = useRef<HTMLElement>(null);

  // Scroll parallax
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "16%"]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 110]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, reduced ? 1 : 0.2]);

  // Pointer parallax (desktop only, subtle)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 18 });
  const sy = useSpring(my, { stiffness: 50, damping: 18 });
  const mountX = useTransform(sx, (v) => v * -24);
  const mountY = useTransform(sy, (v) => v * -12);
  const cardX = useTransform(sx, (v) => v * 14);
  const cardY = useTransform(sy, (v) => v * 10);

  const onMove = (e: ReactMouseEvent<HTMLElement>) => {
    if (reduced || isMobile) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const words = [
    ...t.home.h1a
      .split(" ")
      .filter(Boolean)
      .map((w) => ({ w, flow: false })),
    { w: t.home.h1flow, flow: true },
    ...t.home.h1b
      .split(" ")
      .filter(Boolean)
      .map((w) => ({ w, flow: false })),
  ];

  const chips = [
    { Icon: Zap, fr: "100 % électrique", en: "100% electric" },
    { Icon: Compass, fr: "Circuits guidés", en: "Guided circuits" },
    { Icon: MapPin, fr: "Départ de Midelt", en: "Starting from Midelt" },
  ];

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-petrol text-white lg:min-h-[max(100svh,800px)]"
    >
      {/* Background image: only one is mounted, so only one is downloaded */}
      <motion.div style={{ y: bgY }} className="absolute inset-x-0 -top-[4%] -z-10 h-[112%]">
        <ImageSlot
          key={isMobile ? "mobile" : "desktop"}
          slot={isMobile ? "hero-mobile" : "hero-main"}
          alt="Moto électrique sur une piste de montagne de l'Atlas au coucher du soleil"
          className="h-full w-full"
          priority
        />
      </motion.div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--petrol)_78%,transparent)_0%,color-mix(in_oklab,var(--petrol)_40%,transparent)_45%,color-mix(in_oklab,var(--petrol)_94%,transparent)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_18%_45%,color-mix(in_oklab,var(--terracotta)_30%,transparent),transparent_70%)]"
      />
      <motion.div
        aria-hidden="true"
        style={{ x: mountX, y: mountY }}
        className="pointer-events-none absolute inset-x-[-3%] bottom-0 -z-10 h-full"
      >
        <MountainLayers />
      </motion.div>

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="container-tf relative z-10 grid flex-1 items-center gap-12 pb-10 pt-28 sm:pt-32 lg:grid-cols-[1.35fr_1fr] lg:pb-48"
      >
        <div>
          <motion.span
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-aqua" />
            </span>
            {t.home.badge}
          </motion.span>

          {/* Word-by-word masked reveal; padding keeps the italic "flow" word from being clipped */}
          <h1 className="mt-6 h-hero max-w-4xl">
            {words.map((x, i) => (
              <span key={`${i}-${x.w}`}>
                <span className="inline-block overflow-hidden pb-[0.12em] pr-[0.08em] align-bottom">
                  <motion.span
                    initial={reduced ? false : { y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.75, ease: EASE }}
                    className={`inline-block ${x.flow ? "flow-word" : ""}`}
                  >
                    {x.w}
                  </motion.span>
                </span>
                {i < words.length - 1 ? " " : null}
              </span>
            ))}
          </h1>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6, ease: EASE }}
            className="mt-5 max-w-xl text-base text-white/80 sm:text-lg"
          >
            {t.home.sub}
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6, ease: EASE }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <TfLink to="/reservation" variant="primary" size="lg" withArrow>
              {t.home.ctaBook}
            </TfLink>
            <TfLink to="/circuits" variant="outlineLight" size="lg">
              {t.home.ctaCircuits}
            </TfLink>
          </motion.div>

          <motion.ul
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75"
          >
            {chips.map(({ Icon, fr, en }) => (
              <li key={fr} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-aqua" aria-hidden="true" />
                {lang === "fr" ? fr : en}
              </li>
            ))}
          </motion.ul>
        </div>

        <HeroRouteCard x={cardX} y={cardY} />
      </motion.div>

      {/* In the flow on mobile/tablet, pinned to the bottom on desktop */}
      <div className="relative z-20 pb-8 lg:absolute lg:inset-x-0 lg:bottom-8 lg:pb-0">
        <div className="container-tf">
          <QuickBook />
        </div>
      </div>
    </section>
  );
}

const HERO_ROUTE = "M20 118 C 70 120, 58 68, 110 74 S 172 122, 202 80 S 250 30, 280 30";

function HeroRouteCard({ x, y }: { x: MotionValue<number>; y: MotionValue<number> }) {
  const { t, lang } = useT();
  const reduced = useReducedMotion();

  return (
    <motion.div style={{ x, y }} className="hidden lg:block">
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.95, duration: 0.7, ease: EASE }}
        className="relative ml-auto max-w-sm"
      >
        <motion.div
          animate={reduced ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 shadow-lift backdrop-blur-xl"
        >
          <div className="flex items-center justify-between text-sm font-semibold text-white/80">
            <span className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-aqua" aria-hidden="true" />
              {lang === "fr" ? "Départ Midelt" : "Start: Midelt"}
            </span>
            <span className="rounded-full bg-aqua/15 px-2.5 py-1 text-xs text-aqua">Atlas</span>
          </div>

          <svg viewBox="0 0 300 150" className="mt-5 w-full" aria-hidden="true">
            <path
              d="M0 150 L40 96 L70 118 L118 52 L150 92 L196 34 L236 82 L270 50 L300 72 L300 150 Z"
              fill="rgba(255,255,255,0.05)"
            />
            <path
              d={HERO_ROUTE}
              stroke="rgba(255,255,255,0.14)"
              strokeWidth={12}
              strokeLinecap="round"
              fill="none"
            />
            <motion.path
              d={HERO_ROUTE}
              stroke="var(--aqua)"
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: reduced ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.3, duration: 1.8, ease: "easeInOut" }}
            />
            <circle cx="20" cy="118" r="6" fill="var(--terracotta)" />
            <motion.circle
              cx="280"
              cy="30"
              r="6"
              fill="var(--aqua)"
              initial={{ scale: reduced ? 1 : 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 3, type: "spring", stiffness: 300, damping: 14 }}
            />
          </svg>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="font-display text-3xl font-extrabold text-white">{motos.length}</p>
              <p className="mt-1 text-xs text-white/70">
                {lang === "fr" ? "motos électriques" : "electric motorbikes"}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="font-display text-3xl font-extrabold text-white">{circuits.length}</p>
              <p className="mt-1 text-xs text-white/70">
                {lang === "fr" ? "circuits autour de Midelt" : "circuits around Midelt"}
              </p>
            </div>
          </div>

          <TfLink
            to="/carte"
            variant="white"
            size="lg"
            className="mt-5 w-full justify-center"
            withArrow
          >
            {t.home.mapCta}
          </TfLink>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4, duration: 0.5, ease: EASE }}
          className="absolute -bottom-5 -left-8 flex items-center gap-2 rounded-2xl bg-terracotta px-4 py-3 text-sm font-semibold text-white shadow-lift"
        >
          <Zap className="h-4 w-4" aria-hidden="true" />
          {lang === "fr" ? "Balade silencieuse" : "Silent ride"}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function QuickBook() {
  const { t, lang } = useT();
  const reduced = useReducedMotion();
  const [circuit, setCircuit] = useState(circuits[0]?.slug ?? "");
  const [date, setDate] = useState("");
  const [people, setPeople] = useState(2);
  const [today, setToday] = useState<string>();
  const dateRef = useRef<HTMLInputElement>(null);

  // Computed on the client to avoid an SSR/timezone mismatch
  useEffect(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setToday(d.toISOString().slice(0, 10));
  }, []);

  const clamp = (n: number) => Math.min(8, Math.max(1, n));
  const openPicker = () => {
    try {
      dateRef.current?.showPicker?.();
    } catch {
      /* showPicker not supported: native behavior applies */
    }
  };

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6, ease: EASE }}
      className="glass-light grid gap-4 rounded-3xl p-4 text-petrol shadow-lift sm:p-5 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_0.8fr_auto] lg:items-end"
    >
      <label className="flex flex-col gap-1.5 text-xs font-semibold">
        {lang === "fr" ? "Circuit" : "Circuit"}
        <span className="relative">
          <RouteIcon
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-teal"
            aria-hidden="true"
          />
          <select
            value={circuit}
            onChange={(e) => setCircuit(e.target.value)}
            className="h-12 w-full appearance-none rounded-full border border-petrol/15 bg-white pl-11 pr-10 text-sm font-medium outline-none transition focus-visible:border-teal focus-visible:ring-2 focus-visible:ring-teal/30"
          >
            {circuits.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title[lang]}
              </option>
            ))}
          </select>
          <ChevronRight
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-petrol/50"
            aria-hidden="true"
          />
        </span>
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-semibold">
        {t.home.quickDate}
        <input
          ref={dateRef}
          type="date"
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onClick={openPicker}
          className="h-12 rounded-full border border-petrol/15 bg-white px-4 text-sm font-medium outline-none transition focus-visible:border-teal focus-visible:ring-2 focus-visible:ring-teal/30"
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span id="qb-people" className="text-xs font-semibold">
          {t.home.quickPeople}
        </span>
        <div
          role="group"
          aria-labelledby="qb-people"
          className="flex h-12 items-center justify-between rounded-full border border-petrol/15 bg-white px-1.5"
        >
          <button
            type="button"
            aria-label={lang === "fr" ? "Retirer une personne" : "Remove one person"}
            onClick={() => setPeople((p) => clamp(p - 1))}
            disabled={people <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span
            className="min-w-[2ch] text-center text-sm font-bold tabular-nums"
            aria-live="polite"
          >
            {people}
          </span>
          <button
            type="button"
            aria-label={lang === "fr" ? "Ajouter une personne" : "Add one person"}
            onClick={() => setPeople((p) => clamp(p + 1))}
            disabled={people >= 8}
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <TfLink
        to="/reservation"
        search={{ type: "circuit", id: circuit, date: date || undefined, people }}
        variant="primary"
        size="lg"
        className="h-12 w-full justify-center md:col-span-2 lg:col-span-1 lg:w-auto"
        withArrow
      >
        {t.home.quickCheck}
      </TfLink>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Why TiziFlow — bento layout                                         */
/* ------------------------------------------------------------------ */

const ROAD = "M60 0 C 115 110, 5 210, 60 330 S 115 540, 60 660 S 20 760, 60 820";

/** Winding road that draws itself as the section scrolls through the viewport. */
function ScrollRoad({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 30%"] });
  const draw = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.001 });

  return (
    <div ref={ref} aria-hidden="true" className={className}>
      <svg viewBox="0 0 120 820" preserveAspectRatio="none" fill="none" className="h-full w-full">
        <path
          d={ROAD}
          stroke="var(--petrol)"
          strokeOpacity={0.06}
          strokeWidth={30}
          strokeLinecap="round"
        />
        <motion.path
          d={ROAD}
          stroke="var(--petrol)"
          strokeWidth={20}
          strokeLinecap="round"
          style={{ pathLength: reduced ? 1 : draw }}
        />
        <motion.path
          d={ROAD}
          stroke="var(--aqua)"
          strokeWidth={2}
          strokeLinecap="round"
          style={{ pathLength: reduced ? 1 : draw }}
        />
      </svg>
    </div>
  );
}

function Why() {
  const { t, lang } = useT();
  const fade = useFadeUp();
  const icons = [BatteryCharging, Compass, CalendarCheck, ShieldCheck];
  const [first, ...rest] = t.home.why;

  return (
    <section className="relative overflow-hidden bg-sand section-y">
      <ScrollRoad className="pointer-events-none absolute -right-4 top-0 hidden h-full w-28 xl:block" />
      <div className="container-tf relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <FlowHeading
              before={t.home.whyTitle}
              word={t.home.whyFlow}
              className="h-section text-petrol"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-muted-foreground">
              {lang === "fr"
                ? "Une façon simple et encadrée de découvrir l'Atlas, sans bruit de moteur."
                : "A simple, guided way to discover the Atlas, without engine noise."}
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* Feature card with image */}
          <motion.div {...fade(0)} className="md:col-span-2 lg:row-span-2">
            <article className="group relative isolate flex h-full min-h-[340px] flex-col justify-end overflow-hidden rounded-3xl bg-petrol p-7 text-white sm:p-8">
              <ImageSlot
                slot="about-eco"
                alt="Moto électrique à l'arrêt face aux montagnes de l'Atlas"
                className="absolute inset-0 -z-10 h-full w-full transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[var(--petrol)] via-[color-mix(in_oklab,var(--petrol)_55%,transparent)] to-transparent" />
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-aqua text-petrol">
                <BatteryCharging className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold sm:text-3xl">{first.t}</h3>
              <p className="mt-2 max-w-md text-white/75">{first.d}</p>
            </article>
          </motion.div>

          {rest.map((f, i) => {
            const Icon = icons[i + 1];
            const wide = i === rest.length - 1;
            return (
              <motion.div key={f.t} {...fade(i + 1)} className={wide ? "md:col-span-2" : ""}>
                <article
                  className={`group relative h-full overflow-hidden rounded-3xl border border-petrol/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-warm ${
                    wide ? "sm:flex sm:items-center sm:gap-6" : ""
                  }`}
                >
                  <span className="absolute inset-x-0 top-0 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100">
                    <AmazighBand height={5} />
                  </span>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sand text-terracotta transition-all duration-300 group-hover:-rotate-6 group-hover:bg-terracotta group-hover:text-white">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3
                      className={`font-display text-lg font-bold text-petrol ${wide ? "mt-4 sm:mt-0" : "mt-4"}`}
                    >
                      {f.t}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
                  </div>
                </article>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Featured motorbikes                                                 */
/* ------------------------------------------------------------------ */

function FeaturedMotos() {
  const { t, lang } = useT();
  return (
    <section className="relative overflow-hidden bg-white section-y">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 select-none whitespace-nowrap font-display text-[20vw] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(18,48,58,0.06)] lg:text-[220px]"
      >
        E-RIDE
      </span>
      <div className="container-tf relative">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Reveal>
            <FlowHeading
              before={t.home.motosTitle}
              word={t.home.motosFlow}
              className="h-section text-petrol"
            />
            <p className="mt-3 max-w-md text-muted-foreground">
              {lang === "fr"
                ? "Choisissez votre moto électrique au moment de réserver votre circuit, selon votre niveau et le parcours."
                : "Pick your electric motorbike when you book your circuit, based on your level and the route."}
            </p>
          </Reveal>
          <Link
            to="/motos"
            className="group inline-flex items-center gap-2 rounded-full border border-petrol/15 px-5 py-2.5 text-sm font-semibold text-petrol transition-colors hover:border-petrol hover:bg-petrol hover:text-white"
          >
            {t.home.motosAll}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
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

/* ------------------------------------------------------------------ */
/* Popular circuits — carousel with arrows + progress                  */
/* ------------------------------------------------------------------ */

function PopularCircuits() {
  const { t, lang } = useT();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ progress: 0, start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setState({
      progress: max > 0 ? el.scrollLeft / max : 1,
      start: el.scrollLeft < 8,
      end: el.scrollLeft > max - 8,
    });
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    el.scrollBy({
      left: dir * ((card?.offsetWidth ?? 320) + 20),
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const btn =
    "flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:border-aqua hover:bg-aqua hover:text-petrol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua disabled:pointer-events-none disabled:opacity-30";

  return (
    <section className="relative overflow-hidden bg-petrol topo-texture section-y text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--teal)_35%,transparent),transparent_70%)] blur-2xl"
      />
      <div className="container-tf relative flex flex-wrap items-end justify-between gap-6">
        <Reveal>
          <FlowHeading
            before={t.home.circuitsTitle}
            word={t.home.circuitsFlow}
            className="h-section"
          />
          <p className="mt-3 max-w-md text-white/70">
            {lang === "fr"
              ? "Demi-journée, journée ou plusieurs jours : choisissez votre rythme."
              : "Half-day, full day or several days: choose your pace."}
          </p>
        </Reveal>
        <div className="flex items-center gap-4">
          <Link
            to="/circuits"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-aqua"
          >
            {lang === "fr" ? "Tous les circuits" : "All circuits"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={state.start}
              aria-label={lang === "fr" ? "Circuit précédent" : "Previous circuit"}
              className={btn}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={state.end}
              aria-label={lang === "fr" ? "Circuit suivant" : "Next circuit"}
              className={btn}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container-tf relative mt-10">
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--petrol)] to-transparent transition-opacity duration-300 ${
            state.end ? "opacity-0" : "opacity-100"
          }`}
        />
        <div
          ref={ref}
          onScroll={update}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {circuits.map((c) => (
            <div key={c.slug} className="w-[82%] shrink-0 snap-start sm:w-[340px]">
              <CircuitCard circuit={c} dark />
            </div>
          ))}
        </div>
        <div className="mt-8 h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <motion.div
            className="h-full rounded-full bg-aqua"
            animate={{ width: `${Math.max(12, state.progress * 100)}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 24 }}
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Activities — sticky intro + grid                                    */
/* ------------------------------------------------------------------ */

function ActivitiesGrid() {
  const { t, lang } = useT();
  const fade = useFadeUp();
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
      <div className="container-tf grid gap-12 lg:grid-cols-[0.85fr_2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <FlowHeading
              before={t.home.activitiesTitle}
              word={t.home.activitiesFlow}
              className="h-section text-petrol"
            />
            <p className="mt-4 max-w-sm text-muted-foreground">
              {lang === "fr"
                ? "Complétez votre sortie avec un guide, un pique-nique ou un transfert, à ajouter lors de la réservation."
                : "Add a guide, a picnic or a transfer to your ride when you book."}
            </p>
            <TfLink to="/activites" variant="petrol" size="lg" className="mt-6" withArrow>
              {lang === "fr" ? "Voir les activités" : "See activities"}
            </TfLink>
          </Reveal>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {activities.slice(0, 6).map((a, i) => {
            const Icon = icons[a.icon] ?? Compass;
            return (
              <motion.div key={a.slug} {...fade(i % 2)}>
                <Link
                  to="/activites"
                  hash={a.slug}
                  className="group relative flex h-full flex-col rounded-3xl border border-petrol/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal/30 hover:shadow-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sand text-teal transition-all duration-300 group-hover:-rotate-6 group-hover:bg-teal group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="mt-5 block font-display text-lg font-bold text-petrol">
                    {a.title[lang]}
                  </span>
                  <span className="mt-1.5 block text-sm text-muted-foreground">
                    {a.short[lang]}
                  </span>
                  <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-semibold text-terracotta transition-all duration-300 lg:-translate-x-2 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100">
                    {lang === "fr" ? "Découvrir" : "Discover"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How to book — numbered steps (a real sequence)                      */
/* ------------------------------------------------------------------ */

function HowToBook() {
  const { t } = useT();
  const reduced = useReducedMotion();
  const fade = useFadeUp();
  const steps = t.home.steps;

  return (
    <section className="relative overflow-hidden bg-white section-y">
      <div className="container-tf">
        <Reveal>
          <FlowHeading
            before={t.home.howTitle}
            word={t.home.howFlow}
            className="h-section text-petrol"
          />
        </Reveal>

        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => {
            const last = i === steps.length - 1;
            return (
              <motion.li key={s.t} {...fade(i)} className="relative">
                <div
                  className={`relative h-full overflow-hidden rounded-3xl p-6 pt-7 transition-all duration-300 hover:-translate-y-1 ${
                    last
                      ? "bg-petrol text-white hover:shadow-lift"
                      : "border border-petrol/10 bg-sand/60 hover:bg-white hover:shadow-warm"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute -right-1 -top-7 font-display text-[110px] font-extrabold leading-none ${
                      last ? "text-white/[0.06]" : "text-petrol/[0.05]"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`relative flex h-14 w-14 items-center justify-center rounded-full font-display text-lg font-bold ${
                      last ? "bg-aqua text-petrol" : "bg-terracotta text-white"
                    }`}
                  >
                    {last ? (
                      <Zap className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      String(i + 1).padStart(2, "0")
                    )}
                  </span>
                  <h3
                    className={`mt-5 font-display text-lg font-bold ${last ? "text-white" : "text-petrol"}`}
                  >
                    {s.t}
                  </h3>
                  <p
                    className={`mt-1.5 text-sm ${last ? "text-white/75" : "text-muted-foreground"}`}
                  >
                    {s.d}
                  </p>
                </div>

                {!last && (
                  <motion.span
                    aria-hidden="true"
                    initial={{ scaleX: reduced ? 1 : 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.25, duration: 0.6, ease: EASE }}
                    className="absolute left-[calc(100%-0.25rem)] top-[3.25rem] z-10 hidden w-7 origin-left border-t-2 border-dashed border-aqua lg:block"
                  />
                )}
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Map preview — map only mounts when near the viewport                */
/* ------------------------------------------------------------------ */

function MapPreview() {
  const { t, lang } = useT();
  const mapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(mapRef, { once: true, margin: "200px" });

  const points =
    lang === "fr"
      ? ["Itinéraires tracés sur la carte", "Arrêts et points de vue", "Points de départ"]
      : ["Itineraries drawn on the map", "Stops and viewpoints", "Start points"];

  return (
    <section className="relative overflow-hidden bg-sand section-y">
      <div className="container-tf grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <FlowHeading
            before={t.home.mapTitle}
            word={t.home.mapFlow}
            className="h-section text-petrol"
          />
          <p className="mt-4 max-w-md text-muted-foreground">
            {lang === "fr"
              ? "Visualisez les itinéraires proposés autour de Midelt, leurs arrêts et leurs points de départ."
              : "See the proposed itineraries around Midelt, their stops and start points."}
          </p>
          <ul className="mt-6 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm font-medium text-petrol">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-teal shadow-sm">
                  <RouteIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <TfLink to="/carte" variant="petrol" size="lg" className="mt-8" withArrow>
            {t.home.mapCta}
          </TfLink>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-[2rem] bg-[linear-gradient(135deg,var(--teal),var(--terracotta))] opacity-20 blur-2xl"
            />
            <div
              ref={mapRef}
              className="relative h-[400px] overflow-hidden rounded-3xl border-4 border-white bg-white shadow-lift"
            >
              {inView ? (
                <CircuitMap height={392} interactive={false} lang={lang} />
              ) : (
                <div className="h-full w-full animate-pulse bg-[color-mix(in_oklab,var(--petrol)_6%,white)]" />
              )}
              <div className="pointer-events-none absolute left-4 top-4 z-[500] flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-petrol shadow backdrop-blur">
                <MapPin className="h-3.5 w-3.5 text-terracotta" aria-hidden="true" />
                Midelt, {circuits.length} {lang === "fr" ? "circuits" : "circuits"}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Figures                                                             */
/* ------------------------------------------------------------------ */

function Figures() {
  const { t, lang } = useT();
  return (
    <section className="relative overflow-hidden bg-petrol topo-texture section-y text-white">
      <AmazighBand className="absolute inset-x-0 top-0" height={8} />
      <div className="container-tf">
        <Reveal>
          <FlowHeading
            before={t.home.figuresTitle}
            word={t.home.figuresFlow}
            className="h-section"
          />
        </Reveal>
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {site.figures.map((f) => (
            <StaggerItem key={f.labelFr}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition-colors duration-300 hover:border-aqua/40 hover:bg-white/[0.07]">
                <span
                  aria-hidden="true"
                  className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-aqua/10 opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                />
                <p className="relative font-display text-5xl font-extrabold tracking-tight text-aqua">
                  <CountUp value={f.valueFr} suffix={f.suffix} />
                </p>
                <span className="mt-4 block h-0.5 w-10 rounded-full bg-terracotta transition-all duration-500 group-hover:w-16" />
                <p className="mt-3 text-sm text-white/70">
                  {lang === "fr" ? f.labelFr : f.labelEn}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Reviews (placeholders)                                              */
/* ------------------------------------------------------------------ */

function Reviews() {
  const { t, lang } = useT();
  const fade = useFadeUp();
  const items = [
    {
      name: "Sofia",
      flag: "🇪🇸",
      fr: "Sortie très bien organisée, paysages superbes.",
      en: "Very well organised ride, superb landscapes.",
    },
    {
      name: "Yassine",
      flag: "🇲🇦",
      fr: "Moto silencieuse, on entend la montagne.",
      en: "Silent bike, you can hear the mountain.",
    },
    {
      name: "Lena",
      flag: "🇩🇪",
      fr: "Parfait pour une première expérience.",
      en: "Perfect for a first experience.",
    },
  ];

  return (
    <section className="bg-white section-y">
      <div className="container-tf">
        <Reveal>
          <FlowHeading
            before={t.home.reviewsTitle}
            word={t.home.reviewsFlow}
            className="h-section text-petrol"
          />
          <p className="mt-2 text-xs text-terracotta">{t.home.reviewsNote}</p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((r, i) => (
            <motion.div key={r.name} {...fade(i)} className={i === 1 ? "md:mt-10" : ""}>
              <figure className="relative h-full rounded-3xl border border-petrol/10 bg-sand p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-warm">
                <Quote className="h-8 w-8 text-terracotta/40" aria-hidden="true" />
                <blockquote className="mt-4 text-base leading-relaxed text-slate-ink">
                  « {lang === "fr" ? r.fr : r.en} »
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-petrol font-display text-sm font-bold text-white"
                  >
                    {r.name.charAt(0)}
                  </span>
                  <span className="text-sm font-semibold text-petrol">
                    {r.name} <span aria-hidden="true">{r.flag}</span>
                  </span>
                </figcaption>
              </figure>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ — help card + accordion                                         */
/* ------------------------------------------------------------------ */

function FaqShort() {
  const { t, lang } = useT();
  return (
    <section className="bg-sand section-y">
      <div className="container-tf grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <FlowHeading
              before={t.home.faqTitle}
              word={t.home.faqFlow}
              className="h-section text-petrol"
            />
            <div className="mt-8 rounded-3xl bg-petrol p-6 text-white">
              <MessageCircle className="h-6 w-6 text-aqua" aria-hidden="true" />
              <p className="mt-3 font-display text-lg font-bold">
                {lang === "fr" ? "Une autre question ?" : "Another question?"}
              </p>
              <p className="mt-1 text-sm text-white/70">
                {lang === "fr"
                  ? "Écrivez-nous sur WhatsApp, nous vous répondons."
                  : "Message us on WhatsApp and we'll reply."}
              </p>
              <TfAnchor
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                size="lg"
                className="mt-5"
              >
                {t.home.ctaWhatsapp}
              </TfAnchor>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="space-y-3">
            {t.faq.map((f) => (
              <AccordionItem
                key={f.q}
                value={f.q}
                className="rounded-2xl border border-petrol/10 bg-white px-5 transition-shadow data-[state=open]:shadow-warm"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-petrol hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */

function CtaBand() {
  const { t, lang } = useT();
  const reduced = useReducedMotion();
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(120deg,var(--terracotta),color-mix(in_oklab,var(--terracotta)_60%,var(--petrol)))] py-20 text-white sm:py-24">
      <AmazighBand className="absolute inset-x-0 top-0" height={10} />
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-20 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--aqua)_30%,transparent),transparent_70%)]"
      />
      <motion.div
        aria-hidden="true"
        animate={reduced ? undefined : { y: [0, -10, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[8%] top-[18%] -z-10 hidden lg:block"
      >
        <Zap className="h-56 w-56 text-white/10" strokeWidth={1} />
      </motion.div>

      <div className="container-tf relative flex flex-col items-center gap-6 text-center">
        <Reveal>
          <h2 className="h-section max-w-2xl">{t.home.ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-lg text-white/80">
            {lang === "fr"
              ? "Choisissez votre circuit, votre date et réservez en quelques minutes."
              : "Pick your circuit and date, and book in a few minutes."}
          </p>
        </Reveal>
        <div className="flex flex-wrap justify-center gap-3">
          <TfLink to="/reservation" variant="white" size="lg" withArrow>
            {t.home.ctaBookNow}
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
