"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { CINEMATIC_SCENES } from "@/data/cinematic-scenes";
import { sceneVideoSrc } from "@/data/cinematic-scenes";
import MotionReveal from "./MotionReveal";
import BezelCard from "./ui/BezelCard";
import { easePremium } from "@/lib/motion";

export default function CinematicMoments() {
  const reduceMotion = useReducedMotion();
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [readyScenes, setReadyScenes] = useState<Record<string, boolean>>({});
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const scene = CINEMATIC_SCENES[index];

  indexRef.current = index;

  const advanceScene = useCallback(() => {
    setIndex((i) => (i + 1) % CINEMATIC_SCENES.length);
  }, []);

  useEffect(() => {
    const active = CINEMATIC_SCENES[index];
    if (readyScenes[active.id]) {
      setDisplayedIndex(index);
    }
  }, [index, readyScenes]);

  useEffect(() => {
    CINEMATIC_SCENES.forEach((s) => {
      const el = videoRefs.current[s.id];
      if (!el) return;
      const isActive = s.id === scene.id;
      el.muted = true;
      if (isActive) {
        void el.play().catch(() => undefined);
      } else {
        el.pause();
      }
    });
  }, [scene.id]);

  const handleEnded = useCallback(
    (sceneId: string) => {
      if (sceneId !== CINEMATIC_SCENES[indexRef.current].id) return;
      if (reduceMotion) return;
      advanceScene();
    },
    [advanceScene, reduceMotion],
  );

  const markReady = useCallback((sceneId: string) => {
    setReadyScenes((prev) => (prev[sceneId] ? prev : { ...prev, [sceneId]: true }));
  }, []);

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
            </div>
          </MotionReveal>
        </div>

        <MotionReveal delay={0.15} className="mt-12">
          <BezelCard
            dark
            className="overflow-hidden"
            innerClassName="relative min-h-[min(70vh,520px)] bg-[#141210] p-0"
          >
            <div className="absolute inset-0 bg-[#141210]">
              {CINEMATIC_SCENES.map((s, i) => {
                const isActive = index === i;
                const isDisplayed = displayedIndex === i;
                const shouldMount = isActive || isDisplayed;
                const isReady = readyScenes[s.id] === true;
                const visible = isDisplayed && isReady;

                return (
                  <motion.div
                    key={s.id}
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: visible ? 1 : 0 }}
                    transition={{ duration: 1.2, ease: easePremium }}
                    style={{ zIndex: isDisplayed ? 2 : 1 }}
                  >
                    {shouldMount && (
                      <video
                        ref={(el) => {
                          videoRefs.current[s.id] = el;
                          if (el) el.muted = true;
                        }}
                        src={sceneVideoSrc(s)}
                        autoPlay={isActive}
                        muted
                        playsInline
                        preload={isActive ? "auto" : "metadata"}
                        onLoadedData={(e) => {
                          markReady(s.id);
                          if (s.id === CINEMATIC_SCENES[indexRef.current].id) {
                            e.currentTarget.muted = true;
                            void e.currentTarget.play().catch(() => undefined);
                          }
                        }}
                        onEnded={() => handleEnded(s.id)}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/35 to-transparent" />
                  </motion.div>
                );
              })}
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
