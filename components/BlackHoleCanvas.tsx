"use client";

import { useEffect, useRef, useState } from "react";

const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

// Stylised Gargantua: Keplerian accretion disk, gravitationally lensed back
// side, photon ring and Doppler beaming. Output is premultiplied alpha so the
// starfield behind the canvas still shows through.
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uZoom;

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
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y * uZoom;
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

interface BlackHoleCanvasProps {
  animate: boolean;
  // Larger values zoom out (the scene spans more units per screen height)
  zoom?: number;
  // Render below screen resolution; the disk is soft so this is hard to see and much cheaper
  resolutionScale?: number;
  className?: string;
}

export default function BlackHoleCanvas({ animate, zoom = 1.75, resolutionScale = 1, className = "absolute inset-0 w-full h-full" }: BlackHoleCanvasProps) {
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
    const uZoom = gl.getUniformLocation(prog, "uZoom");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * resolutionScale;
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let visible = true;
    const start = performance.now();
    const draw = () => {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, animate ? (performance.now() - start) / 1000 : 4);
      gl.uniform1f(uZoom, zoom);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (animate && visible && !document.hidden) raf = requestAnimationFrame(draw);
    };
    draw();

    // Stop rendering while scrolled out of view or in a background tab
    const resume = () => {
      cancelAnimationFrame(raf);
      if (animate && visible && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      resume();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", resume);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", resume);
      ro.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [animate, zoom, resolutionScale]);

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

  // A fresh canvas whenever the settings change: the cleanup above loses the old WebGL
  // context, and reusing that canvas would hand back the dead context and fall back to CSS.
  return <canvas key={`${animate}-${zoom}-${resolutionScale}`} ref={canvasRef} aria-hidden="true" className={className} />;
}
