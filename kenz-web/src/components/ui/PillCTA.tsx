import Link from "next/link";
import type { ReactNode } from "react";

type PillCTAProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "dark";
  className?: string;
};

export default function PillCTA({
  href,
  children,
  variant = "primary",
  className = "",
}: PillCTAProps) {
  const variants = {
    primary: "bg-orange text-white hover:bg-orange-deep",
    ghost: "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20",
    dark: "bg-[#141210] text-white hover:bg-orange",
  };

  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${variants[variant]} ${className}`}
    >
      <span>{children}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-xs transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105 dark:bg-white/10">
        ↗
      </span>
    </Link>
  );
}
