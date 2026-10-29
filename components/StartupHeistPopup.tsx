"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Calendar, X } from "lucide-react";

// Deterministic star field so the scene renders identically every time
const STARS = Array.from({ length: 70 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return {
    left: r(1) * 100,
    top: r(2) * 100,
    size: r(3) > 0.93 ? 2 : 1,
    opacity: 0.25 + r(6) * 0.6,
    delay: r(4) * 6,
    duration: 4 + r(5) * 5,
  };
});

const EASE = [0.16, 1, 0.3, 1] as const;

function Spacecraft() {
  return (
    <svg viewBox="-120 0 420 80" className="w-full h-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id="sc-hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#71717a" />
          <stop offset="35%" stopColor="#3f3f46" />
          <stop offset="70%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#27272a" />
        </linearGradient>
        <linearGradient id="sc-panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="100%" stopColor="#111113" />
        </linearGradient>
        <linearGradient id="sc-plume" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="15%" stopColor="#dbeafe" />
          <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
        </linearGradient>
        <filter id="sc-glow" x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Ion engine plumes */}
      <g className="sc-plume" style={{ transformOrigin: "34px 40px" }}>
        <rect x="-115" y="32" width="150" height="5" rx="2.5" fill="url(#sc-plume)" filter="url(#sc-glow)" />
        <rect x="-115" y="43" width="150" height="5" rx="2.5" fill="url(#sc-plume)" filter="url(#sc-glow)" />
        <rect x="-60" y="34" width="95" height="1.5" fill="url(#sc-plume)" />
        <rect x="-60" y="44.5" width="95" height="1.5" fill="url(#sc-plume)" />
      </g>

      {/* Radiator wings */}
      <path d="M112 25 L86 6 L146 6 L172 24 Z" fill="url(#sc-panel)" stroke="#52525b" strokeWidth="0.6" />
      <path d="M112 55 L86 74 L146 74 L172 56 Z" fill="url(#sc-panel)" stroke="#3f3f46" strokeWidth="0.6" />
      {[100, 112, 124, 136].map((x) => (
        <g key={x} stroke="#000" strokeOpacity="0.55" strokeWidth="0.6">
          <line x1={x} y1="8" x2={x + 20} y2="23" />
          <line x1={x} y1="72" x2={x + 20} y2="57" />
        </g>
      ))}

      {/* Engine block */}
      <rect x="30" y="30" width="16" height="9" rx="1" fill="#18181b" stroke="#3f3f46" strokeWidth="0.6" />
      <rect x="30" y="41" width="16" height="9" rx="1" fill="#18181b" stroke="#3f3f46" strokeWidth="0.6" />
      <circle cx="33" cy="34.5" r="2.4" fill="#eff6ff" />
      <circle cx="33" cy="45.5" r="2.4" fill="#eff6ff" />

      {/* Hull */}
      <path
        d="M44 33 L72 25 L204 23 L262 35 L284 40 L262 45 L204 57 L72 55 L44 47 Z"
        fill="url(#sc-hull)"
        stroke="#52525b"
        strokeWidth="0.75"
      />
      {/* Dorsal spine */}
      <path d="M92 25 L196 23.5 L222 30 L96 31 Z" fill="#52525b" opacity="0.7" />
      {/* Warm rim light from the black hole */}
      <path d="M204 23 L262 35 L284 40" stroke="#fbbf24" strokeOpacity="0.55" strokeWidth="0.8" fill="none" />

      {/* Panel seams */}
      {[96, 128, 160, 192, 226].map((x) => (
        <line key={x} x1={x} y1="25" x2={x} y2="55" stroke="#000" strokeOpacity="0.5" strokeWidth="0.6" />
      ))}
      <line x1="72" y1="40" x2="262" y2="40" stroke="#000" strokeOpacity="0.35" strokeWidth="0.5" />

      {/* Cockpit slit */}
      <path d="M232 35.5 L262 38.5 L232 39.5 Z" fill="#fde68a" opacity="0.85" />

      {/* Navigation lights */}
      <circle cx="144" cy="7" r="1.4" fill="#f87171" className="sc-blink" />
      <circle cx="144" cy="73" r="1.4" fill="#4ade80" className="sc-blink" style={{ animationDelay: "0.8s" }} />
    </svg>
  );
}

function BlackHole() {
  return (
    <div className="relative w-full h-full">
      {/* Lensed halo */}
      <div className="absolute inset-[18%] rounded-full shadow-[0_0_40px_12px_rgba(251,191,36,0.35),0_0_90px_30px_rgba(234,88,12,0.18)]" />
      {/* Upper lensed arc of the disk */}
      <div className="absolute inset-[12%] rounded-full border-[3px] border-amber-100/80 blur-[1.5px]" />
      <div className="absolute inset-[14%] rounded-full border border-orange-300/60 blur-[3px]" />
      {/* Event horizon */}
      <div className="absolute inset-[19%] rounded-full bg-black" />
      {/* Accretion disk crossing in front */}
      <div
        className="sc-anim absolute left-[-30%] right-[-30%] top-1/2 h-[16%] -translate-y-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,#fffbeb_0%,#fcd34d_25%,#ea580c_55%,transparent_75%)] blur-[2px]"
        style={{ animation: "sc-disk 6s ease-in-out infinite" }}
      />
      <div className="absolute left-[-10%] right-[-10%] top-1/2 h-[4%] -translate-y-1/2 rounded-[50%] bg-white/90 blur-[1px]" />
    </div>
  );
}

export default function StartupHeistPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.2 } }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
        >
          <style>{`
            @keyframes sc-twinkle { 0%,100% { opacity: var(--o) } 50% { opacity: calc(var(--o) * .3) } }
            @keyframes sc-plume { 0%,100% { transform: scaleX(1); opacity: 1 } 50% { transform: scaleX(.94); opacity: .85 } }
            @keyframes sc-blink { 0%,85%,100% { opacity: 0 } 88%,96% { opacity: 1 } }
            @keyframes sc-disk { 0%,100% { transform: translateY(-50%) scaleX(1); opacity: 1 } 50% { transform: translateY(-50%) scaleX(1.06); opacity: .85 } }
            @keyframes sc-sweep { to { transform: rotate(360deg) } }
            @keyframes sc-scan { from { transform: translateY(-100%) } to { transform: translateY(400%) } }
            .sc-plume { animation: sc-plume .4s ease-in-out infinite }
            .sc-blink { animation: sc-blink 2.4s linear infinite }
            @media (prefers-reduced-motion: reduce) {
              .sc-anim, .sc-plume, .sc-blink { animation: none !important }
            }
          `}</style>

          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

          {/* Card with a slow light sweep around its border */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.97, y: 12, filter: "blur(8px)", transition: { duration: 0.45, delay: 0.2, ease: "easeIn" } }}
            transition={{ duration: 0.9, ease: EASE }}
            className="relative w-full max-w-lg rounded-2xl p-px overflow-hidden shadow-[0_30px_120px_-20px_rgba(234,88,12,0.25)]"
          >
            <div className="absolute inset-0 bg-white/10" />
            <div
              className="sc-anim absolute -inset-[80%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_280deg,rgba(251,191,36,0.9)_330deg,rgba(255,255,255,0.9)_350deg,transparent_360deg)]"
              style={{ animation: "sc-sweep 7s linear infinite" }}
            />

            <div className="relative rounded-[15px] bg-[#060608] overflow-hidden">
              {/* Close Button */}
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-3 right-3 z-30 p-2 text-white/60 hover:text-white bg-black/50 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* --- Deep space scene --- */}
              <div className="relative h-44 sm:h-52 overflow-hidden bg-[radial-gradient(ellipse_at_78%_45%,rgba(120,53,15,0.35),transparent_55%),radial-gradient(ellipse_at_15%_80%,rgba(30,58,138,0.25),transparent_60%),#030304]">
                {STARS.map((s, i) => (
                  <span
                    key={i}
                    className="sc-anim absolute rounded-full bg-white"
                    style={{
                      left: `${s.left}%`,
                      top: `${s.top}%`,
                      width: s.size,
                      height: s.size,
                      opacity: s.opacity,
                      ["--o" as string]: s.opacity,
                      animation: `sc-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
                    }}
                  />
                ))}

                {/* Black hole */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
                  className="absolute top-1/2 -translate-y-1/2 right-[6%] w-28 h-28 sm:w-36 sm:h-36"
                >
                  <BlackHole />
                </motion.div>

                {/* Spacecraft: glides in, drifts, then burns away toward the black hole on close */}
                <motion.div
                  initial={{ x: -360, y: 18, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: 1 }}
                  exit={{ x: 420, y: -10, scale: 0.25, opacity: 0, transition: { duration: 0.65, ease: [0.6, 0, 0.9, 0.3] } }}
                  transition={{ duration: 1.8, ease: EASE, delay: 0.35 }}
                  className="absolute left-[6%] sm:left-[8%] top-1/2 -mt-[24px] sm:-mt-[28px] w-[240px] h-[46px] sm:w-[290px] sm:h-[56px]"
                >
                  <motion.div
                    animate={reduceMotion ? undefined : { y: [0, -3, 0], rotate: [-2, -1, -2] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="w-full h-full"
                  >
                    <Spacecraft />
                  </motion.div>
                </motion.div>

                {/* Telemetry overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="absolute left-4 bottom-3 font-mono text-[8px] sm:text-[9px] tracking-[0.25em] uppercase text-white/35 leading-relaxed"
                >
                  <div>Vector 047.2 // Gargantua</div>
                  <div>Signal: locked</div>
                </motion.div>
                <span
                  className="sc-anim absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent pointer-events-none"
                  style={{ animation: "sc-scan 5s linear infinite" }}
                />

                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[#060608]" />
              </div>

              {/* --- Content --- */}
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.6 } } }}
                className="relative px-6 sm:px-8 pb-7 pt-3 space-y-5"
              >
                <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-80 h-48 bg-orange-600/10 blur-[80px] rounded-full pointer-events-none" />

                {/* Live Status Tag */}
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
                  className="relative inline-flex items-center gap-2 px-3 py-1 border border-amber-400/30 bg-amber-400/5 text-amber-200/90 text-[9px] font-mono font-bold uppercase rounded-full tracking-[0.25em]"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-300"></span>
                  </span>
                  Live Event Protocol Active
                </motion.div>

                {/* Headers */}
                <div className="relative">
                  <motion.h2
                    variants={{
                      hidden: { opacity: 0, y: 16, letterSpacing: "0.3em", filter: "blur(8px)" },
                      show: { opacity: 1, y: 0, letterSpacing: "-0.02em", filter: "blur(0px)", transition: { duration: 1.1, ease: EASE } },
                    }}
                    className="text-4xl sm:text-5xl font-black uppercase leading-[0.95] mb-3 bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-500"
                  >
                    Startup <br /> Heist
                  </motion.h2>
                  <motion.div
                    variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } } }}
                    className="flex items-center gap-2 text-zinc-400 font-mono text-xs sm:text-sm uppercase tracking-[0.25em]"
                  >
                    <Calendar size={14} className="text-amber-300/80" />
                    <span>Nov 2 & 3</span>
                  </motion.div>
                </div>

                <motion.p
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
                  className="relative text-zinc-400 text-sm font-sans leading-relaxed"
                >
                  The secure gateway for the Startup Heist event is currently active. Authorized participants can proceed to the assessment portal to begin.
                </motion.p>

                {/* Actions */}
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
                  className="pt-4 border-t border-white/10 flex items-center justify-between gap-4 relative z-20"
                >
                  <button
                    onClick={onClose}
                    className="text-[10px] font-mono font-bold text-white/40 hover:text-white uppercase tracking-widest transition cursor-pointer"
                  >
                    [ Dismiss ]
                  </button>
                  <button
                    onClick={() => (window.location.href = "/quiz-entry")}
                    className="group relative overflow-hidden px-6 py-3.5 bg-white hover:bg-amber-100 text-black font-black uppercase text-xs tracking-wider rounded-lg flex items-center gap-2 transition-all duration-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.45)] cursor-pointer"
                  >
                    Take Me There
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
