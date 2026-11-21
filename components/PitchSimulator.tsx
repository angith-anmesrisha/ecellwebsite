"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  RefreshCw,
  FileText,
  CheckCircle,
  ShieldAlert,
  Cpu,
  Layers,
  TrendingUp,
  Compass,
  Award,
  Copy,
  Check,
  ArrowRight,
  RotateCcw,
  Wallet,
  Users,
  Activity,
  ShieldCheck,
} from "lucide-react";

interface RoadmapStep {
  t: string;
  d: string;
}

interface HurdleStep {
  h: string;
  s: string;
}

interface DecisionOption {
  id: string;
  label: string;
  tag: string;
  detail: string;
  runwayDelta: number; // months
  tractionDelta: number; // 0-100 scale
  marginDelta: number; // 0-100 scale
  opsDelta: number; // 0-100 scale
  takeaway: string;
}

interface DecisionStage {
  id: string;
  stepLabel: string;
  title: string;
  prompt: string;
  options: DecisionOption[];
}

const DECISION_STAGES: DecisionStage[] = [
  {
    id: "acquisition",
    stepLabel: "Stage 01 // Customer Acquisition",
    title: "How do you win your first 500 users?",
    prompt: "You have ₹6 Lakhs in seed grants and 12 months of baseline runway. Pick your primary GTM engine.",
    options: [
      {
        id: "community",
        label: "Campus & Community-Led Seeding",
        tag: "Low CAC · High Trust",
        detail: "Launch pilot cohorts across colleges/communities with referral loops and founder-led onboarding.",
        runwayDelta: 1,
        tractionDelta: 16,
        marginDelta: 12,
        opsDelta: 8,
        takeaway: "Strong organic retention and low CAC, though top-of-funnel scale starts measured.",
      },
      {
        id: "paid",
        label: "Aggressive Performance Ads",
        tag: "Fast Spike · High Burn",
        detail: "Run targeted Meta/Google acquisition campaigns immediately to test conversion velocity.",
        runwayDelta: -3,
        tractionDelta: 24,
        marginDelta: -10,
        opsDelta: -4,
        takeaway: "Fast early user volume, but paid CAC compresses margins before retention is proven.",
      },
      {
        id: "b2b_partners",
        label: "Channel & Institutional Pilots",
        tag: "High ACV · Longer Cycle",
        detail: "Sign 3–5 anchor institutions or mid-market partners for co-branded distribution.",
        runwayDelta: 0,
        tractionDelta: 14,
        marginDelta: 16,
        opsDelta: 6,
        takeaway: "Predictable bulk distribution with strong unit economics once procurement clears.",
      },
    ],
  },
  {
    id: "pricing",
    stepLabel: "Stage 02 // Monetization & Pricing",
    title: "How do you capture value?",
    prompt: "Early adopters are active. Choose the revenue model that shapes your cash conversion cycle.",
    options: [
      {
        id: "annual_upfront",
        label: "Upfront Quarterly / Annual Plans",
        tag: "Cash-Flow Positive",
        detail: "Offer a 20% discount for upfront commitment to fund operations from customer cash.",
        runwayDelta: 3,
        tractionDelta: -4,
        marginDelta: 18,
        opsDelta: 6,
        takeaway: "Upfront cash extends runway substantially and filters for high-intent buyers.",
      },
      {
        id: "freemium",
        label: "Freemium + Usage Add-Ons",
        tag: "Viral Wedge · Delayed Revenue",
        detail: "Keep core workflows free to maximize adoption and monetize power features later.",
        runwayDelta: -2,
        tractionDelta: 22,
        marginDelta: -6,
        opsDelta: -4,
        takeaway: "Maximizes top-of-funnel growth, requiring tight infra cost caps on free users.",
      },
      {
        id: "commission",
        label: "Outcome / Transaction Take-Rate",
        tag: "Aligned ROI · Variable Cash",
        detail: "Charge a percentage fee only when your product delivers a verified transaction or saving.",
        runwayDelta: 0,
        tractionDelta: 14,
        marginDelta: 10,
        opsDelta: 2,
        takeaway: "Easy yes for hesitant customers; revenue scales directly with platform throughput.",
      },
    ],
  },
  {
    id: "burn",
    stepLabel: "Stage 03 // Capital & Team Allocation",
    title: "Where does your next ₹3 Lakhs go?",
    prompt: "Demand is picking up and your small founding team is stretched thin.",
    options: [
      {
        id: "lean_automation",
        label: "Automate Core Workflows + Lean Ops",
        tag: "High Leverage · Disciplined Burn",
        detail: "Invest in internal tooling, self-serve onboarding, and part-time specialist contractors.",
        runwayDelta: 2,
        tractionDelta: 8,
        marginDelta: 14,
        opsDelta: 18,
        takeaway: "Protects runway while raising revenue-per-team-member before full-time hiring.",
      },
      {
        id: "sales_blitz",
        label: "Hire Full-Time Growth & Field Reps",
        tag: "Pipeline Push · Fixed Overhead",
        detail: "Bring on dedicated outbound reps and campus ambassadors to double monthly demos.",
        runwayDelta: -3,
        tractionDelta: 20,
        marginDelta: -8,
        opsDelta: -6,
        takeaway: "Accelerates pipeline growth, but raises fixed monthly burn immediately.",
      },
      {
        id: "product_moat",
        label: "Deep Product & Reliability Sprint",
        tag: "Defensibility · Slower GTM",
        detail: "Focus engineering bandwidth on proprietary features, security, and uptime SLAs.",
        runwayDelta: -1,
        tractionDelta: 4,
        marginDelta: 8,
        opsDelta: 20,
        takeaway: "Builds durable product moat and slashes churn, though short-term growth pauses.",
      },
    ],
  },
  {
    id: "bottleneck",
    stepLabel: "Stage 04 // Operations & Supply Shock",
    title: "A sudden fulfillment bottleneck hits.",
    prompt: "Order/usage volume jumps 3x in one week, exposing a weak link in delivery and support.",
    options: [
      {
        id: "buffer_sla",
        label: "Cap Intake + Set Tiered SLAs",
        tag: "Protects Quality & Margin",
        detail: "Introduce a waitlist for new cohorts while guaranteeing 24-hour SLA for active users.",
        runwayDelta: 1,
        tractionDelta: -4,
        marginDelta: 14,
        opsDelta: 22,
        takeaway: "Preserves NPS and unit margins under stress instead of burning trust with delays.",
      },
      {
        id: "absorb_cost",
        label: "Expedite Fulfillment at Any Cost",
        tag: "Zero Churn · Margin Hit",
        detail: "Pay rush vendor/cloud premiums and overtime support so every user gets served on time.",
        runwayDelta: -2,
        tractionDelta: 16,
        marginDelta: -14,
        opsDelta: 10,
        takeaway: "Keeps every customer happy during the spike, at the cost of temporary margin compression.",
      },
      {
        id: "self_serve_pivot",
        label: "Ship Self-Serve Batch Fulfillment",
        tag: "Scalable Fix · Medium Effort",
        detail: "Standardize packages and batch daily operations to clear the queue sustainably.",
        runwayDelta: 0,
        tractionDelta: 10,
        marginDelta: 12,
        opsDelta: 18,
        takeaway: "Turns a one-off bottleneck into a repeatable operating playbook.",
      },
    ],
  },
];

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

export default function PitchSimulator() {
  const [mode, setMode] = useState<"ai" | "game">("ai");

  // Shared venture inputs
  const [startupTitle, setStartupTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [selectedSector, setSelectedSector] = useState("Artificial Intelligence");
  const [selectedModel, setSelectedModel] = useState("SaaS Subscription");
  const [selectedPricing, setSelectedPricing] = useState("Premium Pricing");

  // Mode 1: AI Quick Scan state
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

  // Mode 2: Branching Venture Decision Game state
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [choices, setChoices] = useState<Record<string, DecisionOption>>({});
  const [copiedSummary, setCopiedSummary] = useState(false);

  const gameMetrics = useMemo(() => {
    let runway = 12; // months
    let traction = 32; // %
    let margin = 45; // %
    let ops = 45; // %

    // Baseline modifiers from initial setup
    if (selectedModel === "B2B Enterprise Contracts") {
      margin += 8;
      traction -= 4;
    } else if (selectedModel === "Freemium Scale") {
      traction += 8;
      runway -= 1;
    }

    if (selectedPricing === "Premium Pricing") {
      margin += 8;
    } else if (selectedPricing === "Cost-Plus Baseline") {
      ops += 6;
    }

    Object.values(choices).forEach((opt) => {
      runway += opt.runwayDelta;
      traction += opt.tractionDelta;
      margin += opt.marginDelta;
      ops += opt.opsDelta;
    });

    const finalRunway = clamp(runway, 2, 24);
    const finalTraction = clamp(traction, 10, 98);
    const finalMargin = clamp(margin, 10, 98);
    const finalOps = clamp(ops, 10, 98);

    const readinessScore = Math.round(
      clamp((finalRunway / 18) * 25 + finalTraction * 0.3 + finalMargin * 0.25 + finalOps * 0.2, 15, 99),
    );

    let tier = "Early Explorer";
    let verdict = "Promising foundation, but tighten burn and unit economics before scaling acquisition.";
    if (readinessScore >= 80) {
      tier = "Incubation Ready";
      verdict = "Balanced growth, healthy cash runway, and resilient operations. Ready for live pilot grants and demo day.";
    } else if (readinessScore >= 65) {
      tier = "Growth Contender";
      verdict = "Solid market momentum with manageable execution risk. Focus on protecting gross margins as volume scales.";
    } else if (readinessScore >= 50) {
      tier = "Validation Stage";
      verdict = "Traction or margin trade-offs need sharper focus before committing heavy fixed overhead.";
    }

    return {
      runway: finalRunway,
      traction: finalTraction,
      margin: finalMargin,
      ops: finalOps,
      readinessScore,
      tier,
      verdict,
    };
  }, [choices, selectedModel, selectedPricing]);

  const completedCount = Object.keys(choices).length;
  const isGameComplete = completedCount === DECISION_STAGES.length;

  const handleSelectOption = (stage: DecisionStage, option: DecisionOption) => {
    const nextChoices = { ...choices, [stage.id]: option };
    setChoices(nextChoices);
    if (currentStageIdx < DECISION_STAGES.length - 1) {
      setCurrentStageIdx((idx) => idx + 1);
    }
  };

  const resetGame = () => {
    setChoices({});
    setCurrentStageIdx(0);
    setCopiedSummary(false);
  };

  const buildReadinessSummaryText = () => {
    const entity = startupTitle.trim() || "Untitled Campus Venture";
    const chosenLines = DECISION_STAGES.map((stage) => {
      const picked = choices[stage.id];
      return picked ? `- ${stage.title}: ${picked.label} (${picked.tag})` : "";
    })
      .filter(Boolean)
      .join("\n");

    return [
      `BIMTECH E-CELL // FOUNDER READINESS SCORECARD`,
      `Venture: ${entity} (${selectedSector})`,
      `Readiness Score: ${gameMetrics.readinessScore}/100 — Tier: ${gameMetrics.tier}`,
      `Runway: ${gameMetrics.runway} mos | Market Traction: ${gameMetrics.traction}% | Unit Margin: ${gameMetrics.margin}% | Ops Resilience: ${gameMetrics.ops}%`,
      ``,
      `Key Decisions:`,
      chosenLines,
      ``,
      `Verdict: ${gameMetrics.verdict}`,
    ].join("\n");
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildReadinessSummaryText());
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      alert("Could not copy to clipboard.");
    }
  };

  const handleExportScorecardPdf = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to download your Founder Readiness Summary.");
      return;
    }

    const entity = startupTitle.trim() || "Campus Venture";
    const rowsHtml = DECISION_STAGES.map((stage) => {
      const picked = choices[stage.id];
      if (!picked) return "";
      return `
        <div class="step-container">
          <h4 class="step-header">${stage.stepLabel} — ${stage.title}</h4>
          <p style="margin:0 0 4px 0; font-size:12px; font-weight:700; color:#0f172a;">${picked.label} (${picked.tag})</p>
          <p style="margin:0; font-size:11px; color:#334155;">${picked.takeaway}</p>
        </div>
      `;
    }).join("");

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Founder Readiness Summary - ${entity}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #0d0e12; padding: 2.5rem; line-height: 1.5; }
            .header-container { border-bottom: 3px solid #0f172a; padding-bottom: 1.25rem; margin-bottom: 1.75rem; display: flex; justify-content: space-between; align-items: flex-end; }
            .branding-title { font-size: 1.45rem; font-weight: 900; text-transform: uppercase; margin: 0; }
            .section-header { font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.15em; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.35rem; margin: 1.5rem 0 0.75rem 0; }
            .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; font-family: monospace; font-size: 11px; border: 1px solid #cbd5e1; padding: 1rem; background: #f8fafc; text-align: center; }
            .assessment-box { font-size: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1rem; border-radius: 0.5rem; margin: 0; }
            .step-container { border: 1px solid #e2e8f0; padding: 0.9rem 1rem; background: #f8fafc; margin-bottom: 0.65rem; border-radius: 0.4rem; }
            .step-header { margin: 0 0 0.25rem 0; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #1d4ed8; font-family: monospace; }
            .report-footer { margin-top: 2.5rem; border-top: 1px solid #e2e8f0; padding-top: 1rem; text-align: center; font-family: monospace; font-size: 9px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <h1 class="branding-title">BIMTECH E-CELL // FOUNDER READINESS SUMMARY</h1>
              <div style="font-size:12px; color:#475569; margin-top:4px;">Venture: <strong>${entity}</strong> · Sector: <strong>${selectedSector}</strong></div>
            </div>
            <div style="text-align: right; font-family: monospace; font-size: 12px;">
              <div>Score: <strong>${gameMetrics.readinessScore}/100</strong></div>
              <div>Tier: <strong>${gameMetrics.tier}</strong></div>
            </div>
          </div>

          <div class="section-header">01 // Simulation Telemetry</div>
          <div class="metrics-grid">
            <div>Cash Runway<br/><strong style="font-size:15px;">${gameMetrics.runway} mos</strong></div>
            <div>Market Traction<br/><strong style="font-size:15px;">${gameMetrics.traction}%</strong></div>
            <div>Unit Margin<br/><strong style="font-size:15px;">${gameMetrics.margin}%</strong></div>
            <div>Ops Resilience<br/><strong style="font-size:15px;">${gameMetrics.ops}%</strong></div>
          </div>

          <div class="section-header">02 // Executive Verdict</div>
          <p class="assessment-box">${gameMetrics.verdict}</p>

          <div class="section-header">03 // Decision Path & Trade-Offs</div>
          ${rowsHtml}

          <div class="report-footer">BIMTECH ENTREPRENEURSHIP CELL // CAMPUS VENTURE SANDBOX</div>
          <script>
            window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
          payload: { startupTitle, problemStatement, selectedSector, selectedModel, selectedPricing },
        }),
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
    } catch {
      alert("We couldn't reach the AI service. Please try again in a minute.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintIsolatedDocument = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to download your roadmap as a PDF.");
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
            ${dynamicPhases
              .map(
                (p) => `
              <div class="step-container">
                <h4 class="step-header">${p.t}</h4>
                <p style="margin:0; font-size:11.5px; color:#334155;">${p.d}</p>
              </div>
            `,
              )
              .join("")}
          </div>

          <div class="section-header">05 // Systemic Risk Audit & Safeguards</div>
          <div>
            ${dynamicHurdles
              .map(
                (h) => `
              <div class="risk-split-grid">
                <div>
                  <strong style="font-size:11px; color:#e11d48; display:block;">Threat: ${h.h}</strong>
                </div>
                <div style="border-left: 1px dashed #fda4af; padding-left: 1.5rem; color:#065f46; font-size:11px;">
                  <strong>Recommended Safeguard:</strong>
                  <p style="margin:4px 0 0 0;">${h.s}</p>
                </div>
              </div>
            `,
              )
              .join("")}
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
      {/* LEFT HALF: VENTURE PROFILE & MODE SWITCHER */}
      <form
        onSubmit={handleSimulateArchitecture}
        className="lg:col-span-5 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-white/10 space-y-5 bg-black/30"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent-300">
              Startup idea sandbox
            </label>
          </div>

          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/5 border border-white/10 font-mono text-[10px]">
            <button
              type="button"
              onClick={() => setMode("ai")}
              className={`py-2 px-3 rounded-lg font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === "ai" ? "bg-white text-black shadow" : "text-white/60 hover:text-white"
              }`}
            >
              <Sparkles size={12} />
              AI Quick Scan
            </button>
            <button
              type="button"
              onClick={() => setMode("game")}
              className={`py-2 px-3 rounded-lg font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === "game" ? "bg-amber-400 text-black shadow" : "text-white/60 hover:text-white"
              }`}
            >
              <Compass size={12} />
              Decision Game
            </button>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">
            {mode === "ai" ? "Describe your idea" : "Set your venture baseline"}
          </h3>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="sim-name" className="text-[10px] uppercase font-mono tracking-wider text-white/60">
              Startup name
            </label>
            <input
              id="sim-name"
              required={mode === "ai"}
              type="text"
              value={startupTitle}
              onChange={(e) => setStartupTitle(e.target.value)}
              placeholder="e.g., Nexis Core"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-nebula-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="sim-problem" className="text-[10px] uppercase font-mono tracking-wider text-white/60">
              What problem does it solve?
            </label>
            <textarea
              id="sim-problem"
              required={mode === "ai"}
              rows={3}
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="Who has this problem, and why do current options fall short?"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white placeholder-white/40 focus:outline-none focus:border-nebula-500 font-mono resize-none"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="sim-sector" className="text-[10px] uppercase font-mono tracking-wider text-white/60">
              Industry
            </label>
            <select
              id="sim-sector"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-nebula-500 font-mono"
            >
              <option disabled className="text-white/60 font-bold bg-black">
                -- Deep Tech Cluster --
              </option>
              <option value="Artificial Intelligence">Artificial Intelligence &amp; LLMOps</option>
              <option value="Autonomous Mobility">Autonomous Mobility &amp; Robotics</option>
              <option value="Cybersecurity Nodes">Cybersecurity &amp; Cryptographic Nets</option>
              <option disabled className="text-white/60 font-bold bg-black">
                -- Financial Infrastructures --
              </option>
              <option value="FinTech Nodes">FinTech, Neo-Banking &amp; DeFi</option>
              <option value="B2B SaaS Ecosystems">B2B SaaS Infrastructure Tools</option>
              <option value="Web3 & Tokenomics">Web3 Protocols &amp; Digital Identity</option>
              <option disabled className="text-white/60 font-bold bg-black">
                -- Climate Tech & Operations --
              </option>
              <option value="Sustainable Supply Chains">Sustainable Supply Chains &amp; Logistics</option>
              <option value="CleanTech & Renewable Energy">CleanTech &amp; Renewable Energy Core</option>
              <option value="AgriTech Ecosystems">AgriTech &amp; Controlled Environment Farming</option>
              <option disabled className="text-white/60 font-bold bg-black">
                -- Consumer Enterprise --
              </option>
              <option value="Direct Consumer Retail">Direct-to-Consumer (D2C) Brands</option>
              <option value="HealthTech & Telemedicine">HealthTech &amp; Precision Medicine Platforms</option>
              <option value="EdTech Systems">EdTech &amp; Continuous Learning Sandbox</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="sim-model" className="text-[10px] uppercase font-mono tracking-wider text-white/60">
                Business model
              </label>
              <select
                id="sim-model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-nebula-500 font-mono"
              >
                <option value="SaaS Subscription">SaaS Subscription</option>
                <option value="B2B Enterprise Contracts">B2B Enterprise Contracts</option>
                <option value="Transactional Cut">Transactional Cut</option>
                <option value="Freemium Scale">Freemium Scale</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="sim-pricing" className="text-[10px] uppercase font-mono tracking-wider text-white/60">
                Pricing
              </label>
              <select
                id="sim-pricing"
                value={selectedPricing}
                onChange={(e) => setSelectedPricing(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-nebula-500 font-mono"
              >
                <option value="Premium Pricing">Premium Pricing</option>
                <option value="Value-Based Tiering">Value-Based Tiering</option>
                <option value="Cost-Plus Baseline">Cost-Plus Baseline</option>
                <option value="Dynamic Flow Mapping">Dynamic Flow Mapping</option>
              </select>
            </div>
          </div>
        </div>

        {mode === "ai" ? (
          <button
            type="submit"
            disabled={isLoading || !startupTitle || !problemStatement}
            className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 disabled:opacity-20 transition cursor-pointer"
          >
            <Sparkles size={14} className={isLoading ? "animate-spin text-nebula-500" : ""} />
            <span>{isLoading ? "Analysing your idea..." : "Get AI feedback"}</span>
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-amber-400/5 border border-amber-400/20 text-[11px] text-amber-100/80 font-mono leading-relaxed">
            Make 4 operating decisions on the right to see how your runway, market traction, and unit margins hold up.
          </div>
        )}
      </form>

      {/* RIGHT HALF: AI MONITOR OR INTERACTIVE DECISION GAME */}
      <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between bg-zinc-950/40 relative max-h-[650px] overflow-y-auto">
        {mode === "game" ? (
          <div className="space-y-5">
            {/* LIVE RUNWAY & TRACTION TELEMETRY BAR */}
            <div className="border border-white/10 bg-white/[0.02] p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white/60">
                <span>Live Venture Telemetry</span>
                <span>
                  Decisions: {completedCount}/{DECISION_STAGES.length}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                <div className="bg-black/50 p-2.5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between text-[9px] text-white/50 uppercase">
                    <span>Runway</span>
                    <Wallet size={11} className="text-amber-300" />
                  </div>
                  <div className={`text-base font-black mt-0.5 ${gameMetrics.runway <= 6 ? "text-red-400" : "text-white"}`}>
                    {gameMetrics.runway} mos
                  </div>
                </div>

                <div className="bg-black/50 p-2.5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between text-[9px] text-white/50 uppercase">
                    <span>Traction</span>
                    <Users size={11} className="text-emerald-400" />
                  </div>
                  <div className="text-base font-black text-emerald-300 mt-0.5">{gameMetrics.traction}%</div>
                </div>

                <div className="bg-black/50 p-2.5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between text-[9px] text-white/50 uppercase">
                    <span>Unit Margin</span>
                    <Activity size={11} className="text-sky-400" />
                  </div>
                  <div className="text-base font-black text-sky-300 mt-0.5">{gameMetrics.margin}%</div>
                </div>

                <div className="bg-black/50 p-2.5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between text-[9px] text-white/50 uppercase">
                    <span>Ops Health</span>
                    <ShieldCheck size={11} className="text-purple-400" />
                  </div>
                  <div className="text-base font-black text-purple-300 mt-0.5">{gameMetrics.ops}%</div>
                </div>
              </div>

              {/* Stage Stepper Pills */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {DECISION_STAGES.map((stage, idx) => {
                  const answered = Boolean(choices[stage.id]);
                  const active = !isGameComplete && idx === currentStageIdx;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setCurrentStageIdx(idx)}
                      className={`h-1.5 rounded-full transition cursor-pointer ${
                        active
                          ? "bg-amber-400"
                          : answered
                            ? "bg-emerald-400/80"
                            : "bg-white/10 hover:bg-white/25"
                      }`}
                      aria-label={`Go to stage ${idx + 1}`}
                    />
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isGameComplete ? (
                <motion.div
                  key={DECISION_STAGES[currentStageIdx].id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold">
                      {DECISION_STAGES[currentStageIdx].stepLabel}
                    </div>
                    <h4 className="text-base font-bold text-white">{DECISION_STAGES[currentStageIdx].title}</h4>
                    <p className="text-xs text-white/60 leading-relaxed">{DECISION_STAGES[currentStageIdx].prompt}</p>
                  </div>

                  <div className="space-y-2.5">
                    {DECISION_STAGES[currentStageIdx].options.map((option) => {
                      const isSelected = choices[DECISION_STAGES[currentStageIdx].id]?.id === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleSelectOption(DECISION_STAGES[currentStageIdx], option)}
                          className={`w-full text-left p-4 rounded-xl border transition cursor-pointer space-y-1.5 ${
                            isSelected
                              ? "bg-amber-400/10 border-amber-400/50"
                              : "bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-white text-xs flex items-center gap-1.5">
                              {option.label}
                              <ArrowRight size={12} className="text-white/40" />
                            </span>
                            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-amber-200/90">
                              {option.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/60 leading-relaxed">{option.detail}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2 font-mono text-[10px] text-white/50">
                    <button
                      type="button"
                      disabled={currentStageIdx === 0}
                      onClick={() => setCurrentStageIdx((i) => Math.max(0, i - 1))}
                      className="hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      ← Previous stage
                    </button>
                    <button type="button" onClick={resetGame} className="hover:text-white flex items-center gap-1 cursor-pointer">
                      <RotateCcw size={11} /> Reset choices
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* SHAREABLE FOUNDER READINESS SUMMARY CARD */
                <motion.div
                  key="readiness-summary"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-zinc-900/90 to-black p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300">
                          <Award size={13} /> Founder Readiness Summary
                        </div>
                        <h4 className="text-lg font-black text-white mt-1">
                          {startupTitle.trim() || "Campus Venture"} ·{" "}
                          <span className="text-amber-300">{gameMetrics.tier}</span>
                        </h4>
                        <p className="text-[11px] text-white/60 font-mono">{selectedSector}</p>
                      </div>
                      <div className="text-right font-mono shrink-0">
                        <div className="text-2xl font-black text-white">{gameMetrics.readinessScore}</div>
                        <div className="text-[9px] uppercase tracking-widest text-white/50">/ 100 Score</div>
                      </div>
                    </div>

                    <p className="text-xs text-white/80 leading-relaxed">{gameMetrics.verdict}</p>

                    <div className="space-y-2">
                      {DECISION_STAGES.map((stage) => {
                        const picked = choices[stage.id];
                        if (!picked) return null;
                        return (
                          <div
                            key={stage.id}
                            className="p-2.5 rounded-lg bg-black/50 border border-white/10 flex flex-col gap-0.5"
                          >
                            <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
                              <span className="text-amber-200 font-bold">{picked.label}</span>
                              <span className="text-white/40">{picked.tag}</span>
                            </div>
                            <p className="text-[11px] text-white/60">{picked.takeaway}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 font-mono text-[11px]">
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="px-3.5 py-2 bg-white text-black font-bold rounded-lg hover:bg-amber-100 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedSummary ? <Check size={12} /> : <Copy size={12} />}
                      {copiedSummary ? "Copied Summary" : "Copy Shareable Summary"}
                    </button>
                    <button
                      type="button"
                      onClick={handleExportScorecardPdf}
                      className="px-3.5 py-2 bg-white/10 border border-white/15 text-white font-bold rounded-lg hover:bg-white/15 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText size={12} /> Export Scorecard (PDF)
                    </button>
                    <button
                      type="button"
                      onClick={resetGame}
                      className="px-3.5 py-2 bg-white/5 border border-white/10 text-white/70 rounded-lg hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw size={12} /> Replay Scenario
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* EXISTING AI QUICK SCAN MONITOR */
          <AnimatePresence mode="wait">
            {!hasSimulated && !isLoading ? (
              <motion.div
                key="empty-prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 space-y-2 font-mono text-xs text-white/60 my-auto"
              >
                <Cpu size={24} className="mx-auto text-white/10 mb-2 animate-pulse" />
                <p>
                  Fill in your idea on the left and press Get AI feedback. You&rsquo;ll get scores, a three-step
                  roadmap and the biggest risks to watch.
                </p>
              </motion.div>
            ) : isLoading ? (
              <motion.div
                key="loading-prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 max-w-sm mx-auto w-full py-12 my-auto"
              >
                <div className="space-y-1 text-center font-mono">
                  <div className="text-[10px] uppercase tracking-widest text-nebula-500 font-bold animate-pulse">
                    Streaming Free Inference Node
                  </div>
                  <p className="text-xs text-white/60">
                    Llama 3 is crunching parameters and saving rows to your Sheet ledger...
                  </p>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                  <motion.div
                    initial={{ left: "-100%" }}
                    animate={{ left: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-nebula-500 to-transparent"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div key="results-prompt" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                {/* PERFORMANCE METRICS */}
                <div className="border border-white/5 bg-white/[0.01] p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-wider text-white/60">
                    <span className="flex items-center gap-1">
                      <Layers size={10} /> Data Ledger Confirmed
                    </span>
                    <span className="font-bold text-white">Llama 3 Balanced</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
                    <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                      <span className="text-[8px] text-white/60 uppercase block">Viability</span>
                      <span className={`text-base font-black ${isViolationBlock ? "text-red-500" : "text-nebula-400"}`}>
                        {viabilityIndex}%
                      </span>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                      <span className="text-[8px] text-white/60 uppercase block">Market Fit</span>
                      <span className="text-base font-black text-white">{marketFitIndex}%</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                      <span className="text-[8px] text-white/60 uppercase block">Complexity</span>
                      <span className="text-base font-black text-white">{complexityIndex}%</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                      <span className="text-[8px] text-white/60 uppercase block">Risk Index</span>
                      <span className="text-base font-black text-white">{riskIndex}%</span>
                    </div>
                  </div>
                </div>

                {/* FEEDBACK ASSESSMENT */}
                <div
                  className={`p-4 rounded-xl border flex gap-3 items-start ${
                    isViolationBlock
                      ? "bg-red-500/5 border-red-500/20 text-red-200"
                      : "bg-nebula-500/5 border-nebula-500/10 text-white/90"
                  }`}
                >
                  {isViolationBlock ? (
                    <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle size={16} className="text-nebula-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <div className="text-[9px] font-mono font-bold tracking-widest uppercase text-white/60">
                      {isViolationBlock ? "Compliance Filter Halt" : "Live AI Advisory Assessment"}
                    </div>
                    <p className="text-xs font-mono leading-relaxed select-none text-justify">{advisoryAssessment}</p>
                  </div>
                </div>

                {/* DYNAMIC EXECUTION ROADMAP FROM LLM */}
                {!isViolationBlock && (
                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <h4 className="text-[10px] font-mono tracking-widest text-white/60 uppercase flex items-center gap-1.5 pb-1">
                      <TrendingUp size={12} /> Strategic Execution Roadmap (Llama 3)
                    </h4>
                    <div className="space-y-2.5">
                      {dynamicPhases.map((step, idx) => (
                        <div
                          key={idx}
                          className="bg-white/[0.02] border border-white/5 p-3 rounded-xl space-y-1 hover:border-white/10 transition"
                        >
                          <span className="text-[9px] font-mono font-bold text-nebula-400 uppercase tracking-wide block">
                            {step.t}
                          </span>
                          <p className="text-[11px] text-white/60 font-sans leading-relaxed text-justify">{step.d}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 pt-2 font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setHasSimulated(false);
                      setStartupTitle("");
                      setProblemStatement("");
                    }}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={11} /> Clear Simulation
                  </button>
                  {!isViolationBlock && (
                    <button
                      type="button"
                      onClick={handlePrintIsolatedDocument}
                      className="px-3 py-1.5 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText size={11} /> Export Strategic Roadmap (PDF)
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}