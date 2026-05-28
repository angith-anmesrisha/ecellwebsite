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

  // --- DYNAMIC STRATEGIC ADVISORY DATA MATRIX ---
  const getStrategicInsights = () => {
    switch (selectedSector) {
      case "Artificial Intelligence":
        return {
          phases: [
            { t: "Phase 1: Architecture & Model Selection", d: "Finalize core LLM infrastructure pipelines, lock down token caching protocols, and build local sandboxed staging environments." },
            { t: "Phase 2: Alpha Benchmarking & Guardrails", d: "Run extreme semantic safety stress tests, validate token overhead costs, and deploy content filtering layers to prevent compliance drops." },
            { t: "Phase 3: Enterprise Integration Sprint", d: "Open secure API gateway matrices, establish premium tier billing loops, and execute client onboarding pilots." }
          ],
          hurdles: [
            { h: "Fluctuating API/Compute Overheads", s: "Deploy strict algorithmic vector caching structures and migrate high-frequency classification loops to leaner, open-source model layers." },
            { h: "Semantic Context Drift & Hallucinations", s: "Build a multi-layered verification system with a local rule-checking firewall to monitor system inputs in real-time." }
          ]
        };
      case "B2B SaaS Ecosystems":
        return {
          phases: [
            { t: "Phase 1: MVP Feature Lock", d: "Map explicit workflow automation nodes, isolate core data visualization features, and build clean multi-tenant workspace pipelines." },
            { t: "Phase 2: Pilot Client Sandbox Integration", d: "Deploy target operational modules within 2-3 partner enterprise staging environments to track true retention behaviors." },
            { t: "Phase 3: Value Expansion & GTM Scale", d: "Introduce custom premium pricing structures, open tiered seats management, and scale outbound pipeline metrics." }
          ],
          hurdles: [
            { h: "High Initial Enterprise Churn Risk", s: "Establish dedicated client success workflows within the software architecture and prioritize system stability over non-essential feature drops." },
            { h: "Fragmented Integration Bottlenecks", s: "Expose clean, fully documented RESTful public endpoints to let enterprise IT cells build custom workflows on top of your engine." }
          ]
        };
      default:
        return {
          phases: [
            { t: "Phase 1: Validation & Pilot Scope", d: "Isolate market friction parameters, compile initial target user cohorts, and map basic cash validation criteria." },
            { t: "Phase 2: Controlled Staging Deployment", d: "Launch functional platform mechanics to a closed loop of beta accounts to capture baseline unit economic variables." },
            { t: "Phase 3: Scaling & Optimization Engine", d: "Optimize pricing matrices, balance infrastructure expenses, and scale customer acquisition channels cleanly." },
          ],
          hurdles: [
            { h: "Customer Acquisition Friction Paths", s: "Build high-impact organic loops directly into the user onboarding workflow to lower paid performance marketing needs." },
            { h: "Scaling Structural Operational Crises", s: "Refactor core application layers early to clear data deadlocks and optimize relational database indexing routines." }
          ]
        };
    }
  };

  const handleSimulateArchitecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupTitle || !problemStatement) return;

    setIsLoading(true);
    setHasSimulated(false);
    setIsViolationBlock(false);

    try {
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

      // --- BUSINESS INTELLIGENCE EQUATION CORE ---
      let computedScore = 55;

      switch (selectedSector) {
        case "Artificial Intelligence":
        case "Cybersecurity Nodes":
          computedScore += 15;
          break;
        case "FinTech Nodes":
        case "B2B SaaS Ecosystems":
          computedScore += 12;
          break;
        case "Sustainable Supply Chains":
        case "Autonomous Mobility":
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

      if (selectedModel === "SaaS Subscription") computedScore += 10;
      if (selectedModel === "B2B Enterprise Contracts") computedScore += 12;

      if (selectedPricing === "Premium Pricing") computedScore += 8;
      if (selectedPricing === "Value-Based Tiering") computedScore += 10;

      const operationalVariance = Math.floor(Math.random() * 7) - 3;
      const finalizedIndex = Math.min(98, Math.max(15, computedScore + operationalVariance));

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

  // --- THE ISOLATED WINDOW PRINT SANDBOX FUNCTION ---
  const handlePrintIsolatedDocument = () => {
    const currentInsights = getStrategicInsights();
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export your strategic roadmap PDF.");
      return;
    }

    const htmlOutput = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Strategic Roadmap - ${startupTitle}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #000; background: #fff; margin: 0; padding: 2rem; box-sizing: border-box; }
            .header-row { border-bottom: 2px solid #000; padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; }
            .title-main { font-size: 1.5rem; font-weight: 900; text-transform: uppercase; letter-spacing: -0.025em; margin: 0; }
            .subtitle { font-size: 10px; font-family: monospace; color: #555; text-transform: uppercase; margin: 2px 0 0 0; }
            .meta-box { text-align: right; font-family: monospace; font-size: 11px; }
            .section-title { font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em; color: #777; font-weight: bold; margin: 1.5rem 0 0.5rem 0; }
            .grid-profile { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; font-family: monospace; font-size: 11px; border: 1px solid #e5e7eb; padding: 0.75rem; border-radius: 0.5rem; background: #f9fafb; }
            .metric-label { color: #9ca3af; display: block; text-transform: uppercase; font-size: 9px; }
            .p-italic { font-size: 12px; line-height: 1.6; font-family: Georgia, serif; color: #1f2937; background: #f9fafb; padding: 1rem; border-radius: 0.5rem; border: 1px solid #f3f4f6; font-style: italic; margin: 0; }
            .assessment-text { font-size: 12px; line-height: 1.6; color: #000; font-weight: 500; border-left: 3px solid #000; padding-left: 0.75rem; margin: 0; }
            .card-step { border: 1px solid #e5e7eb; padding: 1rem; border-radius: 0.5rem; background: #f9fafb; margin-bottom: 0.75rem; page-break-inside: avoid; }
            .step-title { margin: 0 0 0.25rem 0; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #2563eb; font-family: monospace; }
            .step-desc { margin: 0; font-size: 11px; line-height: 1.5; color: #374151; }
            .grid-hurdle { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; border: 1px solid #fee2e2; padding: 1rem; border-radius: 0.5rem; background: #fffdfd; margin-bottom: 0.75rem; page-break-inside: avoid; }
            .red-title { font-size: 9px; text-transform: uppercase; font-family: monospace; color: #ef4444; font-weight: bold; display: block; }
            .green-title { font-size: 9px; text-transform: uppercase; font-family: monospace; color: #10b981; font-weight: bold; display: block; }
            .bold-black { margin: 2px 0 0 0; font-size: 11px; font-weight: bold; color: #000; }
            .desc-gray { margin: 2px 0 0 0; font-size: 11px; color: #374151; line-height: 1.5; }
            .footer-sig { margin-top: 3rem; border-top: 1px solid #e5e7eb; padding-top: 1rem; text-align: center; font-family: monospace; font-size: 8px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; }
            @page { size: portrait; margin: 1.5cm; }
            .page-break-before { page-break-before: always; }
          </style>
        </head>
        <body>
          <div class="header-row">
            <div>
              <h1 class="title-main">BIMTECH E-CELL INCUBATION SANDBOX</h1>
              <p class="subtitle">Venture Intelligence Strategic Roadmap Report</p>
            </div>
            <div class="meta-box">
              <div>Date: ${new Date().toLocaleDateString('en-US')}</div>
              <div>Viability Index: <strong>${viabilityIndex}%</strong></div>
            </div>
          </div>

          <div class="section-title">01 // Venture Profile</div>
          <div class="grid-profile">
            <div><span class="metric-label">Brand Entity:</span> <strong>${startupTitle}</strong></div>
            <div><span class="metric-label">Domain Node:</span> <strong>${selectedSector}</strong></div>
            <div><span class="metric-label">Monetization Hub:</span> <strong>${selectedModel} // ${selectedPricing}</strong></div>
          </div>

          <div class="section-title">02 // Market Friction & Target Problem</div>
          <p class="p-italic">"${problemStatement}"</p>

          <div class="section-title">03 // Algorithmic Strategic Assessment</div>
          <p class="assessment-text">${advisoryAssessment}</p>

          <div class="section-title page-break-before">04 // Tactical Implementation Roadmap Plan</div>
          <div style="display: flex; flex-direction: column;">
            ${currentInsights.phases.map(p => `
              <div class="card-step">
                <h4 class="step-title">${p.t}</h4>
                <p class="step-desc">${p.d}</p>
              </div>
            `).join("")}
          </div>

          <div class="section-title">05 // Critical Hurdles & Strategic Fallback Safeguards</div>
          <div style="display: flex; flex-direction: column;">
            ${currentInsights.hurdles.map(h => `
              <div class="grid-hurdle">
                <div>
                  <span class="red-title">Anticipated Operational Hurdle:</span>
                  <p class="bold-black">${h.h}</p>
                </div>
                <div style="border-left: 1px dashed #fca5a5; padding-left: 1.5rem;">
                  <span class="green-title">E-Cell Recommended Solution:</span>
                  <p class="desc-gray">${h.s}</p>
                </div>
              </div>
            `).join("")}
          </div>

          <div class="footer-sig">
            Generated via BIMTECH E-Cell Venture Intelligence Sandbox Engine // Internal Incubation Records
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlOutput);
    printWindow.document.close();
  };

  return (
    <div className="w-full bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative shadow-2xl">
      
      {/* LEFT HALF: INPUT MATRIX */}
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

        <button type="submit" disabled={isLoading || !startupTitle || !problemStatement} className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 disabled:opacity-20 transition">
          <Sparkles size={14} className={isLoading ? "animate-spin text-blue-500" : ""} />
          <span>{isLoading ? "Running Mathematical Models..." : "Simulate Business Architecture"}</span>
        </button>
      </form>

      {/* RIGHT HALF: MONITOR DISPLAY */}
      <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-center bg-zinc-950/40 relative">
        <AnimatePresence mode="wait">
          {!hasSimulated && !isLoading ? (
            <motion.div key="empty-prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 space-y-2 font-mono text-xs text-white/30">
              <Cpu size={24} className="mx-auto text-white/10 mb-2 animate-pulse" />
              <p>Sandbox engine standby. Input configuration parameters to initiate modeling sequences.</p>
            </motion.div>
          ) : isLoading ? (
            <motion.div key="loading-prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-sm mx-auto w-full">
              <div className="space-y-1 text-center font-mono">
                <div className="text-[10px] uppercase tracking-widest text-blue-500 font-bold animate-pulse">Assembling Execution Trees</div>
                <p className="text-xs text-white/40">Parsing syntax structures for semantic integrity loops...</p>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div initial={{ left: "-100%" }} animate={{ left: "100%" }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              </div>
            </motion.div>
          ) : (
            <motion.div key="results-prompt" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 h-full flex flex-col justify-between">
              
              <div className="border border-white/5 bg-white/[0.01] p-5 rounded-xl space-y-4">
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
                  <motion.div initial={{ width: 0 }} animate={{ width: `${viabilityIndex}%` }} className={`absolute top-0 bottom-0 rounded-full ${isViolationBlock ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`} />
                </div>
              </div>

              <div className={`p-5 rounded-xl border flex gap-3 items-start ${isViolationBlock ? 'bg-red-500/5 border-red-500/20 text-red-200' : 'bg-blue-500/5 border-blue-500/10 text-white/90'}`}>
                {isViolationBlock ? <ShieldAlert size={18} className="text-red-500 shrink-0 mt-0.5 animate-bounce" /> : <CheckCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/40 flex items-center gap-1">
                    {isViolationBlock ? "Compliance Refusal Warning" : "Strategic Advisory Assessment"}
                  </div>
                  <p className="text-xs font-mono leading-relaxed select-none">{advisoryAssessment}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2 font-mono text-xs">
                <button type="button" onClick={() => { setHasSimulated(false); setStartupTitle(""); setProblemStatement(""); }} className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition flex items-center gap-1.5">
                  <RefreshCw size={12} /> Clear Simulation
                </button>
                {!isViolationBlock && (
                  <button type="button" onClick={handlePrintIsolatedDocument} className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition flex items-center gap-1.5">
                    <FileText size={12} /> Export Strategic Roadmap (PDF)
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