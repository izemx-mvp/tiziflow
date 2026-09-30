import { lazy, Suspense, useEffect, useState } from "react";
import type { Lang } from "@/i18n";

const Client = lazy(() => import("./CircuitMapView"));

type Props = {
  visible?: string[];
  selectedSlug?: string;
  onSelect?: (slug: string) => void;
  lang?: Lang;
  interactive?: boolean;
  height?: string | number;
};

/** Browser-only map: Leaflet touches window on import, so load it after hydration. */
export function CircuitMap(props: Props) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated)
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-sand-deep text-sm text-muted-foreground"
        style={{ height: props.height }}
      >
        Chargement de la carte…
      </div>
    );

  return (
    <Suspense
      fallback={
        <div
          className="flex h-full w-full items-center justify-center bg-sand-deep text-sm text-muted-foreground"
          style={{ height: props.height }}
        >
          Chargement de la carte…
        </div>
      }
    >
      <Client {...props} />
    </Suspense>
  );
}
