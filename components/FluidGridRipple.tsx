"use client";

import React, { useEffect, useRef } from "react";

export default function FluidGridRipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, vx: 0, vy: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let gridPoints: Array<{ x: number; y: number; originalX: number; originalY: number; vx: number; vy: number }> = [];
    
    const spacing = 55; // Perfect density for full-screen brutalist grids
    let cols = 0;
    let rows = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      // 🌟 FULL PAGE HEIGHT MATRICES: Track the complete scrollable height of your project document
      canvas.height = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight
      );
      initGrid();
    };

    const initGrid = () => {
      gridPoints = [];
      cols = Math.ceil(canvas.width / spacing) + 1;
      rows = Math.ceil(canvas.height / spacing) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing;
          const y = r * spacing;
          gridPoints.push({
            x,
            y,
            originalX: x,
            originalY: y,
            vx: 0,
            vy: 0
          });
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;

      if (mouse.active) {
        mouse.vx = mouse.x - mouse.lastX;
        mouse.vy = mouse.y - mouse.lastY;
      } else {
        mouse.vx *= 0.95;
        mouse.vy *= 0.95;
      }
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;

      gridPoints.forEach((p) => {
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // 🌟 RADIUS OPTIMIZATION: Reduced from 260 down to 120 for a tight, crisp localized warp
          const maxRadius = 180;

          if (distance < maxRadius) {
            const force = (maxRadius - distance) / maxRadius;
            // Slightly tightened distortion scale to keep grid intersections neat
            const distortion = force * 45; 

            const angle = Math.atan2(dy, dx);
            // Adjusted multipliers for a snappy, precise response curve
            p.vx -= Math.cos(angle) * distortion * 0.22;
            p.vy -= Math.sin(angle) * distortion * 0.22;
          }
        }

        // Return forces
        p.vx += (p.originalX - p.x) * 0.05;
        p.vy += (p.originalY - p.y) * 0.05;
        p.vx *= 0.82;
        p.vy *= 0.82;

        p.x += p.vx;
        p.y += p.vy;
      });

      ctx.strokeStyle = "rgba(147, 51, 234, 0.18)";
      ctx.lineWidth = 1.5;

      // Draw horizontal lines across full canvas depth
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const p = gridPoints[r * cols + c];
          if (c === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Draw vertical lines across full canvas depth
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const p = gridPoints[r * cols + c];
          if (r === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();

    // 🌟 GLOBAL VIEWPORT TRACKING MOUSE LISTENERS:
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
    
    // Recalculate canvas when dynamic content loads or shifts layout sizes
    window.addEventListener("scroll", () => {
      const fullHeight = document.documentElement.scrollHeight;
      if (canvas.height !== fullHeight) {
        canvas.height = fullHeight;
      }
    });

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseleave", handleGlobalMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none z-0" />;
}