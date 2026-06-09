"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, Send, ArrowRight, Lock, UserPlus, CheckCircle2, Cpu } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  dept: "ops" | "media" | "spons";
}

export default function RecruitmentPortal() {
  const [hasMounted, setHasMounted] = useState(false);
  
  // Recruitment Phase Management States
  const [portalPhase, setPortalPhase] = useState<"LOCKED" | "REGISTRATION_OPEN" | "COMPLETED">("LOCKED");
  const [daysRemaining, setDaysRemaining] = useState("00");
  const [hoursRemaining, setHoursRemaining] = useState("00");
  const [minutesRemaining, setMinutesRemaining] = useState("00");
  const [secondsRemaining, setSecondsRemaining] = useState("00");
  const [bypassInput, setBypassInput] = useState("");
  const [isBypassed, setIsBypassed] = useState(false);

  // Registration Form States
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regDept, setRegDept] = useState<"ops" | "media" | "spons">("ops");
  
  // Assessment Progress States
  const [currentRound, setCurrentRound] = useState<1 | 2>(1);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [runningScore, setRunningScore] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [round1Passed, setRound1Passed] = useState(false);
  
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [assembledScenario, setAssembledScenario] = useState("");
  const [userR2Submission, setUserR2Submission] = useState("");
  const [r2Completed, setR2Completed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quizQuestions = [
    {
      q: "A high-priority cross-functional team is lagging because two senior vertical managers disagree sharply on resource allocation. What is your intervention framework?",
      options: [
        "Convene an immediate alignment sync to map operational dependencies, establish objective trade-offs, and reset core team KPIs.",
        "Escalate the internal friction directly to the Advisory Board panel without facilitating a preliminary consensus room.",
        "Allow the teams to self-navigate the friction organically, delaying project timelines to preserve cross-team comfort."
      ]
    },
    {
      q: "A key external corporate partner demands an unscheduled overhaul of the agreed event branding deliverables 72 hours before launch, threatening to withdraw commercial support.",
      options: [
        "Assess parallel strategic alternatives, prepare a high-value data-backed compromise deck, and leverage long-term partnership equity.",
        "Accede completely to the resource expansion request immediately, absorbing a substantial and unbudgeted deficit.",
        "Refuse the request flatly, risking the immediate collapse of the relationship and public partner attrition."
      ]
    },
    {
      q: "An unexpected regulatory or administrative change freezes 30% of your operational budget mid-way through an intensive campaign execution loop.",
      options: [
        "Conduct a rapid variance analysis, isolate non-essential spend lines, reallocate working capital to core deliverables, and issue transparent stakeholder communications.",
        "Halt all program verticals silently until a formal appeals committee review can be scheduled.",
        "Maintain current expenditure run-rates blindly and assume additional cash lines will open up later."
      ]
    },
    {
      q: "How do you systematically allocate a highly constrained marketing and execution budget across multiple competitive internal department initiatives?",
      options: [
        "Deploy a prioritization matrix scoring deliverables based on projected customer lifetime value, direct conversion pipelines, and core strategic alignment.",
        "Divide the available discretionary capital completely evenly across all tracks, regardless of explicit structural ROI variances.",
        "Disburse resources on a first-come, first-served basis to favor the fastest-moving teams."
      ]
    }
  ];

  const scenarioPool = {
    ops: {
      triggers: [
        "Your principal catering and venue logistics vendor abruptly declares bankruptcy due to macro supply chain disruptions",
        "A critical student volunteer cohort goes on strike over shift schedule disparities during a multi-tier national summit",
        "The primary campus venue faces an administrative double-booking conflict with a government delegation"
      ],
      escalations: [
        "exactly 12 hours before 500+ premium executive delegates arrive for the national startup cohort intake cycle",
        "leaving your core execution cell with a massive resource deficit while registration lines are already queuing outside",
        "right at the peak hour of an intensive corporate networking dinner window"
      ],
      constraints: [
        "Outline a 3-stage business continuity and operational turnaround plan that coordinates emergency resource mobilization without exceeding working capital baseline rules.",
        "Draft an emergency resource reallocation blueprint and a contingency operational flow model that preserves stakeholder satisfaction under zero budget expansion.",
        "Detail your operational fallback roadmap, resource staging plan, and strategic guest service mitigation protocol."
      ]
    },
    media: {
      triggers: [
        "An official marketing asset with an incorrect designation and an inverted national corporate logo is printed and widely distributed",
        "A rogue PR agency partner leaks an unapproved, highly confidential internal benchmarking dataset to public media channels",
        "A major branding campaign triggers public criticism online due to a highly sensitive cultural misinterpretation"
      ],
      escalations: [
        "right after gaining viral traction and high student interaction metrics across college chat loops",
        "less than 24 hours before your chief guest and key advisory stakeholders arrive for the annual gala event",
        "threatening to trigger an active institutional public relations crisis and stakeholder attrition"
      ],
      constraints: [
        "Outline your 3-stage corporate communication crisis strategy, narrative response script, and media damage-control playbook.",
        "Draft the exact executive corrective statement copy and map out a strict internal branding validation workflow to insulate institutional goodwill.",
        "Provide your strategic brand positioning recovery framework, stakeholder communication script, and a narrative management roadmap."
      ]
    },
    spons: {
      triggers: [
        "Your anchor financial partner abruptly slashes their committed corporate grant node by 40% due to board restructuring",
        "A key corporate sponsor demands exclusive speaking slots and immediate access to candidate database logs against institutional privacy rules",
        "The primary banking partner freezes event operational capital due to a compliance verification deadlock"
      ],
      escalations: [
        "exactly 48 hours before non-refundable vendor staging payments must be legally settled",
        "leaving a critical cash gap that directly threatens your capacity to deliver core event modules",
        "just as your executive team locks down formal operational delivery timelines"
      ],
      constraints: [
        "Draft a high-leverage emergency corporate pitch offering premium, value-add tier benefits to alternative enterprise pipeline leads.",
        "Outline a strategic budget restructuring framework that preserves high-value partner retention without sacrificing asset delivery nodes.",
        "Detail your alternative monetisation roadmap and draft an emergency commercial value incentive pitch to secure rapid micro-grants."
      ]
    }
  };

  useEffect(() => {
    setHasMounted(true);

    const checkLockStatus = () => {
      // 1. Check if an administrator enabled the local command bypass
      const isManualBypass = localStorage.getItem("ecell_admin_override_unlocked") === "true";
      if (isManualBypass || isBypassed) {
        setPortalPhase("REGISTRATION_OPEN");
        return;
      }

      // 2. Read the current status flag controlled by the admin panel
      // Valid phase choices: "LOCKED" (Show Countdown), "OPEN" (Show Quiz Form), "COMPLETED" (Show Results Link)
      const currentConfigPhase = localStorage.getItem("ecell_recruitment_phase") || "LOCKED";
      
      if (currentConfigPhase === "OPEN") {
        setPortalPhase("REGISTRATION_OPEN");
        return;
      }
      
      if (currentConfigPhase === "COMPLETED") {
        setPortalPhase("COMPLETED");
        return;
      }

      // 3. Fallback: Run standard countdown timer if explicitly locked
      setPortalPhase("LOCKED");
      const targetLaunchRaw = localStorage.getItem("ecell_recruitment_launch_date") || "2026-07-15T00:00:00";
      const targetTime = new Date(targetLaunchRaw).getTime();
      const currentTime = new Date().getTime();
      const difference = targetTime - currentTime;

      if (difference <= 0) {
        setPortalPhase("REGISTRATION_OPEN");
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        
        setDaysRemaining(d < 10 ? `0${d}` : `${d}`);
        setHoursRemaining(h < 10 ? `0${h}` : `${h}`);
        setMinutesRemaining(m < 10 ? `0${m}` : `${m}`);
        setSecondsRemaining(s < 10 ? `0${s}` : `${s}`);
      }
    };

    checkLockStatus();
    const intervalNode = setInterval(checkLockStatus, 1000);

    const cachedUserRaw = localStorage.getItem("ecell_active_candidate_session");
    if (cachedUserRaw) {
      const parsedCandidate = JSON.parse(cachedUserRaw) as Candidate;
      setActiveCandidate(parsedCandidate);

      const progressCache = localStorage.getItem(`ecell_progress_${parsedCandidate.id}`);
      if (progressCache) {
        const parsedProgress = JSON.parse(progressCache);
        setQuizFinished(true);
        setRunningScore(parsedProgress.score);
        if (parsedProgress.passed) {
          setRound1Passed(true);
          setCurrentRound(2);
        }
      }

      const existingR2Log = localStorage.getItem(`ecell_r2_submission_${parsedCandidate.id}`);
      if (existingR2Log) {
        setUserR2Submission(existingR2Log);
        setR2Completed(true);
      }
    }

    return () => clearInterval(intervalNode);
  }, [currentRound, isBypassed]);

  useEffect(() => {
    if (activeCandidate && round1Passed) {
      const generateDeterministicIndex = (str: string, poolSize: number) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash) % poolSize;
      };

      const pools = scenarioPool[activeCandidate.dept];
      const tIdx = generateDeterministicIndex(activeCandidate.id + "t", pools.triggers.length);
      const eIdx = generateDeterministicIndex(activeCandidate.email + "e", pools.escalations.length);
      const cIdx = generateDeterministicIndex(activeCandidate.id + activeCandidate.email, pools.constraints.length);

      setAssembledScenario(`CRITICAL INCIDENT: ${pools.triggers[tIdx]}, ${pools.escalations[eIdx]}. \n\nSTRATEGIC INSTRUCTION: ${pools.constraints[cIdx]}`);
    }
  }, [activeCandidate, round1Passed]);

  if (!hasMounted) return <div className="min-h-screen bg-black" />;
  const currentWords = userR2Submission.trim() === "" ? 0 : userR2Submission.trim().split(/\s+/).length;

  const handleBypassCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBypassInput(val);
    if (val === "ecelladmin2026") {
      setIsBypassed(true);
      setPortalPhase("REGISTRATION_OPEN");
    }
  };

  const handleRegisterCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) return;

    const newCandidate: Candidate = {
      id: "cand_" + Math.random().toString(36).substring(2, 11),
      name: regName,
      email: regEmail,
      dept: regDept
    };

    localStorage.setItem("ecell_active_candidate_session", JSON.stringify(newCandidate));
    setActiveCandidate(newCandidate);
  };

  const handleAnswerSelection = async (selectedOptionIdx: number) => {
    const updatedIndices = [...selectedIndices, selectedOptionIdx];
    setSelectedIndices(updatedIndices);

    if (currentQuestionIdx + 1 < quizQuestions.length) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      if (!activeCandidate) return;
      setIsSubmitting(true);

      try {
        const response = await fetch("/api/recruitment/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: activeCandidate.name,
            email: activeCandidate.email,
            dept: activeCandidate.dept,
            round1Choices: updatedIndices
          })
        });

        const auditData = await response.json();

        if (auditData.success) {
          setRunningScore(auditData.score);
          setQuizFinished(true);

          localStorage.setItem(`ecell_progress_${activeCandidate.id}`, JSON.stringify({
            score: auditData.score,
            passed: auditData.passedRound1
          }));

          const localLogTree = JSON.parse(localStorage.getItem("ecell_submissions_backup_tree") || "[]");
          localLogTree.push({
            id: activeCandidate.id,
            name: activeCandidate.name,
            email: activeCandidate.email,
            dept: activeCandidate.dept,
            score: auditData.score,
            round1Choices: auditData.backupPayload?.round1Choices || [],
            caseAnswer: ""
          });
          localStorage.setItem("ecell_submissions_backup_tree", JSON.stringify(localLogTree));

          if (auditData.passedRound1) {
            setRound1Passed(true);
            setCurrentRound(2);
          }
        } else {
          alert(auditData.error || "Submission rejected by the server.");
        }
      } catch (err) {
        alert("Connection timeout. Please check your internet and try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmitRound2Case = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentWords < 50) {
      alert("Please write a more detailed response. Minimum requirement is 50 words.");
      return;
    }

    if (activeCandidate && confirm("Are you sure you want to lock your final answers? Submissions cannot be edited afterwards.")) {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/recruitment/submit-case", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: activeCandidate.email,
            caseAnswer: userR2Submission
          })
        });

        const resData = await response.json();
        if (resData.success) {
          localStorage.setItem(`ecell_r2_submission_${activeCandidate.id}`, userR2Submission);
          
          const localLogTree = JSON.parse(localStorage.getItem("ecell_submissions_backup_tree") || "[]");
          const syncedTree = localLogTree.map((item: any) => {
            if (item.email.toLowerCase() === activeCandidate.email.toLowerCase()) {
              return { ...item, caseAnswer: userR2Submission };
            }
            return item;
          });
          localStorage.setItem("ecell_submissions_backup_tree", JSON.stringify(syncedTree));
          
          setR2Completed(true);
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

  // PHASE 1 VIEWPORT DEPLOYMENT: COUNTDOWN TIMER BARRICADE
  if (portalPhase === "LOCKED") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 select-none antialiased">
        <div className="w-full max-w-2xl text-center space-y-10">
          <div className="flex justify-center">
            <div className="p-4 bg-zinc-950 border border-white/5 rounded-full shadow-inner">
              <Clock size={32} className="text-blue-500" />
            </div>
          </div>
          <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-white">RECRUITMENT APPLICATION PORTAL OPENING SOON</h1>
          <div className="flex justify-center items-center gap-3 md:gap-4 max-w-lg mx-auto">
            {[
              { label: "DAYS", val: daysRemaining },
              { label: "HOURS", val: hoursRemaining },
              { label: "MINUTES", val: minutesRemaining },
              { label: "SECONDS", val: secondsRemaining }
            ].map((unit, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-900/60 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden backdrop-blur-sm">
                  <span className="text-xl md:text-2xl font-mono font-black text-white tracking-tight">{unit.val}</span>
                </div>
                <span className="text-[9px] font-mono font-bold tracking-widest text-white/30 uppercase mt-2">{unit.label}</span>
              </div>
            ))}
          </div>
          <div className="pt-4 max-w-xs mx-auto">
            <input type="password" placeholder="Admin Passkey Override" value={bypassInput} onChange={handleBypassCheck} className="w-full text-center bg-transparent border-none text-xs font-mono tracking-widest text-white/10 placeholder-white/5 focus:outline-none focus:text-blue-500 transition-colors" autoComplete="off" />
          </div>
        </div>
      </div>
    );
  }

  // PHASE 2 VIEWPORT DEPLOYMENT: PROFESSIONAL SELECTION ROUTER DIRECTORY
  if (portalPhase === "COMPLETED") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 select-none antialiased">
        <div className="w-full max-w-2xl text-center space-y-10">
          <div className="flex justify-center">
            <div className="p-4 bg-zinc-950 border border-white/5 rounded-full shadow-inner">
              <Cpu size={32} className="text-blue-500 animate-pulse" />
            </div>
          </div>
          <div className="space-y-6">
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-wider text-white max-w-xl mx-auto leading-tight">
              PHASE 2 CASE ROUND EVALUATION NOW COMPLETE
            </h1>
            <p className="text-xs text-white/40 max-w-sm mx-auto font-mono leading-relaxed">
              The E-Cell recruitment panel has finalized performance scores across all domains.
            </p>
            <div className="pt-4">
              <button 
                type="button"
                onClick={() => window.location.href = "/results"} 
                className="px-6 py-3.5 bg-white text-black font-mono font-black uppercase text-xs tracking-widest rounded-xl hover:bg-zinc-200 transition duration-300 shadow-xl cursor-pointer"
              >
                Check Selection Status →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 3 VIEWPORT DEPLOYMENT: STUDENT SYSTEM REGISTRATION & ACTIVE CASE FORMS
  return (
    <div className="min-h-screen bg-black text-white py-16 px-4 font-sans antialiased selection:bg-blue-500/30">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <div className="text-[10px] uppercase font-mono tracking-widest bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 inline-block font-black">
            BIMTECH E-CELL OFFICIAL RECRUITMENT ASSESSMENT {isBypassed && <span className="text-red-400 ml-1">// BYPASS ACTIVE</span>}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Recruitment Entrance Dashboard</h1>
        </div>

        {!activeCandidate ? (
          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 md:p-8 max-w-md mx-auto space-y-6 shadow-2xl">
            <div className="space-y-1 text-center font-mono">
              <UserPlus className="text-blue-500 mx-auto mb-1" size={28} />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Create Application Profile</h3>
              <p className="text-[11px] text-white/40">Enter your official details below to initialize your application.</p>
            </div>
            <form onSubmit={handleRegisterCandidate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-white/40 tracking-wider">Your Full Name</label>
                <input required type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="e.g., Angith V Shaji" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-white/40 tracking-wider">Email Address</label>
                <input required type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="name@domain.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-white/40 tracking-wider">Select Department Track</label>
                <select value={regDept} onChange={(e) => setRegDept(e.target.value as any)} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono">
                  <option value="ops">Operations & Event Management</option>
                  <option value="media">Public Relations & Digital Media Brand Cell</option>
                  <option value="spons">Corporate Alliances & Sponsorship Hub</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 bg-white text-black font-mono font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-zinc-200 transition">Start Assessment</button>
            </form>
          </div>
        ) : (
          <>
            <div className="flex justify-center items-center gap-4 border-b border-white/5 pb-4 font-mono text-[10px] tracking-widest uppercase font-bold select-none">
              <div className={`flex items-center gap-1.5 ${currentRound === 1 ? "text-blue-500" : "text-white/40"}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${currentRound === 1 ? "bg-blue-500 text-black" : "bg-white/10 text-white"}`}>1</span>
                Situational Management Quiz
              </div>
              <ArrowRight size={12} className="text-white/20" />
              <div className={`flex items-center gap-1.5 ${currentRound === 2 ? "text-amber-500" : "text-white/20"}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${currentRound === 2 ? "bg-amber-500 text-black" : "bg-white/10 text-white/40"}`}>2</span>
                Case Simulation Stage
                {!round1Passed && <Lock size={10} className="text-white/20 ml-0.5" />}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {currentRound === 1 && !quizFinished ? (
                <motion.div key="round1-quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-5 border-b border-white/10 bg-white/[0.01] flex justify-between items-center font-mono text-[10px] text-white/40 uppercase tracking-widest">
                    <span>Strategic Evaluation Section</span>
                    <span className="font-bold text-white">Question {currentQuestionIdx + 1} of {quizQuestions.length}</span>
                  </div>
                  <div className="p-6 space-y-6">
                    <h3 className="text-sm font-medium font-mono text-white/90 leading-relaxed">{quizQuestions[currentQuestionIdx].q}</h3>
                    <div className="flex flex-col gap-2.5 pt-2">
                      {quizQuestions[currentQuestionIdx].options.map((opt, i) => (
                        <button key={i} disabled={isSubmitting} onClick={() => handleAnswerSelection(i)} className="w-full text-left p-4 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-mono text-white/70 leading-normal hover:bg-blue-500/5 hover:border-blue-500/30 hover:text-white transition cursor-pointer disabled:opacity-50">{opt}</button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : currentRound === 1 && quizFinished && !round1Passed ? (
                <motion.div key="round1-failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-zinc-950 border border-red-500/20 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto font-mono">
                  <AlertTriangle className="text-red-500 mx-auto" size={36} />
                  <div className="space-y-1">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">Evaluation Threshold Not Met</h3>
                    <p className="text-xs text-white/40">Your final score is: {runningScore !== null ? `${runningScore}/100` : "CALCULATING..."}. The minimum qualification requirement to pass this round is 40 points.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="round2-case" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                  <div className="p-5 border-b border-white/10 bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-amber-500 uppercase">
                      <AlertTriangle size={14} className="animate-bounce" /> Round 2: Active Case Simulation
                    </div>
                    <div className="text-[10px] font-mono uppercase bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Track: {activeCandidate.dept.toUpperCase()} Vertical</div>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] font-black tracking-widest uppercase text-amber-400"><Clock size={12} /> Assigned Simulation Challenge Prompts:</div>
                      <p className="text-xs text-white/90 leading-relaxed font-mono whitespace-pre-line">{assembledScenario}</p>
                    </div>

                    {!r2Completed ? (
                      <form onSubmit={handleSubmitRound2Case} className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] uppercase font-mono text-white/40 tracking-wider">
                            <label className="font-bold flex items-center gap-1">Your Proposed Solution Plan</label>
                            <span className={currentWords < 50 ? "text-amber-500" : "text-emerald-400"}>{currentWords} / Min 50 Words</span>
                          </div>
                          <textarea disabled={isSubmitting} required rows={6} value={userR2Submission} onChange={(e) => setUserR2Submission(e.target.value)} placeholder="Outline your immediate response plan, strategic communication, resource deployment updates, and risk mitigation strategies..." className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-500 font-mono resize-none leading-relaxed disabled:opacity-50" />
                        </div>
                        <button type="submit" disabled={currentWords < 50 || isSubmitting} className="w-full py-2.5 bg-white text-black text-[10px] font-mono tracking-widest font-black uppercase rounded-xl flex items-center justify-center gap-2 transition hover:bg-zinc-200 disabled:opacity-20 cursor-pointer"><Send size={12} /> Save Solution Framework</button>
                      </form>
                    ) : (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 text-center space-y-2 font-mono">
                        <CheckCircle2 className="text-emerald-500 mx-auto" size={32} />
                        <h4 className="text-white text-xs uppercase font-bold tracking-wider">Solution Locked and Logged</h4>
                        <p className="text-[11px] text-white/40 max-w-sm mx-auto">Your answer documentation has been safely submitted to the admin interview dashboard panels.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <div className="pt-8 text-center font-mono text-[9px] text-white/5 hover:text-white/20 transition-colors select-none">
          <button type="button" onClick={() => window.location.href = "/admin"} className="hover:underline cursor-pointer">// Open Executive Admin Portal Link //</button>
        </div>

      </div>
    </div>
  );
}