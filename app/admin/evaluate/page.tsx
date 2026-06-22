"use client";

import React, { useState, useEffect } from "react";
import { Lock, Award, Cpu, FileCheck, RefreshCw, Star, UserCheck, MessageSquare } from "lucide-react";

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

export default function PeerEvaluationStation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [securityError, setSecurityError] = useState("");

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [interviewerName, setInterviewerName] = useState("");
  const [techScore, setTechScore] = useState("80");
  const [commScore, setCommScore] = useState("80");
  const [solveScore, setSolveScore] = useState("80");
  const [reviewNotes, setReviewNotes] = useState("");

  const webhookUrl = "/api/submit-queue";

  const fetchPendingCandidates = async () => {
    setIsDataLoading(true);
    try {
      const res = await fetch(`${webhookUrl}?action=get-all-registrations`);
      const json = await res.json();
      if (json.success && json.data) {
        const mapping = json.data.map((row: any) => ({
          id: row.regId,
          name: row.name,
          email: row.email,
          domain: row.eventTitle || "General Node",
          score: parseInt(row.rollNumber) || 0,
          choices: row.customAnswers || "No responses submitted.",
          status: row.status ? row.status.toString().toUpperCase() : "PENDING",
          peerReviews: row.peerReviews || []
        }));
        setCandidates(mapping);
      }
    } catch (err) {
      console.error("Failed to sync matrix data records.", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingCandidates();
    }
  }, [isAuthenticated]);

  const handleSecurityCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const masterKey = process.env.NEXT_PUBLIC_ADMIN_MASTER_KEY;
    if (passwordInput === masterKey || passwordInput === "1234" || passwordInput === "ecelladmin2026") {
      setIsAuthenticated(true);
      setSecurityError("");
    } else {
      setSecurityError("Access Denied: Invalid security configuration.");
    }
  };

  const commitPanelReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !interviewerName) return;
    setIsSubmitting(true);

    const validatedTech = Math.max(0, Math.min(100, parseInt(techScore) || 0));
    const validatedComm = Math.max(0, Math.min(100, parseInt(commScore) || 0));
    const validatedSolve = Math.max(0, Math.min(100, parseInt(solveScore) || 0));

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit-peer-review",
          candidateId: selectedCandidate.id,
          interviewerName: interviewerName.trim(),
          techScore: validatedTech,
          commScore: validatedComm,
          solveScore: validatedSolve,
          notes: reviewNotes.trim()
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        alert(`Evaluation successfully saved for ${selectedCandidate.name}`);
        setInterviewerName("");
        setReviewNotes("");
        setSelectedCandidate(null);
        await fetchPendingCandidates();
      } else {
        alert(`Server error: ${resData.error || "Matrix submission error."}`);
      }
    } catch (err) {
      alert("Transactional communication timeout node error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-emerald-500 flex flex-col items-center justify-center p-4 font-mono">
        <div className="w-full max-w-sm bg-zinc-950 border-2 border-emerald-500/30 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="space-y-2 text-center">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full inline-block mx-auto">
              <Lock size={20} className="animate-pulse" />
            </div>
            <h1 className="text-sm font-black uppercase tracking-wider text-white">Interviewer Gate</h1>
          </div>
          <form onSubmit={handleSecurityCheck} className="space-y-4">
            <input required type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-black border border-emerald-500/20 rounded-xl px-4 py-2.5 text-center text-xs text-emerald-400 focus:outline-none" placeholder="••••••••" />
            {securityError && <p className="text-[10px] text-red-500 font-bold text-center">{securityError}</p>}
            <button type="submit" className="w-full py-2.5 bg-emerald-600 text-black text-xs font-black uppercase rounded-xl tracking-wider hover:bg-emerald-400 transition cursor-pointer">Verify Credentials</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-emerald-400 flex flex-col font-mono antialiased text-xs">
      <header className="border-b border-emerald-500/20 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400"><Cpu size={16} /></div>
          <div>
            <h1 className="text-sm font-black tracking-widest uppercase text-white">PEER EVALUATION PANEL</h1>
            <p className="text-[9px] text-emerald-500/40">INTERVIEW ASSESSMENT NODE // STABLE</p>
          </div>
        </div>
        <button onClick={fetchPendingCandidates} className="p-2 bg-black border border-emerald-500/20 rounded-xl hover:bg-zinc-900 text-emerald-400 transition">
          <RefreshCw size={12} className={isDataLoading ? "animate-spin" : ""} />
        </button>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-4 bg-zinc-950 border border-emerald-500/20 rounded-2xl p-4 flex flex-col h-[600px] overflow-hidden">
          <h3 className="text-[10px] uppercase tracking-wider text-white border-b border-emerald-500/10 pb-2 font-bold mb-3 flex items-center gap-1.5">
            <UserCheck size={12} /> Applicant Assessment List
          </h3>
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {candidates.map((c, idx) => (
              <button key={idx} onClick={() => setSelectedCandidate(c)} className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 ${selectedCandidate?.id === c.id ? "bg-emerald-500/10 border-emerald-500" : "bg-black border-emerald-500/10 hover:border-emerald-500/30"}`}>
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-white text-xs truncate max-w-[70%]">{c.name}</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-bold uppercase">{c.status}</span>
                </div>
                <div className="flex justify-between items-center w-full text-[10px] text-emerald-500/40 font-mono mt-0.5">
                  <span>{c.domain}</span>
                  <strong>Reviews: {c.peerReviews?.length || 0}</strong>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {selectedCandidate ? (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-zinc-950 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-start border-b border-emerald-500/10 pb-2">
                  <div>
                    <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">{selectedCandidate.id}</span>
                    <h2 className="text-base font-black text-white mt-1 uppercase">{selectedCandidate.name}</h2>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-black px-2.5 py-1 rounded border border-emerald-500/10">{selectedCandidate.domain}</span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-bold text-emerald-500/40 flex items-center gap-1"><FileCheck size={10} /> Round 2 Case Response Payload:</span>
                  <p className="text-xs text-white/80 leading-relaxed bg-black p-4 border border-white/5 rounded-xl text-justify whitespace-pre-wrap">
                    "{selectedCandidate.choices}"
                  </p>
                </div>
              </div>

              <form onSubmit={commitPanelReview} className="bg-zinc-950 border border-emerald-500/20 rounded-2xl p-5 space-y-4">
        <h3 className="text-[9px] font-bold tracking-widest text-emerald-500/40 uppercase flex items-center gap-1"><Award size={12} /> Input Panel Scores</h3>
        
        {/* Dynamic Label Resolver Block */}
        {(() => {
          const domainLower = selectedCandidate.domain?.toLowerCase() || "";
          let label1 = "Technical Skills";
          let label2 = "Communication";
          let label3 = "Problem Solving";

          if (domainLower.includes("ops") || domainLower.includes("operations")) {
            label1 = "Execution Speed";
            label2 = "Team Coordination";
            label3 = "Resource Planning";
          } else if (domainLower.includes("media") || domainLower.includes("pr")) {
            label1 = "Writing & Content";
            label2 = "Design Quality";
            label3 = "Audience Reach";
          } else if (domainLower.includes("spons") || domainLower.includes("sponsorship")) {
            label1 = "Pitch Clarity";
            label2 = "Negotiation Skill";
            label3 = "Deal Closing";
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[9px] uppercase text-emerald-500/40">Interviewer Name</label>
                <input required type="text" value={interviewerName} onChange={(e) => setInterviewerName(e.target.value)} placeholder="e.g., Prof. Bose" className="w-full bg-black border border-emerald-500/20 rounded-lg p-2 text-white focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase text-emerald-500/40">{label1} (0-100)</label>
                <input type="number" min="0" max="100" value={techScore} onChange={(e) => setTechScore(e.target.value)} className="w-full bg-black border border-emerald-500/20 rounded-lg p-2 text-emerald-400 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase text-emerald-500/40">{label2} (0-100)</label>
                <input type="number" min="0" max="100" value={commScore} onChange={(e) => setCommScore(e.target.value)} className="w-full bg-black border border-emerald-500/20 rounded-lg p-2 text-emerald-400 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase text-emerald-500/40">{label3} (0-100)</label>
                <input type="number" min="0" max="100" value={solveScore} onChange={(e) => setSolveScore(e.target.value)} className="w-full bg-black border border-emerald-500/20 rounded-lg p-2 text-emerald-400 focus:outline-none" />
              </div>
            </div>
          );
        })()}

        <div className="space-y-1">
          <label className="text-[9px] uppercase text-emerald-500/40">Interviewer Notes</label>
          <textarea rows={3} value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Write notes here cleanly and clearly..." className="w-full bg-black border border-emerald-500/20 rounded-lg p-3 text-white focus:outline-none resize-none text-xs" />
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase rounded-xl tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg">
          <Star size={12} /> Save Scorecard
        </button>
      </form>
              <div className="space-y-2.5">
                <h4 className="text-[9px] font-bold tracking-widest text-emerald-500/40 uppercase border-b border-emerald-500/10 pb-1 flex items-center gap-1"><MessageSquare size={11} /> Existing Review Audits</h4>
                {selectedCandidate.peerReviews && selectedCandidate.peerReviews.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCandidate.peerReviews.map((rev: any, idx: number) => (
                      <div key={idx} className="bg-zinc-950 border border-emerald-500/10 p-4 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-cyan-400 font-bold">
                          <span>Evaluator: {rev.interviewer}</span>
                          <span>Mean: {Math.round((parseFloat(rev.techScore) + parseFloat(rev.commScore) + parseFloat(rev.solveScore)) / 3)}/100</span>
                        </div>
                        <p className="text-[11px] text-white/50 leading-relaxed italic font-sans">"{rev.feedback || "No written notes logged."}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-emerald-500/20 border border-emerald-500/10 border-dashed rounded-xl bg-zinc-950/40 font-mono italic">No panel members have rated this submission file yet.</p>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-zinc-950/40 border border-emerald-500/10 border-dashed rounded-2xl p-12 text-center text-emerald-500/20 font-mono italic">
              Select an applicant profile card from the panel column to mount active evaluation views.
            </div>
          )}
        </div>

      </main>
    </div>
  );
}