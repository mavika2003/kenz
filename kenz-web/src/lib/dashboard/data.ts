import type { DashboardTrip, TripSummary } from "./types";

export const DUBAI_TRIP_ID = "dubai-dec-2026";

export const TRIP_LIST: TripSummary[] = [
  {
    id: DUBAI_TRIP_ID,
    title: "Dubai Elite Escape",
    destination: "Dubai",
    country: "United Arab Emirates",
    dateRange: "Dec 1 – 7, 2026",
    travelers: 2,
    status: "booking",
    statusLabel: "Next Week",
    progressPercent: 15,
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80",
    tags: ["Booking", "Next Week"],
  },
  {
    id: "alpine-sanctuary",
    title: "Alpine Sanctuary",
    destination: "Zermatt",
    country: "Switzerland",
    dateRange: "Dec 2024",
    travelers: 2,
    status: "confirmed",
    progressPercent: 100,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  },
  {
    id: "tokyo-neon",
    title: "Tokyo Neon Drift",
    destination: "Tokyo",
    country: "Japan",
    dateRange: "Draft",
    travelers: 1,
    status: "draft",
    image: "",
  },
];

export const ARCHIVE_TRIPS: TripSummary[] = [
  {
    id: "bali",
    title: "Bali Wellness Retreat",
    destination: "Bali",
    country: "Indonesia",
    dateRange: "Aug 2024",
    travelers: 2,
    status: "completed",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "paris",
    title: "Parisian Winter Solstice",
    destination: "Paris",
    country: "France",
    dateRange: "Jan 2024",
    travelers: 2,
    status: "completed",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "singapore",
    title: "Singapore Smart City Tour",
    destination: "Singapore",
    country: "Singapore",
    dateRange: "Nov 2023",
    travelers: 2,
    status: "completed",
    image:
      "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=400&fit=crop&q=80",
  },
];

export const DUBAI_TRIP: DashboardTrip = {
  ...TRIP_LIST[0],
  headline: "Dubai",
  summary: "7-night trip to Dubai · 2 travellers · Balanced style · Luxury & Culture",
  startDate: "Dec 1",
  endDate: "Dec 7",
  durationDays: 7,
  mapPins: [
    { id: "dubai", label: "Dubai Marina", lng: 55.1416, lat: 25.0805, order: 1 },
    { id: "mosque", label: "Grand Mosque", lng: 54.4753, lat: 24.4128, order: 2 },
    { id: "burj", label: "Burj Khalifa", lng: 55.2744, lat: 25.1972, order: 3 },
  ],
  bookingLines: [
    { label: "Flights (2 People)", amount: 4200 },
    { label: "Hotels (6 Nights)", amount: 5800 },
    { label: "Tours & Experiences", amount: 1080 },
  ],
  totalEstimate: 11080,
  confirmedCount: 2,
  draftCount: 1,
  heroImages: [
    {
      src: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=80",
      label: "Burj Khalifa Sunset Experience",
      tag: "Iconic View",
    },
    {
      src: "https://images.unsplash.com/photo-1515823064-d6e0c046c7f0?w=600&q=80",
      label: "Matcha Club",
    },
    {
      src: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=600&q=80",
      label: "Abu Dhabi Day Trip",
    },
  ],
  cafes: [
    {
      id: "nette",
      name: "NETTE at Matcha Club",
      rating: 4.9,
      description:
        "A secret garden oasis blending Japanese and French aesthetics.",
      image:
        "https://images.unsplash.com/photo-1515823064-d6e0c046c7f0?w=600&q=80",
      topChoice: true,
    },
    {
      id: "nightjar",
      name: "Nightjar Coffee Roasters",
      rating: 4.7,
      description: "Best nitro-infused matcha in Alserkal Avenue.",
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
    },
  ],
  documents: [
    {
      id: "itinerary",
      name: "Dubai Itinerary — Dec 2026.pdf",
      type: "itinerary",
      updatedAt: "Today",
      size: "2.4 MB",
    },
    {
      id: "flight",
      name: "Emirates EK202 Confirmation.pdf",
      type: "flight",
      updatedAt: "Yesterday",
      size: "890 KB",
    },
    {
      id: "hotel",
      name: "Taj JLT Booking Voucher.pdf",
      type: "hotel",
      updatedAt: "2 days ago",
      size: "1.1 MB",
    },
    {
      id: "visa",
      name: "UAE Visa Guidelines.pdf",
      type: "visa",
      updatedAt: "Last week",
      size: "450 KB",
    },
  ],
};

export function getTripById(id: string): DashboardTrip | null {
  if (id === DUBAI_TRIP_ID) return DUBAI_TRIP;
  return null;
}
