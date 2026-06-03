"use client";

import React, { useState, useEffect } from "react";
import { Calendar, User, Mail, FileText, CheckCircle, Loader2 } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  date: string;
  description: string;
  status: string;
  customFields: string[];
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Core Form Fields
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  // Dictionary to map custom fields dynamically
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/events?mode=events");
      const data = await res.json();
      if (data.success) setEvents(data.data);
    } catch (err) {
      console.error("Error loading events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
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
          customAnswers: customAnswers
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`Successfully registered! Your pass code is: ${data.registrationId}`);
        setSelectedEvent(null);
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

  const activeEvents = events.filter(e => e.status === "ACTIVE");
  const pastEvents = events.filter(e => e.status === "PAST");

  return (
    <div className="min-h-screen bg-black text-white py-16 px-4 md:px-8 font-sans antialiased">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* HEADER */}
        <div className="border-b border-white/10 pb-6 space-y-2">
          <div className="text-[10px] font-mono tracking-widest bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full inline-block font-bold uppercase">
            E-Cell Events Hub
          </div>
          <h1 className="text-3xl font-black tracking-tight">Campus Events & Workshops</h1>
          <p className="text-sm text-white/40 max-w-xl">
            Register for upcoming challenges, track official bootcamps, and view historical portal timelines.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-sm text-white/40 animate-pulse">Loading event listings...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* LEFT/CENTER COLUMN: EVENTS LISTING */}
            <div className="lg:col-span-2 space-y-10">
              {/* Active Events Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold tracking-tight text-blue-400 uppercase font-mono">// Open Registrations</h2>
                {activeEvents.length === 0 ? (
                  <div className="bg-zinc-950 border border-white/5 p-6 rounded-xl text-xs text-white/40 font-mono">No active events open for registration at this moment.</div>
                ) : (
                  <div className="space-y-4">
                    {activeEvents.map(event => (
                      <div key={event.id} className="bg-zinc-950 border border-white/10 p-5 rounded-xl space-y-4 hover:border-white/20 transition">
                        <div className="flex justify-between items-start border-b border-white/5 pb-2">
                          <div>
                            <h3 className="text-base font-bold text-white">{event.title}</h3>
                            <p className="text-xs text-blue-400 font-mono mt-1 flex items-center gap-1.5">
                              <Calendar size={12} /> Event Date: {event.date}
                            </p>
                          </div>
                          <button 
                            onClick={() => { setSelectedEvent(event); setCustomAnswers({}); }}
                            className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition cursor-pointer"
                          >
                            Register Now
                          </button>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">{event.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Events Section */}
              <div className="space-y-4 pt-4">
                <h2 className="text-lg font-bold tracking-tight text-white/40 uppercase font-mono">// Completed Events Archive</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pastEvents.map(event => (
                    <div key={event.id} className="bg-zinc-950/40 border border-white/5 p-4 rounded-xl opacity-60 space-y-2">
                      <h3 className="text-sm font-bold text-white/80">{event.title}</h3>
                      <p className="text-[11px] text-white/40 font-mono flex items-center gap-1.5"><Calendar size={11} /> Conducted: {event.date}</p>
                      <p className="text-[11px] text-white/50 line-clamp-2">{event.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: DYNAMIC FLOATING REGISTRATION DRAWER */}
            <div className="lg:col-span-1">
              {selectedEvent ? (
                <div className="bg-zinc-950 border border-blue-500/20 p-5 rounded-2xl space-y-4 sticky top-24 shadow-2xl">
                  <div className="flex justify-between items-start border-b border-white/5 pb-2">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider text-blue-400">Event Signup</h3>
                      <p className="text-[10px] font-mono text-white/40 truncate max-w-[180px]">{selectedEvent.title}</p>
                    </div>
                    <button onClick={() => setSelectedEvent(null)} className="text-white/40 hover:text-white cursor-pointer text-xs">Cancel</button>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <label className="text-white/50 uppercase tracking-wider text-[9px] font-bold">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 text-white/30" size={12} />
                        <input required type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="Your name" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-white/50 uppercase tracking-wider text-[9px] font-bold">College Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 text-white/30" size={12} />
                        <input required type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="name@college.com" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-white/50 uppercase tracking-wider text-[9px] font-bold">Roll / Registration Number</label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-2.5 text-white/30" size={12} />
                        <input required type="text" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="e.g., 2025-PGDM-044" />
                      </div>
                    </div>

                    {/* DYNAMIC FIELD GENERATION BASED ON ADMN SELECTION */}
                    {selectedEvent.customFields.map((field) => (
                      <div key={field} className="space-y-1">
                        <label className="text-white/50 uppercase tracking-wider text-[9px] font-bold">{field}</label>
                        <input 
                          required 
                          type="text" 
                          value={customAnswers[field] || ""} 
                          onChange={(e) => setCustomAnswers({ ...customAnswers, [field]: e.target.value })} 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" 
                          placeholder={`Enter ${field.toLowerCase()}`}
                        />
                      </div>
                    ))}

                    <button disabled={isSubmitting} type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-[10px] rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-lg">
                      {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <>Complete Event Registration</>}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-zinc-950/40 border border-white/5 border-dashed p-6 rounded-2xl text-center text-xs text-white/30 font-sans sticky top-24">
                  Select an active event card to reveal the specialized registration form panel.
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}