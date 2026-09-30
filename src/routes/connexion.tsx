import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/connexion")({
  head: () => seo({ title: "Connexion — TiziFlow", description: "Connexion — TiziFlow, motos électriques et excursions dans l'Atlas à Midelt.", path: "/connexion" }),
  component: () => <ComingSoon fr="Connexion" en="Sign in" />,
});
