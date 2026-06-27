export type VoiceActionType =
  | "scroll"
  | "navigate"
  | "planner_go_to"
  | "planner_set"
  | "planner_complete"
  | "noop";

export type VoiceAction = {
  type: VoiceActionType;
  target?: string;
  route?: string;
  query?: Record<string, string>;
  milestone?: string;
  field?: string;
  value?: string | number;
};

export type PageContext = {
  pathname: string;
  planner_milestone: string | null;
  is_authenticated: boolean;
};

export type VoiceAgentResponse = {
  say: string;
  actions: VoiceAction[];
  turns_used: number;
  turns_limit: number;
  transcript?: string;
};

export type VoiceAgentStatus =
  | "idle"
  | "listening"
  | "hearing"
  | "thinking"
  | "speaking"
  | "error";
