"use client";

import { useEffect, useRef } from "react";
import type { MapPin } from "@/lib/dashboard/types";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";

type Props = {
  pins: MapPin[];
  className?: string;
  interactive?: boolean;
  fitBounds?: boolean;
};

export default function GoogleTripMap({
  pins,
  className = "",
  interactive = true,
  fitBounds = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    async function init() {
      const { importLibrary } = await loadGoogleMaps();
      if (!containerRef.current) return;

      const { Map: GMap, InfoWindow } = (await importLibrary(
        "maps",
      )) as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = (await importLibrary(
        "marker",
      )) as google.maps.MarkerLibrary;

      const map = new GMap(containerRef.current, {
        center: { lat: 25.2048, lng: 55.2708 },
        zoom: 9,
        mapId: "kenz_trip_map",
        disableDefaultUI: !interactive,
        gestureHandling: interactive ? "cooperative" : "none",
      });

      mapRef.current = map;
      const openInfoWindow = { current: null as google.maps.InfoWindow | null };
      const bounds = new google.maps.LatLngBounds();

      pins.forEach((pin) => {
        const markerEl = document.createElement("div");
        markerEl.style.cssText = `
          width:36px;height:36px;
          display:flex;align-items:center;justify-content:center;
          border-radius:50%;
          background:#fff;
          border:2.5px solid #ff6a00;
          font-size:13px;font-weight:700;
          color:#ff6a00;
          box-shadow:0 4px 14px rgba(255,106,0,.35);
          cursor:pointer;
          transition:transform .15s;
        `;
        markerEl.textContent = String(pin.order);

        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: pin.lat, lng: pin.lng },
          content: markerEl,
          title: pin.label,
        });

        const infoWindow = new InfoWindow({
          content: `
            <div style="font-family:system-ui,sans-serif;padding:8px 12px;min-width:140px;">
              <div style="font-size:11px;font-weight:700;color:#ff6a00;margin-bottom:2px">
                Stop ${pin.order}
              </div>
              <div style="font-size:13px;font-weight:600;color:#141210">${pin.label}</div>
            </div>
          `,
          disableAutoPan: false,
        });

        const openMarker = () => {
          openInfoWindow.current?.close();
          infoWindow.open({ anchor: marker, map });
          openInfoWindow.current = infoWindow;
          markerEl.style.transform = "scale(1.15)";
          infoWindow.addListener("closeclick", () => {
            markerEl.style.transform = "scale(1)";
          });
        };
        marker.addListener("gmp-click", openMarker);

        bounds.extend({ lat: pin.lat, lng: pin.lng });
      });

      if (fitBounds && pins.length > 1) {
        map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
      } else if (pins.length === 1) {
        map.setCenter({ lat: pins[0].lat, lng: pins[0].lng });
        map.setZoom(13);
      }
    }

    void init();

    return () => {
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className={`h-full w-full ${className}`} />;
}
