import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { MountainLayers } from "@/components/brand/Motifs";

export function PageHeader({
  title,
  flowWord,
  subtitle,
  crumbs = [],
}: {
  title: string;
  flowWord?: string;
  subtitle?: string;
  crumbs?: { label: string; to?: string }[];
}) {
  return (
    <section className="relative overflow-hidden bg-petrol topo-texture pb-24 pt-32 text-white">
      <MountainLayers className="opacity-60" />
      <div className="container-tf relative z-10">
        <nav aria-label="Fil d'ariane" className="flex flex-wrap items-center gap-1 text-xs text-white/70">
          <Link to="/" className="hover:text-aqua">
            Accueil
          </Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              {c.to ? (
                <Link to={c.to} className="hover:text-aqua">
                  {c.label}
                </Link>
              ) : (
                <span className="text-white">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="mt-4 h-section max-w-3xl">
          {title} {flowWord && <span className="flow-word">{flowWord}</span>}
        </h1>
        {subtitle && <p className="mt-4 max-w-2xl text-white/75">{subtitle}</p>}
      </div>
    </section>
  );
}
