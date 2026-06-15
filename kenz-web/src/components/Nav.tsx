import Link from "next/link";

const links = [
  { href: "#who", label: "Who we are" },
  { href: "#book", label: "Scrapbook" },
  { href: "#chapters", label: "Chapters" },
  { href: "#chat", label: "Chat" },
];

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b-2 border-black bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-anton)] text-2xl tracking-wide text-black"
        >
          KEN<span className="text-white [-webkit-text-stroke:1.5px_#141210]">Z</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-black/80 transition-colors hover:text-orange"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="#chat"
          className="rounded-full border-2 border-black bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange hover:border-orange"
        >
          Chat with a Kenzr
        </a>
      </div>
    </nav>
  );
}
