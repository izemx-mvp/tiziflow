import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { seo } from "@/lib/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { CircuitMap } from "@/components/map/CircuitMap";
import { DemoBanner, Field, SuccessCheck, btn, inputCls, textareaCls } from "@/components/forms/ui";
import { Reveal } from "@/components/brand/Reveal";
import { site, whatsappLink } from "@/config/site";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/contact")({
  head: () =>
    seo({
      title: "Contact — TiziFlow, excursions en moto électrique à Midelt",
      description:
        "Une question sur un circuit, une moto ou une réservation ? Contactez TiziFlow par formulaire, téléphone ou WhatsApp.",
      path: "/contact",
    }),
  component: ContactPage,
});

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Form = { name: string; email: string; phone: string; subject: string; message: string; consent: boolean };
type ContactErrors = Partial<Record<"name" | "email" | "phone" | "message" | "consent", string>>;
const EMPTY: Form = { name: "", email: "", phone: "", subject: "booking", message: "", consent: false };

function ContactPage() {
  const { t, lang } = useT();
  const fr = lang === "fr";
  const reduced = useReducedMotion();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));
  const inv = (k: keyof ContactErrors) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `c-${k}-error` } : {});

  const subjects = [
    { v: "booking", fr: "Réservation", en: "Booking" },
    { v: "circuit", fr: "Choix d'un circuit", en: "Choosing a circuit" },
    { v: "motos", fr: "Motos et équipement", en: "Motorbikes and gear" },
    { v: "group", fr: "Groupe ou entreprise", en: "Group or company" },
    { v: "other", fr: "Autre", en: "Other" },
  ];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: ContactErrors = {};
    if (form.name.trim().length < 2) er.name = fr ? "Indiquez votre nom." : "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = fr ? "Adresse e-mail invalide." : "Invalid email address.";
    if (form.phone && form.phone.replace(/\D/g, "").length < 8) er.phone = fr ? "Numéro incomplet." : "Incomplete number.";
    if (form.message.trim().length < 10) er.message = fr ? "Votre message est trop court (10 caractères minimum)." : "Message too short (10 characters minimum).";
    if (!form.consent) er.consent = fr ? "Merci d'accepter pour que nous puissions vous répondre." : "Please accept so we can reply.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setStatus("loading");
    // DEMO: replace with a real API call later
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("sent");
  };

  const tel = `tel:${site.phone.replace(/[^\d+]/g, "")}`;
  const hoursRaw = (site as unknown as Record<string, unknown>)["hours"];
  const hours =
    typeof hoursRaw === "string"
      ? hoursRaw
      : hoursRaw && typeof hoursRaw === "object" && typeof (hoursRaw as Record<string, unknown>)[lang] === "string"
        ? ((hoursRaw as Record<string, string>)[lang])
        : fr
          ? "Horaires à confirmer"
          : "Opening hours to be confirmed";

  const contacts = [
    { Icon: Phone, label: fr ? "Téléphone" : "Phone", value: site.phone, href: tel },
    { Icon: MessageCircle, label: "WhatsApp", value: fr ? "Réponse rapide" : "Quick reply", href: whatsappLink(), external: true },
    { Icon: Mail, label: "E-mail", value: site.email, href: `mailto:${site.email}` },
    { Icon: MapPin, label: fr ? "Adresse" : "Address", value: site.address },
    { Icon: Clock, label: fr ? "Horaires" : "Hours", value: hours },
  ];

  return (
    <>
      <PageHeader
        title={fr ? "Parlons de votre" : "Let's plan your"}
        flowWord={fr ? "sortie" : "ride"}
        subtitle={
          fr
            ? "Une question sur un circuit, les motos ou une réservation ? Écrivez-nous, l'équipe vous répond."
            : "A question about a circuit, the motorbikes or a booking? Write to us and the team will reply."
        }
        crumbs={[{ label: "Contact" }]}
        image={{
          slot: "circuit-sunset" as never,
          alt: fr
            ? "Silhouette d'un pilote et de sa moto électrique au coucher du soleil dans l'Atlas"
            : "Silhouette of a rider and electric motorbike at sunset in the Atlas",
        }}
        fadeTo="sand"
      />

      <section className="bg-sand pb-20 pt-10 sm:pb-28">
        <div className="container-tf grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-start">
          {/* Form card */}
          <div className="rounded-3xl border border-petrol/10 bg-white p-6 shadow-warm sm:p-8">
            <AnimatePresence mode="wait" initial={false}>
              {status === "sent" ? (
                <motion.div
                  key="sent"
                  initial={reduced ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="py-8 text-center"
                >
                  <SuccessCheck />
                  <h2 className="mt-6 font-display text-2xl font-bold text-petrol">
                    {fr ? `Merci ${form.name.split(" ")[0]}, message bien reçu` : `Thanks ${form.name.split(" ")[0]}, message received`}
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
                    {fr
                      ? "L'équipe TiziFlow vous répondra par e-mail. Pour une réponse plus rapide, écrivez-nous sur WhatsApp."
                      : "The TiziFlow team will reply by email. For a faster answer, message us on WhatsApp."}
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link to="/circuits" className={btn.petrol}>
                      {fr ? "Voir les circuits" : "See circuits"}
                    </Link>
                    <button
                      type="button"
                      className={btn.ghost}
                      onClick={() => {
                        setForm(EMPTY);
                        setStatus("idle");
                      }}
                    >
                      {fr ? "Envoyer un autre message" : "Send another message"}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  noValidate
                  onSubmit={submit}
                  initial={false}
                  exit={reduced ? undefined : { opacity: 0, scale: 0.98 }}
                  className="grid gap-5 sm:grid-cols-2"
                >
                  <div className="sm:col-span-2">
                    <h2 className="font-display text-2xl font-bold text-petrol">
                      {fr ? "Envoyez-nous un message" : "Send us a message"}
                    </h2>
                    <DemoBanner className="mt-3" />
                  </div>
                  <Field label={fr ? "Nom complet" : "Full name"} htmlFor="c-name" error={errors.name}>
                    <input id="c-name" autoComplete="name" className={inputCls} value={form.name} onChange={(e) => set({ name: e.target.value })} {...inv("name")} />
                  </Field>
                  <Field label="E-mail" htmlFor="c-email" error={errors.email}>
                    <input id="c-email" type="email" autoComplete="email" className={inputCls} value={form.email} onChange={(e) => set({ email: e.target.value })} {...inv("email")} />
                  </Field>
                  <Field label={fr ? "Téléphone (facultatif)" : "Phone (optional)"} htmlFor="c-phone" error={errors.phone}>
                    <input id="c-phone" type="tel" autoComplete="tel" placeholder="+212 6 12 34 56 78" className={inputCls} value={form.phone} onChange={(e) => set({ phone: e.target.value })} {...inv("phone")} />
                  </Field>
                  <Field label={fr ? "Sujet" : "Subject"} htmlFor="c-subject">
                    <select id="c-subject" className={inputCls} value={form.subject} onChange={(e) => set({ subject: e.target.value })}>
                      {subjects.map((s) => (
                        <option key={s.v} value={s.v}>
                          {fr ? s.fr : s.en}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Message" htmlFor="c-message" error={errors.message} className="sm:col-span-2">
                    <textarea
                      id="c-message"
                      rows={6}
                      maxLength={1500}
                      className={textareaCls}
                      placeholder={fr ? "Dates envisagées, nombre de personnes, questions…" : "Planned dates, number of people, questions…"}
                      value={form.message}
                      onChange={(e) => set({ message: e.target.value })}
                      {...inv("message")}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <label className="flex items-start gap-3 text-sm text-petrol">
                      <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => set({ consent: e.target.checked })}
                        aria-invalid={!!errors.consent}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--teal)]"
                      />
                      <span>
                        {fr
                          ? "J'accepte que TiziFlow utilise ces informations pour répondre à ma demande ("
                          : "I agree that TiziFlow uses this information to answer my request ("}
                        <Link to="/confidentialite" className="font-semibold text-teal hover:underline">
                          {fr ? "confidentialité" : "privacy"}
                        </Link>
                        ).
                      </span>
                    </label>
                    {errors.consent && (
                      <p role="alert" className="mt-2 text-xs font-medium text-terracotta">
                        {errors.consent}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <button type="submit" disabled={status === "loading"} className={cn(btn.primary, "w-full sm:w-auto")}>
                      {status === "loading" ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                      ) : (
                        <Send className="h-4 w-4" aria-hidden="true" />
                      )}
                      {status === "loading" ? (fr ? "Envoi…" : "Sending…") : fr ? "Envoyer le message" : "Send message"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Contact panel */}
          <aside className="relative overflow-hidden rounded-3xl bg-petrol p-6 text-white topo-texture sm:p-8 lg:sticky lg:top-28">
            <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-aqua/15 blur-3xl" />
            <h2 className="relative font-display text-xl font-bold">{fr ? "Nous joindre" : "Reach us"}</h2>
            <ul className="relative mt-6 space-y-4">
              {contacts.map(({ Icon, label, value, href, external }) => {
                const inner = (
                  <>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-aqua transition-colors group-hover:bg-aqua group-hover:text-petrol">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xs text-white/60">{label}</span>
                      <span className="block break-all text-sm font-semibold">{value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <a
                        href={href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="group flex items-center gap-3">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="relative mt-6 overflow-hidden rounded-2xl border-2 border-white/10">
              <CircuitMap height={200} interactive={false} lang={lang} />
            </div>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(btn.primary, "relative mt-6 w-full")}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {t.home.ctaWhatsapp}
            </a>
          </aside>
        </div>
      </section>

      <section className="bg-white section-y">
        <div className="container-tf max-w-3xl">
          <Reveal>
            <h2 className="h-section text-center text-petrol">{fr ? "Questions fréquentes" : "Frequently asked questions"}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Accordion type="single" collapsible className="mt-10 space-y-3">
              {t.faq.map((f) => (
                <AccordionItem
                  key={f.q}
                  value={f.q}
                  className="rounded-2xl border border-petrol/10 bg-sand/50 px-5 transition-shadow data-[state=open]:bg-white data-[state=open]:shadow-warm"
                >
                  <AccordionTrigger className="text-left font-display font-semibold text-petrol hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>
    </>
  );
}