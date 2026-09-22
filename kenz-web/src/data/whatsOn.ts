/**
 * What's On — founder-curated seed posts (v1 is founder curated, see W1 pack).
 *
 * Rules for adding a post:
 * - Every post is attributed to a real local.
 * - Anything with `endsAt` disappears from the feed automatically once it passes.
 * - Set `checkedOn` only when someone has confirmed the details are true today.
 * - `bookingUrl` should be your Stay22 link (Stay22 dashboard → Link Generator)
 *   wherever one exists, so bookings are tracked.
 * - `vouches` is the real count. Never seed made-up numbers.
 * - Photos go in /public/whats-on/ and are referenced as "/whats-on/file.jpg".
 */

export type PostKind = "offer" | "food" | "event" | "do";

export type WhatsOnPost = {
  id: string;
  author: { name: string; yearsInDubai: number };
  postedOn: string; // ISO date
  kinds: PostKind[];
  title: string;
  body: string;
  /** The insider line, shown in italics after the body. */
  tip?: string;
  area: string;
  image?: string;
  imageAlt?: string;
  price?: {
    amount: number | null; // null = free
    was?: number;
    unit: string; // "per night", "per person", "per box"...
    prefix?: string; // e.g. "From"
  };
  /** Used when there is no fixed price, e.g. "Meter fare". */
  priceNote?: string;
  badge?: string; // e.g. "−50%"
  startsAt?: string; // ISO datetime, Dubai time (+04:00)
  endsAt?: string; // ISO datetime, Dubai time (+04:00)
  checkedOn?: string; // ISO date the details were last confirmed
  bookingUrl?: string;
  bookingLabel?: string;
  /** Shown instead of a Book button when there is nothing to book. */
  howToGo?: string;
  vouches: number;
};

/** Live feed. Empty until the first posts are verified. */
export const whatsOnPosts: WhatsOnPost[] = [];

/**
 * Drafts — NOT shown on the site. Verify each one (see TODOs), then move it
 * into whatsOnPosts above to publish it.
 */
export const draftPosts: WhatsOnPost[] = [
  {
    id: "palazzo-versace-summer-rate",
    author: { name: "Naina", yearsInDubai: 4 },
    postedOn: "2026-09-20",
    kinds: ["offer"],
    title: "Palazzo Versace is half price till September ends",
    body: "Rooms are half off all summer, pool included.",
    tip: "Go down after sunset, it's empty.",
    area: "Al Jaddaf, on the Creek",
    price: { amount: 640, was: 1290, unit: "per night" },
    badge: "−50%",
    endsAt: "2026-09-30T23:59:00+04:00",
    // TODO: confirm the rate is live, then set checkedOn and swap in the Stay22 link.
    bookingUrl: "https://www.palazzoversace.ae",
    vouches: 0,
  },
  {
    id: "kayak-burj-al-arab-sunset",
    author: { name: "Omar", yearsInDubai: 9 },
    postedOn: "2026-09-17",
    kinds: ["do"],
    title: "Kayak out to the Burj Al Arab at sunset",
    body: "A 90-minute paddle from Kite Beach with a guide.",
    tip: "Take the 5:30 slot, the water is glass.",
    area: "Kite Beach, Umm Suqeim",
    price: { amount: 150, unit: "per person" },
    // TODO: add the operator's booking link (GetYourGuide via Stay22 if listed).
    vouches: 0,
  },
  {
    id: "peekabox-surplus-boxes",
    author: { name: "Naina", yearsInDubai: 4 },
    postedOn: "2026-09-21",
    kinds: ["food", "offer"],
    title: "Dinner for AED 15 from the places you'd pay 50 for",
    body: "Peekabox sells restaurants' and bakeries' surplus as surprise boxes, 50 to 70% off, from over 1,000 stores.",
    tip: "Pickups run roughly 6 to 11 PM. Bakeries sell out first.",
    area: "All over Dubai",
    price: { amount: 15, unit: "per box", prefix: "From" },
    checkedOn: "2026-09-21",
    bookingUrl: "https://www.peekabox.co",
    bookingLabel: "Get the app",
    vouches: 0,
  },
  {
    id: "abra-one-dirham",
    author: { name: "Naina", yearsInDubai: 4 },
    postedOn: "2026-09-21",
    kinds: ["do"],
    title: "Cross the Creek on a wooden abra for AED 1",
    body: "Five minutes from Bur Dubai to the Deira Old Souq, the same way people have crossed for decades.",
    tip: "Bring a one-dirham coin, it's cash only.",
    area: "Bur Dubai ↔ Deira Old Souq",
    price: { amount: 1, unit: "per crossing" },
    checkedOn: "2026-09-21",
    howToGo: "Walk up at the Bur Dubai abra station and pay on board.",
    vouches: 0,
  },
  {
    id: "zed-taxi-cashback",
    author: { name: "Naina", yearsInDubai: 4 },
    postedOn: "2026-09-21",
    kinds: ["offer"],
    title: "Book RTA taxis on Zed and get 15% back",
    body: "Same meter price as a street taxi, no surge on taxis, and pre-booked pickups actually show up.",
    tip: "Metro for the long hauls, Zed for the last mile.",
    area: "Anywhere in Dubai",
    priceNote: "Meter fare",
    badge: "15% back",
    // TODO: re-check the 15% cashback before launch (Dubai 101 verify list).
    bookingUrl: "https://gozed.ae",
    bookingLabel: "Get the app",
    vouches: 0,
  },
];
