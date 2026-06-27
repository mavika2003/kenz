"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DUBAI_TRIP_ID } from "@/lib/dashboard/data";
import { usePlannerState } from "@/lib/planner/PlannerStateContext";
import type { SidebarSection, TripTab } from "@/lib/dashboard/types";

type DashboardContextValue = {
  sidebarSection: SidebarSection;
  setSidebarSection: (s: SidebarSection) => void;
  activeTripId: string | null;
  setActiveTripId: (id: string | null) => void;
  tripTab: TripTab;
  setTripTab: (tab: TripTab) => void;
  openTrip: (tripId: string, tab?: TripTab) => void;
  backToTrips: () => void;
  isNewTrip: boolean;
  startNewTrip: (options?: { skipReset?: boolean }) => void;
  finishNewTrip: () => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

function DashboardProviderInner({ children }: { children: ReactNode }) {
  const { saveTripFromPlan, resetPlan } = usePlannerState();

  const [sidebarSection, setSidebarSection] = useState<SidebarSection>("trips");
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [tripTab, setTripTab] = useState<TripTab>("itinerary");
  const [isNewTrip, setIsNewTrip] = useState(false);

  const openTrip = useCallback((tripId: string, tab: TripTab = "itinerary") => {
    setActiveTripId(tripId);
    setTripTab(tab);
    setSidebarSection("trips");
    setIsNewTrip(false);
  }, []);

  const backToTrips = useCallback(() => {
    setActiveTripId(null);
    setTripTab("itinerary");
    setIsNewTrip(false);
  }, []);

  const startNewTrip = useCallback((options?: { skipReset?: boolean }) => {
    if (!options?.skipReset) resetPlan();
    setActiveTripId(null);
    setTripTab("itinerary");
    setIsNewTrip(true);
    setSidebarSection("conversations");
  }, [resetPlan]);

  const finishNewTrip = useCallback(() => {
    const newId = saveTripFromPlan();
    if (!newId) return;
    setIsNewTrip(false);
    setActiveTripId(newId);
    setTripTab("itinerary");
    setSidebarSection("trips");
  }, [saveTripFromPlan]);

  const value = useMemo(
    () => ({
      sidebarSection,
      setSidebarSection,
      activeTripId,
      setActiveTripId,
      tripTab,
      setTripTab,
      openTrip,
      backToTrips,
      isNewTrip,
      startNewTrip,
      finishNewTrip,
    }),
    [sidebarSection, activeTripId, tripTab, openTrip, backToTrips, isNewTrip, startNewTrip, finishNewTrip],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

/** DashboardProvider must be rendered inside PlannerStateProvider */
export function DashboardProvider({ children }: { children: ReactNode }) {
  return <DashboardProviderInner>{children}</DashboardProviderInner>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}

export function useDefaultTripOpen() {
  const { openTrip } = useDashboard();
  return useCallback(() => openTrip(DUBAI_TRIP_ID), [openTrip]);
}
