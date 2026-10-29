import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import GlowCursor from "@/components/GlowCursor";
import PageTransition from "@/components/PageTransition";
import SmoothScroll from "@/components/SmoothScroll";
import Starfield from "@/components/Starfield";
import NativeFluidRipple from "@/components/NativeFluidRipple";
import SiteChrome from "@/components/SiteChrome";
import { SpeedInsights } from "@vercel/speed-insights/next";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "BIMTECH E-Cell | Where Aspiration Meets Opportunity",
  description: "Official Entrepreneurship Cell of Birla Institute of Management Technology. Empowering the next generation of founders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="font-sans antialiased overflow-x-hidden relative min-h-screen bg-transparent">
        {/* Respect "reduce motion" in every framer-motion animation */}
        <MotionConfig reducedMotion="user">
          {/* Fixed starfield behind every page */}
          <Starfield />

          {/* Click ripples */}
          <NativeFluidRipple />

          <GlowCursor />

          <SmoothScroll>
            <SiteChrome>
              <PageTransition>
                {children}
              </PageTransition>
            </SiteChrome>
          </SmoothScroll>
        </MotionConfig>

        <SpeedInsights />
      </body>
    </html>
  );
}
