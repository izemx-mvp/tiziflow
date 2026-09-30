import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => seo({ title: "Contact — TiziFlow", description: "Contact — TiziFlow, motos électriques et excursions dans l'Atlas à Midelt.", path: "/contact" }),
  component: () => <ComingSoon fr="Contact" en="Contact" />,
});
