"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface Star {
  x: number;
  y: number;
  radius: number;
  depth: number; // 0..1, nearer stars drift faster with scroll and the pointer
  color: string;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

// Mostly white stars with a few warm (accretion gold) and cool (nebula blue) ones
const pickColor = (roll: number) => (roll > 0.9 ? "253, 224, 138" : roll > 0.78 ? "165, 180, 252" : "255, 255, 255");

// A fixed, screen-sized starfield behind every page. It replaces the old full-page
// particle canvas: one viewport-sized bitmap, depth parallax on scroll, gentle twinkle,
// and it stops drawing when the tab is hidden or the visitor prefers reduced motion.
export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  // Consoles and forms get a quieter sky so text stays easy to read
  const isQuiet = /\/(admin|recruitment|results)/.test(pathname || "");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let shooting: ShootingStar | null = null;
    let nextShootingAt = performance.now() + 6000;
    let raf = 0;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const isMobile = width < 768;
      const density = isQuiet ? 14000 : 5200;
      const cap = isQuiet ? 90 : isMobile ? 140 : 320;
      const count = Math.min(Math.floor((width * height) / density), cap);

      stars = Array.from({ length: count }, () => {
        const depth = Math.random() ** 2;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 0.35 + depth * 1.25,
          depth,
          color: pickColor(Math.random()),
          alpha: (isQuiet ? 0.25 : 0.35) + Math.random() * 0.5,
          twinkleSpeed: 0.4 + Math.random() * 1.6,
          twinklePhase: Math.random() * Math.PI * 2,
        };
      });
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const scrollY = window.scrollY;
      pointer.x += (pointer.targetX - pointer.x) * 0.04;
      pointer.y += (pointer.targetY - pointer.y) * 0.04;
      const t = time / 1000;

      for (const star of stars) {
        // Parallax: deeper stars barely move, near ones drift more; wrap around the screen
        const shift = scrollY * (0.02 + star.depth * 0.12);
        const x = (((star.x + pointer.x * star.depth * 12) % width) + width) % width;
        const y = (((star.y - shift + pointer.y * star.depth * 12) % height) + height) % height;
        const twinkle = reduceMotion ? 1 : 0.65 + 0.35 * Math.sin(t * star.twinkleSpeed + star.twinklePhase);
        ctx.fillStyle = `rgba(${star.color}, ${star.alpha * twinkle})`;
        if (star.radius < 0.9) {
          ctx.fillRect(x, y, star.radius * 2, star.radius * 2);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, star.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Occasional shooting star on the full sky only
      if (!isQuiet && !reduceMotion) {
        if (!shooting && time > nextShootingAt) {
          shooting = {
            x: Math.random() * width * 0.7 + width * 0.15,
            y: Math.random() * height * 0.35,
            vx: 7 + Math.random() * 4,
            vy: 2.5 + Math.random() * 2,
            life: 1,
          };
        }
        if (shooting) {
          const tail = 14;
          const gradient = ctx.createLinearGradient(shooting.x, shooting.y, shooting.x - shooting.vx * tail, shooting.y - shooting.vy * tail);
          gradient.addColorStop(0, `rgba(255, 244, 214, ${0.8 * shooting.life})`);
          gradient.addColorStop(1, "rgba(255, 244, 214, 0)");
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(shooting.x, shooting.y);
          ctx.lineTo(shooting.x - shooting.vx * tail, shooting.y - shooting.vy * tail);
          ctx.stroke();
          shooting.x += shooting.vx;
          shooting.y += shooting.vy;
          shooting.life -= 0.012;
          if (shooting.life <= 0 || shooting.x > width + 200 || shooting.y > height + 200) {
            shooting = null;
            nextShootingAt = time + 9000 + Math.random() * 12000;
          }
        }
      }
    };

    const loop = (time: number) => {
      draw(time);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduceMotion) draw(performance.now());
      else if (!document.hidden) raf = requestAnimationFrame(loop);
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        build();
        start();
      }, 150);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.targetX = e.clientX / width - 0.5;
      pointer.targetY = e.clientY / height - 0.5;
    };
    // With reduced motion there is no loop, so redraw on scroll to keep the parallax position
    const onScroll = () => {
      if (reduceMotion) draw(performance.now());
    };

    build();
    start();
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", start);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", start);
    };
  }, [isQuiet]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_80%_10%,rgba(180,83,9,0.08),transparent_50%),radial-gradient(ellipse_at_10%_90%,rgba(67,56,202,0.08),transparent_55%)]"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
