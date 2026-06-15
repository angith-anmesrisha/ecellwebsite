"use client";
import React from "react";
import { motion } from "framer-motion";
interface SplitRevealProps {
  text: string;
  delay?: number;
}
export default function SplitReveal({ text, delay = 0 }: SplitRevealProps) {
  const letters = Array.from(text);
  return (
    <motion.span
      className="inline-block"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.02, delayChildren: delay }
        }
      }}
    >
      {letters.map((char, index) => (
        <span
          key={index}
          className="inline-block overflow-hidden"
          style={{ verticalAlign: "bottom", clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" }}
        >
          <motion.span
            className="inline-block whitespace-pre font-black"
            variants={{
              hidden: { opacity: 0, y: "110%", rotateX: 40 },
              visible: {
                opacity: 1,
                y: "0%",
                rotateX: 0,
                transition: { type: "spring", damping: 14, stiffness: 110 }
              }
            }}
          >
            {char}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}