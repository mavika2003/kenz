"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useVoiceAgent } from "./VoiceAgentContext";
import KenzrVoicePanel, { GradientCircle } from "./KenzrVoicePanel";

export default function VoiceAgentWidget() {
  const pathname = usePathname() ?? "/";
  const reduceMotion = useReducedMotion();
  const isHome = pathname === "/";

  const {
    status,
    isExpanded,
    conversationActive,
    isConfigured,
    startConversation,
    stopConversation,
    setExpanded,
  } = useVoiceAgent();

  // Hero renders its own inline panel beside the mic button.
  if (!isConfigured || isHome) return null;

  const closePanel = () => {
    stopConversation();
    setExpanded(false);
  };

  const glassTrigger =
    "rounded-full bg-white/90 ring-1 ring-black/10 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-white";

  return (
    <div className="pointer-events-none fixed bottom-6 right-4 z-40 md:right-6">
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        <AnimatePresence>
          {isExpanded && (
            <KenzrVoicePanel
              key="kenzr-floating-panel"
              variant="light"
              conversationActive={conversationActive}
              status={status}
              onClose={closePanel}
            />
          )}
        </AnimatePresence>

        {!isExpanded && (
          <motion.button
            type="button"
            onClick={() => startConversation()}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            className={`flex items-center gap-2 p-1.5 pr-4 ${glassTrigger}`}
            aria-label="Talk to Kenzr"
          >
            <GradientCircle
              size="sm"
              active={conversationActive}
              status={status}
              showMic
            />
            <span className="text-sm font-semibold text-ink">Kenzr</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
