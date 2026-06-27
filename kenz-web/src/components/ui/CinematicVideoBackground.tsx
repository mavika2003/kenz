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

function applyAudioState(
  el: HTMLVideoElement,
  audioOn: boolean,
) {
  el.muted = !audioOn;
  el.volume = audioOn ? 0.65 : 0;
}

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

  const playScene = useCallback((sceneId: string, fromStart = true) => {
    const el = videoRefs.current[sceneId];
    if (!el) return;
    if (fromStart) el.currentTime = 0;
    const audioOn = soundEnabled && sceneId === activeIdRef.current;
    applyAudioState(el, audioOn);
    void el.play().catch(() => {
      applyAudioState(el, false);
      void el.play().catch(() => undefined);
    });
  }, [soundEnabled]);

  useEffect(() => {
    scenes.forEach((scene) => {
      const el = videoRefs.current[scene.id];
      if (!el) return;
      const isActive = scene.id === activeId;
      const audioOn = soundEnabled && isActive;
      applyAudioState(el, audioOn);
      if (isActive && el.paused) {
        void el.play().catch(() => {
          applyAudioState(el, false);
          void el.play().catch(() => undefined);
        });
      }
    });
  }, [activeId, scenes, soundEnabled]);

  const handleEnded = useCallback(
    (sceneId: string) => {
      if (sceneId !== activeIdRef.current) return;
      onSceneEnded?.();
    },
    [onSceneEnded],
  );

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {scenes.map((scene) => {
        const isActive = scene.id === activeId;
        const audioOn = soundEnabled && isActive;

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
                  // React does not render the `muted` prop as an HTML attribute,
                  // so browsers block autoplay. Set it imperatively on the element
                  // the moment the ref is assigned so autoplay works on page load.
                  if (el) el.muted = true;
                }}
                autoPlay
                playsInline
                preload="auto"
                onCanPlay={(e) => {
                  if (scene.id !== activeIdRef.current) return;
                  const el = e.currentTarget;
                  const on = soundEnabled && scene.id === activeIdRef.current;
                  applyAudioState(el, on);
                  void el.play().catch(() => {
                    applyAudioState(el, false);
                    void el.play().catch(() => undefined);
                  });
                }}
                onPlay={(e) => {
                  applyAudioState(e.currentTarget, audioOn);
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
