import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { circuits, type Circuit } from "@/data/circuits";
import { site } from "@/config/site";
import type { Lang } from "@/i18n";

function pinIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:999px;background:#12303A;border:2px solid ${color};box-shadow:0 6px 14px rgba(0,0,0,.25)">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="#17C3AB"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>
    </span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function FitBounds({ selected }: { selected?: Circuit }) {
  const map = useMap();
  useEffect(() => {
    if (!selected) return;
    map.fitBounds(L.latLngBounds(selected.route.map((c) => L.latLng(c[0], c[1]))), {
      padding: [40, 40],
    });
  }, [selected, map]);
  return null;
}

export default function CircuitMapClient({
  visible,
  selectedSlug,
  onSelect,
  lang = "fr",
  interactive = true,
  height = "100%",
}: {
  visible?: string[];
  selectedSlug?: string;
  onSelect?: (slug: string) => void;
  lang?: Lang;
  interactive?: boolean;
  height?: string | number;
}) {
  const shown = circuits.filter((c) => !visible || visible.includes(c.slug));
  const selected = circuits.find((c) => c.slug === selectedSlug);

  return (
    <MapContainer
      center={[site.coords.lat, site.coords.lng]}
      zoom={10}
      scrollWheelZoom={false}
      dragging={interactive}
      style={{ height, width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {shown.map((c) => (
        <Polyline
          key={c.slug}
          positions={c.route}
          pathOptions={{
            color: c.color,
            weight: c.slug === selectedSlug ? 6 : 4,
            opacity: selectedSlug && c.slug !== selectedSlug ? 0.45 : 1,
            dashArray: c.slug === selectedSlug ? "12 10" : undefined,
          }}
          eventHandlers={{ click: () => onSelect?.(c.slug) }}
        />
      ))}
      {shown.flatMap((c) =>
        c.stops.map((s, i) => (
          <Marker key={`${c.slug}-${i}`} position={s.coords} icon={pinIcon(c.color)}>
            <Popup>
              <strong>{s.name[lang]}</strong>
              <br />
              {s.text[lang]}
            </Popup>
          </Marker>
        )),
      )}
      <FitBounds selected={selected} />
    </MapContainer>
  );
}
