"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { experiences } from "@/data/experiences";
import { CINEMATIC_SCENES } from "@/data/cinematic-scenes";
import { sceneVideoSrc } from "@/data/cinematic-scenes";
import MotionReveal from "./MotionReveal";
import BezelCard from "./ui/BezelCard";
import { easePremium } from "@/lib/motion";

const spanClass: Record<string, string> = {
  hero: "md:col-span-8 md:row-span-2",
  wide: "md:col-span-8",
  tall: "md:col-span-4 md:row-span-2",
  default: "md:col-span-4",
};

export default function ExperiencesBento() {
  const [activeId, setActiveId] = useState(experiences[0].id);
  const active = experiences.find((e) => e.id === activeId) ?? experiences[0];

  return (
    <section id="experiences" className="bg-white py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-6">
        <MotionReveal className="max-w-2xl">
          <h2 className="font-[family-name:var(--font-anton)] text-[clamp(2.25rem,5vw,4rem)] uppercase leading-[0.95] text-[#141210]">
            What locals
            <br />
            actually do
          </h2>
          <p className="mt-5 text-lg text-[#141210]/60">
            Six lanes of resident-curated intel. Tap a card to read the full
            breakdown.
          </p>
        </MotionReveal>

        <div className="mt-16 grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 md:grid-flow-dense md:grid-cols-12">
          {experiences.map((item, i) => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05, duration: 0.7, ease: easePremium }}
              whileHover={{ y: -4 }}
              className={`group text-left ${spanClass[item.span]}`}
            >
              <BezelCard
                innerClassName={`relative min-h-[180px] overflow-hidden p-6 md:p-8 ${
                  activeId === item.id ? "ring-2 ring-orange/40" : ""
                }`}
              >
                {item.id === "arrive" ? (
                  <>
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover"
                      aria-hidden="true"
                    >
                      <source
                        src={sceneVideoSrc(
                          CINEMATIC_SCENES.find((s) => s.id === "urban")!
                        )}
                        type="video/mp4"
                      />
                    </video>
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-[#141210]/75 via-[#141210]/40 to-[#ff6a00]/35"
                      aria-hidden="true"
                    />
                  </>
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-90 transition-opacity duration-500 group-hover:opacity-100`}
                    aria-hidden="true"
                  />
                )}
                <div
                  className={`relative z-10 flex h-full flex-col justify-between ${
                    item.tone === "dark" ? "text-white" : "text-[#141210]"
                  }`}
                >
                  <div>
                    <p className="font-[family-name:var(--font-anton)] text-3xl md:text-4xl">
                      {item.stat}
                    </p>
                    <p
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        item.tone === "dark" ? "text-white/55" : "text-[#141210]/55"
                      }`}
                    >
                      {item.statLabel}
                    </p>
                  </div>
                  <div className="mt-8">
                    <h3 className="font-[family-name:var(--font-anton)] text-lg uppercase">
                      {item.title}
                    </h3>
                    <p
                      className={`mt-2 text-sm leading-relaxed ${
                        item.tone === "dark" ? "text-white/75" : "text-[#141210]/70"
                      }`}
                    >
                      {item.summary}
                    </p>
                  </div>
                </div>
              </BezelCard>
            </motion.button>
          ))}
        </div>

        <MotionReveal delay={0.1} className="mt-10">
          <BezelCard innerClassName="p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">
              {active.title}
            </p>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#141210]/75">
              {active.detail}
            </p>
          </BezelCard>
        </MotionReveal>
      </div>
    </section>
  );
}
