"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PlanState } from "@/lib/planner/types";
import { calculateBudget, DUBAI_DATA, getSeasonalAdvice } from "@/lib/planner/data";
import PlannerBezel from "./ui/PlannerBezel";

interface ContextualFeedProps {
  planState: PlanState;
}

export default function ContextualFeed({ planState }: ContextualFeedProps) {
  const hasEnoughData =
    planState.destination &&
    planState.travelStyle &&
    planState.accommodation &&
    planState.transport;

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

  const seasonalAdvice = planState.startDate
    ? getSeasonalAdvice(planState.startDate.getMonth())
    : null;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-black/[0.06] p-5">
        <h2 className="font-[family-name:var(--font-anton)] text-sm uppercase text-ink">
          Trip overview
        </h2>
        <p className="mt-1 text-xs text-ink/55">Live budget and compliance notes</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {budget ? (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <PlannerBezel innerClassName="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">
                  Estimated budget
                </p>
                <p className="mt-2 font-[family-name:var(--font-anton)] text-3xl text-orange">
                  ${budget.total.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-ink/50">
                  ${budget.perPerson.toLocaleString()} per person, {planState.duration} days
                </p>
                <div className="mt-4 space-y-2">
                  {Object.entries(budget.breakdown).map(([category, amount]) => (
                    <div key={category} className="flex justify-between text-sm">
                      <span className="capitalize text-ink/55">{category}</span>
                      <span className="font-semibold text-ink">${amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                {budget.recommendations.length > 0 && (
                  <div className="mt-4 border-t border-black/[0.06] pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-orange">
                      Savings tips
                    </p>
                    <ul className="mt-2 space-y-1">
                      {budget.recommendations.slice(0, 2).map((rec, i) => (
                        <li key={i} className="text-xs leading-relaxed text-ink/55">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </PlannerBezel>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <PlannerBezel innerClassName="border border-dashed border-black/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">
                  Budget estimate
                </p>
                <p className="mt-2 text-sm text-ink/45">
                  Complete all steps to see your personalized breakdown.
                </p>
              </PlannerBezel>
            </motion.div>
          )}
        </AnimatePresence>

        {seasonalAdvice && (
          <PlannerBezel innerClassName="p-5">
            <p className="font-semibold text-ink">{seasonalAdvice.season}</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink/50">Weather</span>
                <span className="font-medium text-ink">{seasonalAdvice.weather}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/50">Crowds</span>
                <span className="font-medium text-ink">{seasonalAdvice.crowds}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/50">Pricing</span>
                <span className="font-medium text-orange">{seasonalAdvice.pricing}</span>
              </div>
            </div>
          </PlannerBezel>
        )}

        <PlannerBezel innerClassName="p-5 ring-1 ring-orange/20">
          <p className="text-sm font-semibold text-orange-deep">2026 compliance</p>
          <ul className="mt-3 space-y-3 text-sm text-ink/70">
            <li>Passport cover-page scan required for visa applications.</li>
            <li>Visit visa overstays trigger immediate bans and fines.</li>
            <li>Shoulders and knees covered in public spaces.</li>
          </ul>
        </PlannerBezel>

        {planState.transport === "metro" && (
          <PlannerBezel innerClassName="p-5">
            <p className="font-semibold text-ink">NOL Silver Card</p>
            <p className="mt-2 text-xs text-ink/55">
              Works on metro, buses, and trams across Dubai and Abu Dhabi.
            </p>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-ink/50">Card cost</span>
              <span className="font-semibold text-ink">AED 25</span>
            </div>
          </PlannerBezel>
        )}

        <PlannerBezel innerClassName="p-5">
          <p className="font-semibold text-ink">Cultural notes</p>
          <ul className="mt-3 space-y-2">
            {DUBAI_DATA.compliance.culturalNotes.map((note, i) => (
              <li key={i} className="text-xs leading-relaxed text-ink/55">
                {note}
              </li>
            ))}
          </ul>
        </PlannerBezel>
      </div>
    </div>
  );
}
