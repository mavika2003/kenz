"use client";

import DashboardApp from "@/components/dashboard/DashboardApp";
import { PlannerStateProvider } from "@/lib/planner/PlannerStateContext";

export default function PlannerApp() {
  return (
    <PlannerStateProvider>
      <DashboardApp />
    </PlannerStateProvider>
  );
}
