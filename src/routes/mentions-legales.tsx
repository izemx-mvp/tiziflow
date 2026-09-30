import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/mentions-legales")({
  head: () =>
    seo({
      title: "Mentions légales — TiziFlow",
      description:
        "Mentions légales — TiziFlow, motos électriques et excursions dans l'Atlas à Midelt.",
      path: "/mentions-legales",
    }),
  component: () => <ComingSoon fr="Mentions légales" en="Legal notice" />,
});
