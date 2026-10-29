"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ShieldCheck, ShieldAlert, Camera, XCircle, RefreshCw, Upload, Users, WifiOff, Keyboard, AlertTriangle } from "lucide-react";

interface GateScannerProps {
  onClose: () => void;
  events: { id: string; title: string; status: string }[];
}

interface ScanStatus {
  state: "IDLE" | "SCANNING" | "VALID" | "ALREADY" | "INVALID" | "ERROR" | "QUEUED";
  message: string;
  attendeeName?: string;
  eventTitle?: string;
  note?: string;
}

interface QueuedScan {
  code: string;
  by: string;
  eventId: string;
  at: string;
}

const QUEUE_KEY = "ecell_checkin_queue";
const VOLUNTEER_KEY = "ecell_gate_volunteer";
const EVENT_KEY = "ecell_gate_event";

const readQueue = (): QueuedScan[] => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
};
const writeQueue = (queue: QueuedScan[]) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full or blocked; nothing else we can do
  }
};

const clock = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

// Gate check-in: scans a pass QR (or a typed pass ID), records the entry once per day,
// warns on re-use, and keeps scans in a local queue when the network drops.
export default function GateScanner({ onClose, events }: GateScannerProps) {
  const [status, setStatus] = useState<ScanStatus>({ state: "IDLE", message: "Point the camera at a pass QR code." });
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [eventId, setEventId] = useState("");
  const [volunteer, setVolunteer] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [counts, setCounts] = useState<{ today: number; total: number; registered: number | null } | null>(null);
  const [queued, setQueued] = useState(0);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const busyRef = useRef(false);
  const lastScanRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });
  const settingsRef = useRef({ eventId: "", volunteer: "" });
  useEffect(() => {
    settingsRef.current = { eventId, volunteer };
  }, [eventId, volunteer]);

  useEffect(() => {
    try {
      setVolunteer(localStorage.getItem(VOLUNTEER_KEY) || "");
      setEventId(localStorage.getItem(EVENT_KEY) || "");
    } catch {
      // Private mode
    }
    setQueued(readQueue().length);
  }, []);

  const refreshCounts = useCallback(async () => {
    const id = settingsRef.current.eventId;
    if (!id) return setCounts(null);
    try {
      const res = await fetch(`/api/checkin?eventId=${encodeURIComponent(id)}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success) setCounts({ today: data.today, total: data.total, registered: data.registered });
    } catch {
      // Headcount is best-effort
    }
  }, []);

  useEffect(() => {
    refreshCounts();
    const timer = setInterval(refreshCounts, 15_000);
    return () => clearInterval(timer);
  }, [eventId, refreshCounts]);

  const postScan = async (scan: { code: string; by: string; eventId: string }) => {
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scan),
    });
    if (res.status === 401) throw new Error("SESSION");
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Check failed");
    return data.result;
  };

  const flushQueue = useCallback(async () => {
    const queue = readQueue();
    if (queue.length === 0) return;
    const remaining: QueuedScan[] = [];
    for (const scan of queue) {
      try {
        await postScan(scan);
      } catch {
        remaining.push(scan);
      }
    }
    writeQueue(remaining);
    setQueued(remaining.length);
    refreshCounts();
  }, [refreshCounts]);

  useEffect(() => {
    window.addEventListener("online", flushQueue);
    const timer = setInterval(flushQueue, 20_000);
    return () => {
      window.removeEventListener("online", flushQueue);
      clearInterval(timer);
    };
  }, [flushQueue]);

  const handleCode = async (raw: string) => {
    const code = raw.trim();
    if (!code || busyRef.current) return;
    // The camera reads the same QR many times a second; ignore repeats for a few seconds
    const now = Date.now();
    if (lastScanRef.current.code === code && now - lastScanRef.current.at < 5000) return;
    lastScanRef.current = { code, at: now };
    busyRef.current = true;
    setStatus({ state: "SCANNING", message: "Checking pass..." });

    const scan = { code, by: settingsRef.current.volunteer || "gate", eventId: settingsRef.current.eventId };
    try {
      const result = await postScan(scan);
      if (result.state === "VALID") {
        setStatus({
          state: "VALID",
          message: "Let them in",
          attendeeName: result.name,
          eventTitle: result.eventTitle,
          note: result.signed ? undefined : "Older pass without a signature. Check their ID if unsure.",
        });
        refreshCounts();
      } else if (result.state === "ALREADY") {
        setStatus({
          state: "ALREADY",
          message: `Already checked in at ${clock(result.previous.at)}${result.previous.by ? ` by ${result.previous.by}` : ""}`,
          attendeeName: result.name,
          eventTitle: result.eventTitle,
          note: "Same pass scanned twice today. Check the person matches the name.",
        });
      } else {
        setStatus({ state: "INVALID", message: result.message });
      }
    } catch (err) {
      if (err instanceof Error && err.message === "SESSION") {
        setStatus({ state: "ERROR", message: "Your admin session expired. Close the scanner and sign in again." });
      } else if (!navigator.onLine || err instanceof TypeError) {
        const queue = [...readQueue(), { ...scan, at: new Date().toISOString() }];
        writeQueue(queue);
        setQueued(queue.length);
        setStatus({
          state: "QUEUED",
          message: "No connection. Scan saved and will sync when you're back online.",
          note: "It couldn't be verified yet. Check the person's ID or email before letting them in.",
        });
      } else {
        setStatus({ state: "ERROR", message: err instanceof Error ? err.message : "Couldn't verify this pass." });
      }
    } finally {
      // Short pause so the volunteer can read the result before the next scan
      setTimeout(() => (busyRef.current = false), 1500);
    }
  };

  const handleCodeRef = useRef(handleCode);
  useEffect(() => {
    handleCodeRef.current = handleCode;
  });

  const startScannerWithDelay = () => {
    setTimeout(() => {
      try {
        if (scannerRef.current) scannerRef.current.clear().catch(() => {});
        scannerRef.current = new Html5QrcodeScanner(
          "qr-reader-target",
          { fps: 10, qrbox: { width: 240, height: 240 }, rememberLastUsedCamera: true },
          false,
        );
        scannerRef.current.render(
          (decodedText) => handleCodeRef.current(decodedText),
          () => {
            // Keep scanning quietly
          },
        );
        setHasCameraPermission(true);
      } catch (err) {
        console.error("Scanner setup failed:", err);
        setHasCameraPermission(false);
        setStatus({ state: "ERROR", message: "Camera couldn't start. Type the pass ID or upload a photo instead." });
      }
    }, 600);
  };

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      startScannerWithDelay();
    } else {
      setHasCameraPermission(false);
      setStatus({ state: "ERROR", message: "The camera needs a secure (HTTPS) connection." });
    }
    return () => {
      if (scannerRef.current) scannerRef.current.clear().catch((err) => console.error("Scanner clear failure:", err));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      stream.getTracks().forEach((track) => track.stop());
      startScannerWithDelay();
    } catch {
      setHasCameraPermission(false);
      setStatus({ state: "ERROR", message: "Camera access was denied. Allow it in the browser's address bar." });
    }
  };

  const handleFileUploadFallback = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const decodedText = await new Html5Qrcode("qr-file-target").scanFile(file, false);
      lastScanRef.current = { code: "", at: 0 };
      handleCode(decodedText);
    } catch {
      setStatus({ state: "ERROR", message: "Couldn't find a QR code in that photo." });
    }
    e.target.value = "";
  };

  const tone =
    status.state === "VALID"
      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
      : status.state === "ALREADY" || status.state === "QUEUED"
        ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
        : status.state === "INVALID" || status.state === "ERROR"
          ? "bg-red-500/10 border-red-500/40 text-red-300"
          : status.state === "SCANNING"
            ? "bg-blue-500/10 border-blue-500/30 text-blue-300 animate-pulse"
            : "bg-zinc-900/50 border-white/5 text-white/60";

  const activeEvents = events.filter((e) => e.status === "ACTIVE");

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 font-mono text-xs text-white overflow-y-auto">
      <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-5 space-y-4 shadow-2xl relative">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Camera size={14} /> Gate check-in
            </h2>
            <p className="text-[10px] text-white/50">Each pass gets in once per day</p>
          </div>
          <button onClick={onClose} aria-label="Close scanner" className="p-1 text-white/50 hover:text-white transition">
            <XCircle size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1">
            <span className="text-[9px] uppercase tracking-wider text-white/50">Event</span>
            <select
              value={eventId}
              onChange={(e) => {
                setEventId(e.target.value);
                try {
                  localStorage.setItem(EVENT_KEY, e.target.value);
                } catch {}
              }}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white"
            >
              <option value="">Any active event</option>
              {activeEvents.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[9px] uppercase tracking-wider text-white/50">Your name</span>
            <input
              value={volunteer}
              onChange={(e) => {
                setVolunteer(e.target.value);
                try {
                  localStorage.setItem(VOLUNTEER_KEY, e.target.value);
                } catch {}
              }}
              placeholder="Gate 1 · Riya"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white"
            />
          </label>
        </div>

        {(counts || queued > 0) && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[11px]">
            {counts ? (
              <span className="flex items-center gap-1.5 text-white/80">
                <Users size={12} className="text-blue-300" />
                <strong className="text-white tabular-nums">{counts.today}</strong> in today
                {counts.registered ? <span className="text-white/50"> of {counts.registered} registered</span> : null}
              </span>
            ) : (
              <span />
            )}
            {queued > 0 && (
              <button onClick={flushQueue} className="flex items-center gap-1 text-amber-300 hover:text-amber-200">
                <WifiOff size={12} /> {queued} waiting to sync
              </button>
            )}
          </div>
        )}

        <div className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden relative min-h-[240px] flex flex-col items-center justify-center p-2">
          <style>{`
            #qr-reader-target { border: none !important; width: 100% !important; }
            #qr-reader-target button { color: black !important; background: white !important; font-size: 11px !important; font-family: monospace !important; font-weight: bold !important; padding: 6px 12px !important; border-radius: 8px !important; border: none !important; cursor: pointer !important; margin-top: 10px !important; }
            #qr-reader-target select { background: #18181b !important; color: white !important; border-radius: 6px !important; padding: 4px !important; font-size: 11px !important; margin-bottom: 10px !important; }
            #qr-reader-target__dashboard_section_csr { color: white !important; font-family: monospace !important; }
          `}</style>
          <div id="qr-reader-target" className="w-full text-white" />
          <div id="qr-file-target" className="hidden" />
          {hasCameraPermission === false && (
            <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
              <Camera size={32} className="text-zinc-500" />
              <p className="text-zinc-400 max-w-xs font-sans text-xs">The camera isn&apos;t on yet.</p>
              <button onClick={requestCameraAccess} className="px-4 py-2 bg-white text-black font-sans font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-zinc-200 transition">
                Allow camera access
              </button>
            </div>
          )}
        </div>

        <div className={`p-4 rounded-xl border text-center space-y-2 transition-colors duration-300 ${tone}`} role="status" aria-live="assertive">
          <div className="flex justify-center">
            {status.state === "VALID" && <ShieldCheck size={30} />}
            {(status.state === "INVALID" || status.state === "ERROR") && <ShieldAlert size={30} />}
            {(status.state === "ALREADY" || status.state === "QUEUED") && <AlertTriangle size={30} />}
            {status.state === "SCANNING" && <RefreshCw size={24} className="animate-spin" />}
          </div>
          <p className="font-bold tracking-wide text-[13px] font-sans">{status.message}</p>
          {status.attendeeName && (
            <div className="text-left bg-black/40 border border-white/5 p-3 rounded-lg text-[11px] text-white space-y-1 font-sans">
              <p>
                <span className="text-white/50 font-mono uppercase text-[9px]">Name:</span> <strong>{status.attendeeName}</strong>
              </p>
              <p>
                <span className="text-white/50 font-mono uppercase text-[9px]">Event:</span> <span className="text-white/80">{status.eventTitle}</span>
              </p>
            </div>
          )}
          {status.note && <p className="text-[10px] font-sans text-white/70">{status.note}</p>}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            lastScanRef.current = { code: "", at: 0 };
            handleCode(manualCode);
            setManualCode("");
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Keyboard size={12} className="absolute left-2.5 top-2.5 text-white/40" />
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Type a pass ID"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-7 pr-2 py-2 text-[11px] text-white"
            />
          </div>
          <button type="submit" className="px-3 bg-white text-black rounded-lg font-bold text-[10px] uppercase">
            Check
          </button>
          <label className="cursor-pointer flex items-center gap-1.5 text-[10px] uppercase text-zinc-300 bg-white/5 border border-white/10 px-3 rounded-lg hover:bg-white/10 transition">
            <Upload size={12} />
            <span className="sr-only sm:not-sr-only">Photo</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUploadFallback} />
          </label>
        </form>
      </div>
    </div>
  );
}
