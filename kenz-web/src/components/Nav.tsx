"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { ProtectedPlannerLink } from "./ProtectedPlannerLink";
import KenzLogo from "./ui/KenzLogo";
import { loginPageUrl } from "@/lib/auth";
import { easePremium } from "@/lib/motion";

const links = [
  { href: "/#who", label: "Who we are" },
  { href: "/#experiences", label: "Experiences" },
  { href: "/#map", label: "Neighborhoods" },
];

type NavProps = {
  overlay?: boolean;
};

export default function Nav({ overlay = false }: NavProps) {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isDarkShell = overlay && !scrolled;

  const handleSignOut = () => {
    signOut();
    window.location.href = "/";
  };

  return (
    <>
      <header
        className={`${overlay ? "fixed" : "sticky"} top-0 z-40 flex w-full justify-center px-4 ${overlay ? "pt-5" : "pt-3"}`}
      >
        <nav
          className={`flex w-full max-w-5xl items-center justify-between gap-3 rounded-full px-3 py-2 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:px-4 ${
            isDarkShell
              ? "bg-orange/25 text-white ring-1 ring-orange/40 backdrop-blur-2xl"
              : overlay
                ? "bg-orange/18 text-[#141210] ring-1 ring-orange/30 backdrop-blur-xl shadow-[0_8px_40px_rgba(255,106,0,0.12)]"
                : "bg-white/90 text-[#141210] ring-1 ring-black/[0.06] backdrop-blur-xl shadow-[0_8px_40px_rgba(20,18,16,0.06)]"
          }`}
        >
          <KenzLogo href="/" size={42} />

          <div className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-300 ${
                  isDarkShell ? "text-white/80 hover:text-white" : "text-black/65 hover:text-orange"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <ProtectedPlannerLink
              className={`text-sm font-medium transition-colors duration-300 ${
                isDarkShell ? "text-white/80 hover:text-white" : "text-black/65 hover:text-orange"
              }`}
            >
              Plan trip
            </ProtectedPlannerLink>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link href="/planner" className={authPill(isDarkShell, "ghost")}>
                  Planner
                </Link>
                <Link href="/chat" className={authPill(isDarkShell, "solid")}>
                  Chat
                </Link>
                <button type="button" onClick={handleSignOut} className={authPill(isDarkShell, "ghost")}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href={loginPageUrl("signup")} className={authPill(isDarkShell, "ghost")}>
                  Sign up
                </Link>
                <Link href={loginPageUrl("login")} className={authPill(isDarkShell, "solid")}>
                  Login
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`absolute h-0.5 w-5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isDarkShell ? "bg-white" : "bg-[#141210]"
              } ${open ? "translate-y-0 rotate-45" : "-translate-y-1.5"}`}
            />
            <span
              className={`absolute h-0.5 w-5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isDarkShell ? "bg-white" : "bg-[#141210]"
              } ${open ? "opacity-0" : "opacity-100"}`}
            />
            <span
              className={`absolute h-0.5 w-5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isDarkShell ? "bg-white" : "bg-[#141210]"
              } ${open ? "translate-y-0 -rotate-45" : "translate-y-1.5"}`}
            />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#141210]/90 backdrop-blur-3xl md:hidden"
          >
            <div className="flex h-full flex-col justify-center px-8">
              {[...links, { href: "/planner", label: "Plan trip" }, { href: "/chat", label: "Chat" }].map(
                (link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 48 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{ delay: 0.08 + i * 0.06, duration: 0.55, ease: easePremium }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block border-b border-white/10 py-5 font-[family-name:var(--font-anton)] text-3xl uppercase text-white"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function authPill(dark: boolean, style: "solid" | "ghost"): string {
  const base =
    "rounded-full px-4 py-2 text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] sm:text-sm";

  if (dark) {
    return style === "solid"
      ? `${base} bg-white text-[#141210] hover:bg-orange hover:text-white`
      : `${base} text-white/85 hover:bg-white/10`;
  }

  return style === "solid"
    ? `${base} bg-[#141210] text-white hover:bg-orange`
    : `${base} text-black/70 hover:text-orange`;
}
