"use client";
import React from "react";
import { motion } from "framer-motion";
interface Props {
  text: string;
  subText: string;
  isHovered: boolean;
}
export default function FractionalTextSplitter({ text, subText, isHovered }: Props) {
  return (
    <div className="relative inline-block overflow-visible font-mono select-none">
      {}
      <motion.span
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.85
        }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-purple-400 tracking-normal text-center pointer-events-none z-10 uppercase"
      >
        {subText}
      </motion.span>
      {}
      <span className="relative block opacity-0 pointer-events-none">
        {text}
      </span>
      {}
      <motion.span
        animate={{
          y: isHovered ? -14 : 0,
          x: isHovered ? 4 : 0,
          color: isHovered ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)"
        }}
        transition={{ type: "spring", stiffness: 180, damping: 14, mass: 0.3 }}
        className="absolute inset-0 block select-none pointer-events-none will-change-transform text-white/60"
        style={{ clipPath: "inset(0% 0% 50% 0%)" }}
      >
        {text}
      </motion.span>
      {}
      <motion.span
        animate={{
          y: isHovered ? 14 : 0,
          x: isHovered ? -4 : 0,
          color: isHovered ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)"
        }}
        transition={{ type: "spring", stiffness: 180, damping: 14, mass: 0.3 }}
        className="absolute inset-0 block select-none pointer-events-none will-change-transform text-white/60"
        style={{ clipPath: "inset(50% 0% 0% 0%)" }}
      >
        {text}
      </motion.span>
    </div>
  );
}