"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/AuthProvider";
import { loadPersistedTrips, persistTrips } from "@/lib/dashboard/tripStorage";
import { INITIAL_PLAN_STATE, MILESTONES, DESTINATION_DATA, ACCOMMODATION_DATA, calculateBudget } from "./data";
import { isPlanComplete, planCompletionPercent } from "./planSteps";
import type { Milestone, PlanState } from "./types";
import type { DashboardTrip } from "@/lib/dashboard/types";

/* ─────────────────────────────────────────────
   Context type
───────────────────────────────────────────── */
type PlannerStateContextValue = {
  planState: PlanState;
  updatePlan: (updates: Partial<PlanState>) => void;
  resetPlan: () => void;
  activeMilestone: Milestone;
  setActiveMilestone: (m: Milestone) => void;
  markMilestoneComplete: (id: string) => void;
  savedTrips: DashboardTrip[];
  saveTripFromPlan: () => string | null;
  getSavedTripById: (id: string) => DashboardTrip | null;
  isPlanComplete: boolean;
  planProgress: number;
};

const PlannerStateContext = createContext<PlannerStateContextValue | null>(null);

/* ─────────────────────────────────────────────
   Trip generator
───────────────────────────────────────────── */
function generateTripFromPlanState(planState: PlanState, id: string): DashboardTrip {
  const dest = planState.destination ?? "dubai";
  const destInfo = DESTINATION_DATA[dest] ?? DESTINATION_DATA.dubai;
  const style = planState.travelStyle ?? "balanced";
  const travelers = planState.travelers > 0 ? planState.travelers : 2;
  const duration = planState.duration ?? 7;
  const acc = planState.accommodation ?? "hotel";
  const transport = planState.transport ?? "mixed";

  const accInfo = ACCOMMODATION_DATA[acc] ?? ACCOMMODATION_DATA.hotel;
  const budget = calculateBudget(style, duration, travelers, acc, transport, dest);

  const startDate = planState.startDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const dateRange = `${fmt(startDate).replace(`, ${startDate.getFullYear()}`, "")} – ${fmt(endDate)}`;

  /* ─── Destination-specific visuals ─── */
  type DestKey = "dubai" | "abu-dhabi" | "both";
  const DEST_IMAGES: Record<DestKey, { heroImages: DashboardTrip["heroImages"]; mapPins: DashboardTrip["mapPins"] }> = {
    dubai: {
      heroImages: [
        { src: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=80", label: "Burj Khalifa Sunset", tag: "Iconic View" },
        { src: "https://images.unsplash.com/photo-1515823064-d6e0c046c7f0?w=600&q=80", label: "Dubai Marina" },
        { src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80", label: "Dubai Skyline" },
      ],
      mapPins: [
        { id: "dxb", label: "Dubai Int'l Airport", lng: 55.3644, lat: 25.2532, order: 1 },
        { id: "jlt", label: destInfo.highlights[0] ?? "Dubai Marina", lng: 55.1387, lat: 25.071, order: 2 },
        { id: "burj", label: destInfo.highlights[1] ?? "Burj Khalifa", lng: 55.2744, lat: 25.1972, order: 3 },
      ],
    },
    "abu-dhabi": {
      heroImages: [
        { src: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=1200&q=80", label: "Sheikh Zayed Grand Mosque", tag: "Cultural Gem" },
        { src: "https://images.unsplash.com/photo-1526495124232-a04e1849168c?w=600&q=80", label: "Corniche Beach" },
        { src: "https://images.unsplash.com/photo-1568452810620-78f5b75b6b9b?w=600&q=80", label: "Yas Island" },
      ],
      mapPins: [
        { id: "auh", label: "Abu Dhabi Airport", lng: 54.6511, lat: 24.4326, order: 1 },
        { id: "mosque", label: "Sheikh Zayed Grand Mosque", lng: 54.4751, lat: 24.4128, order: 2 },
        { id: "corniche", label: "Abu Dhabi Corniche", lng: 54.3773, lat: 24.4875, order: 3 },
      ],
    },
    both: {
      heroImages: [
        { src: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=80", label: "Burj Khalifa — Dubai", tag: "Iconic View" },
        { src: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=600&q=80", label: "Sheikh Zayed Mosque" },
        { src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80", label: "UAE Skyline" },
      ],
      mapPins: [
        { id: "dxb", label: "Dubai Airport", lng: 55.3644, lat: 25.2532, order: 1 },
        { id: "burj", label: "Burj Khalifa", lng: 55.2744, lat: 25.1972, order: 2 },
        { id: "mosque", label: "Sheikh Zayed Mosque", lng: 54.4751, lat: 24.4128, order: 3 },
      ],
    },
  };

  const visuals = DEST_IMAGES[dest as DestKey] ?? DEST_IMAGES.dubai;
  const imgs = planState.placeImages;

  /* Override hero images with Google Places photos when available */
  const heroImages: DashboardTrip["heroImages"] = [
    {
      src: imgs?.destination ?? visuals.heroImages[0].src,
      label: visuals.heroImages[0].label,
      tag: visuals.heroImages[0].tag,
    },
    ...visuals.heroImages.slice(1).map((h, i) => ({
      ...h,
      src:
        (i === 0 && imgs?.hotel ? imgs.hotel : undefined) ??
        imgs?.highlights?.[destInfo.highlights[i] ?? ""] ??
        h.src,
    })),
  ];

  /* ─── Style-based hotel info ─── */
  const HOTEL_BY_STYLE: Record<string, { name: string; area: string; img: string }> = {
    luxury: { name: "Four Seasons Resort Dubai at JBR", area: "Jumeirah Beach", img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80" },
    balanced: { name: "Taj Jumeirah Lakes Towers", area: "JLT, Dubai", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" },
    budget: { name: "Rove Hotel Downtown Dubai", area: "Downtown Dubai", img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80" },
    backpacker: { name: "Dubai Youth Hostel", area: "Al Rigga, Deira", img: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80" },
  };
  const hotel = {
    ...(HOTEL_BY_STYLE[style] ?? HOTEL_BY_STYLE.balanced),
    img: imgs?.hotel ?? (HOTEL_BY_STYLE[style] ?? HOTEL_BY_STYLE.balanced).img,
  };

  /* ─── Booking lines ─── */
  const flightCost = Math.round(budget.breakdown.transport * 0.6);
  const hotelCost = budget.breakdown.accommodation;
  const transferCost = Math.round(budget.breakdown.transport * 0.4);
  const totalEstimate = flightCost + hotelCost + transferCost;

  const bookingLines = [
    { label: `Flights (${travelers} people)`, amount: flightCost },
    { label: `${hotel.name} (${duration - 1} nights)`, amount: hotelCost },
    { label: "Airport Transfers", amount: transferCost },
    { label: "Activities & Experiences", amount: budget.breakdown.activities },
  ];

  /* ─── Summary ─── */
  const summaryParts = [
    `${duration}-day trip to ${destInfo.name}`,
    `${travelers} traveller${travelers > 1 ? "s" : ""}`,
    style.charAt(0).toUpperCase() + style.slice(1) + " style",
    `${accInfo.name} in ${accInfo.dubaiAreas?.[0] ?? destInfo.name}`,
  ];

  return {
    id,
    title: `${destInfo.name} ${style.charAt(0).toUpperCase() + style.slice(1)} Escape`,
    destination: destInfo.name,
    country: "United Arab Emirates",
    dateRange,
    travelers,
    status: "booking",
    statusLabel: "New",
    progressPercent: isPlanComplete(planState) ? 100 : planCompletionPercent(planState),
    image: imgs?.destination ?? visuals.heroImages[0].src,
    tags: ["New", style.charAt(0).toUpperCase() + style.slice(1)],
    headline: destInfo.name,
    summary: summaryParts.join(" · "),
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    durationDays: duration,
    mapPins: visuals.mapPins,
    bookingLines,
    totalEstimate,
    confirmedCount: 0,
    draftCount: bookingLines.length,
    heroImages,
    cafes: [
      {
        id: "top-cafe",
        name: dest === "abu-dhabi" ? "Café Rider" : "NETTE at Matcha Club",
        rating: 4.9,
        description: "AI top pick based on your preferences.",
        image: "https://images.unsplash.com/photo-1515823064-d6e0c046c7f0?w=600&q=80",
        topChoice: true,
      },
    ],
    documents: [
      {
        id: "itinerary-draft",
        name: `${destInfo.name} Itinerary Draft.pdf`,
        type: "itinerary",
        updatedAt: "Just now",
        size: "1.2 MB",
      },
    ],
  };
}

/* ─────────────────────────────────────────────
   Provider
───────────────────────────────────────────── */
export function PlannerStateProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [planState, setPlanState] = useState<PlanState>(INITIAL_PLAN_STATE);
  const [activeMilestone, setActiveMilestone] = useState<Milestone>(MILESTONES[0]);
  const [savedTrips, setSavedTrips] = useState<DashboardTrip[]>([]);
  const [tripsHydrated, setTripsHydrated] = useState(false);
  const tripCounterRef = useRef(0);

  const userKey = user?.id ?? user?.email ?? null;

  /* Load saved trips when the user signs in */
  useEffect(() => {
    if (authLoading) return;

    if (!userKey) {
      setSavedTrips([]);
      setTripsHydrated(true);
      tripCounterRef.current = 0;
      return;
    }

    const stored = loadPersistedTrips(userKey);
    setSavedTrips(stored);
    tripCounterRef.current = stored.length;
    setTripsHydrated(true);
  }, [authLoading, userKey]);

  /* Persist trips to localStorage for this user */
  useEffect(() => {
    if (!tripsHydrated || !userKey) return;
    persistTrips(userKey, savedTrips);
  }, [savedTrips, tripsHydrated, userKey]);

  const updatePlan = useCallback((updates: Partial<PlanState>) => {
    setPlanState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetPlan = useCallback(() => {
    setPlanState(INITIAL_PLAN_STATE);
    setActiveMilestone(MILESTONES[0]);
  }, []);

  const markMilestoneComplete = useCallback((id: string) => {
    setPlanState((prev) => ({
      ...prev,
      completedMilestones: prev.completedMilestones.includes(id)
        ? prev.completedMilestones
        : [...prev.completedMilestones, id],
    }));
  }, []);

  const saveTripFromPlan = useCallback((): string | null => {
    if (!isPlanComplete(planState)) return null;
    tripCounterRef.current += 1;
    const id = `user-trip-${tripCounterRef.current}-${Date.now()}`;
    const trip = generateTripFromPlanState(planState, id);
    setSavedTrips((prev) => [trip, ...prev]);
    resetPlan();
    return id;
  }, [planState, resetPlan]);

  const getSavedTripById = useCallback(
    (id: string) => savedTrips.find((t) => t.id === id) ?? null,
    [savedTrips],
  );

  const complete = isPlanComplete(planState);
  const progress = planCompletionPercent(planState);

  const value = useMemo(
    () => ({
      planState,
      updatePlan,
      resetPlan,
      activeMilestone,
      setActiveMilestone,
      markMilestoneComplete,
      savedTrips,
      saveTripFromPlan,
      getSavedTripById,
      isPlanComplete: complete,
      planProgress: progress,
    }),
    [
      planState,
      updatePlan,
      resetPlan,
      activeMilestone,
      markMilestoneComplete,
      savedTrips,
      saveTripFromPlan,
      getSavedTripById,
      complete,
      progress,
    ],
  );

  return (
    <PlannerStateContext.Provider value={value}>{children}</PlannerStateContext.Provider>
  );
}

export function usePlannerState() {
  const ctx = useContext(PlannerStateContext);
  if (!ctx) throw new Error("usePlannerState must be used within PlannerStateProvider");
  return ctx;
}
