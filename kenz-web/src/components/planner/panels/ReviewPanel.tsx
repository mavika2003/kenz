"use client";

import { motion } from "framer-motion";
import { PlanState } from "@/lib/planner/types";
import { calculateBudget, DESTINATION_DATA, ACCOMMODATION_DATA, DUBAI_DATA } from "@/lib/planner/data";
import FlowDiagram from "../FlowDiagram";

interface ReviewPanelProps {
  planState: PlanState;
  onDownloadPdf: () => void;
  onShareLink: () => void;
  onSaveTrip: () => void;
  isSaving?: boolean;
}

export default function ReviewPanel({
  planState,
  onDownloadPdf,
  onShareLink,
  onSaveTrip,
  isSaving = false,
}: ReviewPanelProps) {
  const budget = calculateBudget(
    planState.travelStyle || "balanced",
    planState.duration,
    planState.travelers,
    planState.accommodation || "hotel",
    planState.transport || "mixed",
    planState.destination || "dubai"
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Intro */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[#141210] mb-3">Your trip plan is ready</h3>
        <p className="text-[#141210]/60">
          Review your selections below. You can export this plan or modify any section.
        </p>
      </div>

      {/* Trip Flow Visualization */}
      <div className="p-6 rounded-xl bg-[#fbf3e4] border-2 border-[#141210]/10">
        <h4 className="text-sm font-bold text-[#141210] mb-4 uppercase tracking-wide">Trip Flow</h4>
        <FlowDiagram planState={planState} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl bg-white border-2 border-[#141210]/10 shadow-[2px_2px_0_#141210]"
        >
          <span className="text-2xl mb-3 block">
            {planState.destination ? DESTINATION_DATA[planState.destination].icon : "🌍"}
          </span>
          <p className="text-xs text-[#141210]/50 uppercase tracking-wider font-bold">Destination</p>
          <p className="text-lg font-bold text-[#141210] mt-1">
            {planState.destination
              ? DESTINATION_DATA[planState.destination].name
              : "Not selected"}
          </p>
          <p className="text-xs text-[#141210]/40 mt-2">
            {planState.duration} days • {planState.travelers} travelers
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-xl bg-white border-2 border-[#141210]/10 shadow-[2px_2px_0_#141210]"
        >
          <span className="text-2xl mb-3 block">
            {planState.travelStyle === "luxury" && "💎"}
            {planState.travelStyle === "balanced" && "⚖️"}
            {planState.travelStyle === "budget" && "💰"}
            {planState.travelStyle === "backpacker" && "🎒"}
            {!planState.travelStyle && "✨"}
          </span>
          <p className="text-xs text-[#141210]/50 uppercase tracking-wider font-bold">Style</p>
          <p className="text-lg font-bold text-[#141210] mt-1 capitalize">
            {planState.travelStyle || "Not selected"}
          </p>
          <p className="text-xs text-[#141210]/40 mt-2">
            {planState.accommodation
              ? ACCOMMODATION_DATA[planState.accommodation].name
              : "No accommodation"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-xl bg-[#ff6a00] border-2 border-[#141210] shadow-[3px_3px_0_#141210]"
        >
          <span className="text-2xl mb-3 block">💵</span>
          <p className="text-xs text-white/80 uppercase tracking-wider font-bold">Estimated Total</p>
          <p className="text-2xl font-bold text-white mt-1">${budget.total.toLocaleString()}</p>
          <p className="text-xs text-white/60 mt-2">
            ${budget.perPerson.toLocaleString()} per person
          </p>
        </motion.div>
      </div>

      {/* Budget Breakdown */}
      <div className="p-6 rounded-xl bg-white border-2 border-[#141210]/10">
        <h4 className="text-sm font-bold text-[#141210] mb-4 uppercase tracking-wide">Budget Breakdown</h4>
        <div className="space-y-3">
          {Object.entries(budget.breakdown).map(([category, amount], index) => {
            const percentage = (amount / budget.total) * 100;
            return (
              <div key={category}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#141210]/60 capitalize font-medium">{category}</span>
                  <span className="text-[#141210] font-bold">${amount.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-[#141210]/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className={`h-full rounded-full ${
                      category === "accommodation"
                        ? "bg-blue-500"
                        : category === "transport"
                        ? "bg-[#10b981]"
                        : category === "food"
                        ? "bg-[#ff6a00]"
                        : category === "activities"
                        ? "bg-purple-500"
                        : "bg-amber-500"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      {budget.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl bg-[#ffd23f]/20 border-2 border-[#ffd23f]"
        >
          <h5 className="font-bold text-[#141210] mb-3">💡 Recommendations</h5>
          <ul className="space-y-2">
            {budget.recommendations.map((rec, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-sm text-[#141210]/70"
              >
                {rec}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Export Actions */}
      <div className="flex gap-4">
        <motion.button
          type="button"
          onClick={onDownloadPdf}
          disabled={isSaving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3 rounded-lg bg-white border-2 border-[#141210] text-[#141210] font-bold transition-all shadow-[2px_2px_0_#141210] hover:shadow-[3px_3px_0_#141210] disabled:opacity-50"
        >
          Download PDF
        </motion.button>
        <motion.button
          type="button"
          onClick={onShareLink}
          disabled={isSaving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3 rounded-lg bg-white border-2 border-[#141210] text-[#141210] font-bold transition-all shadow-[2px_2px_0_#141210] hover:shadow-[3px_3px_0_#141210] disabled:opacity-50"
        >
          Share Link
        </motion.button>
        <motion.button
          type="button"
          onClick={onSaveTrip}
          disabled={isSaving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3 rounded-lg bg-[#ff6a00] border-2 border-[#141210] text-white font-bold transition-all shadow-[3px_3px_0_#141210] hover:shadow-[4px_4px_0_#141210] disabled:opacity-50"
        >
          Save to My Trips
        </motion.button>
      </div>
    </div>
  );
}
