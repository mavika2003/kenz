import Image from "next/image";
import Link from "next/link";

type KenzLogoProps = {
  href?: string;
  className?: string;
  /** Icon diameter in px */
  size?: number;
};

export default function KenzLogo({ href = "/", className = "", size = 34 }: KenzLogoProps) {
  const markSize = Math.round(size * 0.62);
  const mark = (
    <span className={`inline-flex items-center gap-0 ${className}`}>
      <span
        className="relative shrink-0"
        style={{ width: markSize, height: markSize }}
      >
        <Image
          src="/brand/kenz-mark.png"
          alt=""
          fill
          className="object-contain"
          sizes={`${markSize}px`}
          priority
        />
      </span>
      <span
        className="-ml-1 font-[family-name:var(--font-jakarta)] text-[1.15rem] font-bold leading-none tracking-[-0.02em] text-orange lowercase sm:text-[1.25rem]"
        aria-hidden="true"
      >
        enz
      </span>
      <span className="sr-only">Kenz</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="shrink-0 px-1">
        {mark}
      </Link>
    );
  }

  return mark;
}
