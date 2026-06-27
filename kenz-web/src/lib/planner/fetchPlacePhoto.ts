import { isGoogleConfigured, searchPlaces } from "@/lib/exploreApi";

/** Fetch the first Google Places photo URL for a text query (UAE-biased). */
export async function fetchPlacePhoto(
  query: string,
  destination = "dubai",
): Promise<string | null> {
  if (!isGoogleConfigured() || !query.trim()) return null;
  try {
    const places = await searchPlaces(query, destination);
    const hit = places.find((p) => p.image && !p.image.includes("loremflickr"));
    return hit?.photos?.[0] ?? hit?.image ?? null;
  } catch {
    return null;
  }
}
