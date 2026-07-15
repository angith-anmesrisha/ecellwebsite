"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import FractionalTextSplitter from "./FractionalTextSplitter";

interface NavLinkProps {
  href: string;
  label: string;
  tagline: string;
  onClick?: () => void;
}

function MagneticNavLink({ href, label, tagline, onClick }: NavLinkProps) {
  const linkRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  
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

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick();
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
        if (window.history.pushState) {
          window.history.pushState(null, "", window.location.pathname);
        }
      }
    } else {
      router.push(href);
    }
  };

  return (
    <Link href={href} onClick={handleClick}>
      <motion.div
        ref={linkRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovered(true)}
        style={{ x: springX, y: springY }}
        className="relative px-5 py-3 cursor-pointer group flex items-center justify-center overflow-visible"
      >
        <span className="absolute inset-0 scale-75 bg-white/[0.03] rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out" />
        <span className="relative z-10 text-xs font-mono font-medium tracking-widest uppercase flex items-center justify-center overflow-visible">
          <FractionalTextSplitter text={label} subText={tagline} isHovered={isHovered} />
        </span>
      </motion.div>
    </Link>
  );
}

export default function Navbar() {
  const [btnHover, setBtnHover] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-[100] px-6 py-4 md:px-10 bg-gradient-to-b from-black/80 via-black/20 to-transparent backdrop-blur-2xs select-none overflow-visible">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center overflow-visible">
          
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
            <span className="font-mono text-xs font-black tracking-[0.3em] uppercase text-white">
              E-Cell
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-zinc-950/40 border border-white/5 rounded-full px-4 py-1.5 backdrop-blur-md shadow-2xl overflow-visible">
            <MagneticNavLink href="#ai-feed" label="Trends" tagline="live//feed" />
            <MagneticNavLink href="#ecosystem" label="Ecosystem" tagline="network" />
            <MagneticNavLink href="/results" label="Results" tagline="live//results" />
            <MagneticNavLink href="#team" label="The Board" tagline="architects" />
            <MagneticNavLink href="#simulator" label="Sandbox" tagline="model.test" />
          </div>

          <div className="flex items-center gap-2 overflow-visible">
            <div className="hidden sm:block overflow-visible">
              <Link href="/recruitment">
                <motion.button 
                  onMouseEnter={() => setBtnHover(true)}
                  onMouseLeave={() => setBtnHover(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 border border-white/10 bg-zinc-950/40 rounded-full font-mono text-[10px] tracking-widest uppercase text-white transition-all duration-300 shadow-xl flex items-center justify-center overflow-visible min-w-[130px]"
                >
                  <FractionalTextSplitter text="Apply Portal" subText="enter//sys" isHovered={btnHover} />
                </motion.button>
              </Link>
            </div>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="p-2.5 border border-white/10 bg-zinc-950/40 rounded-full text-white md:hidden hover:bg-white/5 transition"
            >
              {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>

        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[72px] bg-black/95 backdrop-blur-lg border-b border-white/10 z-[90] flex flex-col p-6 space-y-2 md:hidden font-mono text-center"
          >
            <MagneticNavLink href="#ai-feed" label="Trends" tagline="live//feed" onClick={() => setIsMobileMenuOpen(false)} />
            <MagneticNavLink href="#ecosystem" label="Ecosystem" tagline="network" onClick={() => setIsMobileMenuOpen(false)} />
            <MagneticNavLink href="/results" label="Results" tagline="live//results" onClick={() => setIsMobileMenuOpen(false)} />
            <MagneticNavLink href="#team" label="The Board" tagline="architects" onClick={() => setIsMobileMenuOpen(false)} />
            <MagneticNavLink href="#simulator" label="Sandbox" tagline="model.test" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="pt-4 border-t border-white/5">
              <Link href="/recruitment">
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest rounded-full text-xs">
                  Apply Portal
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}