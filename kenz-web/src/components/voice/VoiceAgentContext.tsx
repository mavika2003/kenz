"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  executeVoiceActions,
  flushPlannerActions,
  type PlannerVoiceHandlers,
} from "@/lib/voice/executeVoiceActions";
import {
  clearAnonymousVoiceTurns,
  getStoredTurnsUsed,
  SESSION_TURN_LIMIT,
} from "@/lib/voice/siteMap";
import { fetchChatHistory } from "@/lib/chatApi";
import {
  sendVoiceAgentTurn,
  sendVoiceAgentAudio,
  isVoiceAgentConfigured,
} from "@/lib/voice/voiceAgentApi";
import { useConversationListener } from "@/lib/voice/useConversationListener";
import { useSpeechSynthesis } from "@/lib/voice/useSpeechSynthesis";
import type { VoiceAction, VoiceAgentStatus } from "@/lib/voice/types";

type VoiceAgentContextValue = {
  status: VoiceAgentStatus;
  isExpanded: boolean;
  conversationActive: boolean;
  transcript: string;
  lastSay: string;
  error: string | null;
  turnsUsed: number;
  turnsLimit: number;
  isConfigured: boolean;
  isAtLimit: boolean;
  isAuthenticated: boolean;
  textInput: string;
  setTextInput: (value: string) => void;
  setExpanded: (open: boolean) => void;
  toggleExpanded: () => void;
  startConversation: () => void;
  stopConversation: () => void;
  toggleConversation: () => void;
  submitText: () => void;
  registerPlannerHandlers: (handlers: PlannerVoiceHandlers) => void;
  unregisterPlannerHandlers: () => void;
  setPlannerMilestone: (milestoneId: string | null) => void;
  announceMessage: (text: string) => void;
};

const VoiceAgentContext = createContext<VoiceAgentContextValue | null>(null);

const LIMIT_REACHED_MSG =
  "You've used all your free messages for now — sign up for unlimited chat!";

const KENZR_GREETING =
  "Hi! I'm Kenzr. Tell me where you'd like to go, and I'll take you there.";

export function useVoiceAgent(): VoiceAgentContextValue {
  const ctx = useContext(VoiceAgentContext);
  if (!ctx) {
    throw new Error("useVoiceAgent must be used within VoiceAgentProvider");
  }
  return ctx;
}

export function VoiceAgentProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { user } = useAuth();

  const [status, setStatus] = useState<VoiceAgentStatus>("idle");
  const [conversationActive, setConversationActive] = useState(false);
  const [isExpanded, setExpanded] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastSay, setLastSay] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [turnsUsed, setTurnsUsed] = useState(0);
  const [turnsLimit, setTurnsLimit] = useState(SESSION_TURN_LIMIT);
  const [textInput, setTextInput] = useState("");

  const plannerHandlersRef = useRef<PlannerVoiceHandlers | null>(null);
  const plannerMilestoneRef = useRef<string | null>(null);
  const pendingPlannerRef = useRef<VoiceAction[]>([]);
  const busyRef = useRef(false);
  const conversationActiveRef = useRef(false);
  const greetedRef = useRef(false);

  const isConfigured = isVoiceAgentConfigured();
  const isAuthenticated = Boolean(user);
  const isAtLimit = turnsUsed >= turnsLimit;

  const { speak, cancel: cancelSpeech } = useSpeechSynthesis();

  const resumeListening = useCallback(() => {
    if (!conversationActiveRef.current || isAtLimit) {
      setStatus("idle");
      return;
    }
    setStatus("listening");
  }, [isAtLimit]);

  const queuePlannerActions = useCallback((actions: VoiceAction[]) => {
    pendingPlannerRef.current.push(...actions);
  }, []);

  const runActions = useCallback(
    async (actions: VoiceAction[]) => {
      await executeVoiceActions({
        actions,
        pathname: window.location.pathname,
        isAuthenticated: Boolean(user),
        navigate: (href) => router.push(href),
        plannerHandlers: plannerHandlersRef.current,
        queuePlannerActions,
      });

      if (plannerHandlersRef.current && pendingPlannerRef.current.length > 0) {
        const pending = [...pendingPlannerRef.current];
        pendingPlannerRef.current = [];
        flushPlannerActions(pending, plannerHandlersRef.current);
      }
    },
    [pathname, queuePlannerActions, router, user],
  );

  const processAgentResponse = useCallback(
    async (response: Awaited<ReturnType<typeof sendVoiceAgentTurn>>) => {
      if (response.transcript) setTranscript(response.transcript);
      setTurnsUsed(response.turns_used);
      setTurnsLimit(response.turns_limit);
      setLastSay(response.say);

      // Split actions: navigation + planner_set + planner_complete run immediately.
      // planner_go_to (milestone switch) waits until AFTER speech so the transition
      // feels smooth — the user hears Kenzr confirm their choice before the UI moves.
      const immediateActions = response.actions.filter(
        (a) => a.type !== "planner_go_to",
      );
      const deferredGoTo = response.actions.filter(
        (a) => a.type === "planner_go_to",
      );

      await runActions(immediateActions);

      setStatus("speaking");
      speak(response.say, {
        onStart: () => setStatus("speaking"),
        onEnd: () => {
          // Now execute the milestone transition after speech finishes
          if (deferredGoTo.length > 0) {
            void runActions(deferredGoTo);
          }
          resumeListening();
        },
      });
    },
    [resumeListening, runActions, speak],
  );

  const processTranscript = useCallback(
    async (text: string) => {
      if (!text.trim() || busyRef.current) return;

      if (isAtLimit) {
        setError(LIMIT_REACHED_MSG);
        setLastSay(LIMIT_REACHED_MSG);
        speak(LIMIT_REACHED_MSG, {
          onStart: () => setStatus("speaking"),
          onEnd: () => resumeListening(),
        });
        return;
      }

      if (!isConfigured) {
        setError("Voice agent is not configured.");
        return;
      }

      busyRef.current = true;
      setTranscript(text);
      setError(null);
      setStatus("thinking");

      try {
        const response = await sendVoiceAgentTurn(text, {
          pathname,
          planner_milestone: plannerMilestoneRef.current,
          is_authenticated: Boolean(user),
        });

        await processAgentResponse(response);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong. Try again.";
        setError(message);
        setStatus("error");
        speak(message, {
          onStart: () => setStatus("speaking"),
          onEnd: () => resumeListening(),
        });
      } finally {
        busyRef.current = false;
      }
    },
    [isAtLimit, isConfigured, pathname, processAgentResponse, resumeListening, speak, user],
  );

  const processAudio = useCallback(
    async (blob: Blob, mimeType: string) => {
      if (busyRef.current) return;

      if (isAtLimit) {
        setError(LIMIT_REACHED_MSG);
        setLastSay(LIMIT_REACHED_MSG);
        speak(LIMIT_REACHED_MSG, {
          onStart: () => setStatus("speaking"),
          onEnd: () => {
            setConversationActive(false);
            conversationActiveRef.current = false;
            setStatus("idle");
          },
        });
        return;
      }

      if (!isConfigured) {
        setError("Voice agent is not configured.");
        return;
      }

      busyRef.current = true;
      setError(null);
      setStatus("thinking");

      try {
        const response = await sendVoiceAgentAudio(blob, mimeType, {
          pathname,
          planner_milestone: plannerMilestoneRef.current,
          is_authenticated: Boolean(user),
        });

        await processAgentResponse(response);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong. Try again.";
        setError(message);
        setStatus("error");
        speak(message, {
          onStart: () => setStatus("speaking"),
          onEnd: () => resumeListening(),
        });
      } finally {
        busyRef.current = false;
      }
    },
    [isAtLimit, isConfigured, pathname, processAgentResponse, resumeListening, speak, user],
  );

  const listenerPaused =
    !conversationActive || status === "thinking" || status === "speaking";

  useConversationListener({
    enabled: conversationActive,
    paused: listenerPaused,
    onUtterance: (blob, mimeType) => {
      setStatus("thinking");
      void processAudio(blob, mimeType);
    },
    onHearingChange: (hearing) => {
      if (hearing) setStatus("hearing");
      else if (conversationActiveRef.current) setStatus("listening");
    },
    onError: (message) => {
      setError(message);
      setStatus("error");
    },
  });

  const stopConversation = useCallback(() => {
    conversationActiveRef.current = false;
    setConversationActive(false);
    greetedRef.current = false;
    cancelSpeech();
    busyRef.current = false;
    setStatus("idle");
  }, [cancelSpeech]);

  const startConversation = useCallback(() => {
    if (isAtLimit) {
      setError(LIMIT_REACHED_MSG);
      setLastSay(LIMIT_REACHED_MSG);
      speak(LIMIT_REACHED_MSG, {
        onStart: () => setStatus("speaking"),
        onEnd: () => setStatus("idle"),
      });
      return;
    }

    setError(null);
    conversationActiveRef.current = true;
    setConversationActive(true);
    setExpanded(true);

    if (!greetedRef.current) {
      greetedRef.current = true;
      setLastSay(KENZR_GREETING);
      setStatus("speaking");
      speak(KENZR_GREETING, {
        onStart: () => setStatus("speaking"),
        onEnd: () => resumeListening(),
      });
      return;
    }

    resumeListening();
  }, [isAtLimit, resumeListening, speak]);

  const toggleConversation = useCallback(() => {
    if (conversationActive) {
      stopConversation();
      return;
    }
    startConversation();
  }, [conversationActive, startConversation, stopConversation]);

  const submitText = useCallback(() => {
    const text = textInput.trim();
    if (!text) return;
    setTextInput("");
    void processTranscript(text);
  }, [processTranscript, textInput]);

  const registerPlannerHandlers = useCallback((handlers: PlannerVoiceHandlers) => {
    plannerHandlersRef.current = handlers;
    if (pendingPlannerRef.current.length > 0) {
      const pending = [...pendingPlannerRef.current];
      pendingPlannerRef.current = [];
      flushPlannerActions(pending, handlers);
    }
  }, []);

  const unregisterPlannerHandlers = useCallback(() => {
    plannerHandlersRef.current = null;
    plannerMilestoneRef.current = null;
  }, []);

  const setPlannerMilestone = useCallback((milestoneId: string | null) => {
    plannerMilestoneRef.current = milestoneId;
  }, []);

  // Speak a message and resume listening when done — used by PlannerVoiceBridge
  // to announce each planner step prompt.
  const announceMessage = useCallback((text: string) => {
    if (!conversationActiveRef.current) return;
    setLastSay(text);
    setStatus("speaking");
    speak(text, {
      onStart: () => setStatus("speaking"),
      onEnd: () => {
        if (conversationActiveRef.current) setStatus("listening");
      },
    });
  }, [speak]);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => {
      if (prev) stopConversation();
      return !prev;
    });
  }, [stopConversation]);

  useEffect(() => {
    conversationActiveRef.current = conversationActive;
  }, [conversationActive]);

  useEffect(() => {
    if (user) {
      clearAnonymousVoiceTurns();
      void fetchChatHistory()
        .then(({ usage }) => {
          setTurnsUsed(usage.calls_used);
          setTurnsLimit(usage.calls_limit);
        })
        .catch(() => {
          setTurnsUsed(0);
          setTurnsLimit(50);
        });
      return;
    }
    setTurnsUsed(getStoredTurnsUsed());
    setTurnsLimit(SESSION_TURN_LIMIT);
  }, [user]);

  const value = useMemo<VoiceAgentContextValue>(
    () => ({
      status,
      isExpanded,
      conversationActive,
      transcript,
      lastSay,
      error,
      turnsUsed,
      turnsLimit,
      isConfigured,
      isAtLimit,
      isAuthenticated,
      textInput,
      setTextInput,
      setExpanded,
      toggleExpanded,
      startConversation,
      stopConversation,
      toggleConversation,
      submitText,
      registerPlannerHandlers,
      unregisterPlannerHandlers,
      setPlannerMilestone,
      announceMessage,
    }),
    [
      status,
      isExpanded,
      conversationActive,
      transcript,
      lastSay,
      error,
      turnsUsed,
      turnsLimit,
      isConfigured,
      isAtLimit,
      isAuthenticated,
      textInput,
      toggleExpanded,
      startConversation,
      stopConversation,
      toggleConversation,
      submitText,
      registerPlannerHandlers,
      unregisterPlannerHandlers,
      setPlannerMilestone,
      announceMessage,
    ],
  );

  return (
    <VoiceAgentContext.Provider value={value}>{children}</VoiceAgentContext.Provider>
  );
}
