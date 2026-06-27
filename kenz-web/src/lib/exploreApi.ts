/**
 * Explore API — client-side place search & photos.
 *
 * Priority:
 *   1. Google Places API (New) — NEXT_PUBLIC_GOOGLE_PLACES_KEY
 *      Real photos, ratings, best accuracy. $200/month free credit.
 *      Enable "Places API (New)" at console.cloud.google.com.
 *      Restrict the key to your domain for safety.
 *
 *   2. Geoapify — NEXT_PUBLIC_GEOAPIFY_API_KEY  (fallback, no real photos)
 *      Free 3,000 req/day. geoapify.com
 */

export type ExploreCategory =
  | "all"
  | "cafes"
  | "restaurants"
  | "museums"
  | "parks"
  | "shopping"
  | "beaches";

export type ExplorePlace = {
  id: string;
  name: string;
  address: string;
  category: ExploreCategory;
  categoryLabel: string;
  rating?: number;
  lat: number;
  lng: number;
  image: string;
  /** Up to 5 real Google Place photo URLs (only set when Google key is configured) */
  photos?: string[];
  openNow?: boolean;
  website?: string;
  googleMapsUri?: string;
};

/* ─── destination coordinates ─── */
const DEST_COORDS: Record<string, { lat: number; lng: number; label: string }> =
  {
    dubai: { lat: 25.2048, lng: 55.2708, label: "Dubai" },
    "abu-dhabi": { lat: 24.4539, lng: 54.3773, label: "Abu Dhabi" },
    both: { lat: 25.2048, lng: 55.2708, label: "Dubai" },
  };

export function getDestCoords(destination: string) {
  const key = destination.toLowerCase().replace(/\s+/g, "-");
  return DEST_COORDS[key] ?? DEST_COORDS.dubai;
}

/* ─────────────────────────────────────────────────────────────────────────
   GOOGLE PLACES API (NEW)
   ───────────────────────────────────────────────────────────────────────── */

const GOOGLE_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY ?? "";

export function isGoogleConfigured(): boolean {
  return Boolean(GOOGLE_KEY && GOOGLE_KEY.length > 10);
}

/* Our category → Google "includedTypes" */
const GOOGLE_TYPES: Record<ExploreCategory, string[]> = {
  all: ["cafe", "restaurant", "museum", "park", "shopping_mall"],
  cafes: ["cafe", "coffee_shop", "bakery"],
  restaurants: ["restaurant", "meal_takeaway", "meal_delivery", "food"],
  museums: ["museum", "art_gallery", "tourist_attraction", "historical_landmark"],
  parks: ["park", "botanical_garden", "national_park", "amusement_park"],
  shopping: ["shopping_mall", "department_store", "market"],
  beaches: ["beach"],
};

/* Google type string → our category */
const GOOGLE_TYPE_TO_CAT: Record<string, ExploreCategory> = {
  cafe: "cafes",
  coffee_shop: "cafes",
  bakery: "cafes",
  restaurant: "restaurants",
  meal_takeaway: "restaurants",
  meal_delivery: "restaurants",
  food: "restaurants",
  museum: "museums",
  art_gallery: "museums",
  tourist_attraction: "museums",
  historical_landmark: "museums",
  park: "parks",
  botanical_garden: "parks",
  national_park: "parks",
  amusement_park: "parks",
  shopping_mall: "shopping",
  department_store: "shopping",
  market: "shopping",
  beach: "beaches",
};

function inferGoogleCategory(types: string[]): ExploreCategory {
  for (const t of types) {
    if (GOOGLE_TYPE_TO_CAT[t]) return GOOGLE_TYPE_TO_CAT[t];
  }
  return "all";
}

const GOOGLE_FIELDS =
  "places.id,places.displayName,places.formattedAddress," +
  "places.location,places.types,places.photos,places.rating," +
  "places.websiteUri,places.currentOpeningHours,places.googleMapsUri";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGooglePlace(p: any): ExplorePlace | null {
  const name: string = p.displayName?.text ?? "";
  if (!name) return null;

  const types: string[] = p.types ?? [];
  const cat = inferGoogleCategory(types);

  // Build real photo URLs from all available photo references (up to 5)
  const photoUrls: string[] = [];
  if (Array.isArray(p.photos)) {
    for (const photo of p.photos.slice(0, 5)) {
      const photoName: string = photo.name ?? "";
      if (photoName) {
        photoUrls.push(
          `https://places.googleapis.com/v1/${photoName}/media` +
            `?maxHeightPx=600&key=${GOOGLE_KEY}`,
        );
      }
    }
  }

  const image = photoUrls[0] ?? fallbackImage(name, cat);
  const openNow: boolean | undefined =
    p.currentOpeningHours?.openNow ?? undefined;

  return {
    id: p.id as string,
    name,
    address: (p.formattedAddress ?? "") as string,
    category: cat,
    categoryLabel:
      cat === "all" ? "Place" : cat.charAt(0).toUpperCase() + cat.slice(1),
    rating: typeof p.rating === "number" ? p.rating : undefined,
    lat: (p.location?.latitude ?? 0) as number,
    lng: (p.location?.longitude ?? 0) as number,
    image,
    photos: photoUrls.length > 0 ? photoUrls : undefined,
    openNow,
    website: p.websiteUri as string | undefined,
    googleMapsUri: p.googleMapsUri as string | undefined,
  };
}

async function googleNearby(
  destination: string,
  category: ExploreCategory,
  limit = 20,
): Promise<ExplorePlace[]> {
  const { lat, lng } = getDestCoords(destination);
  const body = {
    includedTypes: GOOGLE_TYPES[category],
    locationRestriction: {
      circle: { center: { latitude: lat, longitude: lng }, radius: 15000 },
    },
    maxResultCount: Math.min(limit, 20),
  };

  const res = await fetch(
    "https://places.googleapis.com/v1/places:searchNearby",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_KEY,
        "X-Goog-FieldMask": GOOGLE_FIELDS,
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(`Google Places nearby error ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = (await res.json()) as { places?: any[] };
  return dedupe(
    (json.places ?? [])
      .map(mapGooglePlace)
      .filter((x): x is ExplorePlace => x !== null),
  );
}

async function googleSearch(
  query: string,
  destination: string,
  limit = 20,
): Promise<ExplorePlace[]> {
  const coords = getDestCoords(destination);
  const body = {
    textQuery: query,
    // Bias towards destination but don't hard-restrict — user might search globally
    locationBias: {
      circle: {
        center: { latitude: coords.lat, longitude: coords.lng },
        radius: 50000,
      },
    },
    maxResultCount: Math.min(limit, 20),
  };

  const res = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_KEY,
        "X-Goog-FieldMask": GOOGLE_FIELDS,
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(`Google Places text search error ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = (await res.json()) as { places?: any[] };
  return dedupe(
    (json.places ?? [])
      .map(mapGooglePlace)
      .filter((x): x is ExplorePlace => x !== null),
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   GEOAPIFY (fallback when no Google key)
   ───────────────────────────────────────────────────────────────────────── */

const GEOAPIFY_KEY =
  process.env.NEXT_PUBLIC_GEOAPIFY_KEY ??
  process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

export function isExploreConfigured(): boolean {
  return isGoogleConfigured() || Boolean(GEOAPIFY_KEY && GEOAPIFY_KEY !== "your_key_here");
}

const GEOAPIFY_CATEGORIES: Record<ExploreCategory, string> = {
  all: "catering.cafe,catering.restaurant,entertainment.museum,leisure.park,commercial.shopping_mall",
  cafes: "catering.cafe",
  restaurants: "catering.restaurant",
  museums: "entertainment.museum,entertainment.gallery,tourism.attraction",
  parks: "leisure.park,leisure.garden",
  shopping: "commercial.shopping_mall,commercial.marketplace",
  beaches: "beach,leisure.beach,natural.beach",
};

const GEOAPIFY_CAT_MAP: Record<string, ExploreCategory> = {
  "catering.cafe": "cafes",
  "catering.restaurant": "restaurants",
  "entertainment.museum": "museums",
  "entertainment.gallery": "museums",
  "tourism.attraction": "museums",
  "leisure.park": "parks",
  "leisure.garden": "parks",
  "commercial.shopping_mall": "shopping",
  "commercial.marketplace": "shopping",
  beach: "beaches",
  "leisure.beach": "beaches",
  "natural.beach": "beaches",
};

function inferGeoapifyCategory(cats: string[]): ExploreCategory {
  for (const c of cats) {
    const key = Object.keys(GEOAPIFY_CAT_MAP).find((k) => c.includes(k));
    if (key) return GEOAPIFY_CAT_MAP[key];
  }
  return "all";
}

/** Fallback image using loremflickr keyword search (no API key needed) */
function fallbackImage(name: string, category: ExploreCategory): string {
  const catTag =
    category === "cafes"
      ? "cafe,coffee"
      : category === "restaurants"
        ? "restaurant,food"
        : category === "museums"
          ? "museum"
          : category === "parks"
            ? "park,garden"
            : category === "shopping"
              ? "mall,shopping"
              : category === "beaches"
                ? "beach,sea"
                : "place";

  const nameTags = name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .join(",");

  return `https://loremflickr.com/600/400/${encodeURIComponent(`${nameTags},${catTag},dubai`)}`;
}

export function pickImage(
  name: string,
  category: ExploreCategory,
  rawImageUrl?: string,
): string {
  if (rawImageUrl && /^https?:\/\//.test(rawImageUrl)) return rawImageUrl;
  return fallbackImage(name, category);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGeoapifyFeature(f: any): ExplorePlace | null {
  const p = f.properties ?? f;
  const name: string = p.name ?? "";
  if (!name) return null;
  const cats2: string[] = p.categories ?? [];
  const cat = inferGeoapifyCategory(cats2);
  const rating =
    p.datasource?.raw?.["stars"] ?? p.datasource?.raw?.["rating"] ?? undefined;
  const rawImage: string | undefined =
    p.datasource?.raw?.image ??
    p.datasource?.raw?.["image:url"] ??
    undefined;

  return {
    id: (p.place_id ?? p.osm_id ?? `${Math.random()}`) as string,
    name,
    address: (p.address_line2 ?? p.formatted ?? "") as string,
    category: cat,
    categoryLabel:
      cat === "all" ? "Place" : cat.charAt(0).toUpperCase() + cat.slice(1),
    rating: typeof rating === "number" ? rating : undefined,
    lat: (p.lat ?? f.geometry?.coordinates?.[1] ?? 0) as number,
    lng: (p.lon ?? p.lng ?? f.geometry?.coordinates?.[0] ?? 0) as number,
    image: pickImage(name, cat, rawImage),
    website: (p.website ?? p.datasource?.raw?.website) as string | undefined,
  };
}

/** Remove duplicates by place_id and by name */
function dedupe(places: ExplorePlace[]): ExplorePlace[] {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  return places.filter((p) => {
    const nameKey = p.name.toLowerCase().trim();
    if (seenIds.has(p.id) || seenNames.has(nameKey)) return false;
    seenIds.add(p.id);
    seenNames.add(nameKey);
    return true;
  });
}

async function geoapifyBrowse(
  destination: string,
  category: ExploreCategory,
): Promise<ExplorePlace[]> {
  const { lat, lng } = getDestCoords(destination);
  const cats = GEOAPIFY_CATEGORIES[category];
  const url =
    `https://api.geoapify.com/v2/places` +
    `?categories=${encodeURIComponent(cats)}` +
    `&filter=circle:${lng},${lat},15000` +
    `&limit=30` +
    `&apiKey=${GEOAPIFY_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geoapify error ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = (await res.json()) as { features: any[] };
  return dedupe(
    json.features
      .map(mapGeoapifyFeature)
      .filter((x): x is ExplorePlace => x !== null),
  );
}

async function geoapifySearch(
  query: string,
): Promise<ExplorePlace[]> {
  const url =
    `https://api.geoapify.com/v1/geocode/search` +
    `?text=${encodeURIComponent(query)}` +
    `&filter=countrycode:ae` +
    `&type=amenity` +
    `&limit=20` +
    `&apiKey=${GEOAPIFY_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geoapify search error ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = (await res.json()) as { features: any[] };
  return dedupe(
    json.features
      .map(mapGeoapifyFeature)
      .filter((x): x is ExplorePlace => x !== null),
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PUBLIC API — auto-picks Google or Geoapify
   ───────────────────────────────────────────────────────────────────────── */

/** Browse by category near destination (initial/category-tab load) */
export async function fetchPlaces(
  destination: string,
  category: ExploreCategory,
): Promise<ExplorePlace[]> {
  if (isGoogleConfigured()) return googleNearby(destination, category);
  if (GEOAPIFY_KEY) return geoapifyBrowse(destination, category);
  return [];
}

/**
 * Free-text search — triggered on every keystroke (debounced 400ms).
 * Google: real-name match with photos.
 * Geoapify: geocoding search restricted to UAE.
 */
export async function searchPlaces(
  query: string,
  destination: string,
): Promise<ExplorePlace[]> {
  if (!query.trim()) return [];
  if (isGoogleConfigured()) return googleSearch(query, destination);
  if (GEOAPIFY_KEY) return geoapifySearch(query);
  return [];
}

/* ─────────────────────────────────────────────────────────────────────────
   MOCK DATA (shown when neither API is configured)
   ───────────────────────────────────────────────────────────────────────── */
export const MOCK_PLACES: ExplorePlace[] = [
  {
    id: "m1",
    name: "NETTE at Matcha Club",
    address: "Alserkal Avenue, Al Quoz, Dubai",
    category: "cafes",
    categoryLabel: "Cafe",
    rating: 4.9,
    lat: 25.1417,
    lng: 55.2278,
    image: fallbackImage("NETTE Matcha Club", "cafes"),
    openNow: true,
  },
  {
    id: "m2",
    name: "Nightjar Coffee Roasters",
    address: "Alserkal Avenue, Dubai",
    category: "cafes",
    categoryLabel: "Cafe",
    rating: 4.7,
    lat: 25.1421,
    lng: 55.2281,
    image: fallbackImage("Nightjar Coffee", "cafes"),
    openNow: true,
  },
  {
    id: "m3",
    name: "Nobu Restaurant Dubai",
    address: "Atlantis The Palm, Dubai",
    category: "restaurants",
    categoryLabel: "Restaurant",
    rating: 4.8,
    lat: 25.1308,
    lng: 55.117,
    image: fallbackImage("Nobu Restaurant", "restaurants"),
    openNow: true,
  },
  {
    id: "m4",
    name: "Dubai Mall",
    address: "Sheikh Mohammed Bin Rashid Blvd, Dubai",
    category: "shopping",
    categoryLabel: "Shopping",
    rating: 4.6,
    lat: 25.1972,
    lng: 55.2744,
    image: fallbackImage("Dubai Mall", "shopping"),
  },
  {
    id: "m5",
    name: "Museum of the Future",
    address: "Sheikh Zayed Rd, Dubai",
    category: "museums",
    categoryLabel: "Museum",
    rating: 4.8,
    lat: 25.2197,
    lng: 55.2814,
    image: fallbackImage("Museum Future", "museums"),
  },
  {
    id: "m6",
    name: "Kite Beach Dubai",
    address: "Jumeirah, Dubai",
    category: "beaches",
    categoryLabel: "Beach",
    rating: 4.7,
    lat: 25.1508,
    lng: 55.2095,
    image: fallbackImage("Kite Beach", "beaches"),
    openNow: true,
  },
  {
    id: "m7",
    name: "Sushi Samba Dubai",
    address: "Four Seasons Resort, Jumeirah Beach Rd",
    category: "restaurants",
    categoryLabel: "Restaurant",
    rating: 4.5,
    lat: 25.2125,
    lng: 55.2431,
    image: fallbackImage("Sushi Samba", "restaurants"),
  },
  {
    id: "m8",
    name: "Dubai Miracle Garden",
    address: "Al Barsha South, Dubai",
    category: "parks",
    categoryLabel: "Park",
    rating: 4.5,
    lat: 25.0596,
    lng: 55.2411,
    image: fallbackImage("Miracle Garden", "parks"),
  },
  {
    id: "m9",
    name: "Louvre Abu Dhabi",
    address: "Saadiyat Island, Abu Dhabi",
    category: "museums",
    categoryLabel: "Museum",
    rating: 4.9,
    lat: 24.5339,
    lng: 54.3982,
    image: fallbackImage("Louvre Abu Dhabi", "museums"),
  },
  {
    id: "m10",
    name: "Common Grounds",
    address: "JLT, Dubai",
    category: "cafes",
    categoryLabel: "Cafe",
    rating: 4.6,
    lat: 25.0695,
    lng: 55.143,
    image: fallbackImage("Common Grounds Coffee", "cafes"),
    openNow: true,
  },
];
