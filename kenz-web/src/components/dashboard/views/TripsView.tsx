"use client";

import {
  ArrowRight,
  CalendarBlank,
  PencilSimple,
  PlusCircle,
  RocketLaunch,
  ShareNetwork,
  Users,
} from "@phosphor-icons/react";
import { ARCHIVE_TRIPS, TRIP_LIST } from "@/lib/dashboard/data";
import { usePlannerState } from "@/lib/planner/PlannerStateContext";
import { useDashboard } from "../DashboardContext";

export default function TripsView() {
  const { openTrip, startNewTrip } = useDashboard();
  const { savedTrips } = usePlannerState();

  const activeTripCount = savedTrips.length;

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 pb-20">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-[family-name:var(--font-anton)] text-3xl tracking-wide">
            My Journeys
          </h2>
          <p className="mt-1 text-sm text-ink/50">
            Curating your global footprint with intelligence and style.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-black/[0.08] bg-surface px-4 py-2.5">
            <span className="block text-[9px] font-semibold uppercase tracking-widest text-ink/40">Active Trips</span>
            <span className="text-xl font-bold">{String(activeTripCount).padStart(2, "0")}</span>
          </div>
        </div>
      </div>

      {/* User-created trips from planning sessions */}
      {savedTrips.length > 0 && (
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold">Your Planned Trips</h3>
            <button
              type="button"
              onClick={() => startNewTrip()}
              className="flex items-center gap-1.5 text-sm font-semibold text-orange hover:underline"
            >
              <PlusCircle size={16} />
              Plan another
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {savedTrips.map((trip) => (
              <button
                key={trip.id}
                type="button"
                onClick={() => openTrip(trip.id)}
                className="group overflow-hidden rounded-2xl border border-black/[0.08] bg-white text-left transition hover:border-orange/40 hover:shadow-md"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="rounded-full bg-orange px-2 py-0.5 text-[9px] font-bold uppercase text-white">New</span>
                  </div>
                  <p className="absolute bottom-3 left-3 font-[family-name:var(--font-anton)] text-lg tracking-wide text-white">
                    {trip.title}
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="flex items-center gap-1.5 text-xs text-ink/50">
                    <CalendarBlank size={12} />
                    {trip.dateRange}
                    <span className="mx-1 text-black/20">·</span>
                    <Users size={12} />
                    {trip.travelers} travellers
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-orange">
                      AED {trip.totalEstimate.toLocaleString()} est.
                    </span>
                    <ArrowRight size={16} className="text-ink/30 transition group-hover:translate-x-1 group-hover:text-orange" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Bento grid */}
      <div className="mb-8 grid grid-cols-12 gap-4">
        {/* Featured trip */}
        <button
          type="button"
          onClick={() => openTrip(TRIP_LIST[0].id)}
          className="group col-span-12 overflow-hidden rounded-2xl border border-black/[0.08] bg-white text-left transition hover:border-orange/40 lg:col-span-8"
        >
          <div className="relative h-72 overflow-hidden">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <img
              src={TRIP_LIST[0].image}
              alt={TRIP_LIST[0].title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <span className="rounded-full bg-orange px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                Booking
              </span>
              <span className="rounded-full border border-white/30 bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase text-white backdrop-blur">
                Next Week
              </span>
            </div>
            <div className="absolute right-5 bottom-5 left-5 z-20 flex items-end justify-between text-white">
              <div>
                <h3 className="font-[family-name:var(--font-anton)] text-2xl tracking-wide">
                  {TRIP_LIST[0].title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs opacity-85">
                  <span className="flex items-center gap-1"><CalendarBlank size={12} /> {TRIP_LIST[0].dateRange}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> 2 Adults</span>
                  <span className="font-bold text-orange-soft">15% Planned</span>
                </div>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink transition group-hover:bg-orange group-hover:text-white">
                <ArrowRight size={18} weight="bold" />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex -space-x-2">
              <div className="h-8 w-8 rounded-full border-2 border-white bg-surface" />
              <div className="h-8 w-8 rounded-full border-2 border-white bg-black/10" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-surface text-[9px] font-bold">
                +AI
              </div>
            </div>
            <div className="flex gap-4 text-[10px] font-semibold uppercase tracking-wide text-ink/40">
              <span className="flex items-center gap-1"><ShareNetwork size={12} /> Share</span>
              <span className="flex items-center gap-1"><PencilSimple size={12} /> Modify</span>
            </div>
          </div>
        </button>

        {/* Side cards */}
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
          <button
            type="button"
            onClick={() => openTrip("alpine-sanctuary")}
            className="group flex-1 overflow-hidden rounded-2xl border border-black/[0.08] bg-white text-left transition hover:border-orange/40"
          >
            <div className="relative h-36 overflow-hidden">
              <img
                src={TRIP_LIST[1].image}
                alt={TRIP_LIST[1].title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/25" />
              <span className="absolute top-3 left-3 rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                Confirmed
              </span>
            </div>
            <div className="px-4 py-3">
              <h4 className="text-sm font-bold">{TRIP_LIST[1].title}</h4>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-ink/40">
                Switzerland • Dec 2024
              </p>
            </div>
          </button>

          <div className="flex flex-1 flex-col justify-between rounded-2xl border border-black/[0.08] bg-surface p-4 transition hover:border-orange/40">
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange/10 text-orange">
                <RocketLaunch size={22} weight="fill" />
              </div>
              <h4 className="text-sm font-bold">Tokyo Neon Drift</h4>
              <p className="mt-1 text-xs text-ink/50">
                Personalized recommendation based on urban photography and nightlife.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-orange">Draft Itinerary Ready</span>
              <ArrowRight size={16} className="text-orange" />
            </div>
          </div>
        </div>
      </div>

      {/* Archive */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold">Archive</h3>
          <button type="button" className="text-sm font-semibold text-orange hover:underline">
            View All Memories
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {ARCHIVE_TRIPS.map((trip) => (
            <div
              key={trip.id}
              className="group flex cursor-pointer items-center gap-3 rounded-xl border border-black/[0.08] bg-white p-3 transition hover:shadow-md"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                <img
                  src={trip.image}
                  alt={trip.title}
                  className="h-full w-full object-cover grayscale transition group-hover:grayscale-0"
                />
              </div>
              <div>
                <h5 className="text-sm font-bold">{trip.title}</h5>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-ink/40">
                  Completed • {trip.dateRange}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
