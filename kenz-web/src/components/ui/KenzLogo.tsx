import Image from "next/image";
import Link from "next/link";

type KenzLogoProps = {
  href?: string;
  className?: string;
  /** Icon diameter in px */
  size?: number;
};

export default function KenzLogo({ href = "/", className = "", size = 34 }: KenzLogoProps) {
  const mark = (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src="/brand/kenz-mark.png"
          alt=""
          fill
          className="object-contain"
          sizes={`${size}px`}
          priority
        />
      </span>
      <span
        className="font-[family-name:var(--font-jakarta)] text-[1.15rem] font-bold leading-none tracking-[-0.02em] text-orange lowercase sm:text-[1.25rem]"
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
