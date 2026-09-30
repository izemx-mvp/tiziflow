import { useRef, type ComponentProps, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";
import { ImageSlot } from "@/components/brand/ImageSlot";
import { MountainLayers } from "@/components/brand/Motifs";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Slot = ComponentProps<typeof ImageSlot>["slot"];

export function PageHeader({
  title,
  flowWord,
  subtitle,
  crumbs = [],
  image,
  children,
  fadeTo = "white",
}: {
  title: string;
  flowWord?: string;
  subtitle?: string;
  crumbs?: { label: string; to?: string }[];
  /** Optional background photo (e.g. a circuit or moto image slot). */
  image?: { slot: Slot; alt: string };
  /** Optional extra content under the subtitle (chips, key facts, buttons). */
  children?: ReactNode;
  /** Color of the next section, used for the mountain-ridge bottom edge. */
  fadeTo?: "white" | "sand" | "none";
}) {
  const { lang } = useT();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "18%"]);
  const mountY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 60]);

  const home = lang === "fr" ? "Accueil" : "Home";
  const edgeFill = fadeTo === "sand" ? "var(--sand)" : "#FFFFFF";

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ label: home, to: "/" }, ...crumbs].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.to ? { item: c.to } : {}),
    })),
  };

  return (
    <section
      ref={ref}
      className={cn(
        "relative isolate overflow-hidden bg-petrol pb-28 pt-32 text-white sm:pb-32 sm:pt-36",
        !image && "topo-texture",
      )}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {image && (
        <>
          <motion.div style={{ y: bgY }} className="absolute inset-x-0 -top-[6%] -z-10 h-[115%]">
            <ImageSlot slot={image.slot} alt={image.alt} className="h-full w-full" priority />
          </motion.div>
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--petrol)_94%,transparent)_0%,color-mix(in_oklab,var(--petrol)_70%,transparent)_55%,color-mix(in_oklab,var(--petrol)_35%,transparent)_100%)]"
          />
        </>
      )}

      <div
        aria-hidden="true"
        className="absolute -right-32 -top-32 -z-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--terracotta)_28%,transparent),transparent_70%)]"
      />
      <motion.div
        aria-hidden="true"
        style={{ y: mountY }}
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-full"
      >
        <MountainLayers className={image ? "opacity-40" : "opacity-60"} />
      </motion.div>

      <div className="container-tf relative">
        <motion.nav
          aria-label={lang === "fr" ? "Fil d'Ariane" : "Breadcrumb"}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <ol className="inline-flex flex-wrap items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/75 backdrop-blur">
            <li>
              <Link
                to="/"
                className="flex items-center gap-1.5 transition-colors hover:text-aqua focus-visible:text-aqua focus-visible:outline-none"
              >
                <Home className="h-3.5 w-3.5" aria-hidden="true" />
                {home}
              </Link>
            </li>
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={`${i}-${c.label}`} className="flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-white/40" aria-hidden="true" />
                  {c.to && !last ? (
                    <Link
                      to={c.to}
                      className="transition-colors hover:text-aqua focus-visible:text-aqua focus-visible:outline-none"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span
                      aria-current={last ? "page" : undefined}
                      className="font-medium text-white"
                    >
                      {c.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </motion.nav>

        <h1 className="mt-6 max-w-3xl overflow-hidden pb-[0.12em] h-section">
          <motion.span
            initial={reduced ? false : { y: "105%" }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: EASE }}
            className="block pr-[0.08em]"
          >
            {title} {flowWord && <span className="flow-word">{flowWord}</span>}
          </motion.span>
        </h1>

        {subtitle && (
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: EASE }}
            className="mt-4 max-w-2xl text-base text-white/75 sm:text-lg"
          >
            {subtitle}
          </motion.p>
        )}

        {children && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
            className="mt-8"
          >
            {children}
          </motion.div>
        )}
      </div>

      {/* Mountain-ridge edge blending into the next section */}
      {fadeTo !== "none" && (
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 64"
          preserveAspectRatio="none"
          className="absolute inset-x-0 -bottom-px h-10 w-full sm:h-16"
        >
          <path
            d="M0 64 L0 42 L120 24 L260 46 L420 14 L560 40 L720 20 L880 44 L1040 16 L1200 38 L1320 26 L1440 42 L1440 64 Z"
            fill={edgeFill}
          />
        </svg>
      )}
    </section>
  );
}
