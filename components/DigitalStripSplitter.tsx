"use client";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
interface Props {
  text: string;
  tag?: string;
  href: string;
}
export default function DigitalStripSplitter({ text, tag = "//SYS.ACTIVATE", href }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!elementRef.current) return;
    const rect = elementRef.current.getBoundingClientRect();
    window.dispatchEvent(
      new CustomEvent("gridSnapActive", {
        detail: {
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          right: rect.right + window.scrollX,
        },
      })
    );
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
    window.dispatchEvent(new CustomEvent("gridSnapInactive"));
  };
  const handleClick = (e: React.MouseEvent) => {
    window.dispatchEvent(
      new CustomEvent("canvasInversionTrigger", {
        detail: { x: e.pageX, y: e.pageY },
      })
    );
  };
  return (
    <Link href={href} className="block w-full" onClick={handleClick}>
      <div
        ref={elementRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative block w-full border-b border-white/5 py-6 cursor-pointer select-none overflow-hidden group"
      >
        <div className="relative overflow-hidden flex items-center justify-between pointer-events-none">
          <div className="relative text-3xl md:text-5xl font-black uppercase tracking-tight font-mono overflow-visible h-14 w-auto">
            <span className="opacity-0 block">{text}</span>
            {}
            <motion.span
              animate={{
                y: isHovered ? -8 : 0,
                x: isHovered ? 8 : 0,
                color: isHovered ? "rgba(168, 85, 247, 1)" : "rgba(255, 255, 255, 1)"
              }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
              className="absolute inset-0 block will-change-transform"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 48%, 0 48%)" }}
            >
              {text}
            </motion.span>
            {}
            <motion.span
              animate={{
                y: isHovered ? 8 : 0,
                x: isHovered ? -8 : 0,
                color: isHovered ? "rgba(59, 130, 246, 1)" : "rgba(255, 255, 255, 1)"
              }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
              className="absolute inset-0 block will-change-transform"
              style={{ clipPath: "polygon(0 52%, 100% 52%, 100% 100%, 0 100%)" }}
            >
              {text}
            </motion.span>
            {}
            <motion.span
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scaleY: isHovered ? 1 : 0
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-x-0 top-[48%] bottom-[48%] flex items-center justify-start text-[10px] font-bold text-white/40 tracking-[0.4em] pointer-events-none overflow-visible z-20 whitespace-nowrap"
            >
              {tag}
            </motion.span>
          </div>
          {}
          <motion.div
            animate={{
              x: isHovered ? 0 : 20,
              opacity: isHovered ? 1 : 0.2,
              rotate: isHovered ? 45 : 0
            }}
            transition={{ type: "spring", stiffness: 180, damping: 12 }}
            className="text-white/30 group-hover:text-purple-400 font-mono text-sm pr-4 shrink-0"
          >
          </motion.div>
        </div>
        {}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-purple-500 via-blue-500 to-transparent origin-left pointer-events-none"
        />
      </div>
    </Link>
  );
}