import type { Metadata } from "next";
import { Anton, Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

// Substitute for "boitroco" until the font file is placed in /public/fonts.
// To swap: add @font-face in globals.css pointing to /fonts/boitroco.woff2
// and change the variable value to your local font family name.
const boitroco = Playfair_Display({
  variable: "--font-boitroco",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Kenz — Explore Dubai Like a Local",
  description:
    "Insider Dubai travel by real residents. Neighborhoods, local eats, trip planning, and live chat with Kenzrs who live here.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${jakarta.variable} ${anton.variable} ${boitroco.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
