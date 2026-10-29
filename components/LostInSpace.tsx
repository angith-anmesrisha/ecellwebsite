"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import BlackHoleCanvas from "./BlackHoleCanvas";

// Shared layout for the 404 and error pages: a small black hole above the message
export default function LostInSpace({ code, title, body, action }: { code: string; title: string; body: string; action: ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="relative w-full max-w-md aspect-[16/9] mb-6" aria-hidden="true">
        <BlackHoleCanvas animate={!reduceMotion} zoom={2.4} resolutionScale={0.7} />
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-300">{code}</p>
      <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-white max-w-lg">{title}</h1>
      <p className="mt-3 text-sm text-white/60 max-w-md">{body}</p>
      <div className="mt-8">{action}</div>
    </div>
  );
}
