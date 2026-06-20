import { getStoredToken } from "./auth";
import { PlanState, Milestone } from "./planner/types";
import { MILESTONES } from "./planner/data";

const API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL ?? "";

export type SavedTripPlan = {
  id: string;
  share_token: string;
  share_url: string;
};

export type LoadedTripPlan = {
  id: string;
  share_token: string;
  planState: PlanState;
};

export function isPlannerApiConfigured(): boolean {
  return API_URL.length > 0;
}

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  if (!token) {
    throw new Error("Sign in to save your trip plan.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string };
    if (body.detail) return body.detail;
  } catch {
    // keep default
  }
  return fallback;
}

function parsePlanState(
  raw: PlanState & { startDate?: string | null; activeMilestoneId?: string | null }
): PlanState {
  return {
    destination: raw.destination ?? null,
    travelStyle: raw.travelStyle ?? null,
    duration: raw.duration ?? 7,
    travelers: raw.travelers ?? 2,
    budget: raw.budget ?? 3000,
    accommodation: raw.accommodation ?? null,
    transport: raw.transport ?? null,
    startDate: raw.startDate ? new Date(raw.startDate) : null,
    completedMilestones: raw.completedMilestones || [],
    activeMilestoneId: raw.activeMilestoneId ?? null,
  };
}

export function resolveActiveMilestone(planState: PlanState): Milestone {
  if (planState.activeMilestoneId) {
    const fromId = MILESTONES.find((m) => m.id === planState.activeMilestoneId);
    if (fromId) return fromId;
  }

  const nextIncomplete = MILESTONES.find(
    (m) => !planState.completedMilestones.includes(m.id)
  );
  return nextIncomplete || MILESTONES[MILESTONES.length - 1];
}

function buildSavePayload(input: {
  planState: PlanState;
  activeMilestoneId: string;
  budgetTotal: number;
  budgetBreakdown: Record<string, number>;
}) {
  return {
    destination: input.planState.destination,
    travel_style: input.planState.travelStyle,
    duration: input.planState.duration,
    travelers: input.planState.travelers,
    budget_total: input.budgetTotal,
    accommodation: input.planState.accommodation,
    transport: input.planState.transport,
    start_date: input.planState.startDate?.toISOString() ?? null,
    plan_data: {
      ...input.planState,
      activeMilestoneId: input.activeMilestoneId,
      startDate: input.planState.startDate?.toISOString() ?? null,
    },
    budget_breakdown: input.budgetBreakdown,
  };
}

export async function saveTripPlan(input: {
  planState: PlanState;
  activeMilestoneId: string;
  budgetTotal: number;
  budgetBreakdown: Record<string, number>;
}): Promise<SavedTripPlan> {
  if (!API_URL) {
    throw new Error("API is not configured.");
  }

  const response = await fetch(`${API_URL.replace(/\/$/, "")}/planner/plans/me/current`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(buildSavePayload(input)),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Could not save your trip plan."));
  }

  return (await response.json()) as SavedTripPlan;
}

export async function fetchLatestTripPlan(): Promise<LoadedTripPlan | null> {
  if (!API_URL) return null;

  const response = await fetch(`${API_URL.replace(/\/$/, "")}/planner/plans/me/latest`, {
    headers: authHeaders(),
  });

  if (response.status === 404) return null;
  if (!response.ok) return null;

  const data = (await response.json()) as {
    id: string;
    share_token: string;
    plan_data: PlanState & { startDate?: string | null };
  };

  return {
    id: data.id,
    share_token: data.share_token,
    planState: parsePlanState(data.plan_data),
  };
}

export async function fetchTripPlanByToken(token: string): Promise<PlanState | null> {
  if (!API_URL) return null;

  const response = await fetch(`${API_URL.replace(/\/$/, "")}/planner/plans/${token}`, {
    headers: authHeaders(),
  });
  if (!response.ok) return null;

  const data = (await response.json()) as {
    plan_data: PlanState & { startDate?: string | null };
  };

  return parsePlanState(data.plan_data);
}
