"use client";

import { motion } from "framer-motion";
import { useHydratedReducedMotion } from "@/lib/motion";
import { useEffect, useState } from "react";
import type { VoiceAgentStatus } from "@/lib/voice/types";

type VoiceAgentAvatarProps = {
  status: VoiceAgentStatus;
  size?: number;
  className?: string;
};

export default function VoiceAgentAvatar({
  status,
  size = 56,
  className = "",
}: VoiceAgentAvatarProps) {
  const reduceMotion = useHydratedReducedMotion();
  const [blink, setBlink] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const blinkTimer = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 150);
    }, 3500 + Math.random() * 2000);
    return () => window.clearInterval(blinkTimer);
  }, [reduceMotion]);

  useEffect(() => {
    if (status !== "speaking" || reduceMotion) {
      setMouthOpen(false);
      return;
    }
    const talkTimer = window.setInterval(() => {
      setMouthOpen((prev) => !prev);
    }, 180);
    return () => window.clearInterval(talkTimer);
  }, [status, reduceMotion]);

  const isListening = status === "listening" || status === "hearing";
  const isThinking = status === "thinking";

  return (
    <motion.div
      className={`relative inline-flex shrink-0 ${className}`}
      animate={
        reduceMotion
          ? undefined
          : {
              scale: isListening ? [1, 1.06, 1] : isThinking ? [1, 1.02, 1] : [1, 1.03, 1],
            }
      }
      transition={
        reduceMotion
          ? undefined
          : {
              duration: isListening ? 0.8 : 2.4,
              repeat: Infinity,
              ease: "easeInOut",
            }
      }
    >
      {isListening && (
        <motion.span
          className="absolute inset-0 rounded-full bg-orange/30"
          animate={reduceMotion ? undefined : { scale: [1, 1.35], opacity: [0.5, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}

      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <circle cx="40" cy="40" r="38" fill="#ff6a00" />
        <circle cx="40" cy="40" r="34" fill="#ff8b3d" />
        <ellipse cx="40" cy="52" rx="22" ry="18" fill="#fdfbf7" />
        <path
          d="M22 48c4-8 12-12 18-12s14 4 18 12"
          fill="#ff6a00"
          opacity="0.35"
        />
        <rect x="28" y="58" width="24" height="8" rx="2" fill="#141210" opacity="0.15" />
        <rect x="30" y="60" width="4" height="6" rx="1" fill="#141210" opacity="0.25" />
        <rect x="38" y="59" width="4" height="7" rx="1" fill="#141210" opacity="0.25" />
        <rect x="46" y="60" width="4" height="6" rx="1" fill="#141210" opacity="0.25" />
        <circle cx="30" cy="36" r="4" fill="#141210" />
        <circle cx="50" cy="36" r="4" fill="#141210" />
        {!blink ? (
          <>
            <circle cx="31" cy="35" r="1.2" fill="#fff" />
            <circle cx="51" cy="35" r="1.2" fill="#fff" />
          </>
        ) : (
          <>
            <line x1="26" y1="36" x2="34" y2="36" stroke="#141210" strokeWidth="2" />
            <line x1="46" y1="36" x2="54" y2="36" stroke="#141210" strokeWidth="2" />
          </>
        )}
        <ellipse
          cx="40"
          cy="46"
          rx={mouthOpen ? 5 : 3}
          ry={mouthOpen ? 4 : 2}
          fill="#d94e00"
        />
        <circle cx="24" cy="42" r="4" fill="#ffb380" opacity="0.6" />
        <circle cx="56" cy="42" r="4" fill="#ffb380" opacity="0.6" />
      </svg>
    </motion.div>
  );
}
