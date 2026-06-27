export type SidebarSection =
  | "conversations"
  | "trips"
  | "explore"
  | "saved"
  | "settings";

export type TripTab = "itinerary" | "map" | "budget" | "documents";

export type TripStatus = "booking" | "confirmed" | "draft" | "completed";

export type MapPin = {
  id: string;
  label: string;
  lng: number;
  lat: number;
  order: number;
};

export type TripSummary = {
  id: string;
  title: string;
  destination: string;
  country: string;
  dateRange: string;
  travelers: number;
  status: TripStatus;
  statusLabel?: string;
  progressPercent?: number;
  image: string;
  tags?: string[];
};

export type CafeRecommendation = {
  id: string;
  name: string;
  rating: number;
  description: string;
  image: string;
  topChoice?: boolean;
};

export type TripDocument = {
  id: string;
  name: string;
  type: "visa" | "flight" | "hotel" | "itinerary" | "other";
  updatedAt: string;
  size?: string;
};

export type BookingLine = {
  label: string;
  amount: number;
};

export type DashboardTrip = TripSummary & {
  headline: string;
  summary: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  mapPins: MapPin[];
  bookingLines: BookingLine[];
  totalEstimate: number;
  confirmedCount: number;
  draftCount: number;
  cafes: CafeRecommendation[];
  documents: TripDocument[];
  heroImages: { src: string; label: string; tag?: string }[];
};
