export type Neighborhood = {
  id: string;
  name: string;
  emoji: string;
  lat: number;
  lng: number;
  tip: string;
};

export const neighborhoods: Neighborhood[] = [
  {
    id: "old-dubai",
    name: "Old Dubai",
    emoji: "🕌",
    lat: 25.2631,
    lng: 55.2972,
    tip: "Gold Souk, abra rides, and the real AED 5 shawarma spots.",
  },
  {
    id: "marina",
    name: "Marina",
    emoji: "🌊",
    lat: 25.0805,
    lng: 55.1403,
    tip: "Marina Walk at sunset — skip the overpriced waterfront traps.",
  },
  {
    id: "downtown",
    name: "Downtown",
    emoji: "🏙️",
    lat: 25.1972,
    lng: 55.2744,
    tip: "Burj views from Dubai Mall terrace — free, no ticket needed.",
  },
  {
    id: "jbr",
    name: "JBR",
    emoji: "🏖️",
    lat: 25.0772,
    lng: 55.1333,
    tip: "The Walk for people-watching; beach is public, no resort pass.",
  },
  {
    id: "deira",
    name: "Deira",
    emoji: "🛍️",
    lat: 25.2667,
    lng: 55.3167,
    tip: "Spice Souk haggling starts at 40% of the first price. Always.",
  },
];
