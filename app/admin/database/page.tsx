"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { AdminShell, Button, Panel, adminFetch, inputClass } from "@/components/admin/AdminKit";

interface Counts {
  events: number;
  registrations: number;
  candidates: number;
  alumni: number;
  graveyard: number;
}

interface Submission {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

interface Status {
  configured: boolean;
  sheetConfigured: boolean;
  tablesReady: boolean;
  source: "database" | "sheet";
  counts: (Counts & { pendingSubmissions: number }) | null;
  sheet: Counts | null;
  sheetError: string | null;
  lastImport: string | null;
  submissions: Submission[];
}

const ROWS: { key: keyof Counts; label: string }[] = [
  { key: "events", label: "Events" },
  { key: "registrations", label: "Event registrations" },
  { key: "candidates", label: "Recruitment candidates" },
  { key: "alumni", label: "Alumni" },
  { key: "graveyard", label: "Graveyard" },
];

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "never");

function Step({ n, title, done, children }: { n: number; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start border border-white/5 rounded-xl p-4">
      <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${done ? "bg-emerald-500 text-black" : "bg-white/10 text-white/60"}`}>
        {done ? "✓" : n}
      </span>
      <div className="space-y-2 min-w-0 flex-1">
        <p className="text-xs font-bold text-white">{title}</p>
        {children}
      </div>
    </div>
  );
}

export default function DatabaseAdminPage() {
  return (
    <AdminShell title="Data" subtitle="Where the site keeps its records, the switch from the Google Sheet to the database, and spreadsheet downloads.">
      <DatabaseAdmin />
    </AdminShell>
  );
}

// Rendered only once the admin is signed in, so the first load is authorised
function DatabaseAdmin() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [exportEvent, setExportEvent] = useState("");

  const load = useCallback(async (compare = false) => {
    try {
      setStatus(await adminFetch<Status>(`/api/admin/database${compare ? "?compare=1" : ""}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    load(true);
    fetch("/api/events?mode=events")
      .then((r) => r.json())
      .then((d) => d.success && setEvents(d.data || []))
      .catch(() => {});
  }, [load]);

  const act = async (key: string, body: Record<string, unknown>, done: (d: any) => string, confirmText?: string) => {
    if (confirmText && !confirm(confirmText)) return;
    setBusy(key);
    setMessage("");
    setError("");
    try {
      const data = await adminFetch("/api/admin/database", { method: "POST", body: JSON.stringify(body) });
      setMessage(done(data));
      await load(key === "import");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy("");
    }
  };

  const onDatabase = status?.source === "database";
  const imported = Boolean(status?.lastImport);

  return (
    <>
      {(message || error) && (
        <p className={`text-xs rounded-xl px-4 py-3 border ${error ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>
          {error || message}
        </p>
      )}

      <Panel
        title="Where records live"
        description={
          onDatabase
            ? "The site reads and writes the database. The Google Sheet is no longer updated and stays as a backup."
            : "The site still reads and writes the Google Sheet. Follow the steps below to move to the database."
        }
        actions={
          <span className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase ${onDatabase ? "bg-emerald-500 text-black" : "bg-amber-400/90 text-black"}`}>
            {status ? (onDatabase ? "Database" : "Google Sheet") : "…"}
          </span>
        }
      >
        {status && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[9px] uppercase tracking-wider text-white/40 font-mono">
                  <th className="py-2 pr-4 font-bold">Records</th>
                  <th className="py-2 pr-4 font-bold text-right">Google Sheet</th>
                  <th className="py-2 font-bold text-right">Database</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => {
                  const s = status.sheet?.[row.key];
                  const d = status.counts?.[row.key];
                  const short = s !== undefined && d !== undefined && d < s;
                  return (
                    <tr key={row.key} className="border-t border-white/5">
                      <td className="py-2 pr-4 text-white/80">{row.label}</td>
                      <td className="py-2 pr-4 text-right font-mono text-white/60">{s ?? "–"}</td>
                      <td className={`py-2 text-right font-mono ${short ? "text-amber-300" : "text-white"}`}>{d ?? "–"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {status.sheetError && <p className="text-[11px] text-amber-300 mt-2">Couldn&apos;t read the Sheet: {status.sheetError}</p>}
            <p className="text-[10px] text-white/40 mt-2">
              Last copied from the Sheet: {when(status.lastImport)}. The database can show slightly fewer rows when the Sheet has duplicate IDs.
            </p>
          </div>
        )}
      </Panel>

      {status && (
        <Panel title="Move to the database" description="Each step can be repeated. Nothing in the Google Sheet is changed or deleted.">
          <div className="space-y-3">
            <Step n={1} title="Connect Neon in Vercel" done={status.configured}>
              <p className="text-[11px] text-white/50 leading-relaxed">
                In Vercel open the project, go to <b>Storage → Create Database → Neon</b> on the free plan and connect it to this project. That adds{" "}
                <code className="text-emerald-300">DATABASE_URL</code>. Then redeploy.
              </p>
            </Step>
            <Step n={2} title="Create the tables" done={status.tablesReady}>
              <Button disabled={!status.configured} busy={busy === "setup"} onClick={() => act("setup", { action: "setup" }, () => "Tables are ready.")}>
                Create tables
              </Button>
            </Step>
            <Step n={3} title="Copy everything from the Google Sheet" done={imported}>
              <p className="text-[11px] text-white/50">Reads events, registrations, recruitment, alumni and graveyard from the Sheet. Running it again refreshes the copy.</p>
              <Button
                disabled={!status.tablesReady || onDatabase || !status.sheetConfigured}
                busy={busy === "import"}
                onClick={() =>
                  act("import", { action: "import" }, (d) =>
                    `Copied ${d.imported.events} events, ${d.imported.registrations} registrations, ${d.imported.candidates} candidates, ${d.imported.alumni} alumni and ${d.imported.graveyard} graveyard entries.${
                      d.imported.skipped?.length ? ` The Sheet's script doesn't offer ${d.imported.skipped.join(", ")}, so those start empty.` : ""
                    }`,
                  )
                }
              >
                Copy from Sheet
              </Button>
            </Step>
            <Step n={4} title="Switch the site to the database" done={onDatabase}>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Check the counts above match first. After the switch, new sign-ups go only to the database. Copy from the Sheet once more right before switching, so
                nobody who registered in between is missed.
              </p>
              {onDatabase ? (
                <Button
                  tone="danger"
                  busy={busy === "switch"}
                  onClick={() =>
                    act(
                      "switch",
                      { action: "switch", to: "sheet" },
                      () => "Switched back to the Google Sheet.",
                      "Switch back to the Google Sheet? Anything saved to the database since the switch won't be in the Sheet.",
                    )
                  }
                >
                  Switch back to Sheet
                </Button>
              ) : (
                <Button
                  disabled={!imported}
                  busy={busy === "switch"}
                  onClick={() =>
                    act("switch", { action: "switch", to: "database" }, () => "The site now runs on the database.", "Switch the whole site to the database now?")
                  }
                >
                  Switch to database
                </Button>
              )}
            </Step>
          </div>
        </Panel>
      )}

      <Panel title="Download as spreadsheet" description="CSV files open in Google Sheets or Excel. They come from wherever the site currently keeps its records.">
        <div className="flex flex-wrap items-end gap-2">
          <select value={exportEvent} onChange={(e) => setExportEvent(e.target.value)} className={`${inputClass} max-w-xs`}>
            <option value="">All events</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
          <a
            href={`/api/admin/export?what=registrations${exportEvent ? `&eventId=${encodeURIComponent(exportEvent)}` : ""}`}
            className="px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5"
          >
            <Download size={12} /> Registrations
          </a>
          {[
            ["candidates", "Recruitment"],
            ["events", "Events"],
            ["alumni", "Alumni"],
            ["graveyard", "Graveyard"],
          ].map(([what, label]) => (
            <a
              key={what}
              href={`/api/admin/export?what=${what}`}
              className="px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/10 text-white/80 hover:text-white hover:bg-white/5 flex items-center gap-1.5"
            >
              <Download size={12} /> {label}
            </a>
          ))}
        </div>
      </Panel>

      {onDatabase && (
        <Panel
          title="Waiting for review"
          description="Alumni profiles and graveyard stories sent from the site. Approving one puts it on the public page."
        >
          {status!.submissions.length === 0 ? (
            <p className="text-[11px] text-white/40">Nothing waiting.</p>
          ) : (
            <div className="space-y-2">
              {status!.submissions.map((s) => (
                <div key={s.id} className="border border-white/5 rounded-xl p-3 flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-[9px] font-mono uppercase text-emerald-400">
                      {s.type === "ALUMNI_REGISTRATION" ? "Alumni" : s.type === "GRAVEYARD_SUBMISSION" ? "Graveyard" : s.type} · {when(s.createdAt)}
                    </p>
                    <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-0.5 text-[11px]">
                      {Object.entries(s.payload).map(([k, v]) => (
                        <React.Fragment key={k}>
                          <dt className="text-white/40">{k}</dt>
                          <dd className="text-white/80 break-words">{String(v)}</dd>
                        </React.Fragment>
                      ))}
                    </dl>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {s.type !== "VENTURE_SIMULATION" && (
                      <Button busy={busy === `ok-${s.id}`} onClick={() => act(`ok-${s.id}`, { action: "review-submission", id: s.id, approve: true }, () => "Approved and published.")}>
                        Approve
                      </Button>
                    )}
                    <Button tone="ghost" busy={busy === `no-${s.id}`} onClick={() => act(`no-${s.id}`, { action: "review-submission", id: s.id, approve: false }, () => "Dismissed.")}>
                      {s.type === "VENTURE_SIMULATION" ? "Dismiss" : "Reject"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}
    </>
  );
}
