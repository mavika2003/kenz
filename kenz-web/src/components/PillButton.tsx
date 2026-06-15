import type { ButtonHTMLAttributes } from "react";

const base =
  "rounded-full border-2 border-black text-sm font-semibold transition-colors";

const variants = {
  primary:
    "bg-black px-4 py-2 text-white hover:bg-orange hover:border-orange",
  secondary:
    "bg-white px-4 py-2 text-black hover:bg-paper",
  large:
    "inline-flex items-center justify-center bg-black px-7 py-3.5 text-base font-bold text-white shadow-[4px_4px_0_#ff6a00] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#ff6a00]",
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
