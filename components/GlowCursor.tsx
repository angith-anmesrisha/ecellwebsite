"use client";

import { useEffect, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

const INTERACTIVE_SELECTOR = "button, a, select, input, textarea, [role='button']";

export default function GlowCursor() {
  // Motion values update the DOM directly, so moving the mouse never re-renders React
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const ringX = useSpring(mouseX, { stiffness: 500, damping: 28, mass: 0.1 });
  const ringY = useSpring(mouseY, { stiffness: 500, damping: 28, mass: 0.1 });
  const spotlight = useMotionTemplate`radial-gradient(90px circle at ${mouseX}px ${mouseY}px, rgba(251, 191, 36, 0.12), transparent 80%)`;
  const [isHoveredInteractive, setIsHoveredInteractive] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    // Touch screens have no cursor to decorate
    const finePointer = window.matchMedia("(pointer: fine)");
    setIsFinePointer(finePointer.matches);
    if (!finePointer.matches) return;

    const updateMouseCoords = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      const target = e.target as HTMLElement | null;
      const overInteractive = Boolean(target?.closest?.(INTERACTIVE_SELECTOR));
      setIsHoveredInteractive((prev) => (prev === overInteractive ? prev : overInteractive));
    };

    window.addEventListener("mousemove", updateMouseCoords, { passive: true });
    return () => window.removeEventListener("mousemove", updateMouseCoords);
  }, [mouseX, mouseY]);

  if (!isFinePointer) return null;

  const size = isHoveredInteractive ? 64 : 24;

  return (
    <>
      {/* Soft warm light under the pointer */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[10]"
        style={{ background: spotlight }}
      />

      {/* Inverting ring + dot, drawn above everything */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[999999]"
        style={{ mixBlendMode: "difference" }}
      >
        <motion.div
          style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
          animate={{ width: size, height: size }}
          transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.1 }}
          className={`absolute left-0 top-0 rounded-full flex items-center justify-center border transition-colors duration-200 ${
            isHoveredInteractive ? "border-white bg-white/10" : "border-white/80 bg-transparent"
          }`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </motion.div>
      </div>
    </>
  );
}
