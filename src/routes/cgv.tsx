import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/cgv")({
  head: () =>
    seo({
      title: "Conditions générales — TiziFlow",
      description:
        "Conditions générales — TiziFlow, motos électriques et excursions dans l'Atlas à Midelt.",
      path: "/cgv",
    }),
  component: () => <ComingSoon fr="Conditions générales" en="Terms and conditions" />,
});
