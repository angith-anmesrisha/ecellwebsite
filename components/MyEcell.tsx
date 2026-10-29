"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, CheckCircle2, Clock, Layers, Loader2, LogOut, Mail, MapPin, QrCode, Send, Trophy, Users } from "lucide-react";
import Turnstile from "./Turnstile";

interface Round {
  id: string;
  name: string;
  submissionLabel: string;
  closesAt: string | null;
  open: boolean;
  eligible: boolean;
  submission: { link: string; note?: string; at: string } | null;
}

interface Pass {
  regId: string;
  passCode: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventStatus: string;
  slug: string | null;
  venue: string | null;
  cancelled: boolean;
  checkins: { at: string; by: string }[];
  team: { name: string; code: string; members: string[]; isLeader: boolean } | null;
  rounds: Round[];
}

interface Profile {
  email: string;
  passes: Pass[];
  waitlisted: { eventId: string; eventTitle: string }[];
  series: { id: string; title: string; total: number; required: number; attended: number }[];
  recruitment: { status: string; name: string } | null;
}

const qrUrl = (code: string) => `https://quickchart.io/qr?text=${encodeURIComponent(code)}&size=220&margin=1`;
const when = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

const button = "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-40";

async function call(body: Record<string, unknown>) {
  const res = await fetch("/api/me", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return res.json();
}

function SignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = await call({ action: "send-code", email, captchaToken }).catch(() => ({ success: false }));
    setBusy(false);
    if (data.success) setStep("code");
    else {
      setError(data.error || "We couldn't send the code. Please try again.");
      setCaptchaReset((n) => n + 1);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = await call({ action: "verify-code", email, code }).catch(() => ({ success: false }));
    setBusy(false);
    if (data.success) onSignedIn();
    else setError(data.error || "That code didn't work.");
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-white/70 leading-relaxed">
        See your event passes, check-ins, teams and competition entries. We&apos;ll email you a 6-digit code to sign in.
      </p>
      {step === "email" ? (
        <form onSubmit={sendCode} className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-[9px] uppercase font-mono text-white/60 tracking-widest font-bold">Email you registered with</span>
            <div className="flex items-center bg-black border border-white/10 rounded-xl px-3 focus-within:border-nebula-500">
              <Mail size={14} className="text-white/50" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@domain.com" className="w-full bg-transparent px-3 py-2.5 text-xs font-mono text-white focus:outline-none" />
            </div>
          </label>
          <Turnstile onToken={setCaptchaToken} resetKey={captchaReset} />
          <button disabled={busy} className="w-full py-2.5 bg-white text-black font-mono font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-2 disabled:opacity-40">
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Email me a code
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-[9px] uppercase font-mono text-white/60 tracking-widest font-bold">Code sent to {email}</span>
            <input
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-lg font-mono tracking-[0.5em] text-white text-center focus:outline-none focus:border-nebula-500"
            />
          </label>
          <button disabled={busy || code.length !== 6} className="w-full py-2.5 bg-white text-black font-mono font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-2 disabled:opacity-40">
            {busy ? <Loader2 size={12} className="animate-spin" /> : null} Open My E-Cell
          </button>
          <button type="button" onClick={() => setStep("email")} className="w-full text-[11px] text-white/60 hover:text-white">
            Use a different email
          </button>
        </form>
      )}
      {error && <p role="alert" className="text-[11px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
    </div>
  );
}

function RoundEntry({ eventId, round, onSaved }: { eventId: string; round: Round; onSaved: () => void }) {
  const [link, setLink] = useState(round.submission?.link || "");
  const [note, setNote] = useState(round.submission?.note || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (!round.eligible) {
    return <p className="text-[11px] text-white/50">{round.name}: your entry isn&apos;t in this round.</p>;
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const data = await call({ action: "submit-entry", eventId, roundId: round.id, link, note }).catch(() => ({ success: false }));
    setBusy(false);
    setMessage(data.success ? "Saved." : data.error || "Couldn't save.");
    if (data.success) onSaved();
  };

  return (
    <div className="rounded-lg border border-nebula-400/20 bg-nebula-500/[0.05] p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
          <Trophy size={12} className="text-nebula-300" /> {round.name}
        </p>
        <span className="text-[10px] font-mono text-white/50">
          {round.open ? (round.closesAt ? `Closes ${when(round.closesAt)}` : "Open") : "Closed"}
        </span>
      </div>
      {round.submission && (
        <p className="text-[11px] text-white/70 break-all">
          Submitted {when(round.submission.at)}:{" "}
          <a href={round.submission.link} target="_blank" rel="noopener noreferrer" className="text-nebula-300 underline">
            {round.submission.link}
          </a>
        </p>
      )}
      {round.open && (
        <form onSubmit={save} className="space-y-2">
          <input required type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder={`${round.submissionLabel} (https://...)`} className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-2 text-[11px] text-white" />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for the judges (optional)" className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-2 text-[11px] text-white" />
          <div className="flex items-center gap-3">
            <button disabled={busy} className={`${button} bg-nebula-600 hover:bg-nebula-500 text-white`}>
              {round.submission ? "Update entry" : "Submit entry"}
            </button>
            {message && <span className="text-[11px] text-white/70">{message}</span>}
          </div>
        </form>
      )}
    </div>
  );
}

function PassCard({ pass, reload }: { pass: Pass; reload: () => void }) {
  const [showQr, setShowQr] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const active = pass.eventStatus === "ACTIVE" && !pass.cancelled;

  const act = async (action: "resend-pass" | "cancel") => {
    setBusy(true);
    setMessage("");
    const data = await call({ action, regId: pass.regId }).catch(() => ({ success: false }));
    setBusy(false);
    if (action === "resend-pass") setMessage(data.success ? "Pass emailed again." : data.error || "Couldn't send.");
    if (action === "cancel") {
      setConfirmCancel(false);
      if (data.success) reload();
      else setMessage(data.error || "Couldn't cancel.");
    }
  };

  return (
    <li className={`rounded-xl border p-4 space-y-3 ${pass.cancelled ? "border-white/5 opacity-60" : "border-white/10 bg-black/40"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {pass.slug ? (
            <Link href={`/events/${pass.slug}`} className="text-sm font-bold text-white hover:text-accent-200">
              {pass.eventTitle}
            </Link>
          ) : (
            <p className="text-sm font-bold text-white">{pass.eventTitle}</p>
          )}
          <p className="text-[11px] font-mono text-white/60 flex flex-wrap gap-x-3 mt-0.5">
            {pass.eventDate && (
              <span className="flex items-center gap-1">
                <Calendar size={11} /> {pass.eventDate}
              </span>
            )}
            {pass.venue && (
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {pass.venue}
              </span>
            )}
          </p>
        </div>
        <span
          className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
            pass.cancelled
              ? "bg-white/5 text-white/50"
              : pass.checkins.length > 0
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                : active
                  ? "bg-nebula-500/10 text-nebula-300 border border-nebula-500/20"
                  : "bg-white/5 text-white/50"
          }`}
        >
          {pass.cancelled ? "Cancelled" : pass.checkins.length > 0 ? "Checked in" : active ? "Confirmed" : "Past"}
        </span>
      </div>

      {pass.checkins.length > 0 && (
        <p className="text-[11px] text-emerald-300/80 flex items-center gap-1.5">
          <CheckCircle2 size={12} /> Entered {pass.checkins.map((c) => when(c.at)).join(", ")}
        </p>
      )}

      {pass.team && (
        <div className="text-[11px] text-white/70 space-y-1">
          <p className="flex items-center gap-1.5">
            <Users size={12} className="text-nebula-300" /> Team <strong className="text-white">{pass.team.name}</strong>
            {pass.team.isLeader && <span className="text-white/50">(you started it)</span>}
          </p>
          <p>
            Members: {pass.team.members.join(", ")} · Code <span className="font-mono tracking-widest text-white">{pass.team.code}</span>
          </p>
        </div>
      )}

      {pass.rounds.map((round) => (
        <RoundEntry key={round.id} eventId={pass.eventId} round={round} onSaved={reload} />
      ))}

      {active && (
        <div className="space-y-3">
          {showQr && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl(pass.passCode)} alt={`Entry QR for ${pass.eventTitle}`} width={180} height={180} className="mx-auto rounded-xl bg-white p-2" />
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setShowQr((v) => !v)} className={`${button} bg-white text-black hover:bg-zinc-200 flex items-center gap-1`}>
              <QrCode size={12} /> {showQr ? "Hide QR" : "Show entry QR"}
            </button>
            <button disabled={busy} onClick={() => act("resend-pass")} className={`${button} border border-white/10 text-white/80 hover:text-white`}>
              Email pass again
            </button>
            {!confirmCancel ? (
              <button onClick={() => setConfirmCancel(true)} className={`${button} text-red-300/80 hover:text-red-300`}>
                Cancel registration
              </button>
            ) : (
              <span className="flex items-center gap-2 text-[11px] text-white/70">
                Free up your seat?
                <button disabled={busy} onClick={() => act("cancel")} className={`${button} bg-red-500/20 text-red-200 border border-red-500/30`}>
                  Yes, cancel
                </button>
                <button onClick={() => setConfirmCancel(false)} className={`${button} text-white/60`}>
                  Keep it
                </button>
              </span>
            )}
          </div>
          <p className="text-[10px] font-mono text-white/40">Pass ID {pass.regId}</p>
        </div>
      )}
      {message && <p className="text-[11px] text-white/70">{message}</p>}
    </li>
  );
}

// Signed-in student view: passes with QR, check-ins, teams, competition entries, series progress
export default function MyEcell() {
  const [state, setState] = useState<"loading" | "signed-out" | "ready" | "error">("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "We couldn't load your details.");
        setState("error");
      } else if (!data.signedIn) {
        setState("signed-out");
      } else {
        setProfile(data.profile);
        setState("ready");
      }
    } catch {
      setError("Connection problem. Please try again.");
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (state === "loading") return <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-white/40" size={20} /></div>;
  if (state === "signed-out") return <SignIn onSignedIn={() => { setState("loading"); load(); }} />;
  if (state === "error" || !profile) return <p className="text-xs text-red-300">{error}</p>;

  const signOut = async () => {
    await call({ action: "sign-out" }).catch(() => {});
    setProfile(null);
    setState("signed-out");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 text-[11px] font-mono">
        <span className="text-white/60 truncate">{profile.email}</span>
        <button onClick={signOut} className="flex items-center gap-1 text-white/60 hover:text-white">
          <LogOut size={12} /> Sign out
        </button>
      </div>

      {profile.waitlisted.map((w) => (
        <p key={w.eventId} className="text-[11px] text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
          <Clock size={12} /> You&apos;re on the waitlist for {w.eventTitle}. We&apos;ll email you if a seat opens.
        </p>
      ))}

      {profile.series.length > 0 && (
        <div className="space-y-2">
          {profile.series.map((s) => (
            <div key={s.id} className="rounded-xl border border-white/10 p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Layers size={12} className="text-nebula-300" /> {s.title}
                </span>
                <span className="font-mono text-white/70 tabular-nums">
                  {s.attended} of {s.total} attended
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-nebula-400" style={{ width: `${Math.min(100, (s.attended / Math.max(1, s.total)) * 100)}%` }} />
              </div>
              <p className="text-[10px] text-white/50">
                {s.attended >= s.required ? "Series complete." : `${s.required - s.attended} more to complete the series.`}
              </p>
            </div>
          ))}
        </div>
      )}

      {profile.passes.length === 0 ? (
        <p className="text-xs text-white/60">
          No registrations on this email yet. <Link href="/events" className="text-accent-300 underline">See open events</Link>.
        </p>
      ) : (
        <ul className="space-y-3">
          {profile.passes.map((pass) => (
            <PassCard key={pass.regId} pass={pass} reload={load} />
          ))}
        </ul>
      )}

      {profile.recruitment && (
        <p className="text-[11px] text-white/60 flex items-center gap-1.5 border-t border-white/5 pt-3">
          Recruitment status: <strong className="text-white">{profile.recruitment.status.replace(/_/g, " ")}</strong>. Use the Recruitment tab for details.
        </p>
      )}
    </div>
  );
}
