"use client";

import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Microphone } from "@phosphor-icons/react";
import { CINEMATIC_SCENES } from "@/data/cinematic-scenes";
import CinematicVideoBackground from "./ui/CinematicVideoBackground";
import { easePremium, useHydratedReducedMotion } from "@/lib/motion";
import { useAuth } from "./AuthProvider";
import { loginPageUrl } from "@/lib/auth";
import { useVoiceAgent } from "./voice/VoiceAgentContext";
import KenzrVoicePanel from "./voice/KenzrVoicePanel";

export const HERO_QUERY_KEY = "kenz_hero_query";

/* ── Animation phases for the label above the chatbox ───────────────── */
type LabelPhase = "chat-here" | "talk-to-kenzr";

const LABEL_PHASE_MS = 3200;

type Suggestion =
  | { label: string; kind: "chat"; prompt: string }
  | { label: string; kind: "planner" };

const SUGGESTIONS: Suggestion[] = [
  { label: "Create a new trip", kind: "planner" },
  { label: "Inspire me where to go", kind: "chat", prompt: "Inspire me on where to go in Dubai" },
  { label: "Plan a road trip", kind: "chat", prompt: "Plan a road trip around the UAE" },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const micVideoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useHydratedReducedMotion();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [labelPhase, setLabelPhase] = useState<LabelPhase>("chat-here");
  const activeScene = CINEMATIC_SCENES[sceneIndex];
  const router = useRouter();
  const { user } = useAuth();
  const {
    setExpanded,
    startConversation,
    stopConversation,
    conversationActive,
    isExpanded,
    status,
    isConfigured,
  } = useVoiceAgent();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  /* ── Label cycles: Chat Here ↔ Talk to Kenzr ─────────────────────── */
  useEffect(() => {
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      setLabelPhase((prev) => (prev === "chat-here" ? "talk-to-kenzr" : "chat-here"));
    }, LABEL_PHASE_MS);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  const chatboxHighlighted = labelPhase === "chat-here";
  const kenzrHighlighted = labelPhase === "talk-to-kenzr";

  useEffect(() => {
    const el = micVideoRef.current;
    if (!el) return;
    el.muted = true;
    void el.play().catch(() => undefined);
  }, [isConfigured]);

  /* Keep mic + panel anchored to the chat row on homepage load */
  useEffect(() => {
    setExpanded(false);
  }, [setExpanded]);

  const advanceScene = useCallback(() => {
    setSceneIndex((i) => (i + 1) % CINEMATIC_SCENES.length);
  }, []);

  const gotoChat = useCallback(
    (q: string) => {
      if (q.trim()) sessionStorage.setItem(HERO_QUERY_KEY, q.trim());
      router.push(user ? "/planner" : loginPageUrl("signup", "/planner"));
    },
    [router, user],
  );

  const gotoPlanner = useCallback(() => {
    router.push(user ? "/planner" : loginPageUrl("signup", "/planner"));
  }, [router, user]);

  const handleSubmit = useCallback(() => {
    if (!query.trim()) return;
    gotoChat(query);
  }, [query, gotoChat]);

  const handleSuggestion = useCallback(
    (s: Suggestion) => {
      if (s.kind === "planner") gotoPlanner();
      else gotoChat(s.prompt);
    },
    [gotoChat, gotoPlanner],
  );

  /* ── Hero mic opens Kenzr and starts listening immediately ─────────── */
  const handleTalkToKenzr = useCallback(() => {
    if (conversationActive) {
      stopConversation();
      setExpanded(false);
      return;
    }
    startConversation();
  }, [conversationActive, setExpanded, startConversation, stopConversation]);

  return (
    <header
      ref={ref}
      className="relative min-h-[100dvh] bg-[#141210]"
    >
      <CinematicVideoBackground
        scenes={CINEMATIC_SCENES}
        activeId={activeScene.id}
        onSceneEnded={advanceScene}
      />

      {/* Content */}
      <motion.div
        style={{ y: reduceMotion ? 0 : contentY }}
        className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-end px-5 pb-24 pt-24 text-center"
      >
        <div className="flex w-full max-w-[42rem] flex-col items-center overflow-visible">

          {/* ── Headline ─────────────────────────────────────────────── */}
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: easePremium }}
            className="mt-4 font-[family-name:var(--font-boitroco)] text-[clamp(2rem,5.8vw,3.8rem)] leading-[1.05] tracking-[-0.01em] text-white"
          >
            Your Dubai trip booked{" "}
            <span className="font-normal italic">while you watch</span>
          </motion.h1>

          {/* ── "Powered by AI" subscript ────────────────────────────── */}
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18, ease: easePremium }}
            className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/45"
          >
            Powered by AI
          </motion.p>

          {/* ── Animated label above chatbox ─────────────────────────── */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5, ease: easePremium }}
            className="mt-8 flex h-7 items-center justify-center"
          >
            <AnimatePresence mode="wait">
              {labelPhase === "chat-here" ? (
                <motion.span
                  key="chat-here"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: easePremium }}
                  className="text-[13px] font-semibold text-white"
                >
                  Chat Here
                </motion.span>
              ) : (
                <motion.span
                  key="talk-to-kenzr"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: easePremium }}
                  className="text-[13px] font-semibold text-white"
                >
                  Talk to Kenzr
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Chatbox row (input + Talk to Kenzr) ───────────── */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.13, ease: easePremium }}
            className="mt-3 flex w-full items-center gap-3 overflow-visible"
          >
            <motion.div
              animate={
                chatboxHighlighted && !reduceMotion
                  ? { scale: [1, 1.018, 1] }
                  : { scale: 1 }
              }
              transition={
                chatboxHighlighted && !reduceMotion
                  ? { scale: { repeat: Infinity, duration: 1.6, ease: "easeInOut" } }
                  : { duration: 0.35 }
              }
              className={`flex h-14 flex-1 items-center gap-3 rounded-full bg-white px-4 transition-shadow duration-500 ${
                chatboxHighlighted
                  ? "shadow-[0_0_0_3px_rgba(255,106,0,0.85),0_20px_60px_rgba(255,106,0,0.3)]"
                  : focused
                    ? "shadow-[0_24px_80px_rgba(0,0,0,0.5),0_0_0_2.5px_rgba(255,106,0,0.5)]"
                    : "shadow-[0_16px_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.1)]"
              }`}
            >
              {/* Left brand dot */}
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange shadow-sm">
                <ArrowRight size={14} weight="bold" className="rotate-[-45deg] text-white" />
              </div>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Build me the perfect Dubai itinerary, day by day"
                className="min-w-0 flex-1 bg-transparent text-[0.95rem] italic text-ink placeholder-ink/40 outline-none"
                aria-label="Ask about Dubai"
              />

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!query.trim()}
                aria-label="Send"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange text-white transition-all duration-300 hover:bg-orange-deep hover:shadow-[0_4px_14px_rgba(255,106,0,0.45)] active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowRight size={15} weight="bold" />
              </button>
            </motion.div>

            {/* ── Talk to Kenzr — mic + compact panel anchored to its right ── */}
            {isConfigured && (
              <div className="relative h-14 shrink-0">
                <motion.button
                  type="button"
                  onClick={handleTalkToKenzr}
                  initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                  animate={
                    kenzrHighlighted && !reduceMotion
                      ? { opacity: 1, x: 0, scale: [1, 1.08, 1] }
                      : { opacity: 1, x: 0, scale: 1 }
                  }
                  transition={
                    kenzrHighlighted && !reduceMotion
                      ? {
                          scale: { repeat: Infinity, duration: 1.6, ease: "easeInOut" },
                          opacity: { duration: 0.5, delay: 0.55 },
                          x: { duration: 0.5, delay: 0.55 },
                        }
                      : { duration: 0.35, delay: 0.55 }
                  }
                  whileTap={{ scale: 0.96 }}
                  className={`group relative block h-14 w-14 overflow-hidden rounded-full border-2 transition-all duration-500 ${
                    kenzrHighlighted
                      ? "border-orange shadow-[0_0_0_4px_rgba(255,106,0,0.45),0_0_28px_rgba(255,106,0,0.5)]"
                      : "border-white/30 group-hover:border-orange/60"
                  }`}
                  aria-label="Talk to Kenzr"
                >
                  <video
                    ref={micVideoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    onLoadedData={(e) => {
                      const el = e.currentTarget;
                      el.muted = true;
                      void el.play().catch(() => undefined);
                    }}
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
                  <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                    <Microphone
                      size={22}
                      weight="fill"
                      className="text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]"
                    />
                  </span>
                </motion.button>

                <AnimatePresence>
                  {isExpanded && (
                    <KenzrVoicePanel
                      key="kenzr-hero-panel"
                      variant="hero"
                      compact
                      conversationActive={conversationActive}
                      status={status}
                      onClose={() => {
                        stopConversation();
                        setExpanded(false);
                      }}
                      className="absolute top-1/2 left-[calc(100%+0.75rem)] z-30 -translate-y-1/2"
                    />
                  )}
                </AnimatePresence>

                <span
                  className={`pointer-events-none absolute top-full left-1/2 mt-1.5 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider transition-colors duration-500 ${
                    kenzrHighlighted ? "text-white" : "text-white/60"
                  }`}
                >
                  Kenzr
                </span>
              </div>
            )}
          </motion.div>

          {/* ── Quick suggestion pills ────────────────────────────────── */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22, ease: easePremium }}
            className="mt-5 flex flex-wrap justify-center gap-2"
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => handleSuggestion(s)}
                className="rounded-full bg-white/[0.09] px-4 py-2 text-[13px] font-medium text-white/90 ring-1 ring-white/18 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.16] hover:text-white hover:ring-white/30 active:scale-[0.96]"
              >
                {s.label}
              </button>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
}
