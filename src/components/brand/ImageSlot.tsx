import { cn } from "@/lib/utils";

/**
 * Resolves an image from src/assets/generated/<key>.(jpg|png|webp).
 * Falls back to an intentional brand gradient + mountain illustration
 * when the file has not been generated yet, so nothing ever looks broken.
 */
const modules = import.meta.glob("../../assets/generated/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const registry: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [
    path
      .split("/")
      .pop()!
      .replace(/\.(jpg|jpeg|png|webp)$/, ""),
    url,
  ]),
);

export function getImageUrl(slot: string): string | undefined {
  return registry[slot];
}

export function ImageSlot({
  slot,
  alt,
  className,
  imgClassName,
  priority,
}: {
  slot: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const url = getImageUrl(slot);

  return (
    <div className={cn("relative overflow-hidden bg-sand", className)}>
      {url ? (
        <img
          src={url}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      ) : (
        <Fallback alt={alt} />
      )}
    </div>
  );
}

function Fallback({ alt }: { alt: string }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className="relative flex h-full w-full items-end bg-[linear-gradient(160deg,var(--sand)_0%,var(--sand-deep)_45%,color-mix(in_oklab,var(--terracotta)_28%,white)_100%)]"
    >
      <svg viewBox="0 0 400 180" className="h-full w-full" preserveAspectRatio="xMidYMax slice">
        <path
          d="M0 150 L70 88 L120 128 L180 66 L250 140 L310 96 L400 150 Z"
          fill="var(--terracotta)"
          opacity="0.55"
        />
        <path
          d="M0 160 L60 118 L130 152 L200 108 L270 156 L340 122 L400 162 Z"
          fill="var(--petrol)"
          opacity="0.7"
        />
        <path d="M0 180 L400 180 L400 164 L0 172 Z" fill="var(--petrol)" />
        <path
          d="M200 176 C 190 150, 220 140, 206 118 C 196 100, 218 92, 210 74"
          stroke="var(--aqua)"
          strokeWidth="2.5"
          strokeDasharray="6 6"
          fill="none"
        />
      </svg>
    </div>
  );
}
