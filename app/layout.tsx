import type { Metadata } from "next";
import "./globals.css"; 
import GlowCursor from "@/components/GlowCursor";
import GlobalBackButton from "@/components/GlobalBackButton";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "BIMTECH E-Cell | Where Aspiration Meets Opportunity",
  description: "Official Entrepreneurship Cell of Birla Institute of Management Technology. Empowering the next generation of founders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-black antialiased selection:bg-blue-500/30 selection:text-white">
        
        {/* Global ambient glow layer */}
        <GlowCursor /> 
        
        {/* 🌐 THE GLOBAL BACK BUTTON SEED NODE (Top Left Corner Placement) */}
        <GlobalBackButton />

        {children}
        
        <SpeedInsights />
      </body>
    </html>
  );
}