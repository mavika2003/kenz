"use client";

import { useEffect, useRef } from "react";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { useVoiceAgent } from "./VoiceAgentContext";
import {
  getCurrentPlanStep,
  PLAN_STEP_PROMPTS,
  stepIndex,
  voiceMilestoneForPlanStep,
} from "@/lib/planner/planSteps";
import type { PlanState } from "@/lib/planner/types";

type PlannerVoiceBridgeProps = {
  planState: PlanState;
  updatePlan: (updates: Partial<PlanState>) => void;
  markMilestoneComplete: (milestoneId: string) => void;
};

export default function PlannerVoiceBridge({
  planState,
  updatePlan,
  markMilestoneComplete,
}: PlannerVoiceBridgeProps) {
  const { isNewTrip } = useDashboard();
  const {
    conversationActive,
    registerPlannerHandlers,
    unregisterPlannerHandlers,
    setPlannerMilestone,
    setFocusedPlanStep,
    announceMessage,
  } = useVoiceAgent();

  const planStateRef = useRef(planState);
  planStateRef.current = planState;

  const prevStepRef = useRef<string | null>(null);

  const currentStep = getCurrentPlanStep(planState);
  const voiceMilestone = voiceMilestoneForPlanStep(currentStep);

  /* Keep voice API context aligned with the Build-your-trip checklist */
  useEffect(() => {
    if (!isNewTrip) return;
    setPlannerMilestone(voiceMilestone);
  }, [isNewTrip, setPlannerMilestone, voiceMilestone]);

  useEffect(() => {
    registerPlannerHandlers({
      getPlanState: () => planStateRef.current,
      setFocusedPlanStep: (step) => {
        const current = getCurrentPlanStep(planStateRef.current);
        const focus = stepIndex(step) > stepIndex(current) ? current : step;
        setFocusedPlanStep(focus);
        setPlannerMilestone(voiceMilestoneForPlanStep(focus));
      },
      goToMilestone: (stepId) => {
        setPlannerMilestone(voiceMilestoneForPlanStep(stepId as typeof currentStep));
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
    setFocusedPlanStep,
    setPlannerMilestone,
    unregisterPlannerHandlers,
    updatePlan,
  ]);

  /* Announce the prompt for the new checklist step during voice planning */
  useEffect(() => {
    if (!isNewTrip || !conversationActive) {
      prevStepRef.current = currentStep;
      return;
    }

    if (prevStepRef.current === currentStep) return;
    prevStepRef.current = currentStep;

    const prompt = PLAN_STEP_PROMPTS[currentStep];
    if (prompt) {
      const t = window.setTimeout(() => announceMessage(prompt), 400);
      return () => window.clearTimeout(t);
    }
  }, [announceMessage, conversationActive, currentStep, isNewTrip]);

  return null;
}
