"use client";

import React, { useEffect, useState } from "react";

// First-visit intro. It only waits for the page to actually finish loading (with a short
// minimum so it doesn't flash) and is pure CSS, so it costs no extra JavaScript or WebGL.
const MIN_VISIBLE_MS = 900;
const MAX_VISIBLE_MS = 3500;

export default function Preloader() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("ecell_preloader_seen") === "true") return;
    } catch {}
    setShouldRender(true);

    const shownAt = performance.now();
    let leaveTimer: ReturnType<typeof setTimeout>;
    const finish = () => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - shownAt));
      leaveTimer = setTimeout(() => {
        setIsLeaving(true);
        try {
          sessionStorage.setItem("ecell_preloader_seen", "true");
        } catch {}
      }, wait);
    };

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    // Never hold the page hostage to a slow third-party resource
    const safetyTimer = setTimeout(finish, MAX_VISIBLE_MS);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(safetyTimer);
      window.removeEventListener("load", finish);
    };
  }, []);

  useEffect(() => {
    if (!isLeaving) return;
    const unmountTimer = setTimeout(() => setShouldRender(false), 600);
    return () => clearTimeout(unmountTimer);
  }, [isLeaving]);

  if (!shouldRender) return null;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-space transition-opacity duration-500 ease-in-out ${
        isLeaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <style>{`
        @keyframes pl-orbit { to { transform: rotate(360deg) } }
        @keyframes pl-fill { from { transform: scaleX(0) } to { transform: scaleX(1) } }
      `}</style>

      <div className="relative w-28 h-28 mb-10" aria-hidden="true">
        {/* A tiny event horizon with a warm photon ring orbiting it */}
        <div className="absolute inset-0 rounded-full bg-accent-600/20 blur-2xl" />
        <div className="absolute inset-[22%] rounded-full bg-black shadow-[0_0_0_2px_rgba(253,230,138,0.7),0_0_30px_6px_rgba(245,158,11,0.35)]" />
        <div
          className="absolute inset-0 rounded-full border border-transparent border-t-accent-200/80 border-r-accent-500/40"
          style={{ animation: "pl-orbit 1.4s linear infinite" }}
        />
      </div>

      <p className="text-[10px] font-mono font-bold tracking-[0.3em] text-accent-200/80 uppercase mb-3">
        BIMTECH E-Cell
      </p>
      <h2 className="text-lg font-medium text-white/90 tracking-wide font-serif italic max-w-xs text-center leading-relaxed px-6">
        &ldquo;Where Aspiration Meets Opportunity.&rdquo;
      </h2>

      <div className="w-52 mt-8 h-[2px] bg-white/[0.08] rounded-full overflow-hidden" aria-hidden="true">
        <div
          className="h-full origin-left bg-gradient-to-r from-accent-600 via-accent-300 to-accent-100"
          style={{ animation: `pl-fill ${MIN_VISIBLE_MS}ms cubic-bezier(0.16, 1, 0.3, 1) forwards` }}
        />
      </div>
    </div>
  );
}
