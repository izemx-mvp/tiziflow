import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { seo } from "@/lib/seo";
import { Field, btn, inputCls } from "@/components/forms/ui";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import { useAuth } from "@/services/demo-store";

export const Route = createFileRoute("/compte/profil")({
  head: () =>
    seo({
      title: "Mon profil — TiziFlow",
      description: "Modifiez les informations de votre compte TiziFlow.",
      path: "/compte/profil",
      noindex: true,
    }),
  component: ProfilePage,
});

type Errors = Partial<Record<"firstName" | "lastName" | "phone", string>>;

function ProfilePage() {
  const { lang } = useT();
  const fr = lang === "fr";
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) setForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  if (!user) return null;

  const set = (patch: Partial<typeof form>) => {
    setSaved(false);
    setForm((f) => ({ ...f, ...patch }));
  };
  const inv = (k: keyof Errors) =>
    errors[k] ? { "aria-invalid": true, "aria-describedby": `p-${k}-error` } : {};

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Errors = {};
    if (!form.firstName.trim())
      er.firstName = fr ? "Indiquez votre prénom." : "Enter your first name.";
    if (!form.lastName.trim()) er.lastName = fr ? "Indiquez votre nom." : "Enter your last name.";
    const digits = form.phone.replace(/\D/g, "");
    if (form.phone && (digits.length < 8 || digits.length > 12))
      er.phone = fr ? "Numéro de téléphone invalide." : "Invalid phone number.";
    setErrors(er);
    if (Object.keys(er).length) return;
    updateProfile({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
    });
    setSaved(true);
  };

  return (
    <section className="rounded-3xl border border-petrol/10 bg-white p-6">
      <h2 className="font-display text-xl font-bold text-petrol">
        {fr ? "Mon profil" : "My profile"}
      </h2>
      <form noValidate onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label={fr ? "Prénom" : "First name"} htmlFor="p-firstName" error={errors.firstName}>
          <input
            id="p-firstName"
            autoComplete="given-name"
            className={inputCls}
            value={form.firstName}
            onChange={(e) => set({ firstName: e.target.value })}
            {...inv("firstName")}
          />
        </Field>
        <Field label={fr ? "Nom" : "Last name"} htmlFor="p-lastName" error={errors.lastName}>
          <input
            id="p-lastName"
            autoComplete="family-name"
            className={inputCls}
            value={form.lastName}
            onChange={(e) => set({ lastName: e.target.value })}
            {...inv("lastName")}
          />
        </Field>
        <Field
          label="E-mail"
          htmlFor="p-email"
          hint={fr ? "L'e-mail ne peut pas être modifié." : "Email cannot be changed."}
        >
          <input
            id="p-email"
            type="email"
            className={cn(inputCls, "bg-sand")}
            value={user.email}
            readOnly
          />
        </Field>
        <Field label={fr ? "Téléphone" : "Phone"} htmlFor="p-phone" error={errors.phone}>
          <input
            id="p-phone"
            type="tel"
            autoComplete="tel"
            className={inputCls}
            value={form.phone}
            onChange={(e) => set({ phone: e.target.value })}
            {...inv("phone")}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <button type="submit" className={btn.petrol}>
            {fr ? "Enregistrer" : "Save"}
          </button>
          {saved && (
            <p role="status" className="text-sm font-medium text-teal">
              {fr ? "Profil mis à jour." : "Profile updated."}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
