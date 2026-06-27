"use client";

import {
  AirplaneTakeoff,
  Buildings,
  Car,
  PlusCircle,
  Sparkle,
  Star,
} from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import CheckoutBar from "@/components/dashboard/CheckoutBar";
import type { DashboardTrip } from "@/lib/dashboard/types";

const TripMap = dynamic(() => import("@/components/dashboard/TripMapbox"), { ssr: false });

/* ─── helpers ─── */

/** Extract hotel name + nights from a booking line label like "Taj JLT (6 nights)" */
function parseHotelLine(label: string): { name: string; nights: string } {
  const match = label.match(/^(.+?)\s*\((\d+\s*nights?)\)$/i);
  if (match) return { name: match[1].trim(), nights: match[2] };
  return { name: label, nights: "" };
}

/** Pick a destination airport code from mapPins */
function airportCode(trip: DashboardTrip): string {
  const pin = trip.mapPins[0];
  if (!pin) return "DXB";
  const l = pin.label.toLowerCase();
  if (l.includes("abu dhabi") || l.includes("auh")) return "AUH";
  if (l.includes("dubai") || l.includes("dxb")) return "DXB";
  return "DXB";
}

/** Star count from style keyword embedded in trip tags */
function starCount(trip: DashboardTrip): number {
  const tags = trip.tags?.map((t) => t.toLowerCase()) ?? [];
  if (tags.includes("luxury")) return 5;
  if (tags.includes("balanced")) return 4;
  if (tags.includes("budget")) return 3;
  return 2;
}

/** Derive a readable intro from the structured trip data */
function buildIntro(trip: DashboardTrip): string {
  const nights = trip.durationDays ?? 7;
  const t = trip.travelers ?? 2;
  const dest = trip.destination;
  const style = (trip.tags?.find((t) =>
    ["luxury", "balanced", "budget", "backpacker"].includes(t.toLowerCase()),
  ) ?? "").toLowerCase();
  const parts: string[] = [];
  parts.push(
    `Your ${nights}-night trip to ${dest} (${trip.dateRange}) is all set for ${t} traveller${t !== 1 ? "s" : ""}.`,
  );
  if (style === "luxury") parts.push("Expect top-tier comfort and iconic experiences.");
  else if (style === "balanced") parts.push("A perfect blend of comfort and culture awaits.");
  else if (style === "budget") parts.push("Smart choices to see the best without breaking the bank.");
  else if (style === "backpacker") parts.push("Adventure-first — explore like a local.");
  if (trip.mapPins.length > 1) {
    const stops = trip.mapPins.slice(1).map((p) => p.label).join(" and ");
    parts.push(`Key highlights include ${stops}.`);
  }
  return parts.join(" ");
}

/* ─── component ─── */

export default function ItineraryView({ trip }: { trip: DashboardTrip }) {
  const destAirport = airportCode(trip);
  const stars = starCount(trip);

  // Classify booking lines by type
  const flightLine = trip.bookingLines.find((b) =>
    b.label.toLowerCase().includes("flight"),
  );
  const hotelLine = trip.bookingLines.find(
    (b) =>
      !b.label.toLowerCase().includes("flight") &&
      !b.label.toLowerCase().includes("transfer") &&
      !b.label.toLowerCase().includes("activit"),
  );
  const transferLine = trip.bookingLines.find((b) =>
    b.label.toLowerCase().includes("transfer"),
  );
  const activityLines = trip.bookingLines.filter((b) =>
    b.label.toLowerCase().includes("activit") ||
    b.label.toLowerCase().includes("experience") ||
    b.label.toLowerCase().includes("tour"),
  );

  const hotelParsed = hotelLine ? parseHotelLine(hotelLine.label) : null;

  // Hotel image: prefer heroImages[1], fall back to heroImages[0]
  const hotelImg = (trip.heroImages[1] ?? trip.heroImages[0])?.src ?? "";

  return (
    <>
      <div className="mx-auto max-w-5xl px-5 py-5 pb-32">

        {/* Map */}
        <div className="relative mb-8 h-52 overflow-hidden rounded-2xl border border-black/[0.08] shadow-sm">
          <TripMap pins={trip.mapPins} className="h-full" interactive />
          <button
            type="button"
            className="absolute right-4 bottom-4 rounded-full border border-black/[0.08] bg-white px-4 py-1.5 text-xs font-bold shadow transition hover:scale-105"
          >
            View full map
          </button>
        </div>

        {/* Hero images */}
        <div className="mb-8 grid h-56 grid-cols-12 gap-3">
          <div className="relative col-span-8 overflow-hidden rounded-2xl">
            <img
              src={trip.heroImages[0].src}
              alt={trip.heroImages[0].label}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              {trip.heroImages[0].tag && (
                <span className="rounded bg-orange px-2 py-0.5 text-[10px] font-bold uppercase">
                  {trip.heroImages[0].tag}
                </span>
              )}
              <p className="mt-1 text-sm font-bold">{trip.heroImages[0].label}</p>
            </div>
          </div>
          <div className="col-span-4 flex flex-col gap-3">
            {trip.heroImages.slice(1).map((img) => (
              <div
                key={img.label}
                className="relative flex-1 overflow-hidden rounded-2xl border border-black/[0.08]"
              >
                <img src={img.src} alt={img.label} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                <p className="absolute bottom-2 left-3 text-xs font-bold text-white">{img.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Intro */}
        <div className="mb-8">
          <h2 className="font-[family-name:var(--font-anton)] text-3xl tracking-wide">
            {trip.headline}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink/65">
            {buildIntro(trip)}
          </p>
          {/* Summary chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {trip.summary.split(" · ").map((part) => (
              <span
                key={part}
                className="rounded-full border border-black/[0.07] bg-surface px-3 py-1 text-xs font-semibold text-ink/60"
              >
                {part}
              </span>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative space-y-8 pb-8">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 h-full w-px bg-black/[0.06]" />

          {/* ── FLIGHT ── */}
          {flightLine && (
            <div className="relative z-10 pl-14">
              <div className="absolute top-1 left-0 flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white shadow-lg ring-4 ring-canvas">
                <AirplaneTakeoff size={18} weight="fill" />
              </div>
              <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-[10px] font-bold italic text-white">
                      EK
                    </div>
                    <div>
                      <p className="font-semibold">Arrive in {trip.destination}</p>
                      <p className="text-[10px] text-ink/40">{trip.dateRange.split("–")[0].trim()}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-surface px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
                    {stars >= 5 ? "Business Class" : "Economy Class"}
                  </span>
                </div>
                <div className="mb-5 flex items-center justify-between gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold">BOM</p>
                    <p className="text-[10px] text-ink/50">Departure</p>
                  </div>
                  <div className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] text-ink/40">~3h 15m</span>
                    <div className="relative h-px w-full bg-black/[0.08]">
                      <AirplaneTakeoff
                        size={14}
                        weight="fill"
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-orange"
                      />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Non-stop</span>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{destAirport}</p>
                    <p className="text-[10px] text-ink/50">Arrival</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-black/[0.06] pt-4">
                  <div>
                    <span className="text-lg font-bold">
                      AED {flightLine.amount.toLocaleString()}
                    </span>
                    <span className="ml-1 text-xs text-ink/40">
                      for {trip.travelers} {trip.travelers === 1 ? "person" : "people"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border-2 border-orange px-5 py-1.5 text-xs font-bold text-orange transition hover:bg-orange/10"
                  >
                    Select Flight
                  </button>
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-orange/15 bg-orange/5 p-3">
                  <Sparkle size={16} weight="fill" className="mt-0.5 shrink-0 text-orange" />
                  <p className="text-xs leading-relaxed text-ink/70">
                    Kenzr picked this route as the best direct option into{" "}
                    <strong>{trip.destination}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── TRANSFER ── */}
          {transferLine && (
            <div className="relative z-10 pl-14">
              <div className="absolute top-1 left-0 flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white shadow-lg ring-4 ring-canvas">
                <Car size={18} weight="fill" />
              </div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Airport Transfer</h3>
                <span className="text-xs text-ink/40">{trip.dateRange.split("–")[0].trim()}</span>
              </div>
              <div className="group flex h-36 overflow-hidden rounded-2xl border border-black/[0.08] bg-white transition hover:shadow-md">
                <div className="w-36 shrink-0 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80"
                    alt="Transfer"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h4 className="text-sm font-bold">
                      Private 1-Way Transfer — {destAirport} to Hotel
                    </h4>
                    <p className="mt-1 text-xs text-ink/40">Travel time: ~1h</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-base font-bold">
                      AED {transferLine.amount.toLocaleString()}
                      <span className="ml-1 text-xs font-normal text-ink/40">total</span>
                    </p>
                    <button
                      type="button"
                      className="rounded-full bg-ink px-4 py-1.5 text-xs font-bold text-white hover:bg-orange"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── HOTEL / STAY ── */}
          {hotelLine && hotelParsed && (
            <div className="relative z-10 pl-14">
              <div className="absolute top-1 left-0 flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white shadow-lg ring-4 ring-canvas">
                <Buildings size={18} weight="fill" />
              </div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Stay</h3>
                  <p className="text-xs text-ink/40">{hotelParsed.nights}</p>
                </div>
                <span className="text-xs text-ink/40">{trip.dateRange}</span>
              </div>
              <div className="flex h-44 overflow-hidden rounded-2xl border border-black/[0.08] bg-white transition hover:shadow-md">
                <div className="relative w-52 shrink-0 overflow-hidden">
                  {hotelImg ? (
                    <img src={hotelImg} alt={hotelParsed.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-surface" />
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 backdrop-blur">
                    <span className="text-xs font-bold">9.0</span>
                    <span className="text-[10px] text-ink/50">Very Good</span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="mb-1 flex gap-0.5">
                      {Array.from({ length: stars }).map((_, i) => (
                        <Star key={i} size={11} weight="fill" className="text-orange" />
                      ))}
                    </div>
                    <h4 className="text-base font-bold leading-tight">{hotelParsed.name}</h4>
                    <p className="mt-1 text-xs text-ink/40">{trip.destination}</p>
                    {stars >= 4 && (
                      <span className="mt-2 inline-block rounded bg-surface px-2 py-0.5 text-[9px] text-ink/50">
                        Breakfast included
                      </span>
                    )}
                  </div>
                  <div className="flex items-end justify-between border-t border-black/[0.06] pt-3">
                    <div>
                      <p className="text-[10px] uppercase text-ink/40">Total Price</p>
                      <span className="text-xl font-bold">
                        AED {hotelLine.amount.toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-ink px-5 py-1.5 text-xs font-bold text-white hover:bg-orange"
                    >
                      Select
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ACTIVITIES ── */}
          <div className="relative z-10 pl-14">
            <div className="absolute top-1 left-0 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white shadow-lg ring-4 ring-canvas">
              <PlusCircle size={18} weight="fill" />
            </div>
            <div className="mb-3">
              <h3 className="font-semibold opacity-40">Activities &amp; Experiences</h3>
              <p className="text-[10px] uppercase tracking-widest text-ink/30">Pending Selection</p>
            </div>
            <div className="cursor-pointer rounded-2xl border-2 border-dashed border-black/10 bg-surface p-8 text-center transition hover:border-orange/40">
              <PlusCircle size={28} className="mx-auto text-orange" weight="fill" />
              <p className="mt-2 text-sm font-semibold text-ink/60">Add an activity or experience</p>
              {activityLines.length === 0 ? (
                <p className="mt-1 text-xs text-ink/40">
                  Ask Kenzr to recommend activities in {trip.destination}.
                </p>
              ) : (
                activityLines.map((a) => (
                  <p key={a.label} className="mt-1 text-xs font-semibold text-orange">
                    {a.label}
                    {a.amount > 0 ? ` — AED ${a.amount.toLocaleString()}` : ""}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <CheckoutBar trip={trip} />
    </>
  );
}
