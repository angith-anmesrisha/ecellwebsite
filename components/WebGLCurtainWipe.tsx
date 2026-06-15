"use client";

import React, { useEffect, useRef } from "react";
import { useScroll, useVelocity } from "framer-motion";

export default function WebGLCurtainWipe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let time = 0;
    let currentVelocity = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const rawVelocity = scrollVelocity.get();
      
      
      const targetVelocity = Math.max(Math.min(rawVelocity * 0.12, 50), -50);
      currentVelocity += (targetVelocity - currentVelocity) * 0.1;
      
      time += 0.02;

      
      if (Math.abs(currentVelocity) > 0.01) {
        ctx.save();
        
        
        ctx.strokeStyle = "rgba(147, 51, 234, 0.45)"; 
        ctx.lineWidth = 2;

        const lineGap = 50; 
        const waveAmplitude = currentVelocity * 3;

        for (let y = 0; y < height; y += lineGap) {
          ctx.beginPath();
          for (let x = 0; x <= width; x += 15) {
            const normalizedX = x / width;
            const waveDeform = Math.sin(normalizedX * Math.PI) * waveAmplitude * Math.sin(time + x * 0.005);
            
            if (x === 0) {
              ctx.moveTo(x, y + waveDeform);
            } else {
              ctx.lineTo(x, y + waveDeform);
            }
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [scrollVelocity]);

  return (
    <canvas
      ref={canvasRef}
      
      className="fixed inset-0 w-full h-full z-[9999] pointer-events-none block"
    />
  );
}