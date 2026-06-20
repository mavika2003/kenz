"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PlanState } from "@/lib/planner/types";
import { calculateBudget, DUBAI_DATA, getSeasonalAdvice } from "@/lib/planner/data";

interface ContextualFeedProps {
  planState: PlanState;
}

export default function ContextualFeed({ planState }: ContextualFeedProps) {
  const hasEnoughData = planState.destination && planState.travelStyle && planState.accommodation && planState.transport;

  const budget = hasEnoughData
    ? calculateBudget(
        planState.travelStyle!,
        planState.duration,
        planState.travelers,
        planState.accommodation!,
        planState.transport!,
        planState.destination!
      )
    : null;

  const seasonalAdvice = planState.startDate ? getSeasonalAdvice(planState.startDate.getMonth()) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b-2 border-[#141210] bg-[#ff6a00]">
        <h2 className="text-sm font-bold text-[#141210] uppercase tracking-wider">Trip Overview</h2>
        <p className="text-xs text-[#141210]/70 mt-1">Real-time estimates & compliance</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Budget Summary */}
        <AnimatePresence mode="wait">
          {budget ? (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-5 rounded-xl bg-white border-2 border-[#141210] shadow-[3px_3px_0_#141210]"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">💰</span>
                <h3 className="font-bold text-[#141210] uppercase tracking-wide text-sm">Estimated Budget</h3>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-[#ff6a00]">${budget.total.toLocaleString()}</span>
                <p className="text-xs text-[#141210]/50 mt-1">
                  ${budget.perPerson.toLocaleString()} per person • {planState.duration} days
                </p>
              </div>

              <div className="space-y-2">
                {Object.entries(budget.breakdown).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between text-sm">
                    <span className="text-[#141210]/60 capitalize font-medium">{category}</span>
                    <span className="text-[#141210] font-bold">${amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {budget.recommendations.length > 0 && (
                <div className="mt-4 pt-4 border-t-2 border-[#141210]/10">
                  <p className="text-xs text-[#ff6a00] font-bold mb-2 uppercase tracking-wide">💡 Savings Tips</p>
                  <ul className="space-y-1">
                    {budget.recommendations.slice(0, 2).map((rec, i) => (
                      <li key={i} className="text-xs text-[#141210]/50 leading-relaxed">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty-budget"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-5 rounded-xl bg-white border-2 border-[#141210]/20 border-dashed"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg opacity-50">💰</span>
                <h3 className="font-bold text-[#141210]/50 uppercase tracking-wide text-sm">Budget Estimate</h3>
              </div>
              <p className="text-xs text-[#141210]/30">Complete all steps to see your personalized budget breakdown</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Seasonal Info */}
        {seasonalAdvice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-white border-2 border-[#141210]/10"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">
                {seasonalAdvice.season === "Peak Season" ? "🌟" : seasonalAdvice.season === "Low Season" ? "☀️" : "🌤️"}
              </span>
              <h3 className="font-bold text-[#141210]">{seasonalAdvice.season}</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#141210]/50">Weather</span>
                <span className="text-sm text-[#141210] font-bold">{seasonalAdvice.weather}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#141210]/50">Crowds</span>
                <span className="text-sm text-[#141210] font-bold">{seasonalAdvice.crowds}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#141210]/50">Pricing</span>
                <span className={`text-sm font-bold ${seasonalAdvice.pricing.includes("-") ? "text-[#10b981]" : "text-[#ff6a00]"}`}>
                  {seasonalAdvice.pricing}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Compliance & Legal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-xl bg-white border-2 border-[#d94e00]"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">⚠️</span>
            <h3 className="font-bold text-[#d94e00]">2026 Compliance Alert</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full mt-1.5 ${DUBAI_DATA.compliance.passportScanRequired ? "bg-[#d94e00]" : "bg-[#10b981]"}`} />
              <div>
                <p className="text-sm text-[#141210] font-bold">Passport Cover-Page Scan</p>
                <p className="text-xs text-[#141210]/50">Mandatory for all visa applications in 2026</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-[#d94e00] mt-1.5" />
              <div>
                <p className="text-sm text-[#141210] font-bold">Zero Grace Period</p>
                <p className="text-xs text-[#141210]/50">Visit visa overstays result in immediate ban + fines</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-[#ffd23f] mt-1.5" />
              <div>
                <p className="text-sm text-[#141210] font-bold">Dress Code</p>
                <p className="text-xs text-[#141210]/50">Shoulders & knees covered in public spaces</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* NOL Card Highlight (Budget Transport) */}
        {planState.transport === "metro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-white border-2 border-[#10b981]"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💳</span>
              <h3 className="font-bold text-[#141210]">NOL Silver Card</h3>
            </div>
            <p className="text-xs text-[#141210]/60 mb-3">
              Essential for Metro, buses, and trams across Dubai & Abu Dhabi
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#141210]/50">Card cost</span>
              <span className="text-[#10b981] font-bold">AED 25</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-[#141210]/50">Daily transport</span>
              <span className="text-[#10b981] font-bold">~AED 30</span>
            </div>
          </motion.div>
        )}

        {/* Transport Reality Check */}
        {(planState.travelStyle === "budget" || planState.travelStyle === "backpacker") &&
          planState.transport &&
          planState.transport !== "metro" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-[#ffd23f]/20 border-2 border-[#ffd23f]"
            >
              <p className="text-xs text-[#141210]">
                💡 Consider switching to <strong>NOL Silver Card</strong> to save up to 
                <strong className="text-[#ff6a00]"> ${(DUBAI_DATA.transportOptions.find(t => t.mode === planState.transport)?.dailyCost || 40) - 8}</strong> per day on transport
              </p>
            </motion.div>
          )}

        {/* Cultural Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-xl bg-white border-2 border-[#141210]/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🤝</span>
            <h3 className="font-bold text-[#141210]">Cultural Awareness</h3>
          </div>

          <ul className="space-y-2">
            {DUBAI_DATA.compliance.culturalNotes.map((note, i) => (
              <li key={i} className="text-xs text-[#141210]/50 flex items-start gap-2">
                <span className="text-[#ff6a00] font-bold mt-0.5">•</span>
                {note}
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t-2 border-[#141210]/10">
            <p className="text-xs text-[#141210]/30">{DUBAI_DATA.compliance.alcoholRestrictions}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
