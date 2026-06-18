"use client";

import React from "react";
import { Cpu } from "lucide-react";

export default function RecruitmentPortalCompleted() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 select-none antialiased">
      <div className="w-full max-w-2xl text-center space-y-10">
        <div className="flex justify-center">
          <div className="p-4 bg-zinc-950 border border-white/5 rounded-full shadow-inner">
            <Cpu size={32} className="text-blue-500 animate-pulse" />
          </div>
        </div>
        <div className="space-y-6">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-wider text-white max-w-xl mx-auto leading-tight">
            PHASE 2 CASE ROUND EVALUATION NOW COMPLETE
          </h1>
          <p className="text-xs text-white/40 max-w-sm mx-auto font-mono leading-relaxed">
            The E-Cell recruitment panel has finalized performance scores across
            all domains.
          </p>
          <div className="pt-4">
            <button
              type="button"
              onClick={() => (window.location.href = "/results")}
              className="px-6 py-3.5 bg-white text-black font-mono font-black uppercase text-xs tracking-widest rounded-xl hover:bg-zinc-200 transition duration-300 shadow-xl cursor-pointer"
            >
              Check Selection Status →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
