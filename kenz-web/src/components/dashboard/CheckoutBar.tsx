"use client";

import { DownloadSimple, ShoppingCart } from "@phosphor-icons/react";
import type { DashboardTrip } from "@/lib/dashboard/types";
import { SIDEBAR_W_NORMAL as SIDEBAR_W } from "./DashboardSidebar";

export default function CheckoutBar({ trip }: { trip: DashboardTrip }) {
  return (
    <footer
      style={{ left: SIDEBAR_W }}
      className="fixed right-0 bottom-0 z-50 flex items-center justify-between border-t border-black/[0.06] bg-white/95 px-6 py-3.5 backdrop-blur"
    >
      <div className="flex items-center gap-6">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-ink/40">
            Estimated Total
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-orange">
              AED {trip.totalEstimate.toLocaleString()}
            </span>
            <span className="text-xs text-ink/40">for all bookings</span>
          </div>
        </div>
        <div className="hidden h-8 w-px bg-black/[0.06] sm:block" />
        <div className="hidden gap-3 sm:flex">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange" />
            <span className="text-xs font-semibold">{trip.confirmedCount} Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5 opacity-40">
            <span className="h-1.5 w-1.5 rounded-full bg-ink/40" />
            <span className="text-xs font-semibold">{trip.draftCount} Draft</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-full bg-surface px-5 py-2 text-xs font-bold transition hover:bg-black/[0.06] sm:flex"
        >
          <DownloadSimple size={15} />
          Export PDF
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full bg-ink px-5 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-orange"
        >
          <ShoppingCart size={15} weight="fill" />
          Secure Checkout
        </button>
      </div>
    </footer>
  );
}
