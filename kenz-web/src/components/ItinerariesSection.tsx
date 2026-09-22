"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import MotionReveal from "./MotionReveal";
import BezelCard from "./ui/BezelCard";
import { easePremium } from "@/lib/motion";
import {
  ITINERARIES,
  TAPE_CLASS,
  blankDays,
  type CommunityItinerary,
  type ItineraryDay,
  type Polaroid,
} from "@/data/discover";

const SLOTS = ["morning", "afternoon", "evening", "night"] as const;
const DAYS_PER_PAGE = 3;

const BUILDER_DEFAULT: CommunityItinerary = {
  id: "mine",
  title: "My Dubai trip",
  vibe: "Write it like a local would",
  days: 3,
  author: "You",
  authorInitial: "Y",
  authorNote: "Your notebook",
  budget: "",
  polaroids: [],
  daysPlan: blankDays(3),
};

function pageCount(trip: CommunityItinerary) {
  return Math.max(1, Math.ceil(trip.daysPlan.length / DAYS_PER_PAGE));
}

export default function ItinerariesSection() {
  const [open, setOpen] = useState<CommunityItinerary | null>(null);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(false);

  const openTrip = (trip: CommunityItinerary, edit = false) => {
    setOpen(trip);
    setPage(0);
    setEditing(edit);
  };

  const close = () => {
    setOpen(null);
    setEditing(false);
    setPage(0);
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (!open) return;
      const last = pageCount(open) - 1;
      if (e.key === "ArrowRight") setPage((p) => Math.min(last, p + 1));
      if (e.key === "ArrowLeft") setPage((p) => Math.max(0, p - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pages = open ? pageCount(open) : 1;

  return (
    <section id="itineraries" className="scroll-mt-24 bg-[#141210] py-28 text-white md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <MotionReveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">
              Itineraries
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-anton)] text-[clamp(2.25rem,5vw,4rem)] uppercase leading-[0.95]">
              Steal a notebook.
              <br />
              Or write your own.
            </h2>
            <p className="mt-5 text-lg text-white/60">
              Compact cards from people who live here. Tap one to open the full
              day-by-day pages.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openTrip({ ...BUILDER_DEFAULT, daysPlan: blankDays(3) }, true)}
            className="group inline-flex items-center gap-3 rounded-full bg-orange px-6 py-3 text-sm font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-orange-deep active:scale-[0.98]"
          >
            <span>Build my own</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 text-xs transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-px">
              ↗
            </span>
          </button>
        </MotionReveal>

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {ITINERARIES.map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (i % 2) * 0.08, duration: 0.7, ease: easePremium }}
              className={i % 2 === 1 ? "md:mt-12" : ""}
            >
              <ItineraryCard trip={trip} onOpen={() => openTrip(trip)} />
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-[#141210]/80 backdrop-blur-sm"
              aria-label="Close itinerary"
              onClick={close}
            />

            <div className="relative z-10 flex w-full max-w-5xl items-center gap-3 md:gap-5">
              <PageArrow
                dir="prev"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              />

              <motion.div
                key={`${open.id}-${page}-${editing}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: easePremium }}
                className="min-w-0 flex-1"
              >
                {editing && (
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange">
                      Your notebook
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">Days</span>
                      {[3, 4, 5, 6].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            let daysPlan = open.daysPlan.slice(0, n);
                            if (daysPlan.length < n) {
                              daysPlan = [...daysPlan, ...blankDays(n).slice(daysPlan.length)];
                            }
                            const next = { ...open, days: n, daysPlan };
                            setOpen(next);
                            setPage((p) => Math.min(p, pageCount(next) - 1));
                          }}
                          className={`h-8 w-8 rounded-full text-xs font-semibold ${
                            open.daysPlan.length === n
                              ? "bg-orange text-white"
                              : "bg-white/10 text-white/70"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <NotebookSpread
                  trip={open}
                  page={page}
                  editable={editing}
                  onChange={(next) => setOpen(next)}
                />
                <div className="mt-4 flex items-center justify-center gap-3 sm:gap-2">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#141210] sm:hidden"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    aria-label="Previous page"
                  >
                    <CaretLeft size={18} weight="bold" />
                  </button>
                  {Array.from({ length: pages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Page ${i + 1}`}
                      onClick={() => setPage(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === page ? "w-6 bg-orange" : "w-2 bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#141210] sm:hidden"
                    disabled={page >= pages - 1}
                    onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                    aria-label="Next page"
                  >
                    <CaretRight size={18} weight="bold" />
                  </button>
                </div>
              </motion.div>

              <PageArrow
                dir="next"
                disabled={page >= pages - 1}
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              />
            </div>

            <button
              type="button"
              onClick={close}
              className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-orange"
              aria-label="Close"
            >
              <X size={18} weight="bold" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ItineraryCard({
  trip,
  onOpen,
}: {
  trip: CommunityItinerary;
  onOpen: () => void;
}) {
  const cover = trip.polaroids[0];
  return (
    <button type="button" onClick={onOpen} className="block h-full w-full text-left">
      <BezelCard dark className="h-full" innerClassName="group flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[16/9] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover?.src}
            alt={cover?.alt ?? ""}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#1a1714] via-[#1a1714]/25 to-transparent"
            aria-hidden
          />
          <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
            <p className="font-[family-name:var(--font-anton)] text-5xl leading-none text-white">
              {trip.days}
              <span className="ml-1 text-lg text-white/70">days</span>
            </p>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85 ring-1 ring-white/15 backdrop-blur-sm">
              Open notebook
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange text-sm font-bold text-white">
              {trip.authorInitial}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{trip.author}</p>
              <p className="text-xs text-white/50">{trip.authorNote}</p>
            </div>
          </div>
          <h3 className="mt-5 font-[family-name:var(--font-anton)] text-2xl uppercase leading-tight">
            {trip.title}
          </h3>
          <p className="mt-2 text-sm text-white/60">{trip.vibe}</p>
          <ol className="mt-5 space-y-1.5 text-sm text-white/75">
            {trip.daysPlan.slice(0, 3).map((d) => (
              <li key={d.day} className="flex gap-3">
                <span className="font-[family-name:var(--font-anton)] text-orange/80">
                  {String(d.day).padStart(2, "0")}
                </span>
                <span>{d.title}</span>
              </li>
            ))}
          </ol>
          <p className="mt-auto pt-6 text-xs text-white/40">{trip.budget}</p>
        </div>
      </BezelCard>
    </button>
  );
}

function PageArrow({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = dir === "prev" ? CaretLeft : CaretRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous page" : "Next page"}
      className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#141210] shadow-lg transition hover:bg-orange hover:text-white disabled:opacity-25 sm:flex"
    >
      <Icon size={22} weight="bold" />
    </button>
  );
}

function NotebookSpread({
  trip,
  page,
  editable,
  onChange,
}: {
  trip: CommunityItinerary;
  page: number;
  editable?: boolean;
  onChange?: (next: CommunityItinerary) => void;
}) {
  const slice = trip.daysPlan.slice(page * DAYS_PER_PAGE, page * DAYS_PER_PAGE + DAYS_PER_PAGE);
  const [a, b, c] = slice;
  const shots: Polaroid[] = trip.polaroids.length
    ? trip.polaroids
    : [
        {
          src: "/discover/skyline.jpg",
          alt: "",
          caption: "Add a photo later",
          rotate: -5,
        },
      ];
  const shotA = shots[page % shots.length];
  const shotB = shots[(page + 1) % shots.length];
  const doodle = (["plane", "bus", "bag"] as const)[page % 3];

  return (
    <article className="relative max-h-[min(88dvh,920px)] overflow-y-auto">
      <div className="absolute -left-3 top-8 z-20 hidden flex-col gap-5 sm:flex md:-left-4">
        {Array.from({ length: 11 }).map((_, i) => (
          <span
            key={i}
            className="block h-3.5 w-3.5 rounded-full bg-[#1c1a18] shadow-[inset_1px_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(0,0,0,0.45)] ring-2 ring-[#c8c2b6]"
          />
        ))}
      </div>

      <div className="notebook-paper relative overflow-hidden rounded-[1.6rem] pl-6 text-[#2a241c] shadow-[0_28px_80px_rgba(0,0,0,0.45)] ring-1 ring-black/10 sm:pl-10">
        <TornEdge />
        <div className="pointer-events-none absolute inset-y-0 left-5 w-px bg-orange/25 sm:left-8" />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
          <div className="flex flex-col gap-8">
            {a && (
              <DayBlock
                day={a}
                editable={editable}
                onChange={(d) => patchDay(trip, d, onChange)}
              />
            )}
            <div className="flex items-end gap-3">
              <PolaroidShot shot={shotA} />
              <Doodle kind={doodle} />
            </div>
            {c && (
              <DayBlock
                day={c}
                editable={editable}
                onChange={(d) => patchDay(trip, d, onChange)}
              />
            )}
          </div>

          <div className="flex flex-col gap-8">
            <header className="relative pt-1">
              <p className="font-[family-name:var(--font-caveat)] text-4xl leading-none text-[#3b3228] sm:text-5xl">
                Travel
                <br />
                <span className="italic">Itinerary</span>
              </p>
              {editable ? (
                <input
                  value={trip.title}
                  onChange={(e) => onChange?.({ ...trip, title: e.target.value })}
                  className="mt-3 w-full border-b border-dashed border-[#2a241c]/25 bg-transparent font-[family-name:var(--font-anton)] text-xl uppercase outline-none"
                  aria-label="Trip title"
                />
              ) : (
                <h3 className="mt-3 font-[family-name:var(--font-anton)] text-xl uppercase leading-tight sm:text-2xl">
                  {trip.title}
                </h3>
              )}
              <p className="mt-1 font-[family-name:var(--font-caveat)] text-xl text-[#2a241c]/70">
                {page === 0 ? trip.vibe : `Days ${a?.day}–${slice[slice.length - 1]?.day}`}
              </p>
            </header>

            {b && (
              <DayBlock
                day={b}
                editable={editable}
                onChange={(d) => patchDay(trip, d, onChange)}
              />
            )}

            <div className="mt-auto flex items-end justify-between gap-3 pt-2">
              <PolaroidShot shot={shotB} />
              <Doodle kind={page % 2 === 0 ? "bag" : "star"} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function patchDay(
  trip: CommunityItinerary,
  day: ItineraryDay,
  onChange?: (next: CommunityItinerary) => void,
) {
  if (!onChange) return;
  onChange({
    ...trip,
    daysPlan: trip.daysPlan.map((d) => (d.day === day.day ? day : d)),
  });
}

function DayBlock({
  day,
  editable,
  onChange,
}: {
  day: ItineraryDay;
  editable?: boolean;
  onChange?: (day: ItineraryDay) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-md px-3 py-1 font-[family-name:var(--font-caveat)] text-2xl leading-none ${TAPE_CLASS[day.tape]}`}
        >
          Day {day.day}
        </span>
        {editable ? (
          <input
            value={day.title}
            onChange={(e) => onChange?.({ ...day, title: e.target.value })}
            placeholder="Name this day"
            className="min-w-0 flex-1 bg-transparent font-[family-name:var(--font-caveat)] text-xl outline-none placeholder:text-[#2a241c]/35"
          />
        ) : (
          <span className="font-[family-name:var(--font-caveat)] text-xl">{day.title}</span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3">
        {SLOTS.map((slot) => (
          <div key={slot}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2a241c]/55">
              {slot}
            </p>
            {editable ? (
              <textarea
                value={day[slot]}
                onChange={(e) => onChange?.({ ...day, [slot]: e.target.value })}
                rows={2}
                placeholder="What are you doing?"
                className="mt-1 w-full resize-none bg-transparent text-[13px] leading-snug outline-none placeholder:text-[#2a241c]/30"
              />
            ) : (
              <p className="mt-1 text-[13px] leading-snug text-[#2a241c]/80">{day[slot]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PolaroidShot({ shot }: { shot: Polaroid }) {
  return (
    <figure
      className="w-[46%] max-w-[190px] shrink-0 bg-[#f4ead6] p-2 pb-7 shadow-[0_10px_24px_rgba(42,36,28,0.18)] ring-1 ring-black/5"
      style={{ transform: `rotate(${shot.rotate}deg)` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={shot.src} alt={shot.alt} className="aspect-[4/3] w-full object-cover" />
      <figcaption className="mt-2 text-center font-[family-name:var(--font-caveat)] text-base">
        {shot.caption}
      </figcaption>
    </figure>
  );
}

function TornEdge() {
  return (
    <div
      className="pointer-events-none absolute -top-px left-[18%] right-[12%] h-7 bg-[#f3e6d2]"
      style={{
        clipPath:
          "polygon(0 40%, 8% 0, 18% 55%, 28% 8%, 40% 62%, 52% 0, 64% 48%, 76% 10%, 88% 52%, 100% 18%, 100% 100%, 0 100%)",
      }}
      aria-hidden
    />
  );
}

function Doodle({
  kind,
  className = "",
}: {
  kind: "plane" | "bus" | "bag" | "sun" | "star";
  className?: string;
}) {
  const common = `h-11 w-11 text-orange/75 ${className}`;
  if (kind === "plane") {
    return (
      <svg viewBox="0 0 64 64" className={common} fill="currentColor" aria-hidden>
        <path d="M62 32 4 48l10-16L4 16l58 16Zm-24 1-16 8 3-8-3-8 16 8Z" />
      </svg>
    );
  }
  if (kind === "bus") {
    return (
      <svg viewBox="0 0 64 64" className={common} fill="none" aria-hidden>
        <rect x="6" y="14" width="52" height="28" rx="8" stroke="currentColor" strokeWidth="3" />
        <path d="M6 30h52" stroke="currentColor" strokeWidth="3" />
        <circle cx="18" cy="46" r="5" fill="currentColor" />
        <circle cx="46" cy="46" r="5" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "bag") {
    return (
      <svg viewBox="0 0 64 64" className={common} fill="none" aria-hidden>
        <rect x="14" y="22" width="36" height="32" rx="6" stroke="currentColor" strokeWidth="3" />
        <path d="M24 22v-6a8 8 0 0 1 16 0v6" stroke="currentColor" strokeWidth="3" />
      </svg>
    );
  }
  if (kind === "star") {
    return (
      <svg viewBox="0 0 64 64" className={`${common} rotate-12`} fill="currentColor" aria-hidden>
        <path d="M32 6 38 24h20L42 34l6 20-16-12-16 12 6-20L6 24h20z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className={common} fill="none" aria-hidden>
      <circle cx="32" cy="32" r="10" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}
