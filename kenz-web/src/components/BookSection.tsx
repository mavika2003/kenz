import Flipbook from "./Flipbook";

export default function BookSection() {
  return (
    <section id="book" className="paper-bg border-b-[3px] border-black py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="reveal mb-12 text-center">
          <span className="inline-flex rotate-[-1deg] items-center rounded-full border-2 border-black bg-orange px-4 py-1 font-[family-name:var(--font-caveat)] text-xl text-black">
            📖 Flip through it
          </span>
          <h2 className="mt-5 font-[family-name:var(--font-anton)] text-[clamp(2rem,5vw,3.25rem)] uppercase leading-none text-black">
            The Insider Scrapbook
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-black/65">
            everything a Dubai local would actually tell you
          </p>
        </div>

        <Flipbook />
      </div>
    </section>
  );
}
