import type { PlanState } from "@/lib/planner/types";
import {
  buildPlannerSetUpdates,
  mapVoiceMilestoneToPlanStep,
  type PlanStepId,
} from "@/lib/planner/planSteps";
import type { VoiceAction } from "./types";
import { VOICE_SECTIONS, VOICE_START_NEW_TRIP_KEY } from "./siteMap";

export type PlannerVoiceHandlers = {
  goToMilestone: (milestoneId: string) => void;
  updatePlan: (updates: Partial<PlanState>) => void;
  completeMilestone: (milestoneId: string) => void;
  getPlanState: () => PlanState;
  setFocusedPlanStep: (step: PlanStepId) => void;
};

export type DashboardVoiceHandlers = {
  startNewTrip: (options?: { skipReset?: boolean }) => void;
};

export type ExecuteVoiceActionsOptions = {
  actions: VoiceAction[];
  pathname: string;
  navigate: (href: string) => void;
  plannerHandlers: PlannerVoiceHandlers | null;
  dashboardHandlers: DashboardVoiceHandlers | null;
  queuePlannerActions: (actions: VoiceAction[]) => void;
};

/** If navigating to the planner for trip planning, always open New Trip mode */
export function ensureNewTripForPlannerNav(actions: VoiceAction[]): VoiceAction[] {
  const navIdx = actions.findIndex(
    (a) =>
      a.type === "navigate" &&
      (a.route === "/planner" ||
        (a.route === "/login" && a.query?.next === "/planner")),
  );
  if (navIdx === -1) return actions;
  if (actions.some((a) => a.type === "start_new_trip")) return actions;

  const next = [...actions];
  next.splice(navIdx + 1, 0, { type: "start_new_trip" });
  return next;
}

function buildHref(route: string, query?: Record<string, string>): string {
  if (!query || Object.keys(query).length === 0) return route;
  const params = new URLSearchParams(query);
  return `${route}?${params.toString()}`;
}

function isPlannerAction(action: VoiceAction): boolean {
  return (
    action.type === "planner_go_to" ||
    action.type === "planner_set" ||
    action.type === "planner_complete"
  );
}

function executePlannerAction(
  action: VoiceAction,
  handlers: PlannerVoiceHandlers,
): void {
  let plan = handlers.getPlanState();

  if (action.type === "planner_go_to" && action.milestone) {
    const step = mapVoiceMilestoneToPlanStep(action.milestone, plan);
    handlers.setFocusedPlanStep(step);
    handlers.goToMilestone(step);
    return;
  }

  if (action.type === "planner_complete" && action.milestone) {
    handlers.completeMilestone(action.milestone);
    return;
  }

  if (action.type === "planner_set" && action.field && action.value !== undefined) {
    const updates = buildPlannerSetUpdates(plan, action.field, action.value);
    if (updates) {
      plan = { ...plan, ...updates };
      handlers.updatePlan(updates);
    }
  }
}

export async function executeVoiceActions(
  options: ExecuteVoiceActionsOptions,
): Promise<void> {
  const {
    actions,
    pathname,
    navigate,
    plannerHandlers,
    queuePlannerActions,
  } = options;

  const onPlanner = pathname.startsWith("/planner");
  const deferredPlanner: VoiceAction[] = [];

  const hasPlannerNavigate = actions.some(
    (a) => a.type === "navigate" && a.route === "/planner",
  );
  const hasLoginNavigate = actions.some(
    (a) =>
      a.type === "navigate" &&
      a.route === "/login" &&
      a.query?.next === "/planner",
  );

  for (const action of actions) {
    if (action.type === "noop") continue;

    if (action.type === "start_new_trip") {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(VOICE_START_NEW_TRIP_KEY, "1");
      }
      continue;
    }

    if (action.type === "scroll" && action.target) {
      const target = action.target;
      if (VOICE_SECTIONS.includes(target as (typeof VOICE_SECTIONS)[number])) {
        if (pathname !== "/") {
          navigate("/");
          await waitForPath("/");
        }
        await waitForElement(target);
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
      }
      continue;
    }

    if (action.type === "navigate" && action.route) {
      const href = buildHref(action.route, action.query);
      navigate(href);
      if (action.route === "/planner") {
        await waitForPath("/planner");
      }
      continue;
    }

    if (isPlannerAction(action)) {
      if (hasPlannerNavigate || hasLoginNavigate || (!onPlanner && !plannerHandlers)) {
        deferredPlanner.push(action);
        continue;
      }

      if (plannerHandlers) {
        executePlannerAction(action, plannerHandlers);
      } else {
        deferredPlanner.push(action);
      }
    }
  }

  if (deferredPlanner.length > 0) {
    queuePlannerActions(deferredPlanner);
  }
}

function waitForPath(expectedPrefix: string, timeoutMs = 4000): Promise<void> {
  return new Promise((resolve) => {
    if (window.location.pathname.startsWith(expectedPrefix)) {
      resolve();
      return;
    }
    const start = Date.now();
    const tick = () => {
      if (window.location.pathname.startsWith(expectedPrefix)) {
        resolve();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function waitForElement(id: string, timeoutMs = 3000): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const start = Date.now();
    const tick = () => {
      if (document.getElementById(id)) {
        resolve();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

export function flushPlannerActions(
  actions: VoiceAction[],
  handlers: PlannerVoiceHandlers,
): void {
  let plan = handlers.getPlanState();

  for (const action of actions) {
    if (!isPlannerAction(action)) continue;

    if (action.type === "planner_set" && action.field && action.value !== undefined) {
      const updates = buildPlannerSetUpdates(plan, action.field, action.value);
      if (updates) {
        plan = { ...plan, ...updates };
        handlers.updatePlan(updates);
      }
      continue;
    }

    if (action.type === "planner_go_to" && action.milestone) {
      const step = mapVoiceMilestoneToPlanStep(action.milestone, plan);
      handlers.setFocusedPlanStep(step);
      handlers.goToMilestone(step);
      continue;
    }

    if (action.type === "planner_complete" && action.milestone) {
      handlers.completeMilestone(action.milestone);
    }
  }
}
