"use client";

import { useEffect, useRef, useState } from "react";
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

const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

// Stylised Gargantua: Keplerian accretion disk, gravitationally lensed back
// side, photon ring and Doppler beaming. Output is premultiplied alpha so the
// starfield behind the canvas still shows through.
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
vec3 heat(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 c = mix(vec3(0.35, 0.05, 0.0), vec3(1.0, 0.42, 0.06), smoothstep(0.0, 0.4, t));
  return mix(c, vec3(1.0, 0.93, 0.8), smoothstep(0.4, 1.0, t));
}
// Turbulent, differentially rotating gas between rin and rout
float band(float r, float a, float rin, float rout, float seed) {
  if (r < rin || r > rout) return 0.0;
  float x = (r - rin) / (rout - rin);
  float profile = smoothstep(0.0, 0.06, x) * pow(1.0 - x, 1.8);
  float ang = a + uTime * 0.6 / pow(r / rin, 1.5);
  vec2 q = vec2(cos(ang), sin(ang)) * 2.2 + vec2(r * 16.0, seed);
  float gas = fbm(q) * 0.75 + fbm(q * 2.7 + 4.0) * 0.45;
  return profile * (0.35 + gas * 1.1);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y * 1.75;
  float c = cos(-0.1), s = sin(-0.1);
  p = mat2(c, -s, s, c) * p;

  float rs = 0.36;
  float r = length(p);
  float a = atan(p.y, p.x);

  // Disk plane seen nearly edge-on
  float tilt = 0.13;
  vec2 d = vec2(p.x, p.y / tilt);
  float rd = length(d);
  float ad = atan(d.y, d.x);
  float doppler = 1.0 + 0.6 * clamp(-d.x / max(rd, 1e-3), -1.0, 1.0);

  vec3 col = vec3(0.0);

  // Lensed image of the far side of the disk, wrapped over and under the hole
  float lr = r / rs;
  float over = smoothstep(-0.1, 0.5, p.y / max(r, 1e-3));
  float lens = band(lr, a, 1.06, 2.1, 7.0) * mix(0.3, 1.7, over);
  lens *= 1.0 + 0.45 * clamp(-p.x / max(r, 1e-3), -1.0, 1.0);
  col += heat(lens * 0.9) * lens * 1.4;

  // Photon ring
  float ring = exp(-pow((r - rs * 1.035) / 0.007, 2.0));
  col += vec3(1.0, 0.85, 0.65) * ring * (0.9 + 0.4 * clamp(-p.x / r, -1.0, 1.0));

  // Event horizon
  float hole = 1.0 - smoothstep(rs * 0.985, rs * 1.0, r);
  col *= 1.0 - hole;

  // Near side of the disk crosses in front of the hole
  float disk = band(rd, ad, rs * 1.55, rs * 4.4, 0.0) * doppler;
  float front = p.y < 0.0 ? 1.0 : 1.0 - hole;
  col += heat(disk * 0.8) * disk * 1.6 * front;

  // Soft glow
  col += vec3(1.0, 0.45, 0.12) * 0.05 / (0.15 + abs(p.y) * 8.0 + max(r - rs, 0.0) * 2.0) * (1.0 - hole);

  col = 1.0 - exp(-col * 1.3);
  float alpha = clamp(max(max(col.r, col.g), max(col.b, hole)), 0.0, 1.0);
  gl_FragColor = vec4(min(col, vec3(alpha)), alpha);
}
`;

function BlackHole({ animate }: { animate: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { premultipliedAlpha: true, antialias: false });
    if (!canvas || !gl) {
      setFailed(true);
      return;
    }

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    const start = performance.now();
    const draw = () => {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, animate ? (performance.now() - start) / 1000 : 4);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (animate) raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [animate]);

  if (failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-32 h-32">
          <div className="absolute inset-[12%] rounded-full border-[3px] border-amber-100/80 blur-[1.5px] shadow-[0_0_40px_12px_rgba(251,191,36,0.35)]" />
          <div className="absolute inset-[19%] rounded-full bg-black" />
          <div className="absolute left-[-40%] right-[-40%] top-1/2 h-[14%] -translate-y-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,#fffbeb_0%,#fcd34d_25%,#ea580c_55%,transparent_75%)] blur-[2px]" />
        </div>
      </div>
    );
  }

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
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
                  <BlackHole animate={!reduceMotion} />
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
