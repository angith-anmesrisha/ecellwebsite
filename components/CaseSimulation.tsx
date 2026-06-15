"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Clock, Send, ShieldCheck, FileText, Loader2 } from "lucide-react";

interface CaseSimulationProps {
  candidateId: string;
  candidateEmail: string;
  department: "ops" | "media" | "spons";
  onComplete: (caseAnswer: string) => void;
}

export default function CaseSimulation({ candidateId, candidateEmail, department, onComplete }: CaseSimulationProps) {
  const [assembledScenario, setAssembledScenario] = useState("");
  const [userSubmission, setUserSubmission] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const scenarioPool = {
    ops: {
      triggers: [
        "The flagship ticketing database crashes unexpectedly due to a sudden traffic spike",
        "The primary campus network grid faces an active server port deadlock right before launch",
        "The automated portal registration framework begins throwing unhandled 502 bad gateway errors"
      ],
      escalations: [
        "exactly 20 minutes before a high-profile international speaker begins their key address",
        "while over 500 competitive candidate check-ins are queuing up live at the gateway nodes",
        "during the peak closing minutes of a high-value campus tech sprint hackathon registration window"
      ],
      constraints: [
        "Your immediate task is to outline a 30-minute infrastructure mitigation pipeline using zero external budget overhead constraints.",
        "Draft a step-by-step traffic rerouting fallback strategy that isolates data integrity without resetting active user sessions.",
        "Detail your server failover rollout plan and specify the operational protocol for manual student verification logs."
      ]
    },
    media: {
      triggers: [
        "The core production crew accidentally pushes a high-engagement marketing video featuring a glaring typo in the Chief Guest's designation",
        "The main PR campaign asset package leaks online prematurely with outdated corporate sponsorship banners",
        "A critical social media promotional block triggers an automated platform copyright flag and goes dark"
      ],
      escalations: [
        "right after gaining viral traction and high student interaction metrics across college chat loops",
        "less than 12 hours before the official physical promotional banners go live across the greater Noida campus zone",
        "just as the official registrar cell opens up compliance evaluations for the startup cohort intake cycle"
      ],
      constraints: [
        "Outline your 3-stage PR damage-control narrative loop and detail your asset replacement execution pipeline.",
        "Draft the exact corrective statement copy and map out the internal validation workflow changes to prevent this from happening again.",
        "Provide your strategic media response framework and a layout for a rapid post-correction engagement strategy."
      ]
    },
    spons: {
      triggers: [
        "A premium-tier title corporate sponsor abruptly reduces their committed funding node by 40%",
        "A major logistics partner pulls their asset infrastructure inventory support due to internal resource shifts",
        "The primary banking gateway partner reports compliance delays, freezing event operational capital"
      ],
      escalations: [
        "exactly 48 hours before the annual entrepreneurship summit execution window kicks off",
        "just as the executive panel locks down non-refundable staging vendor vendor legal contracts",
        "leaving a critical budget gap that threatens the core venue experience deliverables"
      ],
      constraints: [
        "Draft a high-pressure corporate outreach pitch email offering a value-add tier to alternative warm pipeline leads.",
        "Outline a strategic budget restructuring framework that preserves user-experience delivery nodes.",
        "Detail your rapid asset reallocation approach and provide an incentive pitch layout to secure emergency micro-grants."
      ]
    }
  };

  useEffect(() => {
    
    const generateDeterministicIndex = (str: string, poolSize: number) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash) % poolSize;
    };

    const pools = scenarioPool[department];
    
    
    const triggerIdx = generateDeterministicIndex(candidateId + "trig", pools.triggers.length);
    const escalationIdx = generateDeterministicIndex(candidateEmail + "esc", pools.escalations.length);
    const constraintIdx = generateDeterministicIndex(candidateId + candidateEmail, pools.constraints.length);

    const compiledText = `CRITICAL INCIDENT: ${pools.triggers[triggerIdx]}, ${pools.escalations[escalationIdx]}. \n\nINSTRUCTION TASK: ${pools.constraints[constraintIdx]}`;
    setAssembledScenario(compiledText);

    
    const existingLog = localStorage.getItem(`ecell_r2_submission_${candidateId}`);
    if (existingLog) {
      setUserSubmission(existingLog);
      setIsSubmitted(true);
    }
  }, [candidateId, candidateEmail, department]);

  const handleSubmitCase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentCount = userSubmission.trim() === "" ? 0 : userSubmission.trim().split(/\s+/).length;
    if (currentCount < 50) {
      alert("Strategic solutions must be substantive. Please elaborate further to meet the minimum 50-word requirement.");
      return;
    }

    if (confirm("Lock final execution plan? Once submitted, this node cannot be re-edited.")) {
      setIsSubmitting(true);
      
      try {
        
        const response = await fetch("/api/recruitment/submit-case", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: candidateEmail,
            caseAnswer: userSubmission,
          }),
        });

        const resData = await response.json();

        if (response.ok && resData.success) {
          
          localStorage.setItem(`ecell_r2_submission_${candidateId}`, userSubmission);
          
          
          const localLogTree = JSON.parse(localStorage.getItem("ecell_submissions_backup_tree") || "[]");
          const syncedTree = localLogTree.map((item: any) => {
            if (item.email.toLowerCase() === candidateEmail.toLowerCase()) {
              return { ...item, caseAnswer: userSubmission };
            }
            return item;
          });
          localStorage.setItem("ecell_submissions_backup_tree", JSON.stringify(syncedTree));

          setIsSubmitted(true);
          onComplete(userSubmission);
        } else {
          alert(`Submission Failed: ${resData.error || "The server rejected the strategy packet configuration node."}`);
        }
      } catch (err) {
        alert("Network Handshake Fault: Unable to reach the evaluation gateway. Check your terminal connection logs and retry.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const currentWordCount = userSubmission.trim() === "" ? 0 : userSubmission.trim().split(/\s+/).length;

  if (isSubmitted) {
    return (
      <div className="w-full bg-zinc-950 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-4 font-mono max-w-2xl mx-auto">
        <ShieldCheck className="text-emerald-500 mx-auto animate-pulse" size={40} />
        <div className="space-y-1">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">Round 2 Strategy Vault Locked</h3>
          <p className="text-xs text-white/40">Your unique department operational response metrics have been logged securely.</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl text-left text-xs max-h-40 overflow-y-auto text-white/60 leading-relaxed italic select-none">
          "{userSubmission}"
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden max-w-2xl mx-auto flex flex-col font-sans shadow-2xl">
      
      {/* CARD TOP CONTROLS */}
      <div className="p-5 border-b border-white/10 bg-white/[0.01] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-amber-500 uppercase">
          <AlertTriangle size={14} className="animate-bounce" /> Round 2: Crisis Command Simulation
        </div>
        <div className="text-[10px] font-mono uppercase bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
          Node: Sector {department}
        </div>
      </div>

      <div className="p-6 space-y-5">
        
        {/* ASSEMBLED SCENARIO BOX */}
        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-black tracking-widest uppercase text-amber-400">
            <Clock size={12} /> Dynamic Prompt Manifest
          </div>
          <p className="text-xs text-white/90 leading-relaxed font-mono whitespace-pre-line">
            {assembledScenario}
          </p>
        </div>

        {/* INPUT RESPONSE FORM */}
        <form onSubmit={handleSubmitCase} className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] uppercase font-mono text-white/40 tracking-wider">
              <label className="font-bold flex items-center gap-1"><FileText size={12} /> System Resolution Plan</label>
              <span className={currentWordCount < 50 ? "text-amber-500" : "text-emerald-400"}>
                {currentWordCount} / Min 50 Words
              </span>
            </div>
            <textarea
              required
              rows={6}
              disabled={isSubmitting}
              value={userSubmission}
              onChange={(e) => setUserSubmission(e.target.value)}
              placeholder="Outline your chronological operation sequence, mitigation steps, communication strategies, and resource management pipelines..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-500 font-mono resize-none leading-relaxed disabled:opacity-40"
            />
          </div>

          <button
            type="submit"
            disabled={currentWordCount < 50 || isSubmitting}
            className="w-full py-2.5 bg-white text-black text-[10px] font-mono tracking-widest font-black uppercase rounded-xl flex items-center justify-center gap-2 transition hover:bg-zinc-200 disabled:opacity-20 select-none cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Verifying Matrix Channels...
              </>
            ) : (
              <>
                <Send size={12} /> Lock Strategic Solution Node
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}