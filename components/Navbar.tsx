"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowLinks(true);
      } 
      else if (currentScrollY < lastScrollY.current) {
        setShowLinks(false);
        setIsOpen(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* CRITICAL REFACTOR: Added 'pointer-events-none' to this full-width outer div wrapper.
        This allows mouse clicks to pass completely through the invisible empty margins 
        of the navbar tracking grid and hit the 'Read Full Article' button smoothly!
      */}
      <div className="fixed top-6 left-0 w-full flex justify-center px-6 z-[90] pointer-events-none">
        <motion.nav
          layout
          animate={{
            borderRadius: "9999px"
          }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          /* RE-ACTIVATE INTERACTION: 'pointer-events-auto' explicitly allows 
            mouse hover and clicks to function properly on your actual capsule links and button nodes!
          */
          className="pointer-events-auto flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl px-6 h-16 min-h-[64px]"
        >
          {/* Inner flex layout mapping */}
          <div className="flex items-center justify-between w-full h-full gap-8"> 
            
            {/* Logo Container */}
            <div className="relative h-12 w-40 flex items-center shrink-0">
              <Image 
                src="/ecell-logo.png" 
                alt="BIMTECH E-Cell Logo"
                fill
                priority
                sizes="180px"
                className="object-contain object-center"
              />
            </div>

            {/* Desktop Links */}
            <AnimatePresence mode="popLayout">
              {showLinks && (
                <motion.div
                  initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="hidden md:flex items-center gap-6 h-full"
                >
                  <a href="#about" className="text-sm font-medium text-white/70 hover:text-white transition flex items-center h-full">About</a>
                  <a href="#team" className="text-sm font-medium text-white/70 hover:text-white transition flex items-center h-full">Board</a>
                  <a href="#contact" className="text-sm font-medium text-white/70 hover:text-white transition flex items-center h-full">Connect</a>
                  
                  {/* CONNECTED DIRECT DESKTOP ROUTE ROUTER: Linked the button 
                    directly to your Next.js application path to bypass the modal error.
                  */}
                  <Link href="/recruitment">
                    <button className="px-4 py-1.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-200 transition shadow-lg shrink-0 self-center cursor-pointer">
                      Join Us
                    </button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Hamburger Toggle */}
            <AnimatePresence>
              {showLinks && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="md:hidden text-white flex items-center justify-center h-full" 
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? <X size={18} /> : <Menu size={18} />}
                </motion.button>
              )}
            </AnimatePresence>

          </div>
        </motion.nav>
      </div>

      {/* Mobile Dropdown Layout Menu */}
      <AnimatePresence>
        {isOpen && showLinks && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-6 right-6 bg-black/90 backdrop-blur-xl border border-white/10 z-[89] md:hidden flex flex-col items-center py-6 space-y-4 rounded-2xl shadow-2xl"
          >
            <a href="#about" className="text-base font-medium text-white/80" onClick={() => setIsOpen(false)}>About</a>
            <a href="#team" className="text-base font-medium text-white/80" onClick={() => setIsOpen(false)}>Board</a>
            <a href="#contact" className="text-base font-medium text-white/80" onClick={() => setIsOpen(false)}>Connect</a>
            <Link href="/recruitment" onClick={() => setIsOpen(false)}>
              <span className="inline-block px-6 py-2 bg-white text-black text-sm font-bold rounded-full text-center cursor-pointer">
               Join Us
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}