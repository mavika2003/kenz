import { getStoredToken } from "./auth";
import { PlanState } from "./planner/types";

const API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL ?? "";

export type SavedTripPlan = {
  id: string;
  share_token: string;
  share_url: string;
};

export function isPlannerApiConfigured(): boolean {
  return API_URL.length > 0;
}

function optionalAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
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

export async function saveTripPlan(input: {
  planState: PlanState;
  budgetTotal: number;
  budgetBreakdown: Record<string, number>;
}): Promise<SavedTripPlan> {
  if (!API_URL) {
    throw new Error("API is not configured.");
  }

  const response = await fetch(`${API_URL.replace(/\/$/, "")}/planner/plans`, {
    method: "POST",
    headers: optionalAuthHeaders(),
    body: JSON.stringify({
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
        startDate: input.planState.startDate?.toISOString() ?? null,
      },
      budget_breakdown: input.budgetBreakdown,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Could not save your trip plan."));
  }

  return (await response.json()) as SavedTripPlan;
}

export async function fetchTripPlanByToken(token: string): Promise<PlanState | null> {
  if (!API_URL) return null;

  const response = await fetch(`${API_URL.replace(/\/$/, "")}/planner/plans/${token}`);
  if (!response.ok) return null;

  const data = (await response.json()) as {
    plan_data: PlanState & { startDate?: string | null };
  };

  const plan = data.plan_data;
  return {
    ...plan,
    startDate: plan.startDate ? new Date(plan.startDate) : null,
    completedMilestones: plan.completedMilestones || [],
  };
}
