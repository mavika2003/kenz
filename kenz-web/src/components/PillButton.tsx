import type { ButtonHTMLAttributes } from "react";

const base =
  "rounded-full border text-sm font-semibold transition-all active:scale-[0.98]";

const variants = {
  primary:
    "border-orange bg-black px-4 py-2 text-white hover:bg-orange hover:border-orange",
  secondary:
    "border-black/15 bg-white px-4 py-2 text-black hover:border-orange hover:text-orange-deep",
  large:
    "inline-flex items-center justify-center border-orange bg-black px-7 py-3.5 text-base font-semibold text-white hover:bg-orange hover:shadow-[0_12px_32px_rgba(255,106,0,0.28)]",
} as const;

type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function pillClass(variant: keyof typeof variants = "primary"): string {
  return `${base} ${variants[variant]}`;
}

export default function PillButton({
  variant = "primary",
  className = "",
  ...props
}: PillButtonProps) {
  return <button className={`${pillClass(variant)} ${className}`} {...props} />;
}
