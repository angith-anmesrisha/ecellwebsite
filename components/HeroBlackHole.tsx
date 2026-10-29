"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import BlackHoleCanvas from "./BlackHoleCanvas";

// Home page hero visual: the same lensed black hole as the Startup Heist popup, larger,
// sinking back slightly as the visitor scrolls. Renders below screen resolution on phones.
export default function HeroBlackHole() {
  const reduceMotion = useReducedMotion();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 700], [1, 0.82]);
  const opacity = useTransform(scrollY, [0, 700], [1, 0.35]);

  useEffect(() => {
    setIsSmallScreen(window.innerWidth < 768);
  }, []);

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.7, filter: "blur(12px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="relative w-full max-w-[680px] aspect-[16/11] pointer-events-none"
    >
      <motion.div style={reduceMotion ? undefined : { scale, opacity }} className="absolute inset-0">
        {/* Warm halo so the disk blends into the page instead of sitting in a box */}
        <div className="absolute inset-[15%] rounded-full bg-accent-600/15 blur-[90px]" />
        <BlackHoleCanvas
          animate={!reduceMotion}
          zoom={2.35}
          resolutionScale={isSmallScreen ? 0.75 : 0.85}
        />
      </motion.div>
    </motion.div>
  );
}
