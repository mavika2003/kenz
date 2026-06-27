"use client";

import { motion } from "framer-motion";
import { PlanState } from "@/lib/planner/types";
import { DESTINATION_DATA, ACCOMMODATION_DATA, calculateBudget } from "@/lib/planner/data";

interface ItineraryTimelineProps {
  planState: PlanState;
}

/* ─── gradient palettes for "photo" placeholders ─────────────────────── */
const PHOTO_GRADIENTS = [
  "from-sky-400 to-blue-600",
  "from-amber-400 to-orange-600",
  "from-emerald-400 to-teal-600",
  "from-rose-400 to-pink-600",
  "from-violet-400 to-purple-600",
  "from-yellow-400 to-amber-600",
  "from-cyan-400 to-sky-600",
];

const EXPERIENCE_BANKS: Record<string, Array<[string, string, string]>> = {
  dubai: [
    ["Arrival & Marina Vibes", "Check in · Dubai Marina walk · welcome dinner", "🌆"],
    ["Burj Khalifa & Dubai Mall", "At the Top observatory · 124F · fountain show", "🏙"],
    ["Old Dubai & Spice Souk", "Al Fahidi · Abra boat · Gold Souk · Deira", "🕌"],
    ["Desert Safari", "Dune bashing · camel ride · traditional BBQ dinner", "🐪"],
    ["Palm Jumeirah & Atlantis", "Monorail · Aquaventure waterpark · The Pointe", "🌴"],
    ["JBR Beach & Bluewaters", "Ain Dubai · sunset beach · dining strip", "🎡"],
    ["Local Brunch Day", "Café hopping in Al Quoz · ALSERKAL art district", "☕"],
  ],
  "abu-dhabi": [
    ["Sheikh Zayed Grand Mosque", "Free entry · guided tour · architecture", "🕌"],
    ["Louvre Abu Dhabi", "Art & civilisation · world-class collection", "🎨"],
    ["Yas Island Adventure", "Ferrari World · Yas Marina Circuit", "🏎"],
    ["Corniche Promenade", "Waterfront walk · kayaking · sunset views", "🌅"],
    ["Heritage Village", "Traditional crafts · pearl diving history", "🏺"],
    ["Mangrove National Park", "Kayaking · birdwatching · nature reserve", "🦜"],
    ["Saadiyat Beach", "White sand · turquoise water · beach clubs", "🏖"],
  ],
  both: [
    ["Dubai: Arrival & Marina Vibes", "Check in · marina walk · welcome dinner", "🌆"],
    ["Dubai: Burj Khalifa", "At the Top · Dubai Mall · fountain show", "🏙"],
    ["Dubai: Old Dubai", "Spice Souk · Al Fahidi · Abra · Gold Souk", "🕌"],
    ["Desert Safari", "Dune bashing · BBQ under stars · camel ride", "🐪"],
    ["Abu Dhabi: Sheikh Zayed Mosque", "Grand Mosque tour · architecture tour", "🕌"],
    ["Abu Dhabi: Louvre & Corniche", "Art museum · waterfront promenade", "🎨"],
    ["Abu Dhabi: Yas Island", "Ferrari World · Yas Marina Circuit", "🏎"],
  ],
};

function PhotoPlaceholder({ gradient, emoji, aspectClass = "aspect-[16/9]" }: { gradient: string; emoji: string; aspectClass?: string }) {
  return (
    <div className={`${aspectClass} w-full overflow-hidden rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
      <span className="text-3xl opacity-70">{emoji}</span>
    </div>
  );
}

type RowProps = {
  label: string;
  sublabel?: string;
  icon: string;
  iconBg: string;
  isLast?: boolean;
  children: React.ReactNode;
  delay?: number;
};

function TimelineRow({ label, sublabel, icon, iconBg, isLast = false, children, delay = 0 }: RowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="flex gap-0"
    >
      {/* Left: date / label column */}
      <div className="w-[88px] shrink-0 pt-1.5 pr-3 text-right">
        <p className="text-[11px] font-semibold text-ink/55 leading-tight">{label}</p>
        {sublabel && <p className="text-[10px] text-ink/35 leading-tight mt-0.5">{sublabel}</p>}
      </div>

      {/* Center: icon + vertical line */}
      <div className="relative flex w-10 shrink-0 flex-col items-center">
        <div
          className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base text-white shadow-sm ${iconBg}`}
        >
          {icon}
        </div>
        {!isLast && (
          <div className="absolute top-9 bottom-0 left-1/2 w-px -translate-x-1/2 bg-black/[0.07]" />
        )}
      </div>

      {/* Right: card content */}
      <div className="flex-1 pb-5 pl-3 pr-1">
        {children}
      </div>
    </motion.div>
  );
}

export default function ItineraryTimeline({ planState }: ItineraryTimelineProps) {
  const dest = planState.destination ?? "dubai";
  const duration = planState.duration ?? 7;
  const travelers = planState.travelers ?? 2;
  const acc = planState.accommodation ?? "hotel";
  const style = planState.travelStyle ?? "balanced";
  const transport = planState.transport ?? "mixed";

  const destData = DESTINATION_DATA[dest];
  const accData = ACCOMMODATION_DATA[acc];
  const budget = calculateBudget(style, duration, travelers, acc, transport, dest);
  const nightlyRate = Math.round(budget.breakdown.accommodation / duration / travelers);
  const starCount = style === "luxury" ? 5 : style === "balanced" ? 4 : style === "budget" ? 3 : 2;

  const startMonthStr = planState.startDate
    ? planState.startDate.toLocaleString("default", { month: "short", year: "numeric" })
    : "Dec 2026";

  const experiences = EXPERIENCE_BANKS[dest] ?? EXPERIENCE_BANKS["dubai"];
  const dayCount = Math.min(duration, experiences.length);

  const cityLabels = dest === "both" ? ["Dubai", "Abu Dhabi"] : [destData.name];

  return (
    <div className="space-y-3">
      {/* Trip header */}
      <div className="rounded-2xl border border-black/[0.08] bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-[family-name:var(--font-anton)] text-[1.15rem] uppercase leading-tight text-ink">
              {duration}-Day {destData.name} Experience
            </h3>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-ink/50">
              <span>🗓 {duration} days</span>
              <span>🏙 {cityLabels.length} {cityLabels.length === 1 ? "city" : "cities"}</span>
              <span>👥 {travelers} {travelers === 1 ? "traveller" : "travellers"}</span>
              <span>🌟 {style}</span>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-black/10 px-2 py-0.5 text-[10px] font-semibold text-ink/50">
            ${budget.total.toLocaleString()} est.
          </span>
        </div>
        <div className="mt-3 flex gap-2">
          {cityLabels.map((c, i) => (
            <span
              key={c}
              className="flex items-center gap-1.5 rounded-full border border-black/10 px-2.5 py-1 text-xs font-semibold text-ink/70"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[9px] text-white font-bold">
                {i + 1}
              </span>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* ── Timeline ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-black/[0.08] bg-white p-4 shadow-sm">
        {/* Days header row */}
        <TimelineRow
          label={`Days 1–${duration}`}
          sublabel={startMonthStr}
          icon="📍"
          iconBg="bg-ink"
          delay={0.05}
        >
          <div className="rounded-xl border border-black/[0.06] bg-surface p-3">
            <p className="font-semibold text-ink text-sm">{destData.name}</p>
            <p className="mt-0.5 text-xs text-ink/50">{destData.tagline}</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <PhotoPlaceholder gradient={PHOTO_GRADIENTS[0]} emoji="🌆" aspectClass="aspect-[4/3]" />
              <PhotoPlaceholder gradient={PHOTO_GRADIENTS[1]} emoji="🏙" aspectClass="aspect-[4/3]" />
            </div>
          </div>
        </TimelineRow>

        {/* Arrive */}
        <TimelineRow
          label="Arrive"
          sublabel={`${startMonthStr} · Day 1`}
          icon="✈"
          iconBg="bg-ink"
          delay={0.1}
        >
          <div className="rounded-xl border border-black/[0.06] p-3">
            <div className="flex items-center justify-between">
              <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">Emirates</span>
              <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-ink/50">Economy</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm font-semibold text-ink">
              <span>Origin</span>
              <div className="flex flex-1 flex-col items-center text-[10px] text-ink/40 font-normal">
                <span className="text-xs">✈ Non-stop</span>
                <div className="mt-0.5 h-px w-16 bg-black/10" />
              </div>
              <span>DXB</span>
            </div>
          </div>
        </TimelineRow>

        {/* Transfer */}
        <TimelineRow
          label="Transfer"
          sublabel="Day 1"
          icon="🚗"
          iconBg="bg-slate-600"
          delay={0.15}
        >
          <div className="flex gap-3 rounded-xl border border-black/[0.06] p-3">
            <PhotoPlaceholder gradient="from-slate-400 to-slate-600" emoji="🚗" aspectClass="aspect-square w-16 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink leading-snug">
                Airport → Hotel Transfer
              </p>
              <p className="mt-0.5 text-[10px] text-ink/50">
                {transport === "metro" ? "Metro + taxi · ~45 min" : "Private Careem · ~45 min"}
              </p>
              <p className="mt-1.5 text-sm font-bold text-orange">
                {transport === "metro" ? "AED 20" : "AED 75"}
                <span className="ml-1 text-[10px] font-normal text-ink/40">/person</span>
              </p>
            </div>
          </div>
        </TimelineRow>

        {/* Stay */}
        <TimelineRow
          label="Stay"
          sublabel={`${duration - 1} nights`}
          icon="🏨"
          iconBg="bg-orange"
          delay={0.2}
        >
          <div className="rounded-xl border border-black/[0.06] overflow-hidden">
            <PhotoPlaceholder gradient={PHOTO_GRADIENTS[4]} emoji="🏨" aspectClass="aspect-[16/7]" />
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-ink">{accData.name} — {destData.name}</p>
                  <p className="text-[10px] text-ink/50 mt-0.5">{accData.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-orange">${nightlyRate}</p>
                  <p className="text-[10px] text-ink/40">/night</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-amber-500">{"★".repeat(starCount)}</span>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  {accData.dubaiAreas?.[0] ?? destData.name}
                </span>
              </div>
            </div>
          </div>
        </TimelineRow>

        {/* Day-by-day itinerary rows */}
        {experiences.slice(0, dayCount).map(([title, detail, emoji], i) => (
          <TimelineRow
            key={i}
            label="Itinerary"
            sublabel={`Day ${i + 1}`}
            icon="📅"
            iconBg="bg-orange/80"
            isLast={i === dayCount - 1}
            delay={0.25 + i * 0.04}
          >
            <div className="flex gap-3 rounded-xl border border-black/[0.06] p-3 transition hover:border-orange/20 hover:bg-orange/[0.02]">
              <PhotoPlaceholder
                gradient={PHOTO_GRADIENTS[i % PHOTO_GRADIENTS.length]}
                emoji={emoji}
                aspectClass="aspect-square w-14 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-orange/10 px-2 py-0.5 text-[10px] font-semibold text-orange">
                    Day {i + 1}
                  </span>
                  <span className="text-[10px] text-ink/40">· {Math.floor(Math.random() * 3) + 2} Experiences</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-ink leading-snug">{title}</p>
                <p className="mt-0.5 text-[10px] text-ink/45 leading-snug">{detail}</p>
              </div>
            </div>
          </TimelineRow>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between rounded-2xl border border-black/[0.08] bg-white px-4 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink/40">Total estimate</p>
          <p className="font-[family-name:var(--font-anton)] text-xl text-ink">
            ${budget.total.toLocaleString()}
          </p>
          <p className="text-[10px] text-ink/40">${budget.perPerson.toLocaleString()} per person</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-ink/40">Daily avg.</p>
          <p className="text-sm font-bold text-orange">${budget.dailyAverage}/day</p>
        </div>
      </div>
    </div>
  );
}
