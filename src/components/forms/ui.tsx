import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Info, Minus, Plus } from "lucide-react";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

export const inputCls =
  "h-12 w-full rounded-xl border border-petrol/15 bg-white px-4 text-sm text-petrol placeholder:text-petrol/40 outline-none transition focus:border-teal focus:ring-4 focus:ring-teal/15 aria-[invalid=true]:border-terracotta aria-[invalid=true]:ring-terracotta/15";

export const textareaCls = cn(inputCls, "h-auto min-h-[120px] resize-y py-3");

const btnBase =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export const btn = {
  primary: cn(
    btnBase,
    "bg-terracotta text-white hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_var(--terracotta)]",
  ),
  petrol: cn(btnBase, "bg-petrol text-white hover:-translate-y-0.5 hover:shadow-lift"),
  ghost: cn(
    btnBase,
    "border border-petrol/15 bg-white text-petrol hover:border-petrol hover:bg-petrol hover:text-white",
  ),
};

export function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-petrol">
        {label}
      </label>
      {children}
      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p
            key="error"
            id={`${htmlFor}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs font-medium text-terracotta"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <p key="hint" className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mt-3 text-sm font-medium text-terracotta">
      {children}
    </p>
  );
}

export function DemoBanner({ className }: { className?: string }) {
  const { lang } = useT();
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-2xl border border-teal/25 bg-teal/5 px-4 py-2.5 text-xs font-medium text-petrol",
        className,
      )}
    >
      <Info className="mt-px h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
      {lang === "fr"
        ? "Mode démonstration : aucune donnée n'est envoyée et aucun paiement réel n'est effectué."
        : "Demo mode: no data is sent and no real payment is made."}
    </p>
  );
}

export function SuccessCheck({ size = 84 }: { size?: number }) {
  const reduced = useReducedMotion();
  return (
    <svg width={size} height={size} viewBox="0 0 84 84" aria-hidden="true" className="mx-auto">
      <circle cx="42" cy="42" r="38" fill="color-mix(in oklab, var(--teal) 10%, transparent)" />
      <motion.circle
        cx="42"
        cy="42"
        r="38"
        fill="none"
        stroke="var(--teal)"
        strokeWidth={4}
        initial={{ pathLength: reduced ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <motion.path
        d="M27 43 L38 54 L58 32"
        fill="none"
        stroke="var(--teal)"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduced ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
      />
    </svg>
  );
}

export function Counter({
  value,
  min,
  max,
  onChange,
  labelMinus,
  labelPlus,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  labelMinus: string;
  labelPlus: string;
}) {
  const b =
    "flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-30";
  return (
    <div className="flex h-12 items-center gap-2 rounded-full border border-petrol/15 bg-white px-1">
      <button
        type="button"
        aria-label={labelMinus}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={b}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        className="min-w-[2ch] text-center font-display text-lg font-bold tabular-nums text-petrol"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={labelPlus}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={b}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
