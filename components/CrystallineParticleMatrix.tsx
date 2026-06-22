"use client";

import React, { useEffect, useRef } from "react";

interface WaterRipple {
  x: number;
  y: number;
  time: number;
  maxRadius: number;
  strength: number;
}

export default function CrystallineParticleMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, active: false, velocity: 0 });
  const ripplesRef = useRef<WaterRipple[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let resizeTimeout: NodeJS.Timeout;
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
      
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;
      
      canvas.style.width = `${logicalWidth}px`;
      canvas.style.height = `${logicalHeight}px`;
      
      ctx.scale(dpr, dpr);
      
      initParticles(logicalWidth, logicalHeight);
    };

    const initParticles = (w: number, h: number) => {
      particles = [];
      
      const densityMultiplier = 600; 
      const maxCapLimit = 2500;       
      
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

        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 1.2 + 0.5, 
          hue: randomHue,
          baseColor: `hsla(${randomHue}, 90%, 65%, ${Math.random() * 0.15 + 0.2})`, 
          angle: Math.random() * Math.PI * 2,
          speedFactor: Math.random() * 0.05 + 0.01
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
        if (ripple.time > 1.5) {
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
          const activeRadius = 350;

          if (distance < activeRadius) {
            const force = (activeRadius - distance) / activeRadius;
            if (mouse.velocity > 15) {
              p.x -= (dx / distance) * force * (mouse.velocity * 0.4);
              p.y -= (dy / distance) * force * (mouse.velocity * 0.4);
            } else {
              p.x += (dx / distance) * force * 5.0;
              p.y += (dy / distance) * force * 5.0;
              p.x += Math.sin(p.angle) * 0.4;
              p.y += Math.cos(p.angle) * 0.4;
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
          
          const waveSpeed = 240; 
          const currentWaveFront = ripple.time * waveSpeed;
          
          if (rDistance < ripple.maxRadius && rDistance < currentWaveFront) {
            const waveFrequency = 0.09; 
            const waveWidth = 40; 
            const distFromFront = Math.abs(rDistance - currentWaveFront);
            
            if (distFromFront < waveWidth) {
              const waveMath = Math.sin((rDistance - currentWaveFront) * waveFrequency);
              const falloff = (1.0 - distFromFront / waveWidth) * (1.0 - rDistance / ripple.maxRadius);
              const timeDecay = Math.max(0, 1.0 - ripple.time / 1.5);
              
              const pushScale = waveMath * 16 * ripple.strength * falloff * timeDecay;
              
              if (rDistance > 0) {
                renderX += (rDx / rDistance) * pushScale;
                renderY += (rDy / rDistance) * pushScale;
              }
              
              if (waveMath > 0.3) {
                finalColor = `hsla(${p.hue}, 100%, 82%, ${0.65 * falloff * timeDecay})`;
              }
            }
          }
        });

        ctx.beginPath();
        ctx.arc(renderX, renderY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = finalColor;
        ctx.fill();

        if (mouse.velocity < 20) {
          for (let j = i + 1; j < particles.length; j += 6) { 
            const p2 = particles[j];
            const distx = renderX - p2.x;
            const disty = renderY - p2.y;
            const linkDist = Math.sqrt(distx * distx + disty * disty);

            if (linkDist < 100) {
              ctx.beginPath();
              ctx.moveTo(renderX, renderY);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(168, 85, 247, ${0.06 * (1 - linkDist / 100)})`;
              ctx.lineWidth = 0.4;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    
    const triggerRipple = (clientX: number, clientY: number, strength: number) => {
      ripplesRef.current.push({
        x: clientX + window.scrollX,
        y: clientY + window.scrollY,
        time: 0,
        maxRadius: 240, 
        strength: strength
      });
      if (ripplesRef.current.length > 8) ripplesRef.current.shift();
    };

    const handleGlobalClick = (e: MouseEvent) => {
      triggerRipple(e.clientX, e.clientY, 1.5);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX + window.scrollX;
      mouseRef.current.y = e.clientY + window.scrollY;
      mouseRef.current.active = true;

      const dx = mouseRef.current.x - mouseRef.current.lastX;
      const dy = mouseRef.current.y - mouseRef.current.lastY;
      const moveSpeed = Math.sqrt(dx * dx + dy * dy);

      if (moveSpeed > 35) {
        triggerRipple(e.clientX, e.clientY, Math.min(0.7, moveSpeed * 0.008));
      }
    };

    const handleGlobalMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleGlobalScroll = () => {
      if (Math.random() > 0.75) {
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

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("scroll", handleGlobalScroll, { passive: true });
    document.addEventListener("mouseleave", handleGlobalMouseLeave);
    
    window.addEventListener("load", resizeCanvas);
    document.addEventListener("readystatechange", handleAdaptiveLayoutDelay);

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("scroll", handleGlobalScroll);
      window.removeEventListener("load", resizeCanvas);
      document.removeEventListener("mouseleave", handleGlobalMouseLeave);
      document.removeEventListener("readystatechange", handleAdaptiveLayoutDelay);
      clearTimeout(resizeTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full block pointer-events-none mix-blend-screen" 
      style={{ zIndex: 50 }} 
    />
  );
}