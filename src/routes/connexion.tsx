import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, LogIn, Sparkles } from "lucide-react";
import { seo } from "@/lib/seo";
import { ImageSlot } from "@/components/brand/ImageSlot";
import { AmazighBand } from "@/components/brand/Motifs";
import { DemoBanner, Field, btn, inputCls } from "@/components/forms/ui";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import { DEMO_EMAIL, DEMO_PASSWORD, useAuth } from "@/services/demo-store";

export const Route = createFileRoute("/connexion")({
  // Only internal paths are accepted as redirect targets
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => ({
    redirect:
      typeof s["redirect"] === "string" &&
      s["redirect"].startsWith("/") &&
      !s["redirect"].startsWith("//")
        ? s["redirect"]
        : undefined,
  }),
  head: () =>
    seo({
      title: "Connexion — TiziFlow",
      description:
        "Connectez-vous à votre espace TiziFlow pour retrouver vos réservations de circuits et vos réclamations.",
      path: "/connexion",
    }),
  component: LoginPage,
});

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function LoginPage() {
  const { lang } = useT();
  const fr = lang === "fr";
  const reduced = useReducedMotion();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user, ready, login } = useAuth();

  const [mode, setMode] = useState<"login" | "forgot" | "forgot-sent">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const target = (redirect ?? "/compte") as "/compte";

  useEffect(() => {
    if (ready && user) navigate({ to: target });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user?.email]);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError(
        fr ? "Renseignez votre e-mail et votre mot de passe." : "Enter your email and password.",
      );
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const u = login(email, password);
    setLoading(false);
    if (!u) setError(fr ? "E-mail ou mot de passe incorrect." : "Incorrect email or password.");
  };

  const onForgot = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(fr ? "Adresse e-mail invalide." : "Invalid email address.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setMode("forgot-sent");
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError("");
  };

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 pb-16 pt-28 sm:px-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" initial={false}>
            {mode === "login" && (
              <motion.div
                key="login"
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <h1 className="h-section text-petrol">{fr ? "Connexion" : "Sign in"}</h1>
                <p className="mt-2 text-muted-foreground">
                  {fr
                    ? "Retrouvez vos circuits réservés et suivez vos réclamations."
                    : "Find your booked circuits and follow your claims."}
                </p>
                <DemoBanner className="mt-5" />

                <button
                  type="button"
                  onClick={fillDemo}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-teal/40 bg-teal/5 px-4 py-3 text-sm font-semibold text-petrol transition hover:border-teal hover:bg-teal/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                >
                  <Sparkles className="h-4 w-4 text-teal" aria-hidden="true" />
                  {fr ? "Utiliser le compte démo" : "Use the demo account"}
                </button>

                <form noValidate onSubmit={onLogin} className="mt-6 grid gap-5">
                  <Field label="E-mail" htmlFor="login-email">
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      className={inputCls}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={!!error}
                    />
                  </Field>
                  <Field label={fr ? "Mot de passe" : "Password"} htmlFor="login-password">
                    <div className="relative">
                      <input
                        id="login-password"
                        type={show ? "text" : "password"}
                        autoComplete="current-password"
                        className={cn(inputCls, "pr-12")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-invalid={!!error}
                      />
                      <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        aria-label={
                          show
                            ? fr
                              ? "Masquer le mot de passe"
                              : "Hide password"
                            : fr
                              ? "Afficher le mot de passe"
                              : "Show password"
                        }
                        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-petrol/60 transition hover:bg-sand hover:text-petrol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                      >
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setMode("forgot");
                      }}
                      className="text-sm font-semibold text-teal hover:underline"
                    >
                      {fr ? "Mot de passe oublié ?" : "Forgot password?"}
                    </button>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        role="alert"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl bg-terracotta/10 px-4 py-3 text-sm font-medium text-petrol"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button type="submit" disabled={loading} className={cn(btn.primary, "w-full")}>
                    {loading ? (
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                        aria-hidden="true"
                      />
                    ) : (
                      <LogIn className="h-4 w-4" aria-hidden="true" />
                    )}
                    {fr ? "Se connecter" : "Sign in"}
                  </button>
                </form>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                  {fr ? "Pas encore de compte ? " : "No account yet? "}
                  <Link to="/inscription" className="font-semibold text-teal hover:underline">
                    {fr ? "Créer un compte" : "Create an account"}
                  </Link>
                </p>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {fr
                    ? "Vous pouvez aussi réserver sans compte, en invité."
                    : "You can also book without an account, as a guest."}
                </p>
              </motion.div>
            )}

            {mode !== "login" && (
              <motion.div
                key="forgot"
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMode("login");
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-petrol/70 hover:text-petrol"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  {fr ? "Retour à la connexion" : "Back to sign in"}
                </button>
                <h1 className="mt-6 h-section text-petrol">
                  {fr ? "Mot de passe oublié" : "Forgot password"}
                </h1>

                {mode === "forgot" ? (
                  <form noValidate onSubmit={onForgot} className="mt-6 grid gap-5">
                    <p className="text-muted-foreground">
                      {fr
                        ? "Indiquez votre e-mail, nous vous enverrons un lien de réinitialisation."
                        : "Enter your email and we'll send you a reset link."}
                    </p>
                    <Field label="E-mail" htmlFor="forgot-email" error={error}>
                      <input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        className={inputCls}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-invalid={!!error}
                      />
                    </Field>
                    <button type="submit" disabled={loading} className={cn(btn.petrol, "w-full")}>
                      {loading && (
                        <span
                          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                          aria-hidden="true"
                        />
                      )}
                      {fr ? "Envoyer le lien" : "Send the link"}
                    </button>
                  </form>
                ) : (
                  <p role="status" className="mt-6 rounded-2xl bg-teal/10 p-5 text-sm text-petrol">
                    {fr
                      ? `Si un compte existe pour ${email}, un lien de réinitialisation serait envoyé (mode démo : aucun e-mail n'est envoyé).`
                      : `If an account exists for ${email}, a reset link would be sent (demo mode: no email is sent).`}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-petrol lg:block">
        <ImageSlot slot={"hero-main" as never} alt="" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--petrol)] via-[color-mix(in_oklab,var(--petrol)_45%,transparent)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="max-w-md font-display text-3xl font-bold leading-tight">
            {fr
              ? "Votre prochain circuit dans l'Atlas vous attend."
              : "Your next Atlas circuit is waiting."}
          </p>
          <p className="mt-3 max-w-sm text-white/75">
            {fr
              ? "Réservations, motos choisies et réclamations : tout est au même endroit."
              : "Bookings, chosen motorbikes and claims, all in one place."}
          </p>
        </div>
        <AmazighBand className="absolute inset-x-0 bottom-0" height={10} />
      </div>
    </div>
  );
}
