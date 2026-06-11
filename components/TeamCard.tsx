"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";

interface TeamCardProps {
  name: string;
  role: string;
  imagePath?: string; // Future-proof prop: Pass an image URL like "/team/angith.jpg" later
}

export default function TeamCard({ name, role, imagePath }: TeamCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Use lower velocity tracking motion values to eliminate micro-stutter
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Softened spring values: lower stiffness and higher damping create that heavy, premium glide
  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 22, mass: 0.6 });
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 22, mass: 0.6 });

  // Tightened tilt range to max 8 degrees for a cleaner, high-end look
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    // Normalized calculation relative to center point
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="relative w-full h-[360px] perspective-1000">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ 
          rotateX, 
          rotateY, 
          transformStyle: "preserve-3d" 
        }}
        className="relative w-full h-full rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-white/10 flex flex-col justify-end overflow-hidden p-6 cursor-pointer group transition-colors duration-500 shadow-2xl select-none"
      >
        {/* 1. BACKGROUND LAYER: Handles images smoothly or falls back to a clean mesh gradient */}
        <div className="absolute inset-0 z-0 transition-transform duration-700 ease-out group-hover:scale-105">
          {imagePath ? (
            <>
              <Image
                src={imagePath}
                alt={name}
                fill
                className="object-cover object-center brightness-[0.7] group-hover:brightness-[0.8] transition-all duration-500"
              />
              {/* Premium dark vignette overlay so text is always readable over photos */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </>
          ) : (
            // Fallback premium layout when no image is uploaded yet
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900/50 to-black bg-cyber-grid opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          )}
        </div>

        {/* 2. DYNAMIC BACKGLOW: Appears softly on hover behind the card frame */}
        <div 
          style={{ transform: "translateZ(-20px)" }}
          className="absolute inset-0 rounded-2xl bg-blue-500/0 group-hover:bg-blue-500/5 transition-all duration-700 blur-3xl -z-10" 
        />
        
        {/* 3. FOREGROUND CONTENT LAYER: Pushed forward along Z-Axis */}
        <div className="space-y-3 relative z-10" style={{ transformStyle: "preserve-3d" }}>
          
          {/* Decorative Minimal Domain Indicator Bar */}
          <div 
            style={{ transform: "translateZ(20px)" }}
            className="w-8 h-[2px] bg-blue-500/60 group-hover:bg-blue-400 group-hover:w-12 transition-all duration-500 rounded-full"
          />

          {/* Typography Matrix - Separated cleanly to prevent jitter */}
          <div className="space-y-0.5" style={{ transform: "translateZ(40px)" }}>
            <h3 className="text-lg font-black uppercase text-white tracking-wide group-hover:text-blue-400 transition-colors duration-300">
              {name}
            </h3>
            <p className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase font-bold">
              {role}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}