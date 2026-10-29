"use client";

import React, { useEffect, useState } from "react";
import { AdminShell, Panel, adminFetch, inputClass } from "@/components/admin/AdminKit";

interface Overview {
  id: string;
  title: string;
  date: string;
  status: string;
  registrations: number;
  attended: number;
}

interface Detail {
  event: { id: string; title: string; date: string; status: string };
  totals: {
    registrations: number;
    active: number;
    cancelled: number;
    waitlist: number;
    capacity: number | null;
    attended: number;
    checkinRate: number;
    teams: number;
    completeTeams: number;
  };
  perDay: { label: string; count: number }[];
  colleges: { label: string; count: number }[];
  cities: { label: string; count: number }[];
  checkinDays: { day: string; count: number }[];
}

const dayLabel = (iso: string) => new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

// Daily sign-ups as columns, drawn to one scale with a faint grid and the peak labelled
function SignupChart({ data }: { data: { label: string; count: number }[] }) {
  if (data.length === 0) return <p className="text-[11px] text-white/40">No dated sign-ups yet. Dates are recorded for every registration from now on.</p>;
  const max = Math.max(...data.map((d) => d.count));
  const ticks = [0, Math.ceil(max / 2), max].filter((v, i, a) => a.indexOf(v) === i);
  const width = Math.max(320, data.length * 28);
  const height = 160;
  const pad = { left: 28, bottom: 22, top: 10 };
  const plotH = height - pad.bottom - pad.top;
  const barW = (width - pad.left) / data.length;
  const y = (v: number) => pad.top + plotH - (max ? (v / max) * plotH : 0);
  const totals = data.reduce<number[]>((acc, d) => [...acc, (acc[acc.length - 1] || 0) + d.count], []);

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} role="img" aria-label="Sign-ups per day" className="text-white">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={width} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity={0.08} />
            <text x={pad.left - 6} y={y(t) + 3} textAnchor="end" fontSize={9} fill="currentColor" fillOpacity={0.45}>
              {t}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.left + i * barW + 3;
          const isPeak = d.count === max;
          return (
            <g key={d.label}>
              <title>{`${dayLabel(d.label)}: ${d.count} sign-ups (${totals[i]} total)`}</title>
              <rect x={x} y={y(d.count)} width={Math.max(4, barW - 6)} height={pad.top + plotH - y(d.count)} rx={2} fill={isPeak ? "#34d399" : "#10b981"} fillOpacity={isPeak ? 1 : 0.55} />
              {isPeak && (
                <text x={x + (barW - 6) / 2} y={y(d.count) - 3} textAnchor="middle" fontSize={9} fill="#6ee7b7">
                  {d.count}
                </text>
              )}
              {(i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 6) === 0) && (
                <text x={x + (barW - 6) / 2} y={height - 6} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.45}>
                  {dayLabel(d.label)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function BarList({ rows, empty }: { rows: { label: string; count: number }[]; empty: string }) {
  if (rows.length === 0) return <p className="text-[11px] text-white/40">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.count));
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 items-center text-[11px]">
          <span className="truncate text-white/80" title={r.label}>
            {r.label}
          </span>
          <span className="tabular-nums text-white font-mono">{r.count}</span>
          <span className="col-span-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <span className="block h-full bg-emerald-500/70 rounded-full" style={{ width: `${(r.count / max) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function AnalyticsAdmin() {
  const [overview, setOverview] = useState<Overview[]>([]);
  const [eventId, setEventId] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<{ overview: Overview[] }>("/api/admin/analytics")
      .then((d) => setOverview(d.overview))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!eventId) return setDetail(null);
    setDetail(null);
    adminFetch<Detail>(`/api/admin/analytics?eventId=${encodeURIComponent(eventId)}`)
      .then(setDetail)
      .catch((e) => setError(e.message));
  }, [eventId]);

  const t = detail?.totals;

  return (
    <AdminShell title="Analytics" subtitle="Registrations, where people come from and who showed up. Numbers come from the Google Sheet plus check-ins recorded at the gate.">
      {error && <p className="text-xs text-red-400">{error}</p>}

      <Panel title="All events">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] min-w-[560px]">
            <thead className="text-white/40 uppercase text-[9px]">
              <tr>
                <th className="py-2">Event</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-right">Registered</th>
                <th className="text-right">Checked in</th>
                <th className="text-right">Turnout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {overview.map((e) => (
                <tr key={e.id} onClick={() => setEventId(e.id)} className={`cursor-pointer hover:bg-white/[0.03] ${eventId === e.id ? "bg-emerald-500/5" : ""}`}>
                  <td className="py-2 text-white font-semibold">{e.title}</td>
                  <td className="text-white/60 font-mono">{e.date}</td>
                  <td className="text-white/60">{e.status}</td>
                  <td className="text-right tabular-nums">{e.registrations}</td>
                  <td className="text-right tabular-nums">{e.attended || "–"}</td>
                  <td className="text-right tabular-nums">{e.registrations && e.attended ? `${Math.round((e.attended / e.registrations) * 100)}%` : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={`${inputClass} max-w-md`}>
        <option value="">Pick an event for details…</option>
        {overview.map((e) => (
          <option key={e.id} value={e.id}>
            {e.title}
          </option>
        ))}
      </select>

      {eventId && !detail && <p className="text-[11px] text-white/40 font-mono">Loading…</p>}
      {detail && t && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
            {[
              { label: "Registered", value: t.active, sub: t.capacity ? `of ${t.capacity} seats` : t.cancelled ? `${t.cancelled} cancelled` : "" },
              { label: "Checked in", value: t.attended, sub: `${t.checkinRate}% turnout` },
              { label: "Waitlist", value: t.waitlist, sub: "" },
              { label: "Teams", value: t.teams, sub: t.teams ? `${t.completeTeams} complete` : "" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-zinc-950 p-4">
                <p className="text-[9px] uppercase text-white/40">{s.label}</p>
                <p className="text-2xl font-black text-white tabular-nums">{s.value}</p>
                {s.sub && <p className="text-[10px] text-white/50">{s.sub}</p>}
              </div>
            ))}
          </div>

          <Panel title="Sign-ups per day (IST)">
            <SignupChart data={detail.perDay} />
          </Panel>

          <div className="grid gap-5 md:grid-cols-2">
            <Panel title="Top colleges" description="From the College answer, or the email domain when it wasn't asked.">
              <BarList rows={detail.colleges} empty="No registrations yet." />
            </Panel>
            <Panel title="Top cities" description="Turn on 'Ask for college and city' in the event editor to collect this.">
              <BarList rows={detail.cities} empty="City wasn't collected for this event." />
            </Panel>
          </div>

          {detail.checkinDays.length > 0 && (
            <Panel title="Check-ins by day">
              <BarList rows={detail.checkinDays.map((d) => ({ label: dayLabel(d.day), count: d.count }))} empty="" />
            </Panel>
          )}
        </div>
      )}
    </AdminShell>
  );
}
