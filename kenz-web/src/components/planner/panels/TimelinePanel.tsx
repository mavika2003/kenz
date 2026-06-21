"use client";

import { motion } from "framer-motion";
import { PlanState } from "@/lib/planner/types";
import { getSeasonalAdvice } from "@/lib/planner/data";
import PlannerBezel from "../ui/PlannerBezel";
import PlannerButton from "../ui/PlannerButton";

interface TimelinePanelProps {
  planState: PlanState;
  updatePlan: (updates: Partial<PlanState>) => void;
}

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function TimelinePanel({ planState, updatePlan }: TimelinePanelProps) {
  const seasonalAdvice = planState.startDate
    ? getSeasonalAdvice(planState.startDate.getMonth())
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="max-w-xl">
        <h3 className="font-[family-name:var(--font-anton)] text-2xl uppercase text-ink">
          When are you traveling?
        </h3>
        <p className="mt-3 text-ink/60">
          Set your group size and dates. Dubai changes a lot by season.
        </p>
      </div>

      <PlannerBezel innerClassName="p-6">
        <label className="text-sm font-semibold text-ink">Number of travelers</label>
        <div className="mt-4 flex items-center gap-4">
          <PlannerButton
            variant="secondary"
            className="!h-11 !w-11 !rounded-xl !px-0"
            onClick={() => updatePlan({ travelers: Math.max(1, planState.travelers - 1) })}
          >
            -
          </PlannerButton>
          <motion.span
            key={planState.travelers}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-12 text-center font-[family-name:var(--font-anton)] text-3xl text-ink"
          >
            {planState.travelers}
          </motion.span>
          <PlannerButton
            variant="secondary"
            className="!h-11 !w-11 !rounded-xl !px-0"
            onClick={() => updatePlan({ travelers: Math.min(10, planState.travelers + 1) })}
          >
            +
          </PlannerButton>
        </div>
      </PlannerBezel>

      <PlannerBezel innerClassName="p-6">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-ink">Trip duration</label>
          <span className="font-[family-name:var(--font-anton)] text-xl text-orange">
            {planState.duration} days
          </span>
        </div>
        <input
          type="range"
          min="3"
          max="21"
          value={planState.duration}
          onChange={(e) => updatePlan({ duration: parseInt(e.target.value) })}
          className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-black/[0.08] accent-orange"
        />
        <div className="mt-2 flex justify-between text-xs text-ink/45">
          <span>3 days</span>
          <span>21 days</span>
        </div>
      </PlannerBezel>

      <PlannerBezel innerClassName="p-6">
        <label className="text-sm font-semibold text-ink">Start month</label>
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {months.map((month, index) => {
            const isSelected = planState.startDate?.getMonth() === index;
            return (
              <button
                key={month}
                type="button"
                onClick={() => {
                  const date = new Date();
                  date.setMonth(index);
                  updatePlan({ startDate: date });
                }}
                className={`rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.98] ${
                  isSelected
                    ? "bg-orange text-white"
                    : "bg-surface text-ink/65 hover:ring-1 hover:ring-orange/30"
                }`}
              >
                {month}
              </button>
            );
          })}
        </div>
      </PlannerBezel>

      {seasonalAdvice && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <PlannerBezel innerClassName="p-6">
            <p className="font-semibold text-ink">{seasonalAdvice.season}</p>
            <p className="mt-1 text-sm text-ink/55">
              {seasonalAdvice.weather}, {seasonalAdvice.crowds} crowds, {seasonalAdvice.pricing}
            </p>
            <ul className="mt-4 space-y-2">
              {seasonalAdvice.advice.map((tip, i) => (
                <li key={i} className="text-sm text-ink/65">
                  {tip}
                </li>
              ))}
            </ul>
          </PlannerBezel>
        </motion.div>
      )}
    </div>
  );
}
