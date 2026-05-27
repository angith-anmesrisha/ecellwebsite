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

  // Client-Side Semantic Analysis Engine
  const analyzeVentureSemantics = () => {
    const name = formData.startupName.toLowerCase().trim();
    const problem = formData.problem.toLowerCase().trim();
    const combined = `${name} ${problem}`;

    // 1. Content Guard / Joke Detector
    const redFlags = ["nigga", "nigger", "spam", "asdf", "fuck", "shit", "test", "crap", "joke"];
    if (redFlags.some(flag => combined.includes(flag))) {
      return { 
        isValid: false, 
        reason: "joke", 
        scoreModifier: -100, 
        industry: "Rejected", 
        insight: "CRITICAL FLAG: The simulation matrix detected non-standard operational terms or joke definitions. Venture concept rejected by E-Cell sandbox guidelines." 
      };
    }

    if (name.length < 3 || problem.length < 15) {
      return { 
        isValid: false, 
        reason: "short", 
        scoreModifier: -40, 
        industry: "Undetermined", 
        insight: "INSUFFICIENT DATA: Your problem statement is too brief for structural parsing. Investors require sharp, descriptive problem statements. Expand on your bottleneck." 
      };
    }

    // 2. Dynamic Industry Classification Core
    let industry = "General Tech";
    let scoreModifier = 0;
    let insight = "";

    if (combined.includes("agri") || combined.includes("farm") || combined.includes("crop")) {
      industry = "Agritech";
      scoreModifier = formData.targetMarket === "SMEs & Retailers" ? 20 : 5;
      insight = `Targeting ${formData.targetMarket} with an ${industry} solution is highly viable for agricultural regional clusters. Watch out for fragmented supply line overheads.`;
    } else if (combined.includes("health") || combined.includes("med") || combined.includes("doctor") || combined.includes("clinic")) {
      industry = "Healthtech";
      scoreModifier = formData.targetMarket === "Healthcare Providers" ? 25 : -10;
      insight = formData.targetMarket === "Healthcare Providers" 
        ? "Perfect alignment. Institutional healthcare buyers value risk mitigation, clear patient outcomes, and high data security standard frameworks."
        : "Market mismatch warning. Direct consumer healthcare applications face steep organic user acquisition friction compared to provider pipelines.";
    } else if (combined.includes("chain") || combined.includes("supply") || combined.includes("logistic") || combined.includes("shipping") || combined.includes("delivery")) {
      industry = "Logistics & Supply Chain";
      scoreModifier = formData.model === "SaaS Subscription" ? 20 : 10;
      insight = `Excellent automation horizon. Solving legacy structural bottlenecks via a ${formData.model} architecture provides clear cost-reduction tracking data for your enterprise metrics.`;
    } else if (combined.includes("ai") || combined.includes("llm") || combined.includes("agent") || combined.includes("automation") || combined.includes("gpt")) {
      industry = "Artificial Intelligence";
      scoreModifier = formData.pricing === "Enterprise Custom" ? 20 : 5;
      insight = `High-velocity domain. Because you are launching an ${industry} platform, shifting toward ${formData.pricing} tiers will protect your unit economics from fluctuating API computing overheads.`;
    } else if (combined.includes("finance") || combined.includes("pay") || combined.includes("wallet") || combined.includes("lend") || combined.includes("bank")) {
      industry = "Fintech";
      scoreModifier = formData.targetMarket === "SMEs & Retailers" || formData.targetMarket === "Gen-Z Consumers" ? 15 : 5;
      insight = `High-value vector. Your ${industry} blueprint requires navigating strict regulatory compliance frameworks, but possesses massive transactional scaling capabilities.`;
    } else {
      industry = "Digital Enterprise";
      scoreModifier = 0;
      insight = "Standard operational concept parsed. To maximize venture viability index ratings, inject clearer vertical keywords (e.g., AI, logistics, or health) into your problem statement parameters.";
    }

    return { isValid: true, reason: "clean", scoreModifier, industry, insight };
  };

  // Upgraded Dynamic Scoring Router
  const calculateViabilityScore = () => {
    const analysis = analyzeVentureSemantics();
    if (!analysis.isValid) {
      return analysis.reason === "joke" ? 0 : 25;
    }

    let score = 65; // Base configuration floor
    
    if (formData.model === "SaaS Subscription") score += 10;
    if (formData.model === "Marketplace Commission") score += 5;
    
    // Inject structural modifier from text parsing
    score += analysis.scoreModifier;

    return Math.max(10, Math.min(score, 100));
  };

  const handleReset = () => {
    setFormData({ startupName: "", problem: "", targetMarket: "B2B Enterprises", model: "SaaS Subscription", pricing: "Premium" });
    setStep(1);
  };

  const semanticResult = analyzeVentureSemantics();

  return (
    <div className="w-full max-w-4xl mx-auto bg-zinc-950 border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none z-0" />

      <div className="relative z-10 space-y-8">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-blue-500 font-mono font-bold">Interactive Sandbox</span>
            <h3 className="text-2xl font-black tracking-tight text-white mt-1">Venture Logic Simulator</h3>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono text-white/60">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Score Widget */}
                <div className="p-5 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-center items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full flex items-center justify-center text-blue-500 opacity-40">
                    <Sparkles size={16} />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Viability Index</span>
                  <div className={`text-4xl font-black tracking-tight my-2 ${calculateViabilityScore() === 0 ? 'text-red-500' : 'text-white'}`}>
                    {calculateViabilityScore()}%
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${calculateViabilityScore()}%` }} 
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${calculateViabilityScore() === 0 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`} 
                    />
                  </div>
                </div>

                {/* Details Summary Block */}
                <div className="p-5 bg-white/5 border border-white/10 rounded-xl space-y-2 md:col-span-2">
                  <span className="text-[10px] font-bold tracking-widest text-blue-500 uppercase font-mono">Executive Summary Structure</span>
                  <h4 className="text-xl font-black text-white tracking-tight">{formData.startupName}</h4>
                  
                  {/* AI Dynamic Industry Badge Pin */}
                  <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-purple-400 mt-0.5 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${calculateViabilityScore() === 0 ? 'bg-red-500' : 'bg-purple-400 animate-pulse'}`} />
                    Parsed Sector: {semanticResult.industry}
                  </div>

                  <p className="text-xs text-white/60 leading-relaxed pt-1"><strong className="text-white">Problem Statement:</strong> {formData.problem}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[11px] font-medium text-white/80">{formData.targetMarket}</span>
                    <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[11px] font-medium text-white/80">{formData.model}</span>
                    <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[11px] font-medium text-white/80">{formData.pricing} Pricing</span>
                  </div>
                </div>
              </div>

              {/* Consultation Assessment Alert Block */}
              <div className={`p-5 rounded-xl space-y-2 border ${calculateViabilityScore() === 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
                <div className={`flex items-center gap-2 text-xs font-bold tracking-widest uppercase font-mono ${calculateViabilityScore() === 0 ? 'text-red-400' : 'text-blue-400'}`}>
                  <DollarSign size={14} />
                  E-Cell Advisory Assessment
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-sans">{semanticResult.insight}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button 
                  onClick={handleReset}
                  className="px-5 py-3 bg-white/5 border border-white/10 text-white/80 text-xs font-bold rounded-xl hover:bg-white/10 transition flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  <span>Simulate Alternative Concept</span>
                </button>
                <button 
                  disabled={calculateViabilityScore() === 0}
                  onClick={() => window.print()}
                  className="px-5 py-3 bg-white text-black text-xs font-bold rounded-xl hover:bg-gray-200 transition flex items-center gap-2 shadow-lg disabled:opacity-20 disabled:hover:bg-white"
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