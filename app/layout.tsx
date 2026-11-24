import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost, Pinyon_Script, Great_Vibes, Dancing_Script } from "next/font/google";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--f-serif" });
const sans = Jost({ subsets: ["latin"], variable: "--f-sans" });
const pinyon = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--f-script" });
const vibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--f-vibes" });
const dancing = Dancing_Script({ subsets: ["latin"], variable: "--f-dancing" });

export const metadata: Metadata = { title: "For Toluwanimi", description: "A little world called Toluwanimi" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FBF7F0" };

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${pinyon.variable} ${vibes.variable} ${dancing.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
