"use client";

import React, { useRef, useEffect } from "react";
import { motion, useInView, useMotionValue, useSpring, useScroll, useTransform, useVelocity } from "framer-motion";

export default function InfiniteMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Both the scroll loop and the pointer tracking only run while the strip is on screen
  const isVisible = useInView(containerRef);

  
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  
  const smoothVelocity = useSpring(scrollVelocity, { stiffness: 25, damping: 45 });
  
  
  const skewX = useTransform(smoothVelocity, [-1500, 1500], [-4, 4]);

  
  const basePositionX = useMotionValue(0);
  
  
  const verticalDrift = useMotionValue(0);
  const smoothVerticalDrift = useSpring(verticalDrift, { stiffness: 40, damping: 18 });

  useEffect(() => {
    if (!isVisible) return;
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

    window.addEventListener("mousemove", handleGlobalMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [isVisible, verticalDrift]);

  
  useEffect(() => {
    if (!isVisible) return;
    let frameId: number;
    let lastTime = performance.now();

    const renderLoop = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      
      const velocityFactor = Math.abs(smoothVelocity.get()) * 0.00015;
      const regularSpeed = 0.006 * delta;
      
      const nextX = basePositionX.get() - (regularSpeed + velocityFactor);
      
      
      if (nextX <= -50) {
        basePositionX.set(0);
      } else {
        basePositionX.set(nextX);
      }

      frameId = requestAnimationFrame(renderLoop);
    };

    frameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(frameId);
  }, [isVisible, smoothVelocity, basePositionX]);

  const xTransform = useTransform(basePositionX, (v) => `${v}%`);

  const items = ["15+ EVENTS", "20+ SPEAKERS", "3000+ FOOTFALL", "BIMTECH PGDM"];
  const marqueeItems = [...items, ...items, ...items];

  return (
    <div
      ref={containerRef}
      aria-label="15+ events, 20+ speakers, 3000+ footfall, BIMTECH PGDM"
      role="marquee"
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
            aria-hidden="true"
            className="flex items-center mx-12 text-xs font-mono font-black tracking-[0.3em] uppercase text-white/60"
          >
            <span>{text}</span>
            <span className="ml-12 text-accent-500 font-bold">•</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}