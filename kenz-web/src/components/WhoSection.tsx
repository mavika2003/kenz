export default function WhoSection() {
  return (
    <section id="who" className="border-y-[3px] border-black bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
        <div>
          <p className="reveal font-[family-name:var(--font-caveat)] text-2xl text-orange-deep">
            so, who are we?
          </p>
          <h2 className="reveal mt-2 font-[family-name:var(--font-anton)] text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none text-black">
            Kenzrs are
            <br />
            real Dubai locals.
          </h2>
        </div>

        <div className="space-y-5 text-lg leading-relaxed text-black/85">
          <p className="reveal">
            Not guides. Not an agency. Not a call centre reading off a script.
            We&apos;re people who actually{" "}
            <strong className="bg-[var(--tape-yellow)] px-1">live here</strong>{" "}
            and are violently tired of watching visitors get funnelled into
            overpriced, generic tourist traps.
          </p>
          <p className="reveal">
            This scrapbook is everything we&apos;d tell a friend flying in.
            It&apos;s free, read it, screenshot it, use it. And if you want one
            of us actually{" "}
            <strong className="bg-[var(--tape-yellow)] px-1">
              in your chat the whole trip
            </strong>
            , telling you where to eat right now and which taxi line&apos;s a
            scam, that&apos;s where Kenz gets good.
          </p>
        </div>
      </div>
    </section>
  );
}
