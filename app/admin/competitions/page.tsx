"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { AdminShell, Button, Field, Panel, TextInput, adminFetch, inputClass } from "@/components/admin/AdminKit";
import type { EventMeta, SheetEvent } from "@/lib/content-types";

interface Judge {
  code: string;
  name: string;
  eventIds: string[];
}

interface Row {
  entrant: { id: string; name: string; members: string[] };
  judgeCount: number;
  rawAverage: number;
  normalized: number | null;
  rank: number;
  advanced: boolean;
  submission: { link: string; note?: string; at: string } | null;
}

interface RoundBoard {
  id: string;
  name: string;
  published: boolean;
  maxScore: number;
  submissions: number;
  rows: Row[];
}

function JudgesPanel({ judges, events, reload }: { judges: Judge[]; events: SheetEvent[]; reload: () => void }) {
  const [name, setName] = useState("");
  const [eventIds, setEventIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState("");

  const call = async (body: Record<string, unknown>, done: string) => {
    setBusy(true);
    try {
      await adminFetch("/api/admin/competition", { method: "POST", body: JSON.stringify(body) });
      setMessage(done);
      reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "That didn't work.");
    } finally {
      setBusy(false);
    }
  };

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const competitionEvents = events;

  return (
    <Panel title="Judges" description="Each judge gets a code. They sign in at /judge on their phone and only see the events you tick for them.">
      <div className="space-y-3">
        {judges.length === 0 && <p className="text-[11px] text-white/40">No judges yet.</p>}
        {judges.map((j) => (
          <div key={j.code} className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-bold text-white">{j.name}</span>
              <span className="font-mono text-xs tracking-widest text-emerald-300">{j.code}</span>
              <button
                onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/judge?code=${j.code}`).then(() => setCopied(j.code), () => {})}
                className="text-[10px] text-white/60 hover:text-white flex items-center gap-1"
              >
                <Copy size={11} /> {copied === j.code ? "Link copied" : "Copy sign-in link"}
              </button>
              <span className="flex-1" />
              <Button tone="danger" onClick={() => call({ action: "remove-judge", code: j.code }, `Removed ${j.name}.`)}>
                Remove
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {competitionEvents.map((e) => (
                <label key={e.id} className="flex items-center gap-1.5 text-[11px] text-white/70">
                  <input
                    type="checkbox"
                    className="accent-emerald-500"
                    checked={j.eventIds.includes(e.id)}
                    onChange={() => call({ action: "update-judge", code: j.code, name: j.name, eventIds: toggle(j.eventIds, e.id) }, `Updated ${j.name}.`)}
                  />
                  {e.title}
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-dashed border-white/15 p-3 space-y-2">
          <Field label="New judge">
            <TextInput value={name} onChange={setName} placeholder="Name, e.g. Priya Mehta (Sequoia)" />
          </Field>
          <div className="flex flex-wrap gap-2">
            {competitionEvents.map((e) => (
              <label key={e.id} className="flex items-center gap-1.5 text-[11px] text-white/70">
                <input type="checkbox" className="accent-emerald-500" checked={eventIds.includes(e.id)} onChange={() => setEventIds(toggle(eventIds, e.id))} />
                {e.title}
              </label>
            ))}
          </div>
          <Button
            busy={busy}
            disabled={!name.trim()}
            onClick={() => {
              call({ action: "add-judge", name, eventIds }, `Added ${name}. Share their code or sign-in link.`);
              setName("");
              setEventIds([]);
            }}
          >
            Add judge
          </Button>
        </div>
        {message && <p className="text-[11px] text-white/60">{message}</p>}
      </div>
    </Panel>
  );
}

function RoundPanel({ eventId, round, meta, onMetaSaved }: { eventId: string; round: RoundBoard; meta: EventMeta; onMetaSaved: (m: EventMeta) => void }) {
  const [selected, setSelected] = useState<string[]>(round.rows.filter((r) => r.advanced).map((r) => r.entrant.id));
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [topN, setTopN] = useState(10);

  useEffect(() => setSelected(round.rows.filter((r) => r.advanced).map((r) => r.entrant.id)), [round]);

  const saveShortlist = async () => {
    setBusy("shortlist");
    try {
      await adminFetch("/api/admin/competition", { method: "POST", body: JSON.stringify({ action: "set-advanced", eventId, roundId: round.id, entrantIds: selected }) });
      setMessage(`${selected.length} through to the next round.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy("");
    }
  };

  const togglePublish = async () => {
    setBusy("publish");
    try {
      const next = { ...meta, rounds: meta.rounds.map((r) => (r.id === round.id ? { ...r, published: !r.published } : r)) };
      const data = await adminFetch<{ meta: EventMeta }>("/api/admin/event-meta", { method: "PUT", body: JSON.stringify(next) });
      onMetaSaved(data.meta);
      setMessage(round.published ? "Results hidden from the event page." : "Results are now on the event page.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy("");
    }
  };

  const exportCsv = () => {
    const header = ["Rank", "Entrant", "Members", "Judges", "Average", "Normalised", "Submission"];
    const body = round.rows.map((r) => [r.rank || "", r.entrant.name, r.entrant.members.join("; "), r.judgeCount, r.rawAverage, r.normalized ?? "", r.submission?.link || ""]);
    const csv = [header, ...body].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = `${round.name.replace(/\W+/g, "-")}-leaderboard.csv`;
    link.click();
  };

  const scored = round.rows.filter((r) => r.judgeCount > 0).length;

  return (
    <Panel
      title={`${round.name} · ${round.rows.length} entries · ${round.submissions} submitted · ${scored} scored`}
      description={`Ranked by the judges' average out of ${round.maxScore}. With two or more judges, the normalised score evens out strict and generous judges and decides the order.`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button tone="ghost" onClick={exportCsv}>
            Export CSV
          </Button>
          <Button tone={round.published ? "danger" : "primary"} busy={busy === "publish"} onClick={togglePublish}>
            {round.published ? "Hide results" : "Publish results"}
          </Button>
        </div>
      }
    >
      {round.rows.length === 0 ? (
        <p className="text-[11px] text-white/40">No entries in this round yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] min-w-[640px]">
              <thead className="text-white/40 uppercase text-[9px]">
                <tr>
                  <th className="py-2 w-10">Next</th>
                  <th className="w-10">#</th>
                  <th>Entrant</th>
                  <th>Submission</th>
                  <th className="text-right">Judges</th>
                  <th className="text-right">Average</th>
                  <th className="text-right">Normalised</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {round.rows.map((r) => (
                  <tr key={r.entrant.id}>
                    <td className="py-2">
                      <input
                        type="checkbox"
                        className="accent-emerald-500"
                        aria-label={`Send ${r.entrant.name} to the next round`}
                        checked={selected.includes(r.entrant.id)}
                        onChange={() => setSelected((s) => (s.includes(r.entrant.id) ? s.filter((x) => x !== r.entrant.id) : [...s, r.entrant.id]))}
                      />
                    </td>
                    <td className="font-mono text-white/50">{r.rank || "–"}</td>
                    <td>
                      <span className="text-white font-semibold">{r.entrant.name}</span>
                      {r.entrant.members.length > 1 && <span className="block text-white/40">{r.entrant.members.join(", ")}</span>}
                    </td>
                    <td>
                      {r.submission ? (
                        <a href={r.submission.link} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1">
                          Open <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-white/30">None</span>
                      )}
                    </td>
                    <td className="text-right tabular-nums">{r.judgeCount}</td>
                    <td className="text-right tabular-nums text-white">{r.judgeCount ? r.rawAverage : "–"}</td>
                    <td className="text-right tabular-nums text-white/70">{r.normalized ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
            <span className="text-[11px] text-white/60">Shortlist:</span>
            <input type="number" min={1} value={topN} onChange={(e) => setTopN(Number(e.target.value))} className={`${inputClass} w-20`} aria-label="How many to pick" />
            <Button tone="ghost" onClick={() => setSelected(round.rows.filter((r) => r.rank > 0).slice(0, topN).map((r) => r.entrant.id))}>
              Tick top {topN}
            </Button>
            <Button busy={busy === "shortlist"} onClick={saveShortlist}>
              Save shortlist ({selected.length})
            </Button>
            {message && <span className="text-[11px] text-white/60">{message}</span>}
          </div>
        </>
      )}
    </Panel>
  );
}

export default function CompetitionsAdmin() {
  const [events, setEvents] = useState<SheetEvent[]>([]);
  const [metaById, setMetaById] = useState<Record<string, EventMeta>>({});
  const [eventId, setEventId] = useState("");
  const [judges, setJudges] = useState<Judge[]>([]);
  const [rounds, setRounds] = useState<RoundBoard[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/events?mode=events").then((r) => r.json()), adminFetch("/api/admin/event-meta")])
      .then(([ev, meta]) => {
        if (ev.success) setEvents(ev.data);
        setMetaById(meta.meta);
      })
      .catch((e) => setError(e.message));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ judges: Judge[]; rounds: RoundBoard[] }>(`/api/admin/competition?eventId=${encodeURIComponent(eventId)}`);
      setJudges(data.judges);
      setRounds(data.rounds);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const competitionEvents = events.filter((e) => metaById[e.id]?.rounds.length);

  return (
    <AdminShell title="Judging" subtitle="Judges, scores, shortlists and results for events with competition rounds. Add rounds to an event from Events > Edit page > Teams & rounds.">
      {error && <p className="text-xs text-red-400">{error}</p>}
      <JudgesPanel judges={judges} events={competitionEvents} reload={load} />
      <Panel title="Leaderboards">
        {competitionEvents.length === 0 ? (
          <p className="text-[11px] text-white/40">No event has competition rounds yet.</p>
        ) : (
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={`${inputClass} max-w-md`}>
            <option value="">Pick an event…</option>
            {competitionEvents.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        )}
      </Panel>
      {loading && <p className="text-[11px] text-white/40 font-mono">Loading scores…</p>}
      {eventId &&
        metaById[eventId] &&
        rounds.map((round) => (
          <RoundPanel key={round.id} eventId={eventId} round={round} meta={metaById[eventId]} onMetaSaved={(m) => {
            setMetaById((all) => ({ ...all, [m.eventId]: m }));
            load();
          }} />
        ))}
    </AdminShell>
  );
}
