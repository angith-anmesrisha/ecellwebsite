"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface LockedProps {
  isBypassed: boolean;
  setIsBypassed: (b: boolean) => void;
  setPortalPhase: (p: "LOCKED" | "REGISTRATION_OPEN" | "COMPLETED") => void;
}

export default function RecruitmentPortalLocked({
  isBypassed,
  setIsBypassed,
  setPortalPhase,
}: LockedProps) {
  const [bypassInput, setBypassInput] = useState("");
  const [daysRemaining, setDaysRemaining] = useState("00");
  const [hoursRemaining, setHoursRemaining] = useState("00");
  const [minutesRemaining, setMinutesRemaining] = useState("00");
  const [secondsRemaining, setSecondsRemaining] = useState("00");

  useEffect(() => {
    const updateCountdown = () => {
      if (isBypassed) return;
      const targetLaunchRaw =
        localStorage.getItem("ecell_recruitment_launch_date") ||
        "2026-07-15T00:00:00";
      const difference =
        new Date(targetLaunchRaw).getTime() - new Date().getTime();

      if (difference <= 0) {
        setDaysRemaining("00");
        setHoursRemaining("00");
        setMinutesRemaining("00");
        setSecondsRemaining("00");
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);

        setDaysRemaining(d < 10 ? `0${d}` : `${d}`);
        setHoursRemaining(h < 10 ? `0${h}` : `${h}`);
        setMinutesRemaining(m < 10 ? `0${m}` : `${m}`);
        setSecondsRemaining(s < 10 ? `0${s}` : `${s}`);
      }
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [isBypassed]);

  const handleBypassCheck = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBypassInput(val);
    if (val.length >= 4) {
      try {
        const res = await fetch("/api/recruitment/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passkey: val }),
        });
        const data = await res.json();
        if (data.success) {
          setIsBypassed(true);
          setPortalPhase("REGISTRATION_OPEN");
        }
      } catch (err) {}
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 select-none antialiased">
      <div className="w-full max-w-2xl text-center space-y-10">
        <div className="flex justify-center">
          <div className="p-4 bg-zinc-950 border border-white/5 rounded-full shadow-inner">
            <Clock size={32} className="text-blue-500" />
          </div>
        </div>
        <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-white">
          RECRUITMENT APPLICATION PORTAL OPENING SOON
        </h1>
        <div className="flex justify-center items-center gap-3 md:gap-4 max-w-lg mx-auto">
          {[
            { label: "DAYS", val: daysRemaining },
            { label: "HOURS", val: hoursRemaining },
            { label: "MINUTES", val: minutesRemaining },
            { label: "SECONDS", val: secondsRemaining },
          ].map((unit, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-900/60 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden backdrop-blur-sm">
                <span className="text-xl md:text-2xl font-mono font-black text-white tracking-tight">
                  {unit.val}
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-white/30 uppercase mt-2">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
        <div className="pt-4 max-w-xs mx-auto">
          <input
            type="password"
            placeholder="Admin Passkey Override"
            value={bypassInput}
            onChange={handleBypassCheck}
            className="w-full text-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono tracking-widest text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors"
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
