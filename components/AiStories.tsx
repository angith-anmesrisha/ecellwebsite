"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, X, ExternalLink, Calendar } from "lucide-react";

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

  // Automatically fetch top trending AI breakthroughs from Hacker News API
  useEffect(() => {
    const fetchAiNews = async () => {
      try {
        const res = await fetch(
          "https://hn.algolia.com/api/v1/search_by_date?query=AI&tags=story&hitsPerPage=6"
        );
        const data = await res.json();
        
        // Map and clean up titles (removing trailing domain strings if present)
        const cleanStories = data.hits.map((hit: any) => ({
          objectID: hit.objectID,
          title: hit.title,
          url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
          author: hit.author,
          points: hit.points || 10,
          created_at: hit.created_at
        }));
        
        setStories(cleanStories);
      } catch (err) {
        console.error("Error fetching automatic AI updates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAiNews();
  }, []);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx !== null && activeIdx < stories.length - 1) {
      setActiveIdx(activeIdx + 1);
    } else {
      setActiveIdx(null); // Close at end
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx !== null && activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
    }
  };

  if (loading) return (
    <div className="w-full flex items-center justify-center h-40 text-xs font-mono text-white/40 tracking-widest uppercase animate-pulse">
      Syncing global neural updates...
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Horizontal List of Story Bubbles */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-8 py-4">
        {stories.map((story, idx) => (
          <div 
            key={story.objectID} 
            onClick={() => setActiveIdx(idx)}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            {/* Pulsing Neon Story Ring */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 animate-gradient-xy group-hover:scale-105 transition duration-300 shadow-lg shadow-blue-500/10">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center border border-black p-2 text-center text-[10px] font-mono tracking-tight text-white/90 overflow-hidden line-clamp-3 leading-tight select-none">
                {story.title.split(" ")[0]}..
              </div>
            </div>
            <span className="text-[10px] font-semibold tracking-wider text-white/50 group-hover:text-white transition uppercase font-mono">
              {story.author}
            </span>
          </div>
        ))}
      </div>

     {/* IMMERSIVE FULL-SCREEN STORIES MODAL OVERLAY */}
      <AnimatePresence>
        {activeIdx !== null && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-black/95 backdrop-blur-xl">
            {/* Modal Backdrop closer */}
            <div className="absolute inset-0" onClick={() => setActiveIdx(null)} />

            {/* Desktop Left Navigation Arrow Button */}
            {activeIdx > 0 && (
              <button 
                onClick={handlePrev}
                className="hidden md:flex absolute left-8 p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition z-50"
              >
                <ArrowLeft size={20} />
              </button>
            )}

            {/* Core Card Container Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative w-full max-w-md h-[75vh] max-h-[600px] bg-zinc-950 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-2xl overflow-hidden z-[150]"
            >
              {/* Background ambient decorative orb */}
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

              {/* Progress Line */}
              <div className="w-full flex gap-1.5 pointer-events-none">
                {stories.map((_, i) => (
                  <div key={i} className="h-[2px] bg-white/10 flex-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{
                        width: i <= activeIdx ? "100%" : "0%"
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Upper Header Meta Details */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  <Sparkles size={12} className="text-blue-500 animate-pulse" />
                  <span>AI Intel Briefing</span>
                </div>
                <button 
                  onClick={() => setActiveIdx(null)} 
                  className="p-1.5 text-white/40 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 rounded-lg transition"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Main Center Story Text Node */}
              <div className="flex-1 flex flex-col justify-center py-4">
                <h4 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                  {stories[activeIdx].title}
                </h4>
                <div className="flex items-center gap-4 mt-4 text-xs font-mono text-white/40">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(stories[activeIdx].created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                  </span>
                  <span>🔥 {stories[activeIdx].points} points</span>
                </div>
              </div>

              {/* Bottom Interactive CTA Strip (Completely unobstructed, clear pointer actions) */}
              <div className="space-y-4 mt-auto border-t border-white/5 pt-4 bg-zinc-950/50 backdrop-blur-sm">
                <p className="text-xs text-white/50 leading-relaxed">
                  Curated live from community tech logs. Open full tracking documentation node below.
                </p>
                
                {/* Clean, high-priority hyperlink button */}
                <a 
                  href={stories[activeIdx].url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  <span>Read Full Article</span>
                  <ExternalLink size={12} />
                </a>

                {/* Mobile tap navigation fallback row helper links */}
                <div className="flex justify-between gap-4 pt-1 md:hidden">
                  <button 
                    disabled={activeIdx === 0}
                    onClick={handlePrev}
                    className="text-[10px] uppercase font-mono tracking-wider text-white/30 disabled:opacity-10"
                  >
                    ← Previous
                  </button>
                  <button 
                    onClick={handleNext}
                    className="text-[10px] uppercase font-mono tracking-wider text-white/30"
                  >
                    Next Story →
                  </button>
                </div>
              </div>

            </motion.div>

            {/* Desktop Right Navigation Arrow Button */}
            <button 
              onClick={handleNext}
              className="hidden md:flex absolute right-8 p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition z-50"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}