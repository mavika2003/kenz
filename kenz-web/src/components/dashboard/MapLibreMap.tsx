"use client";

import { useEffect, useRef } from "react";
import type { MapPin } from "@/lib/dashboard/types";

type TripMapProps = {
  pins: MapPin[];
  className?: string;
  interactive?: boolean;
  fitBounds?: boolean;
};

const FREE_STYLE =
  "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

export default function TripMapbox({
  pins,
  className = "",
  interactive = true,
  fitBounds = true,
}: TripMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let map: any;

    async function initMap() {
      const maplibregl = (await import("maplibre-gl")).default;
      await import("maplibre-gl/dist/maplibre-gl.css");

      if (!containerRef.current) return;

      map = new maplibregl.Map({
        container: containerRef.current,
        style: FREE_STYLE,
        center: [55.3, 25.05],
        zoom: 8,
        interactive,
        attributionControl: false,
      });

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "bottom-right",
      );

      map.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        "bottom-left",
      );

      mapRef.current = map;

      map.on("load", () => {
        pins.forEach((pin) => {
          const el = document.createElement("div");
          el.style.cssText = `
            width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%;
            background: white;
            border: 2px solid #ff6a00;
            font-size: 12px; font-weight: 700;
            color: #ff6a00;
            box-shadow: 0 4px 12px rgba(255,106,0,0.3);
            cursor: pointer;
          `;
          el.textContent = String(pin.order);

          new maplibregl.Marker({ element: el })
            .setLngLat([pin.lng, pin.lat])
            .setPopup(
              new maplibregl.Popup({ offset: 16, closeButton: false })
                .setHTML(`<strong style="font-size:12px">${pin.label}</strong>`),
            )
            .addTo(map);
        });

        if (fitBounds && pins.length > 1) {
          const bounds = new maplibregl.LngLatBounds();
          pins.forEach((p) => bounds.extend([p.lng, p.lat]));
          map.fitBounds(bounds, { padding: 60, maxZoom: 10 });
        } else if (pins.length === 1) {
          map.setCenter([pins[0].lng, pins[0].lat]);
          map.setZoom(11);
        }
      });
    }

    void initMap();

    return () => {
      try { map?.remove(); } catch { /* ignore */ }
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className={`h-full w-full ${className}`} />;
}
