import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { seo } from "@/lib/seo";
import { Field, btn, inputCls, textareaCls } from "@/components/forms/ui";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/catalog";
import {
  claimsApi,
  useAuth,
  useBookings,
  useClaims,
  type ClaimStatus,
} from "@/services/demo-store";

export const Route = createFileRoute("/compte/reclamations")({
  head: () =>
    seo({
      title: "Mes réclamations — TiziFlow",
      description: "Suivez vos réclamations et envoyez-en une nouvelle.",
      path: "/compte/reclamations",
      noindex: true,
    }),
  component: ClaimsPage,
});

const STATUS: Record<ClaimStatus, { fr: string; en: string; cls: string }> = {
  received: { fr: "Reçue", en: "Received", cls: "bg-aqua/15 text-petrol" },
  in_progress: { fr: "En cours", en: "In progress", cls: "bg-terracotta/10 text-terracotta" },
  answered: { fr: "Réponse reçue", en: "Answered", cls: "bg-teal/10 text-teal" },
  closed: { fr: "Clôturée", en: "Closed", cls: "bg-petrol/10 text-petrol" },
};

const CATEGORIES = [
  { v: "booking", fr: "Réservation", en: "Booking" },
  { v: "moto", fr: "Moto ou équipement", en: "Motorbike or gear" },
  { v: "service", fr: "Service sur place", en: "On-site service" },
  { v: "payment", fr: "Paiement", en: "Payment" },
  { v: "other", fr: "Autre", en: "Other" },
];

type Errors = Partial<Record<"subject" | "message", string>>;
const EMPTY = { bookingRef: "", category: "booking", subject: "", message: "" };

function ClaimsPage() {
  const { lang } = useT();
  const fr = lang === "fr";
  const { user } = useAuth();
  const claims = useClaims(user?.email);
  const bookings = useBookings(user?.email);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sentRef, setSentRef] = useState("");

  if (!user) return null;

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const inv = (k: keyof Errors) =>
    errors[k] ? { "aria-invalid": true, "aria-describedby": `cl-${k}-error` } : {};

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Errors = {};
    if (form.subject.trim().length < 3)
      er.subject = fr
        ? "Indiquez un objet (3 caractères minimum)."
        : "Enter a subject (3 characters minimum).";
    if (form.message.trim().length < 10)
      er.message = fr
        ? "Décrivez votre demande (10 caractères minimum)."
        : "Describe your request (10 characters minimum).";
    setErrors(er);
    if (Object.keys(er).length) return;
    const claim = claimsApi.add({
      ownerEmail: user.email,
      bookingRef: form.bookingRef || undefined,
      category: form.category,
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    setForm(EMPTY);
    setSentRef(claim.ref);
  };

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-petrol/10 bg-white p-6">
        <h2 className="font-display text-xl font-bold text-petrol">
          {fr ? "Mes réclamations" : "My claims"}
        </h2>
        {claims.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {fr ? "Aucune réclamation." : "No claims."}
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-petrol/10">
            {claims.map((c) => {
              const st = STATUS[c.status];
              return (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-petrol">{c.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.ref}
                      {c.bookingRef ? ` · ${c.bookingRef}` : ""} · {formatDate(c.updatedAt, lang)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                      st.cls,
                    )}
                  >
                    {fr ? st.fr : st.en}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-petrol/10 bg-white p-6">
        <h2 className="font-display text-xl font-bold text-petrol">
          {fr ? "Faire une réclamation" : "Submit a claim"}
        </h2>
        <form noValidate onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label={fr ? "Réservation concernée" : "Related booking"} htmlFor="cl-booking">
            <select
              id="cl-booking"
              className={inputCls}
              value={form.bookingRef}
              onChange={(e) => set({ bookingRef: e.target.value })}
            >
              <option value="">{fr ? "Aucune" : "None"}</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.ref}>
                  {b.ref} · {formatDate(b.date, lang)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={fr ? "Catégorie" : "Category"} htmlFor="cl-category">
            <select
              id="cl-category"
              className={inputCls}
              value={form.category}
              onChange={(e) => set({ category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c.v} value={c.v}>
                  {fr ? c.fr : c.en}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label={fr ? "Objet" : "Subject"}
            htmlFor="cl-subject"
            error={errors.subject}
            className="sm:col-span-2"
          >
            <input
              id="cl-subject"
              className={inputCls}
              value={form.subject}
              onChange={(e) => set({ subject: e.target.value })}
              {...inv("subject")}
            />
          </Field>
          <Field
            label="Message"
            htmlFor="cl-message"
            error={errors.message}
            className="sm:col-span-2"
          >
            <textarea
              id="cl-message"
              className={textareaCls}
              value={form.message}
              onChange={(e) => set({ message: e.target.value })}
              {...inv("message")}
            />
          </Field>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button type="submit" className={btn.primary}>
              {fr ? "Envoyer" : "Send"}
            </button>
            {sentRef && (
              <p role="status" className="text-sm font-medium text-teal">
                {fr ? `Réclamation ${sentRef} enregistrée.` : `Claim ${sentRef} submitted.`}
              </p>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
