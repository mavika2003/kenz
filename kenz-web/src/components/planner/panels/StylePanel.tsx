"use client";

import { motion } from "framer-motion";
import { PlanState, TravelStyle } from "@/lib/planner/types";
import { DUBAI_DATA } from "@/lib/planner/data";
import SelectionCard from "../ui/SelectionCard";
import PlannerBezel from "../ui/PlannerBezel";

interface StylePanelProps {
  planState: PlanState;
  updatePlan: (updates: Partial<PlanState>) => void;
}

const styles: { id: TravelStyle; name: string; badge: string; description: string }[] = [
  {
    id: "luxury",
    name: "Luxury",
    badge: "LUX",
    description: "Premium hotels, fine dining, private experiences",
  },
  {
    id: "balanced",
    name: "Balanced",
    badge: "BAL",
    description: "Comfort and value with curated experiences",
  },
  {
    id: "budget",
    name: "Budget",
    badge: "BUD",
    description: "Smart spending, local gems, authentic eats",
  },
  {
    id: "backpacker",
    name: "Backpacker",
    badge: "BPK",
    description: "Hostels, street food, public transport",
  },
];

export default function StylePanel({ planState, updatePlan }: StylePanelProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="max-w-xl">
        <h3 className="font-[family-name:var(--font-anton)] text-2xl uppercase text-ink">
          What is your travel style?
        </h3>
        <p className="mt-3 text-ink/60">
          This shapes accommodation, transport, and activity recommendations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {styles.map((style, index) => {
          const range = DUBAI_DATA.budgetRanges[style.id];
          return (
            <SelectionCard
              key={style.id}
              index={index}
              selected={planState.travelStyle === style.id}
              onClick={() => updatePlan({ travelStyle: style.id })}
              badge={style.badge}
              title={style.name}
              description={style.description}
              meta={
                <p className="text-sm">
                  <span className="text-ink/45">Budget range </span>
                  <span className="font-semibold text-orange">
                    ${range.min.toLocaleString()} - ${range.max.toLocaleString()}
                  </span>
                </p>
              }
            />
          );
        })}
      </div>

      {planState.travelStyle && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <PlannerBezel innerClassName="p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">
              What this means
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Accommodation",
                  value:
                    planState.travelStyle === "luxury"
                      ? "5-star hotels and resorts"
                      : planState.travelStyle === "balanced"
                        ? "4-star hotels and quality rentals"
                        : planState.travelStyle === "budget"
                          ? "3-star hotels and budget stays"
                          : "Hostels and shared rooms",
                },
                {
                  label: "Transport",
                  value:
                    planState.travelStyle === "luxury"
                      ? "Private transfers"
                      : planState.travelStyle === "balanced"
                        ? "Taxi and metro mix"
                        : "Metro with NOL card",
                },
                {
                  label: "Dining",
                  value:
                    planState.travelStyle === "luxury"
                      ? "Fine dining and rooftops"
                      : planState.travelStyle === "balanced"
                        ? "Restaurants and cafes"
                        : "Local eateries and street food",
                },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-surface p-4">
                  <p className="text-xs text-ink/45">{item.label}</p>
                  <p className="mt-1 text-sm text-ink">{item.value}</p>
                </div>
              ))}
            </div>
          </PlannerBezel>
        </motion.div>
      )}
    </div>
  );
}
