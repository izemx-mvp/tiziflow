import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion, type MotionProps } from "framer-motion";
import { Bike, Compass, HeartHandshake, Leaf, MapPin, Mountain, ShieldCheck, UserRound, Volume2, Wrench } from "lucide-react";
import { seo } from "@/lib/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImageSlot } from "@/components/brand/ImageSlot";
import { AmazighBand } from "@/components/brand/Motifs";
import { FlowHeading, Reveal } from "@/components/brand/Reveal";
import { TfAnchor, TfLink } from "@/components/brand/Buttons";
import { whatsappLink } from "@/config/site";
import { useT } from "@/i18n";

export const Route = createFileRoute("/a-propos")({
  head: () =>
    seo({
      title: "À propos — TiziFlow, excursions en moto électrique à Midelt",
      description:
        "TiziFlow, nouvelle agence d'excursions guidées en moto électrique à Midelt : notre approche, nos valeurs et notre engagement pour une mobilité propre.",
      path: "/a-propos",
    }),
  component: AboutPage,
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
          transition: { duration: 0.6, delay: i * 0.09, ease: EASE },
        };
}

function AboutPage() {
  const { t, lang } = useT();
  const fr = lang === "fr";
  const fade = useFadeUp();

  /* CONTENU EXEMPLE À REMPLACER — texte générique, sans faits inventés */
  const values = [
    { Icon: Mountain, t: fr ? "Nature" : "Nature", d: fr ? "Des circuits pensés pour respecter les paysages et les villages traversés." : "Circuits designed to respect the landscapes and villages along the way." },
    { Icon: ShieldCheck, t: fr ? "Sécurité" : "Safety", d: fr ? "Briefing avant le départ, équipement fourni et accompagnement sur le parcours." : "Briefing before departure, gear provided and guidance along the route." },
    { Icon: HeartHandshake, t: fr ? "Authenticité" : "Authenticity", d: fr ? "Une équipe locale qui partage sa région, simplement." : "A local team sharing its region, simply." },
    { Icon: Leaf, t: fr ? "Mobilité propre" : "Clean mobility", d: fr ? "Des motos électriques, silencieuses et sans émissions à l'échappement." : "Electric motorbikes, quiet and with no tailpipe emissions." },
  ];

  const steps = [
    { Icon: Compass, t: fr ? "Vous choisissez un circuit" : "You choose a circuit", d: fr ? "Selon votre niveau, votre temps et le paysage qui vous attire." : "Based on your level, your time and the landscape you want." },
    { Icon: Bike, t: fr ? "Vous choisissez vos motos" : "You choose your motorbikes", d: fr ? "Parmi celles adaptées au circuit, une par pilote." : "Among those suited to the circuit, one per rider." },
    { Icon: MapPin, t: fr ? "Vous partez de Midelt" : "You set off from Midelt", d: fr ? "Accompagné sur un itinéraire préparé à l'avance." : "Guided along a route prepared in advance." },
  ];

  const team = [
    { Icon: Compass, role: fr ? "Fondateur et guide" : "Founder and guide" },
    { Icon: UserRound, role: fr ? "Guide de montagne" : "Mountain guide" },
    { Icon: Wrench, role: fr ? "Technicien motos" : "Motorbike technician" },
  ];

  const eco = [
    { Icon: Volume2, t: fr ? "Silence" : "Silence", d: fr ? "Un moteur électrique discret : on entend la montagne, pas la moto." : "A quiet electric motor: you hear the mountain, not the bike." },
    { Icon: Leaf, t: fr ? "Zéro échappement" : "Zero exhaust", d: fr ? "Aucune émission de gaz d'échappement sur les pistes." : "No exhaust fumes on the trails." },
    { Icon: Mountain, t: fr ? "Respect des sites" : "Respect for places", d: fr ? "Des itinéraires balisés et des groupes à taille humaine." : "Marked routes and small groups." },
  ];

  return (
    <>
      <PageHeader
        title={fr ? "Une nouvelle façon de" : "A new way to"}
        flowWord={fr ? "découvrir" : "discover"}
        subtitle={
          fr
            ? "TiziFlow est une jeune agence de Midelt qui propose des excursions guidées en moto électrique dans les paysages de l'Atlas."
            : "TiziFlow is a young agency in Midelt offering guided electric motorbike excursions in the Atlas landscapes."
        }
        crumbs={[{ label: fr ? "À propos" : "About" }]}
        image={{
          slot: "circuit-panorama" as never,
          alt: fr
            ? "Pilote à moto électrique face aux crêtes de l'Atlas près de Midelt"
            : "Rider on an electric motorbike facing the Atlas ridges near Midelt",
        }}
      />

      {/* Story */}
      <section className="bg-white section-y">
        <div className="container-tf grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <FlowHeading
              before={fr ? "Née d'une passion pour" : "Born from a passion for"}
              word={fr ? "l'Atlas" : "the Atlas"}
              className="h-section text-petrol"
            />
            {/* CONTENU EXEMPLE À REMPLACER */}
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                {fr
                  ? "L'idée de TiziFlow est simple : faire découvrir la région de Midelt autrement, sur des motos électriques, en suivant des circuits guidés adaptés à chaque niveau."
                  : "The idea behind TiziFlow is simple: show the Midelt region differently, on electric motorbikes, along guided circuits suited to every level."}
              </p>
              <p>
                {fr
                  ? "Chaque sortie part d'un circuit préparé. Vous choisissez l'itinéraire, puis la moto qui lui convient, et l'équipe s'occupe du reste."
                  : "Every ride starts from a prepared circuit. You choose the route, then the motorbike that suits it, and the team takes care of the rest."}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative">
              <div className="overflow-hidden rounded-3xl shadow-lift">
                <ImageSlot
                  slot={"about-eco" as never}
                  alt={fr ? "Moto électrique sur une piste de montagne" : "Electric motorbike on a mountain track"}
                  className="aspect-[4/3] w-full"
                />
              </div>
              <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-warm sm:-left-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-terracotta text-white">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs text-muted-foreground">{fr ? "Point de départ" : "Starting point"}</span>
                  <span className="block font-display font-bold text-petrol">Midelt, Maroc</span>
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="bg-sand section-y">
        <div className="container-tf">
          <Reveal>
            <FlowHeading before={fr ? "Ce qui nous" : "What"} word={fr ? "guide" : "guides us"} className="h-section text-petrol" />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <motion.div key={v.t} {...fade(i)}>
                <article className="group relative h-full overflow-hidden rounded-3xl border border-petrol/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-warm">
                  <span className="absolute inset-x-0 top-0 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100">
                    <AmazighBand height={5} />
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sand text-teal transition-all duration-300 group-hover:-rotate-6 group-hover:bg-teal group-hover:text-white">
                    <v.Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-petrol">{v.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
                </article>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — circuit first */}
      <section className="relative overflow-hidden bg-petrol topo-texture section-y text-white">
        <div className="container-tf">
          <Reveal>
            <FlowHeading before={fr ? "Tout part d'un" : "It all starts with a"} word={fr ? "circuit" : "circuit"} className="h-section" />
            <p className="mt-4 max-w-xl text-white/70">
              {fr
                ? "Nous ne louons pas de motos seules : chaque sortie est un circuit guidé, et la moto se choisit à l'intérieur de ce circuit."
                : "We don't rent motorbikes on their own: every ride is a guided circuit, and the motorbike is chosen within that circuit."}
            </p>
          </Reveal>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.li key={s.t} {...fade(i)} className="relative">
                <div className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition-colors duration-300 hover:border-aqua/40 hover:bg-white/[0.07]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta font-display font-bold">
                      {i + 1}
                    </span>
                    <s.Icon className="h-5 w-5 text-aqua" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold">{s.t}</h3>
                  <p className="mt-2 text-sm text-white/70">{s.d}</p>
                </div>
              </motion.li>
            ))}
          </ol>
          <TfLink to="/circuits" variant="primary" size="lg" className="mt-10" withArrow>
            {fr ? "Découvrir les circuits" : "Discover the circuits"}
          </TfLink>
        </div>
      </section>

      {/* Team placeholders */}
      <section className="bg-white section-y">
        <div className="container-tf">
          <Reveal>
            <FlowHeading before={fr ? "L'équipe sur le" : "The team on the"} word={fr ? "terrain" : "ground"} className="h-section text-petrol" />
            <p className="mt-3 text-sm text-muted-foreground">{fr ? "Photos et présentations à venir." : "Photos and introductions coming soon."}</p>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m, i) => (
              <motion.div key={m.role} {...fade(i)}>
                <figure className="group overflow-hidden rounded-3xl border border-petrol/10 bg-sand">
                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[linear-gradient(160deg,color-mix(in_oklab,var(--teal)_18%,var(--sand)),var(--sand))]">
                    <svg aria-hidden="true" viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-1/2 w-full">
                      <path d="M0 120 L0 70 L80 30 L150 72 L230 20 L310 64 L400 38 L400 120 Z" fill="color-mix(in oklab, var(--terracotta) 22%, transparent)" />
                      <path d="M0 120 L0 92 L110 60 L200 96 L290 58 L400 88 L400 120 Z" fill="color-mix(in oklab, var(--petrol) 18%, transparent)" />
                    </svg>
                    <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white text-petrol shadow-warm transition-transform duration-500 group-hover:scale-105">
                      <m.Icon className="h-10 w-10" aria-hidden="true" />
                    </span>
                  </div>
                  <figcaption className="p-5">
                    <p className="font-display text-lg font-bold text-petrol">{m.role}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{fr ? "Nom à venir" : "Name coming soon"}</p>
                  </figcaption>
                </figure>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Eco */}
      <section className="bg-sand section-y">
        <div className="container-tf grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <FlowHeading before={fr ? "Rouler" : "Riding"} word={fr ? "électrique" : "electric"} className="h-section text-petrol" />
            <p className="mt-4 max-w-md text-muted-foreground">
              {fr
                ? "Le choix de l'électrique change l'expérience : moins de bruit, plus de paysage."
                : "Going electric changes the experience: less noise, more landscape."}
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {eco.map((e, i) => (
              <motion.div key={e.t} {...fade(i)}>
                <div className="h-full rounded-3xl bg-white p-6 shadow-[0_1px_0_rgba(18,48,58,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-warm">
                  <e.Icon className="h-6 w-6 text-teal" aria-hidden="true" />
                  <h3 className="mt-4 font-display font-bold text-petrol">{e.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{e.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden bg-[linear-gradient(120deg,var(--terracotta),color-mix(in_oklab,var(--terracotta)_60%,var(--petrol)))] py-20 text-white">
        <AmazighBand className="absolute inset-x-0 top-0" height={10} />
        <div className="container-tf flex flex-col items-center gap-6 text-center">
          <h2 className="h-section max-w-2xl">{t.home.ctaTitle}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <TfLink to="/reservation" variant="white" size="lg" withArrow>
              {t.home.ctaBookNow}
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