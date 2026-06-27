"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Microphone,
  MicrophoneSlash,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useVoiceAgent } from "@/components/voice/VoiceAgentContext";
import { GradientCircle } from "@/components/voice/KenzrVoicePanel";

type ChatMsg = { role: "kenzr" | "user"; text: string };

const STATUS_LABEL: Record<string, string> = {
  idle: "Tap mic to talk",
  listening: "Listening…",
  hearing: "Hearing you…",
  thinking: "Thinking…",
  speaking: "Speaking…",
  error: "Error — try again",
};

export default function KenzrDashboardPanel() {
  const {
    status,
    conversationActive,
    isConfigured,
    lastSay,
    transcript,
    turnsUsed,
    turnsLimit,
    textInput,
    setTextInput,
    startConversation,
    stopConversation,
    submitText,
  } = useVoiceAgent();

  const [history, setHistory] = useState<ChatMsg[]>([
    {
      role: "kenzr",
      text: "Hi! I\u2019m Kenzr \u2014 your AI travel agent. Where would you like to go?",
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLastSay = useRef("");
  const prevTranscript = useRef("");

  /* Append Kenzr replies to history */
  useEffect(() => {
    if (!lastSay || lastSay === prevLastSay.current) return;
    prevLastSay.current = lastSay;
    setHistory((h) => [...h, { role: "kenzr", text: lastSay }]);
  }, [lastSay]);

  /* Append user turns to history */
  useEffect(() => {
    if (!transcript || transcript === prevTranscript.current) return;
    prevTranscript.current = transcript;
    setHistory((h) => [...h, { role: "user", text: transcript }]);
  }, [transcript]);

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, status]);

  const handleMic = () => {
    if (conversationActive) stopConversation();
    else startConversation();
  };

  const handleSend = () => {
    if (!textInput.trim()) return;
    submitText();
  };

  const statusLabel = STATUS_LABEL[status] ?? "Ready";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Avatar + controls ───────────────────────────── */}
      <div className="flex shrink-0 flex-col items-center border-b border-black/[0.06] px-5 pb-5 pt-6">
        <GradientCircle
          size="lg"
          active={conversationActive}
          status={status}
          showMic={false}
        />
        <p className="mt-3 font-display text-base font-semibold tracking-wide text-ink">
          Kenzr
        </p>
        <p className="mt-0.5 text-xs text-ink/45">{statusLabel}</p>

        {/* Mic + turn counter */}
        <div className="mt-4 flex items-center gap-3">
          {isConfigured ? (
            <button
              type="button"
              onClick={handleMic}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition ${
                conversationActive
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-orange text-white hover:bg-orange-deep"
              }`}
            >
              {conversationActive ? (
                <>
                  <MicrophoneSlash size={14} weight="fill" />
                  Stop
                </>
              ) : (
                <>
                  <Microphone size={14} weight="fill" />
                  Talk to Kenzr
                </>
              )}
            </button>
          ) : (
            <span className="rounded-full bg-surface px-3 py-1.5 text-[10px] text-ink/35">
              Voice: API key not configured
            </span>
          )}
          <span className="text-[10px] text-ink/30">
            {turnsUsed}/{turnsLimit}
          </span>
        </div>

        {/* Typing indicator */}
        <AnimatePresence>
          {(status === "thinking" || status === "speaking") && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-3 flex items-center gap-1.5"
            >
              {["", "150ms", "300ms"].map((delay, i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange/60"
                  style={{ animationDelay: delay }}
                />
              ))}
              <span className="ml-1 text-[10px] text-ink/40">
                {status === "thinking" ? "Thinking…" : "Speaking…"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Conversation history ─────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {history.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              msg.role === "user"
                ? "ml-auto rounded-br-sm bg-ink text-white"
                : "mr-auto rounded-bl-sm bg-surface text-ink"
            }`}
          >
            {msg.text}
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Text input ───────────────────────────────────── */}
      <div className="shrink-0 border-t border-black/[0.06] px-4 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type to Kenzr…"
            className="min-w-0 flex-1 rounded-full border border-black/10 bg-surface px-4 py-2 text-sm outline-none focus:border-orange/50"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!textInput.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange text-white transition hover:bg-orange-deep disabled:opacity-40"
          >
            <PaperPlaneTilt size={15} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}
