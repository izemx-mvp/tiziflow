import { Link } from "@tanstack/react-router";
import { BatteryCharging, Gauge, Plug } from "lucide-react";
import { ImageSlot } from "@/components/brand/ImageSlot";
import { AmazighBand } from "@/components/brand/Motifs";
import { TfLink } from "@/components/brand/Buttons";
import { motoCategoryLabel, type Moto } from "@/data/motos";
import { useT } from "@/i18n";

export function MotoCard({ moto }: { moto: Moto }) {
  const { t, lang } = useT();
  return (
    <article className="group overflow-hidden rounded-2xl border border-petrol/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-warm">
      <div className="relative">
        <span className="absolute inset-x-0 top-0 z-10 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100">
          <AmazighBand height={6} />
        </span>
        <div className="overflow-hidden">
          <ImageSlot
            slot={moto.images[0]}
            alt={`${moto.name} — moto électrique TiziFlow`}
            className="aspect-4/3"
            imgClassName="transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-petrol">
          {motoCategoryLabel[moto.category][lang]}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl font-bold text-petrol">{moto.name}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip icon={<BatteryCharging className="h-3.5 w-3.5" />} label={`${moto.specs.autonomyKm} km`} />
          <Chip icon={<Gauge className="h-3.5 w-3.5" />} label={`${moto.specs.topSpeedKmh} km/h`} />
          <Chip icon={<Plug className="h-3.5 w-3.5" />} label={`${moto.specs.chargeHours} h`} />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {t.common.from}{" "}
          <span className="font-display text-lg font-bold text-terracotta">
            {moto.pricePerDay} MAD
          </span>{" "}
          {t.common.perDay}
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            to="/motos/$slug"
            params={{ slug: moto.slug }}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-petrol/20 text-sm font-semibold text-petrol transition-colors hover:bg-petrol hover:text-white"
          >
            {t.common.seeDetails}
          </Link>
          <TfLink
            to="/reservation"
            search={{ type: "moto", id: moto.slug }}
            variant="primary"
            size="md"
            className="flex-1"
          >
            {t.common.book}
          </TfLink>
        </div>
      </div>
    </article>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-petrol">
      {icon}
      {label}
    </span>
  );
}
