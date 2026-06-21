"use client";

import { motion } from "framer-motion";
import { PlanState } from "@/lib/planner/types";
import {
  calculateBudget,
  DESTINATION_DATA,
  ACCOMMODATION_DATA,
} from "@/lib/planner/data";
import FlowDiagram from "../FlowDiagram";
import PlannerBezel from "../ui/PlannerBezel";
import PlannerButton from "../ui/PlannerButton";

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
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="max-w-xl">
        <h3 className="font-[family-name:var(--font-anton)] text-2xl uppercase text-ink">
          Your trip plan is ready
        </h3>
        <p className="mt-3 text-ink/60">
          Review your selections. Export, share, or save to your account.
        </p>
      </div>

      <PlannerBezel innerClassName="p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">Trip flow</p>
        <div className="mt-4 h-[280px]">
          <FlowDiagram planState={planState} />
        </div>
      </PlannerBezel>

      <div className="grid gap-4 md:grid-cols-3">
        <PlannerBezel innerClassName="p-5">
          <p className="text-xs uppercase tracking-wider text-ink/45">Destination</p>
          <p className="mt-2 font-[family-name:var(--font-anton)] text-xl uppercase text-ink">
            {planState.destination
              ? DESTINATION_DATA[planState.destination].name
              : "Not set"}
          </p>
          <p className="mt-2 text-xs text-ink/45">
            {planState.duration} days, {planState.travelers} travelers
          </p>
        </PlannerBezel>

        <PlannerBezel innerClassName="p-5">
          <p className="text-xs uppercase tracking-wider text-ink/45">Style</p>
          <p className="mt-2 font-[family-name:var(--font-anton)] text-xl uppercase text-ink">
            {planState.travelStyle || "Not set"}
          </p>
          <p className="mt-2 text-xs text-ink/45">
            {planState.accommodation
              ? ACCOMMODATION_DATA[planState.accommodation].name
              : "No stay selected"}
          </p>
        </PlannerBezel>

        <PlannerBezel innerClassName="bg-orange p-5" dark>
          <p className="text-xs uppercase tracking-wider text-white/75">Estimated total</p>
          <p className="mt-2 font-[family-name:var(--font-anton)] text-3xl text-white">
            ${budget.total.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-white/70">
            ${budget.perPerson.toLocaleString()} per person
          </p>
        </PlannerBezel>
      </div>

      <PlannerBezel innerClassName="p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">
          Budget breakdown
        </p>
        <div className="mt-4 space-y-3">
          {Object.entries(budget.breakdown).map(([category, amount], index) => {
            const percentage = (amount / budget.total) * 100;
            return (
              <div key={category}>
                <div className="flex justify-between text-sm">
                  <span className="capitalize text-ink/55">{category}</span>
                  <span className="font-semibold text-ink">${amount.toLocaleString()}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                  <motion.div
                    className="h-full rounded-full bg-orange"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.2 + index * 0.08, duration: 0.5 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </PlannerBezel>

      {budget.recommendations.length > 0 && (
        <PlannerBezel innerClassName="p-5">
          <p className="font-semibold text-ink">Recommendations</p>
          <ul className="mt-3 space-y-2">
            {budget.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-ink/65">
                {rec}
              </li>
            ))}
          </ul>
        </PlannerBezel>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <PlannerButton
          variant="secondary"
          className="flex-1"
          onClick={onDownloadPdf}
          disabled={isSaving}
        >
          Download PDF
        </PlannerButton>
        <PlannerButton
          variant="secondary"
          className="flex-1"
          onClick={onShareLink}
          disabled={isSaving}
        >
          Share link
        </PlannerButton>
        <PlannerButton className="flex-1" onClick={onSaveTrip} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save trip"}
        </PlannerButton>
      </div>
    </div>
  );
}
