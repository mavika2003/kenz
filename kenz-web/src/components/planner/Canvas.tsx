"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Milestone, PlanState } from "@/lib/planner/types";
import DestinationPanel from "./panels/DestinationPanel";
import StylePanel from "./panels/StylePanel";
import TimelinePanel from "./panels/TimelinePanel";
import LogisticsPanel from "./panels/LogisticsPanel";
import ReviewPanel from "./panels/ReviewPanel";
import PlannerButton from "./ui/PlannerButton";
import { easePremium } from "./ui/theme";

interface CanvasProps {
  activeMilestone: Milestone;
  planState: PlanState;
  updatePlan: (updates: Partial<PlanState>) => void;
  onComplete: () => void;
  onDownloadPdf: () => void;
  onShareLink: () => void;
  onSaveTrip: () => void;
  isSaving?: boolean;
}

const panelVariants = {
  enter: { opacity: 0, y: 20, filter: "blur(4px)" },
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, filter: "blur(4px)" },
};

export default function Canvas({
  activeMilestone,
  planState,
  updatePlan,
  onComplete,
  onDownloadPdf,
  onShareLink,
  onSaveTrip,
  isSaving = false,
}: CanvasProps) {
  const isDisabled =
    isSaving ||
    (activeMilestone.id === "destination" && !planState.destination) ||
    (activeMilestone.id === "style" && !planState.travelStyle) ||
    (activeMilestone.id === "logistics" && (!planState.accommodation || !planState.transport));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5 md:px-8">
        <motion.div
          key={activeMilestone.id}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easePremium }}
        >
          <h2 className="font-[family-name:var(--font-anton)] text-xl uppercase text-ink md:text-2xl">
            {activeMilestone.label}
          </h2>
          <p className="mt-1 text-sm text-ink/55">{activeMilestone.description}</p>
        </motion.div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMilestone.id}
            variants={panelVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: easePremium }}
            className="h-full overflow-y-auto px-6 py-8 md:px-8"
          >
            {activeMilestone.id === "destination" && (
              <DestinationPanel planState={planState} updatePlan={updatePlan} />
            )}
            {activeMilestone.id === "style" && (
              <StylePanel planState={planState} updatePlan={updatePlan} />
            )}
            {activeMilestone.id === "timeline" && (
              <TimelinePanel planState={planState} updatePlan={updatePlan} />
            )}
            {activeMilestone.id === "logistics" && (
              <LogisticsPanel planState={planState} updatePlan={updatePlan} />
            )}
            {activeMilestone.id === "review" && (
              <ReviewPanel
                planState={planState}
                onDownloadPdf={onDownloadPdf}
                onShareLink={onShareLink}
                onSaveTrip={onSaveTrip}
                isSaving={isSaving}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {activeMilestone.id !== "review" && (
        <div className="flex justify-end border-t border-black/[0.06] px-6 py-5 md:px-8">
          <PlannerButton onClick={onComplete} disabled={isDisabled}>
            {isSaving ? "Saving..." : "Continue"}
          </PlannerButton>
        </div>
      )}
    </div>
  );
}
