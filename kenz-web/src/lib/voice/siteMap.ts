export const VOICE_ROUTES = ["/", "/login", "/chat", "/planner"] as const;
export type VoiceRoute = (typeof VOICE_ROUTES)[number];

export const VOICE_SECTIONS = ["who", "experiences", "how", "map"] as const;
export type VoiceSection = (typeof VOICE_SECTIONS)[number];

export const VOICE_MILESTONES = [
  "destination",
  "style",
  "timeline",
  "logistics",
  "review",
] as const;
export type VoiceMilestone = (typeof VOICE_MILESTONES)[number];

export const SECTION_LABELS: Record<VoiceSection, string> = {
  who: "Who we are",
  experiences: "Experiences",
  how: "How KenZ works",
  map: "Neighborhoods",
};

export const SESSION_ID_KEY = "kenz_voice_session_id";
export const SESSION_TURNS_KEY = "kenz_voice_turns_used";
export const SESSION_TURN_LIMIT = 100;
export const VOICE_START_NEW_TRIP_KEY = "kenz_voice_start_new_trip";

export function getOrCreateVoiceSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `voice-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

export function getStoredTurnsUsed(): number {
  if (typeof window === "undefined") return 0;
  const raw = sessionStorage.getItem(SESSION_TURNS_KEY);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function setStoredTurnsUsed(turns: number): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_TURNS_KEY, String(turns));
}

export function clearAnonymousVoiceTurns(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_TURNS_KEY);
}
