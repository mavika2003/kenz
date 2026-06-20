"use client";

import { motion } from "framer-motion";
import { Milestone } from "@/lib/planner/types";

interface RoadmapProps {
  milestones: Milestone[];
  activeMilestone: Milestone;
  completedMilestones: string[];
  onSelect: (milestone: Milestone) => void;
}

export default function Roadmap({
  milestones,
  activeMilestone,
  completedMilestones,
  onSelect,
}: RoadmapProps) {
  const activeIndex = milestones.findIndex((m) => m.id === activeMilestone.id);
  const progressPercent = Math.round(((activeIndex + 1) / milestones.length) * 100);
  const stepsReached = activeIndex + 1;

  const isStepComplete = (milestoneId: string, index: number) =>
    completedMilestones.includes(milestoneId) || index < activeIndex;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b-2 border-[#141210] bg-[#ff6a00]">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-[#141210] flex items-center justify-center text-lg font-bold text-white">
            K
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#141210] uppercase tracking-wide">Kenz</h1>
            <p className="text-xs text-[#141210]/70 font-medium">Pre-Planning Hub</p>
          </div>
        </motion.div>
      </div>

      {/* Roadmap Timeline */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-[19px] top-3 bottom-3 w-[2px] bg-[#141210]/10" />

          {/* Animated progress line */}
          <motion.div
            className="absolute left-[19px] top-3 w-[2px] bg-[#ff6a00]"
            initial={{ height: 0 }}
            animate={{
              height: `${(activeIndex / (milestones.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          />

          {/* Milestone nodes */}
          <div className="space-y-1">
            {milestones.map((milestone, index) => {
              const isActive = milestone.id === activeMilestone.id;
              const isCompleted = isStepComplete(milestone.id, index);

              return (
                <motion.button
                  key={milestone.id}
                  onClick={() => onSelect(milestone)}
                  className={`relative w-full text-left p-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? "bg-[#ff6a00]/10"
                      : "hover:bg-[#141210]/[0.03]"
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    {/* Node indicator */}
                    <div className="relative flex-shrink-0">
                      {/* Glow effect for active node */}
                      {isActive && (
                        <motion.div
                          layoutId="activeGlow"
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: "radial-gradient(circle, rgba(255,106,0,0.3) 0%, transparent 70%)",
                            filter: "blur(8px)",
                            transform: "scale(2)",
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      )}

                      <motion.div
                        className={`relative w-10 h-10 rounded-full flex items-center justify-center text-base transition-all duration-300 border-2 ${
                          isActive
                            ? "bg-[#ff6a00] text-white border-[#141210] shadow-[3px_3px_0_#141210]"
                            : isCompleted
                            ? "bg-[#ff6a00]/20 text-[#ff6a00] border-[#ff6a00]"
                            : "bg-white text-[#141210]/40 border-[#141210]/20"
                        }`}
                        animate={
                          isActive
                            ? {
                                boxShadow: [
                                  "3px 3px 0 #141210",
                                  "5px 5px 0 #141210",
                                  "3px 3px 0 #141210",
                                ],
                              }
                            : {}
                        }
                        transition={
                          isActive
                            ? {
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }
                            : {}
                        }
                      >
                        {isCompleted && !isActive ? "✓" : milestone.icon}
                      </motion.div>

                      {/* Completed ring */}
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 rounded-full border-2 border-[#ff6a00]"
                        />
                      )}
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <motion.p
                        className={`font-bold text-sm transition-colors duration-300 ${
                          isActive
                            ? "text-[#141210]"
                            : isCompleted
                            ? "text-[#141210]/80"
                            : "text-[#141210]/50"
                        }`}
                      >
                        {milestone.label}
                      </motion.p>
                      <p
                        className={`text-xs mt-0.5 transition-colors duration-300 ${
                          isActive
                            ? "text-[#ff6a00]"
                            : "text-[#141210]/40"
                        }`}
                      >
                        {milestone.description}
                      </p>
                    </div>

                    {/* Status indicator */}
                    {(isActive || isCompleted) && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`w-2 h-2 rounded-full ${
                          isActive
                            ? "bg-[#ff6a00] shadow-[0_0_8px_rgba(255,106,0,0.8)]"
                            : "bg-[#10b981]"
                        }`}
                      />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t-2 border-[#141210] bg-[#fbf3e4]">
        <div className="flex items-center justify-between text-xs text-[#141210]/50 font-medium">
          <span>
            {stepsReached} of {milestones.length} steps
          </span>
          <span className="text-[#ff6a00]">{progressPercent}%</span>
        </div>
        <div className="mt-2 h-2 bg-[#141210]/10 rounded-full overflow-hidden border border-[#141210]/10">
          <motion.div
            className="h-full bg-[#ff6a00] rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${progressPercent}%`,
            }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>
      </div>
    </div>
  );
}
