"use client";

import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ShieldCheck, ShieldAlert, Camera, XCircle, RefreshCw } from "lucide-react";

interface GateScannerProps {
  onClose: () => void;
}

interface ValidationStatus {
  state: "IDLE" | "SCANNING" | "VALID" | "INVALID" | "ERROR";
  message: string;
  attendeeName?: string;
  eventTitle?: string;
}

export default function GateScanner({ onClose }: GateScannerProps) {
  const [status, setStatus] = useState<ValidationStatus>({ state: "IDLE", message: "Awaiting pass detection axis..." });
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader-target",
      { fps: 15, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current.render(
      async (decodedText) => {
        if (status.state === "SCANNING") return;
        handleValidatePassId(decodedText.trim());
      },
      (error) => {}
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error("Scanner clear failure:", err));
      }
    };
  }, []);

  const handleValidatePassId = async (passId: string) => {
    setStatus({ state: "SCANNING", message: `Verifying token: ${passId}...` });

    try {
      const [eventsRes, regsRes] = await Promise.all([
        fetch("/api/events?mode=events"),
        fetch("/api/events?mode=registrations")
      ]);
      
      const eventsData = await eventsRes.json();
      const regsData = await regsRes.json();

      if (eventsData.success && regsData.success && Array.isArray(regsData.data) && Array.isArray(eventsData.data)) {
        const record = regsData.data.find((r: any) => r.regId === passId);

        if (record) {
          const targetEvent = eventsData.data.find((e: any) => e.id === record.eventId);

          if (targetEvent && targetEvent.status === "ACTIVE") {
            setStatus({
              state: "VALID",
              message: "ACCESS GRANTED // TOKEN VERIFIED",
              attendeeName: record.name,
              eventTitle: record.eventTitle
            });
          } else {
            setStatus({
              state: "INVALID",
              message: `ACCESS DENIED // Event is Completed or Inactive: ${record.eventTitle}`
            });
          }
        } else {
          setStatus({
            state: "INVALID",
            message: `ACCESS DENIED // Unknown Token: ${passId}`
          });
        }
      } else {
        setStatus({ state: "ERROR", message: "Failed to communicate with the registry ledger." });
      }
    } catch (err) {
      setStatus({ state: "ERROR", message: "Network synchronization bottleneck encountered." });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 font-mono text-xs text-white">
      <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
        
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Camera size={14} /> Gate Scanner Node
            </h2>
            <p className="text-[10px] text-white/40">Realtime ticket authorization framework</p>
          </div>
          <button onClick={onClose} className="p-1 text-white/40 hover:text-white transition cursor-pointer">
            <XCircle size={18} />
          </button>
        </div>

        <div className="bg-black border border-white/5 rounded-xl overflow-hidden relative">
          <div id="qr-reader-target" className="w-full h-full text-black" />
          {status.state === "IDLE" && (
            <div className="absolute inset-0 border-2 border-dashed border-blue-500/20 pointer-events-none rounded-xl animate-pulse" />
          )}
        </div>

        <div className={`p-4 rounded-xl border text-center space-y-2 transition-all duration-300 ${
          status.state === "VALID" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
          status.state === "INVALID" ? "bg-red-500/10 border-red-500/30 text-red-400" :
          status.state === "SCANNING" ? "bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse" :
          "bg-zinc-900/50 border-white/5 text-white/60"
        }`}>
          <div className="flex justify-center mb-1">
            {status.state === "VALID" && <ShieldCheck size={28} className="animate-bounce" />}
            {status.state === "INVALID" && <ShieldAlert size={28} />}
            {status.state === "SCANNING" && <RefreshCw size={24} className="animate-spin" />}
          </div>
          
          <p className="font-bold tracking-wider text-[11px]">{status.message}</p>
          
          {status.attendeeName && (
            <div className="text-left bg-black/40 border border-white/5 p-3 rounded-lg text-[10px] text-white space-y-1 mt-2 font-sans">
              <p><span className="text-white/40 font-mono uppercase text-[9px]">Name:</span> <strong className="text-white/90">{status.attendeeName}</strong></p>
              <p><span className="text-white/40 font-mono uppercase text-[9px]">Event:</span> <span className="text-white/70">{status.eventTitle}</span></p>
            </div>
          )}

          {(status.state === "VALID" || status.state === "INVALID" || status.state === "ERROR") && (
            <button 
              onClick={() => setStatus({ state: "IDLE", message: "Awaiting next pass detection axis..." })}
              className="mt-3 px-3 py-1 bg-white text-black font-sans font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-zinc-200 transition cursor-pointer"
            >
              Reset Reader Lens
            </button>
          )}
        </div>

      </div>
    </div>
  );
}