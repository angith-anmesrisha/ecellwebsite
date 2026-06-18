"use client";

import React, { useState } from "react";
import { UserPlus } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  dept: "ops" | "media" | "spons";
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
  const [base64String, setBase64String] = useState<string>("");
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
      const reader = new FileReader();
      reader.onload = () => {
        const rawResult = reader.result as string;
        setBase64String(rawResult.split(",")[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/recruitment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check-initial-eligibility",
          email: regEmail.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Registration blocked by the safety firewall.");
        return;
      }

      if (data.success) {
        if (data.isExistingSession) {
          const restoredCandidate: Candidate = {
            id: data.candidate.regId,
            name: data.candidate.name,
            email: data.candidate.email,
            dept: regDept,
          };
          localStorage.setItem(
            "ecell_active_candidate_session",
            JSON.stringify(restoredCandidate),
          );
          localStorage.setItem(
            `ecell_progress_${restoredCandidate.id}`,
            JSON.stringify(data.progress),
          );
          setActiveCandidate(restoredCandidate);
          setQuizFinished(true);
          setRound1Passed(true);
          setCurrentRound(2);
          alert(
            `Welcome back, ${data.candidate.name}. Your verified score (${data.progress.score}/100) has been pulled from the server database. Proceeding to Case Stage.`,
          );
        } else {
          const newCandidate: Candidate = {
            id: "cand_" + Math.random().toString(36).substring(2, 11),
            name: regName.trim(),
            email: regEmail.trim().toLowerCase(),
            dept: regDept,
          };
          localStorage.setItem(
            "ecell_active_candidate_session",
            JSON.stringify(newCandidate),
          );
          localStorage.setItem(
            `ecell_resume_file_${newCandidate.id}`,
            base64String,
          );
          localStorage.setItem(
            `ecell_resume_name_${newCandidate.id}`,
            selectedFile
              ? `${newCandidate.name.replace(/\s+/g, "_")}_Resume.pdf`
              : "Candidate_Resume.pdf",
          );
          setActiveCandidate(newCandidate);
        }
      }
    } catch (err) {
      alert(
        "Network dropped during system verification. Please check your connection and retry.",
      );
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
            <option value="ops">Operations & Event Management</option>
            <option value="media">
              Public Relations & Digital Media Brand Cell
            </option>
            <option value="spons">Corporate Alliances & Sponsorship Hub</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-white text-black font-mono font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-zinc-200 transition"
        >
          Start Assessment
        </button>
      </form>
    </div>
  );
}
