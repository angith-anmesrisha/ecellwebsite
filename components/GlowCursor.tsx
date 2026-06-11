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
      {/* LAYER 1: DEEP BACKGROUND LIGHT SPOTLIGHT (Stays beneath text, doesn't invert) */}
      <div 
        className="hidden md:block pointer-events-none fixed inset-0 z-[10]"
        style={{
          background: `radial-gradient(90px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.25), transparent 80%)`
        }}
      />

      {/* LAYER 2: THE HOLLOW INVERTED BLEND LENS + TARGET DOT */}
      {/* 🌟 TRIONN UPGRADE: 
        We set mix-blend-mode: difference and push the z-index to max. 
        We force the ring's base color to solid white so it inverts perfectly to black over white assets!
      */}
      <div 
        className="hidden md:block pointer-events-none fixed inset-0 z-[999999] mix-blend-mode-difference"
        style={{ mixBlendMode: "difference" }}
      >
        <motion.div
          animate={{
            x: mousePos.x - (isHoveredInteractive ? 32 : 12),
            y: mousePos.y - (isHoveredInteractive ? 32 : 12),
            width: isHoveredInteractive ? "64px" : "24px",
            height: isHoveredInteractive ? "64px" : "24px",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.1 }}
          className={`rounded-full flex items-center justify-center border transition-colors duration-200 ${
            isHoveredInteractive 
              ? "border-white bg-white/10" 
              : "border-white/80 bg-transparent"
          }`}
        >
          {/* Central Target Dot */}
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </motion.div>
      </div>
    </>
  );
}