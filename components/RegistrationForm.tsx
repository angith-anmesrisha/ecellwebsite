"use client";

import React, { useState, useRef } from "react";
import { User, Mail, FileText, Loader2, Download, CheckCircle, Calendar } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  date: string;
  description: string;
  status: string;
  customFields: string[];
}

interface RegistrationFormProps {
  selectedEvent: EventItem;
  onCancel: () => void;
}

export default function RegistrationForm({
  selectedEvent,
  onCancel,
}: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredPassId, setRegisteredPassId] = useState<string | null>(null);
  
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit-registration",
          eventId: selectedEvent.id,
          eventTitle: selectedEvent.title,
          name: studentName,
          email: studentEmail,
          rollNumber: rollNumber,
          customAnswers: customAnswers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRegisteredPassId(data.registrationId);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert("Submission failed. Please check your network connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadTicketAsImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, 450, 250);

    ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 430, 230);

    ctx.fillStyle = "#3b82f6";
    ctx.font = "bold 14px monospace";
    ctx.fillText("BIMTECH E-CELL OFFICIAL ENTRY PASS", 25, 40);

    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(25, 55, 400, 1);

    ctx.fillStyle = "#ffffff";
    ctx.font = "11px monospace";
    ctx.fillText("EVENT TITLE :", 25, 85);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "bold 12px monospace";
    ctx.fillText(selectedEvent.title.toUpperCase().slice(0, 32), 120, 85);

    ctx.fillStyle = "#ffffff";
    ctx.font = "11px monospace";
    ctx.fillText("ATTENDEE    :", 25, 115);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "bold 12px monospace";
    ctx.fillText(studentName.toUpperCase(), 120, 115);

    ctx.fillStyle = "#ffffff";
    ctx.font = "11px monospace";
    ctx.fillText("ROLL NUMBER :", 25, 145);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "bold 12px monospace";
    ctx.fillText(rollNumber.toUpperCase(), 120, 145);

    ctx.fillStyle = "#ffffff";
    ctx.font = "11px monospace";
    ctx.fillText("DATE        :", 25, 175);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "bold 12px monospace";
    ctx.fillText(selectedEvent.date || "EVENT DATE", 120, 175);

    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(25, 195, 400, 1);

    ctx.fillStyle = "#22c55e";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`PASS ID: ${registeredPassId}`, 25, 225);

    const imageUri = canvas.toDataURL("image/png");
    const linkElement = document.createElement("a");
    linkElement.download = `Pass_${registeredPassId}.png`;
    linkElement.href = imageUri;
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);

    setRegisteredPassId(null);
    onCancel();
    setStudentName("");
    setStudentEmail("");
    setRollNumber("");
    setCustomAnswers({});
  };

  if (registeredPassId) {
    return (
      <div className="bg-zinc-950 border border-green-500/30 p-6 rounded-2xl space-y-5 text-center shadow-2xl animate-fadeIn">
        <div className="flex flex-col items-center gap-2">
          <CheckCircle className="text-green-500" size={32} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Registration Confirmed</h3>
          <p className="text-[10px] text-white/50">Your personal pass card has been generated successfully.</p>
        </div>

        <div className="bg-black border border-white/5 p-4 rounded-xl text-left font-mono text-[11px] space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          <p className="text-blue-400 font-bold text-xs border-b border-white/5 pb-1.5">// ENTRY SLIP</p>
          <p><span className="text-white/40">EVENT:</span> {selectedEvent.title}</p>
          <p><span className="text-white/40">NAME:</span> {studentName}</p>
          <p><span className="text-white/40">ID:</span> {registeredPassId}</p>
        </div>

        <canvas ref={canvasRef} width={450} height={250} className="hidden" />

        {/* RECONFIGURED GRID ACTION ROW */}
        <div className="flex flex-col gap-2">
          <button onClick={downloadTicketAsImage} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-[10px] rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md">
            <Download size={12} /> Download Pass Card
          </button>
          
          <button 
            type="button"
            onClick={() => {
              const eventDateRaw = selectedEvent.date || "2026-06-30"; 
              const formattedDate = eventDateRaw.replace(/-/g, "");
              const titleToken = encodeURIComponent(`E-Cell: ${selectedEvent.title}`);
              const descToken = encodeURIComponent(`Your entry pass ID is: ${registeredPassId}. Please keep your downloaded pass card ready at the entrance!`);
              const locationToken = encodeURIComponent("BIMTECH Campus, Greater Noida");
              
              const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleToken}&dates=${formattedDate}/${formattedDate}&details=${descToken}&location=${locationToken}&sf=true&output=xml`;
              window.open(gCalUrl, "_blank");
            }}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 font-bold uppercase tracking-wider text-[10px] rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Calendar size={12} /> Add to Google Calendar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-blue-500/20 p-5 rounded-2xl space-y-4 sticky top-24 shadow-2xl">
      <div className="flex justify-between items-start border-b border-white/5 pb-2">
        <div>
          <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
            Event Signup
          </h3>
          <p className="text-[10px] font-mono text-white/40 truncate max-w-[180px]">
            {selectedEvent.title}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-white/40 hover:text-white cursor-pointer text-xs"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
        <div className="space-y-1">
          <label className="text-white/50 uppercase tracking-wider text-[9px] font-bold">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 text-white/30" size={12} />
            <input
              required
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Your name"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-white/50 uppercase tracking-wider text-[9px] font-bold">
            College Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-white/30" size={12} />
            <input
              required
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="name@college.com"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-white/50 uppercase tracking-wider text-[9px] font-bold">
            Roll / Registration Number
          </label>
          <div className="relative">
            <FileText
              className="absolute left-3 top-2.5 text-white/30"
              size={12}
            />
            <input
              required
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., 2025-PGDM-044"
            />
          </div>
        </div>

        {selectedEvent.customFields.map((field) => (
          <div key={field} className="space-y-1">
            <label className="text-white/50 uppercase tracking-wider text-[9px] font-bold">
              {field}
            </label>
            <input
              required
              type="text"
              value={customAnswers[field] || ""}
              onChange={(e) =>
                setCustomAnswers({ ...customAnswers, [field]: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder={`Enter ${field.toLowerCase()}`}
            />
          </div>
        ))}

        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-[10px] rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-lg"
        >
          {isSubmitting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <>Complete Event Registration</>
          )}
        </button>
      </form>
    </div>
  );
}