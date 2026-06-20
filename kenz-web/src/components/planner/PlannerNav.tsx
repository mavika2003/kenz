"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import PillButton from "@/components/PillButton";

function pillLinkClass(variant: "primary" | "secondary"): string {
  const base =
    "inline-flex items-center rounded-full border-2 border-[#141210] px-3 py-1.5 text-xs font-bold transition-colors sm:px-4 sm:text-sm";
  return variant === "primary"
    ? `${base} bg-[#ff6a00] text-white hover:bg-[#d94e00]`
    : `${base} bg-white text-[#141210] hover:bg-[#fbf3e4]`;
}

export default function PlannerNav() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    window.location.href = "/";
  };

  return (
    <nav className="shrink-0 border-b-2 border-[#141210] bg-white">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="shrink-0 font-[family-name:var(--font-anton)] text-xl tracking-wide text-[#141210] sm:text-2xl"
          >
            KEN<span className="text-white [-webkit-text-stroke:1.5px_#141210]">Z</span>
          </Link>
          <Link
            href="/"
            className="hidden text-xs font-bold text-[#141210]/70 transition-colors hover:text-[#ff6a00] sm:inline"
          >
            ← Back to site
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <span className="hidden max-w-[8rem] truncate text-sm font-medium text-[#141210]/70 sm:inline">
              {user.username ? `@${user.username}` : user.name}
            </span>
          )}
          <Link href="/" className="inline-flex text-xs font-bold text-[#141210]/70 hover:text-[#ff6a00] sm:hidden">
            ← Home
          </Link>
          <Link href="/planner" className={pillLinkClass("primary")}>
            Plan Trip
          </Link>
          <Link href="/chat" className={pillLinkClass("secondary")}>
            Open chat
          </Link>
          <PillButton
            variant="secondary"
            onClick={handleSignOut}
            className="px-3 py-1.5 text-xs sm:px-4 sm:text-sm"
          >
            Log out
          </PillButton>
        </div>
      </div>
    </nav>
  );
}
