import type { Metadata } from "next";
import "./globals.css"; 
import GlowCursor from "@/components/GlowCursor";
import GlobalBackButton from "@/components/GlobalBackButton";
import PageTransition from "@/components/PageTransition";
import SmoothScroll from "@/components/SmoothScroll"; 
import CrystallineParticleMatrix from "@/components/CrystallineParticleMatrix";
import NativeFluidRipple from "@/components/NativeFluidRipple"; // 🌟 Import the new engine
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "BIMTECH E-Cell | Where Aspiration Meets Opportunity",
  description: "Official Entrepreneurship Cell of Birla Institute of Management Technology. Empowering the next generation of founders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased selection:bg-blue-500/30 selection:text-white overflow-x-hidden relative min-h-screen bg-transparent">
        
        {/* 🌟 Background Matrix Dots layer */}
        <CrystallineParticleMatrix />

        {/* 🌟 Native physical concentric water ripples overlaying the viewport screen */}
        <NativeFluidRipple />

        {/* Interactive Premium Pointers */}
        <GlowCursor /> 
        <GlobalBackButton />

        {/* Smooth Single Page Architecture Rollout */}
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