"use client";

import {
  AirplaneTakeoff,
  Buildings,
  Coffee,
  MapPin,
} from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import { useDashboard } from "../DashboardContext";
import type { DashboardTrip } from "@/lib/dashboard/types";

const TripMap = dynamic(() => import("@/components/dashboard/TripMapbox"), { ssr: false });

const NEARBY = [
  { id: "1", icon: AirplaneTakeoff, label: "Dubai International Airport", tag: "Airport", desc: "DXB · 14 km from hotel" },
  { id: "2", icon: Buildings, label: "Burj Khalifa", tag: "Landmark", desc: "World's tallest building" },
  { id: "3", icon: Coffee, label: "NETTE Coffee", tag: "Cafe", desc: "Matcha specialists, 3.2 km" },
  { id: "4", icon: MapPin, label: "Sheikh Zayed Grand Mosque", tag: "Culture", desc: "Abu Dhabi · Day trip" },
];

export default function MapView({ trip }: { trip: DashboardTrip }) {
  const { setTripTab } = useDashboard();
  return (
    <div className="relative h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="flex-1 relative">
        <TripMap pins={trip.mapPins} className="h-full" interactive fitBounds />
      </div>

      {/* Side panel */}
      <div className="absolute top-4 right-4 z-20 w-72 space-y-3">
        <div className="rounded-2xl border border-black/[0.08] bg-white/95 p-4 backdrop-blur shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold">Trip Stops</h3>
            <span className="text-xs text-ink/40">{trip.mapPins.length} pins</span>
          </div>
          <div className="space-y-2">
            {trip.mapPins.map((pin) => (
              <div
                key={pin.id}
                className="flex items-center gap-3 rounded-xl bg-surface p-3 transition hover:bg-orange/5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-orange text-xs font-bold text-orange">
                  {pin.order}
                </div>
                <p className="text-xs font-semibold">{pin.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.08] bg-white/95 p-4 backdrop-blur shadow-xl">
          <h3 className="mb-3 text-sm font-bold">Nearby</h3>
          <div className="space-y-2">
            {NEARBY.map(({ id, icon: Icon, label, tag, desc }) => (
              <div
                key={id}
                className="flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition hover:bg-surface"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange/8 text-orange">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-[10px] text-ink/40">
                    <span className="font-semibold text-orange/70">{tag}</span> · {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTripTab("itinerary")}
          className="w-full rounded-full bg-ink px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-orange"
        >
          Back to Itinerary
        </button>
      </div>
    </div>
  );
}
