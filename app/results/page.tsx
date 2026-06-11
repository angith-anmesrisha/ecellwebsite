"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, AlertCircle, Cpu, Mail, User, ShieldAlert, Award, Calendar, ArrowRight, Radio, ExternalLink, Video } from "lucide-react";

export default function StudentAdmissionsPortal() {
  const [emailInput, setEmailInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [studentRecord, setStudentRecord] = useState<{ name: string; status: string; score: number; rawNotes: string } | null>(null);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsSearching(true);
    setSearchError("");
    setStudentRecord(null);

    try {
      // FIXED: Routed straight to our unified, highly secured backend pipeline endpoint mapping
      const res = await fetch(`/api/recruitment/submit?action=check-student-result&email=${encodeURIComponent(emailInput.trim().toLowerCase())}`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStudentRecord({
          name: data.name,
          status: data.status.toUpperCase(),
          score: data.score,
          rawNotes: data.choices || "" // Maps evaluation customAnswers string holding [SCHEDULED_PI] markers
        });
      } else {
        setSearchError(data.error || "No registration profile matches that email coordinates.");
      }
    } catch (err) {
      setSearchError("Network configuration handshake failure. Please retry.");
    } finally {
      setIsSearching(false);
    }
  };

  // HELPER ENGINE: Extracts the admin-allocated interview details securely out of data records
  const extractInterviewSlot = (notesText: string) => {
    if (!notesText) return null;
    const matchMarker = notesText.match(/\[SCHEDULED_PI\]:\s*(.*)/i);
    return matchMarker ? matchMarker[1].trim() : null;
  };

  const activeInterviewSchedule = studentRecord ? extractInterviewSlot(studentRecord.rawNotes) : null;

  return (
    <div className="min-h-screen bg-black text-white py-16 px-4 font-sans antialiased selection:bg-blue-500/30 selection:text-white">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* BRAND EMBLEM */}
        <div className="text-center space-y-2.5">
          <div className="text-[10px] uppercase font-mono tracking-widest bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 inline-block font-black">
            BIMTECH E-CELL OFFICIAL // MANAGEMENT COHORT INTAKE 2026
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">Live Admissions Outcome Portal</h1>
          <p className="text-xs text-white/40 max-w-sm mx-auto font-mono">Please enter the email address you used during registration to view your results</p>
        </div>

        {/* SECURE IDENTITY INPUT FORM PANEL */}
        <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          <form onSubmit={handleQuerySubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-mono text-white/40 tracking-widest font-bold block">Registered Applicant Email</label>
              <div className="relative flex items-center bg-black border border-white/10 rounded-xl px-3 py-1 focus-within:border-blue-500 transition-colors">
                <Mail size={14} className="text-white/20" />
                <input required type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="name@domain.com" className="w-full bg-transparent px-3 py-2.5 text-xs font-mono text-white placeholder-white/10 focus:outline-none" />
              </div>
            </div>
            <button type="submit" disabled={isSearching} className="w-full py-2.5 bg-white text-black font-mono font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shadow-xl">
              <Search size={12} className={isSearching ? "animate-spin" : ""} />
              {isSearching ? "SCANNING TELEMETRY ROSTERS..." : "AUTHENTICATE & QUERY PROFILE STATUS"}
            </button>
          </form>
        </div>

        {/* DYNAMIC SHORTLIST CONFIGURATION RENDERS */}
        <AnimatePresence mode="wait">
          {searchError && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 font-mono text-xs text-red-400">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <p className="leading-normal">{searchError}</p>
            </motion.div>
          )}

          {studentRecord && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl relative">
              
              {/* STUDENT DETAIL OVERVIEW PANEL */}
              <div className="flex justify-between items-start border-b border-white/5 pb-4 font-mono">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-white/30 uppercase tracking-wider font-bold block">Candidate Profile Node</span>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5"><User size={13} className="text-blue-500" /> {studentRecord.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-white/30 uppercase tracking-wider font-bold block">System Track Score</span>
                  <span className="text-xs font-bold text-white block mt-0.5">{studentRecord.score}/100 Baseline</span>
                </div>
              </div>

              {/* STAGE CODE 1: PENDING / RECRUITMENT ACTIVE */}
              {(studentRecord.status === "PENDING" || studentRecord.status === "") && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl flex items-center gap-3 font-mono text-xs text-white/70">
                    <Clock size={20} className="text-blue-400 animate-spin" style={{ animationDuration: "12s" }} />
                    <p className="leading-relaxed">Cohort Assessment Case Round matrices are currently processing downstream inside active audit channels. Please standby for centralized ledger releases.</p>
                  </div>
                </div>
              )}

              {/* STAGE CODE 2: POST-ROUND 2 BULK WAITLIST INTERIM HOLDBACK */}
              {studentRecord.status === "WAITLISTED" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-3 font-mono text-xs">
                    <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-400"><Clock size={16} /> Evaluation Phase Staging Notice</div>
                    <p className="leading-relaxed text-white/80 font-sans text-justify">Thank you for deploying your solution architectures across our Round 1 and Round 2 case modules. Your solution payload parameters have been safely saved.</p>
                    <p className="leading-relaxed text-justify font-bold italic text-amber-300">"System staging rules have systematically moved your candidate profile into the intermediate review waitlist queue. The administrative panel is now vetting choices sector-by-sector. Please check back later using your credentials to view live shortlist updates."</p>
                  </div>
                </div>
              )}

              {/* STAGE CODE 3: SHORTLISTED & APPROVED FOR PERSONAL INTERVIEWS (PI) */}
              {studentRecord.status === "SELECTED_FOR_PI" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-5 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-4 font-mono text-xs">
                    <div className="flex items-center gap-2 font-black uppercase tracking-widest text-purple-400"><Calendar size={16} className="animate-pulse" /> SHORTLISTED FOR LIVE PERSONAL INTERVIEW</div>
                    <p className="leading-relaxed text-white/80 font-sans text-justify">Congratulations! Your solution parameters and portfolio evaluation profiles have successfully passed our vertical panel boundary benchmarks.</p>
                    
                    {/* FIXED: AUTOMATED DYNAMIC INTERVIEW LOCK SHEET SLOT DISPLAY */}
                    {activeInterviewSchedule ? (
                      <div className="bg-black border-2 border-purple-500/30 rounded-xl p-4 space-y-3 relative overflow-hidden animate-fadeIn">
                        <div className="absolute top-0 right-0 p-2 text-purple-500/20"><Radio size={40} className="animate-pulse" /></div>
                        <span className="text-[8px] font-bold uppercase bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded tracking-widest">LIVE INTERVIEW CALENDAR ASSIGNED</span>
                        <div className="space-y-1 pt-1">
                          <p className="text-white text-xs font-black uppercase tracking-tight flex items-center gap-1.5">
                            <Clock size={12} className="text-purple-400" /> {activeInterviewSchedule}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-sans">Please ensure you possess a stable internet grid and your microphone nodes are functional 10 minutes prior to your allocated block.</p>
                        </div>
                        <button 
                          onClick={() => window.open("https://meet.google.com", "_blank")}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-black font-black text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition shadow-lg cursor-pointer"
                        >
                          <Video size={12} /> Launch Virtual Briefing Room <ExternalLink size={10} />
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-black border border-purple-500/10 rounded-lg text-purple-300 text-[11px] leading-relaxed font-mono border-dashed">
                        <strong>STATUS CODE:</strong> PROMOTED_TO_PI_STAGE // Panel matching algorithms have marked your profile as high-potential. Keep your main dashboard updated; interview slot details will register below momentarily.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STAGE CODE 4: ABSOLUTE FINAL SELECTION SECTOR CONMED */}
              {studentRecord.status === "SELECTED_CORE" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-4 font-mono text-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full filter blur-xl animate-pulse" />
                    <div className="flex items-center gap-2 font-black uppercase tracking-widest text-emerald-400"><Award size={16} className="animate-bounce" /> ADMISSION VERIFIED: SELECTED AS CORE EXECUTIVE MEMBER</div>
                    <p className="leading-relaxed text-white/80 font-sans text-justify font-medium">Welcome to the framework. Your performance parameters across case sandboxes and live panel presentations have met our batch selection guidelines perfectly.</p>
                    <div className="p-3 bg-black border border-emerald-500/20 rounded-lg text-emerald-400 text-[11px] font-bold tracking-wide">
                      ✔ ASSIGNMENT COMPLETED: Core Board Node Integration Initialised. Your onboarding toolkit details and first cohort orientation schedules have been dispatched down your verification pipeline.
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* FOOTER METRIC INFO */}
        <div className="text-center font-mono text-[9px] text-white/10 flex items-center justify-center gap-1.5 uppercase tracking-widest"><ShieldAlert size={11} /> SECURE CHANNEL TERMINAL METRICS // E-CELL MANAGEMENT PORTAL 2026</div>

      </div>
    </div>
  );
}