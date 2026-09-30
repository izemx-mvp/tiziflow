import { Info } from "lucide-react";
import { useT } from "@/i18n";

export function DemoBanner({ className }: { className?: string }) {
  const { t } = useT();
  return (
    <div
      role="note"
      className={`flex items-start gap-2 rounded-xl border border-terracotta/25 bg-sand px-4 py-3 text-xs text-slate-ink ${className ?? ""}`}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
      <span>{t.common.demoBanner}</span>
    </div>
  );
}
