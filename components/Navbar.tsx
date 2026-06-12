"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import FractionalTextSplitter from "./FractionalTextSplitter";

interface NavLinkProps {
  href: string;
  label: string;
  tagline: string;
}

function MagneticNavLink({ href, label, tagline }: NavLinkProps) {
  const linkRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
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
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={linkRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      style={{ x: springX, y: springY }}
      className="relative px-5 py-3 cursor-pointer group flex items-center justify-center overflow-visible"
    >
      <span className="absolute inset-0 scale-75 bg-white/[0.03] rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out" />
      
      <Link href={href} className="relative z-10 text-xs font-mono font-medium tracking-widest uppercase flex items-center justify-center overflow-visible">
        <FractionalTextSplitter text={label} subText={tagline} isHovered={isHovered} />
      </Link>
    </motion.div>
  );
}

export default function Navbar() {
  const [btnHover, setBtnHover] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-[100] px-6 py-4 md:px-10 bg-gradient-to-b from-black/80 via-black/20 to-transparent backdrop-blur-2xs select-none overflow-visible">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center overflow-visible">
        
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
          {/* 🌟 PRODUCTION FIX: Removed group-hover:text-purple-400 and transition-colors */}
          <span className="font-mono text-xs font-black tracking-[0.3em] uppercase text-white">
            E-Cell
          </span>
        </Link>

        {/* Magnetic Center Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-zinc-950/40 border border-white/5 rounded-full px-4 py-1.5 backdrop-blur-md shadow-2xl overflow-visible">
          <MagneticNavLink href="#ai-feed" label="Trends" tagline="live//feed" />
          <MagneticNavLink href="#ecosystem" label="Ecosystem" tagline="network" />
          <MagneticNavLink href="#team" label="The Board" tagline="architects" />
          <MagneticNavLink href="#simulator" label="Sandbox" tagline="model.test" />
        </div>

        {/* Application Portal Entry Trigger */}
        <div className="flex items-center gap-4 overflow-visible">
          <Link href="/recruitment">
            <motion.button 
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              /* 🌟 PRODUCTION FIX: Removed hover:border-purple-500/40 and hover:bg-purple-500/10 to clear native color animations */
              className="px-6 py-3 border border-white/10 bg-zinc-950/40 rounded-full font-mono text-[10px] tracking-widest uppercase text-white transition-all duration-300 shadow-xl flex items-center justify-center overflow-visible min-w-[130px]"
            >
              <FractionalTextSplitter text="Apply Portal" subText="enter//sys" isHovered={btnHover} />
            </motion.button>
          </Link>
        </div>

      </div>
    </nav>
  );
}