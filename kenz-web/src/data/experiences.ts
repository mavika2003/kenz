export type Experience = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  stat: string;
  statLabel: string;
  gradient: string;
  span: "hero" | "wide" | "tall" | "default";
  tone: "light" | "dark";
};

export const experiences: Experience[] = [
  {
    id: "arrive",
    title: "Arrive smart",
    summary: "Apps, Nol card, SIM, and the rules tourists always get wrong.",
    detail:
      "Download Careem, Talabat, and RTA Dubai before you land. Load a Nol card at the metro, not at the hotel desk. Friday brunch is not lunch. Ramadan hours shift everything.",
    stat: "12",
    statLabel: "must-have apps",
    gradient: "from-[#1a1714] via-[#2d2419] to-[#ff6a00]/40",
    span: "hero",
    tone: "dark",
  },
  {
    id: "food",
    title: "Eat like a local",
    summary: "Ravi, Al Mallah, Meena Bazaar. Real shawarma under AED 15.",
    detail:
      "Skip the AED 300 hotel buffet. Satwa, Karama, and Deira are where 200 nationalities actually eat. Order what the table next to you ordered.",
    stat: "AED 12",
    statLabel: "shawarma avg",
    gradient: "from-[#ff8b3d] to-[#d94e00]",
    span: "wide",
    tone: "dark",
  },
  {
    id: "desert",
    title: "Desert & adventure",
    summary: "Safaris, dunes, skydiving, and indoor escapes for summer heat.",
    detail:
      "Book desert camps through local operators, not hotel concierge markups. Summer means indoor: Ski Dubai, museums, mall walks with purpose.",
    stat: "48C",
    statLabel: "summer plan B",
    gradient: "from-[#f7f4ef] to-[#c4a882]",
    span: "default",
    tone: "light",
  },
  {
    id: "night",
    title: "Night skyline",
    summary: "Rooftops, speakeasies, and views that cost nothing.",
    detail:
      "Marina Walk at sunset beats most paid observation decks. Many rooftops are free if you order a juice. Dress code is real. Carry ID.",
    stat: "Free",
    statLabel: "marina walk",
    gradient: "from-[#141210] to-[#3d2a1f]",
    span: "tall",
    tone: "dark",
  },
  {
    id: "itinerary",
    title: "Your week, mapped",
    summary: "A seven-day skeleton: Old Dubai, icons, desert, beach.",
    detail:
      "Day 1 creek and souks. Day 2 Marina and JBR. Day 3 desert. Leave gaps. Locals do not run back-to-back attractions.",
    stat: "7",
    statLabel: "day framework",
    gradient: "from-[#ffe566]/30 to-[#ff6a00]/50",
    span: "wide",
    tone: "light",
  },
  {
    id: "souks",
    title: "Souks without getting played",
    summary: "Gold, spice, and perfume. Counter at 40 to 50 percent.",
    detail:
      "Never accept the first price. Walk away once. The abra across the creek costs AED 1. Haggle with a smile, not aggression.",
    stat: "50%",
    statLabel: "counter rule",
    gradient: "from-[#fff5eb] to-[#d94e00]",
    span: "default",
    tone: "dark",
  },
];

export const mustSeeItems = [
  "Old Dubai and the abra crossing",
  "Ravi Restaurant, Satwa",
  "Desert safari with a local operator",
  "Gold Souk with a firm counter-offer",
  "Marina Walk at golden hour",
];

export const howItWorksSteps = [
  {
    step: "01",
    title: "Browse local picks",
    body: "Six experience lanes curated by residents. No sponsored lists. No brochure filler.",
  },
  {
    step: "02",
    title: "Plan your trip",
    body: "Use the planner to map dates, budget, neighborhoods, and logistics in one place.",
  },
  {
    step: "03",
    title: "Chat with a Kenzr",
    body: "A real local in your pocket for live answers: where to eat now, what to skip, what changed today.",
  },
];
