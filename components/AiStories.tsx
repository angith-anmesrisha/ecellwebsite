"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X, Calendar, LineChart } from "lucide-react";
import FluidHoverTile from "./FluidHoverTile";

interface StoryItem {
  objectID: string;
  title: string;
  url: string;
  author: string;
  points: number;
  created_at: string;
}

export default function AiStories() {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAiNews = async () => {
      try {
        const res = await fetch("/api/trends");
        const data = await res.json();
        if (!data.success || data.stories.length === 0) throw new Error("No stories");
        setStories(data.stories);
      } catch (err) {
        console.error("Error updating story feed:", err);
        setFailed(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAiNews();
  }, []);

  useEffect(() => {
    if (activeIdx === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIdx(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIdx]);

  if (loading) return (
    <div className="w-full flex flex-col items-center justify-center h-64 font-mono text-[10px] text-accent-500/60 tracking-[0.3em] uppercase select-none">
      <div className="w-12 h-[1px] bg-accent-500/30 mb-4 overflow-hidden relative">
        <motion.div 
          animate={{ left: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 bottom-0 w-1/2 bg-accent-500"
        />
      </div>
      Gathering the latest updates...
    </div>
  );

  if (failed) return (
    <div className="w-full flex flex-col items-center justify-center gap-3 h-48 rounded-xl border border-white/10 bg-white/[0.02] text-center px-6">
      <p className="text-sm text-white/70">We couldn&apos;t load today&apos;s stories right now.</p>
      <a
        href="https://news.ycombinator.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-mono uppercase tracking-widest text-accent-300 hover:text-accent-200"
      >
        Read Hacker News instead →
      </a>
    </div>
  );

  return (
    <div ref={containerRef} className="w-full relative overflow-visible py-6 font-sans">
      
      {/* 🌟 UPGRADED FLUID SPOTLIGHT BENTO MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        {stories.map((story, idx) => {
          const isLargeCard = idx === 0 || idx === 4;
          
          return (
            <FluidHoverTile
              key={story.objectID}
              onClick={() => setActiveIdx(idx)}
              className={isLargeCard ? "md:col-span-2 lg:col-span-1" : ""}
            >
              {/* Top Meta Headers Block */}
              <div className="space-y-4 w-full">
                <div className="flex justify-between items-center font-mono text-[9px] tracking-widest text-zinc-400">
                  <span className="flex items-center gap-1.5 uppercase font-bold text-accent-400">
                    <LineChart size={10} />
                    Trending Story // 0{idx + 1}
                  </span>
                  <span className="uppercase">By {story.author}</span>
                </div>

                <h4 className="text-lg md:text-xl font-black text-white/80 group-hover:text-white tracking-tight leading-snug transition-colors duration-300 line-clamp-3 uppercase">
                  {story.title}
                </h4>
              </div>

              {/* Bottom Info Metrics Row */}
              <div className="flex justify-between items-center text-[10px] font-mono tracking-wider pt-6 border-t border-white/5 w-full mt-6">
                <span className="text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300 flex items-center gap-1">
                  <Calendar size={11} />
                  {new Date(story.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-accent-500/60 group-hover:text-accent-400 font-bold transition-colors duration-300">
                  🔥 {story.points} Upvotes
                </span>
              </div>
            </FluidHoverTile>
          );
        })}
      </div>

      {/* FULL SCREEN COMPREHENSIVE OVERLAY MODAL */}
      <AnimatePresence>
        {activeIdx !== null && (
          <div role="dialog" aria-modal="true" aria-label={stories[activeIdx].title} className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-12 bg-black/98 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245, 158, 11,0.05)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0" onClick={() => setActiveIdx(null)} />

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-2xl p-8 md:p-16 flex flex-col justify-between shadow-2xl overflow-hidden z-[150] min-h-[60vh]"
            >
              <div className="absolute -bottom-10 -left-10 text-[14vw] font-black uppercase text-white/[0.01] tracking-tighter select-none pointer-events-none font-sans">
                NEWS
              </div>

              <div className="flex justify-between items-start w-full relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-accent-400 uppercase tracking-[0.3em] font-bold">
                    <Sparkles size={12} className="animate-pulse" />
                    <span>Global Tech Insights</span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-400">Community curated documentation</p>
                </div>
                
                <button
                  onClick={() => setActiveIdx(null)}
                  aria-label="Close article"
                  className="p-3 text-zinc-400 hover:text-white bg-white/5 border border-white/10 rounded-full transition-all duration-300 hover:rotate-90"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="my-12 relative z-10 max-w-3xl">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-tight uppercase">
                  {stories[activeIdx].title}
                </h2>
                
                <div className="flex flex-wrap gap-6 items-center mt-6 text-xs font-mono text-zinc-400">
                  <span className="uppercase">Posted by: <b className="text-white font-normal">{stories[activeIdx].author}</b></span>
                  <span className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
                  <span>Published: {new Date(stories[activeIdx].created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
                  <span className="text-accent-400 font-bold">🔥 {stories[activeIdx].points} Community Points</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center pt-8 border-t border-white/10 w-full relative z-10 mt-auto">
                <a 
                  href={stories[activeIdx].url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-accent-500 text-black hover:text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 transition-all duration-300"
                >
                  <span>Read Full Article</span>
                  <ArrowRight size={14} />
                </a>
                
                <button 
                  onClick={() => setActiveIdx(null)}
                  className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/5 border border-white/10 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300"
                >
                  Close Article
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}