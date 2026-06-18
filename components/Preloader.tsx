"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function SubtleMicroDust() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions] = useState(() => {
    const currentPoints = new Float32Array(180 * 3);
    for (let i = 0; i < 180 * 3; i++) {
      currentPoints[i] = (Math.random() - 0.5) * 6;
    }
    return currentPoints;
  });

  const generatedGeometry = useMemo(() => {
    const T = THREE as any;
    const geometry = new T.BufferGeometry();
    geometry.setAttribute("position", new T.BufferAttribute(positions, 3));
    return geometry;
  }, [positions]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const elapsedClockTime = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = elapsedClockTime * 0.02;
    pointsRef.current.rotation.x = elapsedClockTime * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <primitive object={generatedGeometry} attach="geometry" />
      <pointsMaterial
        color="#a855f7"
        size={0.018}
        transparent={true}
        opacity={0.3}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
}

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(false); // 🌟 Default to false until session check completes

  useEffect(() => {
    // 🌟 SESSION GUARD: If they've already seen it this visit, skip immediately
    if (typeof window !== "undefined") {
      const hasSeenPreloader = sessionStorage.getItem("ecell_preloader_seen");
      if (hasSeenPreloader === "true") {
        setShouldRender(false);
        return;
      } else {
        // First time here this session—allow it to render
        setShouldRender(true);
      }
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const increment = prev > 80 ? Math.random() * 1.2 : Math.random() * 8.5;
        return Math.min(prev + increment, 100);
      });
    }, 38);

    const checkLoadState = () => {
      if (document.readyState === "complete") {
        const matchTimer = setInterval(() => {
          setProgress((currentProgress) => {
            if (currentProgress >= 100) {
              clearInterval(matchTimer);
              setIsLoaded(true);
              // 🌟 Mark session as completed when loading finishes
              sessionStorage.setItem("ecell_preloader_seen", "true");
            }
            return currentProgress;
          });
        }, 15);
      }
    };

    window.addEventListener("load", checkLoadState);
    checkLoadState();

    return () => {
      clearInterval(progressInterval);
      window.removeEventListener("load", checkLoadState);
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const unmountTimeout = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(unmountTimeout);
    }
  }, [isLoaded]);

  if (!shouldRender) return null;

  const displayPercentage = Math.floor(progress);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ease-in-out ${
        isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-50">
        <Canvas camera={{ position: [0, 0, 2], fov: 60 }}>
          <SubtleMicroDust />
        </Canvas>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center select-none pointer-events-none">
        <div className="relative w-24 h-24 mb-10 flex items-center justify-center">
          <div className="absolute inset-0 border border-purple-500/10 rounded-full animate-pulse" />
          <div className="absolute inset-1.5 border border-white/[0.02] rounded-full" />
          <span className="font-mono text-xl font-black text-white tracking-tighter">
            {displayPercentage}
            <span className="text-purple-500 text-xs font-normal ml-0.5">
              %
            </span>
          </span>
        </div>

        <div className="space-y-2 mb-8">
          <p className="text-[10px] font-mono font-bold tracking-[0.25em] text-purple-400/80 uppercase">
            {"// INITIALIZING ECOSYSTEM COMPONENTS"}
          </p>
          <h2 className="text-lg font-medium text-white/90 tracking-wide font-serif italic max-w-xs leading-relaxed">
            "Where Aspiration Meets Opportunity."
          </h2>
        </div>

        <div className="w-52">
          <div className="w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden relative border border-white/[0.01]">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-400 rounded-full transition-all duration-75 ease-out shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2.5 font-mono text-[9px] tracking-widest text-zinc-500 uppercase">
            <span>SYS_STATUS</span>
            <span className="animate-pulse text-purple-400/70">
              {progress < 35
                ? "PARSING_NODES"
                : progress < 75
                  ? "BUFFERING_MESH"
                  : "STABILIZING"}
            </span>
          </div>
        </div>

        <span className="text-[9px] font-mono text-zinc-600 tracking-widest uppercase mt-12 block">
          BIMTECH E-CELL SYSTEM PLATFORM
        </span>
      </div>
    </div>
  );
}
