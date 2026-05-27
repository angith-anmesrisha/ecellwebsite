"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, DollarSign, Target, Sparkles, RefreshCw, FileText } from "lucide-react";

export default function PitchSimulator() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    startupName: "",
    problem: "",
    targetMarket: "B2B Enterprises",
    model: "SaaS Subscription",
    pricing: "Premium"
  });

  const marketOptions = ["B2B Enterprises", "Gen-Z Consumers", "SMEs & Retailers", "Healthcare Providers"];
  const modelOptions = ["SaaS Subscription", "Marketplace Commission", "Freemium Tier", "Transactional/D2C"];
  const pricingOptions = ["Budget-Friendly", "Value-Based", "Premium", "Enterprise Custom"];

  // Core scoring engine computed locally on the client-side
  const calculateViabilityScore = () => {
    let score = 65; // Base score
    if (formData.model === "SaaS Subscription" && formData.pricing === "Enterprise Custom") score += 20;
    if (formData.model === "Marketplace Commission" && formData.targetMarket === "Gen-Z Consumers") score += 15;
    if (formData.model === "Freemium Tier" && formData.pricing === "Budget-Friendly") score += 10;
    if (formData.startupName.length > 3) score += 5;
    return Math.min(score, 100);
  };

  const getStrategicAdvice = () => {
    if (formData.model === "SaaS Subscription") {
      return "Excellent structural choice. Focus on calculating your Customer Acquisition Cost (CAC) early and pitch your Monthly Recurring Revenue (MRR) consistency to angel investors.";
    }
    if (formData.model === "Marketplace Commission") {
      return "High scaling potential, but watch your liquidity. Your primary marketing challenge will be solving the chicken-and-egg problem to acquire both buyers and sellers simultaneously.";
    }
    return "Ensure your user retention metrics are exceptionally strong before seeking venture funding. Focus heavily on expanding your viral loop expansion mechanics.";
  };

  const handleReset = () => {
    setFormData({ startupName: "", problem: "", targetMarket: "B2B Enterprises", model: "SaaS Subscription", pricing: "Premium" });
    setStep(1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-zinc-950 border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl overflow-hidden relative">
      {/* Visual background grid texture matching your site aesthetic */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none z-0" />

      <div className="relative z-10 space-y-8">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-blue-500 font-mono font-bold">Interactive Sandbox</span>
            <h3 className="text-2xl font-black tracking-tight text-white mt-1">Venture Logic Simulator</h3>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono text-white/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Step {step} of 3
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: INITIAL PROFILE IDENTITY */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-2 text-white/80 font-medium text-sm">
                <Lightbulb size={16} className="text-blue-500" />
                Define Your Core Concept
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Startup Venture Name</label>
                  <input
                    type="text"
                    value={formData.startupName}
                    onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
                    placeholder="e.g., NexaFlow AI"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Core Problem Solved</label>
                  <input
                    type="text"
                    value={formData.problem}
                    onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                    placeholder="e.g., High shipping delays in sustainable supply chains"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
              <button
                disabled={!formData.startupName || !formData.problem}
                onClick={() => setStep(2)}
                className="w-full md:w-auto px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-200 transition disabled:opacity-40 disabled:hover:bg-white"
              >
                Configure Market Strategy
              </button>
            </motion.div>
          )}

          {/* STEP 2: REVENUE ENGINE SETUP */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 text-white/80 font-medium text-sm">
                <Target size={16} className="text-blue-500" />
                Map Your Go-To-Market Mechanics
              </div>
              <div className="space-y-4">
                {/* Target Audience Options */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Target Demographic</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {marketOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setFormData({ ...formData, targetMarket: opt })}
                        className={`p-3 text-xs rounded-xl border transition text-center ${formData.targetMarket === opt ? 'bg-blue-500/10 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Business Model Selection */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Monetization Framework</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {modelOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setFormData({ ...formData, model: opt })}
                        className={`p-3 text-xs rounded-xl border transition text-center ${formData.model === opt ? 'bg-blue-500/10 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing Strategy */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Pricing Tier Model</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {pricingOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setFormData({ ...formData, pricing: opt })}
                        className={`p-3 text-xs rounded-xl border transition text-center ${formData.pricing === opt ? 'bg-blue-500/10 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="px-5 py-3 bg-white/5 border border-white/10 text-white/80 text-xs font-bold rounded-xl hover:bg-white/10 transition">Back</button>
                <button onClick={() => setStep(3)} className="px-6 py-3 bg-blue-500 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-500/20">Generate Model Matrix</button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: ANALYTICS & REVEAL MATRIX */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Dynamic Score Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-center items-center text-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full flex items-center justify-center text-blue-500 opacity-40">
                    <Sparkles size={16} />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Viability Index</span>
                  <div className="text-4xl font-black text-white tracking-tight my-2">
                    {calculateViabilityScore()}%
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${calculateViabilityScore()}%` }} 
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full" 
                    />
                  </div>
                </div>

                {/* Details Matrix Block */}
                <div className="p-5 bg-white/5 border border-white/10 rounded-xl space-y-2 md:col-span-2">
                  <span className="text-[10px] font-bold tracking-widest text-blue-500 uppercase font-mono">Executive Summary Structure</span>
                  <h4 className="text-xl font-black text-white tracking-tight">{formData.startupName}</h4>
                  <p className="text-xs text-white/60 leading-relaxed"><strong className="text-white">Problem Statement:</strong> {formData.problem}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[11px] font-medium text-white/80">{formData.targetMarket}</span>
                    <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[11px] font-medium text-white/80">{formData.model}</span>
                    <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[11px] font-medium text-white/80">{formData.pricing} Pricing</span>
                  </div>
                </div>
              </div>

              {/* Consultation Output Card */}
              <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-blue-400 font-mono">
                  <DollarSign size={14} />
                  E-Cell Advisory Assessment
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-sans">{getStrategicAdvice()}</p>
              </div>

              {/* Bottom Controllers */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button 
                  onClick={handleReset}
                  className="px-5 py-3 bg-white/5 border border-white/10 text-white/80 text-xs font-bold rounded-xl hover:bg-white/10 transition flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  <span>Simulate Alternative Concept</span>
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-5 py-3 bg-white text-black text-xs font-bold rounded-xl hover:bg-gray-200 transition flex items-center gap-2 shadow-lg"
                >
                  <FileText size={14} />
                  <span>Export Strategic Roadmap (PDF)</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}