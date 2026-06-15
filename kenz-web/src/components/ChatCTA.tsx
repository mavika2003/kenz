"use client";

import { useState } from "react";

export default function ChatCTA() {
  const [value, setValue] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (value.trim().length > 5) {
      setSent(true);
      setValue("");
    }
  };

  return (
    <section id="chat" className="bg-orange py-20 text-center md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="reveal font-[family-name:var(--font-anton)] text-[clamp(2rem,6vw,3.75rem)] uppercase leading-none text-black">
          Want a local
          <br />
          in your chat?
        </h2>
        <p className="reveal mx-auto mt-5 max-w-lg text-lg leading-relaxed text-black/85">
          A Kenzr texting you the move all trip long. No tourist traps, no
          &ldquo;is this a scam&rdquo; moments — just a real Dubai friend.
        </p>

        <div className="reveal mx-auto mt-10 max-w-md rounded-2xl border-[3px] border-black bg-white p-6 text-left shadow-[8px_8px_0_#141210]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-black bg-orange text-2xl">
              🇦🇪
            </div>
            <div>
              <p className="text-sm font-bold">A real Kenzr</p>
              <p className="text-xs text-black/55">replies in minutes</p>
            </div>
          </div>

          <div className="mb-4 rounded-xl rounded-bl-sm border-[1.5px] border-black bg-paper px-4 py-3 text-sm leading-relaxed">
            Hey! Flying in soon? Drop your WhatsApp — I&apos;ll send you the
            spots I&apos;d take my own friends to.
          </div>

          <div className="flex gap-2">
            <input
              type="tel"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={sent ? "✓ sent" : "Your WhatsApp number"}
              className="flex-1 rounded-lg border-2 border-black px-3 py-3 text-sm outline-none focus:outline focus:outline-[3px] focus:outline-orange-soft"
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-lg border-2 border-black bg-black px-5 py-3 text-sm font-bold text-white hover:bg-orange-deep"
            >
              Go
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-black/55">
            Free to start. A real human replies, not a bot.
          </p>
          {sent && (
            <p className="mt-3 text-center font-[family-name:var(--font-caveat)] text-xl text-orange-deep">
              ✓ Got it — a Kenzr will text you shortly!
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
