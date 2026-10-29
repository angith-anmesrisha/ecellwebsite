"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Megaphone, X } from "lucide-react";
import type { Announcement } from "@/lib/content-types";

const DISMISSED_KEY = "ecell_dismissed_notices";

function readDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
  } catch {
    return [];
  }
}

// Site-wide notice bar: the newest pinned announcement that is live right now.
// Refreshes every minute, so a notice posted from the console shows without a reload.
export default function AnnouncementBar() {
  const [notice, setNotice] = useState<Announcement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/announcements");
        const data = await res.json();
        if (cancelled || !data.success) return;
        const dismissed = readDismissed();
        setNotice((data.announcements as Announcement[]).find((a) => a.pinned && !dismissed.includes(a.id)) || null);
      } catch {
        // A missing notice bar is fine
      }
    };
    load();
    const timer = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const dismiss = () => {
    if (!notice) return;
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...readDismissed(), notice.id].slice(-30)));
    } catch {
      // Private mode: it just comes back next visit
    }
    setNotice(null);
  };

  return (
    <AnimatePresence>
      {notice && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35 }}
          role="status"
          className="fixed bottom-4 inset-x-4 z-[95] mx-auto max-w-2xl"
        >
          <div className="flex items-start gap-3 rounded-2xl border border-accent-300/30 bg-space-900/95 backdrop-blur-md px-4 py-3 shadow-2xl">
            <Megaphone size={16} className="mt-0.5 shrink-0 text-accent-300" />
            <p className="flex-1 min-w-0 text-sm text-white/90 leading-relaxed">
              {notice.text}
              {notice.link && (
                <a href={notice.link} className="ml-2 font-semibold text-accent-300 hover:text-accent-200 underline underline-offset-2">
                  {notice.linkLabel || "Details"}
                </a>
              )}
            </p>
            <button onClick={dismiss} aria-label="Dismiss notice" className="shrink-0 p-1 text-white/60 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
