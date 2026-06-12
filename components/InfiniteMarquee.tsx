"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useScroll, useTransform, useVelocity } from "framer-motion";

export default function InfiniteMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Hook into Global Scroll Velocity Math
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  // 🌟 ULTRA-TUNED: Bumped damping way up (28 -> 45) to entirely flatten explosive speed jumps
  const smoothVelocity = useSpring(scrollVelocity, { stiffness: 25, damping: 45 });
  
  // 🌟 ULTRA-TUNED: Tightened skew limits (-8/8 -> -4/4) so text slants gracefully on heavy scrolling
  const skewX = useTransform(smoothVelocity, [-1500, 1500], [-4, 4]);

  // 2. Track Base Horizontal Progression
  const basePositionX = useMotionValue(0);
  
  // 3. Hook into Mouse Movement for Vertical Axis Shifting
  const verticalDrift = useMotionValue(0);
  const smoothVerticalDrift = useSpring(verticalDrift, { stiffness: 40, damping: 18 });

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const bounds = containerRef.current.getBoundingClientRect();
      const centerY = bounds.top + bounds.height / 2;
      const distanceY = e.clientY - centerY;

      if (Math.abs(distanceY) < 250) {
        const factor = (250 - Math.abs(distanceY)) / 250;
        verticalDrift.set((distanceY > 0 ? 1 : -1) * 8 * factor);
      } else {
        verticalDrift.set(0);
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, []);

  // 4. Framer Motion Animation Frame Progression Ticker
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const renderLoop = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      // 🌟 ULTRA-TUNED: Cut base steady speed in half (0.015 -> 0.006) and lowered velocity reaction factor (0.0006 -> 0.00015)
      const velocityFactor = Math.abs(smoothVelocity.get()) * 0.00015;
      const regularSpeed = 0.006 * delta;
      
      const nextX = basePositionX.get() - (regularSpeed + velocityFactor);
      
      // Infinite loop wrap point resets at 50% boundary node cleanly
      if (nextX <= -50) {
        basePositionX.set(0);
      } else {
        basePositionX.set(nextX);
      }

      frameId = requestAnimationFrame(renderLoop);
    };

    frameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(frameId);
  }, [smoothVelocity]);

  const xTransform = useTransform(basePositionX, (v) => `${v}%`);

  const items = ["15+ EVENTS", "20+ SPEAKERS", "3000+ FOOTFALL", "BIMTECH PGDM"];
  const marqueeItems = [...items, ...items, ...items];

  return (
    <div 
      ref={containerRef}
      className="w-full overflow-hidden bg-zinc-950/20 backdrop-blur-sm border-y border-white/10 py-5 flex whitespace-nowrap select-none relative z-30"
    >
      <motion.div 
        style={{ 
          x: xTransform,
          y: smoothVerticalDrift,
          skewX: skewX,
          transformStyle: "preserve-3d"
        }}
        className="flex will-change-transform"
      >
        {marqueeItems.map((text, i) => (
          <div 
            key={i} 
            className="flex items-center mx-12 text-xs font-mono font-black tracking-[0.3em] uppercase text-white/40"
          >
            <span>{text}</span>
            <span className="ml-12 text-purple-500 font-bold">•</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}