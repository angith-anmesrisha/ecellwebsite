"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface Props {
  text: string;
  href: string;
}

export default function FracturedTextButton({ text, href }: Props) {
  const containerRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.2 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    x.set((clientX - centerX) * 0.2);
    y.set((clientY - centerY) * 0.2);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const letters = text.split("");

  return (
    <div className="relative overflow-visible p-6"> 
      <motion.button
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovered(true)}
        onClick={() => window.location.href = href}
        style={{ x: springX, y: springY }}
        className="w-full lg:w-auto px-12 py-5 bg-white text-black text-xs font-black uppercase tracking-[0.3em] rounded-xl relative flex items-center justify-center gap-4 shadow-2xl transition-colors duration-300 hover:bg-zinc-900 hover:text-white select-none overflow-visible"
      >
        {/* Unified text tracking chassis */}
        <span className="flex overflow-visible relative z-10 select-none">
          {letters.map((char, idx) => {
            if (char === " ") return <span key={idx} className="w-2" />;

            
            
            
            
            const midIndex = letters.length / 2;
            const directionFactor = idx - midIndex;
            
            const spreadX = isHovered ? directionFactor * 12 : 0; 
            const spreadY = isHovered ? (idx % 2 === 0 ? -45 : 45) : 0; 
            const randomRotation = isHovered ? (idx % 2 === 0 ? -25 : 25) : 0;

            return (
              <motion.span
                key={idx}
                animate={{
                  x: spreadX,
                  y: spreadY,
                  rotate: randomRotation,
                  scale: isHovered ? 1.3 : 1,
                  color: isHovered ? (idx % 2 === 0 ? "#a855f7" : "#3b82f6") : "currentColor"
                }}
                transition={{
                  type: "spring",
                  stiffness: 140,
                  damping: 11,
                  mass: 0.3,
                  
                  delay: isHovered ? idx * 0.015 : (letters.length - idx) * 0.01
                }}
                className="inline-block will-change-transform font-mono"
              >
                {char}
              </motion.span>
            );
          })}
        </span>

        {/* Vector Link Indicator Arrow */}
        <motion.div
          animate={{
            x: isHovered ? 6 : 0,
            y: isHovered ? -6 : 0,
            scale: isHovered ? 1.25 : 1
          }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="relative z-10 shrink-0"
        >
          <ArrowUpRight size={14} strokeWidth={3} />
        </motion.div>
      </motion.button>
    </div>
  );
}