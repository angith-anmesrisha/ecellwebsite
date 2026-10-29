"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Gavel, Loader2, LogOut } from "lucide-react";

interface RubricItem {
  id: string;
  label: string;
  max: number;
}

interface Entrant {
  id: string;
  name: string;
  members: string[];
  submission: { link: string; note?: string; at: string } | null;
  myScore: { scores: Record<string, number>; comment?: string; at: string } | null;
}

interface JudgeRound {
  id: string;
  name: string;
  rubric: RubricItem[];
  entrants: Entrant[];
}

interface JudgeEvent {
  eventId: string;
  title: string;
  rounds: JudgeRound[];
}

const input = "w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500";

async function post(body: Record<string, unknown>) {
  const res = await fetch("/api/judge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return res.json();
}

function ScoreForm({ eventId, round, entrant, onSaved }: { eventId: string; round: JudgeRound; entrant: Entrant; onSaved: () => void }) {
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(round.rubric.map((r) => [r.id, entrant.myScore?.scores[r.id] ?? 0])),
  );
  const [comment, setComment] = useState(entrant.myScore?.comment || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const total = round.rubric.reduce((sum, r) => sum + (scores[r.id] || 0), 0);
  const max = round.rubric.reduce((sum, r) => sum + r.max, 0);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const data = await post({ action: "score", eventId, roundId: round.id, entrantId: entrant.id, scores, comment }).catch(() => ({ success: false }));
    setBusy(false);
    if (data.success) {
      setMessage("Saved.");
      onSaved();
    } else setMessage(data.error || "Couldn't save. Try again.");
  };

  return (
    <form onSubmit={save} className="space-y-4 pt-3">
      {entrant.submission ? (
        <a href={entrant.submission.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-emerald-300 hover:text-emerald-200 break-all">
          Open submission <ExternalLink size={13} />
        </a>
      ) : (
        <p className="text-xs text-white/50">No submission yet. You can still score a live pitch.</p>
      )}
      {entrant.submission?.note && <p className="text-xs text-white/60 italic">“{entrant.submission.note}”</p>}
      {round.rubric.map((r) => (
        <label key={r.id} className="block space-y-1.5">
          <span className="flex justify-between text-xs text-white/80">
            {r.label}
            <span className="font-mono tabular-nums text-white">
              {scores[r.id]} / {r.max}
            </span>
          </span>
          <input
            type="range"
            min={0}
            max={r.max}
            step={1}
            value={scores[r.id]}
            onChange={(e) => setScores({ ...scores, [r.id]: Number(e.target.value) })}
            className="w-full accent-emerald-500"
          />
        </label>
      ))}
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Comments for the organisers (optional)" className={input} />
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-sm text-white">
          Total <strong className="tabular-nums">{total}</strong> / {max}
        </span>
        <span className="flex items-center gap-3">
          {message && <span className="text-xs text-white/60">{message}</span>}
          <button disabled={busy} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-bold uppercase disabled:opacity-40 flex items-center gap-1.5">
            {busy && <Loader2 size={12} className="animate-spin" />} {entrant.myScore ? "Update score" : "Save score"}
          </button>
        </span>
      </div>
    </form>
  );
}

// Judges score entries on their phone; each judge only sees the events they were added to
export default function JudgePage() {
  const [state, setState] = useState<"loading" | "signed-out" | "ready">("loading");
  const [name, setName] = useState("");
  const [events, setEvents] = useState<JudgeEvent[]>([]);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await (await fetch("/api/judge", { cache: "no-store" })).json();
      if (data.signedIn) {
        setName(data.judge.name);
        setEvents(data.events);
        setState("ready");
      } else setState("signed-out");
    } catch {
      setState("signed-out");
    }
  }, []);

  useEffect(() => {
    const fromLink = new URLSearchParams(window.location.search).get("code");
    if (fromLink) setCode(fromLink.toUpperCase());
    load();
  }, [load]);

  if (state === "loading") return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white/40" /></div>;

  if (state === "signed-out") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            const data = await post({ action: "sign-in", code }).catch(() => ({ success: false }));
            if (data.success) load();
            else setError(data.error || "Couldn't sign in.");
          }}
          className="w-full max-w-sm bg-zinc-950 border border-emerald-500/30 rounded-2xl p-6 space-y-4"
        >
          <div className="text-center space-y-2">
            <Gavel className="mx-auto text-emerald-400" size={24} />
            <h1 className="text-lg font-bold">Judge sign-in</h1>
            <p className="text-xs text-white/60">Enter the code the organisers gave you.</p>
          </div>
          <input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="JUDGE CODE" className={`${input} text-center font-mono tracking-[0.3em]`} />
          {error && <p className="text-xs text-red-400 text-center">{error}</p>}
          <button className="w-full py-2.5 bg-emerald-500 text-black rounded-xl text-xs font-bold uppercase">Start judging</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Judging</p>
            <h1 className="text-xl font-bold">Hi {name}</h1>
          </div>
          <button
            onClick={async () => {
              await post({ action: "sign-out" });
              setState("signed-out");
            }}
            className="text-xs text-white/60 hover:text-white flex items-center gap-1"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>

        {events.length === 0 && <p className="text-sm text-white/60">You haven&apos;t been added to an event with rounds yet. Ask the organisers.</p>}

        {events.map((event) => (
          <section key={event.eventId} className="space-y-4">
            <h2 className="text-lg font-bold">{event.title}</h2>
            {event.rounds.map((round) => {
              const done = round.entrants.filter((e) => e.myScore).length;
              return (
                <div key={round.id} className="space-y-2">
                  <p className="text-xs font-mono uppercase tracking-widest text-white/60">
                    {round.name} · {done} of {round.entrants.length} scored
                  </p>
                  {round.entrants.length === 0 && <p className="text-xs text-white/40">No entries in this round yet.</p>}
                  <ul className="space-y-2">
                    {round.entrants.map((entrant) => {
                      const key = `${event.eventId}|${round.id}|${entrant.id}`;
                      return (
                        <li key={entrant.id} className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3">
                          <button onClick={() => setOpen(open === key ? null : key)} className="w-full flex items-center justify-between gap-3 text-left">
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold">{entrant.name}</span>
                              {entrant.members.length > 1 && <span className="block text-[11px] text-white/50 truncate">{entrant.members.join(", ")}</span>}
                            </span>
                            {entrant.myScore ? (
                              <span className="flex items-center gap-1 text-[11px] text-emerald-300 shrink-0">
                                <CheckCircle2 size={13} /> Scored
                              </span>
                            ) : (
                              <span className="text-[11px] text-white/40 shrink-0">To score</span>
                            )}
                          </button>
                          {open === key && <ScoreForm eventId={event.eventId} round={round} entrant={entrant} onSaved={load} />}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}
