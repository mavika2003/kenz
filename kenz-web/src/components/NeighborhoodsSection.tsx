import DubaiMap from "./DubaiMap";
import { ProtectedChatButton } from "./ProtectedChatLink";
import { mustSeeItems } from "@/data/experiences";
import MotionReveal from "./MotionReveal";
import BezelCard from "./ui/BezelCard";

export default function NeighborhoodsSection() {
  return (
    <section id="map" className="bg-[#fdfbf7] py-28 md:py-40">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-start">
        <div>
          <MotionReveal>
            <h2 className="font-[family-name:var(--font-anton)] text-[clamp(2rem,4vw,3.25rem)] uppercase leading-[0.95] text-[#141210]">
              Neighborhoods
              <br />
              worth your time
            </h2>
            <p className="mt-5 max-w-md text-lg text-[#141210]/60">
              Tap a pin to see local tips. This is where residents actually go,
              not where brochures send you.
            </p>
          </MotionReveal>

          <MotionReveal delay={0.1} className="mt-10">
            <BezelCard innerClassName="overflow-hidden p-2">
              <DubaiMap />
            </BezelCard>
          </MotionReveal>
        </div>

        <div className="flex flex-col gap-8">
          <MotionReveal delay={0.12}>
            <BezelCard innerClassName="p-8">
              <h3 className="font-[family-name:var(--font-anton)] text-lg uppercase text-[#141210]">
                Must see
              </h3>
              <ul className="mt-5 space-y-3">
                {mustSeeItems.map((item) => (
                  <li key={item} className="text-sm text-[#141210]/75">
                    {item}
                  </li>
                ))}
              </ul>
            </BezelCard>
          </MotionReveal>

          <MotionReveal delay={0.18}>
            <BezelCard dark innerClassName="p-8 md:p-10">
              <h3 className="font-[family-name:var(--font-anton)] text-[clamp(2rem,4vw,2.75rem)] uppercase leading-[0.92] text-white">
                Chat
                <br />
                <span className="text-orange">today</span>
              </h3>
              <p className="mt-5 text-sm leading-relaxed text-white/65">
                Plans change. Weather shifts. A restaurant closes. A Kenzr answers
                in real time from the city you are standing in.
              </p>
              <div className="mt-8">
                <ProtectedChatButton variant="large" mode="signup">
                  Get a Kenzr
                </ProtectedChatButton>
              </div>
            </BezelCard>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}
