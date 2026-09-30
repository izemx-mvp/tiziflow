import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Link, type LinkProps } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export const tfButton = cva(
  "group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-terracotta text-white shadow-warm hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-14px_color-mix(in_oklab,var(--terracotta)_70%,transparent)]",
        outlineLight:
          "border border-white/70 text-white hover:bg-white hover:text-petrol hover:-translate-y-0.5",
        outlinePetrol:
          "border border-petrol/25 text-petrol hover:bg-petrol hover:text-white hover:-translate-y-0.5",
        petrol: "bg-petrol text-white hover:-translate-y-0.5 hover:bg-petrol-deep",
        teal: "bg-teal text-white hover:-translate-y-0.5 hover:bg-aqua",
        white: "bg-white text-petrol hover:-translate-y-0.5 shadow-warm",
        ghost: "text-petrol hover:bg-sand",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-13 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Common = VariantProps<typeof tfButton> & {
  className?: string;
  children: ReactNode;
  withArrow?: boolean;
};

export function TfButton({
  variant,
  size,
  className,
  children,
  withArrow,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(tfButton({ variant, size }), className)} {...rest}>
      {children}
      {withArrow && (
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      )}
    </button>
  );
}

export function TfLink({
  variant,
  size,
  className,
  children,
  withArrow,
  ...rest
}: Common & LinkProps) {
  return (
    <Link className={cn(tfButton({ variant, size }), className)} {...(rest as LinkProps)}>
      {children}
      {withArrow && (
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      )}
    </Link>
  );
}

export function TfAnchor({
  variant,
  size,
  className,
  children,
  withArrow,
  ...rest
}: Common & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cn(tfButton({ variant, size }), className)} {...rest}>
      {children}
      {withArrow && (
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      )}
    </a>
  );
}
