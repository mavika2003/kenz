"use client";

import { motion } from "framer-motion";
import { Microphone } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { easePremium, useHydratedReducedMotion } from "@/lib/motion";

export function GradientCircle({
  size = "lg",
  active = false,
  status,
  showMic = false,
}: {
  size?: "sm" | "lg";
  active?: boolean;
  status: string;
  showMic?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dim = size === "lg" ? "h-28 w-28" : "h-12 w-12";
  const iconSize = size === "lg" ? 32 : 20;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    void el.play().catch(() => undefined);
  }, []);

  const isLive =
    active &&
    (status === "listening" || status === "hearing" || status === "speaking");

  return (
    <div
      className={`relative ${dim} overflow-hidden rounded-full border-2 transition-all duration-500 ${
        isLive
          ? "border-orange shadow-[0_0_0_4px_rgba(255,106,0,0.4),0_0_28px_rgba(255,106,0,0.35)]"
          : size === "lg"
            ? "border-white/30"
            : "border-black/10"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onCanPlay={(e) => {
          const el = e.currentTarget;
          el.muted = true;
          void el.play().catch(() => undefined);
        }}
        className="absolute inset-0 h-full w-full scale-110 object-cover"
        aria-hidden
      >
        <source src="/videos/gradient.mp4" type="video/mp4" />
        <source src="/videos/gradient.mov" type="video/quicktime" />
      </video>
      {showMic && (
        <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <Microphone
            size={iconSize}
            weight="fill"
            className="text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]"
          />
        </span>
      )}
      {isLive && size === "lg" && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-orange/50"
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

type KenzrVoicePanelProps = {
  variant?: "hero" | "light";
  compact?: boolean;
  conversationActive: boolean;
  status: string;
  className?: string;
  onClose?: () => void;
};

export default function KenzrVoicePanel({
  variant = "hero",
  compact = false,
  conversationActive,
  status,
  className = "",
  onClose,
}: KenzrVoicePanelProps) {
  const reduceMotion = useHydratedReducedMotion();
  const isHero = variant === "hero";

  const glassClass = compact
    ? isHero
      ? "rounded-2xl bg-white/[0.09] px-4 py-3 ring-1 ring-white/18 backdrop-blur-md"
      : "rounded-2xl bg-white/90 px-4 py-3 shadow-lg ring-1 ring-black/10 backdrop-blur-md"
    : isHero
      ? "rounded-[1.5rem] bg-white/[0.09] px-7 py-6 ring-1 ring-white/18 backdrop-blur-md"
      : "rounded-[1.5rem] bg-white/90 px-7 py-6 shadow-lg ring-1 ring-black/10 backdrop-blur-md";

  const titleClass = isHero ? "text-white" : "text-ink";

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: isHero ? 12 : 0, y: isHero ? 0 : 8, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, x: isHero ? 8 : 0, y: isHero ? 0 : 6, scale: 0.97 }}
      transition={{ duration: 0.35, ease: easePremium }}
      className={`flex flex-col items-center ${compact ? "w-[9.5rem]" : ""} ${glassClass} ${className}`}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-2 right-2 flex items-center justify-center rounded-full transition hover:bg-black/[0.06] ${
            compact ? "h-5 w-5 text-[10px] text-white/50 hover:text-white" : "h-7 w-7 text-ink/45 hover:text-ink"
          }`}
          aria-label="Close Kenzr"
        >
          ✕
        </button>
      )}
      <p
        className={`font-display font-semibold tracking-wide ${titleClass} ${
          compact ? "mb-2 text-xs" : "mb-4 text-base"
        }`}
      >
        Kenzr
      </p>
      <GradientCircle
        size={compact ? "sm" : "lg"}
        active={conversationActive}
        status={status}
      />
    </motion.div>
  );
}
