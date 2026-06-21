"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { useCinematicSound } from "@/components/CinematicSoundContext";
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
  const { soundEnabled } = useCinematicSound();
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const activeIdRef = useRef(activeId);

  activeIdRef.current = activeId;

  const syncSound = useCallback(
    (sceneId: string) => {
      const el = videoRefs.current[sceneId];
      if (!el) return;
      const isActive = sceneId === activeIdRef.current;
      el.muted = !soundEnabled || !isActive;
      el.volume = soundEnabled && isActive ? 0.65 : 0;
    },
    [soundEnabled]
  );

  const playScene = useCallback(
    (sceneId: string, fromStart = true) => {
      const el = videoRefs.current[sceneId];
      if (!el) return;
      if (fromStart) el.currentTime = 0;
      syncSound(sceneId);
      void el.play().catch(() => {
        el.muted = true;
        void el.play().catch(() => undefined);
      });
    },
    [syncSound]
  );

  useEffect(() => {
    scenes.forEach((scene) => {
      const el = videoRefs.current[scene.id];
      if (!el) return;
      const isActive = scene.id === activeId;
      if (isActive) {
        playScene(scene.id, true);
      } else {
        el.muted = true;
        el.volume = 0;
      }
    });
  }, [activeId, scenes, playScene]);

  useEffect(() => {
    scenes.forEach((scene) => syncSound(scene.id));
  }, [soundEnabled, scenes, syncSound]);

  const handleEnded = useCallback(
    (sceneId: string) => {
      if (sceneId !== activeIdRef.current) return;
      onSceneEnded?.();
    },
    [onSceneEnded]
  );

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {scenes.map((scene) => {
        const isActive = scene.id === activeId;

        return (
          <motion.div
            key={scene.id}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: isActive ? 1 : 0 }}
            transition={{
              duration: reduceMotion ? 0 : 1.2,
              ease: easePremium,
            }}
            style={{ zIndex: isActive ? 2 : 1 }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${scene.poster})` }}
            />

            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={
                reduceMotion || !kenBurns || !isActive
                  ? { scale: 1 }
                  : { scale: [1, 1.05] }
              }
              transition={
                reduceMotion || !kenBurns || !isActive
                  ? undefined
                  : {
                      duration: 5,
                      ease: "linear",
                      repeat: Infinity,
                      repeatType: "reverse",
                    }
              }
            >
              <video
                ref={(el) => {
                  videoRefs.current[scene.id] = el;
                }}
                autoPlay
                muted
                playsInline
                preload="auto"
                poster={scene.poster}
                onLoadedData={(e) => {
                  if (scene.id === activeIdRef.current) {
                    playScene(scene.id, false);
                  }
                }}
                onEnded={() => handleEnded(scene.id)}
                onError={(e) => {
                  const el = e.currentTarget;
                  if (el.src !== scene.fallbackSrc) {
                    el.src = scene.fallbackSrc;
                  }
                }}
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src={sceneVideoSrc(scene)} type="video/mp4" />
              </video>
            </motion.div>
          </motion.div>
        );
      })}

      <div className="absolute inset-0 bg-gradient-to-br from-[#141210]/82 via-[#141210]/45 to-[#141210]/75" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_18%,rgba(255,106,0,0.16),transparent_52%)]" />
    </div>
  );
}
