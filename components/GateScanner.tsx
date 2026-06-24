"use client";

import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ShieldCheck, ShieldAlert, Camera, XCircle, RefreshCw, Upload } from "lucide-react";

interface GateScannerProps {
  onClose: () => void;
}

interface ValidationStatus {
  state: "IDLE" | "SCANNING" | "VALID" | "INVALID" | "ERROR" | "PERMISSION_PROMPT";
  message: string;
  attendeeName?: string;
  eventTitle?: string;
}

export default function GateScanner({ onClose }: GateScannerProps) {
  const [status, setStatus] = useState<ValidationStatus>({ state: "IDLE", message: "Awaiting pass detection axis..." });
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const startScannerWithDelay = () => {
    setStatus({ state: "IDLE", message: "Connecting to camera hardware..." });
    
    setTimeout(() => {
      try {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => {});
        }

        scannerRef.current = new Html5QrcodeScanner(
          "qr-reader-target",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true
          },
          false
        );

        scannerRef.current.render(
          async (decodedText) => {
            if (status.state === "SCANNING") return;
            handleValidatePassId(decodedText.trim());
          },
          (error) => {
            // Keep scanning quietly
          }
        );
        
        setHasCameraPermission(true);
        setStatus({ state: "IDLE", message: "Camera connected. Scan a pass QR code." });
      } catch (err) {
        console.error("Scanner setup failed:", err);
        setHasCameraPermission(false);
        setStatus({ state: "ERROR", message: "Camera initialization failed. Please use file upload fallback below." });
      }
    }, 800);
  };

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      startScannerWithDelay();
    } else {
      setHasCameraPermission(false);
      setStatus({ state: "ERROR", message: "Secure camera connection (HTTPS) required." });
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error("Scanner clear failure:", err));
      }
    };
  }, []);

  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      stream.getTracks().forEach(track => track.stop());
      startScannerWithDelay();
    } catch (err) {
      setHasCameraPermission(false);
      setStatus({ 
        state: "ERROR", 
        message: "Camera access denied. Please allow camera use in your browser bar settings." 
      });
    }
  };

  const handleFileUploadFallback = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus({ state: "SCANNING", message: "Parsing ticket snapshot..." });
    
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("qr-reader-target");
      
      const decodedText = await html5QrCode.scanFile(file, true);
      handleValidatePassId(decodedText.trim());
    } catch (err) {
      setStatus({ state: "ERROR", message: "Could not find a valid QR code in that image." });
    }
  };

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
              message: "ACCESS GRANTED // PASS VERIFIED",
              attendeeName: record.name,
              eventTitle: record.eventTitle
            });
          } else {
            setStatus({
              state: "INVALID",
              message: `ACCESS DENIED // Event is completed or inactive: ${record.eventTitle}`
            });
          }
        } else {
          setStatus({
            state: "INVALID",
            message: `ACCESS DENIED // Invalid or unrecognized token: ${passId}`
          });
        }
      } else {
        setStatus({ state: "ERROR", message: "Could not link to backend registry ledger." });
      }
    } catch (err) {
      setStatus({ state: "ERROR", message: "Connection issue encountered during verification check." });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 font-mono text-xs text-white">
      <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* HEADER */}
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

        {/* SCANNER VIEWPORT */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden relative min-h-[260px] flex flex-col items-center justify-center p-2">
          
          {/* Injecting CSS overrides inline to prevent the default library markup from getting crushed or hidden by dark mode overrides */}
          <style>{`
            #qr-reader-target { border: none !important; width: 100% !important; }
            #qr-reader-target button { color: black !important; background: white !important; font-size: 11px !important; font-family: monospace !important; font-weight: bold !important; padding: 6px 12px !important; border-radius: 8px !important; border: none !important; cursor: pointer !important; margin-top: 10px !important; }
            #qr-reader-target button:hover { background: #e4e4e7 !important; }
            #qr-reader-target select { background: #18181b !important; color: white !important; border: 1px border white/10 !important; border-radius: 6px !important; padding: 4px !important; font-size: 11px !important; margin-bottom: 10px !important; }
            #qr-reader-target__dashboard_section_csr { color: white !important; font-family: monospace !important; }
          `}</style>

          <div id="qr-reader-target" className="w-full text-white" />
          
          {hasCameraPermission === false && (
            <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
              <Camera size={32} className="text-zinc-500 animate-pulse" />
              <p className="text-zinc-400 max-w-xs font-sans text-xs">
                Camera access needs to be initialized manually for this environment.
              </p>
              <button
                onClick={requestCameraAccess}
                className="px-4 py-2 bg-white text-black font-sans font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-zinc-200 transition cursor-pointer"
              >
                Allow Camera Access
              </button>
            </div>
          )}

          {status.state === "IDLE" && hasCameraPermission !== false && (
            <div className="absolute inset-0 border border-dashed border-blue-500/20 pointer-events-none rounded-xl animate-pulse" />
          )}
        </div>

        {/* FALLBACK BUTTON */}
        <div className="flex flex-col items-center justify-center pt-1">
          <label className="cursor-pointer flex items-center gap-2 text-[10px] uppercase font-mono text-zinc-400 bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 transition shadow-md">
            <Upload size={12} />
            <span>Upload Photo Fallback</span>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handleFileUploadFallback} 
            />
          </label>
        </div>

        {/* STATUS BAR */}
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
              onClick={() => startScannerWithDelay()}
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