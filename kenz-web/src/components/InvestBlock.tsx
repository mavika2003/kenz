import DubaiMap from "./DubaiMap";
import { ProtectedChatButton } from "./ProtectedChatLink";

export default function InvestBlock() {
  return (
    <section className="invest-block border-t-[3px] border-black">
      <div className="grid w-full md:grid-cols-2">
        <div className="invest-map-panel reveal border-b-[3px] border-black p-8 md:border-b-0 md:border-r-[3px] md:p-10 lg:p-14">
          <p className="font-[family-name:var(--font-caveat)] text-2xl text-orange-deep">
            where locals go
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-3xl font-semibold text-black md:text-4xl">
            Dubai / Neighborhoods
          </h2>
          <p className="mt-3 text-sm text-black/60">
            Click a pin or neighborhood below to explore local tips.
          </p>

          <div className="mt-6 w-full">
            <DubaiMap />
          </div>
        </div>

        <div className="book-page-panel reveal relative flex min-h-[380px] flex-col justify-center p-8 md:min-h-[480px] md:p-10 lg:p-14">
          <div className="book-page-grain" aria-hidden="true" />

          <div className="book-page-polaroid book-page-polaroid--1" aria-hidden="true">
            <span>🌴</span>
          </div>
          <div className="book-page-polaroid book-page-polaroid--2" aria-hidden="true">
            <span>🕌</span>
          </div>
          <div className="book-page-polaroid book-page-polaroid--3" aria-hidden="true">
            <span>🌮</span>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-md text-left">
            <p className="font-[family-name:var(--font-caveat)] text-xl text-orange-deep">
              skip the brochure ✦
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-[0.95] text-black">
              Chat
              <br />
              <span className="italic text-orange">Today</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/75">
              Real residents. Real answers. The scrapbook is free — a Kenzr in your
              pocket is where it gets personal.
            </p>
            <div className="mt-7 pr-1 pb-1">
              <ProtectedChatButton variant="large" mode="signup">
                Get a Kenzr →
              </ProtectedChatButton>
            </div>
            <p className="mt-5 font-[family-name:var(--font-caveat)] text-lg text-black/50">
              pinned by real locals 📌
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
