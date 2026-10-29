"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function GlobalBackButton() {
  const router = useRouter();

  // Go back within the site when we can; someone who opened this page directly goes home instead
  const handleBack = () => {
    if ((window.ecellPageViews || 0) > 1) router.back();
    else router.push("/");
  };

  return (
    <div className="fixed top-6 left-6 z-[9999] pointer-events-auto">
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-950/80 hover:bg-zinc-900 backdrop-blur-md border border-white/10 text-white/70 hover:text-white font-sans text-xs font-bold rounded-full shadow-2xl transition-all duration-200 active:scale-95 group cursor-pointer"
      >
        <ArrowLeft
          size={14}
          className="transform group-hover:-translate-x-0.5 transition-transform"
        />
        <span>Go Back</span>
      </button>
    </div>
  );
}
