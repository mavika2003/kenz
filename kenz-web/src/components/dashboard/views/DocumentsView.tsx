"use client";

import {
  AirplaneTakeoff,
  FilePdf,
  FileText,
  FilePlus,
  IdentificationCard,
  Upload,
} from "@phosphor-icons/react";
import type { DashboardTrip } from "@/lib/dashboard/types";

const TYPE_ICONS = {
  visa: IdentificationCard,
  flight: AirplaneTakeoff,
  hotel: FileText,
  itinerary: FileText,
  other: FilePdf,
};

export default function DocumentsView({ trip }: { trip: DashboardTrip }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-6 pb-20">
      <div className="mb-8">
        <h2 className="font-[family-name:var(--font-anton)] text-3xl tracking-wide">Documents</h2>
        <p className="mt-1 text-sm text-ink/50">All your trip documents in one place.</p>
      </div>

      {/* Upload zone */}
      <div className="mb-8 cursor-pointer rounded-2xl border-2 border-dashed border-black/10 bg-surface p-10 text-center transition hover:border-orange/40 hover:bg-orange/5">
        <Upload size={32} weight="thin" className="mx-auto mb-3 text-orange" />
        <p className="text-sm font-semibold">Drop files here or click to upload</p>
        <p className="mt-1 text-xs text-ink/40">PDF, JPG, PNG — passports, visas, confirmations</p>
      </div>

      {/* Document list */}
      <div className="rounded-2xl border border-black/[0.08] bg-white">
        <div className="border-b border-black/[0.06] px-5 py-3.5">
          <h3 className="text-sm font-semibold">Uploaded Documents</h3>
        </div>
        <div className="divide-y divide-black/[0.04]">
          {trip.documents.map((doc) => {
            const Icon = TYPE_ICONS[doc.type] ?? FileText;
            return (
              <div
                key={doc.id}
                className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-surface"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange/8 text-orange">
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{doc.name}</p>
                  <p className="text-xs text-ink/40">
                    Updated {doc.updatedAt}
                    {doc.size ? ` · ${doc.size}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-full border border-black/[0.08] px-3 py-1.5 text-[10px] font-semibold transition hover:border-orange/40 hover:text-orange"
                >
                  View
                </button>
              </div>
            );
          })}
        </div>
        <div className="border-t border-black/[0.06] px-5 py-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface py-3 text-xs font-semibold text-ink/60 transition hover:text-orange"
          >
            <FilePlus size={16} />
            Add Document
          </button>
        </div>
      </div>
    </div>
  );
}
