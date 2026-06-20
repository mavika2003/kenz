"use client";

import { motion } from "framer-motion";
import { PlanState, Destination } from "@/lib/planner/types";
import { DESTINATION_DATA } from "@/lib/planner/data";

interface DestinationPanelProps {
  planState: PlanState;
  updatePlan: (updates: Partial<PlanState>) => void;
}

const destinations: { id: Destination; name: string; icon: string; color: string }[] = [
  { id: "dubai", name: "Dubai", icon: "🏙️", color: "from-blue-500/20 to-cyan-500/20" },
  { id: "abu-dhabi", name: "Abu Dhabi", icon: "🕌", color: "from-emerald-500/20 to-teal-500/20" },
  { id: "both", name: "Both Cities", icon: "✈️", color: "from-orange-500/20 to-amber-500/20" },
];

export default function DestinationPanel({ planState, updatePlan }: DestinationPanelProps) {
  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-2xl font-bold text-[#141210] mb-3">Where are you headed?</h3>
        <p className="text-[#141210]/60">
          Select your primary destination. Each offers a unique perspective of the Emirates.
        </p>
      </div>

      {/* Destination Cards */}
      <div className="grid grid-cols-3 gap-4">
        {destinations.map((dest, index) => {
          const isSelected = planState.destination === dest.id;
          const data = DESTINATION_DATA[dest.id];

          return (
            <motion.button
              key={dest.id}
              onClick={() => updatePlan({ destination: dest.id })}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 text-left
                ${
                  isSelected
                    ? "border-[#ff6a00] bg-[#ff6a00]/10 shadow-[4px_4px_0_#141210]"
                    : "border-[#141210]/20 bg-white hover:border-[#ff6a00]/50 hover:shadow-[2px_2px_0_#141210]"
                }`}
            >
              {/* Selection glow */}
              {isSelected && (
                <motion.div
                  layoutId="destGlow"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ff6a00]/20 to-[#d94e00]/20"
                  transition={{ duration: 0.3 }}
                />
              )}

              <div className="relative z-10">
                <span className="text-4xl mb-4 block">{dest.icon}</span>
                <h4 className="text-lg font-bold text-[#141210] mb-1">{dest.name}</h4>
                <p className="text-xs text-[#141210]/50 leading-relaxed">{data.tagline}</p>

                {/* Highlights */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {data.highlights.slice(0, 2).map((highlight) => (
                    <span
                      key={highlight}
                      className="px-2 py-0.5 text-[10px] bg-[#141210]/5 rounded-full text-[#141210]/70 border border-[#141210]/10"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                {/* Cost indicator */}
                <div className="mt-4 pt-4 border-t-2 border-[#141210]/10">
                  <span className="text-xs text-[#141210]/40">From </span>
                  <span className="text-sm font-bold text-[#ff6a00]">
                    ${data.estimatedDailyCost}
                  </span>
                  <span className="text-xs text-[#141210]/40">/day</span>
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#ff6a00] flex items-center justify-center border border-[#141210]"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Flow Preview */}
      {planState.destination && (
        <FlowPreview destination={planState.destination} />
      )}
    </div>
  );
}

function FlowPreview({ destination }: { destination: Destination }) {
  const data = DESTINATION_DATA[destination];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl bg-[#fbf3e4] border-2 border-[#141210]/10"
    >
      <h4 className="text-sm font-bold text-[#141210] mb-4 uppercase tracking-wide">
        {data.name} Flow
      </h4>
      <div className="flex items-center gap-3 flex-wrap">
        {data.highlights.map((highlight, i) => (
          <div key={highlight} className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="px-3 py-2 rounded-lg bg-white border-2 border-[#141210]/20 text-sm text-[#141210]/70 whitespace-nowrap"
            >
              {highlight}
            </motion.div>
            {i < data.highlights.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.05 }}
                className="text-[#ff6a00] font-bold"
              >
                →
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
