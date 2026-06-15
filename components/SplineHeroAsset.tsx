"use client";

import { useRef } from "react";
import Spline from "@splinetool/react-spline";

interface SplineHeroAssetProps {
  colorHex?: string;
  className?: string;
}

export default function SplineHeroAsset({ colorHex = "#a855f7", className = "" }: SplineHeroAssetProps) {
  const assetRef = useRef<any>(null);

  // 1. This function triggers as soon as the Spline 3D canvas is fully loaded
  function handleOnLoad(splineApp: any) {
    // 🌟 HOW TO FIND THE LAYER NAME: 
    // Open your file in the Spline editor app. Look at the left sidebar layers panel.
    // Find the exact name of the object group or material mesh you want to color (e.g., "Rock", "Cube", "Shape").
    const targetMesh = splineApp.findObjectByName("Rock"); 
    
    if (targetMesh) {
      assetRef.current = targetMesh;
      // 2. Change the initial color immediately on load
      applyCustomColor(colorHex);
    }
  }

  // 3. Helper function to programmatically update the color parameters
  function applyCustomColor(hex: string) {
    if (assetRef.current && assetRef.current.material) {
      // Direct access to the underlying Three.js material color map
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