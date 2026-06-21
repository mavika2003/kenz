"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type PlannerButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
};

export default function PlannerButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: PlannerButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

  const variants = {
    primary: "bg-orange text-white hover:bg-orange-deep",
    secondary: "bg-white text-ink ring-1 ring-black/10 hover:ring-orange/30",
    ghost: "bg-transparent text-ink/70 hover:bg-black/[0.04]",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
