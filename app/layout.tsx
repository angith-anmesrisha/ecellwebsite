import type { Metadata } from "next";
import "./globals.css"; 
import GlowCursor from "@/components/GlowCursor";

export const metadata: Metadata = {
  title: "BIMTECH E-Cell | Where Aspiration Meets Opportunity",
  description: "Official Entrepreneurship Cell of Birla Institute of Management Technology. Empowering the next generation of founders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GlowCursor /> {/* Global ambient glow layer */}
        {children}
      </body>
    </html>
  );
}