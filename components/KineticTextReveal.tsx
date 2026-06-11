"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface Props {
  text: string;
  className?: string;
  delay?: number;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*";

export default function KineticTextReveal({ text, className = "", delay = 0 }: Props) {
  const containerRef = useRef<HTMLSpanElement>(null);
  
  // 🌟 THE FIX: Changed 'once: true' to 'once: false' so it listens for repeat scroll events
  const isInView = useInView(containerRef, { once: false, margin: "-10% 0px" });
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    // If the element leaves the viewport, reset the text to blank or its scrambled state 
    // so it's ready to re-scramble cleanly when the user scrolls back
    if (!isInView) {
      setDisplayText("");
      return;
    }

    let frame = 0;
    const totalIterations = text.length * 3;
    const splitText = text.split("");
    
    const timeoutId = setTimeout(() => {
      const intervalId = setInterval(() => {
        const scrambled = splitText.map((char, index) => {
          if (char === " ") return " ";
          if (index < frame / 3) {
            return text[index];
          }
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        });

        setDisplayText(scrambled.join(""));
        frame++;

        if (frame >= totalIterations) {
          setDisplayText(text);
          clearInterval(intervalId);
        }
      }, 25);

      return () => clearInterval(intervalId);
    }, delay * 1000);

    return () => clearTimeout(timeoutId);
  }, [isInView, text, delay]);

  return (
    <span ref={containerRef} className={`inline-block whitespace-nowrap overflow-visible ${className}`}>
      <motion.span 
        initial={{ opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
        className="inline-block"
      >
        {displayText}
      </motion.span>
    </span>
  );
}