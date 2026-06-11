"use client";

import React, { useEffect, useRef } from "react";

export default function CrystallineParticleMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Track globally to bypass element offset rendering issues
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, active: false, velocity: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      originX: number;
      originY: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      angle: number;
      speedFactor: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight
      );
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      // 🌟 DRUBBED UP MAXIMUM DENSITY POOL: Bumped limit up to 900 for a deep crystal cluster look
      const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 1800), 900);
      
      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 1.6 + 0.5,
          color: Math.random() > 0.4 ? "rgba(147, 51, 234, 0.28)" : "rgba(59, 130, 246, 0.22)",
          angle: Math.random() * Math.PI * 2,
          speedFactor: Math.random() * 0.04 + 0.01
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;

      // Track exact real-time sweep speed velocities
      const mDx = mouse.x - mouse.lastX;
      const mDy = mouse.y - mouse.lastY;
      const mouseSpeed = Math.sqrt(mDx * mDx + mDy * mDy);
      
      mouse.velocity += (mouseSpeed - mouse.velocity) * 0.15;
      mouse.velocity *= 0.93;

      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        if (!mouse.active) {
          // Normal elegant floating drift physics
          p1.x += p1.vx;
          p1.y += p1.vy;

          if (p1.x < 0 || p1.x > canvas.width) p1.vx *= -1;
          if (p1.y < 0 || p1.y > canvas.height) p1.vy *= -1;

          p1.x += (p1.originX - p1.x) * 0.008;
          p1.y += (p1.originY - p1.y) * 0.008;
        } else {
          const dx = mouse.x - p1.x;
          const dy = mouse.y - p1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const activeRadius = 400;

          if (distance < activeRadius) {
            const force = (activeRadius - distance) / activeRadius;
            
            if (mouse.velocity > 15) {
              // 💥 RAPID SWIPE REPULSION DETECTOR (EXPLOSION)
              p1.x -= (dx / distance) * force * (mouse.velocity * 0.45);
              p1.y -= (dy / distance) * force * (mouse.velocity * 0.45);
            } else {
              // 🧲 STABLE CORE ATTRACTOR SYSTEM (IMPLOSION)
              p1.x += (dx / distance) * force * 6.5;
              p1.y += (dy / distance) * force * 6.5;
              
              // Light orbital sway to stop static text overlays
              p1.x += Math.sin(p1.angle) * 0.6;
              p1.y += Math.cos(p1.angle) * 0.6;
              p1.angle += p1.speedFactor;
            }
          } else {
            // Snap back cleanly to the anchor points
            p1.x += (p1.originX - p1.x) * 0.025;
            p1.y += (p1.originY - p1.y) * 0.025;
          }
        }

        // Draw individual crystal vertices
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        ctx.fillStyle = mouse.active && mouse.velocity > 15 && Math.abs(mouse.x - p1.x) < 250
          ? "rgba(244, 63, 94, 0.55)" // Flash red on flick bursts
          : mouse.active && Math.abs(mouse.x - p1.x) < 400
            ? "rgba(168, 85, 247, 0.45)" 
            : p1.color;
        ctx.fill();

        // High-Performance Indexed Proximity Loop: Limits heavy connecting overheads
        // Skip web rendering if scrolling fast to keep UI smooth
        if (mouse.velocity < 22) {
          for (let j = i + 1; j < particles.length; j += 3) { 
            const p2 = particles[j];
            const distx = p1.x - p2.x;
            const disty = p1.y - p2.y;
            const linkDist = Math.sqrt(distx * distx + disty * disty);

            if (linkDist < 115) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(139, 92, 246, ${0.06 * (1 - linkDist / 115)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    
    // 🌟 THE FIX: Track cursor positioning directly through the window's master layer
    const handleGlobalMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX + window.scrollX;
      mouseRef.current.y = e.clientY + window.scrollY;
      mouseRef.current.active = true;
    };

    const handleGlobalMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseleave", handleGlobalMouseLeave);

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseleave", handleGlobalMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Return a completely clean background layer with mouse events disabled to let cards click cleanly
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none z-0 opacity-70" />;
}