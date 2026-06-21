"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Roadmap from "@/components/planner/Roadmap";
import Canvas from "@/components/planner/Canvas";
import ContextualFeed from "@/components/planner/ContextualFeed";
import PlannerNav from "@/components/planner/PlannerNav";
import PlannerBezel from "@/components/planner/ui/PlannerBezel";
import { PlanState, Milestone } from "@/lib/planner/types";
import { INITIAL_PLAN_STATE, MILESTONES, calculateBudget } from "@/lib/planner/data";
import { downloadPlanAsText, printPlanAsPdf } from "@/lib/planner/export";
import {
  fetchLatestTripPlan,
  fetchTripPlanByToken,
  isPlannerApiConfigured,
  resolveActiveMilestone,
  saveTripPlan,
} from "@/lib/plannerApi";
import { easePremium } from "@/components/planner/ui/theme";

type ExportStatus = {
  message: string;
  type: "success" | "error" | "info";
} | null;

function PlannerSkeleton() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <div className="h-14 border-b border-black/[0.06] bg-white" />
      <div className="flex flex-1 gap-4 p-4 lg:p-6">
        <div className="hidden w-64 animate-pulse rounded-[1.25rem] bg-black/[0.04] lg:block" />
        <PlannerBezel className="flex-1" innerClassName="min-h-[60vh] animate-pulse p-8" />
        <div className="hidden w-80 animate-pulse rounded-[1.25rem] bg-black/[0.04] xl:block" />
      </div>
    </div>
  );
}

export default function PlannerApp() {
  const [planState, setPlanState] = useState<PlanState>(INITIAL_PLAN_STATE);
  const [activeMilestone, setActiveMilestone] = useState<Milestone>(MILESTONES[0]);
  const [exportStatus, setExportStatus] = useState<ExportStatus>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const hasRestoredRef = useRef(false);
  const skipAutoSaveRef = useRef(true);

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
      throw new Error("API is not configured. Start kenz-api to save trips.");
    }

    const budget = getBudget();
    const saved = await saveTripPlan({
      planState,
      activeMilestoneId: activeMilestone.id,
      budgetTotal: budget.total,
      budgetBreakdown: budget.breakdown,
    });
    setCurrentPlanId(saved.id);
    return saved;
  }, [activeMilestone.id, getBudget, planState]);

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
      await persistPlan();
      downloadPlanAsText(planState);
      setExportStatus({
        message: "Plan saved. Download started.",
        type: "success",
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
      message: "Print dialog opened. Choose Save as PDF.",
      type: "info",
    });
  };

  const handleShareLink = async () => {
    setIsSaving(true);
    setExportStatus({ message: "Creating share link...", type: "info" });

    try {
      const saved = await persistPlan();
      await navigator.clipboard.writeText(saved.share_url);
      setExportStatus({
        message: "Share link copied to clipboard.",
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
    setIsSaving(true);
    setExportStatus({ message: "Saving trip...", type: "info" });

    try {
      markMilestoneComplete("review");
      await persistPlan();
      setExportStatus({ message: "Trip saved to your account.", type: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save trip.";
      setExportStatus({ message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    async function loadPlan() {
      setIsLoading(true);

      try {
        const params = new URLSearchParams(window.location.search);
        const shareToken = params.get("plan");

        if (shareToken) {
          const loaded = await fetchTripPlanByToken(shareToken);
          if (loaded) {
            setPlanState(loaded);
            setActiveMilestone(resolveActiveMilestone(loaded));
            setExportStatus({ message: "Loaded your saved trip plan.", type: "success" });
          } else {
            setExportStatus({ message: "Could not load this trip plan.", type: "error" });
          }
        } else if (isPlannerApiConfigured()) {
          const latest = await fetchLatestTripPlan();
          if (latest) {
            setPlanState(latest.planState);
            setActiveMilestone(resolveActiveMilestone(latest.planState));
            setCurrentPlanId(latest.id);
            setExportStatus({ message: "Resumed your trip plan.", type: "success" });
          }
        }
      } finally {
        hasRestoredRef.current = true;
        skipAutoSaveRef.current = false;
        setIsLoading(false);
      }
    }

    void loadPlan();
  }, []);

  useEffect(() => {
    if (!hasRestoredRef.current || skipAutoSaveRef.current || isLoading) return;
    if (!isPlannerApiConfigured()) return;

    const timer = window.setTimeout(() => {
      void persistPlan().catch(() => {});
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [planState, activeMilestone, isLoading, persistPlan]);

  if (isLoading) return <PlannerSkeleton />;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas font-sans text-ink">
      <PlannerNav />

      {exportStatus && (
        <div
          className={`border-b px-6 py-3 text-sm font-medium ${
            exportStatus.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : exportStatus.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-orange/20 bg-orange/10 text-ink"
          }`}
        >
          {exportStatus.message}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row lg:gap-5 lg:p-6">
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: easePremium }}
          className="w-full shrink-0 lg:w-[260px] xl:w-[280px]"
        >
          <PlannerBezel innerClassName="h-full min-h-[220px] lg:min-h-0">
            <Roadmap
              milestones={MILESTONES}
              activeMilestone={activeMilestone}
              completedMilestones={planState.completedMilestones}
              onSelect={setActiveMilestone}
            />
          </PlannerBezel>
        </motion.aside>

        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: easePremium }}
          className="flex min-h-0 min-w-0 flex-1 flex-col"
        >
          <PlannerBezel className="h-full" innerClassName="flex h-full min-h-[480px] flex-col">
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
          </PlannerBezel>
        </motion.main>

        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: easePremium }}
          className="w-full shrink-0 xl:w-[320px]"
        >
          <PlannerBezel innerClassName="h-full min-h-[280px] xl:min-h-0">
            <ContextualFeed planState={planState} />
          </PlannerBezel>
        </motion.aside>
      </div>
    </div>
  );
}
