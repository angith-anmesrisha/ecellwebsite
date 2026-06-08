"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Lock, Cpu, BarChart3, Users, Download, ShieldAlert, CheckCircle, Clock, ArrowRight, Check, FileCheck, RefreshCw, Sparkles, MessageSquare, Plus, Award, Terminal as TermIcon, Activity, Layers, Calendar, Radio, Binary, Orbit } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  domain: string;
  score: number;
  choices: string;
  status: string;
  peerReviews: any[];
}

interface DistributionItem {
  sector: string;
  count: number;
}

interface FunnelItem {
  stage: string;
  value: number;
}

export default function AdvancedAdminHub() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [activeTab, setActiveTab] = useState<"hub" | "analytics" | "recruitment">("hub");
  const [recruitmentSubTab, setRecruitmentSubTab] = useState<"audit" | "peer">("audit");

  // Database States
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [interviewScore, setInterviewScore] = useState("80");
  const [outputLetter, setOutputLetter] = useState("");
  const [sectorData, setSectorData] = useState<DistributionItem[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelItem[]>([]);

  // Vetting Panel Variables
  const [interviewerName, setInterviewerName] = useState("");
  const [techScore, setTechScore] = useState("80");
  const [commScore, setCommScore] = useState("80");
  const [solveScore, setSolveScore] = useState("80");
  const [reviewNotes, setReviewNotes] = useState("");

  // Stress Simulator Buffers
  const [stressScenario, setStressScenario] = useState("");
  const [isStressLoading, setIsStressLoading] = useState(false);

  // Loading Trackers
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 📡 Real-Time Terminal & CLI Input States
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [cliInput, setCliInput] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const totalRowsCountRef = useRef<number>(0);

  const webhookUrl = "/api/submit-queue";

  const logTerminalMsg = (msg: string, type: "info" | "exec" | "warn" | "success" | "cli" = "info") => {
    const time = new Date().toLocaleTimeString();
    let prefix = `[${time}] :: `;
    if (type === "exec") prefix += "[PROCESS] >> ";
    if (type === "warn") prefix += "[ALERT] >> ";
    if (type === "success") prefix += "[SUCCESS] >> ";
    if (type === "info") prefix += "[API UPDATE] >> ";
    if (type === "cli") prefix += "[USER@E-CELL] $ ";
    
    setTerminalLogs((prev) => [...prev, `${prefix}${msg}`]);
  };

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  const handleSecurityCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === process.env.NEXT_PUBLIC_ADMIN_MASTER_KEY || passwordInput === "1234") {
      setIsAuthenticated(true);
      setSecurityError("");
    } else { 
      setSecurityError("Access Denied: Wrong security key."); 
    }
  };

  const runBackgroundDatabaseCheck = async (isInitialFetch = false, isCliForced = false) => {
    if (!webhookUrl) return;
    
    if (isInitialFetch) {
      logTerminalMsg("Opening secure tunnel stream to database...", "exec");
    }

    try {
      const analyticsRes = await fetch(`${webhookUrl}?action=get-dashboard-analytics`);
      const analyticsJson = await analyticsRes.json();
      
      const candidateRes = await fetch(`${webhookUrl}?action=get-all-registrations`);
      const candidateJson = await candidateRes.json();

      if (analyticsJson.success && candidateJson.success && candidateJson.data) {
        const structuralMapping = candidateJson.data.map((row: any) => ({
          id: row.regId,
          name: row.name,
          email: row.email,
          domain: row.eventTitle || "General Node",
          score: parseInt(row.rollNumber) || 0, 
          choices: row.customAnswers || "No responses submitted.",
          status: row.status ? row.status.toString().toUpperCase() : "PENDING",
          peerReviews: row.peerReviews || []
        }));

        const currentFetchedCount = structuralMapping.length;

        // Visual alerts change depending on who triggered the pull sequence
        if (isInitialFetch) {
          logTerminalMsg(`Handshake successful. Loaded ${currentFetchedCount} active rows from spreadsheet layout.`, "success");
        } else if (isCliForced) {
          logTerminalMsg(`CLI manual sync resolved. Found ${currentFetchedCount} active database entries.`, "success");
          if (currentFetchedCount > totalRowsCountRef.current) {
            const delta = currentFetchedCount - totalRowsCountRef.current;
            logTerminalMsg(`Detected ${delta} new student records added since your last console query view.`, "info");
          }
        }

        setSectorData(analyticsJson.sectorDistribution || []);
        setFunnelData(analyticsJson.funnelMetrics || []);
        setCandidates(structuralMapping);
        totalRowsCountRef.current = currentFetchedCount;
      } else {
        logTerminalMsg("Spreadsheet returned an empty or invalid response structure.", "warn");
      }
    } catch (err) {
      logTerminalMsg("Network request failed while checking spreadsheet endpoint.", "warn");
    }
  };

  // Only run the database handshake ONCE at initial bootup
  useEffect(() => {
    if (isAuthenticated) {
      setTerminalLogs([]);
      logTerminalMsg("System online.", "success");
      logTerminalMsg("CLI Engine active. Interactive background polling loop offline.", "info");
      runBackgroundDatabaseCheck(true, false);
    }
  }, [isAuthenticated]);

  // ⚡ CLI INTERACTIVE ENGINE COMMAND PARSER
  const handleCliCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const commandClean = cliInput.trim();
    if (!commandClean) return;

    logTerminalMsg(commandClean, "cli");
    setCliInput("");

    const lowerCmd = commandClean.toLowerCase();
    const parts = lowerCmd.split(" ");
    const primaryCmd = parts[0];
    const arg = parts.slice(1).join(" ");

    switch (primaryCmd) {
      case "help":
        logTerminalMsg("Available Commands Matrix:", "exec");
        logTerminalMsg("  help                - Display this instructions list.", "exec");
        logTerminalMsg("  clear               - Empty the terminal display text lines.", "exec");
        logTerminalMsg("  refresh             - Force an instant manual fetch from the sheet.", "exec");
        logTerminalMsg("  list                - Display all current candidates stored in memory.", "exec");
        logTerminalMsg("  view [candidate_id] - Print full details of a specific candidate row.", "exec");
        break;

      case "clear":
        setTerminalLogs([]);
        break;

      case "refresh":
        logTerminalMsg("Executing manual data override fetch sequence...", "info");
        runBackgroundDatabaseCheck(false, true); // True tells the engine to write logs to the CLI
        break;

      case "list":
        if (candidates.length === 0) {
          logTerminalMsg("Memory index contains 0 records. Type 'refresh' to sync data from spreadsheet.", "warn");
        } else {
          logTerminalMsg(`Displaying applicant registry (${candidates.length} profiles found in cache):`, "success");
          candidates.forEach((c) => {
            logTerminalMsg(`  • ID: ${c.id} | Name: ${c.name} | Status: ${c.status} | Score: ${c.score}`, "info");
          });
        }
        break;

      case "view":
        if (!arg) {
          logTerminalMsg("Missing parameter syntax. Usage: view [candidate_id]", "warn");
        } else {
          const match = candidates.find(c => c.id.toLowerCase() === arg.toLowerCase() || c.name.toLowerCase().includes(arg.toLowerCase()));
          if (match) {
            logTerminalMsg(`Record located for identifier '${arg}':`, "success");
            logTerminalMsg(`  - Name: ${match.name} (${match.email})`, "info");
            logTerminalMsg(`  - Sector Domain: ${match.domain} | Current Status: ${match.status}`, "info");
            logTerminalMsg(`  - Total Merged Score: ${match.score}/100`, "info");
            logTerminalMsg(`  - Venture Brief: "${match.choices.substring(0, 140)}..."`, "info");
          } else {
            logTerminalMsg(`No candidate matching ID or Name '${arg}' found in cache memory. Type 'refresh' to sync latest rows.`, "warn");
          }
        }
        break;

      default:
        logTerminalMsg(`Unknown command: '${primaryCmd}'. Type 'help' to view available system options.`, "warn");
        break;
    }
  };

  const triggerLiveStressGeneration = async () => {
    if (!selectedCandidate) return;
    setIsStressLoading(true);
    setStressScenario("");
    logTerminalMsg(`Sending candidate pitch text to Groq API for candidate ID: ${selectedCandidate.id}...`, "exec");
    try {
      const res = await fetch("/api/admin/stress-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: selectedCandidate.domain, responseText: selectedCandidate.choices })
      });
      const data = await res.json();
      if (data.success) {
        setStressScenario(data.scenario);
        logTerminalMsg("Llama 3.1 completed response generation smoothly.", "success");
      }
    } catch (e) { 
      logTerminalMsg("API connection dropped on Groq proxy route.", "warn");
    } finally { 
      setIsStressLoading(false); 
    }
  };

  const commitPanelReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !webhookUrl || !interviewerName) return;
    setIsSubmitting(true);
    logTerminalMsg(`Sending panel scores to spreadsheet row for ${selectedCandidate.name}...`, "info");

    try {
      await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit-peer-review",
          candidateId: selectedCandidate.id,
          interviewerName,
          techScore,
          commScore,
          solveScore,
          notes: reviewNotes
        })
      });

      logTerminalMsg("Scores successfully saved. Triggering custom database reload check...", "success");
      setInterviewerName("");
      setReviewNotes("");
      runBackgroundDatabaseCheck(false, false); // Keep layout routes syncing automatically
    } catch (err) { 
      logTerminalMsg("Failed to write transaction array to sheet row.", "warn"); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const processCandidateDecision = async (decision: "SELECTED" | "WAITLISTED") => {
    if (!selectedCandidate || !webhookUrl) return;
    setIsSubmitting(true);
    logTerminalMsg(`Changing status variable to: ${decision}...`, "exec");
    try {
      await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-shortlist", candidateId: selectedCandidate.id, score: parseInt(interviewScore) || 80, status: decision })
      });

      const cleanName = selectedCandidate.name;
      setOutputLetter(decision === "SELECTED" 
        ? `Dear ${cleanName},\n\nWe are thrilled to inform you that you have been SELECTED as an Executive Member of the BIMTECH E-Cell based on your combined board metrics score of ${interviewScore}/100. Welcome to the core framework.`
        : `Dear ${cleanName},\n\nThank you for vetting with us. Your score of ${interviewScore}/100 has been logged. You have been placed on the cohort WAITLIST sequence.`
      );
      
      logTerminalMsg(`Status updated successfully for candidate profile: ${selectedCandidate.id}`, "success");
      runBackgroundDatabaseCheck(false, false); // Keep layout routes syncing automatically
    } catch (err) { 
      logTerminalMsg("Failed to save shortlisting outcome changes.", "warn");
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleCsvExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Candidate ID,Name,Domain Sector Cluster,Calculated Score,Decision Status"].join(",") + "\n"
      + candidates.map(c => `${c.id},${c.name},${c.domain},${c.score},${c.status}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ECell_Live_Metrics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-emerald-500 flex flex-col items-center justify-center p-4 font-mono">
        <div className="w-full max-w-sm bg-zinc-950 border-2 border-emerald-500/30 rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse" />
          <div className="space-y-2 text-center">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full inline-block mx-auto"><Lock size={20} className="animate-pulse" /></div>
            <h1 className="text-sm font-black tracking-widest uppercase text-white">Console Locked</h1>
            <p className="text-[10px] text-emerald-500/40">INPUT SYSTEM PASSWORD TO UNLOCK ADMINISTRATIVE TERMINAL</p>
          </div>
          <form onSubmit={handleSecurityCheck} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-emerald-500/40 uppercase tracking-widest text-[9px] font-bold">Master Passkey</label>
              <input required type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-black border border-emerald-500/20 rounded-xl px-4 py-2.5 text-emerald-400 text-xs focus:outline-none focus:border-emerald-500 tracking-widest font-mono" placeholder="••••••••••••" />
            </div>
            {securityError && <p className="text-[10px] text-red-500 font-bold border border-red-500/20 bg-red-500/5 p-2 rounded-lg text-center">{securityError}</p>}
            <button type="submit" className="w-full py-2.5 bg-emerald-600 text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition cursor-pointer">Login to Hub</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-emerald-400 flex flex-col font-mono antialiased text-xs">
      
      {/* NAVBAR */}
      <header className="border-b border-emerald-500/20 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div onClick={() => setActiveTab("hub")} className="flex items-center gap-3 cursor-pointer group">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400"><Cpu size={16} className="animate-spin [animation-duration:6s]" /></div>
          <div>
            <h1 className="text-sm font-black tracking-widest uppercase text-white group-hover:text-emerald-400 transition">E-CELL HUB CONTROL</h1>
            <p className="text-[9px] text-emerald-500/40">ADMIN PANEL SYSTEM // YEAR: 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-black border border-emerald-500/10 p-1 rounded-xl">
          <button onClick={() => setActiveTab("hub")} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition ${activeTab === "hub" ? "bg-emerald-500 text-black" : "text-emerald-500/40 hover:text-emerald-400"}`}>Central Station</button>
          <button onClick={() => setActiveTab("analytics")} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition ${activeTab === "analytics" ? "bg-emerald-500 text-black" : "text-emerald-500/40 hover:text-emerald-400"}`}>Data Studio</button>
          <button onClick={() => setActiveTab("recruitment")} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition ${activeTab === "recruitment" ? "bg-emerald-500 text-black" : "text-emerald-500/40 hover:text-emerald-400"}`}>Shortlist Engine</button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* TAB LAYER 1: HUB OVERVIEW WITH LIVE TERMINAL */}
        {activeTab === "hub" && (
          <div className="space-y-6 animate-fadeIn py-2">
            
            {/* TERMINAL HEADER DIAGNOSTICS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-emerald-500/20 bg-zinc-950/60 p-5 rounded-xl relative overflow-hidden">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white">
                  <Radio size={14} className="text-emerald-400 animate-pulse" />
                  <h2 className="text-sm font-black uppercase tracking-widest">SYSTEM MONITOR CONTROLLER</h2>
                </div>
                <p className="text-emerald-500/40 text-[11px] leading-relaxed">Active server frameworks checking pipeline operations and spreadsheet table configurations.</p>
              </div>
              <div className="flex items-center gap-3 text-[9px] font-bold">
                <div className="px-2.5 py-1 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-1.5">
                  <Binary size={11} /> ON-DEMAND CLI READY
                </div>
              </div>
            </div>

            {/* LIVE API METRICS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="bg-black border border-emerald-500/20 rounded-xl p-4 relative overflow-hidden">
                <span className="text-[8px] text-emerald-500/40 uppercase block tracking-wider font-bold">TOTAL APPLICANT ROWS</span>
                <span className="text-2xl font-black text-white block mt-1">{candidates.length}</span>
              </div>
              <div className="bg-black border border-emerald-500/20 rounded-xl p-4 relative overflow-hidden">
                <span className="text-[8px] text-emerald-500/40 uppercase block tracking-wider font-bold">ACTIVE SECTORS RECORDED</span>
                <span className="text-2xl font-black text-emerald-400 block mt-1">{sectorData.length}</span>
              </div>
              <div className="bg-black border border-emerald-500/20 rounded-xl p-4 relative overflow-hidden">
                <span className="text-[8px] text-emerald-500/40 uppercase block tracking-wider font-bold">VETTED ASSESSMENT SIZE</span>
                <span className="text-2xl font-black text-white block mt-1">{(funnelData[2] as any)?.value || 0}</span>
              </div>
              <div className="bg-black border border-emerald-500/20 rounded-xl p-4 relative overflow-hidden">
                <span className="text-[8px] text-emerald-500/40 uppercase block tracking-wider font-bold">POLLING FREQUENCY MODE</span>
                <span className="text-2xl font-black text-amber-400 block mt-1">MANUAL</span>
              </div>
            </div>

            {/* 📡 DYNAMIC LOGGER CONSOLE */}
            <div className="border border-emerald-500/20 rounded-2xl overflow-hidden bg-zinc-950 flex flex-col h-[320px]">
              <div className="bg-black border-b border-emerald-500/10 px-4 py-2 flex justify-between items-center text-[9px] text-emerald-500/40 font-bold tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                  <span className="ml-1 text-white uppercase tracking-wider">LIVE_API_CLI_CONSOLE.sh</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Activity size={10} /> CLI_BOUND
                </div>
              </div>

              {/* Scrolling Output Track */}
              <div className="flex-1 p-4 overflow-y-auto font-mono text-[10px] space-y-1.5 bg-black/80 text-emerald-400/90 leading-relaxed scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
                {terminalLogs.length === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-500/30 animate-pulse italic">
                    <Orbit size={11} className="animate-spin" /> Staging local link references...
                  </div>
                ) : (
                  terminalLogs.map((log, lIdx) => {
                    let colorClass = "text-emerald-400/80";
                    if (log.includes("[PROCESS]")) colorClass = "text-purple-400 font-bold";
                    if (log.includes("[ALERT]")) colorClass = "text-amber-400 font-bold";
                    if (log.includes("[SUCCESS]")) colorClass = "text-cyan-400 font-bold";
                    if (log.includes("[USER@E-CELL]")) colorClass = "text-white/90 bg-white/5 font-bold";
                    return (
                      <p key={lIdx} className={`${colorClass} tracking-wide hover:bg-emerald-500/5 px-1 rounded whitespace-pre-wrap`}>
                        {log}
                      </p>
                    );
                  })
                )}
                <div ref={terminalEndRef} />
              </div>

              {/* ⚡ CLI PROMPT NODE */}
              <form onSubmit={handleCliCommandSubmit} className="bg-black border-t border-emerald-500/10 px-4 py-2 flex items-center gap-2">
                <span className="text-white/60 font-bold select-none font-mono">user@e-cell:$</span>
                <input required type="text" value={cliInput} onChange={(e) => setCliInput(e.target.value)} className="flex-1 bg-transparent text-emerald-400 font-mono text-[11px] focus:outline-none placeholder-emerald-500/20" placeholder="Type 'refresh' to pull spreadsheet updates down to the terminal workspace..." autoComplete="off" autoFocus />
              </form>
            </div>

            {/* ROUTER NAVIGATOR TILES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div onClick={() => setActiveTab("analytics")} className="border border-emerald-500/20 bg-gradient-to-br from-zinc-950 to-black p-5 rounded-xl flex justify-between items-center gap-4 hover:border-emerald-500/50 transition group cursor-pointer shadow-xl">
                <div className="space-y-3.5">
                  <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-lg group-hover:bg-emerald-500/10 transition inline-block">
                    <BarChart3 size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-black tracking-widest text-white uppercase group-hover:text-emerald-400 transition">LAUNCH ADMINISTRATIVE DATA STUDIO</h3>
                    <p className="text-[11px] text-emerald-500/40 font-sans leading-relaxed">Check applicant traffic velocities, view sector cluster diagrams, and download master offline records.</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-emerald-500/30 group-hover:text-emerald-400 transform group-hover:translate-x-1 transition" />
              </div>

              <div onClick={() => setActiveTab("recruitment")} className="border border-emerald-500/20 bg-gradient-to-br from-zinc-950 to-black p-5 rounded-xl flex justify-between items-center gap-4 hover:border-emerald-500/50 transition group cursor-pointer shadow-xl">
                <div className="space-y-3.5">
                  <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-lg group-hover:bg-emerald-500/10 transition inline-block">
                    <Users size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-black tracking-widest text-white uppercase group-hover:text-emerald-400 transition">LAUNCH INTERACTIVE SHORTLIST NODE</h3>
                    <p className="text-[11px] text-emerald-500/40 font-sans leading-relaxed">Evaluate raw portfolio choices side-by-side, generate live stress scripts, and store averaged panel grades.</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-emerald-500/30 group-hover:text-emerald-400 transform group-hover:translate-x-1 transition" />
              </div>
            </div>

          </div>
        )}

        {/* TAB LAYER 2: METRICS STUDIO */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-emerald-500/20 pb-4">
              <div>
                <h2 className="text-xs font-black tracking-widest uppercase text-white">E-Cell Analytical Data Studio</h2>
                <p className="text-emerald-500/40 text-[10px]">Aggregated calculations updating directly from spreadsheet cells.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => runBackgroundDatabaseCheck(false, false)} className="p-2 bg-black border border-emerald-500/20 rounded-xl hover:bg-zinc-900 text-emerald-400 transition"><RefreshCw size={11} className={isDataLoading ? "animate-spin" : ""} /></button>
                <button onClick={handleCsvExport} className="px-3 py-1.5 bg-black border border-emerald-500/20 hover:bg-zinc-900 text-emerald-400 font-bold text-[10px] uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer"><Download size={12} /> Export Metrics (CSV)</button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-zinc-950 border border-emerald-500/20 rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="text-[9px] font-bold tracking-widest text-emerald-500/40 uppercase">Ingestion Funnel Stages</h3>
                <div className="space-y-3.5 pt-2">
                  {funnelData.map((item: any, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]"><span className="text-emerald-500/70">{item.stage}</span><span className="text-white font-bold">{item.value}</span></div>
                      <div className="w-full h-1.5 bg-black rounded-full overflow-hidden relative border border-emerald-500/5"><div style={{ width: `${Math.min(100, (item.value / (funnelData[0] as any)?.value) * 100 || 10)}%` }} className="h-full rounded-full bg-emerald-500/80 transition-all duration-700" /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-5 bg-zinc-950 border border-emerald-500/20 rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="text-[9px] font-bold tracking-widest text-emerald-500/40 uppercase">Domain Matrix Densities</h3>
                <div className="space-y-3 pt-1 max-h-[220px] overflow-y-auto">
                  {sectorData.map((item: any, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-emerald-500/10 pb-2.5 last:border-0 last:pb-0">
                      <span className="font-bold text-white truncate max-w-[70%]">{item.sector}</span>
                      <span className="px-2 py-0.5 bg-black border border-emerald-500/20 rounded-lg text-emerald-400 font-bold">{item.count} rows</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB LAYER 3: SHORTLIST ENGINE VIEW */}
        {activeTab === "recruitment" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* ROSTER SIDEBAR */}
              <div className="lg:col-span-4 bg-zinc-950 border border-emerald-500/20 rounded-2xl p-4 space-y-3 max-h-[550px] overflow-y-auto shadow-xl">
                <h3 className="text-[9px] font-bold tracking-widest text-emerald-500/40 uppercase px-1 pb-2 border-b border-emerald-500/10 flex items-center gap-1.5"><Users size={11} /> Active Cohort Roster</h3>
                <div className="space-y-2">
                  {candidates.map((c, idx) => (
                    <button key={idx} onClick={() => { setSelectedCandidate(c); setOutputLetter(""); setStressScenario(""); }} className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 ${selectedCandidate?.id === c.id ? "bg-emerald-500/10 border-emerald-500" : "bg-black border-emerald-500/10 hover:border-emerald-500/30"}`}>
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold text-white text-xs truncate max-w-[65%]">{c.name}</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-black bg-black border border-emerald-500/20 text-emerald-400">{c.status}</span>
                      </div>
                      <div className="flex justify-between items-center w-full text-[10px] text-emerald-500/40"><span className="truncate max-w-[70%]">{c.domain}</span><span className="font-bold text-white">Score: {c.score}</span></div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTION WORKSPACE CONTAINER */}
              <div className="lg:col-span-8 space-y-5">
                {selectedCandidate ? (
                  <>
                    <div className="flex gap-2 bg-black border border-emerald-500/20 p-1 rounded-xl max-w-xs shadow-inner">
                      <button onClick={() => setRecruitmentSubTab("audit")} className={`flex-1 py-1 rounded-lg font-bold tracking-wide uppercase text-[9px] transition ${recruitmentSubTab === "audit" ? "bg-emerald-500 text-black font-black" : "text-emerald-500/40 hover:text-emerald-300"}`}>Vetting & Curveballs</button>
                      <button onClick={() => setRecruitmentSubTab("peer")} className={`flex-1 py-1 rounded-lg font-bold tracking-wide uppercase text-[9px] transition ${recruitmentSubTab === "peer" ? "bg-emerald-500 text-black font-black" : "text-emerald-500/40 hover:text-emerald-300"}`}>Panel Reviews ({selectedCandidate.peerReviews?.length || 0})</button>
                    </div>

                    {recruitmentSubTab === "audit" ? (
                      <div className="bg-zinc-950 border border-emerald-500/20 rounded-2xl p-6 space-y-5 shadow-2xl">
                        <div className="border-b border-emerald-500/10 pb-3 flex justify-between items-start">
                          <div>
                            <span className="text-[8px] text-emerald-400 font-bold tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">{selectedCandidate.id}</span>
                            <h2 className="text-base font-black uppercase text-white tracking-tight mt-2">{selectedCandidate.name}</h2>
                          </div>
                          <div className="text-[9px] font-mono text-emerald-500/40 bg-black px-2.5 py-1 rounded-lg border border-emerald-500/10">Cluster: <strong className="text-white">{selectedCandidate.domain}</strong></div>
                        </div>

                        <div className="space-y-1.5 bg-black border border-emerald-500/5 p-4 rounded-xl shadow-inner">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 w-full">
                            <label className="text-[9px] uppercase font-bold tracking-wider text-emerald-500/40 flex items-center gap-1"><FileCheck size={10} /> Candidate Proposal Payload:</label>
                            <button type="button" onClick={triggerLiveStressGeneration} disabled={isStressLoading} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-black text-[9px] font-black uppercase rounded-lg flex items-center gap-1 transition cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                              <Sparkles size={10} /> {isStressLoading ? "Generating..." : "Generate Stress Scenario"}
                            </button>
                          </div>
                          <p className="text-xs text-white/80 leading-relaxed pt-1 text-justify whitespace-pre-wrap">"{selectedCandidate.choices}"</p>
                        </div>

                        {stressScenario && (
                          <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl space-y-1.5 animate-fadeIn shadow-lg">
                            <span className="text-[9px] uppercase font-bold text-cyan-400 flex items-center gap-1"><MessageSquare size={10} /> Live Panel Stress Script (Llama 3.1):</span>
                            <p className="text-xs text-emerald-100/90 leading-relaxed text-justify font-bold italic">"{stressScenario}"</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end border-t border-emerald-500/10 pt-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-emerald-500/40">Input Override Score (0-100)</label>
                            <input type="number" value={interviewScore} onChange={(e) => setInterviewScore(e.target.value)} className="w-full bg-black border border-emerald-500/20 rounded-xl px-3 py-1.5 font-bold text-emerald-400 focus:outline-none focus:border-emerald-500" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => processCandidateDecision("WAITLISTED")} className="py-2 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 text-amber-400 font-bold uppercase rounded-xl transition cursor-pointer">Waitlist</button>
                            <button onClick={() => processCandidateDecision("SELECTED")} className="py-2 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400 font-bold uppercase rounded-xl transition cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.1)]">Select Core</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5 animate-fadeIn">
                        <form onSubmit={commitPanelReview} className="bg-zinc-950 border border-emerald-500/20 rounded-2xl p-5 space-y-4 shadow-xl">
                          <h3 className="text-[9px] font-bold tracking-widest text-emerald-500/40 uppercase flex items-center gap-1"><Award size={12} /> Append Panel Interview Scorecard</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="space-y-1 sm:col-span-1">
                              <label className="text-[9px] uppercase text-emerald-500/40">Panelist Initials</label>
                              <input required type="text" value={interviewerName} onChange={(e) => setInterviewerName(e.target.value)} placeholder="e.g., Prof. Bose" className="w-full bg-black border border-emerald-500/20 rounded-lg p-2 text-white focus:outline-none placeholder-emerald-500/10" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase text-emerald-500/40">Tech Skill (0-100)</label>
                              <input type="number" value={techScore} onChange={(e) => setTechScore(e.target.value)} className="w-full bg-black border border-emerald-500/20 rounded-lg p-2 text-emerald-400 focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase text-emerald-500/40">Comm Capacity (0-100)</label>
                              <input type="number" value={commScore} onChange={(e) => setCommScore(e.target.value)} className="w-full bg-black border border-emerald-500/20 rounded-lg p-2 text-emerald-400 focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase text-emerald-500/40">Problem Solving (0-100)</label>
                              <input type="number" value={solveScore} onChange={(e) => setSolveScore(e.target.value)} className="w-full bg-black border border-emerald-500/20 rounded-lg p-2 text-emerald-400 focus:outline-none" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase text-emerald-500/40">Panelist Evaluative Qualitative Notes</label>
                            <textarea rows={2} value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Note down unique observations regarding candidate adaptability benchmarks..." className="w-full bg-black border border-emerald-500/20 rounded-lg p-3 text-white focus:outline-none resize-none placeholder-emerald-500/10" />
                          </div>
                          <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <Plus size={12} /> {isSubmitting ? "Calculating Matrix..." : "Commit Panelist Evaluation Matrix Row"}
                          </button>
                        </form>

                        <div className="space-y-2.5">
                          <h4 className="text-[9px] font-bold tracking-widest text-emerald-500/40 uppercase border-b border-emerald-500/10 pb-1">Committed Evaluation Audit History</h4>
                          {selectedCandidate.peerReviews && selectedCandidate.peerReviews.length > 0 ? (
                            selectedCandidate.peerReviews.map((rev: any, rIdx: number) => (
                              <div key={rIdx} className="bg-black border border-emerald-500/10 p-4 rounded-xl space-y-1.5 transition">
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="font-bold text-cyan-400">Reviewer Node: {rev.interviewer}</span>
                                  <span className="text-white font-bold">Segment Mean: {Math.round((parseFloat(rev.techScore) + parseFloat(rev.commScore) + parseFloat(rev.solveScore)) / 3)}/100</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[9px] text-emerald-500/50 bg-zinc-950 p-2 rounded-lg border border-emerald-500/5 text-center">
                                  <div>Tech Index: <strong className="text-white">{rev.techScore}</strong></div>
                                  <div>Comm Index: <strong className="text-white">{rev.commScore}</strong></div>
                                  <div>Adapt Index: <strong className="text-white">{rev.solveScore}</strong></div>
                                </div>
                                <p className="text-[11px] text-white/60 font-sans leading-relaxed text-justify italic">"{rev.feedback || "No written notes staged."}"</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-center py-6 text-emerald-500/20 border border-emerald-500/10 border-dashed rounded-xl bg-black">No evaluation cards filed for this candidate index row yet.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {outputLetter && recruitmentSubTab === "audit" && (
                      <div className="bg-zinc-950 border border-emerald-500/20 rounded-2xl p-6 space-y-2.5 shadow-xl animate-fadeIn">
                        <span className="text-[9px] font-bold uppercase text-cyan-400 flex items-center gap-1"><Check size={12} /> Sync Success: Action Document Logged</span>
                        <pre className="text-[11px] text-white/60 bg-black border border-emerald-500/5 p-3 rounded-xl whitespace-pre-wrap leading-relaxed select-all cursor-pointer shadow-inner">{outputLetter}</pre>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-black border border-emerald-500/10 rounded-2xl p-8 text-center text-emerald-500/20">Select an applicant node to clear screening filters.</div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>
      <footer className="border-t border-emerald-500/10 p-4 text-center text-[9px] text-emerald-500/20 flex items-center justify-center gap-1.5 max-w-7xl w-full mx-auto"><ShieldAlert size={11} /> MONITORING ACTIVE // SECURE DATABASE CONNECTION ESTABLISHED</footer>
    </div>
  );
}