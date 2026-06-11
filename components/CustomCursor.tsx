"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [cursorType, setCursorType] = useState<"default" | "hover" | "drag" | "view">("default");
  const [cursorText, setCursorText] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Core tracking coordinates using responsive springs for lag-behind fluid physics
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  const springConfig = { stiffness: 380, damping: 26, mass: 0.4 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    // Dynamic scanning loop to read underlying element context attributes
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Check nearest structural interactive container roles
      const interactiveEl = target.closest("[data-cursor]");
      if (interactiveEl) {
        const type = interactiveEl.getAttribute("data-cursor") as any;
        const text = interactiveEl.getAttribute("data-cursor-text") || "";
        setCursorType(type || "hover");
        setCursorText(text);
      } else if (target.closest("button") || target.closest("a") || target.closest(".cursor-pointer")) {
        setCursorType("hover");
        setCursorText("");
      } else {
        setCursorType("default");
        setCursorText("");
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", () => setIsVisible(false));
    document.addEventListener("mouseenter", () => setIsVisible(true));

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  // Dynamic dimension configurations based on current element focus states
  const cursorSizes = {
    default: { width: 8, height: 8, backgroundColor: "#a855f7" },
    hover: { width: 55, height: 55, backgroundColor: "rgba(168, 85, 247, 0.15)", borderColor: "#a855f7" },
    drag: { width: 75, height: 75, backgroundColor: "rgba(59, 130, 246, 0.2)", borderColor: "#3b82f6" },
    view: { width: 80, height: 80, backgroundColor: "rgba(236, 72, 153, 0.2)", borderColor: "#ec4899" }
  };

  const activeSize = cursorSizes[cursorType] || cursorSizes.default;

  return (
    <>
      {/* 🌟 SAFE BUILD FIX: Standard style element parsing to guarantee cross-compiler stability */}
      <style dangerouslySetInnerHTML={{__html: `
        body, button, a, input, textarea, [role="button"], .cursor-pointer {
          cursor: none !important;
        }
      `}} />

      {/* The Fluid Tracking Ring node */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          ...activeSize
        }}
        animate={{
          scale: isVisible ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[99999] flex items-center justify-center border border-white/0 backdrop-blur-3xs overflow-hidden"
      >
        {cursorText && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[9px] font-mono font-black uppercase tracking-widest text-white mix-blend-difference"
          >
            {cursorText}
          </motion.span>
        )}
      </motion.div>
    </>
  );
}