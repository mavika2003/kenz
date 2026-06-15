"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

const slides = [
  {
    src: "/scrapbook/cover.jpg",
    label: "Cover",
    single: true,
  },
  {
    src: "/scrapbook/intro.jpg",
    label: "Intro & Insider Index",
    single: false,
  },
  {
    src: "/scrapbook/checklist.jpg",
    label: "Pre-Trip Checklist",
    single: false,
  },
];

export default function Flipbook() {
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (idx: number) => {
      if (animating || idx < 0 || idx >= slides.length || idx === current) return;
      setAnimating(true);
      setCurrent(idx);
      setTimeout(() => setAnimating(false), 450);
    },
    [animating, current]
  );

  const flip = useCallback(
    (dir: "fwd" | "back") => {
      goTo(dir === "fwd" ? current + 1 : current - 1);
    },
    [current, goTo]
  );

  useEffect(() => {
    (window as Window & { kenzGoToSlide?: (idx: number) => void }).kenzGoToSlide =
      goTo;
    return () => {
      delete (window as Window & { kenzGoToSlide?: (idx: number) => void })
        .kenzGoToSlide;
    };
  }, [goTo]);

  useEffect(() => {
    document.body.style.overflow = expanded ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [expanded]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && expanded) {
        setExpanded(false);
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") flip("fwd");
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (expanded && current === 0) setExpanded(false);
        else flip("back");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, expanded, flip]);

  const counterText = `${current + 1} / ${slides.length} · ${slides[current].label}`;

  const stage = (
    <div
      className={`flipbook-stage relative w-full overflow-visible bg-transparent ${
        expanded ? "h-[min(88vh,780px)]" : "h-[min(75vh,600px)]"
      }`}
      onTouchStart={(e) => {
        (e.currentTarget as HTMLElement & { _tx?: number })._tx =
          e.changedTouches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const start = (e.currentTarget as HTMLElement & { _tx?: number })._tx;
        if (start == null) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > 40) flip(dx < 0 ? "fwd" : "back");
      }}
    >
      <div className="relative h-full w-full">
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[450ms] ${
              i === current ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.label}
              fill
              className="object-contain drop-shadow-[6px_8px_12px_rgba(20,18,16,0.15)]"
              sizes="(max-width: 768px) 100vw, 920px"
            />
          </div>
        ))}

        {!slides[current].single && (
          <div className="pointer-events-none absolute bottom-[5%] left-1/2 top-[5%] w-5 -translate-x-1/2 bg-gradient-to-r from-black/15 via-black/5 to-black/15" />
        )}

        <div
          className={`pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/60 to-transparent ${
            animating ? "animate-[pageFlash_0.45s_ease_forwards]" : "opacity-0"
          }`}
        />

        <div className="absolute inset-0 z-10 flex">
          <button
            type="button"
            className="flex-1 cursor-pointer"
            aria-label="Previous page"
            onClick={() => flip("back")}
          />
          <button
            type="button"
            className="flex-1 cursor-pointer"
            aria-label="Next page"
            onClick={() => flip("fwd")}
          />
        </div>
      </div>
    </div>
  );

  if (expanded) {
    return (
      <div className="paper-bg fixed inset-0 z-[300] flex flex-col justify-center p-[clamp(12px,3vw,28px)]">
        <p className="mb-3 text-center font-[family-name:var(--font-caveat)] text-2xl text-orange-deep">
          {counterText}
        </p>
        <div className="flex flex-1 items-center justify-center gap-[clamp(10px,2.5vw,28px)]">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white text-xl font-bold text-black shadow-[3px_3px_0_rgba(20,18,16,0.15)]"
            aria-label="Back to website"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => flip("back")}
            disabled={current === 0}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white text-xl font-bold text-black shadow-[4px_4px_0_rgba(0,0,0,0.25)] disabled:opacity-30"
            aria-label="Previous page"
          >
            ←
          </button>
          <div className="w-full max-w-5xl flex-1">{stage}</div>
          <button
            type="button"
            onClick={() => flip("fwd")}
            disabled={current >= slides.length - 1}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white text-xl font-bold text-black shadow-[4px_4px_0_rgba(0,0,0,0.25)] disabled:opacity-30"
            aria-label="Next page"
          >
            →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-[920px]">
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="absolute right-0 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-lg border-2 border-black bg-white text-sm shadow-[2px_2px_0_rgba(20,18,16,0.15)]"
        aria-label="Open expanded view"
      >
        ⛶
      </button>

      <div className="mb-3.5 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => flip("back")}
          disabled={current === 0}
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-black bg-white text-lg font-bold shadow-[3px_3px_0_rgba(20,18,16,0.2)] disabled:opacity-35"
          aria-label="Previous page"
        >
          ←
        </button>
        <span className="min-w-[120px] text-center font-[family-name:var(--font-caveat)] text-xl text-orange-deep">
          {counterText}
        </span>
        <button
          type="button"
          onClick={() => flip("fwd")}
          disabled={current >= slides.length - 1}
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-black bg-white text-lg font-bold shadow-[3px_3px_0_rgba(20,18,16,0.2)] disabled:opacity-35"
          aria-label="Next page"
        >
          →
        </button>
      </div>

      {stage}

      <p className="mt-3 text-center font-[family-name:var(--font-caveat)] text-lg text-[#6b6157]">
        <span className="hidden md:inline">tap either page edge to flip</span>
        <span className="md:hidden">swipe or tap edges to flip</span>
      </p>
    </div>
  );
}
