"use client";

import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AirplaneTakeoff,
  Buildings,
  CalendarBlank,
  Car,
  CheckCircle,
  FloppyDisk,
  MapPin,
  Sparkle,
  Star,
  Users,
} from "@phosphor-icons/react";
import { useDashboard } from "../DashboardContext";
import { usePlannerState } from "@/lib/planner/PlannerStateContext";
import { DESTINATION_DATA, ACCOMMODATION_DATA } from "@/lib/planner/data";
import { fetchPlacePhoto } from "@/lib/planner/fetchPlacePhoto";
import {
  ACCOMMODATION_OPTIONS,
  DATE_START_OPTIONS,
  DESTINATION_OPTIONS,
  DURATION_OPTIONS,
  defaultTransportFor,
  hotelNameForStyle,
  getCurrentPlanStep,
  isPlanStepDone,
  stepIndex,
  STYLE_OPTIONS,
  TRAVELLER_OPTIONS,
  type PlanStepId,
} from "@/lib/planner/planSteps";
import type { AccommodationType, Destination, TravelStyle } from "@/lib/planner/types";
import { useVoiceAgent } from "@/components/voice/VoiceAgentContext";

function fmt(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const FALLBACK_DEST: Record<string, string> = {
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  "abu-dhabi": "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&q=80",
  both: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80",
};

type StepConfig = {
  id: PlanStepId;
  label: string;
  done: boolean;
  value?: string;
  prompt?: string;
  renderOptions?: () => React.ReactNode;
};

export default function NewTripView() {
  const { finishNewTrip } = useDashboard();
  const { planState, updatePlan, isPlanComplete, planProgress } = usePlannerState();
  const { lastSay, status, focusedPlanStep } = useVoiceAgent();

  const dest = planState.destination;
  const style = planState.travelStyle;
  const destInfo = dest ? DESTINATION_DATA[dest] : null;
  const accInfo = planState.accommodation ? ACCOMMODATION_DATA[planState.accommodation] : null;
  const startDate = planState.startDate;
  const endDate = startDate
    ? new Date(startDate.getTime() + planState.duration * 24 * 60 * 60 * 1000)
    : null;

  const anyFilled = dest || style || planState.travelers > 0 || startDate || planState.accommodation;

  const patchImages = useCallback(
    (patch: NonNullable<typeof planState.placeImages>) => {
      updatePlan({ placeImages: { ...planState.placeImages, ...patch } });
    },
    [planState.placeImages, updatePlan],
  );

  /* ── Google Places photos as plan builds ── */
  useEffect(() => {
    if (!dest || planState.placeImages?.destination) return;
    const label = destInfo?.name ?? "Dubai";
    void fetchPlacePhoto(`${label} UAE landmark`, dest).then((url) => {
      if (url) patchImages({ destination: url });
    });
  }, [dest, destInfo?.name, planState.placeImages?.destination, patchImages]);

  useEffect(() => {
    if (!style || !dest || planState.placeImages?.hotel) return;
    const hotel = hotelNameForStyle(style);
    void fetchPlacePhoto(`${hotel} ${destInfo?.name ?? "Dubai"}`, dest).then((url) => {
      if (url) patchImages({ hotel: url });
    });
  }, [style, dest, destInfo?.name, planState.placeImages?.hotel, patchImages]);

  useEffect(() => {
    if (!dest || planState.placeImages?.transfer) return;
    const airport = dest === "abu-dhabi" ? "Abu Dhabi airport" : "Dubai airport";
    void fetchPlacePhoto(`${airport} luxury transfer UAE`, dest).then((url) => {
      if (url) patchImages({ transfer: url });
    });
  }, [dest, planState.placeImages?.transfer, patchImages]);

  useEffect(() => {
    if (!dest || !style || !destInfo) return;
    const missing = destInfo.highlights.filter((h) => !planState.placeImages?.highlights?.[h]);
    if (missing.length === 0) return;
    void Promise.all(
      missing.map(async (h) => {
        const url = await fetchPlacePhoto(`${h} ${destInfo.name} UAE`, dest);
        return url ? ([h, url] as const) : null;
      }),
    ).then((pairs) => {
      const next: Record<string, string> = { ...planState.placeImages?.highlights };
      for (const p of pairs) {
        if (p) next[p[0]] = p[1];
      }
      if (Object.keys(next).length > 0) patchImages({ highlights: next });
    });
  }, [dest, style, destInfo, planState.placeImages?.highlights, patchImages]);

  const selectDestination = (value: Destination) => {
    updatePlan({ destination: value });
  };

  const selectStyle = (value: TravelStyle) => {
    updatePlan({
      travelStyle: value,
    });
  };

  const selectTravellers = (n: number) => {
    updatePlan({ travelers: n });
  };

  const selectDuration = (nights: number) => {
    updatePlan({ duration: nights });
  };

  const selectStartOffset = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(12, 0, 0, 0);
    updatePlan({ startDate: d });
  };

  const selectAccommodation = (value: AccommodationType) => {
    updatePlan({
      accommodation: value,
      transport: defaultTransportFor(planState.travelStyle, value),
    });
  };

  const handleSave = () => {
    if (!isPlanComplete) return;
    finishNewTrip();
  };

  const heroImg =
    planState.placeImages?.destination ?? (dest ? FALLBACK_DEST[dest] : FALLBACK_DEST.dubai);
  const transferImg =
    planState.placeImages?.transfer ??
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&q=80";
  const hotelImg = planState.placeImages?.hotel;

  const currentStepId = getCurrentPlanStep(planState);
  const activeStepId =
    focusedPlanStep && stepIndex(focusedPlanStep) <= stepIndex(currentStepId)
      ? focusedPlanStep
      : currentStepId;

  const steps: StepConfig[] = [
    {
      id: "destination",
      label: "Destination",
      done: isPlanStepDone("destination", planState),
      value: destInfo?.name,
      prompt: "Where do you want to go?",
      renderOptions: () => (
        <OptionGrid
          options={DESTINATION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onSelect={(v) => selectDestination(v as Destination)}
          selected={dest ?? undefined}
        />
      ),
    },
    {
      id: "style",
      label: "Travel Style",
      done: isPlanStepDone("style", planState),
      value: style ? capitalize(style) : undefined,
      prompt: "Pick your travel style",
      renderOptions: () => (
        <OptionGrid
          options={STYLE_OPTIONS.map((o) => ({ value: o.value, label: o.label, hint: o.hint }))}
          onSelect={(v) => selectStyle(v as TravelStyle)}
          selected={style ?? undefined}
          disabled={!dest}
        />
      ),
    },
    {
      id: "dates",
      label: "Travel Dates",
      done: isPlanStepDone("dates", planState),
      value: startDate && endDate ? `${fmt(startDate)} – ${fmt(endDate)}` : undefined,
      prompt: "When are you travelling?",
      renderOptions: () => (
        <div className="space-y-2">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-ink/35">Trip length</p>
          <OptionGrid
            options={DURATION_OPTIONS}
            onSelect={(v) => selectDuration(Number(v))}
            selected={String(planState.duration)}
            disabled={!dest}
          />
          <p className="pt-1 text-[9px] font-semibold uppercase tracking-wider text-ink/35">Start around</p>
          <OptionGrid
            options={DATE_START_OPTIONS}
            onSelect={(v) => selectStartOffset(Number(v))}
            selected={undefined}
            disabled={!dest}
          />
        </div>
      ),
    },
    {
      id: "travellers",
      label: "Travellers",
      done: isPlanStepDone("travellers", planState),
      value:
        planState.travelers > 0
          ? `${planState.travelers} ${planState.travelers === 1 ? "person" : "people"}`
          : undefined,
      prompt: "How many travellers?",
      renderOptions: () => (
        <OptionGrid
          options={TRAVELLER_OPTIONS}
          onSelect={(v) => selectTravellers(Number(v))}
          selected={planState.travelers > 0 ? String(planState.travelers) : undefined}
          disabled={!dest}
        />
      ),
    },
    {
      id: "accommodation",
      label: "Accommodation",
      done: isPlanStepDone("accommodation", planState),
      value: accInfo?.name,
      prompt: "Where do you want to stay?",
      renderOptions: () => (
        <OptionGrid
          options={ACCOMMODATION_OPTIONS.map((o) => ({ value: o.value, label: o.label, hint: o.hint }))}
          onSelect={(v) => selectAccommodation(v as AccommodationType)}
          selected={planState.accommodation ?? undefined}
          disabled={!style}
        />
      ),
    },
  ];

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] grid-cols-12 gap-0">
      {/* LEFT — building checklist */}
      <div className="col-span-12 flex flex-col px-6 py-8 lg:col-span-5 lg:px-8">
        <AnimatePresence mode="wait">
          {!anyFilled ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="max-w-sm"
            >
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-orange/10 px-3 py-1 text-xs font-semibold text-orange">
                <Sparkle size={13} weight="fill" />
                Kenzr is ready to plan
              </span>
              <h2 className="font-[family-name:var(--font-anton)] text-4xl leading-tight tracking-wide text-ink">
                Where do you <br />
                <span className="text-orange">want to go?</span>
              </h2>
              <p className="mt-4 text-sm text-ink/50">
                Tell Kenzr or tap a destination below — your itinerary builds live on the right.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-2">
                {DESTINATION_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectDestination(value)}
                    className="group relative h-24 overflow-hidden rounded-2xl"
                  >
                    <img
                      src={FALLBACK_DEST[value]}
                      alt={label}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/10" />
                    <span className="absolute bottom-2 left-2 text-xs font-bold text-white">{label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="building"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-sm"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/10 px-3 py-1 text-xs font-semibold text-orange">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange" />
                  Building your trip
                </span>
                <span className="text-[10px] font-bold text-ink/40">{planProgress}%</span>
              </div>
              <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-orange transition-all duration-500"
                  style={{ width: `${planProgress}%` }}
                />
              </div>

              <h2 className="font-[family-name:var(--font-anton)] text-3xl tracking-wide text-ink">
                {destInfo ? destInfo.name : "Your Trip"}
              </h2>
              {destInfo && <p className="mt-1 text-sm italic text-ink/50">{destInfo.tagline}</p>}

              <div className="mt-6 space-y-3">
                {steps.map((step) => {
                  const isCurrent = !step.done && step.id === activeStepId;
                  return (
                  <div
                    key={step.id}
                    className={`rounded-xl border px-3 py-3 transition ${
                      step.done
                        ? "border-orange/20 bg-orange/5"
                        : isCurrent
                          ? "border-orange/35 bg-orange/[0.07] ring-1 ring-orange/20"
                          : "border-black/[0.06] bg-surface"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle
                        size={16}
                        weight="fill"
                        className={`mt-0.5 shrink-0 ${step.done ? "text-orange" : "text-ink/20"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink/40">
                          {step.label}
                          {isCurrent && (
                            <span className="ml-2 normal-case tracking-normal text-orange">
                              · Now
                            </span>
                          )}
                        </p>
                        <p
                          className={`text-xs font-semibold ${
                            step.done ? "text-ink" : "italic text-ink/30"
                          }`}
                        >
                          {step.done && step.value ? step.value : "Waiting…"}
                        </p>
                        {isCurrent && step.renderOptions && (
                          <div className="mt-3 border-t border-black/[0.05] pt-3">
                            {step.prompt && (
                              <p className="mb-2 text-[10px] font-medium text-ink/45">{step.prompt}</p>
                            )}
                            {step.renderOptions()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              {lastSay && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-2xl border border-orange/15 bg-orange/5 p-4"
                >
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-orange/60">Kenzr</p>
                  <p className="text-xs leading-relaxed text-ink">{lastSay}</p>
                  {status === "listening" && (
                    <p className="mt-2 flex items-center gap-1.5 text-[10px] text-ink/40">
                      <span className="h-1 w-1 animate-pulse rounded-full bg-orange" />
                      Listening…
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT — live itinerary */}
      <div className="col-span-12 overflow-y-auto border-l border-black/[0.06] bg-white lg:col-span-7">
        <AnimatePresence mode="wait">
          {!anyFilled ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full flex-col items-center justify-center gap-4 px-8 py-20 text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface">
                <MapPin size={36} weight="thin" className="text-ink/20" />
              </div>
              <p className="text-sm font-semibold text-ink/30">
                Your itinerary will appear here as you build your trip
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="itinerary"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-6 py-6 pb-24"
            >
              {dest && (
                <div className="relative mb-6 h-48 overflow-hidden rounded-2xl">
                  <img src={heroImg} alt={destInfo?.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-5 text-white">
                    <p className="font-[family-name:var(--font-anton)] text-3xl tracking-wide">
                      {destInfo?.name}
                    </p>
                    {destInfo?.tagline && <p className="mt-0.5 text-xs opacity-75">{destInfo.tagline}</p>}
                  </div>
                  {style && (
                    <div className="absolute top-4 right-4 rounded-full bg-orange px-3 py-1 text-[10px] font-bold uppercase text-white">
                      {capitalize(style)}
                    </div>
                  )}
                </div>
              )}

              <div className="mb-6 flex flex-wrap gap-2">
                {startDate && endDate && (
                  <span className="flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-surface px-3 py-1.5 text-xs font-semibold">
                    <CalendarBlank size={13} />
                    {fmt(startDate)} – {fmt(endDate)} ({planState.duration} nights)
                  </span>
                )}
                {planState.travelers > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-surface px-3 py-1.5 text-xs font-semibold">
                    <Users size={13} />
                    {planState.travelers} {planState.travelers === 1 ? "traveller" : "travellers"}
                  </span>
                )}
              </div>

              <div className="relative space-y-5 pl-12">
                <div className="absolute left-4 top-0 h-full w-px bg-black/[0.06]" />

                {dest && (
                  <TimelineCard icon={<AirplaneTakeoff size={17} weight="fill" />} delay={0.05}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-[10px] font-bold italic text-white">
                          EK
                        </div>
                        <span className="text-sm font-semibold">
                          Flight to {dest === "abu-dhabi" ? "AUH" : "DXB"}
                        </span>
                      </div>
                      <span className="rounded-full bg-surface px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-ink/50">
                        {style === "luxury" ? "Business" : "Economy"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-center">
                      <div>
                        <p className="text-xl font-bold">BOM</p>
                        <p className="text-[10px] text-ink/40">{startDate ? fmt(startDate) : "TBD"}</p>
                      </div>
                      <div className="flex flex-1 flex-col items-center px-4">
                        <p className="text-[10px] text-ink/40">~3h 15m</p>
                        <div className="my-1 h-px w-full bg-black/[0.08]" />
                        <p className="text-[9px] font-bold uppercase tracking-wider text-ink/40">Non-stop</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">{dest === "abu-dhabi" ? "AUH" : "DXB"}</p>
                        <p className="text-[10px] text-ink/40">{startDate ? fmt(startDate) : "TBD"}</p>
                      </div>
                    </div>
                  </TimelineCard>
                )}

                {dest && (
                  <TimelineCard icon={<Car size={17} weight="fill" />} delay={0.1}>
                    <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-sm">
                      <div className="flex">
                        <img src={transferImg} alt="Transfer" className="h-24 w-28 shrink-0 object-cover" />
                        <div className="flex flex-1 flex-col justify-between p-4">
                          <div>
                            <p className="text-xs font-bold">Private Airport Transfer</p>
                            <p className="mt-0.5 text-[10px] text-ink/40">
                              {dest === "abu-dhabi" ? "AUH" : "DXB"} → Hotel · ~1h
                            </p>
                          </div>
                          <p className="text-sm font-bold">
                            AED 75 <span className="text-[10px] font-normal text-ink/40">/person</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </TimelineCard>
                )}

                {style && (
                  <TimelineCard icon={<Buildings size={17} weight="fill" />} delay={0.15}>
                    <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-sm">
                      <div className="flex h-40">
                        <div className="relative w-40 shrink-0 overflow-hidden bg-surface">
                          {hotelImg ? (
                            <img src={hotelImg} alt="Hotel" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-ink/30">
                              Loading photo…
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between p-4">
                          <div>
                            <div className="mb-1 flex gap-0.5">
                              {Array.from({
                                length:
                                  style === "backpacker" ? 2 : style === "budget" ? 3 : style === "balanced" ? 4 : 5,
                              }).map((_, i) => (
                                <Star key={i} size={10} weight="fill" className="text-orange" />
                              ))}
                            </div>
                            <p className="text-sm font-bold leading-tight">{hotelNameForStyle(style)}</p>
                            <p className="mt-1 text-[10px] text-ink/40">
                              {accInfo?.dubaiAreas?.[0] ?? destInfo?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TimelineCard>
                )}

                {style && destInfo && (
                  <TimelineCard icon={<Sparkle size={17} />} delay={0.2} dashed>
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink/40">Suggested experiences</p>
                    <div className="grid grid-cols-2 gap-2">
                      {destInfo.highlights.map((h) => {
                        const img = planState.placeImages?.highlights?.[h];
                        return (
                          <div key={h} className="overflow-hidden rounded-xl border border-black/[0.06] bg-white">
                            {img ? (
                              <img src={img} alt={h} className="h-16 w-full object-cover" />
                            ) : (
                              <div className="h-16 bg-surface" />
                            )}
                            <p className="px-2 py-1.5 text-[10px] font-semibold">{h}</p>
                          </div>
                        );
                      })}
                    </div>
                  </TimelineCard>
                )}
              </div>

              {/* Save itinerary */}
              <div className="mt-8 rounded-2xl border border-black/[0.08] bg-surface p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-ink">
                      {isPlanComplete ? "Your trip is ready to save" : "Complete all steps to save"}
                    </p>
                    <p className="mt-0.5 text-xs text-ink/45">
                      {isPlanComplete
                        ? "Opens full Itinerary, Map, Budget & Documents for this trip."
                        : `${planProgress}% complete — fill every section on the left.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isPlanComplete}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-orange px-6 py-2.5 text-sm font-bold text-white transition hover:bg-orange-deep disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FloppyDisk size={16} weight="fill" />
                    Save Itinerary
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function OptionGrid({
  options,
  onSelect,
  selected,
  disabled,
}: {
  options: { value: string; label: string; hint?: string }[];
  onSelect: (value: string) => void;
  selected?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt.value)}
            title={opt.hint}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              active
                ? "bg-orange text-white shadow-sm"
                : "border border-black/[0.1] bg-white text-ink/70 hover:border-orange/40 hover:text-orange"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function TimelineCard({
  icon,
  children,
  delay = 0,
  dashed,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  dashed?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative"
    >
      <div
        className={`absolute -left-12 top-1 flex h-10 w-10 items-center justify-center rounded-full text-white ring-4 ring-white shadow-lg ${
          dashed ? "border-2 border-dashed border-black/20 bg-white text-ink/30" : "bg-ink"
        }`}
      >
        {icon}
      </div>
      {dashed ? (
        <div className="rounded-2xl border-2 border-dashed border-black/[0.06] p-4">{children}</div>
      ) : (
        <div className="rounded-2xl border border-black/[0.08] bg-white p-4 shadow-sm">{children}</div>
      )}
    </motion.div>
  );
}
