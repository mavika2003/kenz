"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Milestone, PlanState } from "@/lib/planner/types";
import DestinationPanel from "./panels/DestinationPanel";
import StylePanel from "./panels/StylePanel";
import TimelinePanel from "./panels/TimelinePanel";
import LogisticsPanel from "./panels/LogisticsPanel";
import ReviewPanel from "./panels/ReviewPanel";

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
  enter: {
    opacity: 0,
    x: 20,
    scale: 0.98,
  },
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    x: -20,
    scale: 0.98,
  },
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
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b-2 border-[#141210] bg-white">
        <motion.div
          key={activeMilestone.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeMilestone.icon}</span>
            <div>
              <h2 className="text-lg font-bold text-[#141210] uppercase tracking-wide">
                {activeMilestone.label}
              </h2>
              <p className="text-sm text-[#141210]/50">{activeMilestone.description}</p>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-[#141210]/40 uppercase tracking-wider font-medium">
            Step {["destination", "style", "timeline", "logistics", "review"].indexOf(activeMilestone.id) + 1} of 5
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMilestone.id}
            variants={panelVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="h-full overflow-y-auto p-8"
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

      {/* Footer Actions */}
      <div className="px-8 py-6 border-t-2 border-[#141210] flex items-center justify-between bg-white">
        <div />
        <motion.button
          onClick={onComplete}
          disabled={
            isSaving ||
            (activeMilestone.id === "destination" && !planState.destination) ||
            (activeMilestone.id === "style" && !planState.travelStyle) ||
            (activeMilestone.id === "logistics" && (!planState.accommodation || !planState.transport))
          }
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-[#ff6a00] text-white font-bold rounded-lg border-2 border-[#141210] shadow-[3px_3px_0_#141210]
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300
                     hover:shadow-[5px_5px_0_#141210] hover:-translate-y-0.5"
        >
          {isSaving
            ? "Saving..."
            : activeMilestone.id === "review"
            ? "Export Plan"
            : "Continue"}
        </motion.button>
      </div>
    </div>
  );
}
