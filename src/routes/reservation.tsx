import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/reservation")({
  validateSearch: (s: Record<string, unknown>): { type?: "moto" | "circuit"; id?: string; date?: string; people?: number } => ({
    type: s["type"] === "circuit" ? ("circuit" as const) : s["type"] === "moto" ? ("moto" as const) : undefined,
    id: typeof s["id"] === "string" ? s["id"] : undefined,
    date: typeof s["date"] === "string" ? s["date"] : undefined,
    people: typeof s["people"] === "number" ? s["people"] : undefined,
  }),
  head: () => seo({ title: "Réservation — TiziFlow", description: "Réservation — TiziFlow, motos électriques et excursions dans l'Atlas à Midelt.", path: "/reservation" }),
  component: () => <ComingSoon fr="Réservation" en="Booking" />,
});
