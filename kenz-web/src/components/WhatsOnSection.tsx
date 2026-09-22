"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookmarkSimple,
  CalendarBlank,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  Compass,
  ForkKnife,
  MagnifyingGlass,
  MapPin,
  Newspaper,
  Plus,
  Ticket,
  X,
} from "@phosphor-icons/react";
import KenzLogo from "./ui/KenzLogo";
import { ProtectedPlannerLink } from "./ProtectedPlannerLink";
import { loginPageUrl } from "@/lib/auth";
import { useAuth } from "./AuthProvider";
import { HERO_QUERY_KEY } from "./Hero";
import {
  DUMMY_OFFERS,
  EVENTS,
  type DubaiEvent,
  type EventFilter,
} from "@/data/discover";
import {
  MOCK_PLACES,
  fetchPlaces,
  isExploreConfigured,
  searchPlaces,
  stockPlaceImage,
  type ExplorePlace,
} from "@/lib/exploreApi";

const RAIL = [
  { href: "/#whats-on", label: "What's On", icon: Newspaper },
  { href: "/#itineraries", label: "Itineraries", icon: Compass },
  { href: "/#dubai-101", label: "Dubai 101", icon: BookmarkSimple },
] as const;

const FILTERS: { id: "all" | EventFilter; label: string; icon?: typeof Ticket }[] = [
  { id: "all", label: "All" },
  { id: "offers", label: "Offers", icon: Ticket },
  { id: "food", label: "Food", icon: ForkKnife },
  { id: "events", label: "Events", icon: CalendarBlank },
];

const LOCAL_POSTS_KEY = "kenz_whats_on_posts";
const PREVIEW_COUNT = 3;

type DateMode = "today" | "week" | "pick";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number) {
  const x = startOfDay(d);
  x.setDate(x.getDate() + n);
  return x;
}

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYmd(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return startOfDay(new Date(y, m - 1, d));
}

function formatChip(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function overlaps(post: DubaiEvent, from: Date, to: Date) {
  if (!post.startsOn && !post.endsOn) return true;
  const start = post.startsOn ? parseYmd(post.startsOn) : new Date(2000, 0, 1);
  const end = post.endsOn ? parseYmd(post.endsOn) : new Date(2099, 11, 31);
  return start <= to && end >= from;
}

function placeToPost(place: ExplorePlace, filter: EventFilter, index = 0): DubaiEvent {
  const rating = place.rating ? `${place.rating.toFixed(1)}★ on Google` : "Listed on Google";
  const livePhoto = [place.photos?.[0], place.image].find(
    (src) => src && !src.includes("loremflickr") && !src.includes("placehold") && src.includes("places.googleapis.com"),
  );
  const stock = stockPlaceImage(
    `${place.name}-${index}`,
    place.category === "all" ? (filter === "food" ? "restaurants" : "museums") : place.category,
  );
  return {
    id: `g-${place.id}`,
    title: place.name,
    blurb: place.address || "Dubai",
    category: filter === "food" ? "food" : "culture",
    filter,
    dateLabel: place.openNow ? "Open now" : place.categoryLabel,
    timeLabel: rating,
    venue: place.name,
    area: place.address?.split(",").slice(-2).join(",").trim() || "Dubai",
    price: rating,
    aed: 0,
    priceUnit: place.openNow ? "Open now" : "Google",
    vouches: Math.max(12, Math.round((place.rating ?? 4) * 40)),
    author: "Google Places",
    authorInitial: "G",
    localYears: 0,
    postedAgo: place.categoryLabel,
    image: filter === "food" ? stock : livePhoto ?? stock,
    imageAlt: place.name,
    localTip: place.openNow ? "Open now — go before the office crowd." : rating,
    bookHref: place.googleMapsUri || place.website,
    source: "google",
  };
}

function readLocalPosts(): DubaiEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_POSTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DubaiEvent[];
  } catch {
    return [];
  }
}

export default function WhatsOnSection() {
  const { user } = useAuth();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [dateMode, setDateMode] = useState<DateMode>("today");
  const [pickedRange, setPickedRange] = useState<{ from: Date; to: Date }>({ from: today, to: addDays(today, 6) });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | EventFilter>("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [postOpen, setPostOpen] = useState(false);
  const [userPosts, setUserPosts] = useState<DubaiEvent[]>([]);
  const [googleFood, setGoogleFood] = useState<DubaiEvent[]>([]);
  const [googleEvents, setGoogleEvents] = useState<DubaiEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [vouches, setVouches] = useState<Record<string, number>>({});
  const [vouched, setVouched] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const id = window.setTimeout(() => setUserPosts(readLocalPosts()), 0);
    return () => window.clearTimeout(id);
  }, []);

  const range =
    dateMode === "today"
      ? { from: today, to: today }
      : dateMode === "week"
        ? { from: today, to: addDays(today, 6) }
        : pickedRange;

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), 400);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    const needFood = filter === "food" || filter === "all";
    const needEvents = filter === "events" || filter === "all";
    if (!needFood && !needEvents) return;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const liveQ = debouncedQuery.trim();
        const [foodPlaces, eventPlaces] = await Promise.all([
          needFood
            ? isExploreConfigured()
              ? filter === "food" && liveQ
                ? searchPlaces(liveQ, "dubai")
                : fetchPlaces("dubai", "restaurants")
              : Promise.resolve(MOCK_PLACES.filter((p) => p.category === "restaurants" || p.category === "cafes"))
            : Promise.resolve([] as ExplorePlace[]),
          needEvents
            ? isExploreConfigured()
              ? searchPlaces(liveQ || "events concerts festivals Dubai", "dubai")
              : Promise.resolve(MOCK_PLACES.filter((p) => p.category === "museums" || p.category === "parks"))
            : Promise.resolve([] as ExplorePlace[]),
        ]);

        if (cancelled) return;
        if (needFood) setGoogleFood(foodPlaces.map((p, i) => placeToPost(p, "food", i)));
        if (needEvents) setGoogleEvents(eventPlaces.map((p, i) => placeToPost(p, "events", i)));
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Could not load live listings.");
          if (needFood) {
            setGoogleFood(
              MOCK_PLACES.filter((p) => p.category === "restaurants" || p.category === "cafes").map((p, i) =>
                placeToPost(p, "food", i),
              ),
            );
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [filter, debouncedQuery]);

  const pickLabel =
    dateMode === "pick" ? `${formatChip(range.from)} – ${formatChip(range.to)}` : "Pick dates";

  const pool = useMemo(() => {
    const curated = [
      ...userPosts,
      ...DUMMY_OFFERS,
      ...EVENTS.filter((e) => e.filter !== "offers" || !DUMMY_OFFERS.some((o) => o.id === e.id)),
    ];
    if (filter === "offers") return curated.filter((e) => e.filter === "offers");
    if (filter === "food") return [...curated.filter((e) => e.filter === "food"), ...googleFood];
    if (filter === "events") return [...curated.filter((e) => e.filter === "events"), ...googleEvents];
    return [...curated, ...googleFood, ...googleEvents];
  }, [filter, googleEvents, googleFood, userPosts]);

  const posts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pool.filter((e) => {
      if (!overlaps(e, range.from, range.to)) return false;
      if (!q) return true;
      return `${e.title} ${e.blurb} ${e.area} ${e.author} ${e.localTip}`.toLowerCase().includes(q);
    });
  }, [pool, query, range.from, range.to]);

  const handleAsk = () => {
    const prompt = query.trim() || "Where do locals brunch under AED 200?";
    if (filter === "food" || filter === "events") {
      setQuery(prompt);
      return;
    }
    sessionStorage.setItem(HERO_QUERY_KEY, prompt);
    window.location.href = user ? "/planner" : loginPageUrl("signup", "/planner");
  };

  const onVouch = (id: string) => {
    setVouched((prev) => {
      const next = !prev[id];
      setVouches((v) => ({
        ...v,
        [id]: (v[id] ?? posts.find((p) => p.id === id)?.vouches ?? 0) + (next ? 1 : -1),
      }));
      return { ...prev, [id]: next };
    });
  };

  const savePost = (post: DubaiEvent) => {
    const next = [post, ...readLocalPosts()];
    localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(next));
    setUserPosts(next);
    setPostOpen(false);
    setFilter(post.filter);
  };

  return (
    <section id="whats-on" className="scroll-mt-24 bg-[#f4f0e8]">
      <div className="mx-auto flex max-w-[1400px] md:px-4 md:py-10">
        <aside className="sticky top-24 hidden h-fit w-[220px] shrink-0 flex-col rounded-l-[1.75rem] border-r border-black/[0.06] bg-white px-4 py-8 lg:flex">
          <div className="px-2">
            <KenzLogo href="/" size={40} />
            <p className="mt-2 text-[12px] font-medium text-ink/45">Dubai the way locals do</p>
          </div>
          <nav className="mt-10 flex flex-col gap-1" aria-label="On this page">
            {RAIL.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/#whats-on";
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[#1a1f2b] text-white"
                      : "text-ink/55 hover:bg-black/[0.04] hover:text-ink"
                  }`}
                >
                  <Icon size={16} weight={active ? "fill" : "regular"} />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 rounded-r-[1.75rem] bg-[#f7f4ef] px-4 py-8 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <h2 className="font-[family-name:var(--font-hanken)] text-[clamp(1.85rem,4vw,2.65rem)] font-extrabold tracking-[-0.03em] text-ink">
              What&apos;s on in Dubai
            </h2>
            <div className="relative flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setDateMode("today");
                  setCalendarOpen(false);
                  setExpanded({});
                }}
                className={chipClass(dateMode === "today")}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  setDateMode("week");
                  setCalendarOpen(false);
                  setExpanded({});
                }}
                className={chipClass(dateMode === "week")}
              >
                Next 7 days
              </button>
              <button
                type="button"
                onClick={() => {
                  setDateMode("pick");
                  setCalendarOpen((v) => !v);
                }}
                className={chipClass(dateMode === "pick")}
              >
                <CalendarBlank size={14} />
                {pickLabel}
              </button>
              <button
                type="button"
                onClick={() => setPostOpen(true)}
                className="inline-flex items-center gap-1 rounded-full bg-orange px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-orange-deep"
              >
                <Plus size={14} weight="bold" />
                Post
              </button>
              {calendarOpen && (
                <DateRangePicker
                  from={range.from}
                  to={range.to}
                  onApply={(from, to) => {
                    setDateMode("pick");
                    setPickedRange({ from, to });
                    setCalendarOpen(false);
                    setExpanded({});
                  }}
                  onClose={() => setCalendarOpen(false)}
                />
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="flex h-12 flex-1 items-center gap-3 rounded-full bg-white px-4 ring-1 ring-black/[0.06]">
              <MagnifyingGlass size={18} className="text-ink/35" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAsk();
                }}
                placeholder='Try “where do locals brunch under AED 200?”'
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/35"
              />
            </label>
            <button
              type="button"
              onClick={handleAsk}
              className="h-12 rounded-full bg-orange px-6 text-sm font-semibold text-white hover:bg-orange-deep active:scale-[0.98]"
            >
              Ask
            </button>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => {
                const Icon = f.icon;
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setFilter(f.id);
                      setExpanded({});
                    }}
                    className={`inline-flex h-12 items-center gap-1.5 rounded-full px-4 text-sm font-semibold ${
                      active
                        ? "bg-[#1a1f2b] text-white"
                        : "bg-white text-ink/60 ring-1 ring-black/[0.06] hover:text-ink"
                    }`}
                  >
                    {Icon && <Icon size={15} />}
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-4 text-xs text-ink/45">
            {dateMode === "today" && "Showing listings for today."}
            {dateMode === "week" && `Showing ${formatChip(range.from)} – ${formatChip(range.to)}.`}
            {dateMode === "pick" && `Custom range ${formatChip(range.from)} – ${formatChip(range.to)}.`}
            {filter === "food" && " Food is live from Google Places."}
            {filter === "events" && " Events mix resident listings with Google Places in Dubai."}
            {filter === "offers" && " Dummy seasonal offers — swap for live partners later."}
          </p>

          <div className="mt-6 space-y-10">
            {loading && (
              <p className="rounded-3xl bg-white px-6 py-8 text-sm text-ink/50">Loading live listings…</p>
            )}
            {loadError && !loading && (
              <p className="rounded-3xl bg-white px-6 py-4 text-sm text-ink/50">{loadError} Showing backups.</p>
            )}
            {!loading && posts.length === 0 && (
              <p className="rounded-3xl bg-white px-6 py-10 text-sm text-ink/50">
                Nothing in this date range. Try Next 7 days, or post one yourself.
              </p>
            )}
            {!loading &&
              (filter === "all"
                ? (["offers", "food", "events"] as const).map((section) => (
                    <FeedGroup
                      key={section}
                      title={section === "offers" ? "Offers" : section === "food" ? "Food" : "Events"}
                      items={posts.filter((p) => p.filter === section)}
                      expanded={!!expanded[section]}
                      onToggle={() => setExpanded((e) => ({ ...e, [section]: !e[section] }))}
                      vouches={vouches}
                      vouched={vouched}
                      onVouch={onVouch}
                    />
                  ))
                : (
                    <FeedGroup
                      items={posts}
                      expanded={!!expanded[filter]}
                      onToggle={() => setExpanded((e) => ({ ...e, [filter]: !e[filter] }))}
                      vouches={vouches}
                      vouched={vouched}
                      onVouch={onVouch}
                    />
                  ))}
          </div>
        </div>
      </div>

      {postOpen && <PostDialog userName={user?.name} onClose={() => setPostOpen(false)} onSave={savePost} />}
    </section>
  );
}

function FeedGroup({
  title,
  items,
  expanded,
  onToggle,
  vouches,
  vouched,
  onVouch,
}: {
  title?: string;
  items: DubaiEvent[];
  expanded: boolean;
  onToggle: () => void;
  vouches: Record<string, number>;
  vouched: Record<string, boolean>;
  onVouch: (id: string) => void;
}) {
  if (items.length === 0) return null;
  const shown = expanded ? items : items.slice(0, PREVIEW_COUNT);
  const extra = items.length - PREVIEW_COUNT;

  return (
    <div>
      {title && (
        <div className="mb-4 flex items-end justify-between gap-3">
          <h3 className="font-[family-name:var(--font-hanken)] text-lg font-extrabold tracking-[-0.02em] text-ink">
            {title}
          </h3>
          <p className="text-xs text-ink/40">{items.length} listings</p>
        </div>
      )}
      <div className="space-y-5">
        {shown.map((post) => (
          <FeedCard
            key={post.id}
            post={post}
            vouches={vouches[post.id] ?? post.vouches}
            vouched={!!vouched[post.id]}
            onVouch={() => onVouch(post.id)}
          />
        ))}
      </div>
      {extra > 0 && (
        <button
          type="button"
          onClick={onToggle}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink/70 ring-1 ring-black/[0.06] hover:text-ink"
        >
          {expanded ? (
            <>
              Show less <CaretUp size={14} weight="bold" />
            </>
          ) : (
            <>
              Show {extra} more <CaretDown size={14} weight="bold" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

function chipClass(active: boolean) {
  return `inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors ${
    active
      ? "bg-[#1a1f2b] text-white"
      : "bg-white text-ink/65 ring-1 ring-black/[0.06] hover:text-ink"
  }`;
}

function DateRangePicker({
  from,
  to,
  onApply,
  onClose,
}: {
  from: Date;
  to: Date;
  onApply: (from: Date, to: Date) => void;
  onClose: () => void;
}) {
  const [cursor, setCursor] = useState(startOfDay(from));
  const [draftFrom, setDraftFrom] = useState(startOfDay(from));
  const [draftTo, setDraftTo] = useState(startOfDay(to));
  const [picking, setPicking] = useState<"from" | "to">("from");

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: startPad + daysInMonth }, (_, i) => {
    if (i < startPad) return null;
    return new Date(year, month, i - startPad + 1);
  });

  const inDraft = (d: Date) => d >= draftFrom && d <= draftTo;
  const monthLabel = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <div className="absolute right-0 top-full z-30 mt-3 w-[min(100vw-2rem,22rem)] rounded-2xl bg-white p-4 text-[#141210] shadow-[0_20px_50px_rgba(20,18,16,0.18)] ring-1 ring-black/10">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="rounded-full p-1.5 hover:bg-black/5"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          aria-label="Previous month"
        >
          <CaretLeft size={16} weight="bold" />
        </button>
        <p className="text-sm font-semibold">{monthLabel}</p>
        <button
          type="button"
          className="rounded-full p-1.5 hover:bg-black/5"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          aria-label="Next month"
        >
          <CaretRight size={16} weight="bold" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-ink/40">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) =>
          d ? (
            <button
              key={ymd(d)}
              type="button"
              onClick={() => {
                if (picking === "from" || d < draftFrom) {
                  setDraftFrom(d);
                  setDraftTo(d);
                  setPicking("to");
                } else {
                  setDraftTo(d);
                  setPicking("from");
                }
              }}
              className={`h-9 rounded-full text-sm ${
                inDraft(d) ? "bg-[#1a1f2b] text-white" : "hover:bg-orange/15"
              }`}
            >
              {d.getDate()}
            </button>
          ) : (
            <span key={`e-${i}`} />
          ),
        )}
      </div>
      <p className="mt-3 text-xs text-ink/50">
        {formatChip(draftFrom)} – {formatChip(draftTo)}. Click a start day, then an end day.
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink/50">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onApply(draftFrom, draftTo)}
          className="rounded-full bg-orange px-4 py-1.5 text-xs font-semibold text-white"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

function PostDialog({
  userName,
  onClose,
  onSave,
}: {
  userName?: string;
  onClose: () => void;
  onSave: (post: DubaiEvent) => void;
}) {
  const [title, setTitle] = useState("");
  const [blurb, setBlurb] = useState("");
  const [area, setArea] = useState("");
  const [aed, setAed] = useState("0");
  const [kind, setKind] = useState<EventFilter>("events");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !blurb.trim()) {
      setError("Add a title and a short description.");
      return;
    }
    const price = Number(aed) || 0;
    const author = userName?.trim() || "You";
    onSave({
      id: `user-${Date.now()}`,
      title: title.trim(),
      blurb: blurb.trim(),
      category: kind === "food" ? "food" : "culture",
      filter: kind,
      dateLabel: "Posted today",
      timeLabel: "Anytime",
      venue: area.trim() || "Dubai",
      area: area.trim() || "Dubai",
      price: price ? `AED ${price}` : "Free",
      aed: price,
      priceUnit: price ? "Per person" : "Free",
      free: price === 0,
      vouches: 1,
      author,
      authorInitial: author.slice(0, 1).toUpperCase(),
      localYears: 1,
      postedAgo: "Just now",
      image: kind === "food" ? "/discover/food.jpg" : kind === "offers" ? "/discover/buffet.jpg" : "/discover/market.jpg",
      imageAlt: title.trim(),
      localTip: "Posted by a visitor on KenZ.",
      startsOn: ymd(new Date()),
      endsOn: ymd(addDays(new Date(), 14)),
      source: "user",
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-[#141210]/55" aria-label="Close" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-lg rounded-3xl bg-white p-6 text-[#141210] shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-[family-name:var(--font-hanken)] text-xl font-extrabold">Post something on</h3>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-black/5" aria-label="Close">
            <X size={16} weight="bold" />
          </button>
        </div>
        <p className="mt-1 text-sm text-ink/50">It stays on this device and shows in the feed immediately.</p>
        <div className="mt-4 flex gap-2">
          {(["events", "food", "offers"] as EventFilter[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                kind === k ? "bg-[#1a1f2b] text-white" : "bg-black/5 text-ink/60"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-ink/45">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl bg-[#f7f4ef] px-3 text-sm font-normal text-ink outline-none ring-1 ring-black/10"
            placeholder="Sunset dhow from the Marina"
          />
        </label>
        <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink/45">
          What is it
          <textarea
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl bg-[#f7f4ef] px-3 py-2 text-sm font-normal text-ink outline-none ring-1 ring-black/10"
            placeholder="Price, time, why a local would go."
          />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink/45">
            Area
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl bg-[#f7f4ef] px-3 text-sm font-normal text-ink outline-none ring-1 ring-black/10"
              placeholder="JBR"
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink/45">
            Price AED
            <input
              value={aed}
              onChange={(e) => setAed(e.target.value)}
              inputMode="numeric"
              className="mt-1 h-11 w-full rounded-xl bg-[#f7f4ef] px-3 text-sm font-normal text-ink outline-none ring-1 ring-black/10"
              placeholder="0"
            />
          </label>
        </div>
        {error && <p className="mt-3 text-sm text-orange-deep">{error}</p>}
        <button
          type="submit"
          className="mt-5 h-11 w-full rounded-xl bg-orange text-sm font-semibold text-white hover:bg-orange-deep"
        >
          Publish to feed
        </button>
      </form>
    </div>
  );
}

function FeedCard({
  post,
  vouches,
  vouched,
  onVouch,
}: {
  post: DubaiEvent;
  vouches: number;
  vouched: boolean;
  onVouch: () => void;
}) {
  const [imgSrc, setImgSrc] = useState(post.image);
  const fallbackSrc = stockPlaceImage(
    post.title,
    post.filter === "food" ? "restaurants" : post.filter === "events" ? "museums" : "shopping",
  );

  const bookClass =
    "inline-flex h-11 items-center justify-center rounded-xl bg-[#1a1f2b] text-sm font-semibold text-white hover:bg-orange";
  const book = post.bookHref ? (
    <a href={post.bookHref} target="_blank" rel="noopener noreferrer" className={bookClass}>
      Open
    </a>
  ) : (
    <ProtectedPlannerLink className={bookClass}>Book</ProtectedPlannerLink>
  );

  return (
    <article className="grid gap-4 rounded-[1.75rem] bg-white p-4 shadow-[0_18px_50px_rgba(20,18,16,0.06)] sm:p-5 lg:grid-cols-[1fr_220px]">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange text-sm font-bold text-white">
            {post.authorInitial}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">
              {post.author}{" "}
              <span className="font-medium text-orange">
                {post.source === "google"
                  ? post.postedAgo
                  : post.source === "user"
                    ? "Posted on KenZ"
                    : `Local · ${post.localYears} yrs in Dubai`}
              </span>
            </p>
            <p className="text-[12px] text-ink/40">
              {post.source === "google" ? post.timeLabel : post.postedAgo}
            </p>
          </div>
        </div>
        <h3 className="mt-4 font-[family-name:var(--font-hanken)] text-[1.45rem] font-extrabold leading-snug tracking-[-0.03em] text-ink sm:text-[1.7rem]">
          {post.title}
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/65">
          {post.blurb} {post.localTip && <span className="italic">{post.localTip}</span>}
        </p>
        <div className="relative mt-4 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={post.imageAlt}
            className="h-56 w-full object-cover sm:h-72"
            onError={() => {
              if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
            }}
          />
          {post.badge && (
            <span className="absolute right-4 top-4 flex h-[4.6rem] w-[4.6rem] items-center justify-center rounded-full bg-orange text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-white shadow-[0_8px_20px_rgba(255,106,0,0.35)]">
              {post.badge}
            </span>
          )}
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#1a1f2b]/80 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            <MapPin size={11} weight="fill" />
            {post.area}
          </span>
        </div>
      </div>

      <aside className="flex flex-col justify-between rounded-2xl bg-[#f8f3ea] px-5 py-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/40">{post.priceUnit}</p>
          {post.aedWas != null && (
            <p className="mt-1 text-sm text-ink/35 line-through">AED {post.aedWas.toLocaleString()}</p>
          )}
          <p className="font-[family-name:var(--font-hanken)] text-[2rem] font-extrabold tracking-[-0.04em] text-ink tabular-nums">
            {post.source === "google"
              ? post.priceUnit === "Open now"
                ? "Open"
                : post.price
              : post.aed === 0
                ? "Free"
                : `AED ${post.aed.toLocaleString()}`}
          </p>
          {post.timeLeft && (
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/40">Time left</p>
              <p className="mt-1 text-lg font-bold text-ink">{post.timeLeft}</p>
              {post.timeLeftNote && <p className="text-[12px] text-ink/40">{post.timeLeftNote}</p>}
            </div>
          )}
          <p className="mt-4 text-[13px] font-medium text-[#2f6b4f]">✓ {vouches} locals vouch for it</p>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          {book}
          <button
            type="button"
            onClick={onVouch}
            className={`inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold ring-1 transition-colors ${
              vouched ? "bg-[#2f6b4f] text-white ring-[#2f6b4f]" : "bg-white text-ink/70 ring-black/10 hover:text-ink"
            }`}
          >
            ✓ Vouch
          </button>
        </div>
      </aside>
    </article>
  );
}
