import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/** Amazigh-inspired geometric band (chevrons + diamonds), like the logo band. */
export function AmazighBand({
  className,
  height = 14,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <div
      className={cn("w-full", className)}
      style={{ height }}
      aria-hidden="true"
      role="presentation"
    >
      <svg width="100%" height={height} viewBox="0 0 96 16" preserveAspectRatio="none">
        <defs>
          <pattern id="amazigh" width="48" height="16" patternUnits="userSpaceOnUse">
            <rect width="48" height="16" fill="var(--terracotta)" />
            <path d="M0 8 L6 2 L12 8 L6 14 Z" fill="#fff" />
            <path d="M12 8 L18 2 L24 8 L18 14 Z" fill="var(--teal)" />
            <path d="M24 8 L30 2 L36 8 L30 14 Z" fill="#fff" />
            <path d="M36 8 L42 2 L48 8 L42 14 Z" fill="var(--petrol)" />
          </pattern>
        </defs>
        <rect width="96" height="16" fill="url(#amazigh)" />
      </svg>
    </div>
  );
}

/** Layered mountain silhouettes with subtle parallax. */
export function MountainLayers({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 80]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-x-0 bottom-0", className)}
    >
      <motion.svg
        style={{ y: y1 }}
        viewBox="0 0 1440 220"
        className="absolute inset-x-0 bottom-0 w-full"
        preserveAspectRatio="none"
      >
        <path
          d="M0 200 L180 110 L320 170 L520 70 L720 180 L900 100 L1100 175 L1280 120 L1440 190 L1440 220 L0 220 Z"
          fill="var(--terracotta)"
          opacity="0.35"
        />
      </motion.svg>
      <motion.svg
        style={{ y: y2 }}
        viewBox="0 0 1440 200"
        className="absolute inset-x-0 bottom-0 w-full"
        preserveAspectRatio="none"
      >
        <path
          d="M0 180 L200 120 L400 175 L600 105 L820 185 L1040 130 L1240 185 L1440 140 L1440 200 L0 200 Z"
          fill="var(--petrol)"
          opacity="0.55"
        />
      </motion.svg>
      <svg viewBox="0 0 1440 140" className="relative w-full" preserveAspectRatio="none">
        <path
          d="M0 120 L160 80 L340 125 L540 78 L760 130 L980 90 L1200 132 L1440 96 L1440 140 L0 140 Z"
          fill="var(--petrol)"
        />
      </svg>
    </div>
  );
}

/** Winding road line that draws itself with scroll progress, bolt travelling along it. */
export function RoadLine({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const pathLength = useTransform(scrollYProgress, [0, 0.9], [0, 1]);

  return (
    <div ref={ref} aria-hidden="true" className={cn("pointer-events-none", className)}>
      <svg viewBox="0 0 120 900" className="h-full w-full" preserveAspectRatio="none" fill="none">
        <motion.path
          d="M60 0 C 10 120, 110 220, 60 340 C 10 460, 110 560, 60 680 C 20 780, 90 840, 60 900"
          stroke="var(--petrol)"
          strokeOpacity="0.18"
          strokeWidth="10"
          strokeLinecap="round"
          style={{ pathLength: reduced ? 1 : pathLength }}
        />
        <motion.path
          d="M60 0 C 10 120, 110 220, 60 340 C 10 460, 110 560, 60 680 C 20 780, 90 840, 60 900"
          stroke="var(--aqua)"
          strokeWidth="2"
          strokeDasharray="10 14"
          strokeLinecap="round"
          style={{ pathLength: reduced ? 1 : pathLength }}
        />
      </svg>
    </div>
  );
}

/** Small route sketch used on circuit cards. */
export function RouteSketch({ color = "var(--aqua)" }: { color?: string }) {
  return (
    <svg viewBox="0 0 120 40" className="h-8 w-28" aria-hidden="true" fill="none">
      <path
        d="M4 32 C 26 4, 40 36, 62 18 C 82 2, 96 30, 116 10"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="4" cy="32" r="3.5" fill={color} />
      <circle cx="116" cy="10" r="3.5" fill={color} />
    </svg>
  );
}
