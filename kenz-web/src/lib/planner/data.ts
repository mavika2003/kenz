import {
  Milestone,
  PlanState,
  DubaiTravelData,
  TravelStyle,
  TransportRecommendation,
} from "./types";

export const MILESTONES: Milestone[] = [
  {
    id: "destination",
    label: "Destination",
    description: "Choose where to go",
    icon: "D",
  },
  {
    id: "style",
    label: "Travel Style",
    description: "Set your vibe",
    icon: "S",
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "When and how long",
    icon: "T",
  },
  {
    id: "logistics",
    label: "Logistics",
    description: "Stay and transport",
    icon: "L",
  },
  {
    id: "review",
    label: "Review",
    description: "Finalize plan",
    icon: "R",
  },
];

export const INITIAL_PLAN_STATE: PlanState = {
  destination: null,
  travelStyle: null,
  duration: 7,
  travelers: 2,
  budget: 3000,
  accommodation: null,
  transport: null,
  startDate: null,
  completedMilestones: [],
  activeMilestoneId: null,
};

export const DUBAI_DATA: DubaiTravelData = {
  visaRequirements: {
    US: {
      type: "visa-free",
      duration: 90,
      notes: [
        "Passport must be valid for 6+ months",
        "Return/onward ticket required at entry",
      ],
    },
    UK: {
      type: "visa-free",
      duration: 90,
      notes: [
        "Passport must be valid for 6+ months",
        "No criminal record restrictions",
      ],
    },
    CA: {
      type: "visa-free",
      duration: 90,
      notes: [
        "Passport must be valid for 6+ months",
        "Pre-arranged accommodation recommended",
      ],
    },
    AU: {
      type: "visa-free",
      duration: 90,
      notes: [
        "Passport must be valid for 6+ months",
        "Sufficient funds proof may be requested",
      ],
    },
    IN: {
      type: "pre-approved",
      duration: 60,
      notes: [
        "Apply via Emirates/Dubai Visa Processing Centre",
        "Processing time: 3-5 working days",
        "2026: Mandatory passport cover-page scanning required",
      ],
      warning: "ZERO grace period on visit visas in 2026. Overstay = immediate ban + fines.",
    },
    PK: {
      type: "pre-approved",
      duration: 60,
      notes: [
        "Apply via Emirates/Dubai Visa Processing Centre",
        "Processing time: 5-7 working days",
        "2026: Enhanced biometric verification required",
      ],
      warning: "ZERO grace period on visit visas in 2026. Overstay = immediate ban + AED 100/day fine.",
    },
    default: {
      type: "pre-approved",
      duration: 30,
      notes: [
        "Check UAE ICP smart services for eligibility",
        "Apply minimum 15 days before travel",
      ],
    },
  },

  budgetRanges: {
    luxury: { min: 8000, max: 25000, currency: "USD" },
    balanced: { min: 3000, max: 7000, currency: "USD" },
    budget: { min: 1200, max: 3000, currency: "USD" },
    backpacker: { min: 500, max: 1500, currency: "USD" },
  },

  transportOptions: [
    {
      mode: "metro",
      title: "NOL Card System",
      description: "Metro, buses, trams across Dubai & Abu Dhabi",
      dailyCost: 8,
      nolCard: {
        type: "silver",
        cost: 25,
        recommended: true,
      },
    },
    {
      mode: "taxi",
      title: "Careem & Uber",
      description: "Door-to-door convenience, higher cost",
      dailyCost: 80,
    },
    {
      mode: "rental",
      title: "Car Rental",
      description: "Freedom to explore, Salik tolls apply",
      dailyCost: 45,
    },
    {
      mode: "mixed",
      title: "Hybrid Approach",
      description: "Metro for distance, taxis for last-mile",
      dailyCost: 40,
      nolCard: {
        type: "gold",
        cost: 25,
        recommended: false,
      },
    },
  ],

  compliance: {
    passportScanRequired: true,
    gracePeriodDays: 0,
    alcoholRestrictions: "Licensed venues only. Zero tolerance for public intoxication.",
    dressCode: [
      "Cover shoulders & knees in public spaces",
      "Beachwear only at pools/beaches",
      "Ramadan: stricter observance in public",
    ],
    culturalNotes: [
      "No public displays of affection",
      "Ask permission before photographing locals",
      "Friday: reduced hours for many services",
    ],
  },

  seasonalRates: {
    "nov-mar": { accommodation: 1.4, activities: 1.2 },
    "apr-may": { accommodation: 1.0, activities: 1.0 },
    "jun-sep": { accommodation: 0.6, activities: 0.8 },
    "oct": { accommodation: 1.1, activities: 1.0 },
  },
};

export const DESTINATION_DATA = {
  dubai: {
    name: "Dubai",
    icon: "DXB",
    tagline: "Where ambition meets tradition",
    highlights: ["Burj Khalifa", "Dubai Mall", "Desert Safari", "Old Dubai"],
    bestFor: ["Luxury", "Shopping", "Architecture", "Nightlife"],
    estimatedDailyCost: 250,
  },
  "abu-dhabi": {
    name: "Abu Dhabi",
    icon: "AUH",
    tagline: "The soul of the Emirates",
    highlights: ["Sheikh Zayed Mosque", "Louvre Abu Dhabi", "Yas Island", "Corniche"],
    bestFor: ["Culture", "Family", "Beaches", "History"],
    estimatedDailyCost: 200,
  },
  both: {
    name: "Dubai + Abu Dhabi",
    icon: "UAE",
    tagline: "The complete Emirates experience",
    highlights: ["Both city highlights", "Desert between cities", "Cultural contrast"],
    bestFor: ["First-timers", "Explorers", "Culture seekers"],
    estimatedDailyCost: 225,
  },
};

export const ACCOMMODATION_DATA = {
  hotel: {
    name: "Hotels",
    description: "Full-service with amenities",
    priceMultiplier: 1.0,
    dubaiAreas: ["Downtown", "Marina", "JBR", "Deira"],
  },
  airbnb: {
    name: "Short-term Rentals",
    description: "Apartments with kitchen access",
    priceMultiplier: 0.85,
    dubaiAreas: ["JVC", "Dubai Hills", "Business Bay"],
    note: "Short-term rental regulations strictly enforced in 2026",
  },
  hostel: {
    name: "Hostels",
    description: "Budget-friendly, social atmosphere",
    priceMultiplier: 0.35,
    dubaiAreas: ["Al Rigga", "Deira", "Al Quoz"],
  },
  resort: {
    name: "Resorts",
    description: "All-inclusive beachfront luxury",
    priceMultiplier: 1.8,
    dubaiAreas: ["Palm Jumeirah", "Jumeirah Beach", "Desert resorts"],
  },
};

export function calculateBudget(
  style: TravelStyle,
  duration: number,
  travelers: number,
  accommodation: string,
  transport: string,
  destination: string
): {
  breakdown: Record<string, number>;
  total: number;
  perPerson: number;
  dailyAverage: number;
  recommendations: string[];
} {
  const baseRange = DUBAI_DATA.budgetRanges[style];
  const baseDaily = (baseRange.min + baseRange.max) / 2 / 7;

  // Adjust for accommodation
  const accMultiplier = ACCOMMODATION_DATA[accommodation as keyof typeof ACCOMMODATION_DATA]?.priceMultiplier || 1;

  // Adjust for transport
  const transportOption = DUBAI_DATA.transportOptions.find((t) => t.mode === transport);
  const transportDaily = transportOption?.dailyCost || 40;

  // Adjust for destination (Abu Dhabi slightly cheaper)
  const destMultiplier = destination === "abu-dhabi" ? 0.85 : destination === "both" ? 1.1 : 1;

  const accommodationDaily = baseDaily * 0.5 * accMultiplier * destMultiplier;
  const foodDaily = baseDaily * 0.2;
  const activitiesDaily = baseDaily * 0.15 * destMultiplier;
  const emergencyDaily = baseDaily * 0.05;

  const totalPerDay = accommodationDaily + foodDaily + activitiesDaily + transportDaily + emergencyDaily;
  const total = Math.round(totalPerDay * duration * travelers);

  const recommendations: string[] = [];

  if (style === "budget" || style === "backpacker") {
    if (transport !== "metro") {
      recommendations.push("Switch to NOL Silver Card to save AED " + Math.round((transportDaily - 8) * duration) + " on transport");
    }
    recommendations.push("Stay in Deira or Al Rigga for 40% lower accommodation costs");
  }

  if (style === "luxury" && accommodation !== "resort") {
    recommendations.push("Consider Palm Jumeirah resorts for the full luxury experience");
  }

  if (destination === "both") {
    recommendations.push("Add AED 100 for inter-city transport (E100/E101 bus or Careem)");
  }

  return {
    breakdown: {
      accommodation: Math.round(accommodationDaily * duration * travelers),
      transport: Math.round(transportDaily * duration * travelers),
      food: Math.round(foodDaily * duration * travelers),
      activities: Math.round(activitiesDaily * duration * travelers),
      emergency: Math.round(emergencyDaily * duration * travelers),
    },
    total,
    perPerson: Math.round(total / travelers),
    dailyAverage: Math.round(totalPerDay),
    recommendations,
  };
}

export function getSeasonalAdvice(month: number): {
  season: string;
  weather: string;
  crowds: string;
  pricing: string;
  advice: string[];
} {
  if (month >= 11 || month <= 3) {
    return {
      season: "Peak Season",
      weather: "Perfect 20-28°C",
      crowds: "High",
      pricing: "Premium +40%",
      advice: [
        "Book accommodation 2+ months ahead",
        "Expect queues at major attractions",
        "Outdoor activities in full swing",
      ],
    };
  }
  if (month >= 4 && month <= 5) {
    return {
      season: "Shoulder Season",
      weather: "Warm 28-35°C",
      crowds: "Moderate",
      pricing: "Standard rates",
      advice: [
        "Good balance of weather and crowds",
        "Beach weather still excellent",
        "Some outdoor events winding down",
      ],
    };
  }
  if (month >= 6 && month <= 9) {
    return {
      season: "Low Season",
      weather: "Hot 38-45°C",
      crowds: "Low",
      pricing: "Discounted -30%",
      advice: [
        "Indoor attractions preferred",
        "Amazing hotel deals available",
        "Ramadan may affect dining hours",
        "Water parks and malls are escapes",
      ],
    };
  }
  return {
    season: "Transition",
    weather: "Cooling 25-32°C",
    crowds: "Increasing",
    pricing: "Rising",
    advice: [
      "Good pre-season deals",
      "Weather becoming pleasant",
      "Perfect for desert activities",
    ],
  };
}
