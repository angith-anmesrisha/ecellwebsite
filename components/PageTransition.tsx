"use client";

import { motion, AnimatePresence, Transition } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 🌟 FIXED: Added explicit Transition type casting and "as const" mapping to pass strict type checking
  const curtainTransition = (delay: number): Transition => ({
    duration: 0.6,
    delay: delay,
    ease: [0.76, 0, 0.24, 1] as const // Forces TypeScript to read this as a fixed cubic-bezier tuple
  });

  return (
    <div className="relative w-full min-h-screen bg-transparent">
      <AnimatePresence mode="wait">
        <motion.div key={pathname} className="w-full bg-transparent">
          
          {/* Curtain 1: Indigo Accent Trail Layer */}
          <motion.div
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 1 }}
            transition={curtainTransition(0)}
            style={{ originY: 1 }}
            className="fixed inset-0 bg-blue-950/40 z-[99997] pointer-events-none w-full h-full"
          />

          {/* Curtain 2: Dark Zinc Slate Overlay */}
          <motion.div
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 1 }}
            transition={curtainTransition(0.06)} 
            style={{ originY: 1 }}
            className="fixed inset-0 bg-zinc-900 z-[99998] pointer-events-none w-full h-full"
          />

          {/* Curtain 3: Primary Onyx Cap */}
          <motion.div
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 1 }}
            transition={curtainTransition(0.12)} 
            style={{ originY: 1 }}
            className="fixed inset-0 bg-zinc-950 z-[99999] pointer-events-none w-full h-full border-b border-white/5"
          />

          {/* Core Content Layer Page Framework Container */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full bg-transparent relative z-10"
          >
            {children}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}