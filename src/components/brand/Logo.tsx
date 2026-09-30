import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png.asset.json";
import { cn } from "@/lib/utils";

/**
 * The logo file has a white background: on dark sections it must sit inside a
 * white pill (variant="pill"). Never invert or recolor it.
 */
export function Logo({
  variant = "plain",
  className,
  imgClassName,
}: {
  variant?: "plain" | "pill";
  className?: string;
  imgClassName?: string;
}) {
  return (
    <Link
      to="/"
      aria-label="TiziFlow — accueil"
      className={cn(
        "inline-flex items-center",
        variant === "pill" && "rounded-xl bg-white p-2 shadow-sm",
        className,
      )}
    >
      <img
        src={logo.url}
        alt="TiziFlow"
        className={cn("h-11 w-auto object-contain", imgClassName)}
        width={120}
        height={124}
      />
    </Link>
  );
}
