"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, AlertCircle, Mail, User, ShieldAlert, Award, Calendar, ExternalLink, Video, Radio, Layers, Trophy } from "lucide-react";

export default function StudentAdmissionsPortal() {
  const [emailInput, setEmailInput] = useState("");
  const [queryType, setQueryType] = useState<"recruitment" | "event">("recruitment");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [studentRecord, setStudentRecord] = useState<{ 
    name: string; 
    status: string; 
    score: number; 
    rawNotes: string; 
    type: "recruitment" | "event"; 
    eventTitle?: string;
    groupNumber?: string;
    groupTask?: string;
  } | null>(null);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsSearching(true);
    setSearchError("");
    setStudentRecord(null);

    try {
      const endpoint = queryType === "recruitment"
        ? `/api/recruitment/submit?action=check-student-result&email=${encodeURIComponent(emailInput.trim().toLowerCase())}`
        : `/api/events?mode=registrations&email=${encodeURIComponent(emailInput.trim().toLowerCase())}`;

      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (res.ok && data.success) {
        if (queryType === "recruitment") {
          setStudentRecord({
            name: data.name,
            status: data.status.toUpperCase(),
            score: data.score,
            rawNotes: data.choices || "",
            type: "recruitment",
            groupNumber: data.groupNumber || "",
            groupTask: data.groupTask || ""
          });
        } else {
          const studentMatch = Array.isArray(data.data) 
            ? data.data.find((r: any) => r.email.toLowerCase() === emailInput.trim().toLowerCase())
            : data.data;

          if (studentMatch) {
            setStudentRecord({
              name: studentMatch.name,
              status: (studentMatch.status || "APPROVED").toUpperCase(),
              score: studentMatch.score || 100,
              rawNotes: JSON.stringify(studentMatch.customAnswers || {}),
              type: "event",
              eventTitle: studentMatch.eventTitle
            });
          } else {
            setSearchError("No registration found for this email address.");
          }
        }
      } else {
        setSearchError(data.error || "No matching profile found.");
      }
    } catch (err) {
      setSearchError("Connection error. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const extractInterviewSlot = (notesText: string) => {
    if (!notesText) return null;
    const matchMarker = notesText.match(/\[SCHEDULED_PI\]:\s*(.*)/i);
    return matchMarker ? matchMarker[1].trim() : null;
  };

  const activeInterviewSchedule = studentRecord && studentRecord.type === "recruitment" ? extractInterviewSlot(studentRecord.rawNotes) : null;

  return (
    <div className="min-h-screen bg-black text-white py-16 px-4 font-sans antialiased selection:bg-blue-500/30 selection:text-white">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* BRAND EMBLEM */}
        <div className="text-center space-y-2.5">
          <div className="text-[10px] uppercase font-mono tracking-widest bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 inline-block font-black">
            BIMTECH E-CELL OFFICIAL // RESULTS PORTAL
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">Live Results Portal</h1>
          <p className="text-xs text-white/40 max-w-sm mx-auto font-mono">Select what you are checking and enter your registered email address.</p>
        </div>

        {/* SECURE IDENTITY INPUT FORM PANEL */}
        <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          
          {/* PIPELINE CHANNEL SELECTOR */}
          <div className="grid grid-cols-2 gap-2 bg-black p-1 border border-white/5 rounded-xl font-mono text-[10px]">
            <button 
              type="button" 
              onClick={() => setQueryType("recruitment")}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${queryType === "recruitment" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
            >
              <Layers size={11} /> RECRUITMENT
            </button>
            <button 
              type="button" 
              onClick={() => setQueryType("event")}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${queryType === "event" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
            >
              <Trophy size={11} /> EVENTS & COMPETITIONS
            </button>
          </div>

          <form onSubmit={handleQuerySubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-mono text-white/40 tracking-widest font-bold block">Email Address</label>
              <div className="relative flex items-center bg-black border border-white/10 rounded-xl px-3 py-1 focus-within:border-blue-500 transition-colors">
                <Mail size={14} className="text-white/20" />
                <input required type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="name@domain.com" className="w-full bg-transparent px-3 py-2.5 text-xs font-mono text-white placeholder-white/10 focus:outline-none" />
              </div>
            </div>
            <button type="submit" disabled={isSearching} className="w-full py-2.5 bg-white text-black font-mono font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shadow-xl">
              <Search size={12} className={isSearching ? "animate-spin" : ""} />
              {isSearching ? "SEARCHING..." : "CHECK MY STATUS"}
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
                  <span className="text-[9px] text-white/30 uppercase tracking-wider font-bold block">
                    {studentRecord.type === "recruitment" ? "Applicant Profile" : `Event Name: ${studentRecord.eventTitle}`}
                  </span>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5"><User size={13} className="text-blue-500" /> {studentRecord.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-white/30 uppercase tracking-wider font-bold block">
                    Score
                  </span>
                  <span className="text-xs font-bold text-white block mt-0.5">{studentRecord.score}/90</span>
                </div>
              </div>

              {/* RECRUITMENT RENDERING TRACK LAYERS */}
              {studentRecord.type === "recruitment" && (
                <>
                  {(studentRecord.status === "PENDING" || studentRecord.status === "") && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl flex items-center gap-3 font-mono text-xs text-white/70">
                        <Clock size={20} className="text-blue-400 animate-spin" style={{ animationDuration: "12s" }} />
                        <p className="leading-relaxed">Your round evaluations are currently being reviewed by the team. Please check back soon for updates.</p>
                      </div>
                    </div>
                  )}

                  {studentRecord.status === "WAITLISTED" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-3 font-mono text-xs">
                        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-400"><Clock size={16} /> Application Under Review</div>
                        <p className="leading-relaxed text-white/80 font-sans text-justify">Thank you for participating in our recruitment rounds. Your answers have been successfully recorded.</p>
                        <p className="leading-relaxed text-justify font-bold italic text-amber-300">"Your profile is currently on the waitlist. The panel is reviewing applications sector by sector. Please check back later for further updates."</p>
                      </div>
                    </div>
                  )}

                  {studentRecord.status === "ROUND_2_APPROVED" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-4 font-mono text-xs">
                        <div className="flex items-center gap-2 font-black uppercase tracking-widest text-blue-400">
                          <Trophy size={16} className="animate-pulse" /> ROUND 2: ACTIVE CASE SIMULATION STAGE
                        </div>
                        <p className="leading-relaxed text-white/80 font-sans text-justify">
                          Congratulations on clearing Round 1! You have been assigned to an inter-vertical execution cell for Round 2.
                        </p>

                        {/* Group Number & Live Task Display */}
                        <div className="bg-black border border-blue-500/30 rounded-xl p-4 space-y-3">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-[10px] text-white/40 uppercase">Assigned Group Node</span>
                            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
                              {studentRecord.groupNumber || "Awaiting Group Allocation"}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-white/40 uppercase font-bold block">Live Group Task Objective:</span>
                            <p className="text-xs text-white/90 leading-relaxed font-sans bg-white/5 p-3 rounded-lg border border-white/5">
                              {studentRecord.groupTask || "Waiting for admin task deployment. Check back shortly."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {studentRecord.status === "SELECTED_FOR_PI" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="p-5 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-4 font-mono text-xs">
                        <div className="flex items-center gap-2 font-black uppercase tracking-widest text-purple-400"><Calendar size={16} className="animate-pulse" /> SHORTLISTED FOR PERSONAL INTERVIEW (PI)</div>
                        <p className="leading-relaxed text-white/80 font-sans text-justify">Congratulations! You have successfully cleared Round 2 case simulations.</p>
                        
                        {activeInterviewSchedule ? (
                          <div className="bg-black border-2 border-purple-500/30 rounded-xl p-4 space-y-3 relative overflow-hidden animate-fadeIn">
                            <div className="absolute top-0 right-0 p-2 text-purple-500/20"><Radio size={40} className="animate-pulse" /></div>
                            <span className="text-[8px] font-bold uppercase bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded tracking-widest">INTERVIEW SCHEDULE ASSIGNED</span>
                            <div className="space-y-1 pt-1">
                              <p className="text-white text-xs font-black uppercase tracking-tight flex items-center gap-1.5">
                                <Clock size={12} className="text-purple-400" /> {activeInterviewSchedule}
                              </p>
                              <p className="text-[10px] text-zinc-400 font-sans">Please ensure stable internet connectivity 10 minutes prior to your slot.</p>
                            </div>
                            <button 
                              onClick={() => window.open("https://meet.google.com", "_blank")}
                              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-black font-black text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition shadow-lg cursor-pointer"
                            >
                              <Video size={12} /> Join Interview Room <ExternalLink size={10} />
                            </button>
                          </div>
                        ) : (
                          <div className="p-3 bg-black border border-purple-500/10 rounded-lg text-purple-300 text-[11px] leading-relaxed font-mono border-dashed">
                            <strong>STATUS:</strong> SHORTLISTED FOR INTERVIEW // Your specific interview time slot details will be visible here shortly.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {studentRecord.status === "SELECTED_CORE" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-4 font-mono text-xs relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full filter blur-xl animate-pulse" />
                        <div className="flex items-center gap-2 font-black uppercase tracking-widest text-emerald-400"><Award size={16} className="animate-bounce" /> CONGRATULATIONS: SELECTED AS CORE MEMBER</div>
                        <p className="leading-relaxed text-white/80 font-sans text-justify font-medium">Welcome to the team! Your evaluation across all recruitment rounds met our selection criteria perfectly.</p>
                        <div className="p-3 bg-black border border-emerald-500/20 rounded-lg text-emerald-400 font-bold">
                          ✔ SELECTION CONFIRMED: Onboarding details and orientation schedules have been emailed to you.
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* EVENT SPECIFIC RENDERING TRACK LAYERS */}
              {studentRecord.type === "event" && (
                <div className="space-y-4 animate-fadeIn">
                  {studentRecord.status === "APPROVED" || studentRecord.status === "CONFIRMED" ? (
                    <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-3 font-mono text-xs">
                      <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-blue-400"><Calendar size={16} /> Registration Confirmed</div>
                      <p className="leading-relaxed text-white/80 font-sans">Your ticket registration for <strong className="text-white">{studentRecord.eventTitle}</strong> is successfully verified in our records.</p>
                    </div>
                  ) : (
                    <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-3 font-mono text-xs">
                      <div className="flex items-center gap-2 font-black uppercase tracking-wider text-emerald-400"><Award size={16} /> Result Announced</div>
                      <p className="leading-relaxed text-white/80 font-sans font-medium">Evaluation for {studentRecord.eventTitle} is complete.</p>
                      <div className="p-3 bg-black border border-emerald-500/20 rounded-lg text-emerald-400 font-bold">
                        RESULT / POSITION: {studentRecord.status}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* FOOTER METRIC INFO */}
        <div className="text-center font-mono text-[9px] text-white/10 flex items-center justify-center gap-1.5 uppercase tracking-widest"><ShieldAlert size={11} /> SECURE GATEWAY // E-CELL MANAGEMENT PORTAL 2026</div>

      </div>
    </div>
  );
}