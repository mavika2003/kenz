"use client";

import { motion } from "framer-motion";
import { PlanState, AccommodationType, TransportMode } from "@/lib/planner/types";
import { ACCOMMODATION_DATA, DUBAI_DATA } from "@/lib/planner/data";

interface LogisticsPanelProps {
  planState: PlanState;
  updatePlan: (updates: Partial<PlanState>) => void;
}

const accommodationTypes: { id: AccommodationType; icon: string }[] = [
  { id: "hotel", icon: "🏨" },
  { id: "airbnb", icon: "🏠" },
  { id: "hostel", icon: "🛏️" },
  { id: "resort", icon: "🏖️" },
];

export default function LogisticsPanel({ planState, updatePlan }: LogisticsPanelProps) {
  const selectedTransport = DUBAI_DATA.transportOptions.find(
    (t) => t.mode === planState.transport
  );

  // Budget-based transport recommendations
  const getRecommendedTransport = () => {
    if (planState.travelStyle === "luxury") return "taxi";
    if (planState.travelStyle === "backpacker") return "metro";
    return "mixed";
  };

  const recommended = getRecommendedTransport();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Intro */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[#141210] mb-3">Where will you stay?</h3>
        <p className="text-[#141210]/60">
          Choose your accommodation type. This affects your budget significantly in the Emirates.
        </p>
      </div>

      {/* Accommodation Cards */}
      <div className="grid grid-cols-4 gap-4">
        {accommodationTypes.map((acc, index) => {
          const isSelected = planState.accommodation === acc.id;
          const data = ACCOMMODATION_DATA[acc.id];
          const priceRange = DUBAI_DATA.budgetRanges[planState.travelStyle || "balanced"];
          const baseDaily = (priceRange.min + priceRange.max) / 2 / 7;
          const estimatedCost = Math.round(baseDaily * 0.5 * data.priceMultiplier);

          return (
            <motion.button
              key={acc.id}
              onClick={() => updatePlan({ accommodation: acc.id })}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left
                ${
                  isSelected
                    ? "border-[#ff6a00] bg-[#ff6a00]/10 shadow-[3px_3px_0_#141210]"
                    : "border-[#141210]/20 bg-white hover:border-[#ff6a00]/50 hover:shadow-[2px_2px_0_#141210]"
                }`}
            >
              <span className="text-3xl mb-3 block">{acc.icon}</span>
              <h4 className="font-bold text-[#141210] text-sm mb-1">{data.name}</h4>
              <p className="text-xs text-[#141210]/50 leading-relaxed mb-3">{data.description}</p>

              {"note" in data && data.note && (
                <p className="text-[10px] text-[#d94e00] mt-2">⚠️ {data.note}</p>
              )}

              <div className="mt-3 pt-3 border-t-2 border-[#141210]/10">
                <span className="text-xs text-[#141210]/40">~</span><span className="text-sm font-bold text-[#ff6a00]">${estimatedCost}</span><span className="text-xs text-[#141210]/40">/night</span>
              </div>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#ff6a00] flex items-center justify-center border border-[#141210]"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Transport Section */}
      <div className="pt-4">
        <h4 className="text-lg font-bold text-[#141210] mb-2 uppercase tracking-wide">How will you get around?</h4>
        <p className="text-sm text-[#141210]/50 mb-6">
          Transport choice significantly impacts your Dubai experience. Based on your{" "}
          <span className="text-[#ff6a00] font-bold">{planState.travelStyle}</span> style, we recommend{" "}
          <span className="text-[#10b981] font-bold capitalize">{recommended}</span>.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {DUBAI_DATA.transportOptions.map((option, index) => {
            const isSelected = planState.transport === option.mode;
            const isRecommended = option.mode === recommended;

            return (
              <motion.button
                key={option.mode}
                onClick={() => updatePlan({ transport: option.mode })}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.08 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left
                  ${
                    isSelected
                      ? "border-[#ff6a00] bg-[#ff6a00]/10 shadow-[3px_3px_0_#141210]"
                      : "border-[#141210]/20 bg-white hover:border-[#ff6a00]/50 hover:shadow-[2px_2px_0_#141210]"
                  }`}
              >
                {isRecommended && !isSelected && (
                  <span className="absolute -top-2 left-4 px-2 py-0.5 bg-[#10b981] text-white text-[10px] font-bold rounded-full border border-[#141210]">
                    Recommended
                  </span>
                )}

                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-bold text-[#141210] capitalize">{option.mode}</h5>
                  <span className="text-lg">
                    {option.mode === "metro" && "🚇"}
                    {option.mode === "taxi" && "🚕"}
                    {option.mode === "rental" && "🚗"}
                    {option.mode === "mixed" && "🔄"}
                  </span>
                </div>

                <p className="text-sm text-[#141210]/60 mb-3">{option.description}</p>

                {/* NOL Card indicator */}
                {option.nolCard && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#fbf3e4] border border-[#141210]/10 mb-3">
                    <span className="text-lg">💳</span>
                    <div>
                      <p className="text-xs font-bold text-[#141210]">NOL {option.nolCard.type} Card</p>
                      <p className="text-[10px] text-[#141210]/50">AED {option.nolCard.cost} • {option.nolCard.recommended ? "Recommended" : "Optional"}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t-2 border-[#141210]/10">
                  <span className="text-xs text-[#141210]/40">Daily cost</span>
                  <span className="text-sm font-bold text-[#141210]">~${option.dailyCost}</span>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#ff6a00] flex items-center justify-center border border-[#141210]"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Budget Impact */}
      {planState.accommodation && planState.transport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl bg-[#10b981]/10 border-2 border-[#10b981]"
        >
          <h5 className="font-bold text-[#10b981] mb-3">Smart Choice Analysis</h5>
          <div className="space-y-2">
            {planState.travelStyle === "budget" && planState.transport !== "metro" && (
              <p className="text-sm text-[#141210]/70">
                💡 <span className="text-[#ff6a00] font-bold">Savings opportunity:</span> Switch to NOL Silver Card 
                to save ~${(selectedTransport?.dailyCost || 40) - 8} per day
              </p>
            )}
            {planState.destination === "both" && (
              <p className="text-sm text-[#141210]/70">
                🚌 <span className="text-[#ff6a00] font-bold">Inter-city:</span> Add E100/E101 bus (AED 25) 
                or Careem (AED 150-200) between Dubai and Abu Dhabi
              </p>
            )}
            <p className="text-sm text-[#141210]/70">
              📍 <span className="text-[#ff6a00] font-bold">Best areas:</span>{" "}
              {ACCOMMODATION_DATA[planState.accommodation].dubaiAreas.join(", ")}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
