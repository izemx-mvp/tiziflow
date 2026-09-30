import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Clock, Users } from "lucide-react";
import { seo } from "@/lib/seo";
import { btn } from "@/components/forms/ui";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  circuitName,
  findCircuit,
  findMoto,
  formatDate,
  formatMAD,
  motoName,
  slotLabel,
} from "@/lib/catalog";
import { useAuth, useBookings, type BookingStatus } from "@/services/demo-store";

export const Route = createFileRoute("/compte/reservations")({
  head: () =>
    seo({
      title: "Mes réservations — TiziFlow",
      description: "Retrouvez toutes vos réservations de circuits TiziFlow.",
      path: "/compte/reservations",
      noindex: true,
    }),
  component: BookingsPage,
});

const STATUS: Record<BookingStatus, { fr: string; en: string; cls: string }> = {
  upcoming: { fr: "À venir", en: "Upcoming", cls: "bg-teal/10 text-teal" },
  completed: { fr: "Terminée", en: "Completed", cls: "bg-petrol/10 text-petrol" },
  cancelled: { fr: "Annulée", en: "Cancelled", cls: "bg-terracotta/10 text-terracotta" },
};

function BookingsPage() {
  const { lang } = useT();
  const fr = lang === "fr";
  const { user } = useAuth();
  const bookings = useBookings(user?.email);

  return (
    <section className="rounded-3xl border border-petrol/10 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-petrol">
          {fr ? "Mes réservations" : "My bookings"}
        </h2>
        <Link to="/reservation" className={cn(btn.primary, "h-10 text-xs")}>
          {fr ? "Nouvelle réservation" : "New booking"}
        </Link>
      </div>

      {bookings.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          {fr ? "Aucune réservation pour le moment." : "No bookings yet."}
        </p>
      ) : (
        <ul className="mt-6 grid gap-4">
          {bookings.map((b) => {
            const c = findCircuit(b.circuitSlug);
            const st = STATUS[b.status];
            const motoNames = b.motos.map((s) => {
              const m = findMoto(s);
              return m ? motoName(m, lang) : s;
            });
            return (
              <li key={b.id} className="rounded-2xl border border-petrol/10 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-petrol">
                      {c ? circuitName(c, lang) : b.circuitSlug}
                    </p>
                    <p className="text-xs text-muted-foreground">{b.ref}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                      st.cls,
                    )}
                  >
                    {fr ? st.fr : st.en}
                  </span>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-teal" aria-hidden="true" />
                    <dt className="sr-only">Date</dt>
                    <dd className="text-petrol">{formatDate(b.date, lang, true)}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-teal" aria-hidden="true" />
                    <dt className="sr-only">{fr ? "Créneau" : "Time slot"}</dt>
                    <dd className="text-petrol">{slotLabel(b.slot, lang)}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-teal" aria-hidden="true" />
                    <dt className="sr-only">{fr ? "Pilotes et motos" : "Riders and motorbikes"}</dt>
                    <dd className="truncate text-petrol">
                      {b.riders} · {motoNames.join(", ")}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2 lg:justify-end">
                    <dt className="text-muted-foreground">Total</dt>
                    <dd className="font-semibold text-petrol">{formatMAD(b.total, lang)}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
