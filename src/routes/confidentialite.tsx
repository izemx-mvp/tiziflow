import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/confidentialite")({
  head: () =>
    seo({
      title: "Confidentialité — TiziFlow",
      description:
        "Confidentialité — TiziFlow, motos électriques et excursions dans l'Atlas à Midelt.",
      path: "/confidentialite",
    }),
  component: () => <ComingSoon fr="Confidentialité" en="Privacy" />,
});
