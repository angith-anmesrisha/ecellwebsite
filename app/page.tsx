"use client"; // Required because we are tracking scroll state

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import RotatingBadge from '@/components/RotatingBadge';
import InfiniteMarquee from '@/components/InfiniteMarquee';
import AnimatedWord from '@/components/AnimatedWord';
import Navbar from '@/components/Navbar';
import TeamCard from '@/components/TeamCard';

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax translation: The background moves 50% slower than the foreground
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div ref={containerRef} className="relative min-h-[200vh] bg-black text-white overflow-hidden">
      
      {/* Parallax Grid Background */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 bg-grid-pattern opacity-50 z-0 h-[200vh]" 
      />

      <Navbar />

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col pt-32 md:pt-48 pb-20">
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-between px-6 md:px-10 max-w-7xl mx-auto w-full gap-12 lg:gap-0">
          
          {/* Left Column: Typography */}
          <div className="flex-1 space-y-4 md:space-y-6 text-center lg:text-left z-20">
            <p className="text-blue-500 font-medium tracking-widest uppercase text-xs md:text-sm">
              Where Aspiration Meets Opportunity
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight flex flex-col md:block">
              <span>WE HELP YOU </span>
              <AnimatedWord />
            </h1>
            <p className="max-w-md mx-auto lg:mx-0 text-white/60 text-base md:text-lg mt-4">
              Empowering the next generation of founders at BIMTECH. We help turn your ideas into impactful ventures.
            </p>
          </div>

          {/* Right Column: Rotational Graphic */}
          <div className="flex-1 flex justify-center items-center scale-75 md:scale-100 z-20">
            <RotatingBadge />
          </div>
        </div>

        <div className="w-full mt-24 z-20">
          <InfiniteMarquee />
        </div>
      </main>

      {/* Team Board Section */}
      <section id="team" className="relative z-10 px-6 md:px-10 max-w-7xl mx-auto py-32">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">THE <span className="text-blue-500">BOARD.</span></h2>
          <p className="text-white/60 mt-4 max-w-lg">The minds behind the ecosystem. Hover over the cards to interact with the profiles.</p>
        </div>
        
        {/* CSS Grid for Mobile and Desktop layouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
          <TeamCard name="Angith V Shaji" role="Technical Head" />
          <TeamCard name="Jane Doe" role="President" />
          <TeamCard name="John Smith" role="Operations Head" />
        </div>
      </section>

    </div>
  );
}