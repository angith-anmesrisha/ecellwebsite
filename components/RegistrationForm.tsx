"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { User, Mail, FileText, Loader2, Download, CheckCircle, Calendar, Users, Clock, Copy, Building2, MapPin } from "lucide-react";
import Turnstile from "./Turnstile";
import type { EventMeta, SheetEvent } from "@/lib/content-types";

interface RegistrationFormProps {
  selectedEvent: SheetEvent;
  meta?: EventMeta;
  onCancel: () => void;
}

type Outcome =
  | { kind: "registered"; passId: string; passCode: string; team?: { name: string; code: string } }
  | { kind: "waitlisted"; position: number };

const qrUrl = (code: string) => `https://quickchart.io/qr?text=${encodeURIComponent(code)}&size=220&margin=1`;

const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-nebula-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-white/50 uppercase tracking-wider text-[9px] font-bold">{label}</span>
      {children}
    </label>
  );
}

export default function RegistrationForm({ selectedEvent, meta, onCancel }: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState("");

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [college, setCollege] = useState("");
  const [city, setCity] = useState("");
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [teamMode, setTeamMode] = useState<"create" | "join">("create");
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const teamEnabled = Boolean(meta?.team.enabled);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const answers = { ...customAnswers };
    if (meta?.collectCollege) {
      answers["College"] = college.trim();
      answers["City"] = city.trim();
    }

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit-registration",
          eventId: selectedEvent.id,
          name: studentName,
          email: studentEmail,
          rollNumber,
          customAnswers: answers,
          team: teamEnabled ? (teamMode === "create" ? { mode: "create", name: teamName } : { mode: "join", code: teamCode }) : undefined,
          captchaToken,
          website: (new FormData(e.currentTarget).get("website") as string) || "",
        }),
      });

      const data = await res.json();
      if (data.success && data.waitlisted) {
        setOutcome({ kind: "waitlisted", position: data.position });
      } else if (data.success) {
        setOutcome({ kind: "registered", passId: data.registrationId, passCode: data.passCode || data.registrationId, team: data.team });
      } else {
        setError(data.error || "Registration failed. Please try again.");
        setCaptchaReset((n) => n + 1);
      }
    } catch {
      setError("Submission failed. Please check your connection and try again.");
      setCaptchaReset((n) => n + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadTicketAsImage = () => {
    if (outcome?.kind !== "registered") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, 450, 250);
    ctx.strokeStyle = "rgba(129, 140, 248, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 430, 230);

    ctx.fillStyle = "#a5b4fc";
    ctx.font = "bold 14px monospace";
    ctx.fillText("BIMTECH E-CELL OFFICIAL ENTRY PASS", 25, 40);
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(25, 55, 400, 1);

    const rows: [string, string][] = [
      ["EVENT TITLE :", selectedEvent.title.toUpperCase().slice(0, 32)],
      ["ATTENDEE    :", studentName.toUpperCase()],
      ["ROLL NUMBER :", rollNumber.toUpperCase()],
      ["DATE        :", selectedEvent.date || "EVENT DATE"],
    ];
    rows.forEach(([label, value], i) => {
      const y = 85 + i * 30;
      ctx.fillStyle = "#ffffff";
      ctx.font = "11px monospace";
      ctx.fillText(label, 25, y);
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "bold 12px monospace";
      ctx.fillText(value, 120, y);
    });

    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(25, 195, 400, 1);
    ctx.fillStyle = "#22c55e";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`PASS ID: ${outcome.passId}`, 25, 225);

    const link = document.createElement("a");
    link.download = `Pass_${outcome.passId}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addToCalendar = () => {
    if (outcome?.kind !== "registered") return;
    const formattedDate = (selectedEvent.date || "").replace(/-/g, "");
    const title = encodeURIComponent(`E-Cell: ${selectedEvent.title}`);
    const details = encodeURIComponent(`Your entry pass ID is ${outcome.passId}. Show the QR from your email or My E-Cell at the entrance.`);
    const location = encodeURIComponent(meta?.venue || "BIMTECH Campus, Greater Noida");
    window.open(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formattedDate}/${formattedDate}&details=${details}&location=${location}`,
      "_blank",
    );
  };

  if (outcome?.kind === "waitlisted") {
    return (
      <div className="bg-zinc-950 border border-amber-500/30 p-6 rounded-2xl space-y-4 text-center shadow-2xl">
        <Clock className="text-amber-400 mx-auto" size={30} />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">You&apos;re on the waitlist</h3>
        <p className="text-xs text-white/60 leading-relaxed">
          {selectedEvent.title} is full right now. You&apos;re number {outcome.position} in line. If a seat opens up, we&apos;ll email your pass to {studentEmail}.
        </p>
        <button onClick={onCancel} className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 font-bold uppercase tracking-wider text-[10px] rounded-xl transition">
          Done
        </button>
      </div>
    );
  }

  if (outcome?.kind === "registered") {
    return (
      <div className="bg-zinc-950 border border-green-500/30 p-6 rounded-2xl space-y-5 text-center shadow-2xl animate-fadeIn">
        <div className="flex flex-col items-center gap-2">
          <CheckCircle className="text-green-500" size={32} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Registration confirmed</h3>
          <p className="text-[11px] text-white/60">Your pass is on its way to {studentEmail}. You can also show this QR at the gate.</p>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrUrl(outcome.passCode)} alt={`Entry QR for pass ${outcome.passId}`} width={180} height={180} className="mx-auto rounded-xl bg-white p-2" />

        <div className="bg-black border border-white/5 p-4 rounded-xl text-left font-mono text-[11px] space-y-2">
          <p className="text-nebula-400 font-bold text-xs border-b border-white/5 pb-1.5">{"// ENTRY SLIP"}</p>
          <p><span className="text-white/60">EVENT:</span> {selectedEvent.title}</p>
          <p><span className="text-white/60">NAME:</span> {studentName}</p>
          <p><span className="text-white/60">ID:</span> {outcome.passId}</p>
        </div>

        {outcome.team && (
          <div className="bg-nebula-500/10 border border-nebula-500/30 rounded-xl p-4 text-left space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-nebula-300">Team {outcome.team.name}</p>
            <p className="text-xs text-white/70">Share this code with your teammates so they can join when they register:</p>
            <div className="flex items-center justify-between gap-2 bg-black/60 rounded-lg px-3 py-2">
              <span className="font-mono text-lg font-bold tracking-[0.3em] text-white">{outcome.team.code}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(outcome.team!.code).then(() => setCopied(true), () => {});
                }}
                className="text-[10px] font-bold uppercase text-nebula-300 hover:text-white flex items-center gap-1"
              >
                <Copy size={12} /> {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} width={450} height={250} className="hidden" />

        <div className="flex flex-col gap-2">
          <button onClick={downloadTicketAsImage} className="w-full py-2.5 bg-nebula-600 hover:bg-nebula-700 text-white font-bold uppercase tracking-wider text-[10px] rounded-xl transition flex items-center justify-center gap-1.5 shadow-md">
            <Download size={12} /> Download pass card
          </button>
          <button type="button" onClick={addToCalendar} className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 font-bold uppercase tracking-wider text-[10px] rounded-xl transition flex items-center justify-center gap-1.5 shadow-md">
            <Calendar size={12} /> Add to Google Calendar
          </button>
          <Link href="/results#my-ecell" className="text-[11px] text-white/60 hover:text-white underline underline-offset-2 pt-1">
            Find this pass later in My E-Cell
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-nebula-500/20 p-5 rounded-2xl space-y-4 sticky top-24 shadow-2xl">
      <div className="flex justify-between items-start border-b border-white/5 pb-2">
        <div>
          <h3 className="text-sm font-bold text-nebula-400 uppercase tracking-wider">Event signup</h3>
          <p className="text-[10px] font-mono text-white/60 truncate max-w-[200px]">{selectedEvent.title}</p>
        </div>
        <button onClick={onCancel} className="text-white/60 hover:text-white text-xs">
          Cancel
        </button>
      </div>

      <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
        <Field label="Full name">
          <div className="relative">
            <User className="absolute left-3 top-2.5 text-white/60" size={12} />
            <input required type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className={`${inputClass} pl-8`} placeholder="Your name" />
          </div>
        </Field>

        <Field label="Email">
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-white/60" size={12} />
            <input required type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} className={`${inputClass} pl-8`} placeholder="name@college.com" />
          </div>
        </Field>

        <Field label="Roll / registration number">
          <div className="relative">
            <FileText className="absolute left-3 top-2.5 text-white/60" size={12} />
            <input required type="text" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} className={`${inputClass} pl-8`} placeholder="e.g., 2025-PGDM-044" />
          </div>
        </Field>

        {meta?.collectCollege && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="College">
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 text-white/60" size={12} />
                <input required type="text" value={college} onChange={(e) => setCollege(e.target.value)} className={`${inputClass} pl-8`} placeholder="Your college" />
              </div>
            </Field>
            <Field label="City">
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 text-white/60" size={12} />
                <input required type="text" value={city} onChange={(e) => setCity(e.target.value)} className={`${inputClass} pl-8`} placeholder="City" />
              </div>
            </Field>
          </div>
        )}

        {selectedEvent.customFields.map((field) => (
          <Field key={field} label={field}>
            <input
              required
              type="text"
              value={customAnswers[field] || ""}
              onChange={(e) => setCustomAnswers({ ...customAnswers, [field]: e.target.value })}
              className={inputClass}
              placeholder={`Enter ${field.toLowerCase()}`}
            />
          </Field>
        ))}

        {teamEnabled && meta && (
          <fieldset className="space-y-3 rounded-xl border border-white/10 p-3">
            <legend className="px-1 text-[9px] font-bold uppercase tracking-wider text-white/50 flex items-center gap-1">
              <Users size={11} /> Team ({meta.team.minSize}–{meta.team.maxSize} people)
            </legend>
            <div className="grid grid-cols-2 gap-1 bg-black p-1 rounded-lg">
              {(["create", "join"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTeamMode(mode)}
                  className={`py-1.5 rounded-md text-[10px] font-bold uppercase ${teamMode === mode ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
                >
                  {mode === "create" ? "Start a team" : "Join a team"}
                </button>
              ))}
            </div>
            {teamMode === "create" ? (
              <Field label="Team name">
                <input required type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} className={inputClass} placeholder="e.g., Night Owls" maxLength={60} />
              </Field>
            ) : (
              <Field label="Team code from your leader">
                <input
                  required
                  type="text"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  className={`${inputClass} font-mono tracking-[0.2em] uppercase`}
                  placeholder="ABC123"
                  maxLength={8}
                />
              </Field>
            )}
          </fieldset>
        )}

        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <Turnstile onToken={setCaptchaToken} resetKey={captchaReset} />

        {error && (
          <p role="alert" className="text-[11px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 leading-relaxed">
            {error}
          </p>
        )}

        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full py-2.5 bg-nebula-600 hover:bg-nebula-700 text-white font-bold uppercase tracking-wider text-[10px] rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-lg"
        >
          {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <>Complete event registration</>}
        </button>
      </form>
    </div>
  );
}
