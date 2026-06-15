"use client";

import React, { useEffect, useRef } from "react";

export default function NativeFluidRipple() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (!containerRef.current) return;

      
      const ripple = document.createElement("div");
      
      
      ripple.className = "absolute rounded-full pointer-events-none border border-blue-400/40 bg-gradient-to-r from-blue-500/5 to-transparent";
      
      
      const size = 20; 
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.pageX - size / 2}px`;
      ripple.style.top = `${e.pageY - size / 2}px`;
      ripple.style.transform = "scale(1)";
      ripple.style.transition = "all 1.2s cubic-bezier(0.1, 0.8, 0.25, 1)";
      ripple.style.boxShadow = "0 0 15px rgba(59, 130, 246, 0.15), inset 0 0 10px rgba(255, 255, 255, 0.1)";

      containerRef.current.appendChild(ripple);

      
      requestAnimationFrame(() => {
        ripple.style.transform = "scale(15)"; 
        ripple.style.opacity = "0";
      });

      
      setTimeout(() => {
        ripple.remove();
      }, 1200);
    };

    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden" 
      style={{ zIndex: 99999 }} 
    />
  );
}