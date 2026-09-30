import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { seo } from "@/lib/seo";
import { ImageSlot } from "@/components/brand/ImageSlot";
import { AmazighBand } from "@/components/brand/Motifs";
import { DemoBanner, Field, btn, inputCls } from "@/components/forms/ui";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import { useAuth } from "@/services/demo-store";

export const Route = createFileRoute("/inscription")({
  head: () =>
    seo({
      title: "Créer un compte — TiziFlow",
      description:
        "Créez votre compte TiziFlow pour suivre vos réservations de circuits et vos réclamations.",
      path: "/inscription",
    }),
  component: RegisterPage,
});

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Form = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
};
type Errors = Partial<Record<keyof Form, string>>;
const EMPTY: Form = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirm: "",
};

function RegisterPage() {
  const { lang } = useT();
  const fr = lang === "fr";
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const { user, ready, register } = useAuth();

  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/compte" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user?.email]);

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));
  const inv = (k: keyof Form) =>
    errors[k] ? { "aria-invalid": true, "aria-describedby": `r-${k}-error` } : {};

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Errors = {};
    if (!form.firstName.trim())
      er.firstName = fr ? "Indiquez votre prénom." : "Enter your first name.";
    if (!form.lastName.trim()) er.lastName = fr ? "Indiquez votre nom." : "Enter your last name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      er.email = fr ? "Adresse e-mail invalide." : "Invalid email address.";
    const digits = form.phone.replace(/\D/g, "");
    if (form.phone && (digits.length < 8 || digits.length > 12))
      er.phone = fr ? "Numéro de téléphone invalide." : "Invalid phone number.";
    if (form.password.length < 8)
      er.password = fr ? "8 caractères minimum." : "8 characters minimum.";
    if (form.confirm !== form.password)
      er.confirm = fr ? "Les mots de passe ne correspondent pas." : "Passwords do not match.";
    setErrors(er);
    if (Object.keys(er).length) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const res = register({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email,
      phone: form.phone.trim(),
      password: form.password,
    });
    setLoading(false);
    if (!res.ok)
      setErrors({
        email: fr
          ? "Un compte existe déjà avec cet e-mail."
          : "An account already exists with this email.",
      });
  };

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 pb-16 pt-28 sm:px-8">
        <motion.div
          className="w-full max-w-md"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <h1 className="h-section text-petrol">{fr ? "Créer un compte" : "Create an account"}</h1>
          <p className="mt-2 text-muted-foreground">
            {fr
              ? "Suivez vos circuits réservés et vos réclamations au même endroit."
              : "Follow your booked circuits and claims in one place."}
          </p>
          <DemoBanner className="mt-5" />

          <form noValidate onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field
              label={fr ? "Prénom" : "First name"}
              htmlFor="r-firstName"
              error={errors.firstName}
            >
              <input
                id="r-firstName"
                autoComplete="given-name"
                className={inputCls}
                value={form.firstName}
                onChange={(e) => set({ firstName: e.target.value })}
                {...inv("firstName")}
              />
            </Field>
            <Field label={fr ? "Nom" : "Last name"} htmlFor="r-lastName" error={errors.lastName}>
              <input
                id="r-lastName"
                autoComplete="family-name"
                className={inputCls}
                value={form.lastName}
                onChange={(e) => set({ lastName: e.target.value })}
                {...inv("lastName")}
              />
            </Field>
            <Field label="E-mail" htmlFor="r-email" error={errors.email} className="sm:col-span-2">
              <input
                id="r-email"
                type="email"
                autoComplete="email"
                className={inputCls}
                value={form.email}
                onChange={(e) => set({ email: e.target.value })}
                {...inv("email")}
              />
            </Field>
            <Field
              label={fr ? "Téléphone (facultatif)" : "Phone (optional)"}
              htmlFor="r-phone"
              error={errors.phone}
              className="sm:col-span-2"
            >
              <input
                id="r-phone"
                type="tel"
                autoComplete="tel"
                className={inputCls}
                value={form.phone}
                onChange={(e) => set({ phone: e.target.value })}
                {...inv("phone")}
              />
            </Field>
            <Field
              label={fr ? "Mot de passe" : "Password"}
              htmlFor="r-password"
              error={errors.password}
            >
              <input
                id="r-password"
                type="password"
                autoComplete="new-password"
                className={inputCls}
                value={form.password}
                onChange={(e) => set({ password: e.target.value })}
                {...inv("password")}
              />
            </Field>
            <Field
              label={fr ? "Confirmation" : "Confirm"}
              htmlFor="r-confirm"
              error={errors.confirm}
            >
              <input
                id="r-confirm"
                type="password"
                autoComplete="new-password"
                className={inputCls}
                value={form.confirm}
                onChange={(e) => set({ confirm: e.target.value })}
                {...inv("confirm")}
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className={cn(btn.primary, "w-full sm:col-span-2")}
            >
              {loading ? (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden="true"
                />
              ) : (
                <UserPlus className="h-4 w-4" aria-hidden="true" />
              )}
              {fr ? "Créer mon compte" : "Create my account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {fr ? "Déjà un compte ? " : "Already have an account? "}
            <Link to="/connexion" className="font-semibold text-teal hover:underline">
              {fr ? "Se connecter" : "Sign in"}
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="relative hidden overflow-hidden bg-petrol lg:block">
        <ImageSlot slot={"hero-main" as never} alt="" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--petrol)] via-[color-mix(in_oklab,var(--petrol)_45%,transparent)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="max-w-md font-display text-3xl font-bold leading-tight">
            {fr
              ? "Votre prochain circuit dans l'Atlas vous attend."
              : "Your next Atlas circuit is waiting."}
          </p>
        </div>
        <AmazighBand className="absolute inset-x-0 bottom-0" height={10} />
      </div>
    </div>
  );
}
