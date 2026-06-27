import type { DashboardTrip } from "./types";

const PREFIX = "kenz_saved_trips_";

function storageKey(userKey: string): string {
  return `${PREFIX}${userKey}`;
}

export function loadPersistedTrips(userKey: string): DashboardTrip[] {
  if (typeof window === "undefined" || !userKey) return [];
  try {
    const raw = localStorage.getItem(storageKey(userKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DashboardTrip[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistTrips(userKey: string, trips: DashboardTrip[]): void {
  if (typeof window === "undefined" || !userKey) return;
  try {
    localStorage.setItem(storageKey(userKey), JSON.stringify(trips));
  } catch {
    // quota exceeded — ignore
  }
}

export function clearPersistedTrips(userKey: string): void {
  if (typeof window === "undefined" || !userKey) return;
  localStorage.removeItem(storageKey(userKey));
}
