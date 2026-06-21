"use client";

import { motion } from "framer-motion";
import { Milestone } from "@/lib/planner/types";
import { easePremium } from "./ui/theme";

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

  const isStepComplete = (milestoneId: string, index: number) =>
    completedMilestones.includes(milestoneId) || index < activeIndex;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-black/[0.06] p-5">
        <h1 className="font-[family-name:var(--font-anton)] text-lg uppercase text-ink">
          Plan your trip
        </h1>
        <p className="mt-1 text-sm text-ink/55">Build your Dubai itinerary step by step.</p>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto p-4 lg:overflow-x-hidden">
        <div className="flex gap-2 lg:flex-col lg:gap-1">
          {milestones.map((milestone, index) => {
            const isActive = milestone.id === activeMilestone.id;
            const isCompleted = isStepComplete(milestone.id, index);

            return (
              <motion.button
                key={milestone.id}
                type="button"
                onClick={() => onSelect(milestone)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`flex min-w-[200px] items-center gap-3 rounded-xl p-3 text-left transition-colors lg:min-w-0 lg:w-full ${
                  isActive ? "bg-orange/10" : "hover:bg-black/[0.03]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? "bg-orange text-white"
                      : isCompleted
                        ? "bg-orange/15 text-orange"
                        : "bg-surface text-ink/40"
                  }`}
                >
                  {isCompleted && !isActive ? "✓" : milestone.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-sm font-semibold ${
                      isActive ? "text-ink" : isCompleted ? "text-ink/75" : "text-ink/45"
                    }`}
                  >
                    {milestone.label}
                  </span>
                  <span className="block text-xs text-ink/45">{milestone.description}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-black/[0.06] p-4">
        <div className="flex items-center justify-between text-xs font-medium text-ink/45">
          <span>
            {activeIndex + 1} of {milestones.length}
          </span>
          <span className="text-orange">{progressPercent}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
          <motion.div
            className="h-full rounded-full bg-orange"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: easePremium }}
          />
        </div>
      </div>
    </div>
  );
}
