import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/compte")({
  head: () => seo({ title: "Mon compte — TiziFlow", description: "Mon compte — TiziFlow, motos électriques et excursions dans l'Atlas à Midelt.", path: "/compte" }),
  component: () => <ComingSoon fr="Mon compte" en="My account" />,
});
