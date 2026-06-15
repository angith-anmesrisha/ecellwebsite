"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function FluidHoverTile({ children, onClick, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  
  const contentX = useMotionValue(0);
  const contentY = useMotionValue(0);
  const springX = useSpring(contentX, { stiffness: 150, damping: 20, mass: 0.2 });
  const springY = useSpring(contentY, { stiffness: 150, damping: 20, mass: 0.2 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const bounds = containerRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    mouseX.set(x);
    mouseY.set(y);

    
    const pctX = (x / bounds.width) - 0.5;
    const pctY = (y / bounds.height) - 0.5;
    contentX.set(pctX * 12);
    contentY.set(pctY * 12);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    contentX.set(0);
    contentY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`group relative bg-zinc-950 overflow-hidden cursor-pointer selection-none p-8 min-h-[260px] ${className}`}
    >
      {/* 🌟 SPHERICAL SPOTLIGHT GLOW: Calculated dynamically via hardware properties using explicit colors */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
        style={{
          background: `radial-gradient(220px circle at ${mouseX.get()}px ${mouseY.get()}px, rgba(168, 85, 247, 0.08), transparent 80%)`,
        }}
      />

      {/* Crystalline Corner Grid Accent Anchor Layout Lines */}
      <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-white/[0.03] group-hover:border-purple-500/30 transition-colors duration-500 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l border-b border-white/[0.03] group-hover:border-purple-500/30 transition-colors duration-500 pointer-events-none" />

      {/* Floating Inertial Interior Content Container */}
      <motion.div
        style={{ x: springX, y: springY }}
        className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-none"
      >
        {children}
      </motion.div>
    </div>
  );
}