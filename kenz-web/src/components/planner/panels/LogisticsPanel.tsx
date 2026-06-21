"use client";

import { motion } from "framer-motion";
import { PlanState, AccommodationType } from "@/lib/planner/types";
import { ACCOMMODATION_DATA, DUBAI_DATA } from "@/lib/planner/data";
import SelectionCard from "../ui/SelectionCard";
import PlannerBezel from "../ui/PlannerBezel";

interface LogisticsPanelProps {
  planState: PlanState;
  updatePlan: (updates: Partial<PlanState>) => void;
}

const accommodationTypes: { id: AccommodationType; badge: string }[] = [
  { id: "hotel", badge: "HTL" },
  { id: "airbnb", badge: "AIR" },
  { id: "hostel", badge: "HST" },
  { id: "resort", badge: "RST" },
];

export default function LogisticsPanel({ planState, updatePlan }: LogisticsPanelProps) {
  const recommended =
    planState.travelStyle === "luxury"
      ? "taxi"
      : planState.travelStyle === "backpacker"
        ? "metro"
        : "mixed";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="max-w-xl">
        <h3 className="font-[family-name:var(--font-anton)] text-2xl uppercase text-ink">
          Where will you stay?
        </h3>
        <p className="mt-3 text-ink/60">
          Accommodation drives a large share of your Emirates budget.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {accommodationTypes.map((acc, index) => {
          const data = ACCOMMODATION_DATA[acc.id];
          const priceRange = DUBAI_DATA.budgetRanges[planState.travelStyle || "balanced"];
          const baseDaily = (priceRange.min + priceRange.max) / 2 / 7;
          const estimatedCost = Math.round(baseDaily * 0.5 * data.priceMultiplier);

          return (
            <SelectionCard
              key={acc.id}
              index={index}
              selected={planState.accommodation === acc.id}
              onClick={() => updatePlan({ accommodation: acc.id })}
              badge={acc.badge}
              title={data.name}
              description={data.description}
              meta={
                <>
                  {"note" in data && data.note && (
                    <p className="mb-2 text-xs text-orange-deep">{data.note}</p>
                  )}
                  <p className="text-sm">
                    <span className="text-ink/45">About </span>
                    <span className="font-semibold text-orange">${estimatedCost}</span>
                    <span className="text-ink/45"> /night</span>
                  </p>
                </>
              }
            />
          );
        })}
      </div>

      <div>
        <h4 className="font-[family-name:var(--font-anton)] text-lg uppercase text-ink">
          How will you get around?
        </h4>
        <p className="mt-2 text-sm text-ink/55">
          For your {planState.travelStyle} style, we suggest{" "}
          <span className="font-semibold capitalize text-orange">{recommended}</span>.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {DUBAI_DATA.transportOptions.map((option, index) => {
            const isRecommended = option.mode === recommended;
            return (
              <SelectionCard
                key={option.mode}
                index={index}
                selected={planState.transport === option.mode}
                onClick={() => updatePlan({ transport: option.mode })}
                badge={option.mode.toUpperCase().slice(0, 3)}
                title={option.mode}
                description={option.description}
                meta={
                  <>
                    {isRecommended && (
                      <span className="mb-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                        Recommended
                      </span>
                    )}
                    {option.nolCard && (
                      <p className="text-xs text-ink/55">
                        NOL {option.nolCard.type} card, AED {option.nolCard.cost}
                      </p>
                    )}
                    <p className="mt-2 text-sm">
                      <span className="text-ink/45">Daily </span>
                      <span className="font-semibold text-ink">~${option.dailyCost}</span>
                    </p>
                  </>
                }
              />
            );
          })}
        </div>
      </div>

      {planState.accommodation && planState.transport && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <PlannerBezel innerClassName="p-5 ring-1 ring-emerald-200">
            <p className="font-semibold text-emerald-800">Local insight</p>
            <div className="mt-3 space-y-2 text-sm text-ink/70">
              {planState.travelStyle === "budget" && planState.transport !== "metro" && (
                <p>
                  Switch to a NOL Silver Card to save about $
                  {(DUBAI_DATA.transportOptions.find((t) => t.mode === planState.transport)
                    ?.dailyCost || 40) - 8}{" "}
                  per day.
                </p>
              )}
              {planState.destination === "both" && (
                <p>
                  Add E100/E101 bus (AED 25) or Careem (AED 150-200) between Dubai and Abu Dhabi.
                </p>
              )}
              <p>
                Best areas: {ACCOMMODATION_DATA[planState.accommodation].dubaiAreas.join(", ")}
              </p>
            </div>
          </PlannerBezel>
        </motion.div>
      )}
    </div>
  );
}
