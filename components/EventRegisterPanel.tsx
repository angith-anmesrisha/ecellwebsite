"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { registrationWindow, type EventMeta, type SheetEvent } from "@/lib/content-types";

const RegistrationForm = dynamic(() => import("@/components/RegistrationForm"), { ssr: false });

const istTime = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

// Sign-up box on an event page; the form opens in place
export default function EventRegisterPanel({ event, meta }: { event: SheetEvent; meta: EventMeta }) {
  const [open, setOpen] = useState(false);
  const window = registrationWindow(meta);

  if (event.status !== "ACTIVE") return null;

  if (window !== "open") {
    return (
      <div id="register" className="rounded-2xl border border-white/10 bg-space-900/70 p-5 space-y-1 text-sm">
        <p className="font-semibold text-white">{window === "not-yet" ? "Registrations open soon" : "Registrations are closed"}</p>
        {window === "not-yet" && meta.opensAt && <p className="text-white/60">Opens {istTime(meta.opensAt)} IST.</p>}
      </div>
    );
  }

  if (open) return <div id="register"><RegistrationForm selectedEvent={event} meta={meta} onCancel={() => setOpen(false)} /></div>;

  return (
    <div id="register" className="rounded-2xl border border-nebula-400/30 bg-nebula-500/[0.06] p-5 space-y-3">
      <p className="font-semibold text-white">Registrations are open</p>
      <p className="text-xs text-white/60 leading-relaxed">
        {meta.closesAt ? `Closes ${istTime(meta.closesAt)} IST. ` : ""}
        {meta.team.enabled ? `Teams of ${meta.team.minSize}–${meta.team.maxSize}. Start a team or join one with a code. ` : ""}
        Your pass arrives by email.
      </p>
      <button onClick={() => setOpen(true)} className="w-full py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-zinc-200 transition">
        Register now
      </button>
    </div>
  );
}
