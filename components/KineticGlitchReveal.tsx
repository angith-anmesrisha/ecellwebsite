"use client";

import React, { useEffect, useState } from "react";
import { motion, useInView, Variants } from "framer-motion";

interface Props {
  children: React.ReactNode;
  delay?: number;
}

export default function KineticGlitchReveal({ children, delay = 0 }: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-10% 0px" });
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (isInView) {
      setIsGlitching(true);
      const timer = setTimeout(() => {
        setIsGlitching(false);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setIsGlitching(false);
    }
  }, [isInView]);

  
  const glitchVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 30, 
      skewX: 0,
      x: 0
    },
    visible: {
      opacity: 1,
      y: 0,
      skewX: isGlitching ? [0, -12, 10, -6, 3, 0] : 0,
      x: isGlitching ? [0, -6, 5, -3, 0] : 0,
      filter: isGlitching 
        ? ["blur(0px)", "blur(2px)", "blur(0px)", "blur(1px)", "blur(0px)"] 
        : "blur(0px)",
      transition: {
        type: "tween",
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: delay,
        duration: isGlitching ? 0.4 : 0.65
      }
    }
  };

  return (
    <div ref={ref} className="relative w-full overflow-visible">
      <motion.div
        variants={glitchVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="w-full h-full relative overflow-visible"
      >
        {children}

        {/* Dynamic wireframe line layout track simulation overlay */}
        {isGlitching && (
          <motion.div 
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "linear" }}
            className="absolute inset-0 bg-transparent border border-dashed border-purple-500/30 pointer-events-none rounded-xl z-50 mix-blend-screen"
            style={{
              clipPath: [
                "inset(10% 0% 60% 0%)", 
                "inset(65% 0% 15% 0%)", 
                "inset(30% 0% 45% 0%)",
                "inset(0% 0% 0% 0%)"
              ][Math.floor(Math.random() * 4)]
            }}
          />
        )}
      </motion.div>
    </div>
  );
}