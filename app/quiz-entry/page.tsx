"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, ArrowRight, ShieldAlert, Activity, CheckCircle } from "lucide-react";

export default function QuizEntryTerminal() {
  const [isLocked, setIsLocked] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Function to check the admin state from Redis
    const checkAssessmentState = async () => {
  try {
    // 1. Point to the new event route
    const res = await fetch("/api/event-quiz", { cache: "no-store" });
    const data = await res.json();
    
    if (data.success) {
      // 2. Use the new 'unlocked' boolean
      setIsLocked(!data.unlocked);
    }
  } catch (err) {
    console.error("Failed to fetch assessment state.");
  } finally {
    setIsLoading(false);
  }
};

    // 2. Run the check immediately on page load
    checkAssessmentState();

    // 3. Set up background polling every 3 seconds (3000ms)
    // This allows the page to automatically unlock without the candidate refreshing
    const pollingInterval = setInterval(() => {
      checkAssessmentState();
    }, 3000);

    return () => clearInterval(pollingInterval);
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white font-mono flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Cyber Styling */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="relative z-10 w-full max-w-lg px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Animated Header Pulse Line */}
          <div className={`absolute top-0 left-0 w-full h-1 ${isLocked ? 'bg-amber-500/50' : 'bg-emerald-500/50'} animate-pulse`} />

          <div className="text-center space-y-6">
            
            {/* Status Icon */}
            <div className="flex justify-center">
              <div className={`p-4 rounded-full border ${isLocked ? 'bg-zinc-900/50 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                {isLoading ? (
                  <Activity size={32} className="animate-pulse" />
                ) : isLocked ? (
                  <Lock size={32} />
                ) : (
                  <Unlock size={32} className="animate-pulse" />
                )}
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-2">
              <h1 className="text-xl font-black uppercase tracking-widest text-white">
                Startup Heist Round 1 Assessment
              </h1>
              
              <div className="h-16 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.p key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-white/60 leading-relaxed max-w-xs mx-auto">
                      Establishing secure connection to E-Cell master servers...
                    </motion.p>
                  ) : isLocked ? (
                    <motion.p key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-amber-500/70 leading-relaxed max-w-xs mx-auto">
                      Assessment is currently locked. Please remain on this screen. The portal will automatically unlock when authorized by the proctor.
                    </motion.p>
                  ) : (
                    <motion.p key="unlocked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-emerald-400/80 leading-relaxed max-w-xs mx-auto">
                      Authorization granted. The assessment gateway is now open. Click below to begin.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-white/10">
              <button
                disabled={isLocked || isLoading}
                onClick={() => window.location.href = "https://quizzler.ecellbimtech.in"}
                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-black uppercase text-sm tracking-wider transition-all duration-300 ${
                  isLocked || isLoading
                    ? "bg-zinc-900 text-white/60 border border-white/5 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] cursor-pointer"
                }`}
              >
                {isLocked ? (
                  <>
                    <ShieldAlert size={16} />
                    Awaiting Access
                  </>
                ) : (
                  <>
                    Take me to quiz platform
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            {/* Security Notice */}
            <div className="flex items-center justify-center gap-1.5 pt-2 text-[9px] text-white/60 uppercase tracking-widest">
              <Activity size={10} className="text-nebula-500/50" />
              <span>Strict Proctoring & Tab Tracking Active</span>
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}