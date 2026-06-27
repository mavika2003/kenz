"use client";

import type { ReactNode } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar, {
  SIDEBAR_W_NORMAL,
  SIDEBAR_W_EXPANDED,
} from "./DashboardSidebar";
import { DashboardProvider, useDashboard } from "./DashboardContext";
import DashboardVoiceBridge from "@/components/voice/DashboardVoiceBridge";
import PlannerVoiceBridge from "@/components/voice/PlannerVoiceBridge";
import { usePlannerState } from "@/lib/planner/PlannerStateContext";
import BudgetView from "./views/BudgetView";
import DocumentsView from "./views/DocumentsView";
import ExploreView from "./views/ExploreView";
import ItineraryView from "./views/ItineraryView";
import MapView from "./views/MapView";
import NewTripView from "./views/NewTripView";
import TripsView from "./views/TripsView";
import { getTripById } from "@/lib/dashboard/data";

function DashboardContent() {
  const { sidebarSection, activeTripId, tripTab, isNewTrip } = useDashboard();
  const { getSavedTripById } = usePlannerState();
  const trip = activeTripId
    ? (getTripById(activeTripId) ?? getSavedTripById(activeTripId))
    : null;

  /* Dynamic sidebar width */
  const sidebarW =
    isNewTrip || sidebarSection === "conversations"
      ? SIDEBAR_W_EXPANDED
      : SIDEBAR_W_NORMAL;

  let mainContent: ReactNode;

  if (isNewTrip) {
    mainContent = <NewTripView />;
  } else if (trip) {
    if (tripTab === "map") mainContent = <MapView trip={trip} />;
    else if (tripTab === "budget") mainContent = <BudgetView trip={trip} />;
    else if (tripTab === "documents") mainContent = <DocumentsView trip={trip} />;
    else mainContent = <ItineraryView trip={trip} />;
  } else if (sidebarSection === "explore") {
    mainContent = <ExploreView />;
  } else if (sidebarSection === "conversations") {
    /* When conversations sidebar is expanded, just show trips overview in main */
    mainContent = <TripsView />;
  } else if (sidebarSection === "saved") {
    mainContent = (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="text-2xl font-bold">Saved</p>
        <p className="mt-2 text-sm text-ink/50">Bookmark experiences and hotels. Coming soon.</p>
      </div>
    );
  } else if (sidebarSection === "settings") {
    mainContent = (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="text-2xl font-bold">Settings</p>
        <p className="mt-2 text-sm text-ink/50">Account preferences. Coming soon.</p>
      </div>
    );
  } else {
    mainContent = <TripsView />;
  }

  return (
    <div className="min-h-[100dvh] bg-canvas font-sans text-ink">
      <DashboardSidebar />

      <div
        style={{ marginLeft: sidebarW }}
        className="flex min-h-[100dvh] flex-col transition-all duration-300"
      >
        <DashboardHeader trip={trip} showTabs={Boolean(trip) && !isNewTrip} />

        <main className="dashboard-scroll flex-1 overflow-y-auto">
          {mainContent}
        </main>

        {!isNewTrip && (
          <footer className="border-t border-black/[0.06] bg-surface px-8 py-8 text-center">
            <p className="font-[family-name:var(--font-anton)] tracking-widest text-ink/70">
              KENZ
            </p>
            <nav className="mt-3 flex flex-wrap justify-center gap-5">
              {["Privacy Policy", "Terms of Service", "Help Center", "Contact"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-[10px] uppercase tracking-wider text-ink/40 hover:text-orange"
                >
                  {link}
                </a>
              ))}
            </nav>
            <p className="mt-4 text-[10px] text-ink/30">
              © 2026 KENZ Premium Travel. All rights reserved.
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}

function PlannerVoiceBridgeWrapper() {
  const { planState, updatePlan, markMilestoneComplete } = usePlannerState();
  return (
    <PlannerVoiceBridge
      planState={planState}
      updatePlan={updatePlan}
      markMilestoneComplete={markMilestoneComplete}
    />
  );
}

export default function DashboardApp() {
  return (
    <DashboardProvider>
      <DashboardVoiceBridge />
      <PlannerVoiceBridgeWrapper />
      <DashboardContent />
    </DashboardProvider>
  );
}
