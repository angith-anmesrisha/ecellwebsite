"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, ShieldAlert } from "lucide-react";

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
}: QuizProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security & Randomization States
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<number, number>>({});
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // All 30 Universal CAT-Style Questions
  const quizQuestions = [
    { q: "During registrations, the waiting line suddenly becomes longer. What should the operations team do first?", options: ["Reduce verification steps", "Shift available volunteers", "Close new registrations", "Delay the registration process"] },
    { q: "The purpose of an event checklist is mainly to:", options: ["Promote the event", "Increase volunteer count", "Track important tasks", "Reduce event duration"] },
    { q: "A speaker is delayed by 20 minutes, and attendees are waiting. What should the team do?", options: ["Inform attendees and adjust schedule", "Remove the speaker slot", "Cancel the session completely", "Wait without updates"] },
    { q: "Which measure best indicates whether event operations were executed effectively?", options: ["Budget variance.", "Attendance count.", "Timeline adherence.", "Social engagement."] },
    { q: "After an event, reviewing operations helps the team to:", options: ["Change the event theme", "Find improvement areas", "Increase event expenses", "Reduce team size"] },
    { q: "A post receives many views but very few interactions. What does this indicate?", options: ["Strong community building", "High follower growth", "Poor internet connection", "Low audience engagement"] },
    { q: "Which metric shows how many people saw your content?", options: ["Comments", "Reach", "Saves", "Shares"] },
    { q: "The main goal of social media promotion before an event is to:", options: ["Build awareness", "Contact sponsors", "Manage finances", "Assign volunteers"] },
    { q: "An event teaser performs well initially but engagement declines each day. What is the most likely reason?", options: ["Content became repetitive.", "Audience changed platforms.", "Hashtags lost relevance.", "Reach became restricted."] },
    { q: "Consistent branding helps an organization to:", options: ["Increase attendance", "Improve recognition", "Avoid planning", "Reduce expenses"] },
    { q: "A sponsor asks why your proposal deserves consideration over another college's. Which response is strongest?", options: ["Highlight past sponsors.", "Compare event budgets.", "Present audience relevance.", "Offer lower pricing."] },
    { q: "A sponsor offers ₹50,000 but wants exclusive branding rights. Another offers ₹70,000 without exclusivity. What should you evaluate first?", options: ["Sponsor popularity", "Long-term event value", "Company employee count", "Team preference"] },
    { q: "A sponsor says they did not receive enough visibility after the event. What should the team check?", options: ["Delivered sponsor benefits", "Event decoration", "Participant opinions", "Volunteer performance"] },
    { q: "A sponsor requests additional visibility after agreements are finalized. What should happen first?", options: ["Review agreed deliverables.", "Estimate implementation cost.", "Discuss internal logistics.", "Confirm available inventory."] },
    { q: "A sponsor requests an additional benefit not mentioned earlier. What should you do?", options: ["Ignore the request", "Accept immediately", "Reject immediately", "Check feasibility first"] },
    { q: "An event budget is ₹1,00,000. The team has spent ₹85,000 and another ₹25,000 expense is pending. What should finance identify?", options: ["Budget shortage risk", "Sponsor satisfaction", "Attendance growth", "Marketing performance"] },
    { q: "An event is expected to generate ₹2,50,000 in revenue. Fixed costs are ₹1,20,000 and variable costs are estimated at ₹90,000. Which statement is most accurate?", options: ["The event cannot break even.", "The expected surplus is ₹40,000.", "Variable costs exceed fixed costs.", "Revenue depends on attendance."] },
    { q: "A vendor offers a 12% discount for immediate payment, but payment approval will take two days. What should be prioritized?", options: ["Preserve the approval process.", "Negotiate an extended offer.", "Use contingency funds.", "Delay the purchase."] },
    { q: "An event spends less money but participant experience decreases. This indicates:", options: ["Better planning", "Higher profitability", "Effective saving", "Poor cost decision"] },
    { q: "If registrations double, which expense is most likely to increase?", options: ["Speaker payment", "Participant kits", "Software subscription", "Venue booking"] },
    { q: "A registration website slows down when many users open it together. The most likely reason is:", options: ["High user traffic", "Poster resolution", "Low screen brightness", "More volunteers"] },
    { q: "Two-factor authentication improves:", options: ["Storage space", "Internet speed", "Account security", "Design quality"] },
    { q: "A team keeps losing the latest version of files. What should they use?", options: ["Offline transfers", "More duplicate files", "Shared storage system", "Separate personal folders"] },
    { q: "A Google Form automatically stores responses in a sheet. This helps with:", options: ["Video editing", "Data organization", "Poster creation", "All of the above"] },
    { q: "An API mainly helps different software systems to:", options: ["Create advertisements", "Communicate with each other", "Replace human users", "All of the above"] },
    { q: "An event receives both praise and criticism online. Which action best protects long-term credibility?", options: ["Highlight positive feedback.", "Address recurring concerns.", "Disable public comments.", "Ignore isolated criticism."] },
    { q: "The main purpose of PR is to:", options: ["Design posters", "Build relationships", "Increase expenses", "Manage accounts"] },
    { q: "Official announcements should usually be made through:", options: ["Private messages", "Random groups", "Official channels", "Personal accounts"] },
    { q: "A guest speaker withdraws six hours before the event. What communication objective becomes most important?", options: ["Minimize uncertainty.", "Protect reputation.", "Increase attendance.", "Maintain publicity."] },
    { q: "Which activity contributes most to maintaining relationships after an event?", options: ["Publishing photographs.", "Sending appreciation messages.", "Sharing volunteer feedback.", "Updating social media."] }
  ];

  // Initialize Randomization & Strict Proctoring on Mount
  useEffect(() => {
    // 1. Generate an array of index numbers [0, 1, 2... 29]
    const indices = quizQuestions.map((_, i) => i);
    
    // 2. Fisher-Yates Shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledIndices(indices);

    // 3. Hyper-Strict Proctoring: Catch ANY focus loss
    const handleFocusLoss = () => {
      // Triggers if they click outside the browser window at all
      setTabSwitchCount((prev) => prev + 1);
    };

    const handleVisibilityChange = () => {
      // Triggers if they minimize or switch tabs completely
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
      }
    };

    window.addEventListener("blur", handleFocusLoss);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleFocusLoss);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []); // Only runs once on mount

  const handleAnswerSelection = async (selectedOptionIdx: number) => {
    // Map the selected answer back to the original question index
    const originalQuestionIndex = shuffledIndices[currentQuestionIdx];
    const newAnswers = { ...answersMap, [originalQuestionIndex]: selectedOptionIdx };
    setAnswersMap(newAnswers);

    if (currentQuestionIdx + 1 < quizQuestions.length) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      setIsSubmitting(true);
      try {
        // Reconstruct the array in the exact original order for the backend grader
        const finalAnswersInOriginalOrder = quizQuestions.map((_, i) => newAnswers[i] ?? -1);

        const response = await fetch("/api/recruitment/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: activeCandidate.name,
            email: activeCandidate.email,
            dept: activeCandidate.dept,
            round1Choices: finalAnswersInOriginalOrder, // Preserves Answer Key Format
            tabSwitches: tabSwitchCount, // Submits the hyper-strict proctoring count
          }),
        });

        const auditData = await response.json();
        if (auditData.success) {
          setQuizFinished(true); // Triggers the Standby Screen in page.tsx
        } else {
          alert(auditData.error || "Submission rejected by server.");
        }
      } catch (err) {
        alert("Server validation failure. Check network.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Wait until shuffle is complete before rendering
  if (shuffledIndices.length === 0) return null;

  const currentDisplayQuestionIndex = shuffledIndices[currentQuestionIdx];
  const currentQuestionData = quizQuestions[currentDisplayQuestionIndex];

  // If they finished, show the Standby UI immediately instead of rejection/acceptance
  if (quizFinished && !round1Passed) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-zinc-950 border border-amber-500/20 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto font-mono shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/50 animate-pulse" />
        <Clock className="text-amber-500 mx-auto animate-pulse" size={36} />
        <div className="space-y-1">
          <h3 className="text-white font-black text-sm uppercase tracking-wider">Application Under Review</h3>
          <p className="text-[11px] text-amber-500/60 leading-relaxed pt-2">
            Your evaluation matrix has been securely locked and submitted to the E-Cell core systems. 
            The system is calculating percentiles across all candidates. 
            <br/><br/>
            Check back here when the Shortlist is released.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-5 border-b border-white/10 bg-white/[0.01] flex flex-col md:flex-row justify-between items-start md:items-center font-mono text-[10px] text-white/40 uppercase tracking-widest gap-2">
        <span className="flex items-center gap-1.5"><ShieldAlert size={12} className="text-blue-500" /> Negative Marking Active (+3/-1)</span>
        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
          Question {currentQuestionIdx + 1} of {quizQuestions.length}
        </span>
      </div>
      <div className="p-6 space-y-6">
        <h3 className="text-sm font-medium font-mono text-white/90 leading-relaxed">
          {currentQuestionData.q}
        </h3>
        <div className="flex flex-col gap-2.5 pt-2">
          {currentQuestionData.options.map((opt, i) => (
            <button
              key={i}
              disabled={isSubmitting}
              onClick={() => handleAnswerSelection(i)}
              className="w-full text-left p-4 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-mono text-white/70 leading-normal hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-white transition cursor-pointer disabled:opacity-50"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}