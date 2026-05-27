"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function GlowCursor() {
  // Use Motion Values for high-performance coordinate tracking without re-rendering
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Add smooth spring physics to make the glow trail elegantly behind the cursor
  const springConfig = { damping: 40, stiffness: 300, mass: 0.5 };
  const glowX = useSpring(cursorX, springConfig);
  const glowY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      // Center the 400px glow circle on the exact cursor point
      cursorX.set(e.clientX - 200);
      cursorY.set(e.clientY - 200);
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-10 hidden lg:block"
      style={{
        translateX: glowX,
        translateY: glowY,
      }}
    >
     
      <div 
        className="w-[250px] h-[250px] rounded-full opacity-65 mix-blend-screen filter blur-[50px] transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.5) 0%, rgba(0,0,0,0) 70%)",
        }}
      />
    </motion.div>
  );
}