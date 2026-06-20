"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Roadmap from "@/components/planner/Roadmap";
import Canvas from "@/components/planner/Canvas";
import ContextualFeed from "@/components/planner/ContextualFeed";
import { PlanState, Milestone } from "@/lib/planner/types";
import { INITIAL_PLAN_STATE, MILESTONES, calculateBudget } from "@/lib/planner/data";
import {
  downloadPlanAsText,
  encodePlanForUrl,
  printPlanAsPdf,
} from "@/lib/planner/export";
import { fetchTripPlanByToken, isPlannerApiConfigured, saveTripPlan } from "@/lib/plannerApi";
import { useAuth } from "@/components/AuthProvider";
import { loginPageUrl } from "@/lib/auth";

type ExportStatus = {
  message: string;
  type: "success" | "error" | "info";
} | null;

export default function PlannerPage() {
  const { user } = useAuth();
  const [planState, setPlanState] = useState<PlanState>(INITIAL_PLAN_STATE);
  const [activeMilestone, setActiveMilestone] = useState<Milestone>(MILESTONES[0]);
  const [exportStatus, setExportStatus] = useState<ExportStatus>(null);
  const [isSaving, setIsSaving] = useState(false);

  const updatePlan = (updates: Partial<PlanState>) => {
    setPlanState((prev) => ({ ...prev, ...updates }));
  };

  const markMilestoneComplete = useCallback((milestoneId: string) => {
    setPlanState((prev) => ({
      ...prev,
      completedMilestones: prev.completedMilestones.includes(milestoneId)
        ? prev.completedMilestones
        : [...prev.completedMilestones, milestoneId],
    }));
  }, []);

  const getBudget = useCallback(() => {
    return calculateBudget(
      planState.travelStyle || "balanced",
      planState.duration,
      planState.travelers,
      planState.accommodation || "hotel",
      planState.transport || "mixed",
      planState.destination || "dubai"
    );
  }, [planState]);

  const persistPlan = useCallback(async () => {
    if (!isPlannerApiConfigured()) {
      return null;
    }

    const budget = getBudget();
    return saveTripPlan({
      planState,
      budgetTotal: budget.total,
      budgetBreakdown: budget.breakdown,
    });
  }, [getBudget, planState]);

  const handleContinue = () => {
    const currentIndex = MILESTONES.findIndex((m) => m.id === activeMilestone.id);
    markMilestoneComplete(activeMilestone.id);

    if (currentIndex < MILESTONES.length - 1) {
      setActiveMilestone(MILESTONES[currentIndex + 1]);
    }
  };

  const handleExportPlan = async () => {
    setIsSaving(true);
    setExportStatus({ message: "Saving your plan...", type: "info" });

    try {
      markMilestoneComplete("review");
      const saved = await persistPlan();

      if (saved) {
        setExportStatus({
          message: "Plan saved to Supabase. Downloading a copy now.",
          type: "success",
        });
        downloadPlanAsText(planState);
        return;
      }

      downloadPlanAsText(planState);
      setExportStatus({
        message: "Plan downloaded locally. Start the API to log plans to Supabase.",
        type: "info",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save your plan.";
      setExportStatus({ message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = () => {
    printPlanAsPdf(planState);
    setExportStatus({
      message: "Print dialog opened — choose Save as PDF to export.",
      type: "info",
    });
  };

  const handleShareLink = async () => {
    setIsSaving(true);
    setExportStatus({ message: "Creating share link...", type: "info" });

    try {
      const saved = await persistPlan();
      let shareUrl = saved?.share_url;

      if (!shareUrl) {
        const encoded = encodePlanForUrl(planState);
        shareUrl = `${window.location.origin}/planner?data=${encoded}`;
      }

      await navigator.clipboard.writeText(shareUrl);
      setExportStatus({
        message: saved
          ? "Share link copied. Plan logged to Supabase."
          : "Share link copied (local fallback — start API for Supabase logging).",
        type: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create share link.";
      setExportStatus({ message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!user) {
      window.location.href = loginPageUrl("login", "/planner");
      return;
    }

    setIsSaving(true);
    setExportStatus({ message: "Saving to My Trips...", type: "info" });

    try {
      markMilestoneComplete("review");
      const saved = await persistPlan();
      if (!saved) {
        throw new Error("API is not configured. Start kenz-api to save trips.");
      }

      setExportStatus({
        message: "Trip saved to your account in Supabase.",
        type: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save trip.";
      setExportStatus({ message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareToken = params.get("plan");

    if (!shareToken) return;

    void fetchTripPlanByToken(shareToken).then((loaded) => {
      if (!loaded) return;
      setPlanState(loaded);
      setActiveMilestone(MILESTONES[MILESTONES.length - 1]);
      setExportStatus({ message: "Loaded a shared trip plan.", type: "success" });
    });
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#fbf3e4] text-[#141210] font-sans">
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 31px,
            rgba(20, 18, 16, 0.03) 31px,
            rgba(20, 18, 16, 0.03) 32px
          )`,
        }}
      />

      <div className="relative z-10 h-full flex flex-col">
        {exportStatus && (
          <div
            className={`px-6 py-3 text-sm font-medium border-b-2 border-[#141210] ${
              exportStatus.type === "success"
                ? "bg-[#10b981]/15 text-[#141210]"
                : exportStatus.type === "error"
                ? "bg-red-100 text-red-800"
                : "bg-[#ffd23f]/30 text-[#141210]"
            }`}
          >
            {exportStatus.message}
          </div>
        )}

        <div className="flex flex-1 min-h-0">
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="w-[20%] min-w-[240px] max-w-[320px] h-full border-r-2 border-[#141210] bg-white"
          >
            <Roadmap
              milestones={MILESTONES}
              activeMilestone={activeMilestone}
              completedMilestones={planState.completedMilestones}
              onSelect={setActiveMilestone}
            />
          </motion.aside>

          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 h-full overflow-hidden bg-white"
          >
            <Canvas
              activeMilestone={activeMilestone}
              planState={planState}
              updatePlan={updatePlan}
              onComplete={activeMilestone.id === "review" ? handleExportPlan : handleContinue}
              onDownloadPdf={handleDownloadPdf}
              onShareLink={handleShareLink}
              onSaveTrip={handleSaveTrip}
              isSaving={isSaving}
            />
          </motion.main>

          <motion.aside
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="w-[25%] min-w-[300px] max-w-[400px] h-full border-l-2 border-[#141210] bg-[#fbf3e4]"
          >
            <ContextualFeed planState={planState} />
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
