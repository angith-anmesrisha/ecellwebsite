"use client";

import React, { useState, useEffect } from "react";
import { Sliders, Film, Briefcase, Trophy, Trash2, ArrowLeft, ShieldCheck, Lock, Calendar as CalendarIcon, Save, AlertTriangle } from "lucide-react";

interface Submission {
  id: string;
  name: string;
  email: string;
  dept: "ops" | "media" | "spons";
  score: number;
  timestamp: string;
}

export default function AdminDashboard() {
  // --- SERVER INTEGRITY / HYDRATION SAFE GUARDS ---
  const [hasMounted, setHasMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filterDept, setFilterDept] = useState<string>("all");
  
  const [targetDateInput, setTargetDateInput] = useState("2026-07-15");
  const [targetTimeInput, setTargetTimeInput] = useState("00:00");
  const [isDateSaved, setIsDateSaved] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    const savedDateRaw = localStorage.getItem("ecell_recruitment_launch_date") || "2026-07-15T00:00:00";
    const [datePart, timePart] = savedDateRaw.split("T");
    if (datePart) setTargetDateInput(datePart);
    if (timePart) setTargetTimeInput(timePart.substring(0, 5));

    if (isAuthenticated) {
      loadSubmissions();
    }
  }, [isAuthenticated]);

  const loadSubmissions = () => {
    const data = JSON.parse(localStorage.getItem("ecell_submissions") || "[]");
    const sortedData = data.sort((a: Submission, b: Submission) => b.score - a.score);
    setSubmissions(sortedData);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "ecelladmin2026") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid Admin Verification Credentials.");
    }
  };

  const handleUpdateLaunchDate = (e: React.FormEvent) => {
    e.preventDefault();
    const compiledISOString = `${targetDateInput}T${targetTimeInput}:00`;
    localStorage.setItem("ecell_recruitment_launch_date", compiledISOString);
    setIsDateSaved(true);
    setTimeout(() => setIsDateSaved(false), 3000);
  };

  const clearRecord = (id: string) => {
    if (confirm("Execute command to erase applicant data permanently?")) {
      const remaining = submissions.filter(item => item.id !== id);
      setSubmissions(remaining);
      localStorage.setItem("ecell_submissions", JSON.stringify(remaining));
    }
  };

  // --- NEW FEATURE: GLOBAL HARD RESET ---
  const handleHardReset = () => {
    const confirmation1 = confirm("⚠️ CRITICAL WARNING: You are about to wipe the entire recruitment leaderboard. This will permanently delete ALL student scores and evaluation logs. Proceed?");
    if (confirmation1) {
      const confirmation2 = confirm("FINAL CONFIRMATION: This action is completely irreversible. Are you absolutely sure you want to reset all data nodes?");
      if (confirmation2) {
        localStorage.removeItem("ecell_submissions");
        setSubmissions([]);
        alert("System Reset Complete. All applicant execution records have been purged.");
      }
    }
  };

  if (!hasMounted) {
    return <div className="min-h-screen bg-black" />;
  }

  const filteredData = filterDept === "all" ? submissions : submissions.filter(item => item.dept === filterDept);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 font-sans antialiased">
        <div className="w-full max-w-sm bg-zinc-950 border border-white/10 p-6 rounded-2xl shadow-2xl space-y-4">
          <div className="text-center space-y-1">
            <Lock className="text-blue-500 mx-auto mb-2 animate-pulse" size={32} />
            <h2 className="text-xl font-black tracking-tight">Admin Matrix Verification</h2>
            <p className="text-xs text-white/40">Input encrypted code to mount system analytics.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input 
              type="password" placeholder="System Master Access Key" 
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500" 
            />
            <button type="submit" className="w-full py-2.5 bg-white text-black font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-zinc-200 transition">
              Verify Credentials
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-16 px-4 md:px-8 font-sans antialiased">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Upper Action Utility Link */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-500 text-[10px] uppercase font-mono tracking-widest font-black">
              <ShieldCheck size={14} /> Systems Active
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1">E-Cell Recruitment Leaderboard</h1>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {/* Hard Reset Trigger Button */}
            <button 
              onClick={handleHardReset}
              className="text-xs font-mono border border-red-500/30 bg-red-500/10 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition flex items-center gap-1.5"
            >
              <AlertTriangle size={14} /> Hard Reset Database
            </button>
            <button onClick={() => window.location.href = "/recruitment"} className="text-xs font-mono border border-white/10 bg-white/5 px-3 py-1.5 rounded-lg text-white/60 hover:text-white transition flex items-center gap-1.5 shrink-0">
              <ArrowLeft size={14} /> Return Portal
            </button>
          </div>
        </div>

        {/* RECRUITMENT CLOCK TRIGGER OVERRIDE MODULE */}
        <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase font-mono text-white/80">
            <CalendarIcon size={16} className="text-blue-500" />
            Recruitment Gate System Configuration
          </div>
          <form onSubmit={handleUpdateLaunchDate} className="flex flex-wrap items-end gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Unlocking Date</label>
              <input 
                type="date" value={targetDateInput} onChange={(e) => setTargetDateInput(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500 block dark:[color-scheme:dark]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Unlocking Time (24h)</label>
              <input 
                type="time" value={targetTimeInput} onChange={(e) => setTargetTimeInput(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500 block dark:[color-scheme:dark]"
              />
            </div>
            <button 
              type="submit" 
              className={`px-4 py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg flex items-center gap-1.5 transition ${isDateSaved ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}
            >
              <Save size={12} />
              {isDateSaved ? "Target Synchronized" : "Commit Target Date"}
            </button>
          </form>
        </div>

        {/* Metric Overview Widgets Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-950 border border-white/10 p-4 rounded-xl flex items-center justify-between">
            <div><span className="text-[9px] font-mono uppercase text-white/40 block">Total Inputs</span><span className="text-xl font-mono font-black mt-1 block">{submissions.length}</span></div>
            <Trophy size={20} className="text-yellow-500 opacity-40" />
          </div>
          <div className="bg-zinc-950 border border-white/10 p-4 rounded-xl flex items-center justify-between">
            <div><span className="text-[9px] font-mono uppercase text-white/40 block">Ops / Tech / Fin</span><span className="text-xl font-mono font-black mt-1 block">{submissions.filter(s => s.dept === "ops").length}</span></div>
            <Sliders size={20} className="text-blue-500 opacity-40" />
          </div>
          <div className="bg-zinc-950 border border-white/10 p-4 rounded-xl flex items-center justify-between">
            <div><span className="text-[9px] font-mono uppercase text-white/40 block">Media Segment</span><span className="text-xl font-mono font-black mt-1 block">{submissions.filter(s => s.dept === "media").length}</span></div>
            <Film size={20} className="text-purple-500 opacity-40" />
          </div>
          <div className="bg-zinc-950 border border-white/10 p-4 rounded-xl flex items-center justify-between">
            <div><span className="text-[9px] font-mono uppercase text-white/40 block">Sponsorship Pool</span><span className="text-xl font-mono font-black mt-1 block">{submissions.filter(s => s.dept === "spons").length}</span></div>
            <Briefcase size={20} className="text-emerald-500 opacity-40" />
          </div>
        </div>

        {/* Interactive Domain Filter Controls */}
        <div className="flex gap-2 border-b border-white/5 pb-4">
          {["all", "ops", "media", "spons"].map((tab) => (
            <button
              key={tab} onClick={() => setFilterDept(tab)}
              className={`px-4 py-2 rounded-xl border text-xs font-mono uppercase font-bold transition ${filterDept === tab ? 'bg-blue-500/10 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
            >
              {tab === "all" ? "Global Cluster" : tab === "ops" ? "Ops/Tech/Fin" : tab === "media" ? "Media" : "Sponsorship"}
            </button>
          ))}
        </div>

        {/* Leaderboard Table Frame */}
        <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden">
          {filteredData.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-white/30">No candidate execution records logged inside this sector node loop.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-white/40 font-bold uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">Rank</th>
                    <th className="p-4">Applicant Profile</th>
                    <th className="p-4">Department Node</th>
                    <th className="p-4 text-center">Metrics Core</th>
                    <th className="p-4 text-right w-16">Wipe</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, idx) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.01] transition group">
                      <td className="p-4 text-center font-black text-white/30 group-hover:text-blue-500 transition">
                        #{idx + 1}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{item.name}</div>
                        <div className="text-white/40 text-[10px] mt-0.5">{item.email} // {item.timestamp}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 border rounded uppercase text-[10px] font-bold ${item.dept === "ops" ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' : item.dept === "media" ? 'bg-purple-500/5 border-purple-500/20 text-purple-400' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'}`}>
                          {item.dept === "ops" ? "Ops/Tech/Fin" : item.dept === "media" ? "Media" : "Sponsorship"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="text-sm font-black text-emerald-400">{item.score} <span className="text-[10px] text-white/30 font-medium">/ 100</span></div>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => clearRecord(item.id)} className="p-1.5 text-white/20 hover:text-red-400 rounded transition opacity-60 hover:opacity-100">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}