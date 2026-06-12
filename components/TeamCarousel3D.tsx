"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  { id: 1, name: "Don Joe", role: "Technical Head", image: "/team/a.jpg" },
  { id: 2, name: "Jane Doe", role: "President", image: "/team/jane.jpg" },
  { id: 3, name: "John Smith", role: "Operations Head", image: "/team/john.jpg" },
  { id: 4, name: "Anne Marie", role: "Strategic Relations", image: "/team/arnab.jpg" },
  { id: 5, name: "Jaqueline Fernandez", role: "Venture Lead", image: "/team/ankit.jpg" },
];

// 🌟 UPGRADE: Define interface type to accept real-time scroll progress values
interface TeamCarousel3DProps {
  progress?: number;
}

export default function TeamCarousel3D({ progress }: TeamCarousel3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // 🌟 UPGRADE: Automatically rotate cards as the user scrolls across Deck Panel 2
  useEffect(() => {
    if (progress === undefined) return;

    // Deck Panel 2 is active between progress 0.33 and 0.66 of the master track
    const startRange = 0.33;
    const endRange = 0.66;

    if (progress >= startRange && progress <= endRange) {
      // Normalize progress to a clean 0-1 scale inside Panel 2
      const normalizedProgress = (progress - startRange) / (endRange - startRange);
      
      // Map that clean percentage smoothly to the index count of your team array
      const targetIndex = Math.min(
        TEAM_MEMBERS.length - 1,
        Math.floor(normalizedProgress * TEAM_MEMBERS.length)
      );
      
      setActiveIdx(targetIndex);
    }
  }, [progress]);

  const handlePrev = () => {
    if (activeIdx > 0) setActiveIdx((prev) => prev - 1);
  };

  const handleNext = () => {
    if (activeIdx < TEAM_MEMBERS.length - 1) setActiveIdx((prev) => prev + 1);
  };

  return (
    <div ref={containerRef} className="w-full relative py-12 overflow-visible select-none">
      
      {/* 3D Curved Viewport Grid */}
      <div className="relative w-full h-[460px] flex items-center justify-center overflow-visible perspective-1000">
        <div className="w-full max-w-sm h-full relative flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
          
          {TEAM_MEMBERS.map((member, idx) => {
            const offset = idx - activeIdx;
            
            // Curved layout coordinates math
            const rotateY = offset * 28; 
            const translateZ = Math.abs(offset) * -140; 
            const translateX = offset * 260; 
            const opacity = Math.abs(offset) > 2 ? 0 : Math.abs(offset) === 2 ? 0.3 : Math.abs(offset) === 1 ? 0.65 : 1;
            const zIndex = 100 - Math.abs(offset);

            return (
              <motion.div
                key={member.id}
                style={{ zIndex }}
                animate={{
                  opacity,
                  rotateY,
                  z: translateZ,
                  x: translateX,
                }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 18,
                  mass: 0.4
                }}
                className="absolute w-[290px] h-[400px] bg-zinc-950 border border-white/10 rounded-2xl p-4 flex flex-col justify-between overflow-hidden group shadow-2xl backdrop-blur-md cursor-grab active:cursor-grabbing"
              >
                {/* Visual Content Frame */}
                <div className="w-full h-2/3 bg-zinc-900 rounded-xl relative overflow-hidden border border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10 opacity-60" />
                  <div className="w-full h-full flex items-center justify-center text-zinc-800 uppercase text-[10px] font-mono font-bold tracking-widest">
                    Profile Frame
                  </div>
                </div>

                {/* Profile Meta Info Info Rows */}
                <div className="pt-4 space-y-1 relative z-20">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-black tracking-tight text-white uppercase group-hover:text-purple-400 transition-colors duration-300">
                        {member.name}
                      </h4>
                      <p className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase">
                        {member.role}
                      </p>
                    </div>
                    
                    <a 
                      href="#" 
                      className="p-2 bg-white/5 border border-white/10 rounded-full text-zinc-400 hover:text-white hover:bg-purple-500 transition-all duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="absolute bottom-0 right-0 w-6 h-6 border-r border-b border-white/5 rounded-br-2xl group-hover:border-purple-500/30 transition-colors duration-500" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Navigation Bullets UI Container */}
      <div className="flex justify-center items-center gap-8 mt-8 relative z-50">
        <button
          onClick={handlePrev}
          disabled={activeIdx === 0}
          className="p-3 bg-zinc-950 border border-white/10 rounded-full text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent hover:bg-white/5 transition-all duration-300"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex gap-2">
          {TEAM_MEMBERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`h-[3px] rounded-full transition-all duration-500 ${
                idx === activeIdx ? "w-8 bg-purple-500" : "w-2 bg-white/10"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={activeIdx === TEAM_MEMBERS.length - 1}
          className="p-3 bg-zinc-950 border border-white/10 rounded-full text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent hover:bg-white/5 transition-all duration-300"
        >
          <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
}