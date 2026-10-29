"use client";

import { useEffect, useMemo, useState } from "react";
import { Megaphone, MonitorPlay, Radio, Trophy, X } from "lucide-react";
import type { Announcement, ScheduleItem } from "@/lib/content-types";

interface LiveData {
  window: "open" | "not-yet" | "closed";
  capacity: number | null;
  seatsLeft: number | null;
  waitlist: boolean;
  announcements: Announcement[];
  leaderboards: { roundId: string; name: string; rows: { rank: number; name: string; advanced: boolean }[] }[];
}

const time = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" }).format(new Date(iso));

// Everything on an event page that changes during the event: notices, what's on now and next,
// seats left and published results. Refreshes every 20 seconds; "Screen mode" fills a projector.
export default function EventLive({
  eventId,
  title,
  schedule,
  startsAt,
  endsAt,
  active,
}: {
  eventId: string;
  title: string;
  schedule: ScheduleItem[];
  startsAt?: string;
  endsAt?: string;
  active: boolean;
}) {
  const [data, setData] = useState<LiveData | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [screen, setScreen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/live`);
        const json = await res.json();
        if (!cancelled && json.success) setData(json);
      } catch {
        // Keep showing the last data we had
      }
    };
    load();
    setNow(Date.now());
    const poll = setInterval(load, 20_000);
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      cancelled = true;
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [eventId]);

  useEffect(() => {
    if (!screen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setScreen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen]);

  const { current, next } = useMemo(() => {
    if (now === null) return { current: [] as ScheduleItem[], next: null as ScheduleItem | null };
    const sorted = [...schedule].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const endOf = (item: ScheduleItem, i: number) =>
      item.endsAt ? new Date(item.endsAt).getTime() : sorted[i + 1] ? new Date(sorted[i + 1].startsAt).getTime() : new Date(item.startsAt).getTime() + 3_600_000;
    return {
      current: sorted.filter((item, i) => new Date(item.startsAt).getTime() <= now && endOf(item, i) > now),
      next: sorted.find((item) => new Date(item.startsAt).getTime() > now) || null,
    };
  }, [schedule, now]);

  const isLive =
    now !== null && startsAt && endsAt ? new Date(startsAt).getTime() <= now && new Date(endsAt).getTime() > now : current.length > 0;
  const hasLeaderboard = Boolean(data?.leaderboards.some((l) => l.rows.length > 0));
  const hasNotices = Boolean(data?.announcements.length);
  const showSchedule = isLive || current.length > 0 || (next && active);

  if (!active && !hasLeaderboard) return null;
  if (!showSchedule && !hasNotices && !hasLeaderboard && data?.seatsLeft == null) return null;

  const body = (big: boolean) => (
    <div className={big ? "grid gap-8 lg:grid-cols-2" : "grid gap-4 md:grid-cols-2"}>
      {showSchedule && (
        <div className={`rounded-2xl border border-white/10 bg-space-900/70 ${big ? "p-8" : "p-5"} space-y-4`}>
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent-300">On stage</p>
          {current.length > 0 ? (
            current.map((item) => (
              <div key={item.id}>
                <p className={`${big ? "text-4xl" : "text-lg"} font-bold text-white`}>{item.title}</p>
                <p className={`${big ? "text-xl" : "text-xs"} text-white/60 mt-1`}>
                  {[item.speaker, item.location, `${time(item.startsAt)}${item.endsAt ? ` – ${time(item.endsAt)}` : ""}`].filter(Boolean).join(" · ")}
                </p>
              </div>
            ))
          ) : (
            <p className={`${big ? "text-2xl" : "text-sm"} text-white/60`}>Nothing on right now.</p>
          )}
          {next && (
            <div className="border-t border-white/10 pt-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">Up next · {time(next.startsAt)}</p>
              <p className={`${big ? "text-2xl" : "text-sm"} font-semibold text-white/90 mt-1`}>{next.title}</p>
              {next.location && <p className={`${big ? "text-lg" : "text-xs"} text-white/50`}>{next.location}</p>}
            </div>
          )}
        </div>
      )}

      {(hasNotices || (data?.seatsLeft != null && active)) && (
        <div className={`rounded-2xl border border-accent-300/20 bg-accent-500/[0.04] ${big ? "p-8" : "p-5"} space-y-3`}>
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent-300 flex items-center gap-1.5">
            <Megaphone size={12} /> Updates
          </p>
          {data?.seatsLeft != null && active && data.window === "open" && (
            <p className={`${big ? "text-xl" : "text-sm"} font-semibold text-white`}>
              {data.seatsLeft > 0 ? `${data.seatsLeft} ${data.seatsLeft === 1 ? "seat" : "seats"} left` : data.waitlist ? "Full. New sign-ups join the waitlist." : "Full."}
            </p>
          )}
          {data?.announcements.slice(0, big ? 3 : 5).map((a) => (
            <div key={a.id} className="border-t border-white/5 pt-3 first:border-0 first:pt-0">
              <p className={`${big ? "text-2xl" : "text-sm"} text-white/90 leading-relaxed`}>{a.text}</p>
              {a.link && !big && (
                <a href={a.link} className="text-xs text-accent-300 hover:text-accent-200 underline underline-offset-2">
                  {a.linkLabel || "Details"}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {data?.leaderboards
        .filter((l) => l.rows.length > 0)
        .map((board) => (
          <div key={board.roundId} className={`rounded-2xl border border-nebula-400/20 bg-nebula-500/[0.05] ${big ? "p-8" : "p-5"} space-y-3`}>
            <p className="font-mono text-[10px] uppercase tracking-widest text-nebula-300 flex items-center gap-1.5">
              <Trophy size={12} /> {board.name} results
            </p>
            <ol className="space-y-1.5">
              {board.rows.map((row) => (
                <li key={`${row.rank}-${row.name}`} className={`flex items-center gap-3 ${big ? "text-2xl" : "text-sm"}`}>
                  <span className="w-8 font-mono tabular-nums text-white/50">{row.rank}</span>
                  <span className="flex-1 text-white">{row.name}</span>
                  {row.advanced && <span className="font-mono text-[10px] uppercase tracking-widest text-green-400">Through</span>}
                </li>
              ))}
            </ol>
          </div>
        ))}
    </div>
  );

  return (
    <section aria-label="Live updates" className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          {isLive && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          )}
          {isLive ? "Live now" : "Updates"}
          {!isLive && <Radio size={14} className="text-white/40" />}
        </h2>
        <button
          onClick={() => setScreen(true)}
          className="text-[10px] font-mono uppercase tracking-widest text-white/60 hover:text-white flex items-center gap-1.5"
        >
          <MonitorPlay size={13} /> Screen mode
        </button>
      </div>
      {body(false)}

      {screen && (
        <div className="fixed inset-0 z-[200] bg-space overflow-y-auto p-6 sm:p-12" role="dialog" aria-modal="true" aria-label={`${title} live screen`}>
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-300">BIMTECH E-Cell {isLive ? "· Live" : ""}</p>
                <h2 className="font-display text-4xl sm:text-6xl font-bold text-white mt-2">{title}</h2>
              </div>
              <button onClick={() => setScreen(false)} aria-label="Leave screen mode" className="p-3 rounded-full border border-white/10 text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>
            {body(true)}
          </div>
        </div>
      )}
    </section>
  );
}
