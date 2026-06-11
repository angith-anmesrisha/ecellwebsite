"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const words = ["INNOVATE.", "SUCCEED.", "EMPOWER.", "ELEVATE."];

export default function AnimatedWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="block relative overflow-visible w-full h-[1.1em] select-none mt-1 sm:mt-2 md:mt-4">
      {/* Premium Trionn Ambient Radial Glow behind the active text line */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-20 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent blur-[60px] pointer-events-none" />

      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          // TRIONN SIGNATURE: Oversized brutalist stroke styling combined with clean interactive values
          className="absolute left-0 top-0 font-black whitespace-nowrap tracking-tighter uppercase text-zinc-900 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          style={{
            WebkitTextStroke: "2px #a855f7",
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)"
          }}
          initial={{ opacity: 0, y: 30, rotateX: -15, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -30, rotateX: 15, filter: "blur(4px)" }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}