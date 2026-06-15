"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import PillButton from "./PillButton";
import { loginPageUrl } from "@/lib/auth";

const links = [
  { href: "/#who", label: "Who we are" },
  { href: "/#book", label: "Scrapbook" },
  { href: "/#chapters", label: "Chapters" },
];

export default function Nav() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-black bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href={user ? "/chat" : "/"}
          className="shrink-0 font-[family-name:var(--font-anton)] text-2xl tracking-wide text-black"
        >
          KEN<span className="text-white [-webkit-text-stroke:1.5px_#141210]">Z</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {!user &&
            links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-black/80 transition-colors hover:text-orange"
              >
                {link.label}
              </Link>
            ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <span className="hidden max-w-[8rem] truncate text-sm font-medium text-black/80 sm:inline">
                {user.name}
              </span>
              <Link href="/chat" className={pillLinkClass("primary")}>
                Open chat
              </Link>
              <PillButton
                variant="secondary"
                onClick={handleSignOut}
                className="px-3 py-2 text-xs sm:px-4 sm:text-sm"
              >
                Log out
              </PillButton>
            </>
          ) : (
            <>
              <Link href={loginPageUrl("signup")} className={pillLinkClass("secondary")}>
                Sign Up
              </Link>
              <Link href={loginPageUrl("login")} className={pillLinkClass("primary")}>
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function pillLinkClass(variant: "primary" | "secondary"): string {
  const base =
    "inline-flex items-center rounded-full border-2 border-black px-3 py-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm";
  return variant === "primary"
    ? `${base} bg-black text-white hover:bg-orange hover:border-orange`
    : `${base} bg-white text-black hover:bg-paper`;
}
