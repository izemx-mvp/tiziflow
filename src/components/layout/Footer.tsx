import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUp, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { AmazighBand } from "@/components/brand/Motifs";
import { Logo } from "@/components/brand/Logo";
import { useT } from "@/i18n";
import { site, whatsappLink } from "@/config/site";
import { circuits } from "@/data/circuits";

/** Underline that grows from the left on hover. */
const linkFx =
  "bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size,color] duration-300 hover:bg-[length:100%_1px] hover:text-white focus-visible:bg-[length:100%_1px] focus-visible:text-white focus-visible:outline-none";

export function Footer() {
  const { t, lang } = useT();
  const year = new Date().getFullYear();
  const tel = `tel:${site.phone.replace(/[^\d+]/g, "")}`;

  const toTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <footer className="relative overflow-hidden bg-petrol text-white/70">
      <AmazighBand height={12} />

      <div className="topo-texture">
        <div className="container-tf grid gap-12 pb-12 pt-16 lg:grid-cols-[1.1fr_2fr] lg:gap-16">
          {/* Brand block */}
          <div>
            <Logo variant="pill" imgClassName="h-24 w-auto lg:h-28" />
            <p className="mt-6 max-w-sm font-display text-2xl font-bold leading-snug text-white">
              {lang === "fr"
                ? "L'Atlas en moto électrique, au rythme de nos circuits guidés."
                : "The Atlas by electric motorbike, on our guided circuits."}
            </p>
            <p className="mt-3 max-w-sm text-sm">
              {lang === "fr"
                ? "Excursions guidées au départ de Midelt : choisissez votre circuit, puis votre moto."
                : "Guided excursions from Midelt: pick your circuit, then your motorbike."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-10px_var(--terracotta)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {t.home.ctaWhatsapp}
              </a>
              <Link
                to="/circuits"
                className="inline-flex items-center rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-petrol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua"
              >
                {lang === "fr" ? "Voir les circuits" : "See circuits"}
              </Link>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            <FooterCol title="Navigation">
              <FooterLink to="/circuits">{t.nav.circuits}</FooterLink>
              <FooterLink to="/motos">{t.nav.motos}</FooterLink>
              <FooterLink to="/activites">{t.nav.activities}</FooterLink>
              <FooterLink to="/carte">{t.nav.map}</FooterLink>
              <FooterLink to="/a-propos">{t.nav.about}</FooterLink>
              <FooterLink to="/contact">{t.nav.contact}</FooterLink>
            </FooterCol>

            <FooterCol title={t.nav.circuits}>
              {circuits.map((c) => (
                <li key={c.slug}>
                  <Link to="/circuits/$slug" params={{ slug: c.slug }} className={`text-sm ${linkFx}`}>
                    {c.title[lang]}
                  </Link>
                </li>
              ))}
            </FooterCol>

            <FooterCol title={lang === "fr" ? "Espace client" : "Client area"}>
              <FooterLink to="/connexion">{t.nav.login}</FooterLink>
              <FooterLink to="/inscription">{t.nav.register}</FooterLink>
              <FooterLink to="/compte/reservations">{t.nav.bookings}</FooterLink>
              <FooterLink to="/compte/reclamations">{t.nav.claims}</FooterLink>
            </FooterCol>

            <FooterCol title="Contact">
              <li>
                <a href={tel} className="flex items-start gap-2.5 text-sm transition-colors hover:text-white">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-aqua" aria-hidden="true" />
                  {site.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-start gap-2.5 break-all text-sm transition-colors hover:text-white"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-aqua" aria-hidden="true" />
                  {site.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-aqua" aria-hidden="true" />
                {site.address}
              </li>
            </FooterCol>
          </div>
        </div>

        {/* Oversized outlined wordmark */}
        <div aria-hidden="true" className="pointer-events-none select-none overflow-hidden">
          <p className="container-tf -mb-[0.16em] whitespace-nowrap font-display text-[19vw] font-extrabold leading-[0.8] tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.1)] xl:text-[250px]">
            TiziFlow
          </p>
        </div>

        <div className="relative border-t border-white/10 bg-petrol">
          <div className="container-tf flex flex-col gap-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} TiziFlow. {lang === "fr" ? "Tous droits réservés." : "All rights reserved."}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link to="/mentions-legales" className={linkFx}>
                {lang === "fr" ? "Mentions légales" : "Legal notice"}
              </Link>
              <Link to="/confidentialite" className={linkFx}>
                {lang === "fr" ? "Politique de confidentialité" : "Privacy policy"}
              </Link>
              <Link to="/cgv" className={linkFx}>
                {lang === "fr" ? "CGV" : "Terms"}
              </Link>
              <button
                type="button"
                onClick={toTop}
                aria-label={lang === "fr" ? "Retour en haut" : "Back to top"}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-aqua hover:bg-aqua hover:text-petrol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-sm font-bold text-white">{title}</h3>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <li>
      <Link to={to} className={`text-sm ${linkFx}`}>
        {children}
      </Link>
    </li>
  );
}