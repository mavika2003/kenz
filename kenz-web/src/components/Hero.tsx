"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { CINEMATIC_SCENES } from "@/data/cinematic-scenes";
import { ProtectedPlannerLink } from "./ProtectedPlannerLink";
import PillCTA from "./ui/PillCTA";
import CinematicVideoBackground from "./ui/CinematicVideoBackground";
import CinematicSoundToggle from "./ui/CinematicSoundToggle";
import { easePremium } from "@/lib/motion";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [sceneIndex, setSceneIndex] = useState(0);
  const activeScene = CINEMATIC_SCENES[sceneIndex];

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  const advanceScene = useCallback(() => {
    setSceneIndex((i) => (i + 1) % CINEMATIC_SCENES.length);
  }, []);

  return (
    <header
      ref={ref}
      className="relative min-h-[100dvh] overflow-hidden bg-[#141210]"
    >
      <CinematicVideoBackground
        scenes={CINEMATIC_SCENES}
        activeId={activeScene.id}
        onSceneEnded={advanceScene}
      />

      <div className="pointer-events-none absolute bottom-6 right-6 z-20 md:bottom-8 md:right-8">
        <div className="pointer-events-auto">
          <CinematicSoundToggle />
        </div>
      </div>

      <div className="relative z-10 mx-auto grid min-h-[100dvh] max-w-7xl items-end gap-12 px-6 pb-20 pt-28 md:grid-cols-2 md:pb-28 md:pt-24">
        <motion.div style={{ y: reduceMotion ? 0 : contentY }}>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: easePremium }}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-soft"
          >
            {activeScene.label}
          </motion.p>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: easePremium }}
            className="mt-4 max-w-2xl font-[family-name:var(--font-anton)] text-[clamp(2.5rem,6.5vw,4.75rem)] uppercase leading-[0.94] tracking-tight text-white"
          >
            Explore Dubai
            <br />
            <span className="text-orange">Like a Local</span>
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: easePremium }}
            className="mt-6 max-w-md text-lg leading-relaxed text-white/78"
          >
            Skip the brochure. Real residents share where to eat, how to move, and
            what to skip.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: easePremium }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <ProtectedPlannerLink className="group inline-flex items-center gap-3 rounded-full bg-orange px-6 py-3 text-sm font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-orange-deep active:scale-[0.98]">
              <span>Plan your trip</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 text-xs transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-px">
                ↗
              </span>
            </ProtectedPlannerLink>
            <PillCTA href="#experiences" variant="ghost">
              See experiences
            </PillCTA>
          </motion.div>

          <div className="mt-12 flex flex-wrap gap-2">
            {CINEMATIC_SCENES.map((scene, i) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => setSceneIndex(i)}
                aria-pressed={sceneIndex === i}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-500 ${
                  sceneIndex === i
                    ? "bg-white text-ink"
                    : "bg-white/10 text-white/75 ring-1 ring-white/20 hover:bg-white/15"
                }`}
              >
                {scene.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15, ease: easePremium }}
          className="hidden md:block"
        >
          <div className="rounded-[2rem] bg-white/[0.08] p-1.5 ring-1 ring-white/15 backdrop-blur-sm">
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#141210]/60 p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-soft">
                Live local intel
              </p>
              <ul className="mt-6 space-y-4 text-sm text-white/75">
                <li>Careem beats hotel taxis on price</li>
                <li>Friday brunch is its own meal category</li>
                <li>Marina Walk at sunset costs nothing</li>
                <li>Counter at 50% in the Gold Souk</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
