export type Chapter = {
  id: string;
  title: string;
  description: string;
  note: string;
  emoji: string;
  stat: string;
  statLabel: string;
  gradient: string;
  slide?: number;
  rotate: number;
  position: { top: string; left: string };
  tape: "orange" | "cream";
  size: "sm" | "md" | "lg";
};

export const chapters: Chapter[] = [
  {
    id: "checklist",
    title: "Pre-Trip Checklist",
    description:
      "The exact apps locals live on, the Nol card hack, and the local rules tourists always get wrong.",
    note: "download these before you land →",
    emoji: "📌",
    stat: "12",
    statLabel: "must-have apps",
    gradient: "from-[#FFE566] to-[#FF8B3D]",
    slide: 2,
    rotate: -5,
    position: { top: "4%", left: "2%" },
    tape: "cream",
    size: "md",
  },
  {
    id: "food",
    title: "The Food Spots",
    description:
      "Skip the AED 300 buffet. Ravi, Al Mallah, Meena Bazaar — where 200 nationalities actually eat.",
    note: "shawarma under AED 10 →",
    emoji: "🌮",
    stat: "AED 10",
    statLabel: "real shawarma",
    gradient: "from-[#FFD4B2] to-[#FF9A6C]",
    rotate: 7,
    position: { top: "2%", left: "34%" },
    tape: "orange",
    size: "lg",
  },
  {
    id: "adventure",
    title: "Adventure",
    description:
      "Desert safaris, dune bashing, skydiving over the Palm, and the indoor escapes for summer.",
    note: "book before peak season →",
    emoji: "🏎️",
    stat: "48°C",
    statLabel: "summer hack",
    gradient: "from-[#FFFFFF] to-[#FFBB80]",
    rotate: -8,
    position: { top: "38%", left: "0%" },
    tape: "orange",
    size: "md",
  },
  {
    id: "nightlife",
    title: "Nightlife",
    description:
      "Rooftops, speakeasies behind unmarked doors, and the great views you can get without drinking.",
    note: "the view is free →",
    emoji: "🍹",
    stat: "Free",
    statLabel: "skyline views",
    gradient: "from-[#FF8B3D] to-[#FF6A00]",
    rotate: 4,
    position: { top: "6%", left: "68%" },
    tape: "cream",
    size: "sm",
  },
  {
    id: "itinerary",
    title: "7-Day Itinerary",
    description:
      "The day-by-day macro track — icons, Old Dubai, desert, beach — with room for a Kenzr to tweak it.",
    note: "your skeleton plan →",
    emoji: "🗺️",
    stat: "7",
    statLabel: "days mapped",
    gradient: "from-[#FBF3E4] to-[#FF9A6C]",
    rotate: 6,
    position: { top: "52%", left: "28%" },
    tape: "cream",
    size: "lg",
  },
  {
    id: "souks",
    title: "Souks & Haggling",
    description:
      "The unfiltered rules for the Gold & Spice Souks. Never accept the first price. Ever.",
    note: "counter at 40–50% →",
    emoji: "🛍️",
    stat: "50%",
    statLabel: "counter-offer",
    gradient: "from-[#FFF5EB] to-[#D94E00]",
    rotate: -6,
    position: { top: "44%", left: "62%" },
    tape: "orange",
    size: "md",
  },
];

export const mustSeeItems = [
  "Old Dubai & the abra",
  "Ravi Restaurant, Satwa",
  "Desert safari (book local)",
  "Gold Souk — haggle hard",
  "Marina Walk at sunset",
];
