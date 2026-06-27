"use client";

import { useEffect, useRef } from "react";
import { useVoiceAgent } from "./VoiceAgentContext";
import type { PlanState, Milestone } from "@/lib/planner/types";
import { MILESTONES } from "@/lib/planner/data";

const MILESTONE_PROMPTS: Record<string, string> = {
  destination:
    "Where would you like to go? You can choose Dubai, Abu Dhabi, or visit both!",
  style:
    "What's your travel style? Tell me if you're thinking luxury, balanced, budget, or backpacker.",
  logistics:
    "Let's sort the details — how many travellers, how many days, when you're going, where you'll stay, and how you'll get around.",
  review:
    "Your plan looks amazing! Say 'save it' when you're ready, or let me know if you'd like to change anything.",
};

type PlannerVoiceBridgeProps = {
  activeMilestone: Milestone;
  setActiveMilestone: (milestone: Milestone) => void;
  updatePlan: (updates: Partial<PlanState>) => void;
  markMilestoneComplete: (milestoneId: string) => void;
};

export default function PlannerVoiceBridge({
  activeMilestone,
  setActiveMilestone,
  updatePlan,
  markMilestoneComplete,
}: PlannerVoiceBridgeProps) {
  const {
    conversationActive,
    registerPlannerHandlers,
    unregisterPlannerHandlers,
    setPlannerMilestone,
    announceMessage,
  } = useVoiceAgent();

  // Track the previous milestone so we only announce on genuine changes.
  const prevMilestoneRef = useRef<string | null>(null);

  // Keep milestone context ref in sync for the voice API.
  useEffect(() => {
    setPlannerMilestone(activeMilestone.id);
  }, [activeMilestone.id, setPlannerMilestone]);

  // Register handlers whenever the callbacks change.
  useEffect(() => {
    registerPlannerHandlers({
      goToMilestone: (milestoneId: string) => {
        const milestone = MILESTONES.find((m) => m.id === milestoneId);
        if (milestone) setActiveMilestone(milestone);
      },
      updatePlan,
      completeMilestone: markMilestoneComplete,
    });

    return () => {
      unregisterPlannerHandlers();
      setPlannerMilestone(null);
    };
  }, [
    markMilestoneComplete,
    registerPlannerHandlers,
    setActiveMilestone,
    setPlannerMilestone,
    unregisterPlannerHandlers,
    updatePlan,
  ]);

  // Announce the prompt for the new milestone when conversation is active
  // and the milestone actually changed (not just a re-render).
  useEffect(() => {
    if (!conversationActive) {
      prevMilestoneRef.current = activeMilestone.id;
      return;
    }

    if (prevMilestoneRef.current === activeMilestone.id) return;
    prevMilestoneRef.current = activeMilestone.id;

    const prompt = MILESTONE_PROMPTS[activeMilestone.id];
    if (prompt) {
      // Short delay so Kenzr's previous reply finishes speaking first.
      const t = window.setTimeout(() => announceMessage(prompt), 400);
      return () => window.clearTimeout(t);
    }
  }, [activeMilestone.id, announceMessage, conversationActive]);

  return null;
}
