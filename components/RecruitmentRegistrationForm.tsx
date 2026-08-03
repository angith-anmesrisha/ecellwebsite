"use client";

import React, { useState } from "react";
import { UserPlus } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  dept: "ops" | "media" | "spons";
  status?: string;
}

interface RegFormProps {
  setActiveCandidate: (c: Candidate | null) => void;
  setCurrentRound: (r: 1 | 2) => void;
  setQuizFinished: (f: boolean) => void;
  setRound1Passed: (p: boolean) => void;
}

export default function RecruitmentRegistrationForm({
  setActiveCandidate,
  setCurrentRound,
  setQuizFinished,
  setRound1Passed,
}: RegFormProps) {
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regDept, setRegDept] = useState<"ops" | "media" | "spons">("ops");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileAttachmentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        alert(
          "Invalid file format. Please attach a formal document copy formatted exclusively as a PDF.",
        );
        e.target.value = "";
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        alert(
          "File size bounds exceeded. Please compress your resume document sheet below 4MB.",
        );
        e.target.value = "";
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRegisterCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) return;
    setIsSubmitting(true);

    try {
      // 1. Convert attached resume file into Base64 synchronously on submit
      let base64Data = "";
      if (selectedFile) {
        base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const rawResult = reader.result as string;
            resolve(rawResult.split(",")[1]);
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(selectedFile);
        });
      }

      // 2. Check initial eligibility / returning session state
      const eligibilityRes = await fetch("/api/recruitment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check-initial-eligibility",
          email: regEmail.trim().toLowerCase(),
        }),
      });

      const eligibilityData = await eligibilityRes.json();
      
      if (eligibilityRes.ok && eligibilityData.success && eligibilityData.isExistingSession) {
        const restoredCandidate: Candidate = {
          id: eligibilityData.candidate.regId || eligibilityData.candidate.id,
          name: eligibilityData.candidate.name,
          email: eligibilityData.candidate.email,
          dept: regDept,
          status: eligibilityData.candidate.status || "PENDING",
        };
        localStorage.setItem(
          "ecell_active_candidate_session",
          JSON.stringify(restoredCandidate),
        );
        localStorage.setItem(
          `ecell_progress_${restoredCandidate.id}`,
          JSON.stringify(eligibilityData.progress),
        );
        setActiveCandidate(restoredCandidate);
        if (eligibilityData.progress.passed) {
          setQuizFinished(true);
          setRound1Passed(true);
          setCurrentRound(2);
        }
        return;
      }

      // 3. Register new profile with full payload including resume file stream
      const generatedId = "cand_" + Math.random().toString(36).substring(2, 11);
      const resumeName = selectedFile
        ? `${regName.trim().replace(/\s+/g, "_")}_Resume.pdf`
        : "Candidate_Resume.pdf";

      await fetch("/api/recruitment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register-new-profile",
          id: generatedId,
          name: regName.trim(),
          email: regEmail.trim().toLowerCase(),
          dept: regDept,
          resumeFileBase64: base64Data,
          resumeFileName: resumeName,
        }),
      });

      const newCandidate: Candidate = {
        id: generatedId,
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        dept: regDept,
        status: "PENDING",
      };

      localStorage.setItem(
        "ecell_active_candidate_session",
        JSON.stringify(newCandidate),
      );
      setActiveCandidate(newCandidate);

    } catch (err) {
      console.error("Registration error:", err);
      const generatedId = "cand_" + Math.random().toString(36).substring(2, 11);
      const offlineCandidate: Candidate = {
        id: generatedId,
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        dept: regDept,
        status: "PENDING",
      };
      localStorage.setItem(
        "ecell_active_candidate_session",
        JSON.stringify(offlineCandidate),
      );
      setActiveCandidate(offlineCandidate);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 md:p-8 max-w-md mx-auto space-y-6 shadow-2xl">
      <div className="space-y-1 text-center font-mono">
        <UserPlus className="text-blue-500 mx-auto mb-1" size={28} />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Create Application Profile
        </h3>
        <p className="text-[11px] text-white/40">
          Enter your official details below to initialize your application.
        </p>
      </div>
      <form onSubmit={handleRegisterCandidate} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-mono text-white/40 tracking-wider">
            Your Full Name
          </label>
          <input
            required
            type="text"
            value={regName}
            onChange={(e) => setRegName(e.target.value)}
            placeholder="e.g., Angith V Shaji"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-mono text-white/40 tracking-wider">
            Email Address
          </label>
          <input
            required
            type="email"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
            placeholder="name@domain.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-mono text-white/40 tracking-wider">
            Attach Professional Resume / Curriculum Vitae (PDF Only)
          </label>
          <input
            required
            type="file"
            accept=".pdf"
            onChange={handleFileAttachmentChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-white/60 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-mono file:bg-blue-500/20 file:text-blue-400 file:cursor-pointer cursor-pointer hover:file:bg-blue-500/30 transition"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-mono text-white/40 tracking-wider">
            Select Department Track
          </label>
          <select
            value={regDept}
            onChange={(e) => setRegDept(e.target.value as any)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="ops">OPS VERTICAL</option>
            <option value="media">PR & MEDIA CELL</option>
            <option value="spons">CORPORATE ALLIANCES</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-white text-black font-mono font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-zinc-200 transition"
        >
          {isSubmitting ? "Processing..." : "Start Assessment"}
        </button>
      </form>
    </div>
  );
}