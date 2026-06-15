"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import PillButton from "./PillButton";

export default function ChatNav() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-black bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/chat"
          className="shrink-0 font-[family-name:var(--font-anton)] text-2xl tracking-wide text-black"
        >
          KEN<span className="text-white [-webkit-text-stroke:1.5px_#141210]">Z</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="max-w-[10rem] truncate text-sm font-medium text-black/80">
                {user.username ? `@${user.username}` : user.name}
              </span>
              <PillButton
                variant="secondary"
                onClick={handleSignOut}
                className="px-3 py-2 text-xs sm:px-4 sm:text-sm"
              >
                Log out
              </PillButton>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
