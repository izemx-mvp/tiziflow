import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className,
  ...rest
}: { children: ReactNode; delay?: number; className?: string } & HTMLMotionProps<"div">) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  step = 0.09,
}: {
  children: ReactNode;
  className?: string;
  step?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: step } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduced ? {} : { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Heading with one key word in teal italic + a brush underline that draws in. */
export function FlowHeading({
  before,
  word,
  after,
  className,
  as: Tag = "h2",
}: {
  before?: string;
  word: string;
  after?: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const reduced = useReducedMotion();
  return (
    <Tag className={className}>
      {before ? `${before} ` : ""}
      <span className="relative inline-block flow-word">
        {word}
        <motion.svg
          viewBox="0 0 120 12"
          preserveAspectRatio="none"
          className="absolute -bottom-1 left-0 h-2.5 w-full"
          aria-hidden="true"
        >
          <motion.path
            d="M2 8 C 30 2, 70 11, 118 4"
            stroke="var(--teal)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            initial={reduced ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
          />
        </motion.svg>
      </span>
      {after ? ` ${after}` : ""}
    </Tag>
  );
}

export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <span>{value}{suffix}</span>;
  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.span
        initial={{ "--n": 0 } as never}
        whileInView={{ "--n": value } as never}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      >
        <Counter value={value} />
      </motion.span>
      {suffix}
    </motion.span>
  );
}

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1500);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return <span ref={ref}>{n}</span>;
}
