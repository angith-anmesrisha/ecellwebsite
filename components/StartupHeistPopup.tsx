"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Calendar, Rocket, X } from "lucide-react";

// Deterministic star field so the scene renders identically every time
const STARS = Array.from({ length: 38 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return {
    left: r(1) * 100,
    top: r(2) * 100,
    size: r(3) > 0.85 ? 3 : r(3) > 0.5 ? 2 : 1,
    delay: r(4) * 4,
    duration: 2 + r(5) * 3,
  };
});

const SPEED_LINES = [
  { top: 18, width: 70, delay: 0, duration: 1.4 },
  { top: 34, width: 110, delay: 0.6, duration: 1.1 },
  { top: 52, width: 60, delay: 0.3, duration: 1.6 },
  { top: 68, width: 90, delay: 1.0, duration: 1.2 },
  { top: 82, width: 50, delay: 0.8, duration: 1.5 },
];

const TITLE = ["Startup", "Heist"];

function Spaceship() {
  return (
    <svg viewBox="-70 0 270 100" className="w-full h-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id="sh-hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#e9d5ff" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="sh-fin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0abfc" />
          <stop offset="100%" stopColor="#c026d3" />
        </linearGradient>
        <radialGradient id="sh-glass" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ecfeff" />
          <stop offset="45%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0e7490" />
        </radialGradient>
        <linearGradient id="sh-flame" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#fde047" />
          <stop offset="60%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Engine flame */}
      <g className="sh-flame" style={{ transformOrigin: "16px 50px" }}>
        <path d="M16 40 Q -20 44 -62 50 Q -20 56 16 60 Z" fill="url(#sh-flame)" />
        <path d="M16 45 Q -5 47 -28 50 Q -5 53 16 55 Z" fill="#fff7ed" opacity="0.9" />
      </g>

      {/* Fins */}
      <path d="M62 37 L38 8 Q46 4 56 10 L96 36 Z" fill="url(#sh-fin)" />
      <path d="M62 63 L38 92 Q46 96 56 90 L96 64 Z" fill="url(#sh-fin)" />

      {/* Engine nozzle */}
      <rect x="10" y="41" width="14" height="18" rx="3" fill="#4c1d95" />
      <rect x="6" y="43" width="6" height="14" rx="2" fill="#7c3aed" />

      {/* Hull */}
      <path
        d="M20 50 C 36 30, 120 26, 178 46 C 186 48.5, 186 51.5, 178 54 C 120 74, 36 70, 20 50 Z"
        fill="url(#sh-hull)"
        stroke="#7c3aed"
        strokeWidth="1.5"
      />
      {/* Racing stripe */}
      <path d="M40 54 C 80 62, 130 60, 172 52" stroke="#d946ef" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M44 59 C 84 66, 124 64, 160 57" stroke="#22d3ee" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Portholes */}
      <circle cx="78" cy="46" r="5" fill="#312e81" stroke="#a78bfa" strokeWidth="1.5" />
      <circle cx="98" cy="45" r="5" fill="#312e81" stroke="#a78bfa" strokeWidth="1.5" />
      <circle cx="77" cy="44.5" r="1.6" fill="#a5f3fc" />
      <circle cx="97" cy="43.5" r="1.6" fill="#a5f3fc" />

      {/* Cockpit */}
      <ellipse cx="140" cy="44" rx="20" ry="10" fill="url(#sh-glass)" stroke="#0e7490" strokeWidth="1.5" />
      <ellipse cx="134" cy="40" rx="7" ry="2.5" fill="#ffffff" opacity="0.8" />

      {/* Nose tip light */}
      <circle cx="181" cy="50" r="2.5" fill="#f472b6" className="sh-blink" />
    </svg>
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
  const loop = (duration: number) =>
    reduceMotion ? undefined : { repeat: Infinity, duration, ease: "easeInOut" as const };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.15 } }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
        >
          <style>{`
            @keyframes sh-twinkle { 0%,100% { opacity: .15; transform: scale(.7) } 50% { opacity: 1; transform: scale(1.2) } }
            @keyframes sh-flame { 0%,100% { transform: scaleX(1) scaleY(1) } 25% { transform: scaleX(.78) scaleY(.92) } 50% { transform: scaleX(1.12) scaleY(1.05) } 75% { transform: scaleX(.9) scaleY(.96) } }
            @keyframes sh-blink { 0%,60%,100% { opacity: 1 } 70%,90% { opacity: .2 } }
            @keyframes sh-warp { from { transform: translateX(120%) } to { transform: translateX(-160%) } }
            @keyframes sh-spin { to { transform: rotate(360deg) } }
            @keyframes sh-shimmer { from { background-position: 0% 50% } to { background-position: 200% 50% } }
            @keyframes sh-shine { 0% { transform: translateX(-120%) skewX(-20deg) } 60%,100% { transform: translateX(320%) skewX(-20deg) } }
            @keyframes sh-shoot { 0% { transform: translate(0,0) rotate(-25deg); opacity: 0 } 5% { opacity: 1 } 25%,100% { transform: translate(-260px,120px) rotate(-25deg); opacity: 0 } }
            .sh-flame { animation: sh-flame .18s linear infinite }
            .sh-blink { animation: sh-blink 1.6s ease-in-out infinite }
            @media (prefers-reduced-motion: reduce) {
              .sh-anim, .sh-flame, .sh-blink { animation: none !important }
            }
          `}</style>

          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(76,29,149,0.45),rgba(0,0,0,0.75))] backdrop-blur-md"
            onClick={onClose}
          />

          {/* Card with spinning gradient border */}
          <motion.div
            initial={{ scale: 0.6, y: 80, rotateX: 25, opacity: 0 }}
            animate={{ scale: 1, y: 0, rotateX: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0, transition: { duration: 0.3, delay: 0.15, ease: "easeIn" } }}
            transition={{ type: "spring", stiffness: 180, damping: 16, mass: 0.9 }}
            style={{ transformPerspective: 1200 }}
            className="relative w-full max-w-lg rounded-[28px] p-[2px] overflow-hidden shadow-[0_0_80px_-10px_rgba(217,70,239,0.55),0_0_140px_-30px_rgba(34,211,238,0.6)]"
          >
            <div
              className="sh-anim absolute -inset-[60%] bg-[conic-gradient(from_0deg,#22d3ee,#a855f7,#ec4899,#facc15,#22d3ee)]"
              style={{ animation: "sh-spin 5s linear infinite" }}
            />

            <div className="relative rounded-[26px] bg-[#0b0618] overflow-hidden">
              {/* Close Button */}
              <motion.button
                onClick={onClose}
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close"
                className="absolute top-3 right-3 z-30 p-2 text-white/80 hover:text-white bg-black/40 hover:bg-fuchsia-500/40 border border-white/15 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
              >
                <X size={16} />
              </motion.button>

              {/* --- Space scene --- */}
              <div className="relative h-40 sm:h-48 overflow-hidden bg-[radial-gradient(ellipse_at_70%_120%,#c026d3_0%,#6d28d9_35%,#1e1b4b_70%,#0b0618_100%)]">
                {/* Stars */}
                {STARS.map((s, i) => (
                  <span
                    key={i}
                    className="sh-anim absolute rounded-full bg-white"
                    style={{
                      left: `${s.left}%`,
                      top: `${s.top}%`,
                      width: s.size,
                      height: s.size,
                      boxShadow: s.size > 2 ? "0 0 6px 1px rgba(255,255,255,0.8)" : undefined,
                      animation: `sh-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
                    }}
                  />
                ))}

                {/* Warp speed lines */}
                {SPEED_LINES.map((l, i) => (
                  <span
                    key={i}
                    className="sh-anim absolute right-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent"
                    style={{
                      top: `${l.top}%`,
                      width: l.width,
                      animation: `sh-warp ${l.duration}s linear ${l.delay}s infinite`,
                    }}
                  />
                ))}

                {/* Shooting star */}
                <span
                  className="sh-anim absolute top-3 right-10 h-[2px] w-16 rounded-full bg-gradient-to-l from-transparent to-white"
                  style={{ animation: "sh-shoot 6s ease-out 2s infinite", opacity: 0 }}
                />

                {/* Ringed planet */}
                <motion.div
                  initial={{ scale: 0, rotate: -40 }}
                  animate={{ scale: 1, rotate: 0, y: reduceMotion ? 0 : [0, -4, 0] }}
                  transition={{
                    scale: { type: "spring", stiffness: 120, damping: 12, delay: 0.25 },
                    rotate: { duration: 0.8, delay: 0.25 },
                    y: loop(5),
                  }}
                  className="absolute -top-6 right-14 sm:right-20 w-20 h-20 sm:w-24 sm:h-24"
                >
                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,#fde68a,#fb923c_45%,#db2777_80%)] shadow-[0_0_40px_rgba(251,146,60,0.6)]" />
                  <div className="absolute left-1/2 top-1/2 w-[170%] h-[38%] -translate-x-1/2 -translate-y-1/2 -rotate-[18deg] rounded-[50%] border-[3px] border-amber-200/80 border-t-transparent" />
                </motion.div>

                {/* Small moon */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1, x: reduceMotion ? 0 : [0, 6, 0] }}
                  transition={{ opacity: { delay: 0.5 }, scale: { delay: 0.5 }, x: loop(7) }}
                  className="absolute bottom-6 left-8 w-6 h-6 rounded-full bg-[radial-gradient(circle_at_30%_30%,#a5f3fc,#0891b2)] shadow-[0_0_18px_rgba(34,211,238,0.7)]"
                />

                {/* Spaceship: flies in, hovers, then blasts off on close */}
                <motion.div
                  initial={{ x: -320, y: 70, rotate: 18, scale: 0.6, opacity: 0 }}
                  animate={{ x: 0, y: 0, rotate: -8, scale: 1, opacity: 1 }}
                  exit={{ x: 520, y: -180, rotate: -28, scale: 0.4, opacity: 0, transition: { duration: 0.5, ease: [0.55, 0, 0.9, 0.4] } }}
                  transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.35 }}
                  className="absolute left-1/2 top-1/2 -ml-[115px] -mt-[45px] sm:-ml-[135px] sm:-mt-[52px] w-[230px] h-[90px] sm:w-[270px] sm:h-[104px]"
                >
                  <motion.div
                    animate={reduceMotion ? undefined : { y: [0, -7, 0], rotate: [0, 1.5, 0] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                    className="w-full h-full drop-shadow-[0_0_18px_rgba(217,70,239,0.55)]"
                  >
                    <Spaceship />
                  </motion.div>
                </motion.div>

                {/* Fade into card body */}
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-[#0b0618]" />
              </div>

              {/* --- Content --- */}
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.45 } } }}
                className="relative px-6 sm:px-8 pb-7 pt-2 space-y-5"
              >
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-600/25 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/20 blur-[80px] rounded-full pointer-events-none" />

                {/* Live Status Tag */}
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  className="relative inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-cyan-500/25 to-fuchsia-500/25 border border-cyan-400/50 text-cyan-200 text-[9px] font-mono font-bold uppercase rounded-full tracking-widest"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-300"></span>
                  </span>
                  Live Event Protocol Active
                </motion.div>

                {/* Headers */}
                <div className="relative">
                  <h2 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-3">
                    {TITLE.map((word) => (
                      <motion.span
                        key={word}
                        variants={{
                          hidden: { opacity: 0, y: 30, rotateX: -80, filter: "blur(6px)" },
                          show: { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 200, damping: 14 } },
                        }}
                        className="sh-anim block w-fit bg-clip-text text-transparent bg-[length:200%_100%] bg-[linear-gradient(90deg,#67e8f9,#ffffff,#f0abfc,#facc15,#67e8f9)] drop-shadow-[0_0_24px_rgba(217,70,239,0.45)]"
                        style={{ animation: "sh-shimmer 4s linear infinite" }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </h2>
                  <motion.div
                    variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-fuchsia-500/15 border border-fuchsia-400/40 text-fuchsia-200 font-mono text-xs sm:text-sm uppercase tracking-widest"
                  >
                    <Calendar size={14} />
                    <span>Nov 2 & 3</span>
                  </motion.div>
                </div>

                <motion.p
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  className="relative text-white/75 text-sm font-sans leading-relaxed"
                >
                  The secure gateway for the Startup Heist event is currently active. Authorized participants can proceed to the assessment portal to begin.
                </motion.p>

                {/* Actions */}
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  className="pt-4 border-t border-white/10 flex items-center justify-between gap-4 relative z-20"
                >
                  <button
                    onClick={onClose}
                    className="text-[10px] font-mono font-bold text-white/50 hover:text-white uppercase tracking-widest transition cursor-pointer"
                  >
                    [ Dismiss ]
                  </button>
                  <motion.button
                    onClick={() => (window.location.href = "/quiz-entry")}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="group relative overflow-hidden px-6 py-3.5 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 text-black font-black uppercase text-xs rounded-xl flex items-center gap-2 shadow-[0_0_28px_rgba(217,70,239,0.6)] cursor-pointer"
                  >
                    <span
                      className="sh-anim absolute inset-y-0 left-0 w-1/3 bg-white/50 blur-sm pointer-events-none"
                      style={{ animation: "sh-shine 2.8s ease-in-out 1.5s infinite" }}
                    />
                    <Rocket size={16} className="relative transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    <span className="relative">Take Me There</span>
                    <ArrowRight size={16} className="relative transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
