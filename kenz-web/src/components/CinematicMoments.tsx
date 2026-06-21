"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCinematicSound } from "@/components/CinematicSoundContext";
import { CINEMATIC_SCENES } from "@/data/cinematic-scenes";
import { sceneVideoSrc } from "@/data/cinematic-scenes";
import MotionReveal from "./MotionReveal";
import BezelCard from "./ui/BezelCard";
import CinematicSoundToggle from "./ui/CinematicSoundToggle";
import { easePremium } from "@/lib/motion";

export default function CinematicMoments() {
  const reduceMotion = useReducedMotion();
  const { soundEnabled } = useCinematicSound();
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const scene = CINEMATIC_SCENES[index];

  indexRef.current = index;

  const advanceScene = useCallback(() => {
    setIndex((i) => (i + 1) % CINEMATIC_SCENES.length);
  }, []);

  const syncSound = useCallback(
    (sceneId: string) => {
      const el = videoRefs.current[sceneId];
      if (!el) return;
      const isActive = sceneId === CINEMATIC_SCENES[indexRef.current].id;
      el.muted = !soundEnabled || !isActive;
      el.volume = soundEnabled && isActive ? 0.65 : 0;
    },
    [soundEnabled]
  );

  const playScene = useCallback(
    (sceneId: string) => {
      const el = videoRefs.current[sceneId];
      if (!el) return;
      el.currentTime = 0;
      syncSound(sceneId);
      void el.play().catch(() => {
        el.muted = true;
        void el.play().catch(() => undefined);
      });
    },
    [syncSound]
  );

  useEffect(() => {
    CINEMATIC_SCENES.forEach((s) => {
      const el = videoRefs.current[s.id];
      if (!el) return;
      const isActive = s.id === scene.id;
      if (isActive) {
        playScene(s.id);
      } else {
        el.muted = true;
        el.volume = 0;
      }
    });
  }, [scene.id, playScene]);

  useEffect(() => {
    CINEMATIC_SCENES.forEach((s) => syncSound(s.id));
  }, [soundEnabled, syncSound]);

  const handleEnded = useCallback(
    (sceneId: string) => {
      if (sceneId !== CINEMATIC_SCENES[indexRef.current].id) return;
      if (reduceMotion) return;
      advanceScene();
    },
    [advanceScene, reduceMotion]
  );

  return (
    <section className="relative overflow-hidden bg-[#141210] py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <MotionReveal className="lg:col-span-5">
            <h2 className="font-[family-name:var(--font-anton)] text-[clamp(2.25rem,5vw,3.75rem)] uppercase leading-[0.94] text-white">
              Three sides
              <br />
              of the Emirates
            </h2>
            <p className="mt-5 max-w-md text-lg text-white/60">
              Urban ambition, cultural ritual, desert calm. The same city, three
              completely different moods.
            </p>
          </MotionReveal>

          <MotionReveal delay={0.1} className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              {CINEMATIC_SCENES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-500 ${
                    index === i
                      ? "bg-orange text-white"
                      : "bg-white/10 text-white/70 ring-1 ring-white/15 hover:bg-white/15"
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <CinematicSoundToggle className="ml-auto" />
            </div>
          </MotionReveal>
        </div>

        <MotionReveal delay={0.15} className="mt-12">
          <BezelCard
            dark
            className="overflow-hidden"
            innerClassName="relative min-h-[min(70vh,520px)] p-0"
          >
            <div className="absolute inset-0">
              {CINEMATIC_SCENES.map((s, i) => (
                <motion.div
                  key={s.id}
                  className="absolute inset-0"
                  initial={false}
                  animate={{ opacity: index === i ? 1 : 0 }}
                  transition={{ duration: 1.2, ease: easePremium }}
                  style={{ zIndex: index === i ? 2 : 1 }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${s.poster})` }}
                  />
                  <video
                    ref={(el) => {
                      videoRefs.current[s.id] = el;
                    }}
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    poster={s.poster}
                    onLoadedData={(e) => {
                      if (s.id === CINEMATIC_SCENES[indexRef.current].id) {
                        void e.currentTarget.play().catch(() => undefined);
                      }
                    }}
                    onEnded={() => handleEnded(s.id)}
                    className="absolute inset-0 h-full w-full object-cover"
                  >
                    <source src={sceneVideoSrc(s)} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/35 to-transparent" />
                </motion.div>
              ))}
            </div>

            <div className="relative z-10 flex min-h-[min(70vh,520px)] flex-col justify-end p-8 md:p-12">
              <motion.div
                key={scene.id}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: easePremium }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-soft">
                  {scene.label}
                </p>
                <h3 className="mt-3 font-[family-name:var(--font-anton)] text-[clamp(2rem,4vw,3rem)] uppercase leading-[0.95] text-white">
                  {scene.headline}
                </h3>
                <p className="mt-3 max-w-lg text-white/70">{scene.subline}</p>
              </motion.div>
            </div>
          </BezelCard>
        </MotionReveal>
      </div>
    </section>
  );
}
