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

    // 1. Smooth artificial timeout loop to allow the UI sandbox loader grids to render beautifully
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const problemTextClean = problemStatement.trim().toLowerCase();
    const wordCount = problemTextClean.split(/\s+/).length;

    // 2. Free, Local Core Compliance Filtering Guardrails
    const complianceBlockTerms = ["scam", "exploit", "illegal", "hack", "bypass", "fraud"];
    const hasComplianceViolation = complianceBlockTerms.some(term => problemTextClean.includes(term));

    if (hasComplianceViolation) {
      setViabilityIndex(0);
      setIsViolationBlock(true);
      setAdvisoryAssessment(
        "CRITICAL COMPLIANCE REFUSAL: This concept triggers automatic regulatory filters. The E-Cell algorithmic sandbox completely blocks architectures promoting illegal frameworks, human rights violations, or unethical business models."
      );
      setHasSimulated(true);
      setIsLoading(false);
      return;
    }

    if (wordCount < 5) {
      setViabilityIndex(0);
      setIsViolationBlock(true);
      setAdvisoryAssessment(
        "SIMULATION ERROR: Problem statement is too brief or insubstantial. Please write a descriptive paragraph outlining an authentic target market scenario to generate logical advisory metrics."
      );
      setHasSimulated(true);
      setIsLoading(false);
      return;
    }

    // 3. Free Local Business Intelligence Evaluation Equation Core
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

    // Local deterministic pseudo-random variance engine based on string characteristics
    const textLengthVariance = (problemStatement.length % 7) - 3;
    const finalizedIndex = Math.min(98, Math.max(15, computedScore + textLengthVariance));

    // 4. Generate Dynamic, Strategic Sandbox Text Output Layout Frames
    let assessmentBrief = `High-velocity ${selectedSector} framework layout confirmed. Incorporating a ${selectedModel} model paired with ${selectedPricing} establishes robust initial cash generation thresholds. Ensure your pilot sprints focus heavily on tracking explicit client acquisition conversion parameters to offset infrastructure overheads.`;
    
    if (selectedSector === "Artificial Intelligence" && selectedPricing === "Premium Pricing") {
      assessmentBrief += " Moving toward premium pricing tiers will properly protect your operational margins against fluctuating API data processing costs.";
    }

    // 5. Update state directly in browser memory to trigger instant rendering loops (No API endpoints required!)
    setViabilityIndex(finalizedIndex);
    setAdvisoryAssessment(assessmentBrief);
    setHasSimulated(true);
    setIsLoading(false);
  };

  // --- THE ISOLATED WINDOW PRINT SANDBOX FUNCTION ---
  // --- THE EXPANDED HIGH-PROFESSIONAL PRINT ROADMAP FUNCTION ---
  const handlePrintIsolatedDocument = () => {
    const currentInsights = getStrategicInsights();
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export your strategic roadmap PDF.");
      return;
    }

    // Dynamic, professional intelligence mapping engine based on sector selection
    const getDetailedIndustryMatrix = (sector: string) => {
      const matrices: Record<string, { overview: string; tailwinds: string; vulnerabilities: string[] }> = {
        "Artificial Intelligence": {
          overview: "The artificial intelligence and LLMOps domain is experiencing a structural shift from centralized foundational models to localized, highly optimized domain-specific pipelines. System design efficiency and data sovereignty serve as primary competitive moats.",
          tailwinds: "Decreasing token costs, widespread availability of high-performance open-source model branches, and surging enterprise demand for contextual workflow automation layers.",
          vulnerabilities: [
            "Fluctuating inference and compute overhead run-rates threatening gross margins.",
            "Semantic context drift, regression vulnerabilities, and data governance non-compliance risks."
          ]
        },
        "B2B SaaS Ecosystems": {
          overview: "B2B SaaS architectures are shifting toward hyper-focused workflow verticalization. Modern enterprises demand deep out-of-the-box integration layers, exceptional data compliance, and verifiable data-driven ROI maps before allocating seat budgets.",
          tailwinds: "Corporate consolidation of fragmented legacy software and high system stickiness once integrated into core operational systems.",
          vulnerabilities: [
            "Elongated enterprise procurement cycles and high initial friction paths for pilot conversions.",
            "Elevated initial customer churn risk if onboarding workflows are unoptimized."
          ]
        },
        "Autonomous Mobility": {
          overview: "Autonomous mobility, robotics, and physical tech systems demand deep coordination between spatial compute middleware and embedded hardware infrastructure loops.",
          tailwinds: "Rapid advancements in localized edge-computing architectures and institutional support for supply chain automation models.",
          vulnerabilities: [
            "High research and development capital intensive burn-rates prior to unit validation.",
            "Complex hardware supply chain constraints and localized regulatory compliance friction paths."
          ]
        },
        "Cybersecurity Nodes": {
          overview: "The threat landscape is scaling exponentially, turning security frameworks from defensive perimeters into zero-trust, continuous cryptographic validation systems.",
          tailwinds: "Surging executive-level focus on systemic security liabilities and strict regulatory mandates for real-time intrusion monitoring.",
          vulnerabilities: [
            "High systemic liability margins in the event of zero-day exploits.",
            "Continuous technical debt accumulation due to evolving attack vectors."
          ]
        },
        "FinTech Nodes": {
          overview: "Financial technology, modern core-banking systems, and decentralized rails require absolute transaction integrity, zero-latency processing pools, and ironclad regulatory compliance structures.",
          tailwinds: "Widespread infrastructure democratization via open banking protocols and high margin capture opportunities in niche cross-border settlement channels.",
          vulnerabilities: [
            "Severe banking compliance audit deadlocks and state financial license procurement friction.",
            "Systemic payment gateway fraud risks and third-party ledger synchronization dependencies."
          ]
        },
        "Web3 & Tokenomics": {
          overview: "Web3 networks are moving toward decentralized identities, self-sovereign data layers, and modular gas-optimized protocol tracks.",
          tailwinds: "Maturing consensus layers and enterprise validation of asset tokenization frameworks.",
          vulnerabilities: [
            "Highly volatile token-economic balance layers and shifting global macro-regulatory classifications.",
            "Smart contract exploit vectors and UX adoption barriers for non-technical user cohorts."
          ]
        },
        "Sustainable Supply Chains": {
          overview: "Global logistics networks are undergoing a massive transformation, transitioning to data-driven green transit tracking, automated inventory systems, and transparent carbon-accounting chains.",
          tailwinds: "Surging multi-national corporate emphasis on carbon tracking mandates and green energy operational efficiencies.",
          vulnerabilities: [
            "Fragmented data reporting loops across multi-tier third-party transit stakeholders.",
            "Elevated initial hardware integration expenses for real-time warehouse logging systems."
          ]
        },
        "CleanTech & Renewable Energy": {
          overview: "The energy sector requires distributed micro-grid management models, efficient grid load balancing, and advanced chemical/physical battery storage tracking configurations.",
          tailwinds: "Substantial institutional green grants, tax relief policies, and long-term macro-utility cost advantages.",
          vulnerabilities: [
            "Extensive capital expenditure deployment horizons before achieving operational yield parity.",
            "Intermittent generation resource dependencies and grid-interconnect regulatory friction."
          ]
        },
        "AgriTech Ecosystems": {
          overview: "Precision agricultural frameworks leverage spatial IoT arrays, automated controlled environments, and soil telemetry datasets to optimize farm yield metrics.",
          tailwinds: "Macro food security tailwinds and predictable, climate-insulated harvesting predictability matrices.",
          vulnerabilities: [
            "High primary sensor hardware staging overhead costs across geographically distributed networks.",
            "Relatively low tech-adoption rates inside conservative traditional industry distribution cells."
          ]
        },
        "Direct Consumer Retail": {
          overview: "Modern direct-to-consumer digital commerce requires meticulous optimization of customer acquisition channels, reliable delivery loops, and high lifetime value metrics.",
          tailwinds: "Direct end-user interaction feedback loops and immediate margin capture potentials.",
          vulnerabilities: [
            "Extremely high competitive noise ratios and volatile paid-ad customer acquisition cost patterns.",
            "Inventory working capital deadlocks and reverse logistics processing margins."
          ]
        },
        "HealthTech & Telemedicine": {
          overview: "Digital medicine networks require end-to-end medical record data insulation, zero-fault diagnostics processing, and frictionless provider-to-patient channels.",
          tailwinds: "Institutional healthcare operational deficits pushing for distributed preventative monitoring models.",
          vulnerabilities: [
            "Stringent healthcare data privacy regulations and severe diagnostic system liabilities.",
            "Friction in clinician onboarding and medical verification gate compliance."
          ]
        },
        "EdTech Systems": {
          overview: "Continuous education portals are shifting from passive media video libraries to hyper-personalized, active continuous learning sandboxes.",
          tailwinds: "Rapid shifts in enterprise workforce re-skilling trends and expanding remote-first professional demands.",
          vulnerabilities: [
            "Historically low student course completion ratios and high platform fatigue curves.",
            "Saturated business environments leading to aggressive b2b pricing constraints."
          ]
        }
      };

      return matrices[sector] || {
        overview: "The targeted market space presents clear structural optimization opportunities. Successful execution demands strict capital constraint management and distinct product insulation matrices.",
        tailwinds: "General sector modernization tracks and expanding digital transformation adoption parameters across corporate client segments.",
        vulnerabilities: [
          "Unoptimized go-to-market cost metrics.",
          "Shifting customer retention dynamics within competitive business landscapes."
        ]
      };
    };

    const sectorMeta = getDetailedIndustryMatrix(selectedSector);

    const htmlOutput = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Strategic Analysis Report - ${startupTitle}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0d0e12; background: #fff; margin: 0; padding: 2.5rem; box-sizing: border-box; line-height: 1.5; }
            .header-container { border-bottom: 3px solid #0f172a; padding-bottom: 1.5rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; }
            .branding-title { font-size: 1.6rem; font-weight: 900; text-transform: uppercase; letter-spacing: -0.03em; margin: 0; color: #0f172a; }
            .branding-subtitle { font-size: 10px; font-family: monospace; color: #475569; text-transform: uppercase; margin: 4px 0 0 0; letter-spacing: 0.05em; }
            .metadata-panel { text-align: right; font-family: monospace; font-size: 11px; color: #334155; line-height: 1.4; }
            .section-header { font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.15em; color: #475569; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.35rem; margin: 2rem 0 0.75rem 0; page-break-after: avoid; }
            .profile-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; font-family: monospace; font-size: 11px; border: 1px solid #cbd5e1; padding: 1rem; border-radius: 0.5rem; background: #f8fafc; }
            .metric-tag { color: #64748b; display: block; text-transform: uppercase; font-size: 9px; margin-bottom: 2px; }
            .problem-blockquote { font-size: 12.5px; line-height: 1.6; font-family: Georgia, serif; color: #1e293b; background: #f8fafc; padding: 1.25rem; border-radius: 0.5rem; border-left: 4px solid #475569; margin: 0; font-style: italic; }
            .assessment-box { font-size: 12px; line-height: 1.6; color: #0f172a; font-weight: 500; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1rem; border-radius: 0.5rem; margin: 0; }
            .industry-narrative { font-size: 12px; color: #1e293b; text-align: justify; margin: 0 0 0.75rem 0; }
            .bullet-list { margin: 0; padding-left: 1.25rem; font-size: 11.5px; color: #334155; }
            .bullet-list li { margin-bottom: 0.5rem; }
            .step-container { border: 1px solid #e2e8f0; padding: 1rem; border-radius: 0.5rem; background: #f8fafc; margin-bottom: 0.75rem; page-break-inside: avoid; }
            .step-header { margin: 0 0 0.35rem 0; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #1d4ed8; font-family: monospace; }
            .step-body { margin: 0; font-size: 11.5px; color: #334155; }
            .risk-split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; border: 1px solid #fecdd3; padding: 1.25rem; border-radius: 0.5rem; background: #fff1f2; margin-bottom: 0.75rem; page-break-inside: avoid; }
            .risk-label-red { font-size: 9px; text-transform: uppercase; font-family: monospace; color: #e11d48; font-weight: bold; display: block; margin-bottom: 2px; }
            .risk-label-green { font-size: 9px; text-transform: uppercase; font-family: monospace; color: #059669; font-weight: bold; display: block; margin-bottom: 2px; }
            .risk-title-text { margin: 0; font-size: 11.5px; font-weight: bold; color: #0f172a; }
            .risk-desc-text { margin: 4px 0 0 0; font-size: 11px; color: #334155; line-height: 1.5; }
            .report-footer { margin-top: 3.5rem; border-top: 1px solid #e2e8f0; padding-top: 1rem; text-align: center; font-family: monospace; font-size: 8px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; }
            @page { size: portrait; margin: 1.6cm; }
            .force-break { page-break-before: always; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <h1 class="branding-title">BIMTECH E-CELL INCUBATION CORE</h1>
              <p class="branding-subtitle">Venture Intelligence Strategic Diagnostic Brief</p>
            </div>
            <div class="metadata-panel">
              <div>Document ID: TYV-${Math.random().toString(36).substring(2, 7).toUpperCase()}-2026</div>
              <div>Date Generated: ${new Date().toLocaleDateString('en-US')}</div>
              <div>Venture Viability Index: <strong>${viabilityIndex}%</strong></div>
            </div>
          </div>

          <div class="section-header">01 // Executive Venture Profile</div>
          <div class="profile-grid">
            <div><span class="metric-tag">Brand Entity Node:</span> <strong>${startupTitle}</strong></div>
            <div><span class="metric-tag">Target Sector Track:</span> <strong>${selectedSector}</strong></div>
            <div><span class="metric-tag">Commercial Framework:</span> <strong>${selectedModel} // ${selectedPricing}</strong></div>
          </div>

          <div class="section-header">02 // Identified Market Friction</div>
          <p class="problem-blockquote">"${problemStatement}"</p>

          <div class="section-header">03 // Industry Landscape & Market Macro Analysis</div>
          <p class="industry-narrative">${sectorMeta.overview}</p>
          <div style="margin-top: 0.5rem;">
            <span style="font-size: 10px; font-family: monospace; font-weight: bold; uppercase; color: #0284c7; display: block; margin-bottom: 2px;">Key Industry Tailwinds & Drivers:</span>
            <p style="margin: 0; font-size: 11.5px; color: #334155; text-align: justify;">${sectorMeta.tailwinds}</p>
          </div>

          <div class="section-header">04 // Automated Strategic Advisory Assessment</div>
          <p class="assessment-box"><strong>Operational Feedback Consensus:</strong> ${advisoryAssessment}</p>

          <div class="section-header force-break">05 // Tactical Implementation & Phased Milestones</div>
          <div style="display: flex; flex-direction: column;">
            ${currentInsights.phases.map(p => `
              <div class="step-container">
                <h4 class="step-header">${p.t}</h4>
                <p class="step-body">${p.d}</p>
              </div>
            `).join("")}
          </div>

          <div class="section-header">06 // Systemic Risk Audit & Strategic Fallback Protocols</div>
          <div style="display: flex; flex-direction: column;">
            ${currentInsights.hurdles.map((h, index) => `
              <div class="risk-split-grid">
                <div>
                  <span class="risk-label-red">Primary Operational Threat [0${index + 1}]:</span>
                  <p class="risk-title-text">${h.h}</p>
                  <span class="risk-label-red" style="margin-top: 8px; color: #b45309;">Sector Vulnerability Factor:</span>
                  <p class="risk-desc-text" style="font-style: italic; color: #78350f;">"${sectorMeta.vulnerabilities[index] || "Market deployment timing imbalances."}"</p>
                </div>
                <div style="border-left: 1px dashed #fda4af; padding-left: 1.5rem;">
                  <span class="risk-label-green">E-Cell Recommended Safeguard:</span>
                  <p class="risk-desc-text" style="color: #065f46; font-weight: 500;">${h.s}</p>
                </div>
              </div>
            `).join("")}
          </div>

          <div class="report-footer">
            CONFIDENTIAL DOCUMENT // FOR INTERNAL BIMTECH E-CELL INCUBATION ARCHIVE RECORDS ONLY
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

        <button type="submit" mercantile-attribute="true" disabled={isLoading || !startupTitle || !problemStatement} className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 disabled:opacity-20 transition cursor-pointer">
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
                <button type="button" onClick={() => { setHasSimulated(false); setStartupTitle(""); setProblemStatement(""); }} className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer">
                  <RefreshCw size={12} /> Clear Simulation
                </button>
                {!isViolationBlock && (
                  <button type="button" onClick={handlePrintIsolatedDocument} className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition flex items-center gap-1.5 cursor-pointer">
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