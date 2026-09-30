import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { AmazighBand } from "@/components/brand/Motifs";
import { Logo } from "@/components/brand/Logo";
import { useT } from "@/i18n";
import { site } from "@/config/site";
import { circuits } from "@/data/circuits";

export function Footer() {
  const { t, lang } = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-petrol text-white/80 topo-texture">
      <AmazighBand height={12} />
      <div className="container-tf grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo variant="pill" imgClassName="h-14 w-auto" />
          <p className="mt-4 max-w-xs text-sm">
            {lang === "fr"
              ? "Location de motos électriques et excursions guidées à Midelt, au cœur de l'Atlas."
              : "Electric motorbike rental and guided excursions in Midelt, in the heart of the Atlas."}
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-aqua" /> {site.phone}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-aqua" /> {site.email}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-aqua" /> {site.address}
            </li>
          </ul>
        </div>

        <FooterCol title={lang === "fr" ? "Navigation" : "Navigation"}>
          <FooterLink to="/motos">{t.nav.motos}</FooterLink>
          <FooterLink to="/circuits">{t.nav.circuits}</FooterLink>
          <FooterLink to="/activites">{t.nav.activities}</FooterLink>
          <FooterLink to="/carte">{t.nav.map}</FooterLink>
          <FooterLink to="/a-propos">{t.nav.about}</FooterLink>
          <FooterLink to="/contact">{t.nav.contact}</FooterLink>
        </FooterCol>

        <FooterCol title={t.nav.circuits}>
          {circuits.map((c) => (
            <li key={c.slug}>
              <Link
                to="/circuits/$slug"
                params={{ slug: c.slug }}
                className="text-sm transition-colors hover:text-aqua"
              >
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
      </div>

      <div className="border-t border-white/10">
        <div className="container-tf flex flex-col gap-3 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} TiziFlow. {lang === "fr" ? "Tous droits réservés." : "All rights reserved."}</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/mentions-legales" className="hover:text-aqua">
              {lang === "fr" ? "Mentions légales" : "Legal notice"}
            </Link>
            <Link to="/confidentialite" className="hover:text-aqua">
              {lang === "fr" ? "Politique de confidentialité" : "Privacy policy"}
            </Link>
            <Link to="/cgv" className="hover:text-aqua">
              {lang === "fr" ? "CGV" : "Terms"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">{title}</h3>
      <ul className="mt-4 space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-sm transition-colors hover:text-aqua">
        {children}
      </Link>
    </li>
  );
}
