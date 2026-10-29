"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import TeamCarousel3D from "./TeamCarousel3D";
import type { TeamMember } from "@/lib/content-types";
import PitchSimulator from "./PitchSimulator";
import KineticTextReveal from "./KineticTextReveal";

// Share of the pinned scroll spent sliding from the intro panel to the team panel;
// the rest steps through the board members one by one.
const SLIDE_PORTION = 0.25;

function BoardIntro() {
  return (
    <div className="max-w-xl space-y-4">
      <KineticTextReveal
        text="// Meet the team"
        className="text-xs font-mono tracking-widest uppercase text-accent-300 font-bold"
        delay={0.1}
      />
      <h2 className="text-5xl md:text-6xl font-bold tracking-tight uppercase leading-none text-white">
        The Board <br />
        <span className="text-accent-400 block mt-2">Behind E-Cell</span>
      </h2>
      <p className="text-white/60 font-sans text-sm md:text-base leading-relaxed pt-2">
        The students and mentor who run events, bring in speakers and partners, and help founders on campus get started.
      </p>
    </div>
  );
}

function BoardHeader({ count, tenure }: { count: number; tenure: string }) {
  return (
    <div className="border-b border-white/10 pb-4 flex items-center justify-between gap-4 font-mono text-[10px] tracking-widest uppercase">
      <span className="text-accent-300 font-bold">01 // Executive board {tenure}</span>
      <span className="flex items-center gap-4">
        <span className="text-white/50">{count} members</span>
        <Link href="/team" className="text-white/60 hover:text-accent-300 transition-colors">Past boards</Link>
      </span>
    </div>
  );
}

// Desktop: the section pins while the visitor scrolls, slides sideways to the team,
// then advances one member per scroll step. Scroll values drive transforms directly
// (no React state per frame); state only changes when the active member changes.
interface BoardProps {
  members: TeamMember[];
  tenure: string;
}

function PinnedBoard({ members, tenure }: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, SLIDE_PORTION], ["0vw", "-100vw"]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (progress < SLIDE_PORTION) return;
    const normalized = (progress - SLIDE_PORTION) / (1 - SLIDE_PORTION);
    const idx = Math.min(members.length - 1, Math.floor(normalized * members.length));
    setActiveIdx((prev) => (prev === idx ? prev : idx));
  });

  return (
    <div ref={containerRef} className="relative h-[350vh] w-full">
      {/* Navbar "The Board" lands here, just after the slide finishes */}
      <span id="team" className="absolute left-0" style={{ top: "34%" }} aria-hidden="true" />

      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center border-y border-white/10 bg-space/40 backdrop-blur-sm">
        <motion.div style={{ x }} className="flex h-full w-[200vw] will-change-transform">
          <div className="w-screen h-full flex flex-col justify-center px-12 md:px-24 shrink-0">
            <BoardIntro />
          </div>
          <div className="w-screen h-full flex flex-col justify-center px-12 md:px-20 shrink-0 border-l border-white/10">
            <div className="w-full max-w-7xl mx-auto space-y-4">
              <BoardHeader count={members.length} tenure={tenure} />
              <TeamCarousel3D members={members} activeIdx={activeIdx} onChange={setActiveIdx} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Phones and tablets: a normal section with a swipeable carousel, no scroll hijacking.
function StackedBoard({ members, tenure }: BoardProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  return (
    <section id="team" className="relative w-full px-6 py-24 border-t border-white/10 space-y-10 scroll-mt-20">
      <BoardIntro />
      <div className="space-y-2">
        <BoardHeader count={members.length} tenure={tenure} />
        <TeamCarousel3D members={members} activeIdx={activeIdx} onChange={setActiveIdx} />
      </div>
    </section>
  );
}

export default function HorizonSlideDeck({
  members,
  tenure,
  showBoard = true,
  showSandbox = true,
}: BoardProps & { showBoard?: boolean; showSandbox?: boolean }) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <>
      {showBoard &&
        members.length > 0 &&
        (isDesktop === null ? (
          <div className="h-screen" />
        ) : isDesktop ? (
          <PinnedBoard members={members} tenure={tenure} />
        ) : (
          <StackedBoard members={members} tenure={tenure} />
        ))}

      {showSandbox && (
      <section id="simulator" className="relative w-full px-6 md:px-20 py-24 md:py-32 border-t border-white/10 scroll-mt-20">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[10px] tracking-widest uppercase">
            <span className="text-nebula-300 font-bold">02 // Startup idea sandbox</span>
            <span className="text-white/50">Get instant AI feedback on your idea</span>
          </div>
          <div className="w-full max-w-4xl mx-auto">
            <PitchSimulator />
          </div>
        </div>
      </section>
      )}
    </>
  );
}
