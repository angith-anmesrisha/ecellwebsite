"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Define the interface so the TypeScript compiler resolves the ref type cleanly
interface WaterRipple {
  x: number;
  y: number;
  time: number;
  maxRadius: number;
  strength: number;
}

interface CrystallineParticleMatrixProps {
  isSparse?: boolean; // Manual override option to force sparse layout
}

export default function CrystallineParticleMatrix({ isSparse: manualSparse = false }: CrystallineParticleMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, active: false, velocity: 0 });
  const ripplesRef = useRef<WaterRipple[]>([]);
  const pathname = usePathname();

  // Automatically switch to sparse mode on admin and evaluation dashboards
  // Automatically switch to sparse mode on admin, evaluation, and recruitment dashboards
  const isSparse = manualSparse || pathname?.includes("/admin") || pathname?.includes("/evaluation") || pathname?.includes("/recruitment") || pathname?.includes("/results");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let resizeTimeout: NodeJS.Timeout;
    
    const isMobileDevice = window.innerWidth < 768;

    let particles: Array<{
      x: number;
      y: number;
      originX: number;
      originY: number;
      vx: number;
      vy: number;
      size: number;
      baseColor: string;
      hue: number;
      angle: number;
      speedFactor: number;
    }> = [];

    const resizeCanvas = () => {
      const d = document.documentElement;
      const b = document.body;
      
      const logicalWidth = window.innerWidth;
      const logicalHeight = Math.max(d.scrollHeight, d.offsetHeight, b.scrollHeight, b.offsetHeight, window.innerHeight);
      
      const dpr = isMobileDevice ? 1 : (window.devicePixelRatio || 1);
      
      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;
      
      canvas.style.width = `${logicalWidth}px`;
      canvas.style.height = `${logicalHeight}px`;
      
      ctx.scale(dpr, dpr);
      
      initParticles(logicalWidth, logicalHeight);
    };

    const initParticles = (w: number, h: number) => {
      particles = [];
      
      // INCREASE these multipliers to lower the density
      let densityMultiplier = isMobileDevice ? 4000 : 1600; // Originally 2000 : 800[cite: 7]
      // DECREASE these caps to restrict the maximum particle count
      let maxCapLimit = isMobileDevice ? 100 : 500;         // Originally 250 : 1000[cite: 7]

      if (isSparse) {
        // Further restrict the sparse mode layout
        densityMultiplier = isMobileDevice ? 8000 : 6000;   // Originally 5000 : 3500[cite: 7]
        maxCapLimit = isMobileDevice ? 20 : 60;             // Originally 40 : 120[cite: 7]
      }
      
      const particleCount = Math.min(
        Math.floor((w * h) / densityMultiplier), 
        maxCapLimit
      );
      
      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        
        const randomHue = Math.random() > 0.5 
          ? Math.floor(Math.random() * 40) + 260 
          : Math.floor(Math.random() * 40) + 160;

        // Visual properties adapt dynamically to prevent dashboard clutter
        const particleSize = isSparse
          ? (Math.random() * 0.8 + 0.6)  
          : (Math.random() * 1.6 + 1.2); 

        const baseAlpha = isSparse
          ? (Math.random() * 0.10 + 0.15) 
          : (Math.random() * 0.25 + 0.40); 

        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: (Math.random() - 0.5) * (isSparse ? 0.15 : 0.3), 
          vy: (Math.random() - 0.5) * (isSparse ? 0.15 : 0.3),
          size: particleSize, 
          hue: randomHue,
          baseColor: `hsla(${randomHue}, 95%, 70%, ${baseAlpha})`, 
          angle: Math.random() * Math.PI * 2,
          speedFactor: Math.random() * 0.04 + 0.01
        });
      }
    };

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) * 0.001;
      lastTime = currentTime;

      const d = document.documentElement;
      const b = document.body;
      const logicalWidth = window.innerWidth;
      const logicalHeight = Math.max(d.scrollHeight, d.offsetHeight, b.scrollHeight, b.offsetHeight, window.innerHeight);

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);
      const mouse = mouseRef.current;

      const mDx = mouse.x - mouse.lastX;
      const mDy = mouse.y - mouse.lastY;
      const mouseSpeed = Math.sqrt(mDx * mDx + mDy * mDy);
      mouse.velocity += (mouseSpeed - mouse.velocity) * 0.15;
      mouse.velocity *= 0.93;
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;

      ripplesRef.current.forEach((ripple, idx) => {
        ripple.time += deltaTime;
        if (ripple.time > 1.2) {
          ripplesRef.current.splice(idx, 1);
        }
      });

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!mouse.active) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > logicalWidth) p.vx *= -1;
          if (p.y < 0 || p.y > logicalHeight) p.vy *= -1;
          p.x += (p.originX - p.x) * 0.008;
          p.y += (p.originY - p.y) * 0.008;
        } else {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const activeRadius = isMobileDevice ? 150 : 350;

          if (distance < activeRadius) {
            const force = (activeRadius - distance) / activeRadius;
            if (mouse.velocity > 15) {
              p.x -= (dx / distance) * force * (mouse.velocity * 0.3);
              p.y -= (dy / distance) * force * (mouse.velocity * 0.3);
            } else {
              p.x += (dx / distance) * force * 4.0;
              p.y += (dy / distance) * force * 4.0;
              p.x += Math.sin(p.angle) * 0.3;
              p.y += Math.cos(p.angle) * 0.3;
              p.angle += p.speedFactor;
            }
          } else {
            p.x += (p.originX - p.x) * 0.02;
            p.y += (p.originY - p.y) * 0.02;
          }
        }

        let renderX = p.x;
        let renderY = p.y;
        let finalColor = p.baseColor;

        ripplesRef.current.forEach((ripple) => {
          const rDx = p.x - ripple.x;
          const rDy = p.y - ripple.y;
          const rDistance = Math.sqrt(rDx * rDx + rDy * rDy);
          
          const waveSpeed = 200; 
          const currentWaveFront = ripple.time * waveSpeed;
          
          if (rDistance < ripple.maxRadius && rDistance < currentWaveFront) {
            const waveFrequency = 0.09; 
            const waveWidth = 30; 
            const distFromFront = Math.abs(rDistance - currentWaveFront);
            
            if (distFromFront < waveWidth) {
              const waveMath = Math.sin((rDistance - currentWaveFront) * waveFrequency);
              const falloff = (1.0 - distFromFront / waveWidth) * (1.0 - rDistance / ripple.maxRadius);
              const timeDecay = Math.max(0, 1.0 - ripple.time / 1.2);
              
              const pushScale = waveMath * 12 * ripple.strength * falloff * timeDecay;
              
              if (rDistance > 0) {
                renderX += (rDx / rDistance) * pushScale;
                renderY += (rDy / rDistance) * pushScale;
              }
              
              if (waveMath > 0.3) {
                finalColor = `hsla(${p.hue}, 100%, 82%, ${0.5 * falloff * timeDecay})`;
              }
            }
          }
        });

        ctx.beginPath();
        ctx.arc(renderX, renderY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = finalColor;
        ctx.fill();

        const connectionInterval = isMobileDevice ? 15 : 6;
        if (mouse.velocity < 20) {
          for (let j = i + 1; j < particles.length; j += connectionInterval) { 
            const p2 = particles[j];
            const distx = renderX - p2.x;
            const disty = renderY - p2.y;
            const linkDist = Math.sqrt(distx * distx + disty * disty);

            if (linkDist < 90) {
              ctx.beginPath();
              ctx.moveTo(renderX, renderY);
              ctx.lineTo(p2.x, p2.y);
              
              const linkOpacity = isSparse ? 0.05 : 0.18;
              ctx.strokeStyle = `rgba(168, 85, 247, ${linkOpacity * (1 - linkDist / 90)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    
    const triggerRipple = (clientX: number, clientY: number, strength: number) => {
      if (isSparse) return; // Disable hover ripple creation in sparse modes to prevent performance lag

      ripplesRef.current.push({
        x: clientX + window.scrollX,
        y: clientY + window.scrollY,
        time: 0,
        maxRadius: isMobileDevice ? 150 : 240, 
        strength: strength
      });
      if (ripplesRef.current.length > (isMobileDevice ? 4 : 8)) ripplesRef.current.shift();
    };

    // --- INTERACTION EVENT HANDLERS ---
    // Safely declared before listener attachments to prevent scoping compiler issues
    const handleGlobalMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleGlobalClick = (e: MouseEvent) => {
      triggerRipple(e.clientX, e.clientY, 1.2);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX + window.scrollX;
      mouseRef.current.y = e.clientY + window.scrollY;
      mouseRef.current.active = true;

      const dx = mouseRef.current.x - mouseRef.current.lastX;
      const dy = mouseRef.current.y - mouseRef.current.lastY;
      const moveSpeed = Math.sqrt(dx * dx + dy * dy);

      if (moveSpeed > 45) {
        triggerRipple(e.clientX, e.clientY, Math.min(0.5, moveSpeed * 0.006));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      mouseRef.current.x = touch.clientX + window.scrollX;
      mouseRef.current.y = touch.clientY + window.scrollY;
      mouseRef.current.active = true;
    };

    const handleTouchEnd = () => {
      mouseRef.current.active = false;
    };

    const handleGlobalScroll = () => {
      if (!isMobileDevice && Math.random() > 0.75) {
        triggerRipple(
          window.innerWidth / 2 + (Math.random() - 0.5) * 300, 
          window.innerHeight / 2 + (Math.random() - 0.5) * 300, 
          0.8
        );
      }
    };

    const handleAdaptiveLayoutDelay = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 400);
    };

    // --- BIND EVENT LISTENERS ---
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("scroll", handleGlobalScroll, { passive: true });
    window.addEventListener("load", resizeCanvas);
    document.addEventListener("readystatechange", handleAdaptiveLayoutDelay);

    if (!isMobileDevice) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("click", handleGlobalClick);
      document.addEventListener("mouseleave", handleGlobalMouseLeave);
    } else {
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleTouchEnd);
    }

    animationFrameId = requestAnimationFrame(animate);

    // --- REMOVE LISTENERS ON UNMOUNT ---
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleGlobalScroll);
      window.removeEventListener("load", resizeCanvas);
      document.removeEventListener("readystatechange", handleAdaptiveLayoutDelay);
      
      if (!isMobileDevice) {
        window.removeEventListener("mousemove", handleGlobalMouseMove);
        window.removeEventListener("click", handleGlobalClick);
        document.removeEventListener("mouseleave", handleGlobalMouseLeave);
      } else {
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      }
      clearTimeout(resizeTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSparse]); // Recalculates canvas dimensions and matrix values when changing routes

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full block pointer-events-none mix-blend-screen" 
      style={{ zIndex: 50 }} 
    />
  );
}