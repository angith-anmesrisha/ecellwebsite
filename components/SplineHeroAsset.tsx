"use client";
import { useRef } from "react";
import Spline from "@splinetool/react-spline";
interface SplineHeroAssetProps {
  colorHex?: string;
  className?: string;
}
export default function SplineHeroAsset({ colorHex = "#a855f7", className = "" }: SplineHeroAssetProps) {
  const assetRef = useRef<any>(null);
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
  return (
    <div className={`w-full h-full min-h-[400px] flex items-center justify-center ${className}`}>
      <Spline
        scene="https://prod.spline.design/c5748b75-2ae6-4c8e-937d-4d3d58b15307/scene.splinecode"
        onLoad={handleOnLoad}
      />
    </div>
  );
}