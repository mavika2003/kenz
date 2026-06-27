import type {
  AccommodationType,
  Destination,
  PlanState,
  TravelStyle,
} from "./types";
import { ACCOMMODATION_DATA, DESTINATION_DATA } from "./data";

export type PlanStepId =
  | "destination"
  | "style"
  | "dates"
  | "travellers"
  | "accommodation";

export type PlanOption<T extends string = string> = {
  value: T;
  label: string;
  hint?: string;
};

export const DESTINATION_OPTIONS: PlanOption<Destination>[] = [
  { value: "dubai", label: "Dubai", hint: DESTINATION_DATA.dubai.tagline },
  { value: "abu-dhabi", label: "Abu Dhabi", hint: DESTINATION_DATA["abu-dhabi"].tagline },
  { value: "both", label: "Both", hint: DESTINATION_DATA.both.tagline },
];

export const STYLE_OPTIONS: PlanOption<TravelStyle>[] = [
  { value: "luxury", label: "Luxury", hint: "5-star stays & fine dining" },
  { value: "balanced", label: "Balanced", hint: "Comfort without splurge" },
  { value: "budget", label: "Budget", hint: "Smart spending" },
  { value: "backpacker", label: "Backpacker", hint: "Hostels & local eats" },
];

export const TRAVELLER_OPTIONS: PlanOption[] = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5+" },
];

export const DURATION_OPTIONS: PlanOption[] = [
  { value: "5", label: "5 nights" },
  { value: "7", label: "7 nights" },
  { value: "10", label: "10 nights" },
  { value: "14", label: "14 nights" },
];

export const DATE_START_OPTIONS: PlanOption[] = [
  { value: "14", label: "In 2 weeks" },
  { value: "30", label: "In 1 month" },
  { value: "60", label: "In 2 months" },
];

export const ACCOMMODATION_OPTIONS: PlanOption<AccommodationType>[] = [
  { value: "hotel", label: "Hotel", hint: ACCOMMODATION_DATA.hotel.description },
  { value: "resort", label: "Resort", hint: ACCOMMODATION_DATA.resort.description },
  { value: "airbnb", label: "Apartment", hint: ACCOMMODATION_DATA.airbnb.description },
  { value: "hostel", label: "Hostel", hint: ACCOMMODATION_DATA.hostel.description },
];

const REQUIRED_STEPS: PlanStepId[] = [
  "destination",
  "style",
  "dates",
  "travellers",
  "accommodation",
];

export const PLAN_STEP_ORDER = REQUIRED_STEPS;

export function stepIndex(step: PlanStepId): number {
  return REQUIRED_STEPS.indexOf(step);
}

export function fieldToPlanStep(field: string): PlanStepId | null {
  switch (field) {
    case "destination":
      return "destination";
    case "travelStyle":
      return "style";
    case "duration":
    case "startInDays":
      return "dates";
    case "travelers":
      return "travellers";
    case "accommodation":
    case "transport":
      return "accommodation";
    default:
      return null;
  }
}

/** Voice may only set fields for the current checklist step */
export function canSetField(plan: PlanState, field: string): boolean {
  const fieldStep = fieldToPlanStep(field);
  if (!fieldStep) return false;
  return fieldStep === getCurrentPlanStep(plan);
}

export function defaultStartDate(daysFromNow = 30): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(12, 0, 0, 0);
  return d;
}

export function buildPlannerSetUpdates(
  plan: PlanState,
  field: string,
  value: string | number,
): Partial<PlanState> | null {
  if (!canSetField(plan, field)) return null;

  switch (field) {
    case "destination":
      return { destination: value as Destination };
    case "travelStyle":
      return { travelStyle: value as TravelStyle };
    case "duration":
      return {
        duration: Number(value),
        startDate: plan.startDate ?? defaultStartDate(30),
      };
    case "startInDays":
      return {
        startDate: defaultStartDate(Number(value)),
        duration: plan.duration > 0 ? plan.duration : 7,
      };
    case "travelers":
      return { travelers: Number(value) };
    case "accommodation": {
      const acc = value as AccommodationType;
      return {
        accommodation: acc,
        transport: plan.transport ?? defaultTransportFor(plan.travelStyle, acc),
      };
    }
    case "transport":
      return { transport: value as PlanState["transport"] };
    default:
      return null;
  }
}

/** Map legacy voice milestones to the UI checklist step */
export function mapVoiceMilestoneToPlanStep(
  milestone: string,
  plan: PlanState,
): PlanStepId {
  if (REQUIRED_STEPS.includes(milestone as PlanStepId)) {
    return milestone as PlanStepId;
  }
  if (milestone === "logistics") return getCurrentPlanStep(plan);
  if (milestone === "review") {
    return isPlanComplete(plan) ? "accommodation" : getCurrentPlanStep(plan);
  }
  return getCurrentPlanStep(plan);
}

export function isPlanStepDone(step: PlanStepId, plan: PlanState): boolean {
  switch (step) {
    case "destination":
      return plan.destination !== null;
    case "style":
      return plan.travelStyle !== null;
    case "dates":
      return plan.startDate !== null;
    case "travellers":
      return plan.travelers > 0;
    case "accommodation":
      return plan.accommodation !== null;
    default:
      return false;
  }
}

export function isPlanComplete(plan: PlanState): boolean {
  return REQUIRED_STEPS.every((step) => isPlanStepDone(step, plan));
}

export function planCompletionPercent(plan: PlanState): number {
  const done = REQUIRED_STEPS.filter((s) => isPlanStepDone(s, plan)).length;
  return Math.round((done / REQUIRED_STEPS.length) * 100);
}

/** First checklist step that still needs an answer */
export function getCurrentPlanStep(plan: PlanState): PlanStepId {
  for (const step of REQUIRED_STEPS) {
    if (!isPlanStepDone(step, plan)) return step;
  }
  return "accommodation";
}

/** Send the exact checklist step id to the voice API */
export function voiceMilestoneForPlanStep(step: PlanStepId): string {
  return step;
}

export const PLAN_STEP_PROMPTS: Record<PlanStepId, string> = {
  destination: "Where would you like to go? Dubai, Abu Dhabi, or both!",
  style: "What's your travel style? Luxury, balanced, budget, or backpacker.",
  dates: "When are you travelling? Tell me trip length and when you'd like to start.",
  travellers: "How many people are travelling?",
  accommodation: "Where do you want to stay? Hotel, resort, apartment, or hostel.",
};

export function defaultTransportFor(
  style: TravelStyle | null,
  accommodation: AccommodationType | null,
): PlanState["transport"] {
  if (accommodation === "hostel") return "metro";
  if (accommodation === "resort") return "taxi";
  if (accommodation === "airbnb") return "rental";
  if (style === "luxury") return "taxi";
  if (style === "backpacker") return "metro";
  return "mixed";
}

export function defaultAccommodationFor(style: TravelStyle): AccommodationType {
  if (style === "luxury") return "resort";
  if (style === "backpacker") return "hostel";
  return "hotel";
}

export function hotelNameForStyle(style: TravelStyle): string {
  const names: Record<TravelStyle, string> = {
    luxury: "Four Seasons Resort Dubai at JBR",
    balanced: "Taj Jumeirah Lakes Towers",
    budget: "Rove Hotel Downtown",
    backpacker: "Dubai Youth Hostel",
  };
  return names[style];
}
