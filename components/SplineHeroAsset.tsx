"use client";

import { useRef, useState, useEffect } from "react";
import Spline from "@splinetool/react-spline";

interface SplineHeroAssetProps {
  colorHex?: string;
  className?: string;
}

export default function SplineHeroAsset({ colorHex = "#a855f7", className = "" }: SplineHeroAssetProps) {
  const assetRef = useRef<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  function handleOnLoad(splineApp: any) {
    const targetMesh = splineApp.findObjectByName("Rock"); 
    if (targetMesh) {
      assetRef.current = targetMesh;
      applyCustomColor(colorHex);
    }
  }

  function applyCustomColor(hex: string) {
    if (assetRef.current && assetRef.current.material) {
      assetRef.current.material.color.set(hex);
    }
  }

  // Optimize: Render fallback static glowing node on mobile instead of high-poly 3D scene
  if (isMobile) {
    return (
      <div className={`w-full h-full min-h-[300px] flex items-center justify-center ${className}`}>
        <div className="relative flex items-center justify-center">
          <div className="absolute w-28 h-28 bg-purple-600/20 rounded-full blur-2xl animate-pulse" />
          <div className="w-16 h-16 rounded-2xl border border-purple-500/30 bg-zinc-950/80 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.15)]">
            <span className="text-[10px] text-purple-400 font-mono tracking-widest uppercase">E-CELL</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full min-h-[400px] flex items-center justify-center ${className}`}>
      <Spline 
        scene="https://prod.spline.design/c5748b75-2ae6-4c8e-937d-4d3d58b15307/scene.splinecode" 
        onLoad={handleOnLoad}
      />
    </div>
  );
}