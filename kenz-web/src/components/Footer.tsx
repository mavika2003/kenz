"use client";

import { ProtectedPlannerLink } from "./ProtectedPlannerLink";
import PillCTA from "./ui/PillCTA";
import MotionReveal from "./MotionReveal";

export default function Footer() {
  return (
    <footer className="bg-[#141210] px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <MotionReveal className="flex flex-col gap-10 border-b border-white/10 pb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-[family-name:var(--font-anton)] text-3xl tracking-wide">
              KEN<span className="text-black [-webkit-text-stroke:1.5px_#ffffff]">Z</span>
            </p>
            <p className="mt-3 max-w-sm text-sm text-white/60">
              Insider Dubai travel by residents. Free to browse. Personal when you
              need it.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <ProtectedPlannerLink className="group inline-flex items-center gap-3 rounded-full bg-orange px-6 py-3 text-sm font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-orange-deep active:scale-[0.98]">
              <span>Plan your trip</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 text-xs">↗</span>
            </ProtectedPlannerLink>
            <PillCTA href="/chat" variant="ghost">
              Open chat
            </PillCTA>
          </div>
        </MotionReveal>

        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/55 md:justify-start">
          <a href="#" className="transition-colors hover:text-orange">
            Website
          </a>
          <a href="#" className="transition-colors hover:text-orange">
            Instagram
          </a>
          <a href="#" className="transition-colors hover:text-orange">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
