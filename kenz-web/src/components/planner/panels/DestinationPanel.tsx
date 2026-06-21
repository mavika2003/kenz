"use client";

import { motion } from "framer-motion";
import { PlanState, Destination } from "@/lib/planner/types";
import { DESTINATION_DATA } from "@/lib/planner/data";
import SelectionCard from "../ui/SelectionCard";
import PlannerBezel from "../ui/PlannerBezel";

interface DestinationPanelProps {
  planState: PlanState;
  updatePlan: (updates: Partial<PlanState>) => void;
}

const destinations: { id: Destination; name: string; badge: string }[] = [
  { id: "dubai", name: "Dubai", badge: "DXB" },
  { id: "abu-dhabi", name: "Abu Dhabi", badge: "AUH" },
  { id: "both", name: "Both Cities", badge: "UAE" },
];

export default function DestinationPanel({ planState, updatePlan }: DestinationPanelProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="max-w-xl">
        <h3 className="font-[family-name:var(--font-anton)] text-2xl uppercase text-ink">
          Where are you headed?
        </h3>
        <p className="mt-3 text-ink/60">
          Select your primary destination. Each offers a different pace across the Emirates.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {destinations.map((dest, index) => {
          const data = DESTINATION_DATA[dest.id];
          return (
            <SelectionCard
              key={dest.id}
              index={index}
              selected={planState.destination === dest.id}
              onClick={() => updatePlan({ destination: dest.id })}
              badge={dest.badge}
              title={dest.name}
              description={data.tagline}
              meta={
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {data.highlights.slice(0, 2).map((highlight) => (
                      <span
                        key={highlight}
                        className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-ink/60"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm">
                    <span className="text-ink/45">From </span>
                    <span className="font-semibold text-orange">${data.estimatedDailyCost}</span>
                    <span className="text-ink/45"> /day</span>
                  </p>
                </>
              }
            />
          );
        })}
      </div>

      {planState.destination && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <PlannerBezel innerClassName="p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">
              {DESTINATION_DATA[planState.destination].name} highlights
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {DESTINATION_DATA[planState.destination].highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full bg-surface px-3 py-1.5 text-sm text-ink/70"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </PlannerBezel>
        </motion.div>
      )}
    </div>
  );
}
