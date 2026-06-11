"use client";

import { useEffect, useRef, useState } from "react";
import { Renderer, Camera, Transform, Program, Mesh, Triangle } from "ogl";

const vertex = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uMouse;
  uniform vec2 uVelocity;

  void main() {
    vec2 uv = vUv;
    
    vec2 mouseDist = uv - uMouse;
    float dist = length(mouseDist);
    
    float radius = 0.35;
    float dynamicWarp = smoothstep(radius, 0.0, dist);
    
    uv += mouseDist * dynamicWarp * uVelocity * 3.5;
    
    vec2 gridSpacing = fract(uv * 45.0); 
    float lineX = smoothstep(0.006, 0.0, abs(gridSpacing.x - 0.5));
    float lineY = smoothstep(0.006, 0.0, abs(gridSpacing.y - 0.5));
    float gridMask = max(lineX, lineY);
    
    vec3 baseGridColor = vec3(0.06, 0.07, 0.09); 
    vec3 glowAccentColor = vec3(0.08, 0.22, 0.55); 
    
    vec3 finalColor = mix(vec3(0.02, 0.02, 0.03), baseGridColor, gridMask);
    finalColor += glowAccentColor * dynamicWarp * (length(uVelocity) * 2.0 + 0.02);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function FluidBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    // 🌟 FIXED: Narrowed scope override. Removed general 'div' rules so UI elements keep their native glass backings.
    const forceTransparencyStyle = document.createElement("style");
    forceTransparencyStyle.innerHTML = `
      html, body, main, #__next, next-route-announcer,
      .relative.min-h-\\[200vh\\], .relative.min-h-screen {
        background-color: transparent !important;
        background-image: none !important;
      }
      html { background: #030305 !important; }
    `;
    document.head.appendChild(forceTransparencyStyle);

    const renderer = new Renderer({ alpha: false, antialias: true });
    const gl = renderer.gl;
    containerRef.current.appendChild(gl.canvas);
    gl.clearColor(0.02, 0.02, 0.03, 1.0);

    const camera = new Camera(gl);
    camera.position.z = 1;
    const scene = new Transform();
    const geometry = new Triangle(gl);

    const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
    const velocity = { x: 0, y: 0, lastX: 0.5, lastY: 0.5 };

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uMouse: { value: [0.5, 0.5] },
        uVelocity: { value: [0, 0] },
      },
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);

    function resize() {
      if (!containerRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      gl.canvas.style.width = "100vw";
      gl.canvas.style.height = "100vh";
    }
    window.addEventListener("resize", resize, false);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX / window.innerWidth;
      mouse.targetY = 1.0 - e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let frameId: number;
    function update() {
      frameId = requestAnimationFrame(update);

      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      velocity.x = mouse.x - velocity.lastX;
      velocity.y = mouse.y - velocity.lastY;

      velocity.lastX = mouse.x;
      velocity.lastY = mouse.y;

      program.uniforms.uMouse.value = [mouse.x, mouse.y];
      program.uniforms.uVelocity.value = [velocity.x, velocity.y];

      renderer.render({ scene, camera });
    }
    frameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (forceTransparencyStyle.parentNode) {
        document.head.removeChild(forceTransparencyStyle);
      }
      if (containerRef.current && gl.canvas.parentNode) {
        containerRef.current.removeChild(gl.canvas);
      }
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 block w-screen h-screen pointer-events-none overflow-hidden"
      style={{ 
        width: "100vw", 
        height: "100vh", 
        zIndex: -1, 
        position: "fixed",
        top: 0,
        left: 0
      }} 
    />
  );
}