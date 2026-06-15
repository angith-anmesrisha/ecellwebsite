"use client";

import React from 'react';
import Image from 'next/image'; 

export default function RotatingBadge() {
  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Aesthetic glowing background drop */}
      <div className="absolute w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-50"></div>
      
      {/* The rotating text ring */}
      <div className="absolute w-full h-full animate-spin-slow">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          {/* Defined circular path */}
          <path id="circlePath" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="transparent" />
          
          {/* Text with correct formatting */}
          <text className="text-[9px] font-bold uppercase tracking-widest fill-white/80">
            <textPath href="#circlePath" startOffset="0%">
              • INNOVATION • ENTREPRENEURSHIP • BIMTECH E-CELL • 
            </textPath>
          </text>
        </svg>
      </div>

      {}
      {/* Center Static Container - Solid White for clean visibility */}
      {/* Center Static Container - High-opacity frosted glass with drop shadow */}
      <div className="absolute z-10 w-20 h-20 bg-white/80 backdrop-blur-xl border border-white/40 rounded-full flex items-center justify-center shadow-2xl p-2.5">
        <Image 
          src="/ecell-logo.png" 
          alt="BIMTECH E-Cell Center Logo"
          width={56} 
          height={56} 
          style={{ height: 'auto' }}
          className="object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
        />
      </div>
    </div>
  );
}