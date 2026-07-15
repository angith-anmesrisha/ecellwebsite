"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  dept: "ops" | "media" | "spons";
}

interface QuizProps {
  activeCandidate: Candidate;
  quizFinished: boolean;
  setQuizFinished: (f: boolean) => void;
  round1Passed: boolean;
  setRound1Passed: (p: boolean) => void;
  setCurrentRound: (r: 1 | 2) => void;
}

export default function RecruitmentSituationalQuiz({
  activeCandidate,
  quizFinished,
  setQuizFinished,
  round1Passed,
  setRound1Passed,
  setCurrentRound,
}: QuizProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [runningScore, setRunningScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quizQuestions = [
    {
      q: "A high-priority cross-functional team is lagging because two senior vertical managers disagree sharply on resource allocation. What is your intervention framework?",
      options: [
        "Convene an immediate alignment sync to map operational dependencies, establish objective trade-offs, and reset core team KPIs.",
        "Escalate the internal friction directly to the Advisory Board panel without facilitating a preliminary consensus room.",
        "Allow the teams to self-navigate the friction organically, delaying project timelines to preserve cross-team comfort.",
      ],
    },
    {
      q: "A key external corporate partner demands an unscheduled overhaul of the agreed event branding deliverables 72 hours before launch, threatening to withdraw commercial support.",
      options: [
        "Assess parallel strategic alternatives, prepare a high-value data-backed compromise deck, and leverage long-term partnership equity.",
        "Accede completely to the resource expansion request immediately, absorbing a substantial and unbudgeted deficit.",
        "Refuse the request flatly, risking the immediate collapse of the relationship and public partner attrition.",
      ],
    },
    {
      q: "An unexpected regulatory or administrative change freezes 30% of your operational budget mid-way through an intensive campaign execution loop.",
      options: [
        "Conduct a rapid variance analysis, isolate non-essential spend lines, reallocate working capital to core deliverables, and issue transparent stakeholder communications.",
        "Halt all program verticals silently until a formal appeals committee review can be scheduled.",
        "Maintain current expenditure run-rates blindly and assume additional cash lines will open up later.",
      ],
    },
    {
      q: "How do you systematically allocate a highly constrained marketing and execution budget across multiple competitive internal department initiatives?",
      options: [
        "Deploy a prioritization matrix scoring deliverables based on projected customer lifetime value, direct conversion pipelines, and core strategic alignment.",
        "Divide the available discretionary capital completely evenly across all tracks, regardless of explicit structural ROI variances.",
        "Disburse resources on a first-come, first-served basis to favor the fastest-moving teams.",
      ],
    },
  ];

  const handleAnswerSelection = async (selectedOptionIdx: number) => {
    const updatedIndices = [...selectedIndices, selectedOptionIdx];
    setSelectedIndices(updatedIndices);

    if (currentQuestionIdx + 1 < quizQuestions.length) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/recruitment/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: activeCandidate.name,
            email: activeCandidate.email,
            dept: activeCandidate.dept,
            round1Choices: updatedIndices,
          }),
        });

        const auditData = await response.json();
        if (auditData.success) {
          setRunningScore(auditData.score);
          setQuizFinished(true);

          if (auditData.passedRound1) {
            setRound1Passed(true);
            setCurrentRound(2);
          }
        } else {
          alert(auditData.error || "Submission rejected by server.");
        }
      } catch (err) {
        alert("Server validation failure. Re-querying database state nodes.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (quizFinished && !round1Passed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-zinc-950 border border-red-500/20 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto font-mono"
      >
        <AlertTriangle className="text-red-500 mx-auto" size={36} />
        <div className="space-y-1">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">
            Evaluation Threshold Not Met
          </h3>
          <p className="text-xs text-white/40">
            Your final score is: {runningScore !== null ? `${runningScore}/100` : "0/100"}. 
            The minimum qualification requirement to pass this round is 40 points.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
    >
      <div className="p-5 border-b border-white/10 bg-white/[0.01] flex justify-between items-center font-mono text-[10px] text-white/40 uppercase tracking-widest">
        <span>Strategic Evaluation Section</span>
        <span className="font-bold text-white">
          Question {currentQuestionIdx + 1} of {quizQuestions.length}
        </span>
      </div>
      <div className="p-6 space-y-6">
        <h3 className="text-sm font-medium font-mono text-white/90 leading-relaxed">
          {quizQuestions[currentQuestionIdx].q}
        </h3>
        <div className="flex flex-col gap-2.5 pt-2">
          {quizQuestions[currentQuestionIdx].options.map((opt, i) => (
            <button
              key={i}
              disabled={isSubmitting}
              onClick={() => handleAnswerSelection(i)}
              className="w-full text-left p-4 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-mono text-white/70 leading-normal hover:bg-blue-500/5 hover:border-blue-500/30 hover:text-white transition cursor-pointer disabled:opacity-50"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}