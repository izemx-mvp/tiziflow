import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Menu, MessageCircle, Phone, User, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { MountainLayers } from "@/components/brand/Motifs";
import { TfLink } from "@/components/brand/Buttons";
import { site, whatsappLink } from "@/config/site";
import { useT } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Routes whose top area is light: the header is solid there from the start. */
const SOLID_ROUTES = ["/reservation", "/compte", "/connexion", "/inscription"];

export function Header() {
  const { t } = useT();
  const { user } = useAuth();
  const reduced = useReducedMotion();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const closeRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  const solid = scrolled || SOLID_ROUTES.some((r) => pathname.startsWith(r));
  const light = !solid; // white text over the dark page headers

  // Solid after 40px, hide when scrolling down, show when scrolling up
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (Math.abs(y - last) > 8) {
        setHidden(y > last && y > 320);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setHidden(false);
  }, [pathname]);

  // Mobile menu: scroll lock, Escape to close, focus management
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => closeRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      menuBtnRef.current?.focus();
    };
  }, [open]);

  // Circuits first: the business is circuit-based, motos are chosen inside a circuit
  const links = [
    { to: "/", label: t.nav.home },
    { to: "/circuits", label: t.nav.circuits },
    { to: "/motos", label: t.nav.motos },
    { to: "/activites", label: t.nav.activities },
    { to: "/carte", label: t.nav.map },
    { to: "/a-propos", label: t.nav.about },
    { to: "/contact", label: t.nav.contact },
  ] as const;

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  const tel = `tel:${site.phone.replace(/[^\d+]/g, "")}`;
  const initials = user ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() : "";

  return (
    <>
      <motion.header
        onFocusCapture={() => setHidden(false)}
        animate={{ y: hidden && !open ? "-100%" : "0%" }}
        transition={{ duration: reduced ? 0 : 0.35, ease: EASE }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300",
          solid ? "glass-light shadow-[0_10px_30px_-22px_rgba(18,48,58,0.55)]" : "bg-transparent",
        )}
      >
        <div
          className={cn(
            "container-tf flex items-center justify-between gap-4 transition-[height] duration-300",
            scrolled ? "h-16" : "h-24",
          )}
        >
          <Logo
            variant={solid ? "plain" : "pill"}
            imgClassName={cn("w-auto transition-all duration-300", scrolled ? "h-12" : "h-16 sm:h-[4.5rem]")}
          />

          <nav
            aria-label="Navigation principale"
            onMouseLeave={() => setHovered(null)}
            className="hidden items-center gap-0.5 lg:flex"
          >
            {links.map((l) => {
              const active = isActive(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={() => setHovered(l.to)}
                  onFocus={() => setHovered(l.to)}
                  onBlur={() => setHovered(null)}
                  className={cn(
                    "relative isolate rounded-full px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none",
                    light
                      ? active
                        ? "text-white"
                        : "text-white/80 hover:text-white"
                      : active
                        ? "text-petrol"
                        : "text-petrol/75 hover:text-petrol",
                  )}
                >
                  {hovered === l.to && (
                    <motion.span
                      layoutId="nav-hover"
                      className={cn(
                        "absolute inset-0 -z-10 rounded-full",
                        light ? "bg-white/12" : "bg-petrol/[0.06]",
                      )}
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-terracotta"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <LangSwitch light={light} layoutId="lang-pill-desktop" className="hidden sm:flex" />

            <Link
              to={user ? "/compte" : "/connexion"}
              aria-label={user ? t.nav.account : t.nav.login}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua",
                user
                  ? "bg-teal text-white hover:bg-petrol"
                  : light
                    ? "border border-white/40 text-white hover:bg-white/10"
                    : "border border-petrol/15 text-petrol hover:bg-sand",
              )}
            >
              {user ? initials : <User className="h-4 w-4" />}
            </Link>

            <TfLink to="/reservation" variant="primary" size="md" className="hidden sm:inline-flex">
              {t.nav.book}
            </TfLink>

            <button
              ref={menuBtnRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={open}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua lg:hidden",
                light ? "text-white hover:bg-white/10" : "text-petrol hover:bg-sand",
              )}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Reading progress, only when the header is solid */}
        <motion.div
          aria-hidden="true"
          style={{ scaleX: progress }}
          className={cn(
            "absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-terracotta via-aqua to-teal transition-opacity duration-300",
            solid ? "opacity-100" : "opacity-0",
          )}
        />
      </motion.header>

      {/* Rendered outside the transformed header so `fixed` covers the viewport */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={reduced ? { opacity: 0 } : { clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
            animate={reduced ? { opacity: 1 } : { clipPath: "circle(150% at calc(100% - 2.5rem) 2.5rem)" }}
            exit={reduced ? { opacity: 0 } : { clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
            transition={{ duration: 0.55, ease: EASE }}
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-petrol topo-texture text-white lg:hidden"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-40">
              <MountainLayers />
            </div>

            <div className="container-tf relative z-10 flex h-24 shrink-0 items-center justify-between">
              <Logo variant="pill" imgClassName="h-14 w-auto" />
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Navigation mobile" className="container-tf relative z-10 mt-4">
              {links.map((l, i) => {
                const active = isActive(l.to);
                return (
                  <motion.div
                    key={l.to}
                    initial={reduced ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + 0.05 * i, duration: 0.45, ease: EASE }}
                  >
                    <Link
                      to={l.to}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center justify-between border-b border-white/10 py-4 font-display text-3xl font-bold transition-colors focus-visible:outline-none focus-visible:text-aqua",
                        active ? "text-aqua" : "text-white hover:text-aqua",
                      )}
                    >
                      {l.label}
                      <ArrowUpRight
                        className={cn(
                          "h-6 w-6 transition-all duration-300",
                          active
                            ? "opacity-100"
                            : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                        )}
                        aria-hidden="true"
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.45, ease: EASE }}
              className="container-tf relative z-10 mt-auto flex flex-col gap-4 pb-8 pt-10"
            >
              <div className="flex flex-wrap gap-2">
                <a
                  href={tel}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:bg-white/20"
                >
                  <Phone className="h-4 w-4 text-aqua" aria-hidden="true" />
                  {site.phone}
                </a>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:bg-white/20"
                >
                  <MessageCircle className="h-4 w-4 text-aqua" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>

              <LangSwitch light layoutId="lang-pill-mobile" className="w-fit text-sm [&>button]:px-4 [&>button]:py-2" />

              <div className="grid grid-cols-2 gap-3">
                <TfLink to={user ? "/compte" : "/connexion"} variant="outlineLight" size="lg" className="justify-center">
                  {user ? t.nav.account : t.nav.login}
                </TfLink>
                <TfLink to="/reservation" variant="primary" size="lg" className="justify-center">
                  {t.nav.book}
                </TfLink>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function LangSwitch({ light, layoutId, className }: { light: boolean; layoutId: string; className?: string }) {
  const { lang, setLang } = useT();
  return (
    <div
      role="group"
      aria-label="Langue / Language"
      className={cn(
        "flex items-center rounded-full border p-0.5 text-xs font-semibold",
        light ? "border-white/35" : "border-petrol/15",
        className,
      )}
    >
      {(["fr", "en"] as const).map((l) => {
        const active = lang === l;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            onClick={() => setLang(l)}
            aria-pressed={active}
            className={cn(
              "relative isolate rounded-full px-2.5 py-1 uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua",
              active ? "text-white" : light ? "text-white/80 hover:text-white" : "text-petrol hover:text-terracotta",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-full bg-terracotta"
                transition={{ type: "spring", stiffness: 450, damping: 34 }}
              />
            )}
            {l}
          </button>
        );
      })}
    </div>
  );
}