"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CinematicScene } from "@/data/cinematic-scenes";
import { sceneVideoSrc } from "@/data/cinematic-scenes";
import { easePremium } from "@/lib/motion";

type CinematicVideoBackgroundProps = {
  scenes: CinematicScene[];
  activeId: string;
  className?: string;
  kenBurns?: boolean;
  onSceneEnded?: () => void;
};

export default function CinematicVideoBackground({
  scenes,
  activeId,
  className = "",
  kenBurns = true,
  onSceneEnded,
}: CinematicVideoBackgroundProps) {
  const reduceMotion = useReducedMotion();
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const activeIdRef = useRef(activeId);
  const [readyScenes, setReadyScenes] = useState<Record<string, boolean>>({});
  const [displayedId, setDisplayedId] = useState(activeId);

  activeIdRef.current = activeId;

  const tryPlay = useCallback((el: HTMLVideoElement) => {
    el.muted = true;
    void el.play().catch(() => undefined);
  }, []);

  const markReady = useCallback((sceneId: string) => {
    setReadyScenes((prev) => (prev[sceneId] ? prev : { ...prev, [sceneId]: true }));
  }, []);

  /* Keep the previous scene on screen until the next one has buffered */
  useEffect(() => {
    if (readyScenes[activeId]) {
      setDisplayedId(activeId);
    }
  }, [activeId, readyScenes]);

  useLayoutEffect(() => {
    const el = videoRefs.current[activeId];
    if (!el) return;
    if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady(activeId);
    }
    tryPlay(el);
  }, [activeId, markReady, tryPlay]);

  useEffect(() => {
    scenes.forEach((scene) => {
      const el = videoRefs.current[scene.id];
      if (!el) return;
      const shouldPlay = scene.id === activeId || scene.id === displayedId;
      if (!shouldPlay) {
        el.pause();
        return;
      }
      el.muted = true;
      if (scene.id === activeId && el.paused) tryPlay(el);
    });
  }, [activeId, displayedId, scenes, tryPlay]);

  const handleEnded = useCallback(
    (sceneId: string) => {
      if (sceneId !== activeIdRef.current) return;
      onSceneEnded?.();
    },
    [onSceneEnded],
  );

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#141210] ${className}`}
      aria-hidden="true"
    >
      {scenes.map((scene) => {
        const isDisplayed = scene.id === displayedId;
        const shouldMount = scene.id === activeId || scene.id === displayedId;
        const isReady = readyScenes[scene.id] === true;
        const visible = isDisplayed && isReady;

        return (
          <motion.div
            key={scene.id}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: visible ? 1 : 0 }}
            transition={{
              duration: reduceMotion ? 0 : 1.2,
              ease: easePremium,
            }}
            style={{ zIndex: isDisplayed ? 2 : 1 }}
          >
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={
                reduceMotion || !kenBurns || !visible
                  ? { scale: 1 }
                  : { scale: [1, 1.05] }
              }
              transition={
                reduceMotion || !kenBurns || !visible
                  ? undefined
                  : {
                      duration: 5,
                      ease: "linear",
                      repeat: Infinity,
                      repeatType: "reverse",
                    }
              }
            >
              {shouldMount && (
                <video
                  ref={(el) => {
                    videoRefs.current[scene.id] = el;
                    if (el) el.muted = true;
                  }}
                  src={sceneVideoSrc(scene)}
                  muted
                  playsInline
                  autoPlay={scene.id === activeId}
                  preload={scene.id === activeId ? "auto" : "metadata"}
                  onLoadedData={(e) => {
                    markReady(scene.id);
                    if (scene.id === activeIdRef.current) tryPlay(e.currentTarget);
                  }}
                  onCanPlay={(e) => {
                    markReady(scene.id);
                    if (scene.id !== activeIdRef.current) return;
                    tryPlay(e.currentTarget);
                  }}
                  onEnded={() => handleEnded(scene.id)}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </motion.div>
          </motion.div>
        );
      })}

      <div className="absolute inset-0 bg-gradient-to-br from-[#141210]/82 via-[#141210]/45 to-[#141210]/75" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_18%,rgba(255,106,0,0.16),transparent_52%)]" />
    </div>
  );
}
