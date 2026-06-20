import Image from "next/image";
import Link from "next/link";
import { ProtectedChatButton } from "./ProtectedChatLink";

export default function Hero() {
  return (
    <header className="relative overflow-hidden bg-white px-6 pb-20 pt-16 md:pb-28 md:pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#141210 1px, transparent 1px), linear-gradient(90deg, #141210 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-5xl text-center">
        <span className="reveal mb-6 inline-flex rotate-[-2deg] items-center gap-2 rounded-full border-2 border-black bg-orange px-4 py-1 font-[family-name:var(--font-caveat)] text-xl text-black">
          ✦ The Insider Scrapbook ✦
        </span>

        <h1 className="reveal font-[family-name:var(--font-playfair)] text-[clamp(2.5rem,7vw,4.5rem)] font-semibold leading-[1.05] tracking-tight text-black md:text-[clamp(3rem,8vw,5.5rem)]">
          Explore Dubai
          <br />
          <span className="italic">Like a Local</span>
        </h1>

        <p className="reveal mx-auto mt-5 max-w-lg text-lg text-black/70">
          A free scrapbook written by real Dubai residents — the apps, the cheap
          eats, the hacks, and the spots we actually use.
        </p>

        <div className="reveal relative mx-auto mt-12 max-w-3xl">
          <Link
            href="#book"
            className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-white px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-black shadow-[4px_4px_0_#141210] transition-transform hover:-translate-x-1/2 hover:-translate-y-[calc(50%+2px)] hover:shadow-[6px_6px_0_#141210]"
          >
            Read the scrapbook
          </Link>

          <div className="blob-mask relative overflow-hidden border-2 border-black bg-paper shadow-[12px_16px_0_#141210]">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src="/hero-scrapbook.png"
                alt="Kenz Insider Scrapbook — Dubai collage illustration"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        <div className="reveal mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="#book"
            className="rounded-full border-2 border-black bg-white px-7 py-3.5 text-base font-bold text-black shadow-[4px_4px_0_#d94e00] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#d94e00]"
          >
            Flip through free
          </Link>
          <Link
            href="/planner"
            className="rounded-full border-2 border-black bg-black px-7 py-3.5 text-base font-bold text-white shadow-[4px_4px_0_#f59e0b] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#f59e0b]"
          >
            Plan Your Trip ✨
          </Link>
          <ProtectedChatButton variant="large" mode="signup">
            Chat with a Kenzr
          </ProtectedChatButton>
        </div>
      </div>
    </header>
  );
}
