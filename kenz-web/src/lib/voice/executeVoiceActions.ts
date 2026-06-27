import type { PlanState } from "@/lib/planner/types";
import type { VoiceAction } from "./types";
import { VOICE_SECTIONS } from "./siteMap";

export type PlannerVoiceHandlers = {
  goToMilestone: (milestoneId: string) => void;
  updatePlan: (updates: Partial<PlanState>) => void;
  completeMilestone: (milestoneId: string) => void;
};

export type ExecuteVoiceActionsOptions = {
  actions: VoiceAction[];
  pathname: string;
  isAuthenticated: boolean;
  navigate: (href: string) => void;
  plannerHandlers: PlannerVoiceHandlers | null;
  queuePlannerActions: (actions: VoiceAction[]) => void;
};

function buildHref(route: string, query?: Record<string, string>): string {
  if (!query || Object.keys(query).length === 0) return route;
  const params = new URLSearchParams(query);
  return `${route}?${params.toString()}`;
}

function mapPlannerSetValue(
  field: string,
  value: string | number | undefined,
): Partial<PlanState> | null {
  if (value === undefined) return null;

  switch (field) {
    case "destination":
      return { destination: value as PlanState["destination"] };
    case "travelStyle":
      return { travelStyle: value as PlanState["travelStyle"] };
    case "duration":
      return { duration: Number(value) };
    case "travelers":
      return { travelers: Number(value) };
    case "accommodation":
      return { accommodation: value as PlanState["accommodation"] };
    case "transport":
      return { transport: value as PlanState["transport"] };
    default:
      return null;
  }
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
  if (action.type === "planner_go_to" && action.milestone) {
    handlers.goToMilestone(action.milestone);
    return;
  }

  if (action.type === "planner_complete" && action.milestone) {
    handlers.completeMilestone(action.milestone);
    return;
  }

  if (action.type === "planner_set" && action.field) {
    const updates = mapPlannerSetValue(action.field, action.value);
    if (updates) handlers.updatePlan(updates);
  }
}

export async function executeVoiceActions(
  options: ExecuteVoiceActionsOptions,
): Promise<void> {
  const { actions, pathname, isAuthenticated, navigate, plannerHandlers, queuePlannerActions } =
    options;

  const onPlanner = pathname.startsWith("/planner");
  const deferredPlanner: VoiceAction[] = [];

  // Check if there is a navigate-to-planner action in this batch so we know
  // to defer planner actions until the page has loaded rather than fire them
  // immediately (which would fail because the planner bridge isn't mounted yet).
  const hasPlannerNavigate = actions.some(
    (a) => a.type === "navigate" && a.route === "/planner",
  );

  for (const action of actions) {
    if (action.type === "noop") continue;

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
      // If we're navigating to the planner in this same batch, defer all
      // planner actions — the bridge will flush them once it mounts.
      if (hasPlannerNavigate || (!onPlanner && !plannerHandlers)) {
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
  for (const action of actions) {
    if (isPlannerAction(action)) {
      executePlannerAction(action, handlers);
    }
  }
}
