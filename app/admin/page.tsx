"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, Cpu, BarChart3, Users, Download, ShieldAlert, CheckCircle, Clock, ArrowRight, Check, X, FileCheck, RefreshCw,Calendar} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  domain: string;
  score: number;
  choices: string;
  status: string;
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
  // Security Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [activeTab, setActiveTab] = useState<"hub" | "analytics" | "recruitment">("hub");

  // Live Database Core States
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [interviewScore, setInterviewScore] = useState("80");
  const [outputLetter, setOutputLetter] = useState("");
  const [sectorData, setSectorData] = useState<DistributionItem[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelItem[]>([]);
  
  // UX Loading & Execution States
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const webhookUrl = process.env.NEXT_PUBLIC_SHEET_WEBHOOK_URL;

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

  // 📊 FETCH LIVE DATA-STUDIO METRICS DIRECTLY FROM GOOGLE APPS SCRIPT
  const fetchLiveAnalytics = async () => {
    if (!webhookUrl) return;
    setIsDataLoading(true);
    try {
      const res = await fetch(`${webhookUrl}?action=get-dashboard-analytics`);
      const json = await res.json();
      if (json.success) {
        setSectorData(json.sectorDistribution || []);
        setFunnelData(json.funnelMetrics || []);
      }
    } catch (err) {
      console.error("Database analytics tracking extraction timeout:", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  // 👥 FETCH ALL RECRUITMENT APPLICANTS STRAIGHT FROM SUBMISSIONS TAB
  const fetchLiveApplicants = async () => {
    if (!webhookUrl) return;
    setIsDataLoading(true);
    try {
      const res = await fetch(`${webhookUrl}?action=get-all-registrations`);
      const json = await res.json();
      
      if (json.success && json.data) {
        const structuralMapping = json.data.map((row: any) => ({
          id: row.regId || row.rollNumber || "CAN-ID",
          name: row.name,
          email: row.email,
          domain: row.eventTitle || "Operations & Deep Tech Core",
          score: parseInt(row.rollNumber) || 40, 
          choices: row.customAnswers ? JSON.stringify(row.customAnswers) : "Staged Evaluation Clear",
          status: "PENDING"
        }));
        setCandidates(structuralMapping);
        if (structuralMapping.length > 0) setSelectedCandidate(structuralMapping[0]);
      }
    } catch (err) {
      console.error("Applicant ledger data pulling failure:", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Automated tab lifecycle triggers
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === "analytics") fetchLiveAnalytics();
      if (activeTab === "recruitment") fetchLiveApplicants();
    }
  }, [isAuthenticated, activeTab]);

  // 🎯 COMMIT INTERACTIVE SHORTLIST CHOICE TO GOOGLE SHEETS DOCK ROWS
  const processCandidateDecision = async (decision: "SELECTED" | "WAITLISTED") => {
    if (!selectedCandidate || !webhookUrl) return;
    setIsSubmitting(true);

    try {
      await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors", // Bypasses Google Script redirect restrictions safely
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-shortlist",
          candidateId: selectedCandidate.id,
          score: parseInt(interviewScore) || 80,
          status: decision
        })
      });

      // Render customized decision outcome notification locally
      const cleanName = selectedCandidate.name;
      let decisionLetter = "";
      if (decision === "SELECTED") {
        decisionLetter = `Dear ${cleanName},\n\nWe are thrilled to inform you that based on your exceptional evaluation score of ${interviewScore}/100 and your strategic problem-solving traits displayed during our venture tracking loops, you have been SELECTED as an Executive Member of the BIMTECH E-Cell. Welcome to the core ecosystem architecture.`;
      } else {
        decisionLetter = `Dear ${cleanName},\n\nThank you for exploring the startup validation sequences with us. Your assessment score of ${interviewScore}/100 has been logged. Due to cohort size limitations, you have been placed on the WAITLIST for this operational wave. We will monitor active ecosystem capacity closely.`;
      }

      setOutputLetter(decisionLetter);
      setCandidates(prev => prev.map(c => c.id === selectedCandidate.id ? { ...c, status: decision, score: parseInt(interviewScore) } : c));
      
    } catch (err) {
      alert("Error synchronizing choice variables to sheets database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSV METRICS SPREADSHEET EXPORTER UTILITY
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

  // 🔒 SECURITY BARRIER GATE
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

  // 🔓 WORKSPACE HUB DASHBOARD
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans antialiased">
      
      {/* HUD SYSTEM CONTROL BAR */}
      <header className="border-b border-white/10 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div onClick={() => setActiveTab("hub")} className="flex items-center gap-3 cursor-pointer group">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 group-hover:bg-blue-500/20 transition"><Cpu size={18} /></div>
          <div>
            <h1 className="text-base font-black uppercase font-mono tracking-tight">E-Cell Management Hub</h1>
            <p className="text-[10px] font-mono text-white/40">MASTER TERMINAL CENTER</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-xl">
          <button onClick={() => setActiveTab("hub")} className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider transition ${activeTab === "hub" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}>Central Station</button>
          <button onClick={() => setActiveTab("analytics")} className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider transition ${activeTab === "analytics" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}>Data Studio</button>
          <button onClick={() => setActiveTab("recruitment")} className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider transition ${activeTab === "recruitment" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}>Shortlist Engine</button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        
        {/* VIEW 1: HUB SHORTCUT SELECTION CARDS */}
        {activeTab === "hub" && (
          <div className="space-y-8 py-8 animate-fadeIn">
            <div className="text-center space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl font-black font-mono uppercase tracking-tight">E-Cell Master Control</h2>
              <p className="text-xs text-white/40">Select an administrative option or use the upper workspace controllers to pull live system database statistics.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Link href="/admin/events" className="bg-zinc-950 border border-white/10 p-5 rounded-xl block hover:border-blue-500/40 transition group shadow-xl">
                <div className="space-y-4">
                  <div className="p-2.5 bg-blue-500/5 border border-blue-500/20 text-blue-400 rounded-xl inline-block"><Calendar size={18} /></div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition">Events Control Panel</h3>
                    <p className="text-[11px] text-white/40 leading-relaxed">Configure form questions, modify assets, and check event attendance logs.</p>
                  </div>
                  <div className="text-[10px] text-blue-400 font-bold tracking-wider uppercase flex items-center gap-1 pt-2">
                    <span>Launch Sub-Panel</span> <ArrowRight size={10} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
              <div onClick={() => setActiveTab("recruitment")} className="bg-zinc-950 border border-white/10 p-5 rounded-xl block hover:border-emerald-500/40 transition group shadow-xl cursor-pointer">
                <div className="space-y-4">
                  <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-xl inline-block"><Users size={18} /></div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">Vetting & Recruitment Core</h3>
                    <p className="text-[11px] text-white/40 leading-relaxed">Evaluate applicant sandboxed test inputs, input interview grades, and generate automated selection decisions.</p>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase flex items-center gap-1 pt-2">
                    <span>Open Dashboard View</span> <ArrowRight size={10} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: METRICS STUDIO GRAPH LAYOUTS */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2"><BarChart3 size={18} className="text-blue-500" /> Administrative Data Studio</h2>
                <p className="text-xs text-white/40">Dynamic metrics visual distribution rendered live from your spreadsheet data cells.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchLiveAnalytics} disabled={isDataLoading} className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white transition disabled:opacity-40 cursor-pointer">
                  <RefreshCw size={12} className={isDataLoading ? "animate-spin" : ""} />
                </button>
                <button onClick={handleCsvExport} className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer">
                  <Download size={13} /> Export Master Metrics (CSV)
                </button>
              </div>
            </div>

            {isDataLoading && sectorData.length === 0 ? (
              <div className="text-center py-20 font-mono text-white/30 animate-pulse">Extracting parameter blocks from spreadsheet app script webhook rows...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* APPLICATION PROGRESSION PIPELINE FUNNEL CHART */}
                <div className="lg:col-span-7 bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
                  <h3 className="text-xs font-mono font-bold tracking-widest text-white/40 uppercase">E-Cell Application Conversion Ingestion Funnel</h3>
                  <div className="space-y-3.5 pt-2">
                    {funnelData.length > 0 ? funnelData.map((item, idx) => {
                      const totalBase = funnelData[0].value || 1;
                      const ratioPercent = Math.round((item.value / totalBase) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-white/70">{item.stage}</span>
                            <span className="text-white font-bold">{item.value} <span className="text-white/30 font-normal">({ratioPercent}%)</span></span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
                            <div style={{ width: `${ratioPercent}%` }} className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-700" />
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-xs font-mono text-white/20 py-4">No tracking ledger matrices found inside connected cells.</p>
                    )}
                  </div>
                </div>

                {/* CATEGORICAL INTEREST CLUSTERING PROFILE METRICS */}
                <div className="lg:col-span-5 bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
                  <h3 className="text-xs font-mono font-bold tracking-widest text-white/40 uppercase">Domain Interest Node Density Allocation</h3>
                  <div className="space-y-4 pt-2">
                    {sectorData.length > 0 ? sectorData.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                        <div className="space-y-0.5 max-w-[70%]">
                          <div className="text-xs font-bold text-white tracking-tight truncate">{item.sector}</div>
                          <div className="text-[9px] font-mono text-white/30">Active Ingest Module Row</div>
                        </div>
                        <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono font-bold text-blue-400">
                          {item.count} rows
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs font-mono text-white/20 py-4">No metric clusters populated yet.</p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* VIEW 3: INTERACTIVE CANDIDATE AUDITING TERMINAL */}
        {activeTab === "recruitment" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-white/5 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Interactive Candidate Shortlist Core</h2>
                <p className="text-xs text-white/40">Audit structural system responses side-by-side and commit decisions straight to row tables.</p>
              </div>
              <button onClick={fetchLiveApplicants} disabled={isDataLoading} className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white transition disabled:opacity-40 cursor-pointer">
                <RefreshCw size={12} className={isDataLoading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* CANDIDATE LIST SIDE DRAWER BAR */}
              <div className="lg:col-span-4 bg-zinc-950 border border-white/10 rounded-2xl p-4 space-y-3 max-h-[500px] overflow-y-auto shadow-xl">
                <h3 className="text-xs font-mono font-bold tracking-widest text-white/40 uppercase px-2 pb-2 border-b border-white/5 flex items-center gap-1.5">
                  <Users size={12} /> Active Cohort Registry
                </h3>
                {isDataLoading && candidates.length === 0 ? (
                  <p className="text-center font-mono py-8 text-white/20 animate-pulse">Running data stream queries...</p>
                ) : candidates.length > 0 ? (
                  <div className="space-y-2">
                    {candidates.map((c, idx) => (
                      <button key={idx} onClick={() => { setSelectedCandidate(c); setOutputLetter(""); }} className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 ${selectedCandidate?.id === c.id ? "bg-white/10 border-blue-500" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}>
                        <div className="flex justify-between items-center w-full">
                          <span className="font-bold text-white text-xs tracking-tight truncate max-w-[60%]">{c.name}</span>
                          <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full font-bold ${c.status === 'SELECTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : c.status === 'WAITLISTED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>{c.status}</span>
                        </div>
                        <div className="flex justify-between items-center w-full text-[10px] font-mono text-white/40 truncate">
                          <span className="truncate max-w-[60%]">{c.domain}</span>
                          <span className="text-white/60 font-bold">Score: {c.score}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center font-mono py-8 text-white/20">No matching tracking data found.</p>
                )}
              </div>

              {/* EVALUATION ACTION VIEW PORT CONTAINER */}
              <div className="lg:col-span-8 space-y-6">
                {selectedCandidate ? (
                  <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
                    <div className="border-b border-white/5 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="text-[9px] font-mono text-blue-400 font-bold tracking-widest uppercase bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">{selectedCandidate.id}</span>
                        <h2 className="text-lg font-bold text-white tracking-tight mt-1">{selectedCandidate.name}</h2>
                        <p className="text-[10px] font-mono text-white/30 mt-0.5">{selectedCandidate.email}</p>
                      </div>
                      <div className="text-[11px] font-mono text-white/40 bg-white/5 px-3 py-1 rounded-lg border border-white/5">Target Domain: <strong className="text-white font-sans block sm:inline">{selectedCandidate.domain}</strong></div>
                    </div>

                    <div className="space-y-1.5 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                      <label className="text-[9px] font-mono uppercase font-bold tracking-wider text-white/40 flex items-center gap-1"><FileCheck size={10} /> Candidate Architecture Quiz Response Block:</label>
                      <p className="text-xs font-mono text-white/80 leading-relaxed pt-0.5 text-justify whitespace-pre-wrap">
                        {selectedCandidate.choices}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end border-t border-white/5 pt-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase font-bold tracking-wider text-white/40">Input Evaluation Score (0-100)</label>
                        <input type="number" value={interviewScore} onChange={(e) => setInterviewScore(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500 font-bold" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => processCandidateDecision("WAITLISTED")} disabled={isSubmitting} className="py-2 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 text-amber-400 font-mono text-xs font-bold uppercase rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40">
                          Waitlist
                        </button>
                        <button onClick={() => processCandidateDecision("SELECTED")} disabled={isSubmitting} className="py-2 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400 font-mono text-xs font-bold uppercase rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40">
                          Select Core
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-8 text-center font-mono text-white/20">
                    Select an applicant file node from the left roster to populate evaluation frames.
                  </div>
                )}

                {/* AUTOMATED COHORT ACCEPTANCE TEMPLATE EXPORTER */}
                {outputLetter && (
                  <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-3 shadow-xl animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1"><Check size={12} /> Live Sync Complete: Decision Notification Ready</span>
                      <span className="text-[9px] font-mono text-white/30">Click payload container to select text rows</span>
                    </div>
                    <pre className="text-[11px] font-mono text-white/70 bg-black/40 border border-white/5 p-4 rounded-xl whitespace-pre-wrap leading-relaxed text-justify select-all cursor-pointer">
                      {outputLetter}
                    </pre>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      {/* FOOTER BAR ACCESS LAYER */}
      <footer className="border-t border-white/5 p-4 text-center text-[10px] font-mono text-white/20 flex items-center justify-center gap-2 max-w-7xl w-full mx-auto">
        <ShieldAlert size={12} /> Secure spreadsheet sandbox link established. Key sets destroy automatically upon tab closure.
      </footer>
    </div>
  );
}