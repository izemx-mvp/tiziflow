import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/a-propos")({
  head: () => seo({ title: "À propos — TiziFlow", description: "À propos — TiziFlow, motos électriques et excursions dans l'Atlas à Midelt.", path: "/a-propos" }),
  component: () => <ComingSoon fr="À propos" en="About" />,
});
