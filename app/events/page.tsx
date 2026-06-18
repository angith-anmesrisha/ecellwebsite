"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import dynamic from "next/dynamic";

const RegistrationForm = dynamic(
  () => import("@/components/RegistrationForm"),
  {
    ssr: false,
  },
);

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

  const activeEvents = events.filter((e) => e.status === "ACTIVE");
  const pastEvents = events.filter((e) => e.status === "PAST");

  return (
    <div className="min-h-screen bg-black text-white py-16 px-4 md:px-8 font-sans antialiased">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="border-b border-white/10 pb-6 space-y-2">
          <div className="text-[10px] font-mono tracking-widest bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full inline-block font-bold uppercase">
            E-Cell Events Hub
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Campus Events & Workshops
          </h1>
          <p className="text-sm text-white/40 max-w-xl">
            Register for upcoming challenges, track official bootcamps, and view
            historical portal timelines.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-sm text-white/40 animate-pulse">
            Loading event listings...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-4">
                <h2 className="text-lg font-bold tracking-tight text-blue-400 uppercase font-mono">
                  // Open Registrations
                </h2>
                {activeEvents.length === 0 ? (
                  <div className="bg-zinc-950 border border-white/5 p-6 rounded-xl text-xs text-white/40 font-mono">
                    No active events open for registration at this moment.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-zinc-950 border border-white/10 p-5 rounded-xl space-y-4 hover:border-white/20 transition"
                      >
                        <div className="flex justify-between items-start border-b border-white/5 pb-2">
                          <div>
                            <h3 className="text-base font-bold text-white">
                              {event.title}
                            </h3>
                            <p className="text-xs text-blue-400 font-mono mt-1 flex items-center gap-1.5">
                              <Calendar size={12} /> Event Date: {event.date}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedEvent(event);
                            }}
                            className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition cursor-pointer"
                          >
                            Register Now
                          </button>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4">
                <h2 className="text-lg font-bold tracking-tight text-white/40 uppercase font-mono">
                  // Completed Events Archive
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pastEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-zinc-950/40 border border-white/5 p-4 rounded-xl opacity-60 space-y-2"
                    >
                      <h3 className="text-sm font-bold text-white/80">
                        {event.title}
                      </h3>
                      <p className="text-[11px] text-white/40 font-mono flex items-center gap-1.5">
                        <Calendar size={11} /> Conducted: {event.date}
                      </p>
                      <p className="text-[11px] text-white/50 line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              {selectedEvent ? (
                <RegistrationForm
                  selectedEvent={selectedEvent}
                  onCancel={() => setSelectedEvent(null)}
                />
              ) : (
                <div className="bg-zinc-950/40 border border-white/5 border-dashed p-6 rounded-2xl text-center text-xs text-white/30 font-sans sticky top-24">
                  Select an active event card to reveal the specialized
                  registration form panel.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
