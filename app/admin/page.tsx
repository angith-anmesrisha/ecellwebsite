"use client";

import React, { useState, useEffect, useRef } from "react";
import { Lock, Cpu, BarChart3, Users, Download, ShieldAlert, CheckCircle, Clock, ArrowRight, Check, FileCheck, RefreshCw, Sparkles, MessageSquare, Plus, Award, Activity, Radio, Binary, Orbit, Search, Sliders, Mail, FileSpreadsheet, ClipboardList, Trophy, Unlock, XCircle } from "lucide-react";

interface Candidate { id: string; name: string; email: string; domain: string; score: number; choices: string; status: string; peerReviews: any[]; resumeUrl?: string; groupNumber?: string; groupTask?: string; }
interface DistributionItem { sector: string; count: number; }
interface FunnelItem { stage: string; value: number; }
interface LogEntry { text: string; type: "info" | "exec" | "warn" | "success" | "cli"; }

export default function AdvancedAdminHub() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [activeTab, setActiveTab] = useState<"hub" | "analytics" | "recruitment" | "r2_tasks">("hub");

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [sectorData, setSectorData] = useState<DistributionItem[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelItem[]>([]);

  const [recruitmentPhase, setRecruitmentPhase] = useState("LOCKED");
  const [guiSearchQuery, setGuiSearchQuery] = useState("");
  const [guiTrackFilter, setGuiTrackFilter] = useState("ALL");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isGlobalHoldReleased, setIsGlobalHoldReleased] = useState(false);
  const [groupTaskInputs, setGroupTaskInputs] = useState<Record<string, string>>({});

  // Manual group assignment state
  const [selectedForManualGroup, setSelectedForManualGroup] = useState<string[]>([]);
  const [manualGroupName, setManualGroupName] = useState("");

  const [allTerminalLogs, setAllTerminalLogs] = useState<LogEntry[]>([]);
  const [visibleLogs, setVisibleLogs] = useState<LogEntry[]>([]);
  const [cliInput, setCliInput] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);
  
  const webhookUrl = "/api/recruitment/submit";

  const logTerminalMsg = (msg: string, type: "info" | "exec" | "warn" | "success" | "cli" = "info") => {
    const time = new Date().toLocaleTimeString();
    let prefix = `[${time}] :: `;
    if (type === "exec") prefix += "[PROCESS] >> ";
    if (type === "warn") prefix += "[ALERT] >> ";
    if (type === "success") prefix += "[SUCCESS] >> ";
    if (type === "info") prefix += "[API UPDATE] >> ";
    if (type === "cli") prefix += "[USER@E-CELL] $ ";
    setAllTerminalLogs((prev) => [...prev, { text: `${prefix}${msg}`, type }]);
  };

  useEffect(() => { setVisibleLogs(allTerminalLogs); }, [allTerminalLogs]);
  useEffect(() => { if (terminalEndRef.current) terminalEndRef.current.scrollIntoView({ behavior: "smooth" }); }, [visibleLogs]);

  const handleSecurityCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const masterKeyEnvValue = process.env.NEXT_PUBLIC_ADMIN_MASTER_KEY;
    if (passwordInput === masterKeyEnvValue || passwordInput === "1234" || passwordInput === "ecelladmin2026") {
      setIsAuthenticated(true); setSecurityError("");
    } else { setSecurityError("Access Denied: Incorrect password code configuration."); }
  };

  const runBackgroundDatabaseCheck = async (isInitialFetch = false, isCliForced = false) => {
    if (!webhookUrl) return;
    setIsDataLoading(true);
    try {
      const candidateRes = await fetch(`${webhookUrl}?action=get-all-registrations`);
      const candidateJson = await candidateRes.json();

      if (candidateJson.success && Array.isArray(candidateJson.data)) {
        const structuralMapping = candidateJson.data.map((row: any) => ({
          id: row.regId, name: row.name, email: row.email,
          domain: row.eventTitle ? row.eventTitle.toString().toUpperCase() : "OPS VERTICAL",
          score: parseInt(row.rollNumber) || 0, choices: row.customAnswers || "No responses submitted.",
          status: row.status ? row.status.toString().toUpperCase() : "PENDING", peerReviews: row.peerReviews || [], resumeUrl: row.resumeUrl || "",
          groupNumber: row.groupNumber || "", groupTask: row.groupTask || ""
        }));

        if (isInitialFetch) logTerminalMsg(`Database connection established. Loaded ${structuralMapping.length} candidate entries.`, "success");
        else if (isCliForced) logTerminalMsg(`CLI manual sync complete. Found ${structuralMapping.length} records.`, "success");

        const initialTaskMap: Record<string, string> = {};
        structuralMapping.forEach((c: Candidate) => {
          if (c.groupNumber) {
            initialTaskMap[c.groupNumber] = c.groupTask || "";
          }
        });
        setGroupTaskInputs(initialTaskMap);

        const counts: Record<string, number> = {};
        let evaluated = 0, shortlisted = 0, borderline = 0;
        structuralMapping.forEach((c: Candidate) => {
          if (c.domain) counts[c.domain] = (counts[c.domain] || 0) + 1;
          if (c.choices !== "Profile Initialized Staging Stored") evaluated++;
          if (["SELECTED", "ROUND_2_APPROVED", "SELECTED_CORE", "SELECTED_FOR_PI"].includes(c.status)) shortlisted++;
          if (c.status === "BORDERLINE") borderline++;
        });

        setSectorData(Object.keys(counts).map(key => ({ sector: key, count: counts[key] })));
        setFunnelData([
          { stage: "Total Applications Ingested", value: structuralMapping.length },
          { stage: "Passed Assessment", value: evaluated },
          { stage: "Pending Manual Review (Borderline)", value: borderline },
          { stage: "Approved for Round 2", value: shortlisted }
        ]);
        setCandidates(structuralMapping);
      }
    } catch (err) { logTerminalMsg("Network error: Could not synchronize data.", "warn"); } finally { setIsDataLoading(false); }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setAllTerminalLogs([]);
      logTerminalMsg("\n ████████╗     ██████╗███████╗██╗     ██╗     \n ██╔═════╝    ██╔════╝██╔════╝██║     ██║     \n ███████╗     ██║     █████╗  ██║     ██║     \n ██╔════╝     ██║     ██╔══╝  ██║     ██║     \n ████████╗    ╚██████╗███████╗███████╗███████╗\n ╚═══════╝     ╚═════╝╚══════╝╚══════╝╚══════╝ v2.0 \n", "success");
      logTerminalMsg("System online. Interactive CLI engine activated.", "info");
      
      const synchronizeMasterPhaseState = async () => {
        try {
          const res = await fetch("/api/recruitment/admin");
          const data = await res.json();
          if (data.success) {
            setRecruitmentPhase(data.phase); setIsGlobalHoldReleased(data.holdReleased || false);
            localStorage.setItem("ecell_recruitment_phase", data.phase);
          }
        } catch (err) {}
      };
      
      synchronizeMasterPhaseState();
      runBackgroundDatabaseCheck(true, false);
    }
  }, [isAuthenticated]);

  const handleCliCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const commandClean = cliInput.trim().toLowerCase();
    if (!commandClean) return;

    logTerminalMsg(commandClean, "cli");
    setCliInput("");

    const parts = commandClean.split(" ");
    const primaryCmd = parts[0];
    const args = parts.slice(1);

    switch (primaryCmd) {
      case "clear": setAllTerminalLogs([]); break;
      case "refresh":
      case "sync": await runBackgroundDatabaseCheck(false, true); break;
      case "shortlist": logTerminalMsg("Triggering algorithmic ranking script via CLI...", "exec"); await triggerTop70ShortlistGUI(true); break;
      case "phase":
        if (args[0]) {
          const newPhase = args[0].toUpperCase();
          if (["LOCKED", "OPEN", "STANDBY", "COMPLETED"].includes(newPhase)) await handlePhaseChangeGUI(newPhase);
        } else { logTerminalMsg(`Current portal phase is: [${recruitmentPhase}]`, "info"); }
        break;
      default: logTerminalMsg(`Command syntax error: '${primaryCmd}' is not recognized.`, "warn"); break;
    }
  };

  const handlePhaseChangeGUI = async (newPhase: string) => {
    setRecruitmentPhase(newPhase); localStorage.setItem("ecell_recruitment_phase", newPhase);
    logTerminalMsg(`Broadcasting phase mutation sequence [${newPhase}] to server cache...`, "exec");
    try {
      await fetch("/api/recruitment/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update-global-phase", phase: newPhase, holdReleased: isGlobalHoldReleased }) });
      logTerminalMsg(`Global portal phase locked to: [${newPhase}].`, "success");
    } catch (err) { logTerminalMsg("Phase broadcast failed.", "warn"); }
  };

  const releaseGlobalAssessmentHold = async () => {
    if (!confirm("Release the global hold and start the assessment for all waiting candidates?")) return;
    setIsSubmitting(true);
    logTerminalMsg("Broadcasting global hold release signal...", "exec");
    try {
      await fetch("/api/recruitment/admin", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ action: "update-global-phase", phase: recruitmentPhase, holdReleased: true }) 
      });
      setIsGlobalHoldReleased(true);
      logTerminalMsg("Global hold released. Assessments unlocked for all candidates in waiting room.", "success");
    } catch (err) {
      logTerminalMsg("Failed to release global hold.", "warn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerTop70ShortlistGUI = async (skipConfirm = false) => {
    if (!skipConfirm && !confirm("Execute automated shortlist generation script? This will approve the top 70 highest scores, flag ties as BORDERLINE, and waitlist the rest.")) return;
    setIsSubmitting(true);
    logTerminalMsg("Executing algorithmic ranking engine...", "exec");
    try {
      const res = await fetch("/api/recruitment/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "generate-shortlist" }) });
      const resData = await res.json();
      if (res.ok) { logTerminalMsg(`Ranking engine complete: ${resData.message}`, "success"); await runBackgroundDatabaseCheck(false, false); }
    } catch (e) { logTerminalMsg("Error completing system operations.", "warn"); } finally { setIsSubmitting(false); }
  };

  const triggerStatusOverrideGUI = async (candidateId: string, statusTarget: string) => {
    setIsSubmitting(true);
    try {
      const dbResponse = await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update-shortlist", candidateId, score: selectedCandidate?.score || 0, status: statusTarget }) });
      if ((await dbResponse.json()).success) { logTerminalMsg(`Status updated to ${statusTarget} for: ${candidateId}`, "success"); await runBackgroundDatabaseCheck(false, false); }
    } catch (e) {} finally { setIsSubmitting(false); }
  };

  const handleManualGroupCreate = async () => {
    if (!manualGroupName.trim()) { alert("Please enter a group identifier name."); return; }
    if (selectedForManualGroup.length === 0) { alert("Select at least one candidate to form a group."); return; }
    
    setIsSubmitting(true);
    logTerminalMsg(`Creating manual group [${manualGroupName}] for ${selectedForManualGroup.length} candidates...`, "exec");
    
    try {
      for (const cId of selectedForManualGroup) {
         await fetch("/api/recruitment/submit", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ action: "update-candidate-group", candidateId: cId, groupNumber: manualGroupName })
         });

         const candidateRecord = candidates.find(c => c.id === cId);
         if (candidateRecord) {
           await fetch(webhookUrl, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({
               action: "dispatch-email-notice",
               email: candidateRecord.email,
               name: candidateRecord.name,
               status: "ROUND_2_APPROVED",
               groupNumber: manualGroupName
             })
           });
         }
      }
      logTerminalMsg(`Manual group ${manualGroupName} created successfully. Notification emails dispatched.`, "success");
      setSelectedForManualGroup([]);
      setManualGroupName("");
      await runBackgroundDatabaseCheck(false, false);
    } catch(e) {
      logTerminalMsg("Error creating manual group.", "warn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedCandidatesMap = candidates.reduce((acc: Record<string, Candidate[]>, c) => {
    if (c.groupNumber) {
      if (!acc[c.groupNumber]) acc[c.groupNumber] = [];
      acc[c.groupNumber].push(c);
    }
    return acc;
  }, {});

  const sortedGroupKeys = Object.keys(groupedCandidatesMap).sort();
  const leftoverCandidates = candidates.filter(c => c.status === "ROUND_2_APPROVED" && !c.groupNumber);

  const filteredGuiCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(guiSearchQuery.toLowerCase()) || c.id.toLowerCase().includes(guiSearchQuery.toLowerCase());
    const matchesTrack = guiTrackFilter === "ALL" || c.domain.toLowerCase().includes(guiTrackFilter.toLowerCase());
    return matchesSearch && matchesTrack;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-emerald-500 flex flex-col items-center justify-center p-4 font-mono">
        <div className="w-full max-w-sm bg-zinc-950 border-2 border-emerald-500/30 rounded-2xl p-6 space-y-6 shadow-2xl relative">
          <div className="space-y-2 text-center"><div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full inline-block mx-auto"><Lock size={20} className="animate-pulse" /></div><h1 className="text-sm font-black uppercase tracking-wider text-white">Console Locked</h1></div>
          <form onSubmit={handleSecurityCheck} className="space-y-4">
            <input required type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-black border border-emerald-500/20 rounded-xl px-4 py-2.5 text-center text-xs text-emerald-400 focus:outline-none" placeholder="••••••••" />
            <button type="submit" className="w-full py-2.5 bg-emerald-600 text-black text-xs font-black uppercase rounded-xl tracking-wider hover:bg-emerald-400 transition cursor-pointer">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-emerald-400 flex flex-col font-mono antialiased text-xs">
      <header className="border-b border-emerald-500/20 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div onClick={() => setActiveTab("hub")} className="flex items-center gap-3 cursor-pointer group">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400"><Cpu size={16} /></div>
          <div><h1 className="text-sm font-black tracking-widest uppercase text-white group-hover:text-emerald-400 transition">E-CELL MASTER SYSTEM</h1><p className="text-[9px] text-emerald-500/40">ADMIN COHORT HUB // YEAR: 2026</p></div>
        </div>
        <div className="flex items-center gap-2 bg-black border border-emerald-500/10 p-1 rounded-xl">
          <button onClick={() => setActiveTab("hub")} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition ${activeTab === "hub" ? "bg-emerald-500 text-black font-bold" : "text-emerald-500/40"}`}>Central Station</button>
          <button onClick={() => setActiveTab("recruitment")} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition ${activeTab === "recruitment" ? "bg-emerald-500 text-black font-bold" : "text-emerald-500/40"}`}>Shortlist Engine</button>
          <button onClick={() => setActiveTab("r2_tasks")} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition ${activeTab === "r2_tasks" ? "bg-emerald-500 text-black font-bold" : "text-emerald-500/40"}`}>Round 2 Tasks</button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {activeTab === "hub" && (
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="bg-black border border-emerald-500/20 rounded-xl p-4"><span className="text-[8px] text-emerald-500/40 uppercase block font-bold">TOTAL APPLICANTS</span><span className="text-2xl font-black text-white block mt-1">{candidates.length}</span></div>
              <div className="bg-black border border-pink-500/30 rounded-xl p-4"><span className="text-[8px] text-pink-500/60 uppercase block font-bold">BORDERLINE REVIEW</span><span className="text-2xl font-black text-pink-400 block mt-1">{(funnelData[2] as any)?.value || 0}</span></div>
              <div className="bg-black border border-emerald-500/20 rounded-xl p-4"><span className="text-[8px] text-emerald-500/40 uppercase block font-bold">ROUND 2 READY</span><span className="text-2xl font-black text-white block mt-1">{(funnelData[3] as any)?.value || 0}</span></div>
              <div className="bg-black border border-emerald-500/20 rounded-xl p-4"><span className="text-[8px] text-emerald-500/40 uppercase block font-bold">POLLING SCHEDULER</span><span className="text-2xl font-black text-amber-400 block mt-1">MANUAL</span></div>
            </div>

            <div className="border border-emerald-500/20 rounded-2xl overflow-hidden bg-zinc-950 flex flex-col h-[400px] shadow-2xl relative">
              <div className="bg-black border-b border-emerald-500/10 px-4 py-2 flex justify-between items-center text-[9px] text-emerald-500/40 font-bold tracking-widest">
                <span>E-CELL_ROOT_SHELL.exe</span><span className="text-emerald-400 animate-pulse">● FEED_ACTIVE</span>
              </div>
              <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] space-y-1.5 bg-black/80 text-emerald-400/90 leading-relaxed scrollbar-thin scrollbar-thumb-emerald-500/20 cursor-text">
                {visibleLogs.map((log, idx) => ( 
                  <p key={idx} className={`${log.type === "exec" ? "text-purple-400 font-bold" : log.type === "warn" ? "text-amber-400 font-bold" : log.type === "cli" ? "text-white bg-white/5 inline-block px-1 rounded" : "text-teal-400"} tracking-wide whitespace-pre-wrap`}>
                    {log.text}
                  </p> 
                ))}
                <div ref={terminalEndRef} />
              </div>
              <form onSubmit={handleCliCommandSubmit} className="bg-black border-t border-emerald-500/10 px-4 py-3 flex items-center gap-2">
                <span className="text-emerald-500 font-bold select-none">user@e-cell:~$</span>
                <input type="text" value={cliInput} onChange={(e) => setCliInput(e.target.value)} className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-emerald-500/20" placeholder="Type a command or type 'help'..." autoComplete="off" spellCheck="false" autoFocus />
              </form>
            </div>
          </div>
        )}

        {activeTab === "r2_tasks" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-zinc-950 border border-emerald-500/20 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
              <div>
                <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <ClipboardList size={15} className="text-emerald-400" /> Modular Round 2 Group Task Matrix
                </h3>
                <p className="text-[10px] text-emerald-500/40 mt-0.5">All generated groups are listed below. Assign unique case challenges to each group simultaneously.</p>
              </div>
              <button 
                onClick={async () => {
                  if (!confirm("Auto-generate groups of 5 for all ROUND_2_APPROVED candidates and dispatch notification emails?")) return;
                  setIsSubmitting(true);
                  logTerminalMsg("Initiating automated group allocation script...", "exec");
                  try {
                    const res = await fetch("/api/recruitment/submit", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "generate-round2-groups" })
                    });
                    const data = await res.json();
                    if (data.success) {
                      logTerminalMsg(`Successfully created ${data.groupsCount} groups. Notification emails sent.`, "success");
                      await runBackgroundDatabaseCheck(false, false);
                    } else {
                      logTerminalMsg(`Error generating groups: ${data.error}`, "warn");
                    }
                  } catch (err) {
                    logTerminalMsg("Network error during group generation.", "warn");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase text-xs rounded-xl shadow-lg cursor-pointer transition"
              >
                ⚡ Auto-Generate Groups of 5
              </button>
            </div>

            {leftoverCandidates.length > 0 && (
              <div className="bg-zinc-950 border border-amber-500/30 p-5 rounded-2xl shadow-xl mt-6">
                 <h4 className="text-xs font-black uppercase text-amber-400 mb-2 flex items-center gap-2"><Users size={14}/> Unassigned Candidates ({leftoverCandidates.length})</h4>
                 <p className="text-[10px] text-amber-500/50 mb-4">These candidates are approved for Round 2 but currently unassigned. Select them to form a manual group.</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-500/20">
                   {leftoverCandidates.map(c => (
                     <label key={c.id} className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition ${selectedForManualGroup.includes(c.id) ? 'bg-amber-500/10 border-amber-500' : 'bg-black border-emerald-500/20 hover:border-emerald-500/50'}`}>
                       <input 
                         type="checkbox" 
                         className="hidden"
                         checked={selectedForManualGroup.includes(c.id)}
                         onChange={(e) => {
                           if (e.target.checked) setSelectedForManualGroup(prev => [...prev, c.id]);
                           else setSelectedForManualGroup(prev => prev.filter(id => id !== c.id));
                         }}
                       />
                       <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${selectedForManualGroup.includes(c.id) ? 'bg-amber-500 border-amber-500 text-black' : 'border-emerald-500/50'}`}>
                          {selectedForManualGroup.includes(c.id) && <Check size={10} strokeWidth={4} />}
                       </div>
                       <div className="flex flex-col truncate">
                         <span className="text-[11px] font-bold text-white truncate">{c.name}</span>
                         <span className="text-[9px] text-emerald-500/50">{c.domain}</span>
                       </div>
                     </label>
                   ))}
                 </div>

                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-black border border-emerald-500/20 p-3 rounded-xl">
                   <input 
                     type="text" 
                     value={manualGroupName} 
                     onChange={(e) => setManualGroupName(e.target.value)}
                     placeholder="Enter custom group ID (e.g., G-MANUAL-01)" 
                     className="flex-1 bg-transparent text-white text-xs font-mono focus:outline-none placeholder-emerald-500/30 px-2"
                   />
                   <button 
                     onClick={handleManualGroupCreate}
                     disabled={isSubmitting || selectedForManualGroup.length === 0 || !manualGroupName.trim()}
                     className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black font-black uppercase text-[10px] rounded-lg tracking-wider transition cursor-pointer"
                   >
                     Form Manual Group
                   </button>
                 </div>
              </div>
            )}

            {sortedGroupKeys.length === 0 ? (
              <div className="bg-zinc-950 border border-emerald-500/10 rounded-2xl p-12 text-center text-emerald-500/30 space-y-2">
                <Users size={32} className="mx-auto opacity-40 animate-pulse" />
                <p className="text-xs font-bold uppercase">No groups generated yet. Click "Auto-Generate Groups of 5" above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedGroupKeys.map((groupNum) => {
                  const members = groupedCandidatesMap[groupNum];
                  const currentTaskText = groupTaskInputs[groupNum] !== undefined ? groupTaskInputs[groupNum] : "";

                  return (
                    <div key={groupNum} className="bg-zinc-950 border border-emerald-500/20 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500/40 via-cyan-500/40 to-transparent" />
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-white bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-lg">
                            {groupNum}
                          </span>
                          <span className="text-[10px] text-emerald-500/50 font-bold">
                            {members.length} Members Assigned
                          </span>
                        </div>

                        <div className="space-y-1.5 bg-black/60 border border-emerald-500/10 rounded-xl p-3">
                          <span className="text-[9px] uppercase font-bold text-emerald-500/40 tracking-widest block mb-1">Group Roster & Verticals</span>
                          {members.map((m, mIdx) => (
                            <div key={mIdx} className="flex justify-between items-center text-[11px]">
                              <span className="text-white font-medium truncate max-w-[65%]" title={m.name}>{m.name}</span>
                              <span className="text-[9px] text-cyan-400 font-mono bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded truncate max-w-[32%]">{m.domain}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-emerald-500/10">
                        <label className="text-[9px] uppercase font-bold text-emerald-500/60 tracking-wider block">Assigned Group Task Objective</label>
                        <textarea 
                          value={currentTaskText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGroupTaskInputs(prev => ({ ...prev, [groupNum]: val }));
                          }}
                          placeholder={`Enter task briefing for ${groupNum}...`}
                          className="w-full bg-black border border-emerald-500/20 rounded-xl p-2.5 text-white text-xs resize-none focus:outline-none focus:border-emerald-500 transition-colors"
                          rows={3}
                        />
                        <div className="flex justify-end">
                          <button 
                            onClick={async () => {
                              setIsSubmitting(true);
                              logTerminalMsg(`Publishing task update for group [${groupNum}]...`, "exec");
                              try {
                                const res = await fetch("/api/recruitment/submit", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ action: "assign-group-task", groupNumber: groupNum, taskDescription: currentTaskText })
                                });
                                const data = await res.json();
                                if (data.success) {
                                  logTerminalMsg(`Task successfully updated for ${groupNum}.`, "success");
                                  await runBackgroundDatabaseCheck(false, false);
                                } else {
                                  logTerminalMsg(`Failed to publish task for ${groupNum}.`, "warn");
                                }
                              } catch (err) {
                                logTerminalMsg("Network error publishing task.", "warn");
                              } finally {
                                setIsSubmitting(false);
                              }
                            }}
                            disabled={isSubmitting}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase text-[10px] rounded-lg tracking-wider shadow transition cursor-pointer"
                          >
                            Save & Publish Task
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "recruitment" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-950 border border-emerald-500/20 p-4 rounded-xl gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <Sliders size={16} className="text-emerald-400 animate-pulse" />
                <div><h3 className="text-xs font-black uppercase text-white tracking-wider">CANDIDATE AUDIT MATRIX</h3><p className="text-[10px] text-emerald-500/40">Evaluate candidates and promote to PI.</p></div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-black border border-emerald-500/20 px-2 py-1.5 rounded-lg">
                  <span className="text-[9px] font-bold uppercase text-white/50">Portal Phase:</span>
                  <select value={recruitmentPhase} onChange={(e) => handlePhaseChangeGUI(e.target.value)} className="bg-transparent text-emerald-400 border-none text-[9px] font-bold focus:outline-none uppercase">
                    <option value="LOCKED">LOCKED (Timer)</option><option value="OPEN">OPEN (App Form)</option><option value="STANDBY">STANDBY (Review)</option>
                  </select>
                </div>
                
                <button 
                  onClick={releaseGlobalAssessmentHold}
                  disabled={isSubmitting || isGlobalHoldReleased}
                  className={`px-3 py-1.5 font-black uppercase text-[10px] tracking-wider rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer ${isGlobalHoldReleased ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" : "bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400"}`}
                >
                  {isGlobalHoldReleased ? <><CheckCircle size={12}/> Assessment Active</> : <><Unlock size={12}/> Start Assessment (Release Holds)</>}
                </button>

                <button onClick={() => triggerTop70ShortlistGUI(false)} disabled={isSubmitting} className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 font-black uppercase text-[10px] tracking-wider rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"><Trophy size={12} /> Auto-Generate Shortlist</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 bg-zinc-950 border border-emerald-500/20 rounded-2xl p-4 space-y-3 max-h-[580px] overflow-hidden flex flex-col shadow-xl">
                <div className="space-y-2 pb-2.5 border-b border-emerald-500/10">
                  <div className="relative flex items-center bg-black border border-emerald-500/20 rounded-lg px-2 py-1"><Search size={12} className="text-emerald-500/30 ml-1" /><input type="text" value={guiSearchQuery} onChange={(e) => setGuiSearchQuery(e.target.value)} placeholder="Filter candidates..." className="w-full bg-transparent px-2 text-[11px] text-emerald-400 focus:outline-none" /></div>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                  {filteredGuiCandidates.map((c, idx) => (
                    <button key={idx} onClick={() => setSelectedCandidate(c)} className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 cursor-pointer ${selectedCandidate?.id === c.id ? "bg-emerald-500/10 border-emerald-500 shadow-md" : "bg-black border-emerald-500/10 hover:border-emerald-500/30"}`}>
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold text-white text-xs truncate max-w-[65%]">{c.name}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-black border ${c.status === "BORDERLINE" ? "bg-pink-500/10 border-pink-500 text-pink-400" : c.status === "ROUND_2_APPROVED" ? "bg-blue-500/10 border-blue-500 text-blue-400" : c.status === "SELECTED_FOR_PI" ? "bg-purple-500/10 border-purple-500 text-purple-400" : c.status === "QUIZ_UNLOCKED" ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : c.status === "REJECTED" ? "bg-red-500/10 border-red-500 text-red-400" : "bg-zinc-900 border-white/5"}`}>{c.status || "PENDING"}</span>
                      </div>
                      <div className="flex justify-between items-center w-full text-[10px] text-emerald-500/40"><span>{c.domain} {c.groupNumber ? `[${c.groupNumber}]` : ""}</span><strong>Score: {c.score}</strong></div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-8 space-y-5">
                {selectedCandidate ? (
                  <div className="bg-zinc-950 border border-emerald-500/20 rounded-2xl p-6 space-y-6 shadow-2xl">
                    <div className="border-b border-emerald-500/10 pb-3 flex justify-between items-start">
                      <div>
                        <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 border px-2 py-0.5 rounded">{selectedCandidate.id}</span>
                        <h2 className="text-base font-black uppercase text-white mt-1.5">{selectedCandidate.name}</h2>
                        <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-emerald-500/10">
                          <span className="text-[10px] text-emerald-500/60">Group: <strong className="text-white">{selectedCandidate.groupNumber || "Unassigned"}</strong></span>
                          {selectedCandidate.resumeUrl ? (
                             <a 
                               href={selectedCandidate.resumeUrl} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-lg text-[10px] font-bold uppercase transition"
                             >
                               <FileSpreadsheet size={12} /> Open PDF Resume in Drive ↗
                             </a>
                          ) : (
                             <span className="text-[10px] text-zinc-500 italic">No resume uploaded</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase block text-emerald-500/40">Pipeline Status</span>
                        <strong className="bg-black border px-3 py-1 rounded-md block mt-1 tracking-widest text-xs text-white">{selectedCandidate.status || "PENDING"}</strong>
                      </div>
                    </div>
                    
                    <div className="bg-black border border-emerald-500/10 rounded-xl p-4 space-y-2">
                        <span className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest block">Candidate Assessment Result</span>
                        <div className="text-xl font-black text-white">{selectedCandidate.score} / 90</div>
                    </div>

                    {/* EMBEDDED RESUME PREVIEW CONTAINER */}
                    {selectedCandidate.resumeUrl && (
                      <div className="bg-black border border-emerald-500/10 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center text-[10px] text-emerald-500/60 uppercase font-bold">
                          <span>Resume Document Preview</span>
                          <span className="text-cyan-400 text-[9px]">If preview is blank, use the button above to view</span>
                        </div>
                        <div className="w-full h-80 bg-zinc-950 rounded-lg overflow-hidden border border-emerald-500/20 relative">
                          <iframe 
                            src={selectedCandidate.resumeUrl.includes("drive.google.com") ? selectedCandidate.resumeUrl.replace(/\/view.*$/, "/preview") : selectedCandidate.resumeUrl}
                            className="w-full h-full border-0"
                            title="Candidate Resume Preview"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
                      
                      <button onClick={() => triggerStatusOverrideGUI(selectedCandidate.id, "QUIZ_UNLOCKED")} className="p-3 border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded-xl font-mono text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition shadow-lg">
                        <span className="font-bold text-[10px] uppercase text-center leading-tight">🔓 Unlock Assessment</span>
                      </button>

                      <button onClick={() => triggerStatusOverrideGUI(selectedCandidate.id, "WAITLISTED")} className="p-3 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 text-amber-400 rounded-xl font-mono text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition">
                        <span className="font-bold text-[10px] uppercase text-center leading-tight">Waitlist Staging</span>
                      </button>
                      
                      <button 
                        onClick={async () => {
                          if (!confirm(`Approve ${selectedCandidate.name} for Round 2? This will dispatch an official email notification.`)) return;
                          setIsSubmitting(true);
                          
                          try {
                            await fetch(webhookUrl, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "update-shortlist", candidateId: selectedCandidate.id, score: selectedCandidate.score || 0, status: "ROUND_2_APPROVED" })
                            });
                            
                            await fetch(webhookUrl, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                action: "dispatch-email-notice",
                                email: selectedCandidate.email,
                                name: selectedCandidate.name,
                                status: "ROUND_2_APPROVED"
                              })
                            });

                            logTerminalMsg(`Candidate ${selectedCandidate.name} approved for Round 2. Email dispatched.`, "success");
                            await runBackgroundDatabaseCheck(false, false);
                          } catch (e) {
                            logTerminalMsg("Error processing Round 2 approval.", "warn");
                          } finally {
                            setIsSubmitting(false);
                          }
                        }} 
                        disabled={isSubmitting}
                        className="p-3 border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/15 text-blue-400 rounded-xl font-mono text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition shadow-lg"
                      >
                        <span className="font-bold text-[10px] uppercase text-center leading-tight">Approve Round 2</span>
                      </button>
                      
                      <button 
                        onClick={async () => {
                          if (!confirm(`Are you sure you want to select ${selectedCandidate.name} for Personal Interview (PI)? This will trigger an official email notification.`)) return;
                          setIsSubmitting(true);
                          
                          await triggerStatusOverrideGUI(selectedCandidate.id, "SELECTED_FOR_PI");
                          
                          await fetch(webhookUrl, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              action: "dispatch-email-notice",
                              email: selectedCandidate.email,
                              name: selectedCandidate.name,
                              status: "SELECTED_FOR_PI"
                            })
                          });
                          
                          logTerminalMsg(`Candidate ${selectedCandidate.name} selected for PI. Email dispatched.`, "success");
                          setIsSubmitting(false);
                        }} 
                        disabled={isSubmitting}
                        className="p-3 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-xl font-mono text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition shadow-lg"
                      >
                        <span className="font-bold text-[10px] uppercase text-center leading-tight">🎯 Select for PI</span>
                      </button>

                      <button 
                        onClick={async () => {
                          if (!confirm(`Are you sure you want to REJECT ${selectedCandidate.name}? This will revoke any previous shortlists and send a formal rejection email.`)) return;
                          setIsSubmitting(true);
                          
                          await triggerStatusOverrideGUI(selectedCandidate.id, "REJECTED");
                          
                          await fetch(webhookUrl, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              action: "dispatch-email-notice",
                              email: selectedCandidate.email,
                              name: selectedCandidate.name,
                              status: "REJECTED"
                            })
                          });
                          
                          logTerminalMsg(`Candidate ${selectedCandidate.name} rejected. Rejection email dispatched.`, "success");
                          setIsSubmitting(false);
                        }} 
                        disabled={isSubmitting}
                        className="p-3 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-xl font-mono text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition shadow-lg"
                      >
                        <span className="font-bold text-[10px] uppercase text-center leading-tight flex items-center gap-1"><XCircle size={12}/> Reject / Revoke</span>
                      </button>

                    </div>
                  </div>
                ) : (
                  <div className="bg-black border border-emerald-500/10 rounded-2xl p-8 text-center text-emerald-500/20">Select an application profile from the left column to view audit options.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}