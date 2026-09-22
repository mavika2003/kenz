/* ── What's On ─────────────────────────────────────────────────────── */

export type EventCategory = "culture" | "food" | "outdoors" | "nightlife" | "family";

export type EventFilter = "offers" | "food" | "events";

export type DubaiEvent = {
  id: string;
  title: string;
  blurb: string;
  category: EventCategory;
  filter: EventFilter;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  area: string;
  price: string;
  aed: number;
  aedWas?: number;
  priceUnit: string;
  free?: boolean;
  featured?: boolean;
  badge?: string;
  timeLeft?: string;
  timeLeftNote?: string;
  vouches: number;
  author: string;
  authorInitial: string;
  localYears: number;
  postedAgo: string;
  image: string;
  imageAlt: string;
  localTip: string;
  startsOn?: string;
  endsOn?: string;
  bookHref?: string;
  source?: "local" | "google" | "user";
};

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  culture: "Culture",
  food: "Food",
  outdoors: "Outdoors",
  nightlife: "Nightlife",
  family: "Family",
};

export const EVENTS: DubaiEvent[] = [
  {
    id: "palazzo",
    title: "Palazzo Versace is half price till September ends",
    blurb: "Rooms are half off all summer, pool included. Go down after sunset, it's empty.",
    category: "nightlife",
    filter: "offers",
    dateLabel: "Till 30 Sep",
    timeLabel: "Check-in from 3pm",
    venue: "Palazzo Versace",
    area: "Al Jaddaf, on the Creek",
    price: "AED 640",
    aed: 640,
    aedWas: 1280,
    priceUnit: "Per night",
    featured: true,
    badge: "−50% summer rate",
    timeLeft: "14 days",
    timeLeftNote: "ends Wed 30 Sep",
    vouches: 412,
    author: "Naina",
    authorInitial: "N",
    localYears: 4,
    postedAgo: "2 days ago",
    image: "/discover/creek.jpg",
    imageAlt: "Lit hotel on the water at dusk",
    localTip: "Go down after sunset, it's empty.",
    startsOn: "2026-09-01",
    endsOn: "2026-09-30",
  },
  {
    id: "hatta-kayak",
    title: "Kayak out to the Burj Al Arab at sunset",
    blurb: "A 90-minute paddle from Kite Beach with a guide. Take the 5:30 slot, the water is glass.",
    category: "outdoors",
    filter: "events",
    dateLabel: "Daily",
    timeLabel: "5:30pm",
    venue: "Kite Beach",
    area: "Kite Beach, Jumeirah",
    price: "AED 150",
    aed: 150,
    priceUnit: "Per person",
    timeLeft: "Tonight",
    timeLeftNote: "last boats 6:15",
    vouches: 287,
    author: "Omar",
    authorInitial: "O",
    localYears: 9,
    postedAgo: "5 days ago",
    image: "/discover/kayak.jpg",
    imageAlt: "Kayak on calm water at sunset",
    localTip: "Take the 5:30 slot, the water is glass.",
  },
  {
    id: "global-village",
    title: "Global Village opens for the season",
    blurb:
      "Ninety country pavilions, street food from Yemen to Thailand, fireworks every weekend. The biggest thing in the city from now until spring.",
    category: "family",
    filter: "events",
    dateLabel: "Opens Sat 20 Sep",
    timeLabel: "4pm – 1am",
    venue: "Global Village",
    area: "Sheikh Mohammed Bin Zayed Rd",
    price: "AED 27",
    aed: 27,
    priceUnit: "Per person",
    featured: true,
    timeLeft: "Season just opened",
    vouches: 640,
    author: "Layla",
    authorInitial: "L",
    localYears: 6,
    postedAgo: "Yesterday",
    image: "/discover/market.jpg",
    imageAlt: "Night market lit with lanterns and crowds",
    localTip: "Go on a weekday after 8pm. Weekends are shoulder to shoulder.",
    startsOn: "2026-09-20",
    endsOn: "2026-04-15",
  },
  {
    id: "alserkal-night",
    title: "Alserkal Avenue gallery night",
    blurb: "Twenty warehouses open late, new shows, free tours, and the best coffee in Al Quoz.",
    category: "culture",
    filter: "events",
    dateLabel: "Thu 25 Sep",
    timeLabel: "6pm – 10pm",
    venue: "Alserkal Avenue",
    area: "Al Quoz",
    price: "Free",
    aed: 0,
    priceUnit: "Entry",
    free: true,
    vouches: 198,
    author: "Hassan",
    authorInitial: "H",
    localYears: 12,
    postedAgo: "3 days ago",
    image: "/discover/gallery.jpg",
    imageAlt: "People inside a contemporary art gallery",
    localTip: "Park at Warehouse 1. Everything else is a ten-minute loop on foot.",
    startsOn: "2026-09-25",
    endsOn: "2026-09-25",
  },
  {
    id: "kite-beach-market",
    title: "Kite Beach night market",
    blurb: "Food trucks, live acoustic sets, and a Burj Al Arab view that costs nothing.",
    category: "food",
    filter: "food",
    dateLabel: "Fri 26 – Sun 28 Sep",
    timeLabel: "5pm – midnight",
    venue: "Kite Beach",
    area: "Jumeirah",
    price: "Free entry",
    aed: 0,
    priceUnit: "Entry",
    free: true,
    vouches: 331,
    author: "Naina",
    authorInitial: "N",
    localYears: 4,
    postedAgo: "4 days ago",
    image: "/discover/marina.jpg",
    imageAlt: "Dubai waterfront at dusk",
    localTip: "Eat at the Emirati stall near the running track. Locals queue there for a reason.",
    startsOn: "2026-09-26",
    endsOn: "2026-09-28",
  },
  {
    id: "marina-sunset-cruise",
    title: "Sunset dhow cruise from the Marina",
    blurb: "A wooden dhow, a slow loop under the skyline, tea and dates included. No dinner-cruise upsell.",
    category: "outdoors",
    filter: "events",
    dateLabel: "Daily",
    timeLabel: "5:30pm",
    venue: "Marina Walk pier",
    area: "Dubai Marina",
    price: "AED 120",
    aed: 120,
    priceUnit: "Per person",
    vouches: 254,
    author: "Omar",
    authorInitial: "O",
    localYears: 9,
    postedAgo: "1 week ago",
    image: "/discover/dhow-sunset.jpg",
    imageAlt: "Lit wooden dhow on the Marina at sunset, Ain Dubai behind",
    localTip: "Book the 5:30 slot. Light hits the towers at 6:10 and the water goes flat.",
  },
  {
    id: "old-dubai-food-walk",
    title: "Old Dubai food walk with Frying Pan Adventures",
    blurb: "Four hours, eight stops, Iraqi bread to Iranian saffron ice cream. Run by residents who grew up here.",
    category: "food",
    filter: "food",
    dateLabel: "Tue 30 Sep",
    timeLabel: "6pm",
    venue: "Al Fahidi",
    area: "Bur Dubai",
    price: "AED 395",
    aed: 395,
    priceUnit: "Per person",
    vouches: 176,
    author: "Layla",
    authorInitial: "L",
    localYears: 6,
    postedAgo: "6 days ago",
    image: "/discover/mezze.jpg",
    imageAlt: "Middle Eastern food spread on a table",
    localTip: "Skip lunch. You will not want it.",
  },
  {
    id: "burj-park-cinema",
    title: "Open-air cinema at Burj Park",
    blurb: "Bean bags on the grass, the fountain show behind you, a film in front of you.",
    category: "nightlife",
    filter: "events",
    dateLabel: "Sat 4 Oct",
    timeLabel: "8pm",
    venue: "Burj Park",
    area: "Downtown",
    price: "AED 65",
    aed: 65,
    priceUnit: "Per person",
    vouches: 142,
    author: "Hassan",
    authorInitial: "H",
    localYears: 12,
    postedAgo: "1 week ago",
    image: "/discover/skyline.jpg",
    imageAlt: "Downtown Dubai skyline lit at night",
    localTip: "Arrive at 7:30 and grab the back row. You get the fountains and the screen.",
    startsOn: "2026-10-04",
    endsOn: "2026-10-04",
  },
];

export const DUMMY_OFFERS: DubaiEvent[] = [
  {
    id: "offer-entertainer",
    title: "2-for-1 Friday brunch with The Entertainer",
    blurb: "Buy one brunch, get the second free at 40+ hotels this month. The app pays for itself in one sitting.",
    category: "food",
    filter: "offers",
    dateLabel: "Fridays in Sep",
    timeLabel: "12pm – 4pm",
    venue: "Participating hotels",
    area: "Marina, Downtown, JBR",
    price: "AED 245",
    aed: 245,
    aedWas: 490,
    priceUnit: "For two",
    badge: "2-for-1",
    timeLeft: "3 Fridays left",
    timeLeftNote: "this month",
    vouches: 890,
    author: "Naina",
    authorInitial: "N",
    localYears: 4,
    postedAgo: "Today",
    image: "/discover/buffet.jpg",
    imageAlt: "Hotel brunch buffet",
    localTip: "Book the 12:30 sitting. 3pm is leftover pastry and a queue.",
    startsOn: "2026-09-01",
    endsOn: "2026-09-30",
    source: "local",
  },
  {
    id: "offer-ski",
    title: "Ski Dubai slope pass is 30% off on weekdays",
    blurb: "Red slope + kit hire. Summer indoor plan that actually cools you down.",
    category: "family",
    filter: "offers",
    dateLabel: "Sun – Thu",
    timeLabel: "10am – 6pm",
    venue: "Ski Dubai",
    area: "Mall of the Emirates",
    price: "AED 175",
    aed: 175,
    aedWas: 250,
    priceUnit: "Per person",
    badge: "−30%",
    timeLeft: "Weekdays only",
    vouches: 318,
    author: "Omar",
    authorInitial: "O",
    localYears: 9,
    postedAgo: "Yesterday",
    image: "/discover/skyline.jpg",
    imageAlt: "Dubai skyline",
    localTip: "Go at 11am. School groups hit after 1pm.",
    startsOn: "2026-09-01",
    endsOn: "2026-10-31",
    source: "local",
  },
  {
    id: "offer-aquaventure",
    title: "Aquaventure after 2pm is half price",
    blurb: "Same slides, half the heat and half the ticket. Locals never go at 10am in September.",
    category: "family",
    filter: "offers",
    dateLabel: "Daily",
    timeLabel: "From 2pm",
    venue: "Atlantis, The Palm",
    area: "Palm Jumeirah",
    price: "AED 195",
    aed: 195,
    aedWas: 390,
    priceUnit: "Per person",
    badge: "½ day",
    timeLeft: "All month",
    vouches: 501,
    author: "Layla",
    authorInitial: "L",
    localYears: 6,
    postedAgo: "3 days ago",
    image: "/discover/marina.jpg",
    imageAlt: "Palm and marina water",
    localTip: "Enter at 2:15. The lockers on the left are empty.",
    startsOn: "2026-09-01",
    endsOn: "2026-09-30",
    source: "local",
  },
  {
    id: "offer-careem",
    title: "Careem 25% off your first three rides",
    blurb: "Code on the splash screen this week. Cheaper than a hotel taxi to anywhere inside the city.",
    category: "outdoors",
    filter: "offers",
    dateLabel: "This week",
    timeLabel: "Anytime",
    venue: "Careem app",
    area: "Citywide",
    price: "AED 0",
    aed: 0,
    priceUnit: "Promo",
    free: true,
    badge: "−25%",
    timeLeft: "7 days",
    vouches: 1204,
    author: "Hassan",
    authorInitial: "H",
    localYears: 12,
    postedAgo: "Today",
    image: "/discover/dhow-sunset.jpg",
    imageAlt: "Dubai waterfront at dusk",
    localTip: "Apply it before you request. It will not stack after.",
    startsOn: "2026-09-17",
    endsOn: "2026-09-24",
    bookHref: "https://www.careem.com",
    source: "local",
  },
  {
    id: "offer-noon",
    title: "Noon: same-day groceries, first order free delivery",
    blurb: "Forgot sunscreen or a UK adaptor. Noon before 2pm lands before dinner.",
    category: "food",
    filter: "offers",
    dateLabel: "Until 30 Sep",
    timeLabel: "Order before 2pm",
    venue: "Noon app",
    area: "Most of Dubai",
    price: "AED 0",
    aed: 0,
    priceUnit: "Delivery",
    free: true,
    badge: "Free del.",
    timeLeft: "13 days",
    vouches: 276,
    author: "Naina",
    authorInitial: "N",
    localYears: 4,
    postedAgo: "2 days ago",
    image: "/discover/food.jpg",
    imageAlt: "Groceries and food",
    localTip: "The tourist SIM section is under Mobiles, not Electronics.",
    startsOn: "2026-09-01",
    endsOn: "2026-09-30",
    bookHref: "https://www.noon.com/uae-en/",
    source: "local",
  },
];

/* ── Itineraries ───────────────────────────────────────────────────── */

export type DaySlot = {
  morning: string;
  afternoon: string;
  evening: string;
  night: string;
};

export type ItineraryDay = {
  day: number;
  title: string;
  tape: "orange" | "cream" | "sage";
} & DaySlot;

export type Polaroid = {
  src: string;
  alt: string;
  caption: string;
  rotate: number;
};

export type CommunityItinerary = {
  id: string;
  title: string;
  vibe: string;
  days: number;
  author: string;
  authorInitial: string;
  authorNote: string;
  budget: string;
  daysPlan: ItineraryDay[];
  polaroids: Polaroid[];
};

export const EMPTY_SLOT: DaySlot = {
  morning: "",
  afternoon: "",
  evening: "",
  night: "",
};

export const TAPE_CLASS: Record<ItineraryDay["tape"], string> = {
  orange: "bg-[#ffd7b8] text-[#9a3d00]",
  cream: "bg-[#f3e3c4] text-[#6b4a1e]",
  sage: "bg-[#d7e4c8] text-[#3d5a32]",
};

export function blankDays(count: number): ItineraryDay[] {
  const tapes: ItineraryDay["tape"][] = ["orange", "cream", "sage"];
  return Array.from({ length: count }, (_, i) => ({
    day: i + 1,
    title: "",
    tape: tapes[i % 3],
    ...EMPTY_SLOT,
  }));
}

export const ITINERARIES: CommunityItinerary[] = [
  {
    id: "first-timer",
    title: "First five days, done properly",
    vibe: "Icons without the queues",
    days: 5,
    author: "Naina",
    authorInitial: "N",
    authorNote: "Local · 4 yrs",
    budget: "≈ AED 1,400 / person",
    polaroids: [
      {
        src: "/discover/skyline.jpg",
        alt: "Dubai Marina skyline",
        caption: "Downtown, golden hour",
        rotate: -6,
      },
      {
        src: "/discover/creek.jpg",
        alt: "Abra ride across Dubai Creek",
        caption: "AED 1 abra, always",
        rotate: 5,
      },
    ],
    daysPlan: [
      {
        day: 1,
        title: "Downtown, the right way",
        tape: "orange",
        morning: "Burj Khalifa At the Top — book the 10am slot, skip the sunset queue.",
        afternoon: "Dubai Mall aquarium, then the terrace for a free Burj view.",
        evening: "Fountain show from Souk Al Bahar. Sit, don’t stand on the bridge.",
        night: "Walk to City Walk for karak. Hotels nearby are a trap for dinner.",
      },
      {
        day: 2,
        title: "Old Dubai + Creek",
        tape: "cream",
        morning: "Al Fahidi lanes, then Arabian Tea House in the courtyard.",
        afternoon: "AED 1 abra across the Creek. Gold Souk, Spice Souk. Haggle once, walk away.",
        evening: "Al Seef for a slow walk as the lanterns come on.",
        night: "Karak on the abra dock. Skip the dinner cruise.",
      },
      {
        day: 3,
        title: "Marina, beach, Palm",
        tape: "sage",
        morning: "JBR public beach. No resort pass. Coffee on The Walk.",
        afternoon: "Marina Walk — 7km of yachts. Lunch looking at the water, not the mall.",
        evening: "Dhow from the marina pier. Book the boat, not the concierge.",
        night: "Palm Jumeirah boardwalk. Atlantis from outside is enough.",
      },
      {
        day: 4,
        title: "Desert at the right hour",
        tape: "orange",
        morning: "Sleep in. Drink water. Don’t schedule a museum.",
        afternoon: "3pm pickup with a local operator, not the hotel desk.",
        evening: "Dune bash, camel, sandboard as the light goes red.",
        night: "BBQ at camp, then home. Don’t add a nightclub after dunes.",
      },
      {
        day: 5,
        title: "One last slow day",
        tape: "sage",
        morning: "Kite Beach. Public sand, food trucks, Burj Al Arab in the corner of your eye.",
        afternoon: "Nothing booked. That’s the gift.",
        evening: "Marina sunset if you missed it. Or stay on the beach.",
        night: "Pack. Tomorrow is a flight, not another attraction.",
      },
    ],
  },
  {
    id: "food-first",
    title: "Eat the city, skip the buffet",
    vibe: "Shawarma, souks, one long Friday",
    days: 5,
    author: "Omar",
    authorInitial: "O",
    authorNote: "Local · 9 yrs",
    budget: "≈ AED 650 / person",
    polaroids: [
      {
        src: "/discover/buffet.jpg",
        alt: "Hotel buffet spread with hot dishes",
        caption: "Order what the next table got",
        rotate: 4,
      },
      {
        src: "/discover/mezze.jpg",
        alt: "Mezze spread",
        caption: "Satwa, 8am",
        rotate: -7,
      },
    ],
    daysPlan: [
      {
        day: 1,
        title: "Satwa & Karama",
        tape: "cream",
        morning: "Ravi for paratha and chai. Sit outside. Cash only-ish.",
        afternoon: "Al Mallah shawarma on 2nd December St. Under AED 15, always.",
        evening: "Karama cafeterias. Follow the Indian/Pakistani office crowd.",
        night: "Karak from a truck, walk it off. No dessert menu needed.",
      },
      {
        day: 2,
        title: "Deira on foot",
        tape: "orange",
        morning: "Spice Souk before 11. Smell first, buy later.",
        afternoon: "Creek-side lunch. Iranian bread, fish, saffron ice cream if you find it.",
        evening: "Frying Pan Adventures food walk — eight stops, skip lunch.",
        night: "Abra after 9pm. Same water as the dinner cruise, 1 dirham.",
      },
      {
        day: 3,
        title: "Al Quoz Friday",
        tape: "sage",
        morning: "Warehouse coffee in Al Quoz 1. No dress code, no buffet.",
        afternoon: "Alserkal galleries between bites. The courtyard is the plan.",
        evening: "Shakshuka and filter coffee until they close the shutter.",
        night: "Global Village food pavilions if the season is on. Yemen to Thailand.",
      },
      {
        day: 4,
        title: "JLT & marina bites",
        tape: "cream",
        morning: "Cluster-F cafeterias in JLT. Office-crowd biryani, not a hotel buffet.",
        afternoon: "Walk the marina. Gelato, not a seven-course lunch.",
        evening: "Seafood on the water if you want one splurge. Book yourself.",
        night: "The Walk at JBR. People-watch. Eat ice cream. Go home.",
      },
      {
        day: 5,
        title: "One more market morning",
        tape: "orange",
        morning: "Waterfront Market in Deira. Fish, fruit, a cheap breakfast.",
        afternoon: "Rest. You have eaten enough.",
        evening: "Al Quoz again if a gallery night is on.",
        night: "Last shawarma. You know where.",
      },
    ],
  },
  {
    id: "desert-sea",
    title: "Dunes, dam, and a slow beach",
    vibe: "Half in the city, half out of it",
    days: 5,
    author: "Layla",
    authorInitial: "L",
    authorNote: "Local · 6 yrs",
    budget: "≈ AED 1,800 / person",
    polaroids: [
      {
        src: "/discover/hatta.jpg",
        alt: "Hatta dam in the mountains",
        caption: "Hatta before the wind",
        rotate: -4,
      },
      {
        src: "/discover/kayak.jpg",
        alt: "Kayaks on the water",
        caption: "On the water by 8am",
        rotate: 6,
      },
    ],
    daysPlan: [
      {
        day: 1,
        title: "Shake off the flight",
        tape: "sage",
        morning: "JBR beach until you’re human again. Public sand, free showers.",
        afternoon: "Marina Walk, slow. Juice, not a tasting menu.",
        evening: "Sunset from Bluewaters or the marina pier.",
        night: "Early night. Tomorrow starts at 7.",
      },
      {
        day: 2,
        title: "Hatta day trip",
        tape: "orange",
        morning: "7am pickup. Kayak the dam while the water is glass.",
        afternoon: "Wadi swim, mountain lunch. Back before Friday traffic.",
        evening: "Nothing booked. That’s the point.",
        night: "Kite Beach food trucks if you still have legs.",
      },
      {
        day: 3,
        title: "Beach then desert",
        tape: "cream",
        morning: "Kite Beach or a beach club if you want a sunbed.",
        afternoon: "3pm desert pickup. Dune bash, camel, sandboard.",
        evening: "BBQ at camp as the light goes red.",
        night: "Stars, then home. Skip the extra quad-bike upsell.",
      },
      {
        day: 4,
        title: "Old Dubai, slow",
        tape: "sage",
        morning: "Al Fahidi after the dunes. Quiet courtyards, no checklist.",
        afternoon: "Abra and souks only if you have the legs.",
        evening: "Creek at blue hour. That’s the photo.",
        night: "Early. You’re still sandy.",
      },
      {
        day: 5,
        title: "Nothing on purpose",
        tape: "orange",
        morning: "Beach club or public beach. Your call.",
        afternoon: "Pool. Book. Sleep.",
        evening: "Marina Walk if you want a last skyline.",
        night: "Pack the sand out of your shoes.",
      },
    ],
  },
];

/* ── Dubai 101: the apps ───────────────────────────────────────────── */

export type AppCategory = "getting-around" | "food" | "shopping" | "staying-connected" | "official";

export type LocalApp = {
  id: string;
  name: string;
  tagline: string;
  why: string;
  category: AppCategory;
  url: string;
  /** Brand tile colour */
  color: string;
  /** Text colour on the tile */
  onColor: string;
  monogram: string;
};

export const APP_CATEGORY_LABELS: Record<AppCategory, string> = {
  "getting-around": "Getting around",
  food: "Food & delivery",
  shopping: "Shopping",
  "staying-connected": "Staying connected",
  official: "Official & essentials",
};

export const LOCAL_APPS: LocalApp[] = [
  {
    id: "careem",
    name: "Careem",
    tagline: "Rides, bikes, and food in one app",
    why: "Cheaper than a hotel taxi and every driver knows the city. Also does groceries and bike hire.",
    category: "getting-around",
    url: "https://www.careem.com",
    color: "#2fb56a",
    onColor: "#ffffff",
    monogram: "C",
  },
  {
    id: "rta",
    name: "RTA Dubai",
    tagline: "Metro, tram, bus, and your Nol card",
    why: "Top up your Nol, plan Metro routes, and book a licensed taxi. Load your card at the station, not the hotel desk.",
    category: "getting-around",
    url: "https://www.rta.ae",
    color: "#d71920",
    onColor: "#ffffff",
    monogram: "R",
  },
  {
    id: "keeta",
    name: "Keeta",
    tagline: "Food delivery with the sharpest discounts",
    why: "Newest delivery app in town and it is buying customers. Expect first-order vouchers and free delivery.",
    category: "food",
    url: "https://www.keeta.com",
    color: "#ffd100",
    onColor: "#141210",
    monogram: "K",
  },
  {
    id: "talabat",
    name: "Talabat",
    tagline: "The delivery app everyone here uses",
    why: "Widest restaurant coverage, 24-hour groceries, and the cafeteria karak you will get addicted to.",
    category: "food",
    url: "https://www.talabat.com/uae",
    color: "#ff5a00",
    onColor: "#ffffff",
    monogram: "T",
  },
  {
    id: "deliveroo",
    name: "Deliveroo",
    tagline: "Restaurant delivery, premium end",
    why: "Best for the higher-end restaurants and quick 20-minute drops in Marina, Downtown, and JLT.",
    category: "food",
    url: "https://deliveroo.ae",
    color: "#00ccbc",
    onColor: "#141210",
    monogram: "D",
  },
  {
    id: "noon",
    name: "Noon",
    tagline: "Same-day shopping, from chargers to abayas",
    why: "Forgot an adapter, sunscreen, or a modest outfit for the mosque? Noon delivers within hours.",
    category: "shopping",
    url: "https://www.noon.com/uae-en/",
    color: "#feee00",
    onColor: "#141210",
    monogram: "n",
  },
  {
    id: "entertainer",
    name: "The Entertainer",
    tagline: "2-for-1 on restaurants, spas, and attractions",
    why: "Residents live on this. One week of use usually pays for itself on brunch alone.",
    category: "shopping",
    url: "https://www.theentertainerme.com",
    color: "#141210",
    onColor: "#ffffff",
    monogram: "E",
  },
  {
    id: "botim",
    name: "Botim",
    tagline: "Voice and video calls that work here",
    why: "WhatsApp and FaceTime calls are blocked in the UAE. Botim is the licensed alternative everyone installs on day one.",
    category: "staying-connected",
    url: "https://botim.me",
    color: "#1f8cf5",
    onColor: "#ffffff",
    monogram: "B",
  },
  {
    id: "du",
    name: "du / e& eSIM",
    tagline: "Tourist eSIM before you land",
    why: "Both carriers sell tourist eSIMs online. Buy one before you fly and skip the airport queue.",
    category: "staying-connected",
    url: "https://www.du.ae",
    color: "#5b2a86",
    onColor: "#ffffff",
    monogram: "du",
  },
  {
    id: "dubai-now",
    name: "DubaiNow",
    tagline: "Fines, permits, and government services",
    why: "Pay a Salik or parking fine, check a visa, or find a pharmacy. One official app instead of twelve.",
    category: "official",
    url: "https://dubainow.dubai.ae",
    color: "#0b7a75",
    onColor: "#ffffff",
    monogram: "DN",
  },
  {
    id: "visit-dubai",
    name: "Visit Dubai",
    tagline: "Official events calendar and passes",
    why: "Tourist board app. Good for the big festival dates and attraction bundles once you know what you want.",
    category: "official",
    url: "https://www.visitdubai.com",
    color: "#003c71",
    onColor: "#ffffff",
    monogram: "VD",
  },
  {
    id: "smart-parking",
    name: "RTA Parking",
    tagline: "Pay for street parking by SMS or app",
    why: "If you rent a car, this is the one thing that saves you a AED 150 fine. Orange zones are paid, check the sign.",
    category: "official",
    url: "https://www.rta.ae/wps/portal/rta/ae/home/rta-services/service-details?serviceId=1114302",
    color: "#f2a900",
    onColor: "#141210",
    monogram: "P",
  },
];

export type Essential = {
  id: string;
  label: string;
  value: string;
};

export const DUBAI_ESSENTIALS: Essential[] = [
  { id: "currency", label: "Currency", value: "AED · 1 USD ≈ 3.67" },
  { id: "plug", label: "Plug", value: "Type G, UK three-pin" },
  { id: "weekend", label: "Weekend", value: "Saturday and Sunday" },
  { id: "tip", label: "Tipping", value: "10% is generous. Round up taxis" },
  { id: "water", label: "Tap water", value: "Safe, tastes flat. Locals buy bottled" },
  { id: "emergency", label: "Emergency", value: "999 police · 998 ambulance" },
];
