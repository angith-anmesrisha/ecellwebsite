"use client";

import React, { useState } from "react";
import { Calendar, CalendarX } from "lucide-react";
import EmptyState from "./EmptyState";
import dynamic from "next/dynamic";

const RegistrationForm = dynamic(
  () => import("@/components/RegistrationForm"),
  {
    ssr: false,
  },
);

export interface EventItem {
  id: string;
  title: string;
  date: string;
  description: string;
  status: string;
  customFields: string[];
}

export default function EventsView({ initialEvents }: { initialEvents: EventItem[] }) {
  const events = initialEvents;
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const activeEvents = events.filter((e) => e.status === "ACTIVE");
  const pastEvents = events.filter((e) => e.status === "PAST");

  return (
    <div className="min-h-screen bg-transparent text-white py-16 px-4 md:px-8 font-sans antialiased">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="border-b border-white/10 pb-6 space-y-2">
          <div className="text-[10px] font-mono tracking-widest bg-accent-400/10 border border-accent-400/20 text-accent-300 px-3 py-1 rounded-full inline-block font-bold uppercase">
            E-Cell Events Hub
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Campus Events & Workshops
          </h1>
          <p className="text-sm text-white/60 max-w-xl">
            Register for upcoming competitions, workshops and talks, and see
            what we&apos;ve run before.
          </p>
        </div>

        {(
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-4">
                <h2 className="text-sm font-bold tracking-widest text-accent-300 uppercase font-mono">
                  {"// Open Registrations"}
                </h2>
                {activeEvents.length === 0 ? (
                  <EmptyState
                    icon={<CalendarX size={20} />}
                    title="No open registrations right now"
                    action={
                      <a
                        href="https://www.instagram.com/ecell_bimtech"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-accent-100 transition-colors"
                      >
                        Follow us on Instagram
                      </a>
                    }
                  >
                    New events are announced on our Instagram first. Check back soon.
                  </EmptyState>
                ) : (
                  <div className="space-y-4">
                    {activeEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-space-900/70 border border-white/10 p-5 rounded-xl space-y-4 hover:border-white/20 transition"
                      >
                        <div className="flex justify-between items-start border-b border-white/5 pb-2">
                          <div>
                            <h3 className="text-base font-bold text-white">
                              {event.title}
                            </h3>
                            <p className="text-xs text-accent-200/80 font-mono mt-1 flex items-center gap-1.5">
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

              {pastEvents.length > 0 && (
              <div className="space-y-4 pt-4">
                <h2 className="text-sm font-bold tracking-widest text-white/60 uppercase font-mono">
                  {"// Past events"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pastEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-space-900/60 border border-white/10 p-4 rounded-xl space-y-2"
                    >
                      <h3 className="text-sm font-bold text-white/80">
                        {event.title}
                      </h3>
                      <p className="text-[11px] text-white/60 font-mono flex items-center gap-1.5">
                        <Calendar size={11} /> Conducted: {event.date}
                      </p>
                      <p className="text-[11px] text-white/60 line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>

            <div className="lg:col-span-1">
              {selectedEvent ? (
                <RegistrationForm
                  selectedEvent={selectedEvent}
                  onCancel={() => setSelectedEvent(null)}
                />
              ) : (
                <div className="bg-space-900/40 border border-white/10 border-dashed p-6 rounded-2xl text-center text-xs text-white/60 font-sans sticky top-24">
                  Pick an event and press Register Now to sign up here.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
