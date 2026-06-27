"use client";

import { useEffect } from "react";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { useVoiceAgent } from "./VoiceAgentContext";

/** Connects dashboard actions (e.g. New Trip) to the voice agent on /planner */
export default function DashboardVoiceBridge() {
  const { startNewTrip } = useDashboard();
  const { registerDashboardHandlers, unregisterDashboardHandlers } = useVoiceAgent();

  useEffect(() => {
    registerDashboardHandlers({ startNewTrip });
    return () => unregisterDashboardHandlers();
  }, [registerDashboardHandlers, unregisterDashboardHandlers, startNewTrip]);

  return null;
}
