"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { whatsOnPosts, type PostKind, type WhatsOnPost } from "@/data/whatsOn";

/* ── Tokens (Kenz Dubai 101 style) ─────────────────────────────── */
const C = {
  orange: "#FF7A22",
  orangeDeep: "#E0600B",
  cream: "#F3EFE6",
  stub: "#EFE7D8",
  navy: "#14192B",
  muted: "#5D6273",
  line: "rgba(20,25,43,0.10)",
  teal: "#0E7A67",
  tealBg: "#E2F2EC",
};
const serif = "var(--font-fraunces), Georgia, 'Times New Roman', serif";
const sans = "var(--font-dmsans), system-ui, -apple-system, sans-serif";

/* ── Dubai time helpers (UTC+4, no DST) ────────────────────────── */
const DAY = 86_400_000;
const OFFSET = 4 * 3_600_000;
const startOfDubaiDay = (t: number) => Math.floor((t + OFFSET) / DAY) * DAY - OFFSET;
const dubaiWeekday = (t: number) => new Date(t + OFFSET).getUTCDay(); // 0 Sun … 6 Sat
const fmtDay = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", weekday: "short", day: "numeric" });
const fmtDate = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", weekday: "short", day: "numeric", month: "short" });
const fmtShort = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", day: "numeric", month: "short" });

type RangeKey = "today" | "weekend" | "week" | "custom";
type Range = { start: number; end: number };

function weekendRange(now: number): Range {
  const today = startOfDubaiDay(now);
  const wd = dubaiWeekday(now);
  const sat = wd === 6 ? today : wd === 0 ? today - DAY : today + (6 - wd) * DAY;
  return { start: sat, end: sat + 2 * DAY - 1 };
}

function rangeFor(key: RangeKey, now: number, from: string, to: string): Range {
  if (key === "today") return { start: now, end: startOfDubaiDay(now) + DAY - 1 };
  if (key === "weekend") return weekendRange(now);
  if (key === "week") return { start: now, end: now + 7 * DAY };
  const s = from ? Date.parse(`${from}T00:00:00+04:00`) : now;
  const e = to ? Date.parse(`${to}T23:59:59+04:00`) : s + DAY - 1;
  return { start: Math.max(s, now), end: Math.max(e, s) };
}

/* ── Search: keywords plus "under AED 200" ─────────────────────── */
const STOP = new Set(
  "where what which when who how do does can i me my we the a an in on at to for of and or with near is are be go get find best good some any locals local dubai aed under below less than cheap".split(
    " ",
  ),
);

function parseQuery(q: string) {
  const m = q.match(/(?:under|below|less than)\s*(?:aed|dhs|dh)?\s*(\d+)/i);
  const maxPrice = m ? Number(m[1]) : null;
  const terms = q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w) && !/^\d+$/.test(w))
    .map((w) => w.replace(/(es|s)$/, ""));
  return { maxPrice, terms };
}

function searchScore(p: WhatsOnPost, terms: string[]) {
  const hay = `${p.title} ${p.body} ${p.tip ?? ""} ${p.area} ${p.kinds.join(" ")}`.toLowerCase();
  return terms.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0);
}

/* ── Vouches, remembered per viewer ─────────────────────────────── */
const VOUCH_KEY = "kenz:whats-on:vouched";
function readVouched(): string[] {
  try {
    const raw = localStorage.getItem(VOUCH_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
function writeVouched(ids: string[]) {
  try {
    localStorage.setItem(VOUCH_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable: vouch still shows for this visit */
  }
}

const KIND_FILTERS: { key: "all" | PostKind; label: string }[] = [
  { key: "all", label: "All" },
  { key: "offer", label: "Offers" },
  { key: "food", label: "Food" },
  { key: "event", label: "Events" },
  { key: "do", label: "Things to do" },
];

const EXAMPLE_QUERY = "where do locals brunch under AED 200?";

export default function WhatsOnFeed() {
  const [now, setNow] = useState<number | null>(null);
  const [rangeKey, setRangeKey] = useState<RangeKey>("weekend");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [kind, setKind] = useState<"all" | PostKind>("all");
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [vouched, setVouched] = useState<string[]>([]);

  // Time-dependent content is computed in the browser, not at build time,
  // so expired posts drop off even though the site is statically exported.
  useEffect(() => {
    const first = window.setTimeout(() => {
      setNow(Date.now());
      setVouched(readVouched());
    }, 0);
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  const toggleVouch = (id: string) => {
    setVouched((prev) => {
      const next = prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
      writeVouched(next);
      return next;
    });
  };

  const range = now ? rangeFor(rangeKey, now, from, to) : null;

  const posts = useMemo(() => {
    if (!now || !range) return [];
    const { maxPrice, terms } = parseQuery(query);
    return whatsOnPosts
      .filter((p) => !p.endsAt || Date.parse(p.endsAt) > now) // expired comes off
      .filter((p) => {
        const s = p.startsAt ? Date.parse(p.startsAt) : -Infinity;
        const e = p.endsAt ? Date.parse(p.endsAt) : Infinity;
        return s <= range.end && e >= range.start;
      })
      .filter((p) => kind === "all" || p.kinds.includes(kind))
      .filter((p) => {
        if (maxPrice === null) return true;
        if (!p.price) return false;
        return p.price.amount === null || p.price.amount <= maxPrice;
      })
      .map((p) => ({ p, score: terms.length ? searchScore(p, terms) : 0 }))
      .filter(({ score }) => !terms.length || score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        // Soonest-ending first: those are the ones you can miss.
        const ae = a.p.endsAt ? Date.parse(a.p.endsAt) : Infinity;
        const be = b.p.endsAt ? Date.parse(b.p.endsAt) : Infinity;
        return ae - be;
      })
      .map(({ p }) => p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, rangeKey, from, to, kind, query]);

  const weekendLabel = now
    ? (() => {
        const w = weekendRange(now);
        return `${fmtDay.format(w.start)} – ${fmtDay.format(w.end)}`;
      })()
    : "This weekend";

  const rangeChips: { key: RangeKey; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "weekend", label: weekendLabel },
    { key: "week", label: "Next 7 days" },
    { key: "custom", label: "Pick dates" },
  ];

  return (
    <div className="min-h-screen md:flex" style={{ background: C.cream, color: C.navy, fontFamily: sans }}>
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-8 lg:px-12 lg:pt-12">
        <div className="mx-auto max-w-[1100px]">
          {/* Title + dates */}
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <h1
              className="text-[2.6rem] font-bold leading-[0.95] tracking-[-0.035em] sm:whitespace-nowrap sm:text-[3.6rem] lg:text-[4.2rem]"
              style={{ fontFamily: sans }}
            >
              What’s on <span className="font-normal">in Dubai</span>
            </h1>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0" role="group" aria-label="Dates">
              {rangeChips.map((c) => (
                <Chip key={c.key} active={rangeKey === c.key} onClick={() => setRangeKey(c.key)} dashed={c.key === "custom"}>
                  {c.label}
                </Chip>
              ))}
            </div>
          </div>

          {rangeKey === "custom" && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm" style={{ color: C.muted }}>
              <label className="flex items-center gap-2">
                From
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="rounded-lg border bg-white px-3 py-2 text-[15px]"
                  style={{ borderColor: C.line, color: C.navy }}
                />
              </label>
              <label className="flex items-center gap-2">
                To
                <input
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(e) => setTo(e.target.value)}
                  className="rounded-lg border bg-white px-3 py-2 text-[15px]"
                  style={{ borderColor: C.line, color: C.navy }}
                />
              </label>
            </div>
          )}

          {/* Search + kinds */}
          <div className="mt-7 flex flex-col gap-3 xl:flex-row xl:items-center">
            <form
              className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border bg-white py-2 pl-4 pr-2"
              style={{ borderColor: C.line }}
              onSubmit={(e) => {
                e.preventDefault();
                setQuery(draft.trim());
              }}
              role="search"
            >
              <SearchIcon />
              <input
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  if (!e.target.value) setQuery("");
                }}
                placeholder={`Try “${EXAMPLE_QUERY}”`}
                aria-label="Search what's on"
                className="min-w-0 flex-1 bg-transparent py-2 text-[16px] outline-none placeholder:text-[#8A8E9A]"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl px-5 py-2.5 text-[15px] font-semibold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ background: C.orange, outlineColor: C.navy }}
              >
                Ask
              </button>
            </form>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0" role="group" aria-label="Type">
              {KIND_FILTERS.map((k) => (
                <Chip key={k.key} active={kind === k.key} onClick={() => setKind(k.key)}>
                  {k.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Feed */}
          <section className="mt-8 flex flex-col gap-6" aria-live="polite">
            {now === null ? (
              <p className="py-16 text-center" style={{ color: C.muted }}>
                Loading what’s on…
              </p>
            ) : whatsOnPosts.length === 0 ? (
              <LaunchState />
            ) : posts.length === 0 ? (
              <EmptyState
                query={query}
                onClear={() => {
                  setQuery("");
                  setDraft("");
                  setKind("all");
                  setRangeKey("week");
                }}
              />
            ) : (
              posts.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  now={now}
                  vouched={vouched.includes(p.id)}
                  onVouch={() => toggleVouch(p.id)}
                />
              ))
            )}
          </section>

          {now !== null && posts.length > 0 && (
            <p className="mt-10 text-center text-sm" style={{ color: C.muted }}>
              Offers come off the moment they end. Every post is from someone who lives here.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Sidebar ───────────────────────────────────────────────────── */
function Sidebar() {
  const items = [
    { href: "/whats-on", label: "What’s On", active: true },
    { href: "/planner", label: "Itineraries", active: false },
    { href: "/", label: "Home", active: false },
  ];
  return (
    <aside
      className="flex items-center justify-between gap-4 border-b bg-white px-4 py-3 md:sticky md:top-0 md:h-screen md:w-[240px] md:shrink-0 md:flex-col md:items-stretch md:justify-start md:border-b-0 md:border-r md:px-5 md:py-10 lg:w-[280px]"
      style={{ borderColor: C.line }}
    >
      <Link href="/" className="flex flex-col gap-1">
        <span className="relative flex items-center">
          <Image src="/brand/kenz-mark-v2.png" alt="" width={30} height={30} className="object-contain" />
          <span className="-ml-1 text-[1.6rem] font-bold lowercase leading-none tracking-[-0.03em]" style={{ color: C.orange }}>
            enz
          </span>
          <span className="sr-only">Kenz</span>
        </span>
        <span className="hidden text-[1.05rem] italic md:block" style={{ fontFamily: serif }}>
          Dubai the way locals do
        </span>
      </Link>
      <nav className="flex gap-1 md:mt-10 md:flex-col">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            aria-current={it.active ? "page" : undefined}
            className={`rounded-xl px-3 py-2 text-[14px] font-medium transition-colors md:px-4 md:py-3 md:text-[16px] ${
              it.active ? "text-white" : "hover:bg-black/[0.04]"
            } ${it.label === "Home" ? "hidden md:block" : ""}`}
            style={it.active ? { background: C.navy } : { color: C.muted }}
          >
            {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

/* ── Post card with ticket stub ────────────────────────────────── */
function PostCard({
  post: p,
  now,
  vouched,
  onVouch,
}: {
  post: WhatsOnPost;
  now: number;
  vouched: boolean;
  onVouch: () => void;
}) {
  const postedDays = Math.max(0, Math.floor((startOfDubaiDay(now) - Date.parse(`${p.postedOn}T00:00:00+04:00`)) / DAY));
  const posted = postedDays === 0 ? "Today" : postedDays === 1 ? "Yesterday" : `${postedDays} days ago`;
  const vouchCount = p.vouches + (vouched ? 1 : 0);

  return (
    <article className="relative isolate grid overflow-visible rounded-[28px] bg-white lg:grid-cols-[minmax(0,1fr)_300px]">
      {/* Main */}
      <div className="relative min-w-0 p-5 sm:p-8">
        <header className={`flex items-center gap-3 ${p.badge ? "pr-16 sm:pr-24 lg:pr-10" : ""}`}>
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg font-bold text-white"
            style={{ background: avatarColor(p.author.name) }}
            aria-hidden="true"
          >
            {p.author.name[0]}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[17px] font-semibold">{p.author.name}</span>
              <span className="rounded-md px-2 py-0.5 text-[13px] font-semibold" style={{ background: C.tealBg, color: C.teal }}>
                Local, {p.author.yearsInDubai} yrs in Dubai
              </span>
            </div>
            <span className="text-[14px]" style={{ color: C.muted }}>
              {posted}
            </span>
          </div>
        </header>

        {p.badge && (
          <span
            className="absolute right-4 top-4 z-10 grid h-[64px] w-[64px] rotate-[8deg] place-items-center rounded-full text-center font-bold leading-none text-white shadow-[0_10px_30px_rgba(255,122,34,0.35)] sm:h-[104px] sm:w-[104px] lg:-right-6 lg:-top-6"
            style={{ background: C.orange, fontFamily: serif, fontSize: p.badge.length > 5 ? "0.95rem" : "1.45rem" }}
          >
            {p.badge}
          </span>
        )}

        <h2
          className="mt-5 max-w-[30ch] text-[1.6rem] font-bold leading-[1.12] tracking-[-0.015em] sm:text-[2.05rem] lg:pr-10"
          style={{ fontFamily: serif }}
        >
          {p.title}
        </h2>
        <p className="mt-2 max-w-[62ch] text-[1.08rem] leading-[1.6]" style={{ fontFamily: serif, color: "#3C4152" }}>
          {p.body} {p.tip && <em>{p.tip}</em>}
        </p>

        {p.image ? (
          <div className="relative mt-5 aspect-[16/8] overflow-hidden rounded-2xl">
            <Image src={p.image} alt={p.imageAlt ?? p.title} fill className="object-cover" sizes="(min-width:1024px) 700px, 100vw" />
            <AreaPill area={p.area} overlay />
          </div>
        ) : (
          <div className="mt-4">
            <AreaPill area={p.area} />
          </div>
        )}
      </div>

      {/* Stub */}
      <div
        className="relative flex flex-col gap-4 rounded-b-[28px] border-t-2 border-dashed p-5 sm:p-7 lg:rounded-b-none lg:rounded-r-[28px] lg:border-l-2 lg:border-t-0"
        style={{ background: C.stub, borderColor: "rgba(224,96,11,0.35)" }}
      >
        <Notches />
        <Price post={p} />
        <TimeLeft post={p} now={now} />

        <div className="mt-auto flex flex-col gap-3 pt-2">
          {vouchCount > 0 && (
            <p className="flex items-center gap-2 text-[15px]" style={{ fontFamily: serif }}>
              <CheckIcon color={C.teal} />
              <span>
                <strong>
                  {vouchCount} {vouchCount === 1 ? "local" : "locals"}
                </strong>{" "}
                vouch for it
              </span>
            </p>
          )}
          {p.checkedOn && (
            <p className="text-[13px]" style={{ color: C.muted }}>
              Checked by Kenz on {fmtShort.format(Date.parse(`${p.checkedOn}T12:00:00+04:00`))}
            </p>
          )}

          {p.bookingUrl ? (
            <a
              href={p.bookingUrl}
              target="_blank"
              rel="noopener sponsored"
              className="flex items-center justify-center gap-2 rounded-xl py-3.5 text-[16px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ background: C.navy, fontFamily: serif, outlineColor: C.orange }}
            >
              <ExternalIcon />
              {p.bookingLabel ?? "Book"}
            </a>
          ) : p.howToGo ? (
            <p className="rounded-xl border px-4 py-3 text-[14px] leading-snug" style={{ borderColor: C.line, background: "#FBF8F2" }}>
              {p.howToGo}
            </p>
          ) : (
            <p className="rounded-xl border px-4 py-3 text-center text-[14px]" style={{ borderColor: C.line, color: C.muted }}>
              Booking link coming soon
            </p>
          )}

          <button
            type="button"
            onClick={onVouch}
            aria-pressed={vouched}
            className="flex items-center justify-center gap-2 rounded-xl border py-3 text-[16px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              fontFamily: serif,
              borderColor: vouched ? C.teal : "rgba(20,25,43,0.18)",
              background: vouched ? C.tealBg : "transparent",
              color: vouched ? C.teal : C.navy,
              outlineColor: C.orange,
            }}
          >
            <CheckIcon color={vouched ? C.teal : C.navy} />
            {vouched ? "You vouched" : "Vouch"}
          </button>
        </div>
      </div>
    </article>
  );
}

function Price({ post: p }: { post: WhatsOnPost }) {
  if (!p.price && !p.priceNote) return null;
  return (
    <div style={{ fontFamily: serif }}>
      <p className="text-[15px] font-semibold" style={{ color: "#7A6A55" }}>
        {p.price ? capitalise(p.price.unit) : "Price"}
      </p>
      {p.price?.was && (
        <p className="mt-2 text-[15px] line-through" style={{ color: "#8C7F6E" }}>
          AED {p.price.was.toLocaleString("en-US")}
        </p>
      )}
      <p className="mt-1 text-[2.6rem] font-bold leading-none tracking-[-0.02em] sm:text-[3rem]">
        {p.price ? (
          p.price.amount === null ? (
            "Free"
          ) : (
            <>
              {p.price.prefix && <span className="mr-2 text-[1.1rem] font-semibold">{p.price.prefix}</span>}
              AED {p.price.amount.toLocaleString("en-US")}
            </>
          )
        ) : (
          <span className="text-[1.8rem]">{p.priceNote}</span>
        )}
      </p>
    </div>
  );
}

function TimeLeft({ post: p, now }: { post: WhatsOnPost; now: number }) {
  if (!p.endsAt) {
    return (
      <p className="text-[15px]" style={{ fontFamily: serif, color: "#7A6A55" }}>
        Ongoing, no end date
      </p>
    );
  }
  const end = Date.parse(p.endsAt);
  const start = p.startsAt ? Date.parse(p.startsAt) : Date.parse(`${p.postedOn}T00:00:00+04:00`);
  const left = end - now;
  const days = Math.ceil(left / DAY);
  const total = Math.max(end - start, DAY);
  const segs = 18;
  const filled = Math.max(1, Math.round((left / total) * segs));
  const label = left < DAY ? "Ends today" : `${days} ${days === 1 ? "day" : "days"}`;
  return (
    <div style={{ fontFamily: serif }}>
      <p className="text-[15px] font-semibold" style={{ color: "#7A6A55" }}>
        Time left
      </p>
      <div className="mt-2 flex gap-[3px]" aria-hidden="true">
        {Array.from({ length: segs }, (_, i) => (
          <span
            key={i}
            className="h-[6px] flex-1 rounded-full"
            style={{ background: i < filled ? C.orange : "rgba(20,25,43,0.12)" }}
          />
        ))}
      </div>
      <p className="mt-2">
        <span className="text-[1.6rem] font-bold">{label}</span>
        <span className="ml-2 text-[14px]" style={{ color: "#7A6A55" }}>
          ends {fmtDate.format(end)}
        </span>
      </p>
    </div>
  );
}

function AreaPill({ area, overlay = false }: { area: string; overlay?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[14px] font-medium ${
        overlay ? "absolute bottom-4 left-4 text-white" : ""
      }`}
      style={overlay ? { background: "rgba(20,25,43,0.78)" } : { background: C.cream, color: C.navy }}
    >
      <PinIcon />
      {area}
    </span>
  );
}

function LaunchState() {
  return (
    <div className="rounded-[28px] bg-white px-6 py-16 text-center">
      <p className="text-[1.7rem] font-bold" style={{ fontFamily: serif }}>
        The first posts are on their way
      </p>
      <p className="mx-auto mt-2 max-w-[46ch] leading-relaxed" style={{ color: C.muted }}>
        Locals are checking offers and events for this week. Until they’re up, ask one of us directly.
      </p>
      <Link
        href="/chat"
        className="mt-6 inline-block rounded-xl px-6 py-3 font-semibold text-white"
        style={{ background: C.orange }}
      >
        Ask a local
      </Link>
    </div>
  );
}

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="rounded-[28px] bg-white px-6 py-14 text-center">
      <p className="text-[1.5rem] font-bold" style={{ fontFamily: serif }}>
        {query ? `Nothing posted for “${query}” yet` : "Nothing posted for these dates yet"}
      </p>
      <p className="mx-auto mt-2 max-w-[46ch]" style={{ color: C.muted }}>
        Widen the dates or clear the filters. Or ask a local directly and we’ll find you an answer.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border px-5 py-3 font-semibold"
          style={{ borderColor: "rgba(20,25,43,0.18)" }}
        >
          Show everything this week
        </button>
        <Link href="/chat" className="rounded-xl px-5 py-3 font-semibold text-white" style={{ background: C.orange }}>
          Ask a local
        </Link>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  dashed = false,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dashed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-[15px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        dashed && !active ? "border-dashed" : ""
      }`}
      style={{
        border: `1px ${dashed && !active ? "dashed" : "solid"} ${active ? C.navy : C.line}`,
        background: active ? C.navy : "#fff",
        color: active ? "#fff" : C.navy,
        outlineColor: C.orange,
      }}
    >
      {children}
    </button>
  );
}

/* Ticket-stub notches where the dashed tear line meets the card edge */
function Notches() {
  return (
    <>
      <span className="absolute -left-[13px] -top-[13px] hidden h-[26px] w-[26px] rounded-full lg:block" style={{ background: C.cream }} />
      <span className="absolute -bottom-[13px] -left-[13px] hidden h-[26px] w-[26px] rounded-full lg:block" style={{ background: C.cream }} />
    </>
  );
}

/* ── Small helpers & icons ─────────────────────────────────────── */
function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function avatarColor(name: string) {
  const palette = [C.orange, C.teal, "#3B4A8C", "#B4462E"];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
}
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ExternalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2.2" aria-hidden="true">
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
