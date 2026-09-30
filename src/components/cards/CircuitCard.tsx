import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Zap } from "lucide-react";
import { ImageSlot } from "@/components/brand/ImageSlot";
import { AmazighBand, RouteSketch } from "@/components/brand/Motifs";
import { difficultyLabel, type Circuit } from "@/data/circuits";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

export function CircuitCard({ circuit, dark }: { circuit: Circuit; dark?: boolean }) {
  const { t, lang } = useT();
  const diff = difficultyLabel[circuit.difficulty];

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1.5",
        dark ? "border-white/10 bg-white/5 text-white" : "border-petrol/10 bg-white hover:shadow-warm",
      )}
    >
      <div className="relative">
        <span className="absolute inset-x-0 top-0 z-10 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100">
          <AmazighBand height={6} />
        </span>
        <div className="overflow-hidden">
          <ImageSlot
            slot={circuit.image}
            alt={circuit.title[lang]}
            className="aspect-16/10"
            imgClassName="transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className={cn("font-display text-lg font-bold", dark ? "text-white" : "text-petrol")}>
          {circuit.title[lang]}
        </h3>
        <div
          className={cn(
            "mt-3 flex flex-wrap items-center gap-3 text-xs",
            dark ? "text-white/70" : "text-muted-foreground",
          )}
        >
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {circuit.durationLabel[lang]}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {circuit.distanceKm} km
          </span>
          <span className="inline-flex items-center gap-0.5" title={diff[lang]}>
            {[1, 2, 3].map((i) => (
              <Zap
                key={i}
                className={cn(
                  "h-3.5 w-3.5",
                  i <= diff.level ? "text-aqua" : dark ? "text-white/20" : "text-petrol/15",
                )}
                fill={i <= diff.level ? "currentColor" : "none"}
              />
            ))}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <RouteSketch color={circuit.color} />
          <p className={cn("text-xs", dark ? "text-white/70" : "text-muted-foreground")}>
            {t.common.from}{" "}
            <span className="font-display text-base font-bold text-terracotta">
              {circuit.pricePerPerson} MAD
            </span>
          </p>
        </div>
        <Link
          to="/circuits/$slug"
          params={{ slug: circuit.slug }}
          className={cn(
            "mt-5 inline-flex h-10 items-center justify-center rounded-full text-sm font-semibold transition-colors",
            dark
              ? "border border-white/30 text-white hover:bg-white hover:text-petrol"
              : "border border-petrol/20 text-petrol hover:bg-petrol hover:text-white",
          )}
        >
          {lang === "fr" ? "Voir le circuit" : "View circuit"}
        </Link>
      </div>
    </article>
  );
}
