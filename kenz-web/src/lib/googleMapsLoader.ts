/**
 * Single shared Google Maps JS API bootstrap — setOptions() is only called once.
 */

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY ?? "";

let configured = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let initPromise: Promise<{ importLibrary: (...args: any[]) => Promise<any> }> | null = null;

export function isGoogleMapsKeySet(): boolean {
  return GOOGLE_KEY.length > 10;
}

export async function loadGoogleMaps() {
  if (!isGoogleMapsKeySet()) {
    throw new Error("Google Maps API key is not configured");
  }

  if (!initPromise) {
    initPromise = (async () => {
      const { setOptions, importLibrary } = await import("@googlemaps/js-api-loader");

      if (!configured) {
        setOptions({ key: GOOGLE_KEY, v: "weekly" });
        configured = true;
      }

      return { importLibrary };
    })();
  }

  return initPromise;
}
