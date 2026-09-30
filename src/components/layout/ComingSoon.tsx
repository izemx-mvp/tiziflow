import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n";

export function ComingSoon({ fr, en }: { fr: string; en: string }) {
  const { lang } = useI18n();
  return (
    <section className="bg-sand section-y">
      <div className="container-tf max-w-2xl text-center">
        <h1 className="h-section text-petrol">{lang === "fr" ? fr : en}</h1>
        <p className="mt-4 text-muted-foreground">
          {lang === "fr" ? "Cette page arrive très bientôt." : "This page is coming very soon."}
        </p>
        <Link to="/" className="mt-8 inline-flex rounded-full bg-terracotta px-6 py-3 font-semibold text-primary-foreground">
          {lang === "fr" ? "Retour à l'accueil" : "Back to home"}
        </Link>
      </div>
    </section>
  );
}
