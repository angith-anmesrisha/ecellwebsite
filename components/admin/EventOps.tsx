"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button, Field, Panel, TextArea, TextInput, adminFetch, inputClass } from "./AdminKit";
import type { SheetEvent } from "@/lib/content-types";

interface OpsData {
  capacity: number | null;
  taken: number | null;
  waitlist: { name: string; email: string; rollNumber: string; at?: string }[];
  teams: { id: string; name: string; code: string; leaderEmail: string; members: { email: string; name: string }[]; complete: boolean }[];
  cancelled: string[];
  lastBroadcast: { subject: string; audience: string; total: number; sent: number; failed: number; startedAt: string; done: boolean } | null;
  mailProvider: "resend" | "smtp";
}

const AUDIENCES = [
  { id: "registered", label: "Everyone registered" },
  { id: "checked-in", label: "People who checked in" },
  { id: "not-checked-in", label: "Registered but not checked in" },
  { id: "waitlist", label: "Waitlist" },
];

// Running an event: seats, waitlist, teams, mass email and pass resends
export default function EventOps({ event, onClose }: { event: SheetEvent; onClose: () => void }) {
  const [data, setData] = useState<OpsData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("registered");
  const [confirmSend, setConfirmSend] = useState(false);
  const [regId, setRegId] = useState("");

  const load = useCallback(async () => {
    try {
      setData(await adminFetch<OpsData>(`/api/admin/event-ops?eventId=${encodeURIComponent(event.id)}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load.");
    }
  }, [event.id]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (label: string, body: Record<string, unknown>, success: (d: any) => string) => {
    setBusy(label);
    setNotice("");
    try {
      const d = await adminFetch("/api/admin/event-ops", { method: "POST", body: JSON.stringify({ eventId: event.id, ...body }) });
      setNotice(success(d));
      await load();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "That didn't work.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`Run ${event.title}`}>
      <div className="max-w-4xl mx-auto bg-zinc-950 border border-white/10 rounded-2xl p-5 space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Run the event</p>
            <h2 className="text-lg font-bold text-white">{event.title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        {notice && <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">{notice}</p>}

        {data && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              {[
                { label: "Registered", value: data.taken ?? "–" },
                { label: "Seat limit", value: data.capacity ?? "None" },
                { label: "Waitlist", value: data.waitlist.length },
                { label: "Cancelled", value: data.cancelled.length },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-black p-3">
                  <p className="text-[9px] uppercase text-white/40">{stat.label}</p>
                  <p className="text-xl font-black text-white tabular-nums">{stat.value}</p>
                </div>
              ))}
            </div>

            <Panel
              title={`Waitlist (${data.waitlist.length})`}
              description="People are promoted automatically when someone cancels. Promote by hand after raising the seat limit."
              actions={
                data.waitlist.length > 0 && (
                  <Button busy={busy === "next"} onClick={() => act("next", { action: "promote" }, (d) => `Gave a seat to ${d.promoted.email}. Their pass is on its way.`)}>
                    Promote next
                  </Button>
                )
              }
            >
              {data.waitlist.length === 0 ? (
                <p className="text-[11px] text-white/40">Nobody waiting.</p>
              ) : (
                <ol className="divide-y divide-white/5 text-xs">
                  {data.waitlist.map((w, i) => (
                    <li key={w.email} className="flex flex-wrap items-center gap-3 py-2">
                      <span className="w-6 font-mono text-white/40">{i + 1}</span>
                      <span className="flex-1 min-w-0">
                        <span className="text-white">{w.name}</span> <span className="text-white/50">{w.email}</span>
                      </span>
                      <Button tone="ghost" busy={busy === w.email} onClick={() => act(w.email, { action: "promote", email: w.email }, () => `Promoted ${w.email}.`)}>
                        Give seat
                      </Button>
                      <Button tone="danger" onClick={() => act(`rm-${w.email}`, { action: "remove-waitlist", email: w.email }, () => `Removed ${w.email} from the waitlist.`)}>
                        Remove
                      </Button>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>

            {data.teams.length > 0 && (
              <Panel title={`Teams (${data.teams.length})`} description="Teams below the minimum size are marked incomplete.">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] min-w-[560px]">
                    <thead className="text-white/40 uppercase text-[9px]">
                      <tr>
                        <th className="py-2">Team</th>
                        <th>Code</th>
                        <th>Members</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.teams.map((t) => (
                        <tr key={t.id}>
                          <td className="py-2 font-bold text-white">{t.name}</td>
                          <td className="font-mono">{t.code}</td>
                          <td className="text-white/70">{t.members.map((m) => m.name).join(", ")}</td>
                          <td className={t.complete ? "text-emerald-400" : "text-amber-400"}>{t.complete ? "Complete" : `${t.members.length} so far`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}

            <Panel
              title="Email everyone"
              description={
                data.mailProvider === "smtp"
                  ? "Mail goes through SMTP. Gmail stops at about 500 a day, so for big events set RESEND_API_KEY first."
                  : "Mail goes through Resend in batches of 100."
              }
            >
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Send to">
                    <select value={audience} onChange={(e) => setAudience(e.target.value)} className={inputClass}>
                      {AUDIENCES.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Subject">
                    <TextInput value={subject} onChange={setSubject} placeholder="Doors open at 9:30 tomorrow" />
                  </Field>
                </div>
                <Field label="Message" hint="Plain text. A blank line starts a new paragraph.">
                  <TextArea rows={5} value={message} onChange={setMessage} />
                </Field>
                {!confirmSend ? (
                  <Button disabled={!subject.trim() || !message.trim()} onClick={() => setConfirmSend(true)}>
                    Send…
                  </Button>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/70">
                    This emails {AUDIENCES.find((a) => a.id === audience)?.label.toLowerCase()} for {event.title}. It can&apos;t be undone.
                    <Button
                      busy={busy === "broadcast"}
                      onClick={() =>
                        act("broadcast", { action: "broadcast", subject, message, audience }, (d) => {
                          setConfirmSend(false);
                          setSubject("");
                          setMessage("");
                          return `Sending to ${d.queued} people. Refresh this panel in a minute to see progress.`;
                        })
                      }
                    >
                      Yes, send it
                    </Button>
                    <Button tone="ghost" onClick={() => setConfirmSend(false)}>
                      Not yet
                    </Button>
                  </div>
                )}
                {data.lastBroadcast && (
                  <p className="text-[11px] text-white/50 font-mono">
                    Last: “{data.lastBroadcast.subject}” to {data.lastBroadcast.total} · {data.lastBroadcast.done ? `${data.lastBroadcast.sent} sent, ${data.lastBroadcast.failed} failed` : "sending…"}{" "}
                    <button onClick={load} className="underline hover:text-white">
                      Refresh
                    </button>
                  </p>
                )}
              </div>
            </Panel>

            <Panel title="Resend a pass" description="For someone who says the email never came. They can also do this themselves in My E-Cell.">
              <div className="flex gap-2">
                <TextInput value={regId} onChange={setRegId} placeholder="Pass ID" />
                <Button busy={busy === "resend"} disabled={!regId.trim()} onClick={() => act("resend", { action: "resend-pass", regId: regId.trim() }, () => `Pass ${regId.trim()} emailed again.`)}>
                  Resend
                </Button>
              </div>
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}
