"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import PlannerButton from "./ui/PlannerButton";

export default function PlannerNav() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    window.location.href = "/";
  };

  return (
    <header className="shrink-0 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="shrink-0 font-[family-name:var(--font-anton)] text-xl tracking-wide text-ink sm:text-2xl"
          >
            KEN<span className="text-white [-webkit-text-stroke:1.5px_#141210]">Z</span>
          </Link>
          <Link
            href="/"
            className="hidden text-sm font-medium text-ink/55 transition-colors hover:text-orange sm:inline"
          >
            Back to site
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <span className="hidden max-w-[9rem] truncate text-sm text-ink/55 sm:inline">
              {user.username ? `@${user.username}` : user.name}
            </span>
          )}
          <Link href="/" className="text-sm font-medium text-ink/55 hover:text-orange sm:hidden">
            Home
          </Link>
          <Link
            href="/chat"
            className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink ring-1 ring-black/10 transition-all hover:ring-orange/30 sm:text-sm"
          >
            Chat
          </Link>
          <PlannerButton
            variant="ghost"
            onClick={handleSignOut}
            className="!px-4 !py-2 text-xs sm:text-sm"
          >
            Log out
          </PlannerButton>
        </div>
      </div>
    </header>
  );
}
