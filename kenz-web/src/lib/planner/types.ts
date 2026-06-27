export interface Milestone {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export type Destination = "dubai" | "abu-dhabi" | "both";

export type TravelStyle = "luxury" | "balanced" | "budget" | "backpacker";

export type AccommodationType = "hotel" | "airbnb" | "hostel" | "resort";

export type TransportMode = "metro" | "taxi" | "rental" | "mixed";

export interface VisaRequirement {
  type: "visa-free" | "visa-on-arrival" | "pre-approved";
  duration: number;
  notes: string[];
  warning?: string;
}

export interface BudgetBreakdown {
  accommodation: number;
  transport: number;
  food: number;
  activities: number;
  emergency: number;
  total: number;
}

export interface LocalCompliance {
  passportScanRequired: boolean;
  gracePeriodDays: number;
  alcoholRestrictions: string;
  dressCode: string[];
  culturalNotes: string[];
}

export interface TransportRecommendation {
  mode: TransportMode;
  title: string;
  description: string;
  dailyCost: number;
  nolCard?: {
    type: "silver" | "gold" | "blue";
    cost: number;
    recommended: boolean;
  };
}

export interface PlanState {
  destination: Destination | null;
  travelStyle: TravelStyle | null;
  duration: number;
  travelers: number;
  budget: number;
  accommodation: AccommodationType | null;
  transport: TransportMode | null;
  startDate: Date | null;
  completedMilestones: string[];
  activeMilestoneId?: string | null;
  /** Google Places photo URLs fetched while building a new trip */
  placeImages?: {
    destination?: string;
    hotel?: string;
    transfer?: string;
    highlights?: Record<string, string>;
  };
}

export interface DubaiTravelData {
  visaRequirements: Record<string, VisaRequirement>;
  budgetRanges: Record<TravelStyle, { min: number; max: number; currency: string }>;
  transportOptions: TransportRecommendation[];
  compliance: LocalCompliance;
  seasonalRates: Record<string, { accommodation: number; activities: number }>;
}
