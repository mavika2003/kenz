import MotionReveal from "./MotionReveal";
import BezelCard from "./ui/BezelCard";

export default function WhoSection() {
  return (
    <section id="who" className="bg-[#fdfbf7] py-28 md:py-40">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-2 md:items-center">
        <MotionReveal>
          <h2 className="font-[family-name:var(--font-anton)] text-[clamp(2.25rem,5vw,4rem)] uppercase leading-[0.95] text-[#141210]">
            Kenzrs are
            <br />
            real Dubai locals
          </h2>
        </MotionReveal>

        <MotionReveal delay={0.1}>
          <div className="space-y-6 text-lg leading-relaxed text-[#141210]/75">
            <p>
              Not guides. Not an agency. Not a call centre reading a script. We
              live here and we are tired of watching visitors get funnelled into
              overpriced tourist traps.
            </p>
            <p>
              KenZ is what we would tell a friend flying in: the apps, the cheap
              eats, the neighborhoods worth your time. Free to use. A Kenzr in
              your chat when you want a human who is actually on the ground.
            </p>
          </div>
        </MotionReveal>
      </div>

      <MotionReveal delay={0.15} className="mx-auto mt-20 max-w-7xl px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { value: "200+", label: "nationalities in one city" },
            { value: "AED 1", label: "abra ride across the creek" },
            { value: "24/7", label: "chat when plans change" },
          ].map((item) => (
            <BezelCard key={item.label} innerClassName="p-8">
              <p className="font-[family-name:var(--font-anton)] text-4xl text-orange">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-[#141210]/60">{item.label}</p>
            </BezelCard>
          ))}
        </div>
      </MotionReveal>
    </section>
  );
}
