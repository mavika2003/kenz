"use client";

import {
  ArrowLeft,
  CalendarBlank,
  DownloadSimple,
  ShareNetwork,
  Users,
} from "@phosphor-icons/react";
import { useAuth } from "@/components/AuthProvider";
import { useDashboard } from "./DashboardContext";
import { usePlannerState } from "@/lib/planner/PlannerStateContext";
import { getCurrentPlanStep, PLAN_STEP_PROMPTS } from "@/lib/planner/planSteps";
import { DESTINATION_DATA } from "@/lib/planner/data";
import type { TripTab } from "@/lib/dashboard/types";
import type { DashboardTrip } from "@/lib/dashboard/types";

const TABS: { id: TripTab; label: string }[] = [
  { id: "itinerary", label: "Itinerary" },
  { id: "map", label: "Map" },
  { id: "budget", label: "Budget" },
  { id: "documents", label: "Documents" },
];

type DashboardHeaderProps = {
  trip?: DashboardTrip | null;
  showTabs?: boolean;
};

export default function DashboardHeader({ trip, showTabs = false }: DashboardHeaderProps) {
  const { user } = useAuth();
  const { tripTab, setTripTab, isNewTrip, finishNewTrip, backToTrips } = useDashboard();
  const { planState } = usePlannerState();
  const initial = user?.email?.[0]?.toUpperCase() ?? "K";

  const newTripHint = (() => {
    const step = getCurrentPlanStep(planState);
    if (planState.destination) {
      const name = DESTINATION_DATA[planState.destination]?.name ?? "your trip";
      return `Planning ${name} — ${PLAN_STEP_PROMPTS[step].split("?")[0]}?`;
    }
    return "Tell Kenzr where you want to go →";
  })();

  /* Planning mode header */
  if (isNewTrip) {
    return (
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/[0.06] bg-canvas/95 px-5 backdrop-blur">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={finishNewTrip}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ink/60 transition hover:bg-surface hover:text-ink"
          >
            <ArrowLeft size={14} weight="bold" />
            Back to Trips
          </button>
          <div className="h-4 w-px bg-black/[0.08]" />
          <span className="text-sm font-bold text-orange">New Trip</span>
          <span className="hidden max-w-md truncate rounded-full bg-orange/10 px-3 py-1 text-xs font-semibold text-orange sm:inline">
            {newTripHint}
          </span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-xs font-bold text-orange ring-1 ring-black/10">
          {initial}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/[0.06] bg-canvas/95 px-5 backdrop-blur">
      <div className="flex items-center gap-4">
        {trip && (
          <button
            type="button"
            onClick={backToTrips}
            className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-semibold text-ink/50 transition hover:bg-surface hover:text-ink"
            aria-label="Back"
          >
            <ArrowLeft size={14} weight="bold" />
          </button>
        )}

        {showTabs ? (
          <nav className="flex items-center gap-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTripTab(tab.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  tripTab === tab.id
                    ? "bg-orange/10 text-orange"
                    : "text-ink/50 hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        ) : (
          <span className="text-sm font-semibold text-ink/40">My Journeys</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {trip && (
          <div className="hidden items-center gap-1.5 rounded-full border border-black/[0.08] px-3 py-1.5 text-xs font-medium sm:flex">
            <CalendarBlank size={13} />
            <span>{trip.dateRange}</span>
            <span className="text-black/20">·</span>
            <Users size={13} />
            <span>{trip.travelers} travellers</span>
          </div>
        )}
        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink/60 transition hover:bg-black/[0.04] sm:flex"
        >
          <ShareNetwork size={14} />
          Share
        </button>
        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-full border border-black/[0.08] px-3 py-1.5 text-xs font-medium transition hover:bg-black/[0.04] sm:flex"
        >
          <DownloadSimple size={14} />
          Export
        </button>
        <button
          type="button"
          className="rounded-full bg-orange px-4 py-1.5 text-xs font-bold text-white hover:bg-orange-deep"
        >
          Book Now
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-xs font-bold text-orange ring-1 ring-black/10">
          {initial}
        </div>
      </div>
    </header>
  );
}
