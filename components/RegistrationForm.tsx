"use client";

import React, { useState } from "react";
import { User, Mail, FileText, Loader2 } from "lucide-react";

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
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>(
    {},
  );

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
        alert(
          `Successfully registered! Your pass code is: ${data.registrationId}`,
        );
        onCancel();
        setStudentName("");
        setStudentEmail("");
        setRollNumber("");
        setCustomAnswers({});
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert("Submission failed. Please check your network connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
