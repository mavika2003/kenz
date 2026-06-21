import { howItWorksSteps } from "@/data/experiences";
import MotionReveal from "./MotionReveal";
import BezelCard from "./ui/BezelCard";

export default function HowItWorks() {
  return (
    <section id="how" className="bg-[#141210] py-28 text-white md:py-40">
      <div className="mx-auto max-w-7xl px-6">
        <MotionReveal className="max-w-xl">
          <h2 className="font-[family-name:var(--font-anton)] text-[clamp(2.25rem,5vw,3.5rem)] uppercase leading-[0.95]">
            How KenZ works
          </h2>
          <p className="mt-5 text-lg text-white/60">
            From browsing to planning to live chat. One flow, built around how
            residents actually travel.
          </p>
        </MotionReveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {howItWorksSteps.map((step, i) => (
            <MotionReveal key={step.step} delay={i * 0.08}>
              <BezelCard dark innerClassName="h-full p-8">
                <p className="font-[family-name:var(--font-anton)] text-5xl text-orange/80">
                  {step.step}
                </p>
                <h3 className="mt-6 font-[family-name:var(--font-anton)] text-xl uppercase">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {step.body}
                </p>
              </BezelCard>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
