"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Users, Skull, Target, Calendar, Award } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Dynamic state tracking to map which tab the cursor is sitting over
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  
  const lastScrollY = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowLinks(true);
      } 
      else if (currentScrollY < lastScrollY.current) {
        setShowLinks(false);
        setIsOpen(false);
        setDropdownOpen(false);
      }

      lastScrollY.current = currentScrollY;
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItems = [
    { name: "About", id: "about", href: "#about" },
    { name: "Board", id: "team", href: "#team" },
    { name: "Connect", id: "contact", href: "#contact" }
  ];

  return (
    <>
      <div className="fixed top-6 left-0 w-full flex justify-center px-6 z-[999] pointer-events-none font-mono text-xs">
        <motion.nav
          layout
          className="pointer-events-auto flex items-center justify-between bg-black/40 backdrop-blur-xl border border-white/5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] px-6 h-16 min-h-[64px] rounded-full max-w-fit mx-auto transition-all duration-300"
        >
          <div className="flex items-center gap-8 h-full"> 
            
            {/* Fully Rounded Logo Clip Anchor */}
            <Link href="/" className="relative h-9 w-28 flex items-center shrink-0 cursor-pointer rounded-full overflow-hidden">
              <Image 
                src="/ecell-logo.png" 
                alt="BIMTECH E-Cell Logo"
                fill
                priority
                sizes="120px"
                className="object-contain object-center"
              />
            </Link>

            {/* Desktop Navigation Links — Contained completely inside a safety layout clipping mask */}
            <AnimatePresence mode="wait">
              {showLinks && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                  transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                  className="hidden md:flex items-center gap-1 h-full relative overflow-visible pointer-events-auto"
                  onMouseLeave={() => setHoveredTab(null)}
                >
                  {menuItems.map((item) => (
                    <a 
                      key={item.id}
                      href={item.href} 
                      onMouseEnter={() => setHoveredTab(item.id)}
                      className={`relative z-10 px-4 py-2 font-bold rounded-full transition-colors duration-300 uppercase tracking-wider ${
                        hoveredTab === item.id ? "text-white" : "text-white/60"
                      }`}
                    >
                      {item.name}
                      {hoveredTab === item.id && (
                        <motion.span
                          layoutId="nav-sliding-pill"
                          transition={{ type: "spring", stiffness: 420, damping: 30 }}
                          className="absolute inset-0 bg-white/10 border border-white/5 rounded-full -z-10"
                        />
                      )}
                    </a>
                  ))}
                  
                  {/* Results Target Link */}
                  <Link 
                    href="/results" 
                    onMouseEnter={() => setHoveredTab("results")}
                    className={`relative z-10 px-4 py-2 font-black rounded-full transition-colors duration-300 uppercase tracking-wider ${
                      hoveredTab === "results" ? "text-blue-300" : "text-blue-400"
                    }`}
                  >
                    Results
                    {hoveredTab === "results" && (
                      <motion.span
                        layoutId="nav-sliding-pill"
                        transition={{ type: "spring", stiffness: 420, damping: 30 }}
                        className="absolute inset-0 bg-blue-500/10 border border-blue-500/20 rounded-full -z-10"
                      />
                    )}
                    <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                    </span>
                  </Link>

                  {/* Dropdown Scope Menu Wrapper */}
                  <div className="relative flex items-center h-full" ref={dropdownRef}>
                    <button 
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      onMouseEnter={() => setHoveredTab("ecosystem")}
                      className={`relative z-10 px-4 py-2 font-bold rounded-full transition-colors duration-300 flex items-center gap-1 cursor-pointer focus:outline-none uppercase tracking-wider ${
                        hoveredTab === "ecosystem" || dropdownOpen ? "text-white" : "text-white/60"
                      }`}
                    >
                      Ecosystem <ChevronDown size={12} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180 text-blue-400' : ''}`} />
                      {hoveredTab === "ecosystem" && (
                        <motion.span
                          layoutId="nav-sliding-pill"
                          transition={{ type: "spring", stiffness: 420, damping: 30 }}
                          className="absolute inset-0 bg-white/10 border border-white/5 rounded-full -z-10"
                        />
                      )}
                    </button>

                    {/* Dropdown Container: Reconstructed with rounded edges, micro-shadows, and a clean pointer layout */}
                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-full right-0 mt-3 w-52 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 p-1.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col text-[11px] pointer-events-auto z-[9999]"
                        >
                          <Link href="/alumni" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors duration-200">
                            <Users size={13} className="text-blue-500" /> Alumni Directory
                          </Link>
                          
                          <Link href="/events" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors duration-200">
                            <Calendar size={13} className="text-blue-500" /> Events Hub
                          </Link>

                          <Link href="/graveyard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors duration-200">
                            <Skull size={13} className="text-red-500" /> Lessons Archive
                          </Link>

                          <Link href="/recruitment" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors duration-200 border-t border-white/5 mt-1 pt-2">
                            <Target size={13} className="text-emerald-500" /> Pitch Simulator
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Join Us CTA */}
                  <Link href="/recruitment" className="ml-1">
                    <button className="px-5 py-2 bg-white text-black font-black rounded-full hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer uppercase tracking-wider text-[11px]">
                      Join Us
                    </button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Menu Trigger Container */}
            <AnimatePresence>
              {showLinks && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="md:hidden text-white flex items-center justify-center p-2.5 bg-white/5 border border-white/5 rounded-full cursor-pointer pointer-events-auto" 
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? <X size={13} /> : <Menu size={13} />}
                </motion.button>
              )}
            </AnimatePresence>

          </div>
        </motion.nav>
      </div>

      {/* Mobile Sidebar Layout Drawer Overlay Panel */}
      <AnimatePresence>
        {isOpen && showLinks && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-6 right-6 bg-zinc-950 border border-white/5 z-[998] md:hidden flex flex-col items-center py-6 space-y-4 rounded-3xl shadow-2xl text-[11px] text-center font-mono"
          >
            {menuItems.map((item) => (
              <a key={item.id} href={item.href} className="text-xs font-bold text-white/70 uppercase tracking-widest" onClick={() => setIsOpen(false)}>{item.name}</a>
            ))}
            
            <div className="w-full border-t border-white/5 my-2 pt-4 flex flex-col items-center space-y-3">
              <Link href="/results" onClick={() => setIsOpen(false)} className="text-blue-400 font-black flex items-center gap-1.5 uppercase tracking-wider">
                <Award size={13} className="animate-pulse" /> Selection Results
              </Link>
              <Link href="/alumni" onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white flex items-center gap-2 uppercase tracking-wider">
                <Users size={13} className="text-blue-500" /> Alumni Directory
              </Link>
              <Link href="/events" onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white flex items-center gap-2 uppercase tracking-wider">
                <Calendar size={13} className="text-blue-500" /> Events Hub
              </Link>
              <Link href="/graveyard" onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white flex items-center gap-2 uppercase tracking-wider">
                <Skull size={13} className="text-red-500" /> Lessons Archive
              </Link>
              <Link href="/recruitment" onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white flex items-center gap-2 uppercase tracking-wider">
                <Target size={13} className="text-emerald-500" /> Pitch Simulator
              </Link>
            </div>

            <Link href="/recruitment" onClick={() => setIsOpen(false)} className="pt-2 w-full px-6">
              <span className="block w-full py-3 bg-white text-black font-black rounded-full text-center uppercase tracking-widest">
                Join Us
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}