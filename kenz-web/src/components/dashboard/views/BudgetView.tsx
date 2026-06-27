"use client";

import {
  AirplaneTakeoff,
  Buildings,
  Car,
  CreditCard,
  DownloadSimple,
  Receipt,
  ShoppingCart,
} from "@phosphor-icons/react";
import type { DashboardTrip } from "@/lib/dashboard/types";

const ICONS: Record<string, typeof AirplaneTakeoff> = {
  flight: AirplaneTakeoff,
  hotel: Buildings,
  transfer: Car,
  experiences: ShoppingCart,
};

export default function BudgetView({ trip }: { trip: DashboardTrip }) {
  const totalBudget = 15000;
  const spent = trip.totalEstimate;
  const remaining = totalBudget - spent;
  const pct = Math.round((spent / totalBudget) * 100);

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 pb-20">
      <div className="mb-8">
        <h2 className="font-[family-name:var(--font-anton)] text-3xl tracking-wide">Budget</h2>
        <p className="mt-1 text-sm text-ink/50">Estimated costs and booking overview.</p>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-ink/40">
            Total Budget
          </p>
          <p className="mt-2 text-3xl font-bold">AED {totalBudget.toLocaleString()}</p>
          <p className="mt-1 text-xs text-ink/40">Set by you</p>
        </div>
        <div className="rounded-2xl border border-orange/30 bg-orange/5 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-orange/70">
            Estimated Total
          </p>
          <p className="mt-2 text-3xl font-bold text-orange">AED {spent.toLocaleString()}</p>
          <p className="mt-1 text-xs text-orange/60">
            {trip.confirmedCount} confirmed · {trip.draftCount} draft
          </p>
        </div>
        <div className="rounded-2xl border border-black/[0.08] bg-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-ink/40">
            Remaining
          </p>
          <p className={`mt-2 text-3xl font-bold ${remaining >= 0 ? "text-green-600" : "text-red-500"}`}>
            AED {Math.abs(remaining).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-ink/40">{remaining >= 0 ? "Under budget" : "Over budget"}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8 rounded-2xl border border-black/[0.08] bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Budget Progress</h3>
          <span className="text-sm font-bold text-orange">{pct}% used</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-orange transition-all duration-700"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between text-xs text-ink/40">
          <span>AED 0</span>
          <span>AED {totalBudget.toLocaleString()}</span>
        </div>
      </div>

      {/* Booking lines */}
      <div className="mb-8 rounded-2xl border border-black/[0.08] bg-white">
        <div className="border-b border-black/[0.06] px-5 py-4">
          <h3 className="font-semibold">Booking Breakdown</h3>
        </div>
        <div className="divide-y divide-black/[0.04]">
          {trip.bookingLines.map((line) => {
            const key = line.label.toLowerCase();
            const IconComp =
              ICONS[
                key.includes("flight")
                  ? "flight"
                  : key.includes("hotel")
                    ? "hotel"
                    : key.includes("transfer")
                      ? "transfer"
                      : "experiences"
              ] ?? Receipt;
            const isDraft = line.amount === 0;

            return (
              <div
                key={line.label}
                className="flex items-center justify-between px-5 py-4 transition hover:bg-surface"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange/8 text-orange">
                    <IconComp size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{line.label}</p>
                    {isDraft ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/30">
                        Pending selection
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-green-600">
                        Confirmed
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {isDraft ? (
                    <span className="text-sm font-semibold text-ink/30">TBD</span>
                  ) : (
                    <span className="text-sm font-bold">AED {line.amount.toLocaleString()}</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Total row */}
          <div className="flex items-center justify-between bg-surface px-5 py-4">
            <span className="font-bold">Total</span>
            <span className="text-lg font-bold text-orange">
              AED {trip.totalEstimate.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Payment / CTA */}
      <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
        <h3 className="mb-4 font-semibold">Payment</h3>
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-black/[0.08] bg-surface px-4 py-3">
          <CreditCard size={22} className="text-orange" />
          <div>
            <p className="text-sm font-semibold">•••• •••• •••• 4242</p>
            <p className="text-xs text-ink/40">Visa · Expires 08/28</p>
          </div>
          <button
            type="button"
            className="ml-auto text-xs font-semibold text-orange hover:underline"
          >
            Change
          </button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-surface px-6 py-3 text-sm font-bold transition hover:bg-black/[0.06]"
          >
            <DownloadSimple size={16} />
            Export PDF
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-orange"
          >
            <ShoppingCart size={16} weight="fill" />
            Secure Checkout — AED {trip.totalEstimate.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}
