"use client";
import React, { useState, useEffect } from "react";
import { Sliders, Film, Briefcase, Trophy, ArrowLeft, ShieldCheck, Lock, Unlock, Calendar as CalendarIcon, Save, AlertTriangle, FileText, ChevronDown, ChevronUp, CheckSquare, HelpCircle, Trash2 } from "lucide-react";
interface Submission {
  id: string;
  name: string;
  email: string;
  dept: "ops" | "media" | "spons";
  score: number;
  round1Choices: string[];
  caseAnswer: string;
  timestamp?: string;
}
export default function AdminDashboard() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filterDept, setFilterDept] = useState<string>("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [targetDateInput, setTargetDateInput] = useState("2026-07-15");
  const [targetTimeInput, setTargetTimeInput] = useState("00:00");
  const [isDateSaved, setIsDateSaved] = useState(false);
  const [isPortalForceUnlocked, setIsPortalForceUnlocked] = useState(false);
  useEffect(() => {
    setHasMounted(true);
    const savedDateRaw = localStorage.getItem("ecell_recruitment_launch_date") || "2026-07-15T00:00:00";
    const [datePart, timePart] = savedDateRaw.split("T");
    if (datePart) setTargetDateInput(datePart);
    if (timePart) setTargetTimeInput(timePart.substring(0, 5));
    const currentOverrideState = localStorage.getItem("ecell_admin_override_unlocked") === "true";
    setIsPortalForceUnlocked(currentOverrideState);
    if (isAuthenticated) {
      fetchSpreadsheetData();
    }
  }, [isAuthenticated]);
  const fetchSpreadsheetData = async () => {
    setIsLoading(true);
    try {
      const localRegistry = localStorage.getItem("ecell_submissions_backup_tree");
      if (localRegistry) {
        setSubmissions(JSON.parse(localRegistry));
      }
    } catch (err) {
      console.error("Failed to rehydrate analytics table tree.", err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleTogglePortalGate = () => {
    const nextState = !isPortalForceUnlocked;
    setIsPortalForceUnlocked(nextState);
    localStorage.setItem("ecell_admin_override_unlocked", nextState.toString());
  };
  const handleWipeLeaderboardDatabase = async () => {
    const confirmStep1 = confirm("⚠️ CRITICAL SECURITY WARNING:\nYou are about to execute a complete database wipe. This will permanently delete ALL applicant metrics, score tracking rows, and essay responses from your live Google Sheet. Proceed?");
    if (confirmStep1) {
      const confirmStep2 = confirm("FINAL CONFIRMATION:\nThis process is completely irreversible. Are you absolutely certain you want to reset the cluster logs?");
      if (confirmStep2) {
        setIsLoading(true);
        try {
          const response = await fetch("/api/recruitment/submit-case", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: "clear_command_system_override@ecell.com",
              caseAnswer: "RESET_ALL_DATA_ROWS_IMMEDIATELY_COHORT_2026"
            })
          });
          localStorage.removeItem("ecell_submissions_backup_tree");
          setSubmissions([]);
          alert("Database Cluster Successfully Cleared! All candidate profiles have been purged.");
        } catch (err) {
          alert("Database link timed out during deletion routine. Check your script webhook connection.");
        } finally {
          setIsLoading(false);
        }
      }
    }
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
  if (!hasMounted) return <div className="min-h-screen bg-black" />;
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
            <input type="password" placeholder="System Master Access Key" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500" />
            <button type="submit" className="w-full py-2.5 bg-white text-black font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-zinc-200 transition">Verify Credentials</button>
          </form>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-black text-white py-16 px-4 md:px-8 font-sans antialiased">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-500 text-[10px] uppercase font-mono tracking-widest font-black"><ShieldCheck size={14} /> Systems Active</div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1">E-Cell Recruitment Workspace</h1>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {}
            <button onClick={handleWipeLeaderboardDatabase} disabled={isLoading} className="text-xs font-mono border border-red-500/30 bg-red-500/15 px-4 py-1.5 rounded-lg text-red-400 font-bold hover:bg-red-500/25 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40">
              <Trash2 size={13} /> WIPE SHEET ENTRIES
            </button>
            <button onClick={fetchSpreadsheetData} disabled={isLoading} className="text-xs font-mono border border-white/10 bg-white/5 px-4 py-1.5 rounded-lg text-white font-bold hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40">
              {isLoading ? "Syncing Workspace..." : "🔄 Refresh Data"}
            </button>
            <button onClick={() => window.location.href = "/recruitment"} className="text-xs font-mono border border-white/10 bg-white/5 px-3 py-1.5 rounded-lg text-white/60 hover:text-white transition flex items-center gap-1.5 shrink-0 cursor-pointer"><ArrowLeft size={14} /> Return Portal</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`border rounded-2xl p-6 space-y-4 shadow-xl transition-all duration-300 ${isPortalForceUnlocked ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-zinc-950 border-white/10'}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold uppercase font-mono tracking-wider text-white/80">Manual System Gate Switch</div>
                <p className="text-[11px] text-white/40">Force open or slam shut student portal routes instantly.</p>
              </div>
              {isPortalForceUnlocked ? <Unlock className="text-emerald-400" size={24} /> : <Lock className="text-zinc-500" size={24} />}
            </div>
            <button onClick={handleTogglePortalGate} className={`w-full py-3 rounded-xl font-mono text-[10px] uppercase font-black tracking-widest transition-all duration-300 shadow-lg cursor-pointer ${isPortalForceUnlocked ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-emerald-500 text-black hover:bg-emerald-600'}`}>
              {isPortalForceUnlocked ? "🚨 Force Lock Recruitment Portal" : "🔓 Force Open Recruitment Portal"}
            </button>
          </div>
          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase font-mono text-white/80"><CalendarIcon size={16} className="text-blue-500" /> Automated Calendar Clock Setup</div>
            <form onSubmit={handleUpdateLaunchDate} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={targetDateInput} onChange={(e) => setTargetDateInput(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500 block dark:[color-scheme:dark]" />
                <input type="time" value={targetTimeInput} onChange={(e) => setTargetTimeInput(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500 block dark:[color-scheme:dark]" />
              </div>
              <button type="submit" className={`w-full py-2.5 text-[10px] uppercase tracking-wider font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${isDateSaved ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}><Save size={12} /> {isDateSaved ? "Target Sync Locked" : "Commit Date Sequence"}</button>
            </form>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-950 border border-white/10 p-4 rounded-xl flex items-center justify-between">
            <div><span className="text-[9px] font-mono uppercase text-white/40 block">Total Applicants</span><span className="text-xl font-mono font-black mt-1 block">{submissions.length}</span></div>
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
        <div className="flex gap-2 border-b border-white/5 pb-4">
          {["all", "ops", "media", "spons"].map((tab) => (
            <button key={tab} onClick={() => setFilterDept(tab)} className={`px-4 py-2 rounded-xl border text-xs font-mono uppercase font-bold transition cursor-pointer ${filterDept === tab ? 'bg-blue-500/10 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}>{tab === "all" ? "Global Cluster" : tab === "ops" ? "Ops/Tech/Fin" : tab === "media" ? "Media" : "Sponsorship"}</button>
          ))}
        </div>
        <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden">
          {filteredData.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-white/30">No candidate records logged inside this sector node loop. Click refresh to query Google Sheets.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-white/40 font-bold uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">Rank</th>
                    <th className="p-4">Applicant Tracking Info</th>
                    <th className="p-4">Department Node</th>
                    <th className="p-4 text-center">Round 1 Core</th>
                    <th className="p-4 text-center">Evaluation Folder</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, idx) => (
                    <React.Fragment key={item.id || idx}>
                      <tr className="border-b border-white/5 hover:bg-white/[0.01] transition group">
                        <td className="p-4 text-center font-black text-white/30 group-hover:text-blue-500 transition">#{idx + 1}</td>
                        <td className="p-4">
                          <div className="font-bold text-white text-sm">{item.name}</div>
                          <div className="text-white/40 text-[10px] mt-0.5">{item.email}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 border rounded uppercase text-[10px] font-bold ${item.dept === "ops" ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' : item.dept === "media" ? 'bg-purple-500/5 border-purple-500/20 text-purple-400' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'}`}>{item.dept === "ops" ? "Ops/Tech/Fin" : item.dept === "media" ? "Media" : "Sponsorship"}</span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="text-sm font-black text-blue-400">{item.score} <span className="text-[10px] text-white/30 font-medium">/ 100</span></div>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)} className="px-2 py-1 bg-white/5 border border-white/10 text-white font-bold rounded hover:bg-white/10 transition text-[10px] uppercase flex items-center gap-1 mx-auto cursor-pointer">
                            <FileText size={11} /> Inspect Packets {expandedRow === item.id ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                          </button>
                        </td>
                      </tr>
                      {expandedRow === item.id && (
                        <tr className="bg-zinc-900/30 border-b border-white/10">
                          <td colSpan={5} className="p-6 space-y-5">
                            <div className="space-y-2">
                              <div className="text-[10px] text-blue-400 font-bold tracking-widest uppercase flex items-center gap-1"><HelpCircle size={12}/> Round 1 MCQ Audit Log</div>
                              {item.round1Choices && item.round1Choices.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                                  {item.round1Choices.map((choice, cIdx) => (
                                    <div key={cIdx} className="bg-black/50 border border-white/5 p-2.5 rounded-lg text-white/70 flex gap-2">
                                      <span className="text-blue-500 font-bold">Q{cIdx + 1}:</span>
                                      <span className="italic">"{choice}"</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-[11px] text-white/30 italic">
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="text-[10px] text-amber-500 font-bold tracking-widest uppercase flex items-center gap-1"><CheckSquare size={12}/> Round 2 Case Resolution Response</div>
                              {item.caseAnswer ? (
                                <div className="bg-black/50 border border-white/5 rounded-xl p-4 text-xs text-white/80 leading-relaxed italic">"{item.caseAnswer}"</div>
                              ) : (
                                <div className="text-[11px] text-white/30 italic">
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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