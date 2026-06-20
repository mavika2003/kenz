"use client";

import { motion } from "framer-motion";
import { PlanState } from "@/lib/planner/types";
import { getSeasonalAdvice } from "@/lib/planner/data";

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
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Intro */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[#141210] mb-3">When are you traveling?</h3>
        <p className="text-[#141210]/60">
          Select your travel dates and group size. Dubai experiences vary greatly by season.
        </p>
      </div>

      {/* Travelers */}
      <div className="p-6 rounded-xl bg-white border-2 border-[#141210]/10">
        <label className="text-sm font-bold text-[#141210] mb-4 block uppercase tracking-wide">Number of travelers</label>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updatePlan({ travelers: Math.max(1, planState.travelers - 1) })}
            className="w-12 h-12 rounded-xl bg-[#fbf3e4] border-2 border-[#141210] hover:bg-[#ff6a00] hover:text-white flex items-center justify-center text-[#141210] text-xl transition-colors font-bold shadow-[2px_2px_0_#141210]"
          >
            −
          </motion.button>
          <motion.span
            key={planState.travelers}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold text-[#141210] w-16 text-center"
          >
            {planState.travelers}
          </motion.span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updatePlan({ travelers: Math.min(10, planState.travelers + 1) })}
            className="w-12 h-12 rounded-xl bg-[#fbf3e4] border-2 border-[#141210] hover:bg-[#ff6a00] hover:text-white flex items-center justify-center text-[#141210] text-xl transition-colors font-bold shadow-[2px_2px_0_#141210]"
          >
            +
          </motion.button>
        </div>
      </div>

      {/* Duration */}
      <div className="p-6 rounded-xl bg-white border-2 border-[#141210]/10">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-bold text-[#141210] uppercase tracking-wide">Trip duration</label>
          <span className="text-lg font-bold text-[#ff6a00]">{planState.duration} days</span>
        </div>
        <input
          type="range"
          min="3"
          max="21"
          value={planState.duration}
          onChange={(e) => updatePlan({ duration: parseInt(e.target.value) })}
          className="w-full h-2 bg-[#141210]/10 rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ff6a00] 
                     [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#141210]
                     [&::-webkit-slider-thumb]:shadow-[2px_2px_0_#141210]"
        />
        <div className="flex justify-between mt-2 text-xs text-[#141210]/40 font-medium">
          <span>3 days</span>
          <span>21 days</span>
        </div>
      </div>

      {/* Month Selector */}
      <div className="p-6 rounded-xl bg-white border-2 border-[#141210]/10">
        <label className="text-sm font-bold text-[#141210] mb-4 block uppercase tracking-wide">Start month</label>
        <div className="grid grid-cols-6 gap-2">
          {months.map((month, index) => {
            const isSelected = planState.startDate?.getMonth() === index;
            return (
              <motion.button
                key={month}
                onClick={() => {
                  const date = new Date();
                  date.setMonth(index);
                  updatePlan({ startDate: date });
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`py-3 rounded-lg text-sm font-bold transition-all duration-200 border-2
                  ${
                    isSelected
                      ? "bg-[#ff6a00] text-white border-[#141210] shadow-[2px_2px_0_#141210]"
                      : "bg-[#fbf3e4] text-[#141210]/70 border-[#141210]/20 hover:border-[#ff6a00]"
                  }`}
              >
                {month}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Seasonal Advice */}
      {seasonalAdvice && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl border-2 ${
            seasonalAdvice.season === "Peak Season"
              ? "bg-[#ff6a00]/10 border-[#ff6a00]"
              : seasonalAdvice.season === "Low Season"
              ? "bg-blue-50 border-blue-200"
              : "bg-emerald-50 border-emerald-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">
              {seasonalAdvice.season === "Peak Season" ? "🌟" : seasonalAdvice.season === "Low Season" ? "☀️" : "🌤️"}
            </span>
            <div>
              <h4 className="font-bold text-[#141210]">{seasonalAdvice.season}</h4>
              <p className="text-sm text-[#141210]/60">
                {seasonalAdvice.weather} • {seasonalAdvice.crowds} crowds • {seasonalAdvice.pricing}
              </p>
            </div>
          </div>
          <ul className="space-y-2">
            {seasonalAdvice.advice.map((tip, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-2 text-sm text-[#141210]/70"
              >
                <span className="text-[#ff6a00] font-bold mt-0.5">•</span>
                {tip}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
