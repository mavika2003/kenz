"use client";

import { useEffect, useRef, useState } from "react";
import { neighborhoods } from "@/data/neighborhoods";

export default function DubaiMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").Marker[]>([]);
  const [activeId, setActiveId] = useState(neighborhoods[0].id);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;

      // React Strict Mode / fast refresh can remount before async init finishes.
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

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19, subdomains: "abcd" }
      ).addTo(map);

      L.control
        .attribution({ position: "bottomleft", prefix: false })
        .addAttribution("© OpenStreetMap · CARTO")
        .addTo(map);

      neighborhoods.forEach((n) => {
        const icon = L.divIcon({
          className: "",
          html: `<div class="dubai-map-marker" data-id="${n.id}" title="${n.name}">${n.emoji}</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([n.lat, n.lng], { icon }).addTo(map);

        marker.bindPopup(
          `<div class="dubai-map-popup">
            <strong>${n.name}</strong>
            <p>${n.tip}</p>
          </div>`,
          { className: "dubai-map-popup-wrap", maxWidth: 220 }
        );

        marker.on("click", () => setActiveId(n.id));
        marker.on("popupopen", () => setActiveId(n.id));

        markersRef.current.push(marker);
      });

      mapRef.current = map;
      setReady(true);
    };

    void init();

    return () => {
      cancelled = true;
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

  const focusNeighborhood = async (id: string) => {
    const n = neighborhoods.find((item) => item.id === id);
    if (!n || !mapRef.current) return;

    setActiveId(id);
    mapRef.current.flyTo([n.lat, n.lng], 13, { duration: 0.8 });

    const marker = markersRef.current.find((m) => {
      const el = m.getElement()?.querySelector(".dubai-map-marker");
      return el?.getAttribute("data-id") === id;
    });
    marker?.openPopup();
  };

  return (
    <div>
      <div className="dubai-map relative aspect-[4/3] overflow-hidden rounded-[28px] border-2 border-black bg-paper">
        {!ready && (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-black/50">
            Loading map…
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {neighborhoods.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => focusNeighborhood(n.id)}
            className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-colors ${
              activeId === n.id
                ? "border-black bg-orange text-black"
                : "border-black/20 bg-white text-black hover:border-black hover:bg-paper"
            }`}
          >
            <span>{n.emoji}</span>
            {n.name}
          </button>
        ))}
      </div>
    </div>
  );
}
