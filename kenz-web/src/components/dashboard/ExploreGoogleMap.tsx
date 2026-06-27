"use client";

/**
 * ExploreGoogleMap — Google Maps for the Explore section.
 * Markers for each place; clicking opens a floating card with:
 *   • A photo reel (up to 5 real Google Place photos, auto-advances)
 *   • Name, rating, address, open/closed badge
 *   • "Open in Google Maps" and "Add to Trip" actions
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ExplorePlace } from "@/lib/exploreApi";
import { Star, ArrowLeft, ArrowRight, MapPin, X } from "@phosphor-icons/react";

import { loadGoogleMaps } from "@/lib/googleMapsLoader";

type Props = {
  places: ExplorePlace[];
  className?: string;
  onAddToTrip?: (place: ExplorePlace) => void;
  addedIds?: Set<string>;
};

type ActiveCard = {
  place: ExplorePlace;
  photoIdx: number;
};

export default function ExploreGoogleMap({
  places,
  className = "",
  onAddToTrip,
  addedIds = new Set(),
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  const [activeCard, setActiveCard] = useState<ActiveCard | null>(null);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Auto-advance photos every 2.5s */
  useEffect(() => {
    if (!activeCard) return;
    const total = (activeCard.place.photos ?? [activeCard.place.image]).length;
    if (total <= 1) return;
    autoSlideRef.current = setInterval(() => {
      setActiveCard((c) =>
        c ? { ...c, photoIdx: (c.photoIdx + 1) % total } : null,
      );
    }, 2500);
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [activeCard?.place.id]); // only restart timer when place changes

  const openCard = useCallback((place: ExplorePlace) => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    setActiveCard({ place, photoIdx: 0 });
  }, []);

  /* Init map once */
  useEffect(() => {
    if (!containerRef.current) return;

    async function init() {
      const { importLibrary } = await loadGoogleMaps();
      if (!containerRef.current) return;

      const { Map: GMap } = (await importLibrary(
        "maps",
      )) as google.maps.MapsLibrary;

      const map = new GMap(containerRef.current, {
        center: { lat: 25.2048, lng: 55.2708 },
        zoom: 11,
        mapId: "kenz_explore_map",
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });
      mapRef.current = map;
    }

    void init();
    return () => { mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Update markers when places change */
  useEffect(() => {
    if (!mapRef.current) return;

    async function syncMarkers() {
      const { importLibrary } = await loadGoogleMaps();
      const { AdvancedMarkerElement } = (await importLibrary(
        "marker",
      )) as google.maps.MarkerLibrary;

      // Remove old markers
      for (const m of markersRef.current) m.map = null;
      markersRef.current = [];

      const bounds = new google.maps.LatLngBounds();

      places.forEach((place, i) => {
        const el = document.createElement("div");
        el.style.cssText = `
          min-width:36px;height:36px;padding:0 10px;
          display:flex;align-items:center;justify-content:center;gap:4px;
          border-radius:18px;
          background:#ff6a00;
          font-size:11px;font-weight:700;
          color:#fff;
          box-shadow:0 3px 12px rgba(255,106,0,.45);
          cursor:pointer;
          white-space:nowrap;
          transition:transform .12s, box-shadow .12s;
        `;
        el.innerHTML = `<span>${i + 1}</span>`;
        el.title = place.name;

        el.addEventListener("mouseenter", () => {
          el.style.transform = "scale(1.12)";
          el.style.boxShadow = "0 6px 20px rgba(255,106,0,.55)";
        });
        el.addEventListener("mouseleave", () => {
          el.style.transform = "scale(1)";
          el.style.boxShadow = "0 3px 12px rgba(255,106,0,.45)";
        });

        const marker = new AdvancedMarkerElement({
          map: mapRef.current,
          position: { lat: place.lat, lng: place.lng },
          content: el,
          title: place.name,
        });

        marker.addListener("gmp-click", () => openCard(place));
        markersRef.current.push(marker);
        bounds.extend({ lat: place.lat, lng: place.lng });
      });

      if (places.length > 1) {
        mapRef.current.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
      } else if (places.length === 1) {
        mapRef.current.setCenter({ lat: places[0].lat, lng: places[0].lng });
        mapRef.current.setZoom(14);
      }
    }

    void syncMarkers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  /* Photo helpers */
  const allPhotos = activeCard
    ? (activeCard.place.photos ?? [activeCard.place.image])
    : [];
  const photoCount = allPhotos.length;

  function prevPhoto() {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    setActiveCard((c) =>
      c ? { ...c, photoIdx: (c.photoIdx - 1 + photoCount) % photoCount } : null,
    );
  }
  function nextPhoto() {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    setActiveCard((c) =>
      c ? { ...c, photoIdx: (c.photoIdx + 1) % photoCount } : null,
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={containerRef} className="h-full w-full" />

      {/* Floating place card */}
      {activeCard && (
        <div className="absolute bottom-4 left-1/2 z-30 w-80 -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/[0.06]">
          {/* Photo reel */}
          <div className="relative h-44 bg-ink/5">
            <img
              key={allPhotos[activeCard.photoIdx]}
              src={allPhotos[activeCard.photoIdx]}
              alt={activeCard.place.name}
              className="h-full w-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Photo navigation */}
            {photoCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
                >
                  <ArrowLeft size={12} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={nextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
                >
                  <ArrowRight size={12} weight="bold" />
                </button>
                {/* Dot indicators */}
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                  {allPhotos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (autoSlideRef.current) clearInterval(autoSlideRef.current);
                        setActiveCard((c) => c ? { ...c, photoIdx: i } : null);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activeCard.photoIdx
                          ? "w-4 bg-white"
                          : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Category badge */}
            <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
              {activeCard.place.categoryLabel}
            </span>

            {/* Open/closed badge */}
            {activeCard.place.openNow !== undefined && (
              <span
                className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur ${
                  activeCard.place.openNow
                    ? "bg-emerald-500/80 text-white"
                    : "bg-red-500/80 text-white"
                }`}
              >
                {activeCard.place.openNow ? "Open" : "Closed"}
              </span>
            )}

            {/* Close */}
            <button
              type="button"
              onClick={() => setActiveCard(null)}
              className="absolute right-2 top-7 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
            >
              <X size={10} weight="bold" />
            </button>
          </div>

          {/* Info */}
          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-bold leading-tight text-ink">
                {activeCard.place.name}
              </h4>
              {activeCard.place.rating && (
                <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-orange/8 px-2 py-0.5">
                  <Star size={10} weight="fill" className="text-orange" />
                  <span className="text-[11px] font-bold text-orange">
                    {activeCard.place.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-1 flex items-start gap-1 text-ink/50">
              <MapPin size={10} className="mt-0.5 shrink-0" />
              <p className="text-[11px] leading-tight">{activeCard.place.address}</p>
            </div>

            <div className="mt-3 flex gap-2">
              {activeCard.place.googleMapsUri && (
                <a
                  href={activeCard.place.googleMapsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-full border border-black/[0.1] py-1.5 text-center text-[11px] font-semibold text-ink hover:bg-surface"
                >
                  Open in Maps
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  onAddToTrip?.(activeCard.place);
                  setActiveCard(null);
                }}
                className={`flex-1 rounded-full py-1.5 text-center text-[11px] font-semibold transition ${
                  addedIds.has(activeCard.place.id)
                    ? "bg-emerald-500 text-white"
                    : "bg-orange text-white hover:bg-orange/90"
                }`}
              >
                {addedIds.has(activeCard.place.id) ? "Added ✓" : "Add to Trip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
