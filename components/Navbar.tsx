"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to shrink and blur the navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "py-3 bg-black/60 backdrop-blur-md border-b border-white/10 shadow-2xl" : "py-6 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex justify-between items-center">
          <div className="relative flex items-center">
            <Image 
              src="/ecell-logo.png" 
              alt="BIMTECH E-Cell Logo"
              width={scrolled ? 100 : 120} 
              height={40} 
              className="object-contain transition-all duration-300"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm font-medium text-white/70 hover:text-white transition">About</a>
            <a href="#team" className="text-sm font-medium text-white/70 hover:text-white transition">Board</a>
            <button className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition">
              Login / Signup
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[70px] left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 z-40 md:hidden flex flex-col items-center py-8 space-y-6 shadow-2xl"
          >
            <a href="#about" className="text-lg font-medium text-white/80" onClick={() => setIsOpen(false)}>About</a>
            <a href="#team" className="text-lg font-medium text-white/80" onClick={() => setIsOpen(false)}>Board</a>
            <button className="px-8 py-3 mt-4 bg-white text-black font-bold rounded-full w-3/4">
              Login / Signup
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}