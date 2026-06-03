"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Calendar, ClipboardList, ShieldAlert, ArrowRight } from "lucide-react";

export default function AdminHub() {
  // Security Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [securityError, setSecurityError] = useState("");

  const handleSecurityCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const globalMasterKey = process.env.NEXT_PUBLIC_ADMIN_MASTER_KEY;

    if (passwordInput === globalMasterKey) {
      setIsAuthenticated(true);
      setSecurityError("");
    } else {
      setSecurityError("Invalid master key. Access denied.");
    }
  };

  // 🔒 GATEKEEPER PASS: SHOW LOGIN FORM IF UNVERIFIED
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans antialiased">
        <div className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl text-center">
          <div className="space-y-2">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full inline-block mx-auto">
              <Lock size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">E-Cell Master Console</h1>
            <p className="text-xs text-white/40">Provide the central system security key to unlock administrative configurations.</p>
          </div>

          <form onSubmit={handleSecurityCheck} className="space-y-3 text-left">
            <div className="space-y-1">
              <label className="text-white/50 uppercase tracking-wider text-[9px] font-bold">Master Security Key</label>
              <input 
                required
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                placeholder="••••••••••••"
              />
            </div>

            {securityError && (
              <p className="text-[11px] text-red-400 font-medium font-mono">{securityError}</p>
            )}

            <button type="submit" className="w-full py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-zinc-200 transition cursor-pointer mt-2">
              Unlock Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 🔓 ACCESS GRANTED: RENDER SYSTEM NAVIGATION OPTIONS
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans antialiased">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-2 border-b border-white/10 pb-6">
          <div className="text-[10px] font-mono tracking-widest bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full inline-block font-bold uppercase">
            Central Station
          </div>
          <h1 className="text-3xl font-black uppercase font-mono tracking-tight text-white">E-Cell Management Hub</h1>
          <p className="text-xs text-white/40 max-w-md mx-auto">Select the administrative database panel you want to access below.</p>
        </div>

        {/* HUB PANELS SELECTION GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* PANEL 1: EVENTS HUB */}
          <Link href="/admin/events" className="bg-zinc-950 border border-white/10 p-5 rounded-xl block hover:border-blue-500/40 transition group relative overflow-hidden shadow-xl">
            <div className="space-y-4">
              <div className="p-2.5 bg-blue-500/5 border border-blue-500/20 text-blue-400 rounded-xl inline-block">
                <Calendar size={18} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition">Events Control Panel</h3>
                <p className="text-[11px] text-white/40 font-sans leading-relaxed">
                  Configure custom registration forms, attach banners, download attendee rows, and track historical campus metrics.
                </p>
              </div>
              <div className="text-[10px] text-blue-400 font-bold tracking-wider uppercase flex items-center gap-1 pt-2">
                <span>Launch Panel</span> <ArrowRight size={10} className="transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* PANEL 2: RECRUITMENT HUB */}
          <Link href="/recruitment/admin" className="bg-zinc-950 border border-white/10 p-5 rounded-xl block hover:border-emerald-500/40 transition group relative overflow-hidden shadow-xl">
            <div className="space-y-4">
              <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-xl inline-block">
                <ClipboardList size={18} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">Recruitment Dashboard</h3>
                <p className="text-[11px] text-white/40 font-sans leading-relaxed">
                  Review test submissions, evaluate candidate domain choices, check scoring benchmarks, and track interview loops.
                </p>
              </div>
              <div className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase flex items-center gap-1 pt-2">
                <span>Launch Panel</span> <ArrowRight size={10} className="transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

        </div>

        {/* SECURITY REMINDER BAR */}
        <div className="bg-zinc-950 border border-white/5 p-3 rounded-xl flex items-center gap-2.5 max-w-md mx-auto justify-center">
          <ShieldAlert size={14} className="text-white/20 shrink-0" />
          <span className="text-[10px] font-mono text-white/30">Session keys automatically refresh upon tab destruction.</span>
        </div>

      </div>
    </div>
  );
}