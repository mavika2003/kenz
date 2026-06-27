"use client";

import {
  ArrowLeft,
  ArrowSquareOut,
  BookmarkSimple,
  ChatCircle,
  Compass,
  Gear,
  MapTrifold,
  Plus,
} from "@phosphor-icons/react";
import { GradientCircle } from "@/components/voice/KenzrVoicePanel";
import { useVoiceAgent } from "@/components/voice/VoiceAgentContext";
import KenzrDashboardPanel from "./KenzrDashboardPanel";
import { useDashboard } from "./DashboardContext";
import { usePlannerState } from "@/lib/planner/PlannerStateContext";
import type { SidebarSection } from "@/lib/dashboard/types";

// PlannerChatPanel is intentionally not used here — conversation history
// is surfaced directly inside KenzrDashboardPanel via voice agent state.

const NAV: { id: SidebarSection; label: string; icon: typeof MapTrifold }[] = [
  { id: "conversations", label: "Conversations", icon: ChatCircle },
  { id: "trips", label: "Trips", icon: MapTrifold },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "saved", label: "Saved", icon: BookmarkSimple },
  { id: "settings", label: "Settings", icon: Gear },
];

/** Sidebar widths in px — exported so DashboardApp can use them for margin-left */
export const SIDEBAR_W_NORMAL = 260;
export const SIDEBAR_W_EXPANDED = 380;

/** Backward-compat alias used by CheckoutBar */
export const SIDEBAR_W = SIDEBAR_W_NORMAL;

export default function DashboardSidebar() {
  const { sidebarSection, setSidebarSection, isNewTrip, startNewTrip, finishNewTrip, backToTrips } =
    useDashboard();
  const { resetPlan, isPlanComplete } = usePlannerState();
  const { status, conversationActive } = useVoiceAgent();

  const isConvActive = sidebarSection === "conversations";
  const w = isNewTrip || isConvActive ? SIDEBAR_W_EXPANDED : SIDEBAR_W_NORMAL;

  /* ──────────────────────────────────────────────────────────────
     NEW TRIP mode: expanded sidebar — Kenzr + chat, back button
     ────────────────────────────────────────────────────────────── */
  if (isNewTrip) {
    return (
      <aside
        style={{ width: w }}
        className="fixed left-0 top-0 z-40 flex h-full flex-col border-r border-black/10 bg-white transition-all duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-3.5">
          <button
            type="button"
            onClick={() => {
              if (isPlanComplete) finishNewTrip();
              else {
                resetPlan();
                backToTrips();
              }
            }}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ink/60 transition hover:bg-surface hover:text-ink"
          >
            <ArrowLeft size={14} weight="bold" />
            {isPlanComplete ? "Save & Back" : "Cancel"}
          </button>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-orange">
            Planning Mode
          </span>
        </div>

        {/* Full Kenzr panel — voice + chat */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <KenzrDashboardPanel />
        </div>
      </aside>
    );
  }

  /* ──────────────────────────────────────────────────────────────
     NORMAL mode
     ────────────────────────────────────────────────────────────── */
  return (
    <aside
      style={{ width: w }}
      className="fixed left-0 top-0 z-40 flex h-full flex-col border-r border-black/10 bg-white transition-all duration-300"
    >
      {/* Brand + New Trip button */}
      <div className="border-b border-black/[0.06] px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-[family-name:var(--font-anton)] text-2xl tracking-wider text-ink">
            KENZ
          </span>
          <a
            href="/"
            className="flex items-center gap-1 rounded-full border border-black/[0.08] px-2.5 py-1 text-[10px] font-semibold text-ink/50 transition hover:border-orange/30 hover:text-orange"
          >
            <ArrowSquareOut size={11} />
            Website
          </a>
        </div>
        <button
          type="button"
          onClick={() => startNewTrip()}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-orange py-2.5 text-sm font-bold text-white transition hover:bg-orange-deep"
        >
          <Plus size={14} weight="bold" />
          New Trip
        </button>
      </div>

      {/* Nav */}
      <nav className="space-y-0.5 px-3 py-3">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = sidebarSection === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSidebarSection(id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                active
                  ? "bg-orange/8 font-semibold text-orange"
                  : "text-ink/55 hover:bg-black/[0.03] hover:text-ink"
              }`}
            >
              <Icon size={17} weight={active ? "fill" : "regular"} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom panel — Kenzr always visible */}
      <div className="mt-auto flex min-h-0 flex-1 flex-col border-t border-black/[0.06]">
        {isConvActive ? (
          /* Expanded conversations panel */
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <KenzrDashboardPanel />
          </div>
        ) : (
          /* Mini Kenzr always present */
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-surface px-4 py-3">
              <GradientCircle size="sm" active={conversationActive} status={status} showMic />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-ink">Kenzr</p>
                <p className="truncate text-[10px] text-ink/45">AI Travel Agent</p>
              </div>
              <button
                type="button"
                onClick={() => setSidebarSection("conversations")}
                className="shrink-0 rounded-full border border-orange/30 px-2.5 py-1 text-[10px] font-bold text-orange transition hover:bg-orange/10"
              >
                Chat
              </button>
            </div>
            <button
              type="button"
              onClick={() => setSidebarSection("conversations")}
              className="rounded-lg border border-black/[0.08] px-3 py-2 text-center text-xs font-medium text-ink/50 transition hover:border-orange/40 hover:text-orange"
            >
              Open full chat with Kenzr
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
