"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import RotatingBadge from '@/components/RotatingBadge';
import InfiniteMarquee from '@/components/InfiniteMarquee';
import AnimatedWord from '@/components/AnimatedWord';
import Navbar from '@/components/Navbar';
import TeamCard from '@/components/TeamCard';
import ConnectSection from '@/components/ConnectSection';
import PitchSimulator from "@/components/PitchSimulator";
import AiStories from "@/components/AiStories";

// Curated aesthetic quotes list
const STARTUP_QUOTES = [
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.", author: "Steve Jobs" },
  { text: "Ideas are easy. Implementation is hard.", author: "Guy Kawasaki" },
  { text: "Don't be afraid to assert yourself, have confidence in your abilities and don't let the bastards grind you down.", author: "Michael Bloomberg" },
  { text: "Chase the vision, not the money; the money will end up following you.", author: "Tony Hsieh" }
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuote, setActiveQuote] = useState({ text: "", author: "" });
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Pick a random quote and manage the screen lifecycle timeout
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * STARTUP_QUOTES.length);
    setActiveQuote(STARTUP_QUOTES[randomIndex]);

    // Hold the loading experience for 3.2 seconds for full immersion, then drop the gate
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* 1. Immersive Loading Screen Gate */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              filter: "blur(10px)",
              transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
            }}
            className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center px-6"
          >
            <div className="max-w-2xl text-center space-y-6">
              {/* Animated Accent Accent Bar */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "40px" }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="h-[2px] bg-blue-500 mx-auto"
              />

              {/* The Quote Typography Layout */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                className="text-xl md:text-2xl font-light tracking-wide text-white/90 leading-relaxed italic font-serif"
              >
                "{activeQuote.text}"
              </motion.p>

              {/* The Author Tag */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="text-xs uppercase tracking-widest text-blue-500 font-semibold"
              >
                — {activeQuote.author}
              </motion.p>
            </div>

            {/* Micro loading progress ring or bar at the very bottom */}
            <div className="absolute bottom-12 left-0 w-full flex justify-center">
              <div className="w-32 h-[1px] bg-white/10 overflow-hidden relative rounded-full">
                <motion.div 
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Site System Frame */}
      <div ref={containerRef} className="relative min-h-[200vh] bg-black text-white overflow-hidden">
        
        {/* Parallax Grid Background */}
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute inset-0 bg-grid-pattern opacity-50 z-0 h-[200vh]" 
        />

        {/* Glassmorphism Floating Sticky Header */}
        <Navbar />

        {/* Hero Section */}
        <main className="relative z-10 flex flex-col pt-40 sm:pt-44 md:pt-48 pb-20">
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-between px-6 md:px-10 max-w-7xl mx-auto w-full gap-12 lg:gap-0">
            
            {/* Left Column: Typography Layout */}
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

            {/* Right Column: High-End Rotational Graphic Widget */}
            <div className="flex-1 flex justify-center items-center scale-75 md:scale-100 z-20">
              <RotatingBadge />
            </div>
          </div>

          
        </main>
        {/* Live AI News Stories Feed Panel */}
        <section id="ai-feed" className="relative z-10 py-12 border-b border-white/5">
          <div className="text-center mb-6">
           <h3 className="text-xs font-mono tracking-widest uppercase text-blue-500 font-bold">Live Feed</h3>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1">Today's Intelligence Core</h2>
          </div>
       <AiStories />
        </section>

        {/* Executive Board Section */}
        <section id="team" className="relative z-10 px-6 md:px-10 max-w-7xl mx-auto py-32">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">THE <span className="text-blue-500">BOARD.</span></h2>
            <p className="text-white/60 mt-4 max-w-lg">The minds behind the ecosystem. Hover over the cards to interact with the profiles.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
            <TeamCard name="Angith V Shaji" role="Technical Head" />
            <TeamCard name="Jane Doe" role="President" />
            <TeamCard name="John Smith" role="Operations Head" />
          </div>
        </section>
        
        {/* Interactive Pitch Simulator Sandbox Section */}
      <section id="simulator" className="relative z-10 px-6 md:px-10 max-w-7xl mx-auto py-24 border-t border-white/5">
        <div className="mb-12 text-center md:text-left">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight">
          TEST YOUR <span className="text-blue-500">VENTURE.</span>
      </h2>
      <p className="text-white/60 mt-3 max-w-lg">
      Run your startup architecture choices through our algorithmic sandbox model to generate strategic evaluation metrics instantly.
      </p>
        </div>
  
      <PitchSimulator />
      </section>            

        {/* Premium Social Links & Contact Form Component */}
        <ConnectSection />
        

      </div>
    </>
  );
}