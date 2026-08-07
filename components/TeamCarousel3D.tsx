"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  linkedin: string; 
}

const TEAM_MEMBERS: TeamMember[] = [
  { id: 1, name: "Dr. Shalini Singh", role: "Mentor - E-Cell", image: "/team/Shalini.jpeg", linkedin: "https://www.linkedin.com/in/dr-shalini-singh/" },
  { id: 2, name: "Angith V Shaji", role: "Tech/Operations/Finance", image: "/team/Angith.jpg", linkedin: "https://www.linkedin.com/in/angith-v-shaji/" },
  { id: 3, name: "Aditi Jain", role: "People & Team Coordinator", image: "/team/Aditi.jpg", linkedin: "https://www.linkedin.com/in/aditi-jain-812848305/" },
  { id: 4, name: "Vishnu J", role: "Media and Communications", image: "/team/vishnu.jpg", linkedin: "https://www.linkedin.com/in/viisshnu-j/" },
  { id: 5, name: "Rishi Agrawal", role: "Media and Communications", image: "/team/Rishi.jpg", linkedin: "https://www.linkedin.com/in/rishiagrawalin/" },
  { id: 6, name: "Anoushka Singh", role: "Sponsorship and Strategic Relations", image: "/team/ankit.jpg", linkedin: "https://www.linkedin.com/in/anoushkasinghh/" },
  { id: 7, name: "Pranav Pahuja", role: "Operations/Finance", image: "/team/Pranav.jpg", linkedin: "https://www.linkedin.com/in/pranav-pahuja-b660691bb/" },
  { id: 8, name: "Dharmik Patel", role: "Sponsorship and Strategic Relations", image: "/team/Dharmik.jpg", linkedin: "https://www.linkedin.com/in/dharmik-patel-a8ba64195" },
  { id: 9, name: "Shambu Monga", role: "Media and Communications", image: "/team/Shambu.jpg", linkedin: "https://www.linkedin.com/in/shambhu-monga" },
  { id: 10, name: "Aditya Vats", role: "Sponsorship and Strategic Relations", image: "/team/Aditya.jpg", linkedin: "https://www.linkedin.com/in/aditya-vats-53b94521a" },
  { id: 11, name: "Koushal Ostwal", role: "Media and Communications", image: "/team/Koushal.jpg", linkedin: "https://www.linkedin.com/in/koushal-ostwal/" },
  { id: 12, name: "ThirumalaiRajan", role: "Operations/Finance", image: "/team/Thiru.jpeg", linkedin: "https://www.linkedin.com/in/thirumalai-rajan-73267720a/" },
  { id: 13, name: "Harshit Kothari Jain", role: "Sponsorship and Strategic Relations", image: "/team/Harshit.jpg", linkedin: "https://www.linkedin.com/in/harshit-kothari-jain-b53503267/" },
  { id: 14, name: "Gautam Khandelwal", role: "Media and Communications", image: "/team/arnab.jpg", linkedin: "https://www.linkedin.com/in/gautam-khandelwal/" },
  { id: 15, name: "Aniruddh Topaz Banerjee", role: "Tech/Operations", image: "/team/arnab.jpg", linkedin: "https://www.linkedin.com/in/aniruddhbanerjee31" },
  { id: 16, name: "Naman Kurkeja", role: "Sponsorship and Strategic Relations", image: "/team/arnab.jpg", linkedin: "https://www.linkedin.com/in/naman-kukreja-a753461a7/" },
  { id: 17, name: "Mayank Handa", role: "People & Team Coordinator", image: "/team/Mayank.jpg", linkedin: "https://www.linkedin.com/in/mayank-handa-13b650166" },
  { id: 18, name: "Madhur Kala", role: "Operations/Finance", image: "/team/Madhur.jpg", linkedin: "https://linkedin.com/in/madhur-kala" }
];


interface TeamCarousel3DProps {
  progress?: number;
}

export default function TeamCarousel3D({ progress }: TeamCarousel3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  
  useEffect(() => {
    if (progress === undefined) return;

    
    const startRange = 0.33;
    const endRange = 0.66;

    if (progress >= startRange && progress <= endRange) {
      
      const normalizedProgress = (progress - startRange) / (endRange - startRange);
      
      
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
                {/* Visual Content Frame - Updated to show image */}
                <div className="w-full h-2/3 bg-zinc-900 rounded-xl relative overflow-hidden border border-white/5">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10 opacity-90" />
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
                    
                    {/* LinkedIn Anchor Tag */}
                    <a 
                      href={member.linkedin}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-white/5 border border-white/10 rounded-full text-zinc-400 hover:text-white hover:bg-purple-500 transition-all duration-300 z-30"
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