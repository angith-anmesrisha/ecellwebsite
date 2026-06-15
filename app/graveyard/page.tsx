"use client";

import React, { useState, useEffect } from "react";
import { AlertOctagon, History, User, Lightbulb, Target, Plus, X, Loader2 } from "lucide-react";

interface FallenVenture {
  id: string;
  name: string;
  founders: string;
  sector: string;
  runtime: string;
  reason: string;
  lesson: string;
}

export default function StartupGraveyard() {
  const [failures, setFailures] = useState<FallenVenture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  
  const [showGraveForm, setShowGraveForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [graveData, setGraveData] = useState({
    name: "",
    founders: "",
    sector: "Artificial Intelligence",
    runtime: "",
    reason: "",
    lesson: ""
  });

  useEffect(() => {
    const fetchLiveGraveyardLog = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/graveyard");
        const resData = await response.json();
        
        if (resData.success && resData.failures) {
          setFailures(resData.failures);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveGraveyardLog();
  }, []);

  const handleSubmitPostMortem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "GRAVEYARD_SUBMISSION", 
          payload: graveData 
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Project details submitted successfully! It will appear in the archive once approved by the E-Cell team.");
        setShowGraveForm(false);
        setGraveData({ name: "", founders: "", sector: "Artificial Intelligence", runtime: "", reason: "", lesson: "" });
        localStorage.setItem("eCellFormSubmitted", "true");
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-16 px-4 md:px-8 font-sans antialiased">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER BLOCK */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="text-[10px] font-mono tracking-widest bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-full inline-block font-black uppercase">
              The Learning Archive
            </div>
            <h1 className="text-3xl font-black tracking-tight">Startup Lessons & Case Studies</h1>
            <p className="text-sm text-white/40 max-w-xl">
              We look at failure as a key stepping stone. Read real case studies from retired student projects to learn what goes into launching a sustainable business.
            </p>
          </div>
          <button 
            onClick={() => setShowGraveForm(!showGraveForm)} 
            className="px-4 py-2 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-red-400 font-sans text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-lg"
          >
            {showGraveForm ? <X size={14} /> : <Plus size={14} />}
            {showGraveForm ? "Close Form" : "Log a Retired Project"}
          </button>
        </div>

        {/* SUBMISSION FORM PANEL */}
        {showGraveForm && (
          <div className="bg-zinc-950 border border-red-500/20 p-6 rounded-2xl space-y-4 text-xs">
            <div className="border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-red-400">Share Project Case Study</h3>
              <p className="text-[11px] text-white/40">Sharing your story helps future founders build better. Submissions are reviewed by the team before going live.</p>
            </div>
            <form onSubmit={handleSubmitPostMortem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Project Name</label>
                  <input required type="text" value={graveData.name} onChange={(e) => setGraveData({...graveData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500" placeholder="e.g., HyperLocal Delivery" />
                </div>
                <div className="space-y-1">
                  <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Founders (Names)</label>
                  <input required type="text" value={graveData.founders} onChange={(e) => setGraveData({...graveData, founders: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500" placeholder="e.g., Rahul K. & Dev S." />
                </div>
                <div className="space-y-1">
                  <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Duration of Operations</label>
                  <input required type="text" value={graveData.runtime} onChange={(e) => setGraveData({...graveData, runtime: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500" placeholder="e.g., 6 Months (2025)" />
                </div>
                <div className="space-y-1">
                  <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Industry Sector</label>
                  <select value={graveData.sector} onChange={(e) => setGraveData({...graveData, sector: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500">
                    <option>Artificial Intelligence</option>
                    <option>B2B SaaS Ecosystems</option>
                    <option>FinTech Nodes</option>
                    <option>Sustainable Supply Chains</option>
                    <option>Direct Consumer Retail</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">What Went Wrong?</label>
                <textarea required rows={3} value={graveData.reason} onChange={(e) => setGraveData({...graveData, reason: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 resize-none" placeholder="Describe the main challenges, operational bottlenecks, or market shifts that prevented the project from continuing..." />
              </div>
              <div className="space-y-1">
                <label className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Biggest Lesson Learned</label>
                <textarea required rows={3} value={graveData.lesson} onChange={(e) => setGraveData({...graveData, lesson: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 resize-none" placeholder="What should future student founders keep in mind to avoid running into the same issue?..." />
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full py-2.5 bg-white text-black font-sans font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer">
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Submit Case Study"}
              </button>
            </form>
          </div>
        )}

        {/* LOADING & ARCHIVE CARDS */}
        {isLoading ? (
          <div className="text-center py-24 font-sans text-sm text-white/40 animate-pulse tracking-wide">
            Loading project case studies...
          </div>
        ) : (
          <div className="space-y-6">
            {failures.map(item => (
              <div key={item.id} className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-xl relative group">
                <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-red-500/50 group-hover:bg-red-500 transition-all" />
                
                <div className="p-6 space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-white/5 pb-3">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight uppercase text-white">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-3 text-[11px] text-white/50 mt-1">
                        <span className="flex items-center gap-1"><User size={12} /> Founders: {item.founders}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Target size={12} /> Sector: {item.sector}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg border border-red-500/20 bg-red-500/5 text-[10px] uppercase font-bold tracking-wider text-red-400 flex items-center gap-1 shrink-0">
                      <History size={12} /> Active: {item.runtime}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-red-500/[0.02] border border-red-500/10 p-4 rounded-xl space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider flex items-center gap-1">
                        <AlertOctagon size={14} /> Core Problem
                      </span>
                      <p className="text-xs text-white/80 leading-relaxed text-justify">
                        "{item.reason}"
                      </p>
                    </div>
                    
                    <div className="bg-emerald-500/[0.02] border border-emerald-500/10 p-4 rounded-xl space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                        <Lightbulb size={14} /> Strategic Lesson
                      </span>
                      <p className="text-xs text-white/80 leading-relaxed text-justify">
                        "{item.lesson}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {failures.length === 0 && (
              <div className="text-center py-12 text-sm text-white/30">
                No case studies logged in the archive yet.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}