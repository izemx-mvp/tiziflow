import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion, type MotionProps } from "framer-motion";
import { Camera, Car, Check, Compass, Plus, ShieldCheck, ShoppingBag, Sunset, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImageSlot } from "@/components/brand/ImageSlot";
import { AmazighBand } from "@/components/brand/Motifs";
import { TfLink } from "@/components/brand/Buttons";
import { activities } from "@/data/activities";
import { useT } from "@/i18n";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/activites")({
  head: () =>
    seo({
      title: "Activités & services — TiziFlow Midelt",
      description:
        "Guide local, pique-nique en montagne, coucher de soleil, photographe, équipement et transfert : complétez votre circuit TiziFlow.",
      path: "/activites",
    }),
  component: ActivitiesPage,
});

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const ICONS: Record<string, typeof Compass> = { Compass, UtensilsCrossed, Sunset, Camera, ShieldCheck, Car };
type Activity = (typeof activities)[number];
type Lang = "fr" | "en";

const formatMAD = (n: number, lang: Lang) =>
  `${new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-GB").format(n)} MAD`;

const btnBase =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2";
const btn = {
  primary: cn(btnBase, "bg-terracotta text-white hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_var(--terracotta)]"),
  petrol: cn(btnBase, "bg-petrol text-white hover:-translate-y-0.5"),
};

/* ---- Booking draft link (same sessionStorage key as /reservation) ---- */
const DRAFT_KEY = "tf:booking-draft";
const DRAFT_EVENT = "tf:draft-change";

function readOptions(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    const saved = raw ? (JSON.parse(raw) as { draft?: { options?: string[] } }) : null;
    return saved?.draft?.options ?? [];
  } catch {
    return [];
  }
}

function toggleDraftOption(slug: string): boolean {
  let saved: { draft: Record<string, unknown> & { options?: string[] }; step: number; maxStep: number };
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    saved = raw ? JSON.parse(raw) : { draft: {}, step: 0, maxStep: 0 };
  } catch {
    saved = { draft: {}, step: 0, maxStep: 0 };
  }
  const current = saved.draft.options ?? [];
  const on = !current.includes(slug);
  saved.draft.options = on ? [...current, slug] : current.filter((s) => s !== slug);
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(saved));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(DRAFT_EVENT));
  return on;
}

function subscribeDraft(cb: () => void) {
  window.addEventListener(DRAFT_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(DRAFT_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function useDraftOptions(): string[] {
  const key = useSyncExternalStore(subscribeDraft, () => readOptions().join(","), () => "");
  return key ? key.split(",") : [];
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

function ActivitiesPage() {
  const { t, lang } = useT();
  const fr = lang === "fr";
  const selected = useDraftOptions();
  const active = useScrollSpy(activities.map((a) => a.slug));

  const chosen = activities.filter((a) => selected.includes(a.slug));
  const total = chosen.reduce((s, a) => s + Number(a.price), 0);

  const toggle = (a: Activity) => {
    const on = toggleDraftOption(a.slug);
    toast.success(
      on
        ? fr
          ? `${a.title.fr} ajouté à votre réservation`
          : `${a.title.en} added to your booking`
        : fr
          ? `${a.title.fr} retiré de votre réservation`
          : `${a.title.en} removed from your booking`,
    );
  };

  return (
    <>
      <PageHeader
        title={fr ? "Activités &" : "Activities &"}
        flowWord="services"
        subtitle={
          fr
            ? "Des options à ajouter à votre circuit pour compléter la sortie : un guide, un pique-nique, un coucher de soleil…"
            : "Extras to add to your circuit: a guide, a picnic, a sunset…"
        }
        crumbs={[{ label: t.nav.activities }]}
        image={{
          slot: "circuit-vallee" as never,
          alt: fr ? "Motos électriques dans une vallée verte de l'Atlas" : "Electric motorbikes in a green Atlas valley",
        }}
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
          <Plus className="h-4 w-4 text-aqua" aria-hidden="true" />
          {fr
            ? "Ajoutez-les ici ou à l'étape « Options » de votre réservation"
            : "Add them here or at the \"Extras\" step of your booking"}
        </p>
      </PageHeader>

      {/* Mobile quick nav */}
      <nav
        aria-label={fr ? "Activités" : "Activities"}
        className="sticky top-16 z-20 border-b border-petrol/10 bg-white/85 backdrop-blur-md lg:hidden"
      >
        <div className="container-tf flex gap-2 overflow-x-auto py-3">
          {activities.map((a) => (
            <a
              key={a.slug}
              href={`#${a.slug}`}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                active === a.slug ? "bg-petrol text-white" : "bg-sand text-petrol",
              )}
            >
              {a.title[lang]}
            </a>
          ))}
        </div>
      </nav>

      <div className="bg-white">
        <div className="container-tf grid gap-12 py-16 lg:grid-cols-[260px_1fr] lg:py-24">
          {/* Desktop sidebar: nav + selection */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <nav aria-label={fr ? "Activités" : "Activities"} className="space-y-1">
                {activities.map((a) => {
                  const Icon = ICONS[a.icon] ?? Compass;
                  const on = active === a.slug;
                  const picked = selected.includes(a.slug);
                  return (
                    <a
                      key={a.slug}
                      href={`#${a.slug}`}
                      aria-current={on ? "true" : undefined}
                      className={cn(
                        "relative isolate flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
                        on ? "text-white" : "text-petrol/75 hover:bg-sand hover:text-petrol",
                      )}
                    >
                      {on && (
                        <motion.span
                          layoutId="activity-nav"
                          className="absolute inset-0 -z-10 rounded-2xl bg-petrol"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="flex-1">{a.title[lang]}</span>
                      {picked && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal text-white">
                          <Check className="h-3 w-3" aria-hidden="true" />
                        </span>
                      )}
                    </a>
                  );
                })}
              </nav>
              <SelectionCard lang={lang} chosen={chosen} total={total} />
            </div>
          </aside>

          {/* Activities */}
          <div className="space-y-20 lg:space-y-28">
            {activities.map((a, i) => (
              <ActivityBlock key={a.slug} a={a} index={i} lang={lang} picked={selected.includes(a.slug)} onToggle={() => toggle(a)} />
            ))}
            <div className="lg:hidden">
              <SelectionCard lang={lang} chosen={chosen} total={total} />
            </div>
          </div>
        </div>
      </div>

      <section className="relative isolate overflow-hidden bg-[linear-gradient(120deg,var(--terracotta),color-mix(in_oklab,var(--terracotta)_60%,var(--petrol)))] py-20 text-white">
        <AmazighBand className="absolute inset-x-0 top-0" height={10} />
        <div className="container-tf flex flex-col items-center gap-6 text-center">
          <h2 className="h-section max-w-2xl">
            {fr ? "Les activités accompagnent un circuit" : "Activities come with a circuit"}
          </h2>
          <p className="max-w-lg text-white/80">
            {fr
              ? "Choisissez d'abord votre circuit et votre moto : vos options vous attendront à l'étape suivante."
              : "Choose your circuit and motorbike first: your extras will be waiting at the next step."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <TfLink to="/circuits" variant="white" size="lg" withArrow>
              {fr ? "Choisir mon circuit" : "Choose my circuit"}
            </TfLink>
            <TfLink to="/reservation" variant="outlineLight" size="lg">
              {fr ? "Continuer ma réservation" : "Continue my booking"}
            </TfLink>
          </div>
        </div>
        <AmazighBand className="absolute inset-x-0 bottom-0" height={10} />
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */

function ActivityBlock({
  a,
  index,
  lang,
  picked,
  onToggle,
}: {
  a: Activity;
  index: number;
  lang: Lang;
  picked: boolean;
  onToggle: () => void;
}) {
  const fr = lang === "fr";
  const reduced = useReducedMotion();
  const Icon = ICONS[a.icon] ?? Compass;
  const flip = index % 2 === 1;

  const enter = (x: number, delay = 0): MotionProps =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, x },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <section id={a.slug} aria-labelledby={`${a.slug}-title`} className="grid scroll-mt-32 items-center gap-8 md:grid-cols-2 lg:gap-12">
      <motion.div {...enter(flip ? 40 : -40)} className={cn("relative", flip && "md:order-2")}>
        <div className="group overflow-hidden rounded-3xl shadow-lift">
          <ImageSlot
            slot={a.image}
            alt={a.title[lang]}
            className="aspect-[4/3] w-full transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <span className="absolute -bottom-5 left-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal text-white shadow-warm ring-4 ring-white">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <AnimatePresence>
          {picked && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-teal shadow-warm"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              {fr ? "Dans votre réservation" : "In your booking"}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div {...enter(flip ? -40 : 40, 0.1)}>
        <h2 id={`${a.slug}-title`} className="font-display text-3xl font-bold text-petrol">
          {a.title[lang]}
        </h2>
        <p className="mt-4 leading-relaxed text-slate-ink">{a.text[lang]}</p>
        <ul className="mt-5 space-y-2.5">
          {a.bullets[lang].map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-slate-ink">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                <Check className="h-3 w-3" aria-hidden="true" />
              </span>
              {b}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap items-center gap-4 rounded-2xl bg-sand p-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{fr ? "Prix d'exemple" : "Sample price"}</p>
            <p className="font-display text-2xl font-extrabold text-petrol">
              {Number(a.price) > 0 ? formatMAD(Number(a.price), lang) : fr ? "Offert" : "Free"}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={picked}
            className={cn(picked ? btn.petrol : btn.primary, "min-w-[210px]")}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={picked ? "on" : "off"}
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-2"
              >
                {picked ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                {picked ? (fr ? "Ajouté, retirer" : "Added, remove") : fr ? "Ajouter à ma réservation" : "Add to my booking"}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </motion.div>
    </section>
  );
}

function SelectionCard({ lang, chosen, total }: { lang: Lang; chosen: Activity[]; total: number }) {
  const fr = lang === "fr";
  return (
    <div className="overflow-hidden rounded-3xl border border-petrol/10 bg-sand">
      <div className="flex items-center gap-2 border-b border-petrol/10 px-5 py-4">
        <ShoppingBag className="h-4 w-4 text-terracotta" aria-hidden="true" />
        <p className="font-display font-bold text-petrol">{fr ? "Votre sélection" : "Your selection"}</p>
        <span className="ml-auto rounded-full bg-petrol px-2 py-0.5 text-xs font-bold text-white tabular-nums">{chosen.length}</span>
      </div>
      <div className="px-5 py-4" aria-live="polite">
        {chosen.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {fr ? "Aucune option pour l'instant. Ajoutez celles qui vous tentent." : "No extras yet. Add the ones you like."}
          </p>
        ) : (
          <>
            <ul className="space-y-1.5 text-sm">
              <AnimatePresence initial={false}>
                {chosen.map((a) => (
                  <motion.li
                    key={a.slug}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex justify-between gap-3 overflow-hidden text-petrol"
                  >
                    <span>{a.title[lang]}</span>
                    <span className="text-muted-foreground">{formatMAD(Number(a.price), lang)}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <div className="mt-3 flex justify-between border-t border-dashed border-petrol/15 pt-3 text-sm">
              <span className="font-semibold text-petrol">Total</span>
              <span className="font-display font-extrabold text-petrol">{formatMAD(total, lang)}</span>
            </div>
          </>
        )}
        <TfLink to="/reservation" variant="primary" size="lg" className="mt-4 w-full justify-center" withArrow>
          {chosen.length ? (fr ? "Continuer ma réservation" : "Continue my booking") : fr ? "Réserver un circuit" : "Book a circuit"}
        </TfLink>
      </div>
    </div>
  );
}