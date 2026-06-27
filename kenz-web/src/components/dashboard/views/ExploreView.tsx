"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Basket,
  Coffee,
  MapPin,
  MagnifyingGlass,
  Mountains,
  Plant,
  Storefront,
  Star,
  Tag,
  Waves,
} from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import {
  type ExploreCategory,
  type ExplorePlace,
  fetchPlaces,
  searchPlaces,
  getDestCoords,
  isExploreConfigured,
  isGoogleConfigured,
  MOCK_PLACES,
} from "@/lib/exploreApi";
import { usePlannerState } from "@/lib/planner/PlannerStateContext";
import { useDashboard } from "../DashboardContext";

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY ?? "";

const TripMap = dynamic(() => import("@/components/dashboard/TripMapbox"), { ssr: false });
const ExploreGoogleMap = dynamic(
  () => import("@/components/dashboard/ExploreGoogleMap"),
  { ssr: false },
);

/* ─── category tabs ─── */
const CATEGORIES: { id: ExploreCategory; label: string; icon: typeof Coffee }[] = [
  { id: "all", label: "All", icon: Tag },
  { id: "cafes", label: "Cafes", icon: Coffee },
  { id: "restaurants", label: "Restaurants", icon: Storefront },
  { id: "museums", label: "Museums", icon: Mountains },
  { id: "parks", label: "Parks", icon: Plant },
  { id: "shopping", label: "Shopping", icon: Basket },
  { id: "beaches", label: "Beaches", icon: Waves },
];

/* ─── skeleton card ─── */
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
      <div className="h-44 animate-pulse bg-surface" />
      <div className="p-4">
        <div className="mb-2 h-3 w-3/4 animate-pulse rounded bg-surface" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-surface" />
        <div className="mt-4 h-8 animate-pulse rounded-full bg-surface" />
      </div>
    </div>
  );
}

/* ─── place card ─── */
function PlaceCard({
  place,
  onAdd,
  added,
}: {
  place: ExplorePlace;
  onAdd: (p: ExplorePlace) => void;
  added: boolean;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-black/[0.08] bg-white transition hover:shadow-md">
      <div className="relative h-44 overflow-hidden">
        <img
          src={place.image}
          alt={place.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink/70 backdrop-blur">
          {place.categoryLabel}
        </span>
        {place.openNow === true && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Open
          </span>
        )}
      </div>

      <div className="p-4">
        {place.rating !== undefined && (
          <div className="mb-1 flex items-center gap-1">
            <Star size={12} weight="fill" className="text-orange" />
            <span className="text-xs font-bold">{place.rating.toFixed(1)}</span>
          </div>
        )}
        <h4 className="text-sm font-bold leading-tight">{place.name}</h4>
        {place.address && (
          <p className="mt-1 flex items-start gap-1 text-[11px] leading-snug text-ink/45">
            <MapPin size={11} className="mt-0.5 shrink-0" />
            {place.address}
          </p>
        )}
        <button
          type="button"
          onClick={() => onAdd(place)}
          disabled={added}
          className={`mt-3 w-full rounded-full py-2 text-xs font-bold transition ${
            added
              ? "bg-surface text-ink/40"
              : "border border-orange/30 text-orange hover:bg-orange hover:text-white"
          }`}
        >
          {added ? "✓ Added to Trip" : "Add to Trip"}
        </button>
      </div>
    </div>
  );
}

/* ─── main component ─── */
export default function ExploreView() {
  const { openTrip, activeTripId } = useDashboard();
  const { planState, savedTrips } = usePlannerState();

  /* Determine destination from active trip or planState */
  const destination = useMemo(() => {
    if (activeTripId) {
      const saved = savedTrips.find((t) => t.id === activeTripId);
      if (saved) return saved.destination.toLowerCase();
    }
    if (planState.destination) return planState.destination;
    return "dubai";
  }, [activeTripId, savedTrips, planState.destination]);

  const coords = getDestCoords(destination);

  const [category, setCategory] = useState<ExploreCategory>("all");
  const [query, setQuery] = useState("");
  const [browsePlaces, setBrowsePlaces] = useState<ExplorePlace[]>([]);
  const [searchResults, setSearchResults] = useState<ExplorePlace[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const configured = isExploreConfigured();
  const usingGoogle = isGoogleConfigured();

  /* Browse: fetch by category when destination/category changes */
  const loadBrowse = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSearchResults(null);
    try {
      if (configured) {
        const data = await fetchPlaces(destination, category);
        setBrowsePlaces(data);
      } else {
        await new Promise((r) => setTimeout(r, 350));
        setBrowsePlaces(MOCK_PLACES);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load places");
      setBrowsePlaces(MOCK_PLACES);
    } finally {
      setLoading(false);
    }
  }, [configured, destination, category]);

  useEffect(() => { void loadBrowse(); }, [loadBrowse]);

  /* Search: debounce 400ms, call API on every keystroke */
  useEffect(() => {
    const q = query.trim();
    if (!q) { setSearchResults(null); return; }

    const timer = setTimeout(async () => {
      setSearching(true);
      setError(null);
      try {
        if (configured) {
          const data = await searchPlaces(q, destination);
          setSearchResults(data);
        } else {
          // Filter mock data locally when not configured
          const lower = q.toLowerCase();
          setSearchResults(
            MOCK_PLACES.filter(
              (p) =>
                p.name.toLowerCase().includes(lower) ||
                p.address.toLowerCase().includes(lower),
            ),
          );
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed");
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, destination, configured]);

  /* What to show: search results override browse results */
  const visible = searchResults ?? browsePlaces;

  /* Map pins from visible places */
  const mapPins = useMemo(
    () =>
      visible.slice(0, 10).map((p, i) => ({
        id: p.id,
        label: p.name,
        lng: p.lng,
        lat: p.lat,
        order: i + 1,
      })),
    [visible],
  );

  const handleAdd = (place: ExplorePlace) => {
    setAddedIds((prev) => new Set([...prev, place.id]));
    if (activeTripId) openTrip(activeTripId, "itinerary");
  };

  const destLabel =
    destination.charAt(0).toUpperCase() + destination.slice(1).replace("-", " ");

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 pb-20">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-[family-name:var(--font-anton)] text-3xl tracking-wide">Explore</h2>
          <p className="mt-1 text-sm text-ink/50">
            {configured
              ? `Live places near ${destLabel} via ${usingGoogle ? "Google Places" : "Geoapify"}`
              : `Curated picks near ${destLabel}`}{" "}
            &mdash; AI-matched to your travel style.
          </p>
        </div>

        {/* Search */}
        <div className="relative sm:ml-auto sm:w-72">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any place, cafe, restaurant…"
            className="w-full rounded-full border border-black/[0.08] bg-surface py-2 pl-9 pr-10 text-xs outline-none focus:border-orange/50"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin rounded-full border-2 border-orange border-t-transparent" />
          )}
          {query && !searching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* API setup banner */}
      {!configured && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-orange/20 bg-orange/5 px-5 py-3.5">
          <div>
            <p className="text-xs font-bold text-orange">Showing curated demo data</p>
            <p className="mt-0.5 text-[10px] text-ink/50">
              Add <code className="rounded bg-orange/10 px-1 py-0.5 font-mono text-orange">NEXT_PUBLIC_GEOAPIFY_KEY</code> to{" "}
              <code className="font-mono">NEXT_PUBLIC_GOOGLE_PLACES_KEY</code> in <code className="font-mono">.env.local</code> for real photos via Google Places, or <code className="font-mono">NEXT_PUBLIC_GEOAPIFY_API_KEY</code> for Geoapify (free)
            </p>
          </div>
          <a
            href="https://myprojects.geoapify.com/register"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full bg-orange px-4 py-2 text-[10px] font-bold text-white hover:bg-orange-deep"
          >
            Get Free Key →
          </a>
        </div>
      )}

      {/* Category tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setCategory(id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
              category === id
                ? "bg-orange text-white shadow-sm"
                : "border border-black/[0.08] bg-surface text-ink/55 hover:border-orange/30 hover:text-ink"
            }`}
          >
            <Icon size={13} weight={category === id ? "fill" : "regular"} />
            {label}
          </button>
        ))}
      </div>

      {/* Map */}
      {visible.length > 0 && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-black/[0.08] shadow-sm"
          style={{ height: GOOGLE_KEY ? "320px" : "224px" }}
        >
          {GOOGLE_KEY ? (
            <ExploreGoogleMap
              places={visible.slice(0, 20)}
              className="h-full"
              onAddToTrip={handleAdd}
              addedIds={addedIds}
            />
          ) : (
            <TripMap pins={mapPins} className="h-full" interactive fitBounds />
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 px-5 py-3 text-xs text-red-600">
          {error} — showing demo data instead.
        </div>
      )}

      {/* Grid */}
      {loading || searching ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="py-20 text-center">
          <MapPin size={36} weight="thin" className="mx-auto mb-3 text-ink/20" />
          <p className="text-sm text-ink/40">No places found. Try a different category.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-ink/40">
              {visible.length} {searchResults ? "search results" : "places"} found
              {query && configured && (
                <span className="ml-1 font-semibold text-orange">for &ldquo;{query}&rdquo;</span>
              )}
            </p>
            {!query && (
              <button
                type="button"
                onClick={() => void loadBrowse()}
                className="text-xs font-semibold text-orange hover:underline"
              >
                Refresh
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onAdd={handleAdd}
                added={addedIds.has(place.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
