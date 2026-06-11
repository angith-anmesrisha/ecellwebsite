"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface NavLinkProps {
  href: string;
  label: string;
}

function MagneticNavLink({ href, label }: NavLinkProps) {
  const linkRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 250, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 250, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!linkRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = linkRef.current.getBoundingClientRect();
    
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    x.set((clientX - centerX) * 0.35);
    y.set((clientY - centerY) * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={linkRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="relative px-4 py-2 cursor-pointer group"
    >
      <span className="absolute inset-0 scale-75 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out" />
      
      <Link href={href} className="relative z-10 text-xs font-mono font-medium tracking-widest uppercase text-white/60 group-hover:text-purple-400 transition-colors duration-300">
        {label}
      </Link>
    </motion.div>
  );
}

export default function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-[100] px-6 py-4 md:px-10 bg-gradient-to-b from-black/80 via-black/20 to-transparent backdrop-blur-2xs select-none">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        
        {/* Official E-Cell Brand Logo Integration */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
            <Image 
              src="/ecell-logo.png" 
              alt="BIMTECH E-Cell Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-mono text-xs font-black tracking-[0.3em] uppercase text-white group-hover:text-purple-400 transition-colors duration-300">
            E-Cell
          </span>
        </Link>

        {/* Magnetic Center Navigation Links */}
        <div className="hidden md:flex items-center gap-2 bg-zinc-950/40 border border-white/5 rounded-full px-3 py-1.5 backdrop-blur-md shadow-2xl">
          <MagneticNavLink href="#ai-feed" label="Trends" />
          <MagneticNavLink href="#ecosystem" label="Ecosystem" />
          <MagneticNavLink href="#team" label="The Board" />
          <MagneticNavLink href="#simulator" label="Sandbox" />
        </div>

        {/* Application Portal Entry Trigger */}
        <div className="flex items-center gap-4">
          <Link href="/recruitment">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 border border-white/10 hover:border-purple-500/40 bg-zinc-950/40 hover:bg-purple-500/10 rounded-full font-mono text-[10px] tracking-widest uppercase text-white transition-all duration-300 shadow-xl"
            >
              Apply Portal
            </motion.button>
          </Link>
        </div>

      </div>
    </nav>
  );
}