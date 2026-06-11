import type { Metadata } from "next";
import "./globals.css"; 
import FluidBackground from "@/components/FluidBackground"; 
import GlowCursor from "@/components/GlowCursor";
import GlobalBackButton from "@/components/GlobalBackButton";
import PageTransition from "@/components/PageTransition";
import SmoothScroll from "@/components/SmoothScroll"; // 🌟 IMPORT THE NEW LENIS WRAPPER
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "BIMTECH E-Cell | Where Aspiration Meets Opportunity",
  description: "Official Entrepreneurship Cell of Birla Institute of Management Technology. Empowering the next generation of founders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased selection:bg-blue-500/30 selection:text-white overflow-x-hidden relative min-h-screen bg-transparent">
        
        {/* 1. Base Layer (Must render first) */}
        <FluidBackground />

        {/* 2. Interactive Pointers */}
        <GlowCursor /> 
        <GlobalBackButton />

        {/* 3. Global Route & Smooth Scrolling Wrappers */}
        {/* 🌟 ENCAPSULATE CONTENT IN THE INERTIAL SCROLL TUNER */}
        <SmoothScroll>
          <PageTransition>
            {children}
          </PageTransition>
        </SmoothScroll>
        
        <SpeedInsights />
      </body>
    </html>
  );
}