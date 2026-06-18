"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, Send, CheckCircle2 } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  dept: "ops" | "media" | "spons";
}

interface CaseProps {
  activeCandidate: Candidate;
  round1Passed: boolean;
  setCurrentRound: (r: 1 | 2) => void;
}

export default function RecruitmentCaseSimulation({
  activeCandidate,
  round1Passed,
}: CaseProps) {
  const [assembledScenario, setAssembledScenario] = useState("");
  const [userR2Submission, setUserR2Submission] = useState("");
  const [r2Completed, setR2Completed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scenarioPool = {
    ops: {
      triggers: [
        "Your principal catering and venue logistics vendor abruptly declares bankruptcy due to macro supply chain disruptions",
        "A critical student volunteer cohort goes on strike over shift schedule disparities during a multi-tier national summit",
        "The primary campus venue faces an administrative double-booking conflict with a government delegation",
      ],
      escalations: [
        "exactly 12 hours before 500+ premium executive delegates arrive for the national startup cohort intake cycle",
        "leaving your core execution cell with a massive resource deficit while registration lines are already queuing outside",
        "right at the peak hour of an intensive corporate networking dinner window",
      ],
      constraints: [
        "Outline a 3-stage business continuity and operational turnaround plan that coordinates emergency resource mobilization without exceeding working capital baseline rules.",
        "Draft an emergency resource reallocation blueprint and a contingency operational flow model that preserves stakeholder satisfaction under zero budget expansion.",
        "Detail your operational fallback roadmap, resource staging plan, and strategic guest service mitigation protocol.",
      ],
    },
    media: {
      triggers: [
        "An official marketing asset with an incorrect designation and an inverted national corporate logo is printed and widely distributed",
        "A rogue PR agency partner leaks an unapproved, highly confidential internal benchmarking dataset to public media channels",
        "A major branding campaign triggers public criticism online due to a highly sensitive cultural misinterpretation",
      ],
      escalations: [
        "right after gaining viral traction and high student interaction metrics across college chat loops",
        "less than 24 hours before your chief guest and key advisory stakeholders arrive for the annual gala event",
        "threatening to trigger an active institutional public relations crisis and stakeholder attrition",
      ],
      constraints: [
        "Outline your 3-stage corporate communication crisis strategy, narrative response script, and media damage-control playbook.",
        "Draft the exact executive corrective statement copy and map out a strict internal branding validation workflow to insulate institutional goodwill.",
        "Provide your strategic brand positioning recovery framework, stakeholder communication script, and a narrative management roadmap.",
      ],
    },
    spons: {
      triggers: [
        "Your anchor financial partner abruptly slashes their committed corporate grant node by 40% due to board restructuring",
        "A key corporate sponsor demands exclusive speaking slots and immediate access to candidate database logs against institutional privacy rules",
        "The primary banking partner freezes event operational capital due to a compliance verification deadlock",
      ],
      escalations: [
        "exactly 48 hours before non-refundable vendor staging payments must be legally settled",
        "leaving a critical cash gap that directly threatens your capacity to deliver core event modules",
        "just as your executive team locks down formal operational delivery timelines",
      ],
      constraints: [
        "Draft a high-leverage emergency corporate pitch offering premium, value-add tier benefits to alternative enterprise pipeline leads.",
        "Outline a strategic budget restructuring framework that preserves high-value partner retention without sacrificing asset delivery nodes.",
        "Detail your alternative monetisation roadmap and draft an emergency commercial value incentive pitch to secure rapid micro-grants.",
      ],
    },
  };

  useEffect(() => {
    if (round1Passed) {
      const generateDeterministicIndex = (str: string, poolSize: number) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash) % poolSize;
      };

      const pools = scenarioPool[activeCandidate.dept];
      const tIdx = generateDeterministicIndex(
        activeCandidate.id + "t",
        pools.triggers.length,
      );
      const eIdx = generateDeterministicIndex(
        activeCandidate.email + "e",
        pools.escalations.length,
      );
      const cIdx = generateDeterministicIndex(
        activeCandidate.id + activeCandidate.email,
        pools.constraints.length,
      );

      setAssembledScenario(
        `CRITICAL INCIDENT: ${pools.triggers[tIdx]}, ${pools.escalations[eIdx]}. \n\nSTRATEGIC INSTRUCTION: ${pools.constraints[cIdx]}`,
      );
    }

    const existingR2Log = localStorage.getItem(
      `ecell_r2_submission_${activeCandidate.id}`,
    );
    if (existingR2Log) {
      setUserR2Submission(existingR2Log);
      setR2Completed(true);
    }
  }, [activeCandidate.id, round1Passed]);

  const currentWords =
    userR2Submission.trim() === ""
      ? 0
      : userR2Submission.trim().split(/\s+/).length;

  const handleSubmitRound2Case = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentWords < 50) {
      alert(
        "Please write a more detailed response. Minimum requirement is 50 words.",
      );
      return;
    }

    if (
      confirm(
        "Are you sure you want to lock your final answers? Submissions cannot be edited afterwards.",
      )
    ) {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/recruitment/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update-case",
            name: activeCandidate.name,
            email: activeCandidate.email,
            caseAnswer: userR2Submission,
          }),
        });

        const resData = await response.json();
        if (resData.success) {
          localStorage.setItem(
            `ecell_r2_submission_${activeCandidate.id}`,
            userR2Submission,
          );
          setR2Completed(true);
          alert(
            "Your application profile and response framework have been completely locked and verified!",
          );
        } else {
          alert(resData.error || "Failed to save your response to the server.");
        }
      } catch (err) {
        alert("Network error detected. Please resubmit your response draft.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
    >
      <div className="p-5 border-b border-white/10 bg-white/[0.01] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-amber-500 uppercase">
          <AlertTriangle size={14} className="animate-bounce" /> Round 2: Active
          Case Simulation
        </div>
        <div className="text-[10px] font-mono uppercase bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
          Track: {activeCandidate.dept.toUpperCase()} Vertical
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-black tracking-widest uppercase text-amber-400">
            <Clock size={12} /> Assigned Simulation Challenge Prompts:
          </div>
          <p className="text-xs text-white/90 leading-relaxed font-mono whitespace-pre-line">
            {assembledScenario}
          </p>
        </div>

        {!r2Completed ? (
          <form onSubmit={handleSubmitRound2Case} className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono text-white/40 tracking-wider">
                <label className="font-bold flex items-center gap-1">
                  Your Proposed Solution Plan
                </label>
                <span
                  className={
                    currentWords < 50 ? "text-amber-500" : "text-emerald-400"
                  }
                >
                  {currentWords} / Min 50 Words
                </span>
              </div>
              <textarea
                disabled={isSubmitting}
                required
                rows={6}
                value={userR2Submission}
                onChange={(e) => setUserR2Submission(e.target.value)}
                placeholder="Outline your immediate response plan, strategic communication, resource deployment updates, and risk mitigation strategies..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-500 font-mono resize-none leading-relaxed disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={currentWords < 50 || isSubmitting}
              className="w-full py-2.5 bg-white text-black text-[10px] font-mono tracking-widest font-black uppercase rounded-xl flex items-center justify-center gap-2 transition hover:bg-zinc-200 disabled:opacity-20 cursor-pointer"
            >
              <Send size={12} /> Save Solution Framework
            </button>
          </form>
        ) : (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 text-center space-y-2 font-mono">
            <CheckCircle2 className="text-emerald-500 mx-auto" size={32} />
            <h4 className="text-white text-xs uppercase font-bold tracking-wider">
              Solution Locked and Logged
            </h4>
            <p className="text-[11px] text-white/40 max-w-sm mx-auto">
              Your answer documentation has been safely submitted to the admin
              interview dashboard panels.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
