"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function GlowCursor() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHoveredInteractive, setIsHoveredInteractive] = useState(false);

  useEffect(() => {
    const updateMouseCoords = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const closestButton = (e.target as HTMLElement)?.closest("button, a, select, input, textarea, [role='button']");
      if (targetTag === "a" || targetTag === "button" || closestButton) {
        setIsHoveredInteractive(true);
      } else {
        setIsHoveredInteractive(false);
      }
    };

    window.addEventListener("mousemove", updateMouseCoords);
    return () => window.removeEventListener("mousemove", updateMouseCoords);
  }, []);

  return (
    <>
      {/* LAYER 1: ULTRA-TIGHT, HIGH-INTENSITY RADIAL SPOTLIGHT */}
      <div 
        className="hidden md:block pointer-events-none fixed inset-0 z-[999998]"
        style={{
          background: `radial-gradient(90px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.35), transparent 80%)`
        }}
      />

      {/* LAYER 2: THE HOLLOW CYBER LENS RING + PRECISION TARGET DOT */}
      <div className="hidden md:block pointer-events-none fixed inset-0 z-[999999]">
        <motion.div
          animate={{
            x: mousePos.x - (isHoveredInteractive ? 24 : 10),
            y: mousePos.y - (isHoveredInteractive ? 24 : 10),
            width: isHoveredInteractive ? "48px" : "20px",
            height: isHoveredInteractive ? "48px" : "20px",
          }}
          transition={{ type: "spring", stiffness: 450, damping: 30, mass: 0.12 }}
          className={`rounded-full border flex items-center justify-center transition-colors duration-300 ${
            isHoveredInteractive 
              ? "border-blue-500 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
              : "border-white/40 bg-transparent"
          }`}
        >
          <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${
            isHoveredInteractive ? "bg-blue-400" : "bg-white/60"
          }`} />
        </motion.div>
      </div>
    </>
  );
}