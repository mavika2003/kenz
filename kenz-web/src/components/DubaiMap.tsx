"use client";

import { useEffect, useRef, useState } from "react";
import { foodFindPlaces, type FoodFindPlace, type FoodFindReel } from "@/data/foodfinds";

function ReelVideoPlayer({ reel }: { reel: FoodFindReel }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    const play = () => {
      void video.play().catch(() => {});
    };
    play();
    video.addEventListener("loadeddata", play);
    return () => {
      video.removeEventListener("loadeddata", play);
      video.pause();
    };
  }, [reel.id, reel.videoUrl]);

  if (reel.videoUrl) {
    return (
      <video
        ref={videoRef}
        key={reel.id}
        className="dubai-map-reel-popup__video"
        src={reel.videoUrl}
        poster={reel.thumbnail}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={reel.thumbnail} alt="" className="dubai-map-reel-popup__video" />
  );
}

function PlaceReelPopup({ place }: { place: FoodFindPlace }) {
  const reel = place.reels[0];
  if (!reel) return null;

  return (
    <a
      href={reel.url}
      target="_blank"
      rel="noopener noreferrer"
      className="dubai-map-reel-popup"
      aria-label={`Watch reel at ${place.name}`}
    >
      <ReelVideoPlayer reel={reel} />
    </a>
  );
}

export default function DubaiMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").Marker[]>([]);
  const [activeId, setActiveId] = useState(foodFindPlaces[0]?.id ?? "");
  const [hoveredPlace, setHoveredPlace] = useState<FoodFindPlace | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleHide = (placeId: string) => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      setHoveredPlace((current) => (current?.id === placeId ? null : current));
    }, 220);
  };
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || foodFindPlaces.length === 0) return;

    let cancelled = false;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
      }

      const el = containerRef.current;
      if ((el as HTMLElement & { _leaflet_id?: number })._leaflet_id != null) {
        el.replaceChildren();
        delete (el as HTMLElement & { _leaflet_id?: number })._leaflet_id;
      }

      const map = L.map(el, {
        center: [25.15, 55.22],
        zoom: 11,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      if (cancelled) {
        map.remove();
        return;
      }

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      L.control
        .attribution({ position: "bottomleft", prefix: false })
        .addAttribution("© OpenStreetMap · CARTO")
        .addTo(map);

      const bounds = L.latLngBounds([]);

      foodFindPlaces.forEach((place) => {
        const icon = L.divIcon({
          className: "",
          html: `<div class="dubai-map-marker" data-id="${place.id}" title="${place.name}">${place.emoji}</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([place.lat, place.lng], { icon }).addTo(map);
        bounds.extend([place.lat, place.lng]);

        const showPopup = () => {
          clearHideTimer();
          setActiveId(place.id);
          setHoveredPlace(place);
        };

        marker.on("mouseover", showPopup);
        marker.on("click", showPopup);
        marker.on("mouseout", () => scheduleHide(place.id));

        markersRef.current.push(marker);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
      }

      mapRef.current = map;
      setReady(true);
    };

    void init();

    return () => {
      cancelled = true;
      clearHideTimer();
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = [];
      const el = containerRef.current;
      if (el) {
        el.replaceChildren();
        delete (el as HTMLElement & { _leaflet_id?: number })._leaflet_id;
      }
      setReady(false);
    };
  }, []);

  useEffect(() => {
    markersRef.current.forEach((marker) => {
      const el = marker.getElement()?.querySelector(".dubai-map-marker");
      const id = el?.getAttribute("data-id");
      el?.classList.toggle("is-active", id === activeId);
    });
  }, [activeId, ready]);

  const focusPlace = (id: string) => {
    const place = foodFindPlaces.find((item) => item.id === id);
    if (!place || !mapRef.current) return;

    setActiveId(id);
    setHoveredPlace(place);
    mapRef.current.flyTo([place.lat, place.lng], 14, { duration: 0.8 });
  };

  if (foodFindPlaces.length === 0) {
    return (
      <div className="dubai-map relative flex aspect-[4/3] items-center justify-center bg-surface text-sm text-black/50">
        No food spots loaded yet.
      </div>
    );
  }

  return (
    <div>
      <div className="dubai-map relative aspect-[4/3] bg-surface [container-type:size]">
        {!ready && (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-black/50">
            Loading map…
          </div>
        )}
        <div ref={containerRef} className="h-full w-full overflow-hidden rounded-[calc(2rem-0.5rem)]" />

        {hoveredPlace && (
          <div
            className="dubai-map-reel-popup-wrap"
            onMouseEnter={() => {
              clearHideTimer();
              setHoveredPlace(hoveredPlace);
            }}
            onMouseLeave={() => scheduleHide(hoveredPlace.id)}
          >
            <PlaceReelPopup place={hoveredPlace} />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {foodFindPlaces.map((place) => (
          <button
            key={place.id}
            type="button"
            onClick={() => focusPlace(place.id)}
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
              activeId === place.id
                ? "bg-orange text-white"
                : "bg-white text-ink ring-1 ring-black/10 hover:ring-orange/40"
            }`}
          >
            {place.name}
          </button>
        ))}
      </div>
    </div>
  );
}
