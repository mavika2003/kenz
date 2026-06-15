"use client";

import { chapters, mustSeeItems, type Chapter } from "@/data/chapters";

function PolaroidCard({
  chapter,
  onClick,
}: {
  chapter: Chapter;
  onClick: () => void;
}) {
  const sizeClass =
    chapter.size === "lg"
      ? "scrapbook-polaroid-card--lg"
      : chapter.size === "sm"
        ? "scrapbook-polaroid-card--sm"
        : "scrapbook-polaroid-card--md";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`scrapbook-polaroid-card group ${sizeClass}`}
      style={
        {
          top: chapter.position.top,
          left: chapter.position.left,
          "--rotate": `${chapter.rotate}deg`,
        } as React.CSSProperties
      }
      aria-label={chapter.title}
    >
      <span
        className={`scrapbook-polaroid-tape ${chapter.tape === "orange" ? "tape-orange" : "tape-cream"}`}
      />
      <div
        className={`scrapbook-polaroid-photo bg-gradient-to-b ${chapter.gradient}`}
      >
        <span className="scrapbook-polaroid-emoji">{chapter.emoji}</span>
        <span className="scrapbook-polaroid-stat">
          {chapter.stat} · {chapter.statLabel}
        </span>
      </div>
      <div className="scrapbook-polaroid-caption">
        <h3>{chapter.title}</h3>
        <p>{chapter.description}</p>
        <span className="scrapbook-polaroid-note">{chapter.note}</span>
      </div>
    </button>
  );
}

function CollageDecorations() {
  return (
    <svg
      className="scrapbook-collage-deco"
      viewBox="0 0 900 700"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M120 80 Q280 40 420 90 T680 70"
        stroke="#141210"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        opacity="0.25"
      />
      <path
        d="M60 320 Q200 280 340 340 T580 300"
        stroke="#141210"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        opacity="0.2"
      />
      <g transform="translate(720, 520)" opacity="0.35">
        <rect x="0" y="20" width="8" height="60" fill="#141210" />
        <rect x="-4" y="0" width="16" height="12" rx="2" fill="#141210" />
        <path d="M4 80 L4 100 L20 110" stroke="#141210" strokeWidth="1.5" />
      </g>
      <g transform="translate(40, 560)" opacity="0.3">
        <path
          d="M20 0 C5 15 0 35 15 50 C25 60 40 55 45 40 C50 25 35 5 20 0Z"
          stroke="#141210"
          strokeWidth="1.5"
          fill="none"
        />
        <line x1="20" y1="50" x2="20" y2="70" stroke="#141210" strokeWidth="1.5" />
      </g>
      <g transform="translate(780, 120)" opacity="0.35">
        <rect x="10" y="40" width="6" height="50" fill="#141210" />
        <polygon points="13,40 13,0 0,40" fill="#141210" />
        <rect x="4" y="40" width="18" height="8" fill="#141210" />
      </g>
      <text
        x="680"
        y="200"
        fontFamily="Caveat, cursive"
        fontSize="18"
        fill="#d94e00"
        opacity="0.6"
        transform="rotate(-8 680 200)"
      >
        start here →
      </text>
      <text
        x="80"
        y="180"
        fontFamily="Caveat, cursive"
        fontSize="16"
        fill="#141210"
        opacity="0.4"
        transform="rotate(-4 80 180)"
      >
        locals only
      </text>
    </svg>
  );
}

export default function ChaptersGrid() {
  const handleClick = (chapter: Chapter) => {
    const book = document.getElementById("book");
    book?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (chapter.slide != null) {
      setTimeout(() => {
        (
          window as Window & { kenzGoToSlide?: (idx: number) => void }
        ).kenzGoToSlide?.(chapter.slide!);
      }, 420);
    }
  };

  return (
    <section id="chapters" className="scrapbook-chapters-section border-t-[3px] border-black">
      <div className="scrapbook-chapters-grain" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="reveal text-center">
          <p className="font-[family-name:var(--font-caveat)] text-2xl text-orange-deep">
            what&apos;s inside
          </p>
          <h2 className="scrapbook-chapters-title mt-2 font-[family-name:var(--font-playfair)] text-[clamp(2rem,6vw,3.75rem)] font-semibold italic leading-tight text-black">
            From Landing
            <br />
            to <span className="text-orange">Local Dubai</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-black/60">
            Six chapters pinned by real residents — click a polaroid to jump in.
          </p>
        </div>

        <div className="scrapbook-collage-board reveal">
          <CollageDecorations />

          <div className="scrapbook-postcard" aria-hidden="true">
            <p className="scrapbook-postcard-label">Must See</p>
            <ul>
              {mustSeeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <span className="scrapbook-postcard-stamp">KENZ</span>
          </div>

          <div className="scrapbook-map-sketch" aria-hidden="true">
            <p className="font-[family-name:var(--font-caveat)] text-sm text-black/50">
              Dubai
            </p>
            <svg viewBox="0 0 120 80" fill="none" className="mt-1 w-full">
              <ellipse
                cx="60"
                cy="40"
                rx="50"
                ry="30"
                stroke="#141210"
                strokeWidth="1.2"
                opacity="0.3"
              />
              <circle cx="35" cy="35" r="3" fill="#ff6a00" opacity="0.7" />
              <circle cx="70" cy="28" r="3" fill="#ff6a00" opacity="0.7" />
              <circle cx="55" cy="50" r="3" fill="#ff6a00" opacity="0.7" />
              <circle cx="85" cy="42" r="3" fill="#ff6a00" opacity="0.7" />
            </svg>
          </div>

          <div className="scrapbook-collage-polaroids">
            {chapters.map((chapter) => (
              <PolaroidCard
                key={chapter.id}
                chapter={chapter}
                onClick={() => handleClick(chapter)}
              />
            ))}
          </div>
        </div>

        <div className="scrapbook-chapters-mobile reveal">
          {chapters.map((chapter, i) => (
            <PolaroidCard
              key={chapter.id}
              chapter={{
                ...chapter,
                rotate: i % 2 === 0 ? -2 : 2,
                position: { top: "0", left: "0" },
              }}
              onClick={() => handleClick(chapter)}
            />
          ))}
        </div>

        <blockquote className="reveal mx-auto mt-14 max-w-2xl text-center font-[family-name:var(--font-playfair)] text-[clamp(1.4rem,3.5vw,2.25rem)] italic leading-snug text-black">
          Dubai doesn&apos;t do generic.
          <br />
          Neither do we.
        </blockquote>
        <p className="reveal mt-4 text-center font-[family-name:var(--font-caveat)] text-xl text-black/50">
          📌 pinned by real Kenzrs
        </p>
      </div>
    </section>
  );
}
