"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Lock } from "lucide-react";
import dynamic from "next/dynamic";

const RegistrationForm = dynamic(
  () => import("@/components/RecruitmentRegistrationForm"),
  { ssr: false },
);
const SituationalQuiz = dynamic(
  () => import("@/components/RecruitmentSituationalQuiz"),
  { ssr: false },
);
const CaseSimulation = dynamic(
  () => import("@/components/RecruitmentCaseSimulation"),
  { ssr: false },
);
const PortalLocked = dynamic(
  () => import("@/components/RecruitmentPortalLocked"),
  { ssr: false },
);
const PortalCompleted = dynamic(
  () => import("@/components/RecruitmentPortalCompleted"),
  { ssr: false },
);

interface Candidate {
  id: string;
  name: string;
  email: string;
  dept: "ops" | "media" | "spons";
  status?: string;
}

export default function RecruitmentPortal() {
  const [hasMounted, setHasMounted] = useState(false);
  const [portalPhase, setPortalPhase] = useState<"LOCKED" | "OPEN" | "STANDBY" | "COMPLETED">("LOCKED");
  const [isBypassed, setIsBypassed] = useState(false);
  const [isHoldReleased, setIsHoldReleased] = useState(false);

  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const [currentRound, setCurrentRound] = useState<1 | 2>(1);
  const [quizFinished, setQuizFinished] = useState(false);
  const [round1Passed, setRound1Passed] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    const checkLockStatus = async () => {
      if (isBypassed) {
        setPortalPhase("OPEN");
        return;
      }

      try {
        const res = await fetch("/api/recruitment/admin");
        const data = await res.json();
        if (data.success && data.phase) {
          setPortalPhase(data.phase.toUpperCase() as any);
          setIsHoldReleased(data.holdReleased || false);
        }
      } catch (err) {}
    };

    checkLockStatus();
    const intervalNode = setInterval(checkLockStatus, 15000);

    const cachedUserRaw = localStorage.getItem("ecell_active_candidate_session");
    if (cachedUserRaw) {
      const parsedCandidate = JSON.parse(cachedUserRaw) as Candidate;
      setActiveCandidate(parsedCandidate);

      const progressCache = localStorage.getItem(`ecell_progress_${parsedCandidate.id}`);
      if (progressCache) {
        const parsedProgress = JSON.parse(progressCache);
        setQuizFinished(true);
        if (parsedProgress.passed) {
          setRound1Passed(true);
          setCurrentRound(2);
        }
      }
    }

    return () => clearInterval(intervalNode);
  }, [isBypassed]);

  if (!hasMounted) return <div className="min-h-screen bg-black" />;

  if (portalPhase === "LOCKED") {
    return (
      <PortalLocked
        isBypassed={isBypassed}
        setIsBypassed={setIsBypassed}
        setPortalPhase={setPortalPhase}
      />
    );
  }

  if (portalPhase === "COMPLETED") {
    return <PortalCompleted />;
  }

  if ((portalPhase === "STANDBY" || !isHoldReleased) && activeCandidate && !isBypassed) {
    return (
      <div className="min-h-screen w-full bg-black text-amber-500 flex flex-col items-center justify-center p-4 font-mono fixed inset-0 z-50">
        <div className="w-full max-w-md bg-zinc-950 border border-amber-500/20 rounded-2xl p-8 space-y-6 text-center shadow-2xl relative z-10">
          <div className="absolute top-3 right-4 text-[8px] text-amber-500/30 animate-pulse">● INITIALIZED</div>
          <div className="w-12 h-12 rounded-full border border-amber-500/20 bg-amber-500/5 flex items-center justify-center mx-auto text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><circle cx="12" cy="12" r="10" strokeDasharray="30 10"/></svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase text-white tracking-wider">Application Under Review</h2>
            <p className="text-[11px] text-amber-500/60 leading-relaxed">
              Hello {activeCandidate.name}, your recruitment profile has been successfully submitted. You are currently in the queue.
            </p>
          </div>
          <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-left text-[10px] space-y-1.5 text-zinc-400">
            <p>• <strong className="text-zinc-200">Staging Status:</strong> Standby Lock Active</p>
            <p>• <strong className="text-zinc-200">Requirement:</strong> The E-Cell administration needs to verify your entry before the quiz opens.</p>
          </div>
          <p className="text-[9px] text-zinc-600 animate-pulse">// The dashboard updates automatically when the admin releases your hold...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-16 px-4 font-sans antialiased selection:bg-blue-500/30">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="text-[10px] uppercase font-mono tracking-widest bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 inline-block font-black">
            BIMTECH E-CELL OFFICIAL RECRUITMENT ASSESSMENT{" "}
            {isBypassed && (
              <span className="text-red-400 ml-1">// BYPASS ACTIVE</span>
            )}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            Recruitment Entrance Dashboard
          </h1>
        </div>

        {!activeCandidate ? (
          <RegistrationForm
            setActiveCandidate={setActiveCandidate}
            setCurrentRound={setCurrentRound}
            setQuizFinished={setQuizFinished}
            setRound1Passed={setRound1Passed}
          />
        ) : (
          <>
            <div className="flex justify-center items-center gap-4 border-b border-white/5 pb-4 font-mono text-[10px] tracking-widest uppercase font-bold select-none">
              <div
                className={`flex items-center gap-1.5 ${
                  currentRound === 1 ? "text-blue-500" : "text-white/40"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                    currentRound === 1
                      ? "bg-blue-500 text-black"
                      : "bg-white/10 text-white"
                  }`}
                >
                  1
                </span>
                Situational Management Quiz
              </div>
              <ArrowRight size={12} className="text-white/20" />
              <div
                className={`flex items-center gap-1.5 ${
                  currentRound === 2 ? "text-amber-500" : "text-white/20"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                    currentRound === 2
                      ? "bg-amber-500 text-black"
                      : "bg-white/10 text-white/40"
                  }`}
                >
                  2
                </span>
                Case Simulation Stage
                {!round1Passed && (
                  <Lock size={10} className="text-white/20 ml-0.5" />
                )}
              </div>
            </div>

            {currentRound === 1 ? (
              <SituationalQuiz
                activeCandidate={activeCandidate}
                quizFinished={quizFinished}
                setQuizFinished={setQuizFinished}
                round1Passed={round1Passed}
                setRound1Passed={setRound1Passed}
                setCurrentRound={setCurrentRound}
              />
            ) : (
              <CaseSimulation
                activeCandidate={activeCandidate}
                round1Passed={round1Passed}
                setCurrentRound={setCurrentRound}
              />
            )}
          </>
        )}

        <div className="pt-8 text-center font-mono text-[9px] text-white/5 hover:text-white/20 transition-colors select-none">
          <button
            type="button"
            onClick={() => (window.location.href = "/admin")}
            className="hover:underline cursor-pointer"
          >
            // Open Executive Admin Portal Link //
          </button>
        </div>
      </div>
    </div>
  );
}