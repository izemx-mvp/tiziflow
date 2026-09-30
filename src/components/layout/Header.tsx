import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { TfLink } from "@/components/brand/Buttons";
import { useT } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function Header() {
  const { t, lang, setLang } = useT();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { to: "/", label: t.nav.home },
    { to: "/motos", label: t.nav.motos },
    { to: "/circuits", label: t.nav.circuits },
    { to: "/activites", label: t.nav.activities },
    { to: "/carte", label: t.nav.map },
    { to: "/a-propos", label: t.nav.about },
    { to: "/contact", label: t.nav.contact },
  ] as const;

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "glass-light shadow-[0_8px_30px_-20px_rgba(0,0,0,0.4)]" : "bg-transparent",
      )}
    >
      <div
        className={cn(
          "container-tf flex items-center justify-between transition-all duration-300",
          scrolled ? "h-16" : "h-21",
        )}
      >
        <Logo
          variant={scrolled ? "plain" : "pill"}
          imgClassName={scrolled ? "h-10 w-auto" : "h-11 w-auto"}
        />

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "relative rounded-full px-3 py-2 text-sm font-medium transition-colors",
                scrolled ? "text-petrol hover:text-terracotta" : "text-white/90 hover:text-white",
              )}
            >
              {l.label}
              {isActive(l.to) && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-terracotta"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "hidden items-center rounded-full border p-0.5 text-xs font-semibold sm:flex",
              scrolled ? "border-petrol/15" : "border-white/40",
            )}
          >
            {(["fr", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={cn(
                  "rounded-full px-2.5 py-1 uppercase transition-colors",
                  lang === l
                    ? "bg-terracotta text-white"
                    : scrolled
                      ? "text-petrol"
                      : "text-white/80",
                )}
              >
                {l}
              </button>
            ))}
          </div>

          <Link
            to={user ? "/compte" : "/connexion"}
            aria-label={user ? t.nav.account : t.nav.login}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
              scrolled
                ? "border-petrol/15 text-petrol hover:bg-sand"
                : "border-white/40 text-white hover:bg-white/10",
            )}
          >
            {user ? (
              `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()
            ) : (
              <User className="h-4 w-4" />
            )}
          </Link>

          <TfLink to="/reservation" variant="primary" size="md" className="hidden sm:inline-flex">
            {t.nav.book}
          </TfLink>

          <button
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full lg:hidden",
              scrolled ? "text-petrol" : "text-white",
            )}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-petrol lg:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="container-tf flex h-21 items-center justify-between">
              <Logo variant="pill" imgClassName="h-9 w-auto" />
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="flex h-10 w-10 items-center justify-center rounded-full text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="container-tf mt-6 flex flex-col gap-1">
              {links.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link
                    to={l.to}
                    className="block py-3 font-display text-3xl font-bold text-white"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="container-tf mt-8 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                {(["fr", "en"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={cn(
                      "rounded-full border border-white/30 px-4 py-2 text-sm uppercase text-white",
                      lang === l && "bg-terracotta border-terracotta",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <TfLink to={user ? "/compte" : "/connexion"} variant="outlineLight" size="lg">
                {user ? t.nav.account : t.nav.login}
              </TfLink>
              <TfLink to="/reservation" variant="primary" size="lg">
                {t.nav.book}
              </TfLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
