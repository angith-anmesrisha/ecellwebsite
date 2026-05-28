"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, FileText, CheckCircle, ShieldAlert, Cpu, Layers } from "lucide-react";

export default function PitchSimulator() {
  const [startupTitle, setStartupTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [selectedSector, setSelectedSector] = useState("Artificial Intelligence");
  const [selectedModel, setSelectedModel] = useState("SaaS Subscription");
  const [selectedPricing, setSelectedPricing] = useState("Premium Pricing");

  const [isLoading, setIsLoading] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [viabilityIndex, setViabilityIndex] = useState(50);
  const [advisoryAssessment, setAdvisoryAssessment] = useState("");
  const [isViolationBlock, setIsViolationBlock] = useState(false);

  const handleSimulateArchitecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupTitle || !problemStatement) return;

    setIsLoading(true);
    setHasSimulated(false);
    setIsViolationBlock(false);

    try {
      // Execute handshake with Approach A server moderation checkpoint
      const verifyPayload = await fetch("/api/moderate-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: startupTitle,
          problem: problemStatement,
          sector: selectedSector
        })
      });

      const auditLog = await verifyPayload.json();

      if (auditLog.isFlagged) {
        setViabilityIndex(0);
        setIsViolationBlock(true);
        if (auditLog.categoryReason === "ETHICAL_COMPLIANCE_VIOLATION") {
          setAdvisoryAssessment(
            "CRITICAL COMPLIANCE REFUSAL: This concept triggers automatic regulatory filters. The E-Cell algorithmic sandbox completely blocks architectures promoting illegal frameworks, human rights violations, or unethical business models."
          );
        } else {
          setAdvisoryAssessment(
            "SIMULATION ERROR: Problem statement is too brief or insubstantial. Please write a descriptive paragraph outlining an authentic target market scenario to generate logical advisory metrics."
          );
        }
        setHasSimulated(true);
        setIsLoading(false);
        return;
      }

      // --- SCALABLE BUSINESS INTELLIGENCE EQUATION CORE ---
      let computedScore = 55;

      // Expanded Sector Switch Architecture
      switch (selectedSector) {
        case "Artificial Intelligence":
        case "Cybersecurity Nodes":
          computedScore += 15;
          break;
        case "FinTech Nodes":
        case "B2B SaaS Ecosystems":
        case "CleanTech & Renewable Energy":
          computedScore += 12;
          break;
        case "Sustainable Supply Chains":
        case "Autonomous Mobility":
        case "HealthTech & Telemedicine":
          computedScore += 10;
          break;
        case "AgriTech Ecosystems":
        case "EdTech Systems":
        case "Web3 & Tokenomics":
          computedScore += 7;
          break;
        case "Direct Consumer Retail":
          computedScore += 5;
          break;
        default:
          computedScore += 8;
      }

      // Monetization Layout Model Adjustments
      if (selectedModel === "SaaS Subscription") computedScore += 10;
      if (selectedModel === "B2B Enterprise Contracts") computedScore += 12;

      // Value Alignment Capture
      if (selectedPricing === "Premium Pricing") computedScore += 8;
      if (selectedPricing === "Value-Based Tiering") computedScore += 10;

      // Market Variance Turbulence Simulation
      const operationalVariance = Math.floor(Math.random() * 7) - 3;
      const finalizedIndex = Math.min(98, Math.max(15, computedScore + operationalVariance));

      // Build contextually synchronized advice strings
      let assessmentBrief = `High-velocity ${selectedSector} framework layout confirmed. Incorporating a ${selectedModel} model paired with ${selectedPricing} establishes robust initial cash generation thresholds. Ensure your pilot sprints focus heavily on tracking explicit client acquisition conversion parameters to offset infrastructure overheads.`;
      
      if (selectedSector === "Artificial Intelligence" && selectedPricing === "Premium Pricing") {
        assessmentBrief += " Moving toward premium pricing tiers will properly protect your operational margins against fluctuating API data processing costs.";
      }

      setViabilityIndex(finalizedIndex);
      setAdvisoryAssessment(assessmentBrief);
      setHasSimulated(true);

    } catch (err) {
      console.error("Handshake loop with compliance layer broken:", err);
      setViabilityIndex(25);
      setAdvisoryAssessment("SYSTEM CORRUPTION: Communication channel with the validation array timed out.");
      setHasSimulated(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative shadow-2xl">
      
      {/* LEFT INPUT PANEL */}
      <form onSubmit={handleSimulateArchitecture} className="lg:col-span-5 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-white/10 space-y-5 bg-black/30">
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-500">Venture Architecture</label>
          <h3 className="text-lg font-bold text-white tracking-tight">Concept Simulator Input</h3>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider text-white/40">Startup Brand Name</label>
            <input required type="text" value={startupTitle} onChange={(e) => setStartupTitle(e.target.value)} placeholder="e.g., Nexis Core" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/10 focus:outline-none focus:border-blue-500 font-mono" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider text-white/40">Target Problem Statement</label>
            <textarea required rows={3} value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} placeholder="Describe the explicit operational bottleneck or market friction layout your venture is built to eliminate..." className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white placeholder-white/10 focus:outline-none focus:border-blue-500 font-mono resize-none" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider text-white/40">Domain Sector Node</label>
            <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono">
              {/* DEEP TECH & INTELLIGENCE */}
              <option disabled className="text-white/30 font-bold bg-black">-- Deep Tech Cluster --</option>
              <option value="Artificial Intelligence">Artificial Intelligence & LLMOps</option>
              <option value="Autonomous Mobility">Autonomous Mobility & Robotics</option>
              <option value="Cybersecurity Nodes">Cybersecurity & Cryptographic Nets</option>
              
              {/* FINTECH & DIGITAL ECONOMY */}
              <option disabled className="text-white/30 font-bold bg-black">-- Financial Infrastructures --</option>
              <option value="FinTech Nodes">FinTech, Neo-Banking & DeFi</option>
              <option value="B2B SaaS Ecosystems">B2B SaaS Infrastructure Tools</option>
              <option value="Web3 & Tokenomics">Web3 Protocols & Digital Identity</option>
              
              {/* SUSTAINABILITY & ESG */}
              <option disabled className="text-white/30 font-bold bg-black">-- Climate Tech & Operations --</option>
              <option value="Sustainable Supply Chains">Sustainable Supply Chains & Logistics</option>
              <option value="CleanTech & Renewable Energy">CleanTech & Renewable Energy Core</option>
              <option value="AgriTech Ecosystems">AgriTech & Controlled Environment Farming</option>
              
              {/* CONSUMER ENTERPRISE */}
              <option disabled className="text-white/30 font-bold bg-black">-- Consumer Enterprise --</option>
              <option value="Direct Consumer Retail">Direct-to-Consumer (D2C) Brands</option>
              <option value="HealthTech & Telemedicine">HealthTech & Precision Medicine Platforms</option>
              <option value="EdTech Systems">EdTech & Continuous Learning Sandbox</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-white/40">Monetization Engine</label>
              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono">
                <option>SaaS Subscription</option>
                <option>B2B Enterprise Contracts</option>
                <option>Transactional Cut</option>
                <option>Freemium Scale</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-white/40">Pricing Matrix</label>
              <select value={selectedPricing} onChange={(e) => setSelectedPricing(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono">
                <option>Premium Pricing</option>
                <option>Value-Based Tiering</option>
                <option>Cost-Plus Baseline</option>
                <option>Dynamic Flow Mapping</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" disabled={isLoading || !startupTitle || !problemStatement} className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 disabled:opacity-20 transition active:scale-[0.99]">
          <Sparkles size={14} className={isLoading ? "animate-spin text-blue-500" : ""} />
          <span>{isLoading ? "Running Mathematical Models..." : "Simulate Business Architecture"}</span>
        </button>
      </form>

      {/* RIGHT OUTPUT PANEL */}
      <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-center bg-zinc-950/40 relative">
        <AnimatePresence mode="wait">
          {!hasSimulated && !isLoading ? (
            <motion.div key="empty-prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12 space-y-2 font-mono text-xs text-white/30">
              <Cpu size={24} className="mx-auto text-white/10 mb-2 animate-pulse" />
              <p>Sandbox engine standby. Input configuration parameters to initiate algorithmic modeling sequences.</p>
            </motion.div>
          ) : isLoading ? (
            <motion.div key="loading-prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-sm mx-auto w-full">
              <div className="space-y-1 text-center font-mono">
                <div className="text-[10px] uppercase tracking-widest text-blue-500 font-bold animate-pulse">Assembling Execution Trees</div>
                <p className="text-xs text-white/40">Parsing syntax structures for semantic integrity loops...</p>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div initial={{ left: "-100%" }} animate={{ left: "100%" }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              </div>
            </motion.div>
          ) : (
            <motion.div key="results-prompt" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 h-full flex flex-col justify-between">
              
              {/* RADIAL PROGRESS DISPLAY METRIC */}
              <div className="border border-white/5 bg-white/[0.01] p-5 rounded-xl space-y-4 relative overflow-hidden">
                <div className="flex justify-between items-center font-mono text-[10px] uppercase tracking-wider text-white/40">
                  <span className="flex items-center gap-1"><Layers size={10} /> Algorithmic Index Tracking</span>
                  <span className="font-bold text-white">Calculated Matrix Complete</span>
                </div>

                <div className="text-center py-2 space-y-1">
                  <div className="text-[10px] font-mono tracking-widest text-white/40 uppercase">Venture Viability Index</div>
                  <div className={`text-5xl font-black font-mono tracking-tighter ${isViolationBlock ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {viabilityIndex}%
                  </div>
                </div>

                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${viabilityIndex}%` }} transition={{ duration: 1, ease: "easeOut" }} className={`absolute top-0 bottom-0 rounded-full ${isViolationBlock ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`} />
                </div>
              </div>

              {/* DYNAMIC COMPLIANCE ADVISORY BLOCK */}
              <div className={`p-5 rounded-xl border flex gap-3 items-start ${isViolationBlock ? 'bg-red-500/5 border-red-500/20 text-red-200' : 'bg-blue-500/5 border-blue-500/10 text-white/90'}`}>
                {isViolationBlock ? <ShieldAlert size={18} className="text-red-500 shrink-0 mt-0.5 animate-bounce" /> : <CheckCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/40 flex items-center gap-1">
                    {isViolationBlock ? "Compliance Refusal Warning" : "Strategic Advisory Assessment"}
                  </div>
                  <p className="text-xs font-mono leading-relaxed select-none">{advisoryAssessment}</p>
                </div>
              </div>

              {/* UTILITY ACTION PANEL ROW FOOTER */}
              <div className="flex gap-3 pt-2 font-mono text-xs">
                <button onClick={() => { setHasSimulated(false); setStartupTitle(""); setProblemStatement(""); }} className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition flex items-center gap-1.5 active:scale-[0.98]">
                  <RefreshCw size={12} /> Clear Simulation
                </button>
                {!isViolationBlock && (
                  <button onClick={() => window.print()} className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition flex items-center gap-1.5 active:scale-[0.98]">
                    <FileText size={12} /> Export Roadmap (PDF)
                  </button>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}