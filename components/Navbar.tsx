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

  return (
    <>
      <div className="fixed top-6 left-0 w-full flex justify-center px-6 z-[90] pointer-events-none">
        <motion.nav
          layout
          animate={{ borderRadius: "9999px" }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className="pointer-events-auto flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl px-6 h-16 min-h-[64px]"
        >
          <div className="flex items-center justify-between w-full h-full gap-8"> 
            
            {/* Logo Container */}
            <Link href="/" className="relative h-12 w-40 flex items-center shrink-0 cursor-pointer">
              <Image 
                src="/ecell-logo.png" 
                alt="BIMTECH E-Cell Logo"
                fill
                priority
                sizes="180px"
                className="object-contain object-center"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <AnimatePresence mode="popLayout">
              {showLinks && (
                <motion.div
                  initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="hidden md:flex items-center gap-6 h-full relative"
                >
                  <a href="#about" className="text-sm font-medium text-white/70 hover:text-white transition flex items-center h-full">About</a>
                  <a href="#team" className="text-sm font-medium text-white/70 hover:text-white transition flex items-center h-full">Board</a>
                  <a href="#contact" className="text-sm font-medium text-white/70 hover:text-white transition flex items-center h-full">Connect</a>
                  
                  {/* LIVE SELECTION RESULTS DIRECT ROUTE LINK NODE */}
                  <Link href="/results" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition flex items-center h-full relative group">
                    Results
                    <span className="absolute -top-1 -right-4 flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                    </span>
                  </Link>

                  {/* ECOSYSTEM HUB DROPDOWN */}
                  <div className="relative h-full flex items-center" ref={dropdownRef}>
                    <button 
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="text-sm font-medium text-white/70 hover:text-white transition flex items-center gap-1 cursor-pointer focus:outline-none"
                    >
                      Ecosystem <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-blue-400' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-14 right-0 w-56 bg-zinc-950/95 backdrop-blur-xl border border-white/10 p-2 rounded-xl shadow-2xl flex flex-col text-xs"
                        >
                          <Link href="/alumni" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition">
                            <Users size={14} className="text-blue-400" /> Alumni Directory
                          </Link>
                          
                          <Link href="/events" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition">
                            <Calendar size={14} className="text-blue-400" /> Events Hub
                          </Link>

                          <Link href="/graveyard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition">
                            <Skull size={14} className="text-red-400" /> Lessons Archive
                          </Link>

                          <Link href="/recruitment" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition border-t border-white/5 mt-1 pt-2">
                            <Target size={14} className="text-emerald-400" /> Pitch Simulator
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Join Us CTA */}
                  <Link href="/recruitment">
                    <button className="px-4 py-1.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-200 transition shadow-lg shrink-0 self-center cursor-pointer font-sans">
                      Join Us
                    </button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Menu Trigger */}
            <AnimatePresence>
              {showLinks && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="md:hidden text-white flex items-center justify-center h-full cursor-pointer" 
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? <X size={18} /> : <Menu size={18} />}
                </motion.button>
              )}
            </AnimatePresence>

          </div>
        </motion.nav>
      </div>

      {/* Mobile Drawer Layout panel Overlay */}
      <AnimatePresence>
        {isOpen && showLinks && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-6 right-6 bg-black/90 backdrop-blur-xl border border-white/10 z-[89] md:hidden flex flex-col items-center py-6 space-y-4 rounded-2xl shadow-2xl text-xs text-center"
          >
            <a href="#about" className="text-sm font-medium text-white/80 font-sans" onClick={() => setIsOpen(false)}>About</a>
            <a href="#team" className="text-sm font-medium text-white/80 font-sans" onClick={() => setIsOpen(false)}>Board</a>
            <a href="#contact" className="text-sm font-medium text-white/80 font-sans" onClick={() => setIsOpen(false)}>Connect</a>
            
            <div className="w-full border-t border-white/5 my-2 pt-4 flex flex-col items-center space-y-3">
              {/* MOBILE RESULTS DIRECTION ENTRY LINK */}
              <Link href="/results" onClick={() => setIsOpen(false)} className="text-blue-400 font-bold flex items-center gap-1.5 py-1">
                <Award size={14} className="text-blue-400 animate-pulse" /> Cohort Selection Results
              </Link>
              <Link href="/alumni" onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white flex items-center gap-1.5 py-1">
                <Users size={14} className="text-blue-400" /> Alumni Directory
              </Link>
              <Link href="/events" onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white flex items-center gap-1.5 py-1">
                <Calendar size={14} className="text-blue-400" /> Events Hub
              </Link>
              <Link href="/graveyard" onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white flex items-center gap-1.5 py-1">
                <Skull size={14} className="text-red-400" /> Lessons Archive
              </Link>
              <Link href="/recruitment" onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white flex items-center gap-1.5 py-1">
                <Target size={14} className="text-emerald-400" /> Pitch Simulator
              </Link>
            </div>

            <Link href="/recruitment" onClick={() => setIsOpen(false)} className="pt-2 w-full px-6">
              <span className="block w-full px-6 py-2 bg-white text-black text-xs font-bold rounded-full text-center cursor-pointer font-sans">
                Join Us
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}