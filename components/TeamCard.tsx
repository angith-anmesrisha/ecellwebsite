"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function TeamCard({ name, role }: { name: string, role: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Add spring physics for a buttery smooth tilt return
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Map mouse position to rotation degrees (max 15 degrees of tilt)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative w-full h-80 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex flex-col justify-end p-6 cursor-pointer group"
    >
      {/* Dynamic Glow Effect behind the card */}
      <div className="absolute inset-0 rounded-2xl bg-blue-500/0 group-hover:bg-blue-500/20 transition duration-500 blur-xl -z-10" />
      
      {/* Content moved forward in 3D space */}
      <div style={{ transform: "translateZ(50px)" }}>
        <div className="w-16 h-16 rounded-full bg-white/20 mb-4 border border-white/30 backdrop-blur-md" /> {/* Placeholder for face photo */}
        <h3 className="text-xl font-bold text-white">{name}</h3>
        <p className="text-blue-400 font-medium text-sm tracking-wide">{role}</p>
      </div>
    </motion.div>
  );
}