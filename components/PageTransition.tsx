"use client";

import { motion, AnimatePresence, Transition } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const curtainTransition = (delay: number): Transition => ({
    duration: 0.5,
    delay: delay,
    ease: [0.76, 0, 0.24, 1] as const 
  });

  return (
    <div className="relative w-full min-h-screen bg-transparent">
      <AnimatePresence mode="wait">
        <motion.div key={pathname} className="w-full bg-transparent">
          
          {/* Curtain 1: Indigo Accent Trail Layer */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 1 }}
            transition={curtainTransition(0)}
            className="fixed inset-0 bg-blue-950/20 z-[99997] pointer-events-none w-full h-full"
          />

          {/* Curtain 2: Dark Slate Overlay */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 1 }}
            transition={curtainTransition(0.04)} 
            className="fixed inset-0 bg-[#020306] z-[99998] pointer-events-none w-full h-full"
          />

          {/* Core Content Layer Page Framework Container */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="w-full bg-transparent relative z-10"
          >
            {children}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}