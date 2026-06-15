"use client";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import TeamCarousel3D from "./TeamCarousel3D";
import PitchSimulator from "./PitchSimulator";
import KineticTextReveal from "./KineticTextReveal";
export default function HorizonSlideDeck() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFixed, setIsFixed] = useState(false);
  const [isPast, setIsPast] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = containerRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      const totalScrollableDistance = containerHeight - windowHeight;
      const currentScrollPosition = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScrollPosition / totalScrollableDistance));
      setScrollProgress(progress);
      if (rect.top <= 0 && -rect.top <= totalScrollableDistance) {
        setIsFixed(true);
        setIsPast(false);
      } else if (-rect.top > totalScrollableDistance) {
        setIsFixed(false);
        setIsPast(true);
      } else {
        setIsFixed(false);
        setIsPast(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const xTranslate = `${-scrollProgress * 200}vw`;
  return (
    <div
      ref={containerRef}
      className="relative h-[300vh] w-full bg-transparent"
    >
      {}
      <div
        className={`w-full h-screen overflow-hidden flex items-center border-t border-b border-white/10 bg-zinc-950/20 backdrop-blur-3xl transition-shadow duration-300 ${
          isFixed
            ? "fixed top-0 left-0 z-50 shadow-2xl"
            : isPast
            ? "absolute bottom-0 left-0"
            : "absolute top-0 left-0"
        }`}
      >
        {}
        <motion.div
          animate={{ x: xTranslate }}
          transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.2 }}
          className="flex h-full w-[300vw] will-change-transform bg-transparent"
        >
          {}
          <div className="w-screen h-full flex flex-col justify-center px-12 md:px-24 shrink-0 relative bg-transparent">
            <div className="max-w-xl space-y-4">
              <KineticTextReveal
                text="// System Architecture Matrix"
                className="text-xs font-mono tracking-widest uppercase text-purple-400 font-bold"
                delay={0.1}
              />
              <h2 className="text-5xl md:text-6xl font-black tracking-tight uppercase leading-none text-white">
                LEADERSHIP <br />
                <span className="text-purple-500 block mt-2">&amp; LABS Matrix</span>
              </h2>
              <p className="text-white/40 font-sans text-sm leading-relaxed pt-2">
                E-Cell core systems initialized. Continue scrolling naturally downward to slide horizontally into the active team control array frames.
              </p>
              <div className="pt-6 flex items-center gap-3 font-mono text-[10px] text-purple-400/60 animate-pulse">
                <span>ROTATE WHEEL DOWN TO DEPLOY</span>
                <span>→</span>
              </div>
            </div>
          </div>
          {}
          <div id="team" className="w-screen h-full flex flex-col justify-center px-12 md:px-20 shrink-0 border-l border-r border-white/10 bg-transparent relative scroll-mt-24">
            <div className="w-full max-w-7xl mx-auto space-y-6">
              <div className="border-b border-white/5 pb-4 flex items-center justify-between font-mono text-[10px] tracking-widest">
                <span className="text-purple-400 font-bold">01
                <span className="text-white/20">
              </div>
              <div className="w-full overflow-hidden max-h-[460px] flex items-center justify-center relative">
                {}
                <TeamCarousel3D progress={scrollProgress} />
              </div>
            </div>
          </div>
          {}
          <div id="simulator" className="w-screen h-full flex flex-col justify-center px-12 md:px-20 shrink-0 bg-transparent relative scroll-mt-24">
            <div className="w-full max-w-6xl mx-auto space-y-6">
              <div className="border-b border-white/5 pb-4 flex items-center justify-between font-mono text-[10px] tracking-widest">
                <span className="text-blue-400 font-bold">02
                <span className="text-white/20">
              </div>
              <div className="w-full max-w-4xl mx-auto">
                <PitchSimulator />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}