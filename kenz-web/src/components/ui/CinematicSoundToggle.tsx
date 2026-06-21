"use client";

import { useCinematicSound } from "@/components/CinematicSoundContext";

export default function CinematicSoundToggle({ className = "" }: { className?: string }) {
  const { soundEnabled, toggleSound } = useCinematicSound();

  return (
    <button
      type="button"
      onClick={toggleSound}
      aria-pressed={soundEnabled}
      aria-label={soundEnabled ? "Mute scene audio" : "Play scene audio"}
      className={`inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white ring-1 ring-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 active:scale-[0.98] ${className}`}
    >
      {soundEnabled ? "Sound on" : "Sound off"}
    </button>
  );
}
