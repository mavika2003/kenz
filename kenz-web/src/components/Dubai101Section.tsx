"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";
import MotionReveal from "./MotionReveal";
import BezelCard from "./ui/BezelCard";
import { easePremium } from "@/lib/motion";
import {
  APP_CATEGORY_LABELS,
  DUBAI_ESSENTIALS,
  LOCAL_APPS,
  type AppCategory,
  type LocalApp,
} from "@/data/discover";

const CATEGORY_ORDER: AppCategory[] = [
  "getting-around",
  "food",
  "shopping",
  "staying-connected",
  "official",
];

export default function Dubai101Section() {
  return (
    <section id="dubai-101" className="scroll-mt-24 bg-[#fdfbf7] py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <MotionReveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">
            Dubai 101
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-anton)] text-[clamp(2.25rem,5vw,4rem)] uppercase leading-[0.95] text-[#141210]">
            Download these
            <br />
            before you land
          </h2>
          <p className="mt-5 text-lg text-[#141210]/60">
            The city runs on a handful of apps. Residents install every one of
            these. Tourists find out about them on day three. Skip to day one.
          </p>
        </MotionReveal>

        <div className="mt-16 space-y-14">
          {CATEGORY_ORDER.map((category, ci) => {
            const apps = LOCAL_APPS.filter((a) => a.category === category);
            if (apps.length === 0) return null;
            return (
              <div key={category} className="grid gap-6 lg:grid-cols-[220px_1fr]">
                <MotionReveal delay={0.02 * ci}>
                  <h3 className="font-[family-name:var(--font-anton)] text-xl uppercase text-[#141210] lg:sticky lg:top-28">
                    {APP_CATEGORY_LABELS[category]}
                  </h3>
                </MotionReveal>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {apps.map((app, i) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ delay: i * 0.05, duration: 0.6, ease: easePremium }}
                    >
                      <AppCard app={app} />
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <MotionReveal delay={0.1} className="mt-20">
          <BezelCard dark innerClassName="p-8 md:p-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
              <div>
                <h3 className="font-[family-name:var(--font-anton)] text-[clamp(1.75rem,3vw,2.5rem)] uppercase leading-[0.95] text-white">
                  The rest of
                  <br />
                  <span className="text-orange">the basics</span>
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  Six things people ask a Kenzr in their first hour. Answered here
                  so you can ask better questions.
                </p>
              </div>
              <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {DUBAI_ESSENTIALS.map((item) => (
                  <div key={item.id} className="border-l border-white/10 pl-4">
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                      {item.label}
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium leading-snug text-white">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </BezelCard>
        </MotionReveal>
      </div>
    </section>
  );
}

function AppCard({ app }: { app: LocalApp }) {
  return (
    <a
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full"
      aria-label={`${app.name}: ${app.tagline}. Opens in a new tab`}
    >
      <BezelCard
        className="h-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-1"
        innerClassName="flex h-full flex-col p-6"
      >
        <div className="flex items-start justify-between">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-base font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]"
            style={{ background: app.color, color: app.onColor }}
          >
            {app.monogram}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-[#141210]/60 transition-all duration-300 group-hover:bg-orange group-hover:text-white">
            <ArrowUpRight size={14} weight="bold" />
          </span>
        </div>
        <h4 className="mt-5 font-[family-name:var(--font-anton)] text-lg uppercase text-[#141210]">
          {app.name}
        </h4>
        <p className="mt-1 text-sm font-medium text-[#141210]/75">{app.tagline}</p>
        <p className="mt-3 text-sm leading-relaxed text-[#141210]/55">{app.why}</p>
      </BezelCard>
    </a>
  );
}
