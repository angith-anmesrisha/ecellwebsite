"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, X, Calendar, LineChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FluidHoverTile from "./FluidHoverTile";
import TrendsGlobe3D from "./TrendsGlobe3D";

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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAiNews = async () => {
      try {
        const res = await fetch(
          "https://hn.algolia.com/api/v1/search_by_date?query=AI&tags=story&hitsPerPage=6"
        );
        const data = await res.json();
        
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
        console.error("Error updating story feed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAiNews();
  }, []);

  if (loading) return (
    <div className="w-full flex flex-col items-center justify-center h-64 font-mono text-[10px] text-purple-500/60 tracking-[0.3em] uppercase select-none">
      <div className="w-12 h-[1px] bg-purple-500/30 mb-4 overflow-hidden relative">
        <motion.div 
          animate={{ left: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 bottom-0 w-1/2 bg-purple-500"
        />
      </div>
      Gathering latest news matrix...
    </div>
  );

  const leftColStories = stories.slice(0, 3);
  const rightColStories = stories.slice(3, 6);
const renderCard = (story: StoryItem, globalIndex: number) => {
    const isTargeted = hoveredIdx === globalIndex;

    return (
      // 🌟 FIX: The 'key' prop MUST be placed on this outer wrapper div element
      <div
        key={story.objectID}
        onMouseEnter={() => setHoveredIdx(globalIndex)}
        onMouseLeave={() => setHoveredIdx(null)}
        className="w-full"
      >
        <FluidHoverTile
          onClick={() => setActiveIdx(globalIndex)}
          className={`w-full backdrop-blur-md border rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all duration-300 group ${
            isTargeted 
              ? "bg-cyan-950/30 border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.15)] scale-[1.02]" 
              : "bg-zinc-950/50 border-white/5 hover:border-purple-500/30"
          }`}
        >
          {/* ... keeping your internal title meta layers exactly the same ... */}
          <div className="space-y-2.5 w-full text-left">
            <div className="flex justify-between items-center font-mono text-[9px] tracking-widest text-zinc-500">
              <span className={`flex items-center gap-1.5 uppercase font-bold transition-colors ${isTargeted ? "text-cyan-400" : "text-purple-400"}`}>
                <LineChart size={10} />
                Satellite Link // 0{globalIndex + 1}
              </span>
              <span className="uppercase truncate max-w-[80px]">By {story.author}</span>
            </div>
            <h4 className={`text-xs md:text-sm font-black tracking-wide leading-snug line-clamp-3 uppercase font-mono transition-colors ${isTargeted ? "text-white" : "text-white/80"}`}>
              {story.title}
            </h4>
          </div>

          <div className="flex justify-between items-center text-[9px] font-mono tracking-wider pt-3 border-t border-white/5 w-full mt-3">
            <span className="text-zinc-500 flex items-center gap-1">
              <Calendar size={10} />
              {new Date(story.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
            <span className={`font-bold ${isTargeted ? "text-cyan-400" : "text-purple-400"}`}>
              🔥 {story.points} Pts
            </span>
          </div>
        </FluidHoverTile>
      </div>
    );
  };
  return (
    <div className="w-full relative overflow-visible py-4 font-sans max-w-[1450px] mx-auto">
      
      {/* Absolute 12-Column Spatial Grid Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
        
        {/* Left Wings: Cards 1, 2, 3 */}
        <div className="flex flex-col gap-4 lg:col-span-4 w-full z-20">
          {leftColStories.map((story, i) => renderCard(story, i))}
        </div>

        {/* Center Space: High-Fi 3D Viewport Bounding Area */}
        <div className="lg:col-span-4 w-full aspect-square flex items-center justify-center relative my-4 lg:my-0 h-[400px] lg:h-[450px]">
          <div className="absolute w-[130%] h-[130%] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.04)_0%,transparent_70%)] pointer-events-none" />
          <div className="w-full h-full relative z-10 flex items-center justify-center overflow-visible">
            <TrendsGlobe3D 
              stories={stories} 
              hoveredIdx={hoveredIdx} 
              setHoveredIdx={setHoveredIdx} 
              setActiveIdx={setActiveIdx}
            />
          </div>
        </div>

        {/* Right Wings: Cards 4, 5, 6 */}
        <div className="flex flex-col gap-4 lg:col-span-4 w-full z-20">
          {rightColStories.map((story, i) => renderCard(story, i + 3))}
        </div>

      </div>

      {/* COMPREHENSIVE OVERLAY MODAL */}
      <AnimatePresence>
        {activeIdx !== null && stories[activeIdx] && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-12 bg-black/98 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)] pointer-events-none" />
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
                  <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] font-bold">
                    <Sparkles size={12} className="animate-pulse" />
                    <span>Global Tech Insights</span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-500">Community curated documentation</p>
                </div>
                
                <button 
                  onClick={() => setActiveIdx(null)} 
                  className="p-3 text-zinc-500 hover:text-white bg-white/5 border border-white/10 rounded-full transition-all duration-300 hover:rotate-90"
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
                  <span className="text-cyan-400 font-bold">🔥 {stories[activeIdx].points} Community Points</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center pt-8 border-t border-white/10 w-full relative z-10 mt-auto">
                <a 
                  href={stories[activeIdx].url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-cyan-500 text-black hover:text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 transition-all duration-300"
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