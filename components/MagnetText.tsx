"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagnetTextProps {
  text: string;
  className?: string;
}

export default function MagnetText({ text, className = "" }: MagnetTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  
  // High-elasticity spring physics configurations for that snappy, premium look
  const springConfig = { damping: 15, stiffness: 180, mass: 0.1 };
  const translateX = useSpring(useMotionValue(0), springConfig);
  const translateY = useSpring(useMotionValue(0), springConfig);
  const skewX = useSpring(useMotionValue(0), springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const { clientX, clientY } = e;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate the center point of the text block
      const textCenterX = rect.left + rect.width / 2;
      const textCenterY = rect.top + rect.height / 2;

      // Distance vector between cursor and text center
      const deltaX = clientX - textCenterX;
      const deltaY = clientY - textCenterY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Trigger radius: How close the mouse needs to get before the magnet activates (in pixels)
      const magnetRadius = 180;

      if (distance < magnetRadius) {
        // Calculate pull intensity based on proximity (closer mouse = stronger pull)
        const intensity = (magnetRadius - distance) / magnetRadius;
        
        // Attenuated directional pull vectors
        translateX.set(deltaX * 0.25 * intensity);
        translateY.set(deltaY * 0.25 * intensity);
        
        // Dynamically skew/lean the text toward the cursor for a liquid typography feel
        skewX.set((deltaX / rect.width) * -15 * intensity);
      } else {
        // Snap back to absolute zero rest coordinates when out of range
        translateX.set(0);
        translateY.set(0);
        skewX.set(0);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [translateX, translateY, skewX]);

  return (
    <motion.span
      ref={containerRef}
      className={`inline-block cursor-default select-none ${className}`}
      style={{
        x: translateX,
        y: translateY,
        skewX: skewX,
      }}
    >
      {text}
    </motion.span>
  );
}