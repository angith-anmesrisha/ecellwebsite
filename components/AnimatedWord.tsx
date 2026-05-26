"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const words = ["INNOVATE.", "SUCCEED.", "EMPOWER.", "ELEVATE."];

export default function AnimatedWord() {
  const [index, setIndex] = useState(0);

  // This hook cycles through the array every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative inline-block h-[1.2em] overflow-visible">
      {/* AnimatePresence handles the exit animations cleanly */}
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 40, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -40, opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute left-0 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
      
      {/* Invisible placeholder to maintain the width of the longest word so layout doesn't jump */}
      <span className="invisible">ENTREPRENEUR.</span> 
    </div>
  );
}