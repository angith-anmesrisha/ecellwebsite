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
}

export default function RecruitmentPortal() {
  const [hasMounted, setHasMounted] = useState(false);
  const [portalPhase, setPortalPhase] = useState<
    "LOCKED" | "REGISTRATION_OPEN" | "COMPLETED"
  >("LOCKED");
  const [isBypassed, setIsBypassed] = useState(false);

  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(
    null,
  );
  const [currentRound, setCurrentRound] = useState<1 | 2>(1);
  const [quizFinished, setQuizFinished] = useState(false);
  const [round1Passed, setRound1Passed] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    const checkLockStatus = async () => {
      if (isBypassed) {
        setPortalPhase("REGISTRATION_OPEN");
        return;
      }

      let serverPhase = "LOCKED";
      try {
        const res = await fetch("/api/recruitment/admin");
        const data = await res.json();
        if (data.success) {
          serverPhase = data.phase;
          if (serverPhase === "OPEN" || serverPhase === "REGISTRATION_OPEN") {
            setPortalPhase("REGISTRATION_OPEN");
            return;
          }
          if (serverPhase === "COMPLETED") {
            setPortalPhase("COMPLETED");
            return;
          }
        }
      } catch (err) {}

      setPortalPhase("LOCKED");
    };

    checkLockStatus();
    const intervalNode = setInterval(checkLockStatus, 1000);

    const cachedUserRaw = localStorage.getItem(
      "ecell_active_candidate_session",
    );
    if (cachedUserRaw) {
      const parsedCandidate = JSON.parse(cachedUserRaw) as Candidate;
      setActiveCandidate(parsedCandidate);

      const progressCache = localStorage.getItem(
        `ecell_progress_${parsedCandidate.id}`,
      );
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
  }, [currentRound, isBypassed]);

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
