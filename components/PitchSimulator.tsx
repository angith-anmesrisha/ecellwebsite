"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, FileText, CheckCircle, ShieldAlert, Cpu, Layers, TrendingUp, Gauge } from "lucide-react";

interface RoadmapStep {
  t: string;
  d: string;
}

interface HurdleStep {
  h: string;
  s: string;
}

export default function PitchSimulator() {
  const [startupTitle, setStartupTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [selectedSector, setSelectedSector] = useState("Artificial Intelligence");
  const [selectedModel, setSelectedModel] = useState("SaaS Subscription");
  const [selectedPricing, setSelectedPricing] = useState("Premium Pricing");

  const [isLoading, setIsLoading] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [viabilityIndex, setViabilityIndex] = useState(50);
  const [marketFitIndex, setMarketFitIndex] = useState(50);
  const [complexityIndex, setComplexityIndex] = useState(50);
  const [riskIndex, setRiskIndex] = useState(50);
  const [advisoryAssessment, setAdvisoryAssessment] = useState("");
  const [isViolationBlock, setIsViolationBlock] = useState(false);

  
  const [dynamicPhases, setDynamicPhases] = useState<RoadmapStep[]>([]);
  const [dynamicHurdles, setDynamicHurdles] = useState<HurdleStep[]>([]);

  const handleSimulateArchitecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupTitle || !problemStatement) return;

    setIsLoading(true);
    setHasSimulated(false);
    setIsViolationBlock(false);

    try {
      const response = await fetch("/api/submit-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "VENTURE_SIMULATION",
          payload: { startupTitle, problemStatement, selectedSector, selectedModel, selectedPricing }
        })
      });

      const resData = await response.json();

      if (!response.ok || resData.isViolation) {
        setViabilityIndex(0);
        setMarketFitIndex(0);
        setComplexityIndex(100);
        setRiskIndex(100);
        setIsViolationBlock(true);
        setAdvisoryAssessment(resData.error || "CRITICAL COMPLIANCE REFUSAL: Venture architecture blocked due to regulatory system filters.");
        setHasSimulated(true);
        setIsLoading(false);
        return;
      }

      
      const analysis = resData.aiAnalysis;
      
      setViabilityIndex(analysis.viabilityScore);
      setMarketFitIndex(analysis.marketFit);
      setComplexityIndex(analysis.executionComplexity);
      setRiskIndex(analysis.riskIndex);
      setAdvisoryAssessment(analysis.assessmentBrief);
      setDynamicPhases(analysis.roadmapPhases || []);
      setDynamicHurdles(analysis.hurdles || []);
      
      setHasSimulated(true);

    } catch (err) {
      alert("Analytical node handshake failure. Check your Groq API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintIsolatedDocument = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export your strategic roadmap PDF.");
      return;
    }

    const htmlOutput = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Strategic Analysis Report - ${startupTitle}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #0d0e12; padding: 2.5rem; line-height: 1.5; }
            .header-container { border-bottom: 3px solid #0f172a; padding-bottom: 1.5rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; }
            .branding-title { font-size: 1.6rem; font-weight: 900; text-transform: uppercase; margin: 0; }
            .section-header { font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.15em; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.35rem; margin: 2rem 0 0.75rem 0; }
            .profile-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; font-family: monospace; font-size: 11px; border: 1px solid #cbd5e1; padding: 1rem; background: #f8fafc; }
            .problem-blockquote { font-size: 12.5px; font-family: Georgia, serif; background: #f8fafc; padding: 1.25rem; border-left: 4px solid #475569; font-style: italic; margin: 0; }
            .assessment-box { font-size: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1rem; border-radius: 0.5rem; margin: 0; }
            .step-container { border: 1px solid #e2e8f0; padding: 1rem; background: #f8fafc; margin-bottom: 0.75rem; }
            .step-header { margin: 0 0 0.35rem 0; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #1d4ed8; font-family: monospace; }
            .risk-split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; border: 1px solid #fecdd3; padding: 1.25rem; background: #fff1f2; margin-bottom: 0.75rem; }
            .report-footer { margin-top: 3.5rem; border-top: 1px solid #e2e8f0; padding-top: 1rem; text-align: center; font-family: monospace; font-size: 8px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <h1 class="branding-title">BIMTECH E-CELL INCUBATION CORE</h1>
            </div>
            <div style="text-align: right; font-family: monospace; font-size: 11px;">
              <div>Venture Viability Index: <strong>${viabilityIndex}%</strong></div>
            </div>
          </div>

          <div class="section-header">01 // Executive Venture Profile</div>
          <div class="profile-grid">
            <div>Entity: <strong>${startupTitle}</strong></div>
            <div>Sector: <strong>${selectedSector}</strong></div>
            <div>Commercials: <strong>${selectedModel} // ${selectedPricing}</strong></div>
          </div>

          <div class="section-header">02 // Identified Market Friction</div>
          <p class="problem-blockquote">"${problemStatement}"</p>

          <div class="section-header">03 // AI Advisory Assessment</div>
          <p class="assessment-box">${advisoryAssessment}</p>

          <div class="section-header">04 // Tactical Implementation</div>
          <div>
            ${dynamicPhases.map(p => `
              <div class="step-container">
                <h4 class="step-header">${p.t}</h4>
                <p style="margin:0; font-size:11.5px; color:#334155;">${p.d}</p>
              </div>
            `).join("")}
          </div>

          <div class="section-header">05 // Systemic Risk Audit & Safeguards</div>
          <div>
            ${dynamicHurdles.map((h, i) => `
              <div class="risk-split-grid">
                <div>
                  <strong style="font-size:11px; color:#e11d48; display:block;">Threat: ${h.h}</strong>
                </div>
                <div style="border-left: 1px dashed #fda4af; padding-left: 1.5rem; color:#065f46; font-size:11px;">
                  <strong>Recommended Safeguard:</strong>
                  <p style="margin:4px 0 0 0;">${h.s}</p>
                </div>
              </div>
            `).join("")}
          </div>

          <div class="report-footer">CONFIDENTIAL RECORDS // BIMTECH E-CELL ARCHIVE // POWERED BY LLAMA3</div>
          <script>
            window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlOutput);
    printWindow.document.close();
  };

  return (
    <div className="w-full bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative shadow-2xl text-xs text-white">
      
      {/* LEFT HALF: EXTENDED INPUT FORM MATRIX */}
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
            <textarea required rows={3} value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} placeholder="Describe the explicit operational bottleneck or market friction layout..." className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white placeholder-white/10 focus:outline-none focus:border-blue-500 font-mono resize-none" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider text-white/40">Domain Sector Node</label>
            <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono">
              <option disabled className="text-white/30 font-bold bg-black">-- Deep Tech Cluster --</option>
              <option value="Artificial Intelligence">Artificial Intelligence & LLMOps</option>
              <option value="Autonomous Mobility">Autonomous Mobility & Robotics</option>
              <option value="Cybersecurity Nodes">Cybersecurity & Cryptographic Nets</option>
              <option disabled className="text-white/30 font-bold bg-black">-- Financial Infrastructures --</option>
              <option value="FinTech Nodes">FinTech, Neo-Banking & DeFi</option>
              <option value="B2B SaaS Ecosystems">B2B SaaS Infrastructure Tools</option>
              <option value="Web3 & Tokenomics">Web3 Protocols & Digital Identity</option>
              <option disabled className="text-white/30 font-bold bg-black">-- Climate Tech & Operations --</option>
              <option value="Sustainable Supply Chains">Sustainable Supply Chains & Logistics</option>
              <option value="CleanTech & Renewable Energy">CleanTech & Renewable Energy Core</option>
              <option value="AgriTech Ecosystems">AgriTech & Controlled Environment Farming</option>
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
                <option value="SaaS Subscription">SaaS Subscription</option>
                <option value="B2B Enterprise Contracts">B2B Enterprise Contracts</option>
                <option value="Transactional Cut">Transactional Cut</option>
                <option value="Freemium Scale">Freemium Scale</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-white/40">Pricing Matrix</label>
              <select value={selectedPricing} onChange={(e) => setSelectedPricing(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono">
                <option value="Premium Pricing">Premium Pricing</option>
                <option value="Value-Based Tiering">Value-Based Tiering</option>
                <option value="Cost-Plus Baseline">Cost-Plus Baseline</option>
                <option value="Dynamic Flow Mapping">Dynamic Flow Mapping</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" disabled={isLoading || !startupTitle || !problemStatement} className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 disabled:opacity-20 transition cursor-pointer">
          <Sparkles size={14} className={isLoading ? "animate-spin text-blue-500" : ""} />
          <span>{isLoading ? "Staging & Analyzing..." : "Simulate Business Architecture"}</span>
        </button>
      </form>

      {/* RIGHT HALF: LIVE LLM MONITOR SCREEN */}
      <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-center bg-zinc-950/40 relative max-h-[600px] overflow-y-auto">
        <AnimatePresence mode="wait">
          {!hasSimulated && !isLoading ? (
            <motion.div key="empty-prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 space-y-2 font-mono text-xs text-white/30">
              <Cpu size={24} className="mx-auto text-white/10 mb-2 animate-pulse" />
              <p>Sandbox engine standby. Input parameters to log row entries and open analytical trees.</p>
            </motion.div>
          ) : isLoading ? (
            <motion.div key="loading-prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-sm mx-auto w-full py-12">
              <div className="space-y-1 text-center font-mono">
                <div className="text-[10px] uppercase tracking-widest text-blue-500 font-bold animate-pulse">Streaming Free Inference Node</div>
                <p className="text-xs text-white/40">Llama 3 is crunching parameters and saving rows to your Sheet ledger...</p>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div initial={{ left: "-100%" }} animate={{ left: "100%" }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              </div>
            </motion.div>
          ) : (
            <motion.div key="results-prompt" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              
              {/* PERFORMANCE METRICS */}
              <div className="border border-white/5 bg-white/[0.01] p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-wider text-white/40">
                  <span className="flex items-center gap-1"><Layers size={10} /> Data Ledger Confirmed</span>
                  <span className="font-bold text-white">Llama 3 Balanced</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                    <span className="text-[8px] text-white/40 uppercase block">Viability</span>
                    <span className={`text-base font-black ${isViolationBlock ? 'text-red-500' : 'text-blue-400'}`}>{viabilityIndex}%</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                    <span className="text-[8px] text-white/40 uppercase block">Market Fit</span>
                    <span className="text-base font-black text-white">{marketFitIndex}%</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                    <span className="text-[8px] text-white/40 uppercase block">Complexity</span>
                    <span className="text-base font-black text-white">{complexityIndex}%</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                    <span className="text-[8px] text-white/40 uppercase block">Risk Index</span>
                    <span className="text-base font-black text-white">{riskIndex}%</span>
                  </div>
                </div>
              </div>

              {/* FEEDBACK ASSESSMENT */}
              <div className={`p-4 rounded-xl border flex gap-3 items-start ${isViolationBlock ? 'bg-red-500/5 border-red-500/20 text-red-200' : 'bg-blue-500/5 border-blue-500/10 text-white/90'}`}>
                {isViolationBlock ? <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" /> : <CheckCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />}
                <div className="space-y-0.5">
                  <div className="text-[9px] font-mono font-bold tracking-widest uppercase text-white/40">
                    {isViolationBlock ? "Compliance Filter Halt" : "Live AI Advisory Assessment"}
                  </div>
                  <p className="text-xs font-mono leading-relaxed select-none text-justify">{advisoryAssessment}</p>
                </div>
              </div>

              {/* 📅 DYNAMIC EXECUTION ROADMAP FROM LLM */}
              {!isViolationBlock && (
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <h4 className="text-[10px] font-mono tracking-widest text-white/40 uppercase flex items-center gap-1.5 pb-1">
                    <TrendingUp size={12} /> Strategic Execution Roadmap (Llama 3)
                  </h4>
                  <div className="space-y-2.5">
                    {dynamicPhases.map((step, idx) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl space-y-1 hover:border-white/10 transition">
                        <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-wide block">{step.t}</span>
                        <p className="text-[11px] text-white/60 font-sans leading-relaxed text-justify">{step.d}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 pt-2 font-mono text-[11px]">
                <button type="button" onClick={() => { setHasSimulated(false); setStartupTitle(""); setProblemStatement(""); }} className="px-3 py-1.5 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer">
                  <RefreshCw size={11} /> Clear Simulation
                </button>
                {!isViolationBlock && (
                  <button type="button" onClick={handlePrintIsolatedDocument} className="px-3 py-1.5 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition flex items-center gap-1.5 cursor-pointer">
                    <FileText size={11} /> Export Strategic Roadmap (PDF)
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