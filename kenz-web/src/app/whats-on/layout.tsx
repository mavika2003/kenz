import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "What's on in Dubai · Kenz",
  description:
    "What's actually worth doing in Dubai on your dates, posted by people who live here. Expired offers come off automatically.",
};

export default function WhatsOnLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${fraunces.variable} ${dmSans.variable}`}>{children}</div>;
}
