"use client";

import { motion } from "framer-motion";
import { PlanState, TravelStyle } from "@/lib/planner/types";
import { DUBAI_DATA } from "@/lib/planner/data";

interface StylePanelProps {
  planState: PlanState;
  updatePlan: (updates: Partial<PlanState>) => void;
}

const styles: { id: TravelStyle; name: string; icon: string; description: string; color: string }[] = [
  {
    id: "luxury",
    name: "Luxury",
    icon: "💎",
    description: "Premium hotels, fine dining, private experiences",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: "balanced",
    name: "Balanced",
    icon: "⚖️",
    description: "Mix of comfort and value, curated experiences",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "budget",
    name: "Budget",
    icon: "💰",
    description: "Smart spending, local gems, authentic experiences",
    color: "from-emerald-500/20 to-teal-500/20",
  },
  {
    id: "backpacker",
    name: "Backpacker",
    icon: "🎒",
    description: "Hostels, street food, public transport, adventure",
    color: "from-orange-500/20 to-amber-500/20",
  },
];

export default function StylePanel({ planState, updatePlan }: StylePanelProps) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Intro */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[#141210] mb-3">What&apos;s your travel style?</h3>
        <p className="text-[#141210]/60">
          This shapes your accommodation, transport, and activity recommendations.
        </p>
      </div>

      {/* Style Cards - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-4">
        {styles.map((style, index) => {
          const isSelected = planState.travelStyle === style.id;
          const range = DUBAI_DATA.budgetRanges[style.id];

          return (
            <motion.button
              key={style.id}
              onClick={() => updatePlan({ travelStyle: style.id })}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 text-left
                ${
                  isSelected
                    ? "border-[#ff6a00] bg-[#ff6a00]/10 shadow-[4px_4px_0_#141210]"
                    : "border-[#141210]/20 bg-white hover:border-[#ff6a00]/50 hover:shadow-[2px_2px_0_#141210]"
                }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="styleGlow"
                  className="absolute inset-0 rounded-2xl bg-[#ff6a00]/10"
                  transition={{ duration: 0.3 }}
                />
              )}

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{style.icon}</span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-[#ff6a00] flex items-center justify-center border border-[#141210]"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </div>

                <h4 className="text-lg font-bold text-[#141210] mb-2">{style.name}</h4>
                <p className="text-sm text-[#141210]/60 mb-4">{style.description}</p>

                <div className="pt-4 border-t-2 border-[#141210]/10">
                  <span className="text-xs text-[#141210]/40">Budget range: </span>
                  <span className="text-sm font-bold text-[#ff6a00]">
                    ${range.min.toLocaleString()} - ${range.max.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Impact Preview */}
      {planState.travelStyle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-[#fbf3e4] border-2 border-[#141210]/10"
        >
          <h4 className="text-sm font-bold text-[#141210] mb-4 uppercase tracking-wide">What this means for your trip</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white border-2 border-[#141210]/10">
              <p className="text-xs text-[#141210]/50 mb-1">Accommodation</p>
              <p className="text-sm text-[#141210]">
                {planState.travelStyle === "luxury"
                  ? "5-star hotels & resorts"
                  : planState.travelStyle === "balanced"
                  ? "4-star hotels & quality Airbnbs"
                  : planState.travelStyle === "budget"
                  ? "3-star hotels & budget rentals"
                  : "Hostels & shared accommodation"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white border-2 border-[#141210]/10">
              <p className="text-xs text-[#141210]/50 mb-1">Transport</p>
              <p className="text-sm text-[#141210]">
                {planState.travelStyle === "luxury"
                  ? "Private transfers & chauffeur"
                  : planState.travelStyle === "balanced"
                  ? "Taxis & metro mix"
                  : "Metro with NOL card"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white border-2 border-[#141210]/10">
              <p className="text-xs text-[#141210]/50 mb-1">Dining</p>
              <p className="text-sm text-[#141210]">
                {planState.travelStyle === "luxury"
                  ? "Fine dining & rooftop venues"
                  : planState.travelStyle === "balanced"
                  ? "Mix of restaurants & cafes"
                  : "Local eateries & street food"}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
