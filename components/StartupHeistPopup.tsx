"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Calendar, CalendarPlus, X } from "lucide-react";
import BlackHoleCanvas from "./BlackHoleCanvas";

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

// Event window in IST. The countdown runs to the start; during the event it shows "live".
const EVENT_TITLE = "Startup Heist | BIMTECH E-Cell";
const EVENT_START = new Date("2026-11-02T00:00:00+05:30");
const EVENT_END = new Date("2026-11-04T00:00:00+05:30");
const EVENT_LOCATION = "BIMTECH, Greater Noida";
const EVENT_DETAILS = "Startup Heist by BIMTECH E-Cell. Entry details are on the E-Cell website.";

const GOOGLE_CALENDAR_URL =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  `&text=${encodeURIComponent(EVENT_TITLE)}` +
  "&dates=20261102/20261104" +
  `&details=${encodeURIComponent(EVENT_DETAILS)}` +
  `&location=${encodeURIComponent(EVENT_LOCATION)}`;

function downloadIcs() {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BIMTECH E-Cell//Startup Heist//EN",
    "BEGIN:VEVENT",
    "UID:startup-heist-2026@bimtech-ecell",
    "DTSTAMP:20261029T000000Z",
    "DTSTART;VALUE=DATE:20261102",
    "DTEND;VALUE=DATE:20261104",
    `SUMMARY:${EVENT_TITLE}`,
    `LOCATION:${EVENT_LOCATION}`,
    `DESCRIPTION:${EVENT_DETAILS}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "startup-heist.ics";
  link.click();
  URL.revokeObjectURL(url);
}

function useCountdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (now === null || now >= EVENT_END.getTime()) return null;
  const diff = EVENT_START.getTime() - now;
  if (diff <= 0) return { live: true as const };
  return {
    live: false as const,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function StartupHeistPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const countdown = useCountdown();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Escape closes; focus moves into the dialog and back to where it was afterwards
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus({ preventScroll: true });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.2 } }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="startup-heist-title"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
        >
          <style>{`
            @keyframes sc-twinkle { 0%,100% { opacity: var(--o) } 50% { opacity: calc(var(--o) * .3) } }
            @keyframes sc-sweep { to { transform: rotate(360deg) } }
            @keyframes sc-scan { from { transform: translateY(-100%) } to { transform: translateY(400%) } }
            @media (prefers-reduced-motion: reduce) {
              .sc-anim { animation: none !important }
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
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Close"
                className="absolute top-3 right-3 z-30 p-2 text-white/60 hover:text-white bg-black/50 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* --- Deep space scene --- */}
              <div className="relative h-48 sm:h-60 overflow-hidden bg-[radial-gradient(ellipse_at_78%_45%,rgba(120,53,15,0.35),transparent_55%),radial-gradient(ellipse_at_15%_80%,rgba(30,58,138,0.25),transparent_60%),#030304]">
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
                  initial={{ opacity: 0, scale: 0.6, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ scale: 0.2, opacity: 0, filter: "blur(6px)", transition: { duration: 0.5, ease: [0.6, 0, 0.9, 0.3] } }}
                  transition={{ duration: 1.8, ease: EASE, delay: 0.2 }}
                  className="absolute inset-0"
                >
                  <BlackHoleCanvas animate={!reduceMotion} />
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
                    id="startup-heist-title"
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
                  {countdown && (
                    <motion.div
                      variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
                      className="mt-4 flex flex-wrap items-center gap-3"
                    >
                      {countdown.live ? (
                        <span className="font-mono text-xs uppercase tracking-[0.25em] text-amber-200">Happening now</span>
                      ) : (
                        <div className="flex gap-2" aria-label={`Starts in ${countdown.days} days and ${countdown.hours} hours`}>
                          {[
                            { label: "Days", value: countdown.days },
                            { label: "Hrs", value: countdown.hours },
                            { label: "Min", value: countdown.minutes },
                            { label: "Sec", value: countdown.seconds },
                          ].map((unit) => (
                            <div key={unit.label} className="w-12 rounded-lg border border-white/10 bg-white/[0.03] py-1.5 text-center" aria-hidden="true">
                              <div className="font-mono text-base font-bold tabular-nums text-white">{String(unit.value).padStart(2, "0")}</div>
                              <div className="font-mono text-[8px] uppercase tracking-widest text-white/50">{unit.label}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest">
                        <a
                          href={GOOGLE_CALENDAR_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-amber-200/80 hover:text-amber-100 transition-colors"
                        >
                          <CalendarPlus size={12} />
                          Google Calendar
                        </a>
                        <button
                          onClick={downloadIcs}
                          className="text-white/50 hover:text-white transition-colors cursor-pointer"
                        >
                          .ics
                        </button>
                      </div>
                    </motion.div>
                  )}
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
                    className="text-[10px] font-mono font-bold text-white/60 hover:text-white uppercase tracking-widest transition cursor-pointer"
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
