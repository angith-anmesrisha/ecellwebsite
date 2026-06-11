"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface Props {
  text: string;
  className?: string;
}

export default function InertialSkewText({ text, className = "" }: Props) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Elastic tracking values for directional skewing
  const skewX = useMotionValue(0);
  const skewY = useMotionValue(0);
  const springSkewX = useSpring(skewX, { stiffness: 120, damping: 10, mass: 0.3 });
  const springSkewY = useSpring(skewY, { stiffness: 120, damping: 10, mass: 0.3 });

  // Positional letter attraction offsets
  const translateX = useMotionValue(0);
  const translateY = useMotionValue(0);
  const springTransX = useSpring(translateX, { stiffness: 100, damping: 14, mass: 0.2 });
  const springTransY = useSpring(translateY, { stiffness: 100, damping: 14, mass: 0.2 });

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !isHovered) return;

      const { clientX, clientY } = e;
      const rect = containerRef.current.getBoundingClientRect();
      
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 🌟 THE INERTIAL SKEW FORMULA: 
      // Skews and stretches letters along the approach vector angle of the mouse cursor
      if (distance < 400) {
        const force = (400 - distance) / 400;
        
        // Tilt characters based on distance angle
        skewX.set((dx / rect.width) * -35 * force);
        skewY.set((dy / rect.height) * 15 * force);

        // Pull the entire text string slightly toward cursor gravity
        translateX.set(dx * 0.12 * force);
        translateY.set(dy * 0.12 * force);
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [isHovered]);

  const handleMouseLeave = () => {
    setIsHovered(false);
    skewX.set(0);
    skewY.set(0);
    translateX.set(0);
    translateY.set(0);
  };

  const words = text.split(" ");

  return (
    <motion.span
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springTransX,
        y: springTransY,
        skewX: springSkewX,
        skewY: springSkewY,
        transformStyle: "preserve-3d"
      }}
      className={`inline-block cursor-default select-none will-change-transform ${className}`}
    >
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.split("").map((char, charIdx) => (
            <motion.span
              key={charIdx}
              animate={{
                y: isHovered ? Math.sin(charIdx * 0.6) * -8 : 0,
                scale: isHovered ? 1.05 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 140,
                damping: 8,
                mass: 0.1
              }}
              className="inline-block origin-bottom transition-colors duration-300"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
}