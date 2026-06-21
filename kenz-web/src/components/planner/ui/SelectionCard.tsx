"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { easePremium } from "./theme";

type SelectionCardProps = {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  badge?: string;
  meta?: ReactNode;
  index?: number;
  className?: string;
};

export default function SelectionCard({
  selected,
  onClick,
  title,
  description,
  badge,
  meta,
  index = 0,
  className = "",
}: SelectionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: easePremium }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative w-full rounded-[1.25rem] p-1.5 text-left transition-all duration-500 ${
        selected
          ? "bg-orange/15 ring-2 ring-orange/35"
          : "bg-black/[0.03] ring-1 ring-black/[0.06] hover:ring-orange/25"
      } ${className}`}
    >
      <div className="rounded-[calc(1.25rem-0.375rem)] bg-white p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {badge && (
              <span className="mb-2 inline-block rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                {badge}
              </span>
            )}
            <h4 className="font-[family-name:var(--font-anton)] text-base uppercase text-ink">
              {title}
            </h4>
            {description && (
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{description}</p>
            )}
          </div>
          {selected && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange text-xs font-bold text-white">
              ✓
            </span>
          )}
        </div>
        {meta && <div className="mt-4 border-t border-black/[0.06] pt-4">{meta}</div>}
      </div>
    </motion.button>
  );
}
