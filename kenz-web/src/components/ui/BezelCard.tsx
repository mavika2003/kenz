import type { ReactNode } from "react";

type BezelCardProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  dark?: boolean;
};

export default function BezelCard({
  children,
  className = "",
  innerClassName = "",
  dark = false,
}: BezelCardProps) {
  const shell = dark
    ? "bg-white/[0.06] ring-1 ring-white/10"
    : "bg-black/[0.04] ring-1 ring-black/[0.06]";

  const core = dark
    ? "bg-[#1a1714] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
    : "bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]";

  return (
    <div className={`rounded-[2rem] p-1.5 ${shell} ${className}`}>
      <div className={`rounded-[calc(2rem-0.375rem)] ${core} ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
}
