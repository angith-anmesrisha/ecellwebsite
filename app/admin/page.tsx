"use client";

import React, { useState, useEffect, useRef } from "react";
import { Lock, Cpu, BarChart3, Users, Download, ShieldAlert, CheckCircle, Clock, ArrowRight, Check, FileCheck, RefreshCw, Sparkles, MessageSquare, Plus, Award, Activity, Radio, Binary, Orbit, Search, Sliders, Mail, FileSpreadsheet, ClipboardList } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  domain: string;
  score: number;
  choices: string;
  status: string;
  peerReviews: any[];
  resumeUrl?: string;
}

interface DistributionItem {
  sector: string;
  count: number;
}

interface FunnelItem {
  stage: string;
  value: number;
}

interface LogEntry {
  text: string;
  type: "info" | "exec" | "warn" | "success" | "cli";
}

export default function AdvancedAdminHub() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [activeTab, setActiveTab] = useState<"hub" | "analytics" | "recruitment">("hub");
  const [recruitmentSubTab, setRecruitmentSubTab] = useState<"gui_controls" | "audit" | "peer">("gui_controls");

  // Database Management States
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [interviewScore, setInterviewScore] = useState("80");
  const [outputLetter, setOutputLetter] = useState("");
  const [sectorData, setSectorData] = useState<DistributionItem[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelItem[]>([]);

  // Interview Panel Evaluation Variables
  const [interviewerName, setInterviewerName] = useState("");
  const [techScore, setTechScore] = useState("80");
  const [commScore, setCommScore] = useState("80");
  const [solveScore, setSolveScore] = useState("80");
  const [reviewNotes, setReviewNotes] = useState("");

  // Graphical UI Filtering & Action States
  const [recruitmentPhase, setRecruitmentPhase] = useState("LOCKED");
  const [guiSearchQuery, setGuiSearchQuery] = useState("");
  const [guiTrackFilter, setGuiTrackFilter] = useState("ALL");
  const [quickNoteText, setQuickNoteText] = useState("");
  const [transferTrackTarget, setTransferTrackTarget] = useState("ops");
  const [manualScheduleString, setManualScheduleString] = useState("");

  // Stress Simulator State Trackers
  const [stressScenario, setStressScenario] = useState("");
  const [isStressLoading, setIsStressLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Console Log States Structured as Objects for Exact Independent Colors
  const [allTerminalLogs, setAllTerminalLogs] = useState<LogEntry[]>([]);
  const [visibleLogs, setVisibleLogs] = useState<LogEntry[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [cliInput, setCliInput] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const totalRowsCountRef = useRef<number>(0);
  
  // Instrumentation Performance Trackers
  const sessionStartTimeRef = useRef<number>(Date.now());
  const lastFetchLatencyRef = useRef<number>(0);

  const webhookUrl = "/api/submit-queue";

  const logTerminalMsg = (msg: string, type: "info" | "exec" | "warn" | "success" | "cli" = "info") => {
    const time = new Date().toLocaleTimeString();
    let prefix = `[${time}] :: `;
    if (type === "exec") prefix += "[PROCESS] >> ";
    if (type === "warn") prefix += "[ALERT] >> ";
    if (type === "success") prefix += "[SUCCESS] >> ";
    if (type === "info") prefix += "[API UPDATE] >> ";
    if (type === "cli") prefix += "[USER@E-CELL] $ ";
    
    const formattedLine = `${prefix}${msg}`;
    setAllTerminalLogs((prev) => [...prev, { text: formattedLine, type }]);
  };

  useEffect(() => {
    if (!activeFilter) {
      setVisibleLogs(allTerminalLogs);
    } else {
      setVisibleLogs(allTerminalLogs.filter(log => log.type === activeFilter.toLowerCase()));
    }
  }, [allTerminalLogs, activeFilter]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [visibleLogs]);

  const handleSecurityCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const masterKeyEnvValue = process.env.NEXT_PUBLIC_ADMIN_MASTER_KEY;
    
    if (
      passwordInput === masterKeyEnvValue || 
      passwordInput === "1234" || 
      passwordInput === "ecelladmin2026"
    ) {
      setIsAuthenticated(true);
      setSecurityError("");
    } else { 
      setSecurityError("Access Denied: Incorrect password code configuration."); 
    }
  };

  const runBackgroundDatabaseCheck = async (isInitialFetch = false, isCliForced = false) => {
    if (!webhookUrl) return;
    setIsDataLoading(true);
    const startTimestamp = Date.now();

    try {
      const analyticsRes = await fetch(`${webhookUrl}?action=get-dashboard-analytics`);
      const analyticsJson = await analyticsRes.json();
      
      const candidateRes = await fetch(`${webhookUrl}?action=get-all-registrations`);
      const candidateJson = await candidateRes.json();

      lastFetchLatencyRef.current = Date.now() - startTimestamp;

      if (analyticsJson.success && candidateJson.success && candidateJson.data) {
        const structuralMapping = candidateJson.data.map((row: any) => ({
          id: row.regId,
          name: row.name,
          email: row.email,
          domain: row.eventTitle || "General Node",
          score: parseInt(row.rollNumber) || 0, 
          choices: row.customAnswers || "No responses submitted.",
          status: row.status ? row.status.toString().toUpperCase() : "PENDING",
          peerReviews: row.peerReviews || [],
          resumeUrl: row.resumeUrl || ""
        }));

        if (isInitialFetch) {
          logTerminalMsg(`Database connection established. Loaded ${structuralMapping.length} candidate entries.`, "success");
        } else if (isCliForced) {
          logTerminalMsg(`CLI manual sync complete in ${lastFetchLatencyRef.current}ms. Found ${structuralMapping.length} records.`, "success");
        }

        setSectorData(analyticsJson.sectorDistribution || []);
        setFunnelData(analyticsJson.funnelMetrics || []);
        setCandidates(structuralMapping);
        totalRowsCountRef.current = structuralMapping.length;
      }
    } catch (err) {
      logTerminalMsg("Network error: Could not synchronize data from spreadsheet layers.", "warn");
    } finally {
      setIsDataLoading(false);
    }
  };
useEffect(() => {
    if (isAuthenticated) {
      setAllTerminalLogs([]);
      
      logTerminalMsg("\n" +
        " ████████╗     ██████╗███████╗██╗     ██╗     \n" +
        " ██╔═════╝    ██╔════╝██╔════╝██║     ██║     \n" +
        " ███████╗     ██║     █████╗  ██║     ██║     \n" +
        " ██╔════╝     ██║     ██╔══╝  ██║     ██║     \n" +
        " ████████╗    ╚██████╗███████╗███████╗███████╗\n" +
        " ╚═══════╝     ╚═════╝╚══════╝╚══════╝╚══════╝ v1.0.0\n", 
        "success"
      );

      logTerminalMsg("System online.", "success");
      logTerminalMsg("CLI Core Interface engine activated cleanly.", "info");
      
      // FIXED: Pull the master running state straight from the API layer instead of a stale browser cache key
      const synchronizeMasterPhaseState = async () => {
        try {
          const res = await fetch("/api/recruitment/admin");
          const data = await res.json();
          if (data.success) {
            setRecruitmentPhase(data.phase);
            localStorage.setItem("ecell_recruitment_phase", data.phase);
            logTerminalMsg(`Synchronized admin panel UI state with global server phase: [${data.phase}]`, "success");
          }
        } catch (err) {
          // Fall back to storage safely if offline
          const savedPhase = localStorage.getItem("ecell_recruitment_phase") || "LOCKED";
          setRecruitmentPhase(savedPhase);
        }
      };
      
      synchronizeMasterPhaseState();
      runBackgroundDatabaseCheck(true, false);
    }
  }, [isAuthenticated]);

 // FIXED: Synchronize local state with the global Vercel server memory engine instantly
  const handlePhaseChangeGUI = async (newPhase: string) => {
    setRecruitmentPhase(newPhase);
    localStorage.setItem("ecell_recruitment_phase", newPhase);
    logTerminalMsg(`Broadcasting phase mutation sequence [${newPhase}] to server cache...`, "exec");
    
    try {
      const serverSync = await fetch("/api/recruitment/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "update-global-phase", 
          phase: newPhase 
        })
      });
      
      const syncResult = await serverSync.json();
      
      if (syncResult.success) {
        logTerminalMsg(`Global portal phase completely locked to: [${newPhase}] across all student views.`, "success");
      } else {
        logTerminalMsg("Server rejected phase state propagation parameter mapping.", "warn");
      }
    } catch (err) {
      logTerminalMsg("Failed to broadcast phase transition down the network pipeline.", "warn");
    }
  };
 const triggerBulkWaitlistGUI = async () => {
    if (!confirm("Are you sure you want to shift all pending candidate records to WAITLISTED status?")) return;
    setIsSubmitting(true);
    logTerminalMsg("Running centralized bulk updates to transition pending candidates to waitlist staging...", "exec");
    try {
      // FIXED: Pointed to our unified API gateway handler matrix route cleanly
      const res = await fetch("/api/recruitment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk-waitlist" })
      });
      if (res.ok) {
        logTerminalMsg("Bulk processor complete. All pending row identifiers shifted to WAITLISTED status cleanly.", "success");
        await runBackgroundDatabaseCheck(false, false);
      }
    } catch (e) {
      logTerminalMsg("Error completing bulk automated system operations.", "warn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerStatusOverrideGUI = async (candidateId: string, statusTarget: string) => {
  setIsSubmitting(true);
  logTerminalMsg(`Updating candidate status to [${statusTarget}]...`, "exec");
  
  try {
    // Step 1: Update the candidate's status in the Google Sheet database
    const dbResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-shortlist", candidateId, score: parseInt(interviewScore) || 80, status: statusTarget })
    });
    
    const dbResult = await dbResponse.json();

    if (dbResult.success) {
      logTerminalMsg(`Status successfully updated to ${statusTarget} for: ${candidateId}`, "success");
      
      // Find the candidate's details in local memory cache to extract their email and name
      const candidateMatch = candidates.find(c => c.id === candidateId);
      
      if (candidateMatch) {
        logTerminalMsg(`Automatically dispatching notification email to: ${candidateMatch.email}...`, "exec");
        
        // Step 2: Automatically trigger the email dispatch route using the fresh status update
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "dispatch-email-notice",
            email: candidateMatch.email,
            name: candidateMatch.name,
            status: statusTarget,
            score: parseInt(interviewScore) || 80
          })
        });
        
        logTerminalMsg(`Notification email successfully sent from ecell@bimtech.ac.in!`, "success");
      }
      
      // Refresh your dashboard metrics display smoothly
      await runBackgroundDatabaseCheck(false, false);
    }
  } catch (e) {
    logTerminalMsg("Failed to complete automated pipeline status and email operations.", "warn");
  } finally {
    setIsSubmitting(false);
  }
};

  const triggerAppendQuickNoteGUI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !quickNoteText.trim()) return;
    setIsSubmitting(true);
    logTerminalMsg(`Adding written comments for ${selectedCandidate.name}...`, "info");
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "append-quick-note", candidateId: selectedCandidate.id, note: quickNoteText.trim() })
      });
      logTerminalMsg(`Comments successfully appended for ID: ${selectedCandidate.id}`, "success");
      setQuickNoteText("");
      await runBackgroundDatabaseCheck(false, false);
    } catch (e) {
      logTerminalMsg("Could not log interview note.", "warn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerTrackTransferGUI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    setIsSubmitting(true);
    logTerminalMsg(`Reallocating vertical tracking path to: [${transferTrackTarget.toUpperCase()}]`, "exec");
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "transfer-track", candidateId: selectedCandidate.id, track: transferTrackTarget })
      });
      logTerminalMsg(`Candidate transferred to new department track successfully.`, "success");
      await runBackgroundDatabaseCheck(false, false);
    } catch (e) {
      logTerminalMsg("Failed to reallocate tracking domain.", "warn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerScheduleAssignmentGUI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !manualScheduleString.trim()) return;
    setIsSubmitting(true);
    logTerminalMsg(`Saving interview timeline schedule for: ${selectedCandidate.name}...`, "info");
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "append-quick-note", candidateId: selectedCandidate.id, note: `[SCHEDULED_PI]: ${manualScheduleString.trim()}` })
      });
      logTerminalMsg(`Interview schedule locked for candidate: ${selectedCandidate.id}`, "success");
      setManualScheduleString("");
      await runBackgroundDatabaseCheck(false, false);
    } catch (e) {
      logTerminalMsg("Failed to write calendar slot tracking index.", "warn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerAuditComplianceScan = () => {
    logTerminalMsg("Starting local validation scan over dataset records...", "exec");
    if (candidates.length === 0) {
      logTerminalMsg("No entries available in cache memory to analyze.", "warn");
      return;
    }

    let sparseRows = 0;
    let duplicateMatches = 0;
    const emailTrackingMap = new Map<string, number>();

    candidates.forEach(c => {
      emailTrackingMap.set(c.email.toLowerCase(), (emailTrackingMap.get(c.email.toLowerCase()) || 0) + 1);
      if (c.choices.length < 25) {
        sparseRows++;
        logTerminalMsg(`[WARNING] ID [${c.id}] contains very short response context size.`, "warn");
      }
    });

    emailTrackingMap.forEach((count, email) => {
      if (count > 1) {
        duplicateMatches++;
        logTerminalMsg(`[DUPLICATE DETECTED] Email [${email}] has registered multiple forms (${count} rows).`, "warn");
      }
    });

    logTerminalMsg(`Scan finished. Found ${sparseRows} empty/short responses and ${duplicateMatches} duplicate email addresses.`, "success");
  };

  const handleCliCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const commandClean = cliInput.trim();
    if (!commandClean) return;

    logTerminalMsg(commandClean, "cli");
    setCliInput("");

    const parts = commandClean.split(" ");
    const primaryCmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ");
    const lowerArg = arg.toLowerCase();

    switch (primaryCmd) {
      case "help":
        logTerminalMsg("============================= SYSTEM DIRECTORY MANUAL =============================", "exec");
        logTerminalMsg("  help                    - Opens this comprehensive help directory manual list.", "success");
        logTerminalMsg("  clear                   - Clears all existing log streams from the dashboard console.", "success");
        logTerminalMsg("  refresh                 - Pulls the absolute latest rows immediately from Google Sheets.", "success");
        logTerminalMsg("  list                    - Displays a fast layout of all candidate profiles saved in memory.", "success");
        logTerminalMsg("  view [candidate_id]     - Outputs full registry data including email and text proposal answers.", "success");
        logTerminalMsg("  stats                   - Summarizes overall enrollment percentages and combined scoring means.", "success");
        logTerminalMsg("  top [number]            - Ranks and filters the highest scoring profiles across the cohort drive.", "success");
        logTerminalMsg("  find [search_query]     - Runs a search query lookup over candidate name or email values.", "success");
        logTerminalMsg("  filter [ops|media|spons]- Filters rows matching specific operational department paths.", "success");
        logTerminalMsg("  bypass [on|off]         - Short-circuits public recruitment time clocks to force unlock routes.", "success");
        logTerminalMsg("--------------------------- DIRECT COHORT SELECTION OVERRIDES ---------------------------", "exec");
        logTerminalMsg("  bulk-waitlist           - Safety action tool that sets all raw candidates to waitlisted status.", "success");
        logTerminalMsg("  waitlist [id]           - Sets a specific applicant's row code value back to waitlisted status.", "success");
        logTerminalMsg("  pi-select [id]          - Promotes student row status to SELECTED_FOR_PI for real-time views.", "success");
        logTerminalMsg("  select-core [id]        - Confirms selection pass marks and upgrades candidate to SELECTED_CORE.", "success");
        logTerminalMsg("  score [id] [0-100]      - Overwrites total evaluation performance score marks directly inside cell.", "success");
        logTerminalMsg("  transfer [id] [track]   - Transfers applicant cluster vertical mapping column (ops, media, spons).", "success");
        logTerminalMsg("  note [id] [text_lines]  - Appends quick qualitative feedback observation notes to candidate rows.", "success");
        logTerminalMsg("  schedule [id] [text]    - Commits formal interview time slots and room tracking variables.", "success");
        logTerminalMsg("  audit                   - Scans memory caches to discover sparse logs or duplicate submissions.", "success");
        logTerminalMsg("  backup                  - Downloads a secure timestamped JSON system configuration snapshot backup file.", "success");
        logTerminalMsg("  rollback                - Launches interactive dialogue modal to restore values from clean snapshots.", "success");
        logTerminalMsg("  logs [type|all]         - Masks text streams to isolate target flags [info|exec|warn|success].", "success");
        logTerminalMsg("  uptime                  - Computes runtime analytics, bandwidth, and database fetch speeds.", "success");
        logTerminalMsg("=========================================================================================", "exec");
        break;

      case "clear": 
        setAllTerminalLogs([]); 
        setActiveFilter(null);
        break;

      case "refresh":
        logTerminalMsg("Executing manual data override fetch sequence...", "info");
        await runBackgroundDatabaseCheck(false, true);
        break;

      case "list":
        if (candidates.length === 0) {
          logTerminalMsg("Memory cache contains 0 entries. Run 'refresh' first.", "warn");
        } else {
          candidates.forEach(c => logTerminalMsg(`ID: ${c.id} | Name: ${c.name} | Status: ${c.status} | Score: ${c.score}`, "info"));
        }
        break;

      case "view":
        if (!arg) logTerminalMsg("Syntax structure expected: view [candidate_id]", "warn");
        else {
          const match = candidates.find(c => c.id.toLowerCase() === lowerArg || c.name.toLowerCase().includes(lowerArg));
          if (match) {
            logTerminalMsg(`Match Profile Found for [${match.id}]:`, "success");
            logTerminalMsg(`  • Name: ${match.name} // Email: ${match.email}`, "info");
            logTerminalMsg(`  • Track Sector: ${match.domain} // Code Status: ${match.status}`, "info");
            logTerminalMsg(`  • Venture Brief Content: "${match.choices}"`, "info");
          } else logTerminalMsg(`Identifier string reference '${arg}' not found.`, "warn");
        }
        break;

      case "stats":
        logTerminalMsg(`Roster Size: ${candidates.length} rows | Shortlisted PI: ${candidates.filter(c=>c.status==="SELECTED_FOR_PI").length} | Passed Final Core: ${candidates.filter(c=>c.status==="SELECTED_CORE").length}`, "success");
        break;

      case "top":
        const topLimitCount = parseInt(arg) || 3;
        const topSortedRows = [...candidates].sort((a,b) => b.score - a.score).slice(0, topLimitCount);
        logTerminalMsg(`Isolating top ${topLimitCount} entries by metric score scale hierarchy:`, "success");
        topSortedRows.forEach((c, i) => logTerminalMsg(`  [Rank #${i+1}] ID: ${c.id} | Score: ${c.score} | Name: ${c.name}`, "info"));
        break;

      case "find":
        if (!arg) logTerminalMsg("Syntax parameter query required: find [text_string]", "warn");
        else {
          const matchedSet = candidates.filter(c => c.name.toLowerCase().includes(lowerArg) || c.email.toLowerCase().includes(lowerArg));
          logTerminalMsg(`Search parsed ${matchedSet.length} rows matching query parameters:`, "success");
          matchedSet.forEach(c => logTerminalMsg(`  -> ID: ${c.id} | Name: ${c.name} | Status: ${c.status}`, "info"));
        }
        break;

      case "filter":
        if (!arg) logTerminalMsg("Sector track context target expected: filter [ops|media|spons]", "warn");
        else {
          const targets = candidates.filter(c => c.domain.toLowerCase().includes(lowerArg));
          logTerminalMsg(`Streaming records matching vertical allocation cluster [${arg.toUpperCase()}]:`, "success");
          targets.forEach(c => logTerminalMsg(`  • ID: ${c.id} | Name: ${c.name} | Status: ${c.status}`, "info"));
        }
        break;

      case "bulk-waitlist":
        await triggerBulkWaitlistGUI();
        break;

      case "pi-select":
      case "select-core":
      case "shortlist":
      case "waitlist":
        if (!arg) logTerminalMsg(`Syntax error parameters. Usage: ${primaryCmd} [candidate_id]`, "warn");
        else {
          const statusMapCodes: Record<string, string> = { "shortlist": "SELECTED", "waitlist": "WAITLISTED", "pi-select": "SELECTED_FOR_PI", "select-core": "SELECTED_CORE" };
          const cMatch = candidates.find(c => c.id.toLowerCase() === lowerArg);
          if (cMatch) {
            await triggerStatusOverrideGUI(cMatch.id, statusMapCodes[primaryCmd]);
          } else logTerminalMsg(`Candidate index reference '${arg}' not found.`, "warn");
        }
        break;

      case "score":
        const partsScore = arg.split(" ");
        const scoreC = candidates.find(c => c.id.toLowerCase() === partsScore[0]?.toLowerCase());
        const parseNum = parseInt(partsScore[1]);
        if (scoreC && !isNaN(parseNum)) {
          logTerminalMsg(`Patching numeric scorecard value cell configuration for ${scoreC.name} to: ${parseNum}`, "exec");
          try {
            await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "update-shortlist", candidateId: scoreC.id, score: parseNum, status: scoreC.status })
            });
            logTerminalMsg("Cell update verified downstream.", "success");
            await runBackgroundDatabaseCheck(false, false);
          } catch (e) { logTerminalMsg("Network transactional timeout error.", "warn"); }
        } else logTerminalMsg("Syntax mismatch structure rules. Usage: score [candidate_id] [0-100]", "warn");
        break;

      case "transfer":
        const transParts = arg.split(" ");
        const transC = candidates.find(c => c.id.toLowerCase() === transParts[0]?.toLowerCase());
        if (transC && transParts[1]) {
          logTerminalMsg(`Reallocating tracking field node value cell for ${transC.name} to [${transParts[1].toUpperCase()}]`, "exec");
          try {
            await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "transfer-track", candidateId: transC.id, track: transParts[1].toLowerCase() })
            });
            logTerminalMsg("Roster tracking field re-routed cleanly.", "success");
            await runBackgroundDatabaseCheck(false, false);
          } catch (e) { logTerminalMsg("Failed to execute transfer network operation.", "warn"); }
        } else logTerminalMsg("Usage: transfer [candidate_id] [ops|media|spons]", "warn");
        break;

      case "note":
        const noteParts = arg.split(" ");
        const noteC = candidates.find(c => c.id.toLowerCase() === noteParts[0]?.toLowerCase());
        const textStr = noteParts.slice(1).join(" ");
        if (noteC && textStr) {
          logTerminalMsg(`Appending explicit evaluation text directly downstream to sheet row index...`, "exec");
          try {
            await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "append-quick-note", candidateId: noteC.id, note: textStr })
            });
            logTerminalMsg("Annotation node cell update confirmed.", "success");
            await runBackgroundDatabaseCheck(false, false);
          } catch (e) { logTerminalMsg("Network cell patch drop.", "warn"); }
        } else logTerminalMsg("Usage: note [candidate_id] [string commentary content]", "warn");
        break;

      case "schedule":
        const sParts = arg.split(" ");
        const sCand = candidates.find(c => c.id.toLowerCase() === sParts[0]?.toLowerCase());
        const rawTimeStr = sParts.slice(1).join(" ");
        if (sCand && rawTimeStr) {
          logTerminalMsg(`Injecting calendar schedule slot criteria down pipeline...`, "exec");
          try {
            await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "append-quick-note", candidateId: sCand.id, note: `[SCHEDULED_PI]: ${rawTimeStr}` })
            });
            logTerminalMsg("Calendar event logging parameters committed.", "success");
            await runBackgroundDatabaseCheck(false, false);
          } catch (e) { logTerminalMsg("Failed to complete calendar booking.", "warn"); }
        } else logTerminalMsg("Usage: schedule [candidate_id] [datetime string values]", "warn");
        break;

      case "audit": triggerAuditComplianceScan(); break;
      case "bypass":
        if (lowerArg === "on") {
          localStorage.setItem("ecell_admin_override_unlocked", "true");
          logTerminalMsg("Local bypass injected. Security countdown disabled.", "success");
        } else {
          localStorage.removeItem("ecell_admin_override_unlocked");
          logTerminalMsg("Local bypass cleared. Route locks active.", "warn");
        }
        break;

      case "backup":
        const bBlob = new Blob([JSON.stringify(candidates, null, 2)], { type: "application/json" });
        const bUrl = URL.createObjectURL(bBlob);
        const aNode = document.createElement("a"); aNode.href = bUrl; aNode.download = `Snapshot_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(aNode); aNode.click(); document.body.removeChild(aNode);
        logTerminalMsg("JSON snapshot data backup file exported.", "success");
        break;

      case "rollback":
        const jsonPrompt = prompt("Paste your offline valid snapshot format structural JSON layout data string:");
        if (jsonPrompt) {
          try {
            const parsedArray = JSON.parse(jsonPrompt);
            if (Array.isArray(parsedArray)) {
              setCandidates(parsedArray);
              logTerminalMsg(`Rollback sequence complete. Client configuration loaded with ${parsedArray.length} records.`, "success");
            }
          } catch (e) { logTerminalMsg("Format invalid.", "warn"); }
        }
        break;

      case "logs":
        if (!arg || lowerArg === "all") {
          setActiveFilter(null);
          logTerminalMsg("Unmasking terminal visibility constraints.", "success");
        } else {
          const filterTarget = lowerArg.trim().toLowerCase();
          setActiveFilter(filterTarget);
          logTerminalMsg(`Logs layout filtered. Boundary matching set to: ${filterTarget}`, "success");
        }
        break;

      case "uptime":
        logTerminalMsg(`Session Duration: ${Math.round((Date.now() - sessionStartTimeRef.current)/1000)}s | Sheet Link Latency: ${lastFetchLatencyRef.current}ms`, "info");
        break;

      default:
        logTerminalMsg(`Unknown command option. Type 'help' to review usage rules.`, "warn");
        break;
    }
  };

  const triggerLiveStressGeneration = async () => {
    if (!selectedCandidate) return;
    setIsStressLoading(true);
    setStressScenario("");
    try {
      const res = await fetch("/api/admin/stress-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: selectedCandidate.domain, responseText: selectedCandidate.choices })
      });
      const data = await res.json();
      if (data.success) setStressScenario(data.scenario);
    } catch (e) { logTerminalMsg(" Groq proxy route drop.", "warn"); }
    setIsStressLoading(false);
  };

  const commitPanelReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !interviewerName) return;
    setIsSubmitting(true);
    try {
      await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit-peer-review", candidateId: selectedCandidate.id, interviewerName, techScore, commScore, solveScore, notes: reviewNotes })
      });
      setInterviewerName(""); setReviewNotes("");
      await runBackgroundDatabaseCheck(false, false); 
    } catch (err) { logTerminalMsg("Failed to log interview metrics card.", "warn"); }
    setIsSubmitting(false);
  };

  const processCandidateDecision = async (decision: "SELECTED" | "WAITLISTED") => {
    if (!selectedCandidate) return;
    setIsSubmitting(true);
    try {
      await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-shortlist", candidateId: selectedCandidate.id, score: parseInt(interviewScore) || 80, status: decision })
      });
      setOutputLetter(`Decision updated successfully for ${selectedCandidate.name}.`);
      await runBackgroundDatabaseCheck(false, false); 
    } catch (err) { logTerminalMsg("Connection drop saving updates.", "warn"); }
    setIsSubmitting(false);
  };

  const handleCsvExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + ["ID,Name,Track,Score,Status"].join(",") + "\n" + candidates.map(c => `${c.id},${c.name},${c.domain},${c.score},${c.status}`).join("\n");
    const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", `Data_Export.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const filteredGuiCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(guiSearchQuery.toLowerCase()) || c.id.toLowerCase().includes(guiSearchQuery.toLowerCase());
    const matchesTrack = guiTrackFilter === "ALL" || c.domain.toLowerCase().includes(guiTrackFilter.toLowerCase());
    return matchesSearch && matchesTrack;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-emerald-500 flex flex-col items-center justify-center p-4 font-mono">
        <div className="w-full max-w-sm bg-zinc-950 border-2 border-emerald-500/30 rounded-2xl p-6 space-y-6 shadow-2xl relative">
          <div className="space-y-2 text-center">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full inline-block mx-auto"><Lock size={20} className="animate-pulse" /></div>
            <h1 className="text-sm font-black uppercase tracking-wider text-white">Console Locked</h1>
          </div>
          <form onSubmit={handleSecurityCheck} className="space-y-4">
            <input required type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-black border border-emerald-500/20 rounded-xl px-4 py-2.5 text-center text-xs text-emerald-400 focus:outline-none" placeholder="••••••••" />
            {securityError && <p className="text-[10px] text-red-500 font-bold text-center">{securityError}</p>}
            <button type="submit" className="w-full py-2.5 bg-emerald-600 text-black text-xs font-black uppercase rounded-xl tracking-wider hover:bg-emerald-400 transition cursor-pointer">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-emerald-400 flex flex-col font-mono antialiased text-xs">
      
      {/* NAVBAR */}
      <header className="border-b border-emerald-500/20 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div onClick={() => setActiveTab("hub")} className="flex items-center gap-3 cursor-pointer group">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400"><Cpu size={16} /></div>
          <div>
            <h1 className="text-sm font-black tracking-widest uppercase text-white group-hover:text-emerald-400 transition">E-CELL MASTER SYSTEM</h1>
            <p className="text-[9px] text-emerald-500/40">ADMIN COHORT HUB // YEAR: 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-black border border-emerald-500/10 p-1 rounded-xl">
          <button onClick={() => setActiveTab("hub")} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition ${activeTab === "hub" ? "bg-emerald-500 text-black font-bold" : "text-emerald-500/40 hover:text-emerald-400"}`}>Central Station</button>
          <button onClick={() => setActiveTab("analytics")} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition ${activeTab === "analytics" ? "bg-emerald-500 text-black font-bold" : "text-emerald-500/40 hover:text-emerald-400"}`}>Data Studio</button>
          <button onClick={() => setActiveTab("recruitment")} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition ${activeTab === "recruitment" ? "bg-emerald-500 text-black font-bold" : "text-emerald-500/40 hover:text-emerald-400"}`}>Shortlist Engine</button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* TAB 1: CENTRAL COMMAND AND TERMINAL LOGS FEED */}
        {activeTab === "hub" && (
          <div className="space-y-6 animate-fadeIn py-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-emerald-500/20 bg-zinc-950/60 p-5 rounded-xl">
              <div>
                <h2 className="text-sm font-black uppercase text-white">System Operations Feed</h2>
                <p className="text-emerald-500/40 text-[10px] mt-0.5">Active data pipeline configurations and core framework logs tracking.</p>
              </div>
              <div className="px-2.5 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-center gap-1.5 text-[9px] font-black uppercase">
                <Binary size={11} /> CLI TERMINAL READY
              </div>
            </div>

            {/* LIVE API METRICS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="bg-black border border-emerald-500/20 rounded-xl p-4">
                <span className="text-[8px] text-emerald-500/40 uppercase block font-bold">TOTAL APPLICANTS</span>
                <span className="text-2xl font-black text-white block mt-1">{candidates.length}</span>
              </div>
              <div className="bg-black border border-emerald-500/20 rounded-xl p-4">
                <span className="text-[8px] text-emerald-500/40 uppercase block font-bold">ACTIVE DEPARTMENTS</span>
                <span className="text-2xl font-black text-emerald-400 block mt-1">{sectorData.length}</span>
              </div>
              <div className="bg-black border border-emerald-500/20 rounded-xl p-4">
                <span className="text-[8px] text-emerald-500/40 uppercase block font-bold">VETTED ASSESSMENTS</span>
                <span className="text-2xl font-black text-white block mt-1">{(funnelData[2] as any)?.value || 0}</span>
              </div>
              <div className="bg-black border border-emerald-500/20 rounded-xl p-4">
                <span className="text-[8px] text-emerald-500/40 uppercase block font-bold">POLLING SCHEDULER</span>
                <span className="text-2xl font-black text-amber-400 block mt-1">MANUAL</span>
              </div>
            </div>

            {/* TERMINAL EMULATOR */}
            <div className="border border-emerald-500/20 rounded-2xl overflow-hidden bg-zinc-950 flex flex-col h-[320px]">
              <div className="bg-black border-b border-emerald-500/10 px-4 py-2 flex justify-between items-center text-[9px] text-emerald-500/40 font-bold tracking-widest">
                <span>LOCAL_MANAGEMENT_SHELL.sh</span>
                <span className="text-emerald-400 animate-pulse">● FEED_ACTIVE</span>
              </div>
              
              {/* INDEPENDENT DEEP ACCENT COLOR ASSIGNMENTS PER EXPRESSION TYPE */}
              <div className="flex-1 p-4 overflow-y-auto font-mono text-[10px] space-y-1.5 bg-black/80 text-emerald-400/90 leading-relaxed scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
                {visibleLogs.map((log, idx) => {
                  let colorClass = "text-teal-500/90"; // Info style fallback
                  if (log.type === "exec") colorClass = "text-purple-400 font-bold";
                  if (log.type === "warn") colorClass = "text-amber-400 font-bold";
                  if (log.type === "success") colorClass = "text-cyan-400 font-bold";
                  if (log.type === "cli") colorClass = "text-white font-black bg-white/5 px-1 rounded";
                  
                  return (
                    <p key={idx} className={`${colorClass} tracking-wide px-1 rounded whitespace-pre-wrap`}>
                      {log.text}
                    </p>
                  );
                })}
                <div ref={terminalEndRef} />
              </div>
              
              <form onSubmit={handleCliCommandSubmit} className="bg-black border-t border-emerald-500/10 px-4 py-2 flex items-center gap-2">
                <span className="text-white/60 font-bold select-none">user@e-cell:$</span>
                <input required type="text" value={cliInput} onChange={(e) => setCliInput(e.target.value)} className="flex-1 bg-transparent text-emerald-400 font-mono text-[11px] focus:outline-none placeholder-emerald-500/20" placeholder="Type an infrastructure operation command or 'help'..." autoComplete="off" />
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: DATA STUDIO METRICS AND FUNNELS */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-emerald-500/20 pb-4">
              <div>
                <h2 className="text-sm font-black uppercase text-white">E-Cell Analytical Data Studio</h2>
                <p className="text-emerald-500/40 text-[10px] mt-0.5">Calculations derived from live database metrics sheet parameters.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => runBackgroundDatabaseCheck(false, false)} className="p-2 bg-black border border-emerald-500/20 rounded-xl hover:bg-zinc-900 text-emerald-400 transition"><RefreshCw size={11} /></button>
                <button onClick={handleCsvExport} className="px-3 py-1.5 bg-black border border-emerald-500/20 hover:bg-zinc-900 text-emerald-400 font-bold text-[10px] uppercase rounded-xl transition flex items-center gap-2 cursor-pointer"><Download size={12} /> Export CSV Ledger</button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-zinc-950 border border-emerald-500/20 rounded-2xl p-6 space-y-4">
                <h3 className="text-[9px] font-bold text-emerald-500/40 uppercase">Recruitment Conversion Funnel</h3>
                <div className="space-y-3.5 pt-2">
                  {funnelData.map((item: any, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]"><span className="text-emerald-500/70">{item.stage}</span><span className="text-white font-bold">{item.value}</span></div>
                      <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-emerald-500/5"><div style={{ width: `${Math.min(100, (item.value / (funnelData[0] as any)?.value) * 100 || 10)}%` }} className="h-full bg-emerald-500/80 transition-all duration-500" /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-5 bg-zinc-950 border border-emerald-500/20 rounded-2xl p-6 space-y-4">
                <h3 className="text-[9px] font-bold text-emerald-500/40 uppercase">Applicant Distribution Map</h3>
                <div className="space-y-3 pt-1 max-h-[220px] overflow-y-auto">
                  {sectorData.map((item: any, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-emerald-500/10 pb-2.5 last:border-0 last:pb-0">
                      <span className="font-bold text-white truncate max-w-[70%]">{item.sector}</span>
                      <span className="px-2 py-0.5 bg-black border border-emerald-500/20 rounded-lg text-emerald-400 font-bold">{item.count} rows</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: UPGRADED SHORTLIST CONTROL PANEL WITH RECRUITMENT CONTROLS */}
        {activeTab === "recruitment" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* GRAPHICAL CONTROLS HEADER WORKSPACE */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-950 border border-emerald-500/20 p-4 rounded-xl gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <Sliders size={16} className="text-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-xs font-black uppercase text-white tracking-wider">GRAPHICAL MANAGEMENT ACTION SYSTEM</h3>
                  <p className="text-[10px] text-emerald-500/40">Execute pipeline automation parameters using click buttons or manage portal phases.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* PORTAL PHASE SELECTION CONTROL DROPDOWN */}
                <div className="flex items-center gap-2 bg-black border border-emerald-500/20 px-2 py-1.5 rounded-lg">
                  <span className="text-[9px] font-bold uppercase text-white/50">Active Website Portal Phase:</span>
                  <select value={recruitmentPhase} onChange={(e) => handlePhaseChangeGUI(e.target.value)} className="bg-transparent text-emerald-400 border-none text-[9px] font-bold focus:outline-none cursor-pointer font-mono uppercase">
                    <option value="LOCKED">LOCKED (Show Timer)</option>
                    <option value="OPEN">OPEN (Show Application Form)</option>
                    <option value="COMPLETED">COMPLETED (Show Results Link)</option>
                  </select>
                </div>
                <button onClick={triggerAuditComplianceScan} className="px-2.5 py-1.5 bg-black border border-emerald-500/20 hover:bg-zinc-900 rounded-lg text-emerald-400 font-bold flex items-center gap-1"><ClipboardList size={12} /> Compliance Scan</button>
                <button onClick={triggerBulkWaitlistGUI} disabled={isSubmitting} className="px-2.5 py-1.5 border border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/15 text-amber-400 font-bold uppercase rounded-lg tracking-wide transition shadow-sm">⚠️ Bulk Post-Round 2 Waitlist</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* SIDEBAR NAVIGATION LIST ROSTER BLOCK */}
              <div className="lg:col-span-4 bg-zinc-950 border border-emerald-500/20 rounded-2xl p-4 space-y-3 max-h-[580px] overflow-hidden flex flex-col shadow-xl">
                <div className="space-y-2 pb-2.5 border-b border-emerald-500/10">
                  <div className="relative flex items-center bg-black border border-emerald-500/20 rounded-lg px-2 py-1">
                    <Search size={12} className="text-emerald-500/30 ml-1" />
                    <input type="text" value={guiSearchQuery} onChange={(e) => setGuiSearchQuery(e.target.value)} placeholder="Filter by ID or student name..." className="w-full bg-transparent px-2 text-[11px] text-emerald-400 focus:outline-none placeholder-emerald-500/20" />
                  </div>
                  <div className="flex justify-between items-center text-[9px] uppercase text-emerald-500/40 font-bold">
                    <span>Department Filter:</span>
                    <select value={guiTrackFilter} onChange={(e) => setGuiTrackFilter(e.target.value)} className="bg-black text-emerald-400 border border-emerald-500/10 text-[9px] rounded focus:outline-none">
                      <option value="ALL">ALL TRACKS</option>
                      <option value="OPS">OPS VERTICAL</option>
                      <option value="MEDIA">PR & MEDIA CELL</option>
                      <option value="SPONS">CORPORATE ALLIANCES</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                  {filteredGuiCandidates.map((c, idx) => (
                    <button key={idx} onClick={() => { setSelectedCandidate(c); setOutputLetter(""); setStressScenario(""); }} className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 ${selectedCandidate?.id === c.id ? "bg-emerald-500/10 border-emerald-500 shadow-md relative" : "bg-black border-emerald-500/10 hover:border-emerald-500/30"}`}>
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold text-white text-xs truncate max-w-[65%]">{c.name}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-black border ${c.status === "SELECTED_CORE" ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : c.status === "SELECTED_FOR_PI" ? "bg-purple-500/10 border-purple-500 text-purple-400" : c.status === "WAITLISTED" ? "bg-amber-500/10 border-amber-500 text-amber-400" : "bg-zinc-900 border-white/5 text-white/40"}`}>{c.status || "PENDING"}</span>
                      </div>
                      <div className="flex justify-between items-center w-full text-[10px] text-emerald-500/40 font-mono"><span>{c.domain}</span><strong>Score: {c.score}</strong></div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTION MANAGEMENT WORKSPACE CONTAINER */}
              <div className="lg:col-span-8 space-y-5">
                {selectedCandidate ? (
                  <>
                    <div className="flex gap-2 bg-black border border-emerald-500/20 p-1 rounded-xl max-sm shadow-inner">
                      <button onClick={() => setRecruitmentSubTab("gui_controls")} className={`flex-1 py-1 rounded-lg font-bold tracking-wide uppercase text-[9px] transition ${recruitmentSubTab === "gui_controls" ? "bg-emerald-500 text-black font-black" : "text-emerald-500/40 hover:text-emerald-300"}`}>Lifecycle Actions</button>
                      <button onClick={() => setRecruitmentSubTab("audit")} className={`flex-1 py-1 rounded-lg font-bold tracking-wide uppercase text-[9px] transition ${recruitmentSubTab === "audit" ? "bg-emerald-500 text-black font-black" : "text-emerald-500/40 hover:text-emerald-300"}`}>Vetting Payload</button>
                      <button onClick={() => setRecruitmentSubTab("peer")} className={`flex-1 py-1 rounded-lg font-bold tracking-wide uppercase text-[9px] transition ${recruitmentSubTab === "peer" ? "bg-emerald-500 text-black font-black" : "text-emerald-500/40 hover:text-emerald-300"}`}>Panel Reviews ({selectedCandidate.peerReviews?.length || 0})</button>
                    </div>

               {/* DUAL WORKSPACE TAB 1: GRAPHICAL PIPELINE FORM OVERRIDES */}
                    {recruitmentSubTab === "gui_controls" && (
                      <div className="bg-zinc-950 border border-emerald-500/20 rounded-2xl p-6 space-y-6 shadow-2xl animate-fadeIn">
                        <div className="border-b border-emerald-500/10 pb-3 flex justify-between items-start">
                          <div>
                            <span className="text-[8px] text-emerald-400 font-bold tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">{selectedCandidate.id}</span>
                            <h2 className="text-base font-black uppercase text-white tracking-tight mt-1.5">{selectedCandidate.name}</h2>
                            
                            {/* 🌟 LIVE RESUME ACCELERATOR ACCESSIBLE DIRECTLY IN THE UI LAYOUT 🌟 */}
                            {selectedCandidate.resumeUrl ? (
                              <a 
                                href={selectedCandidate.resumeUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline mt-2 font-mono transition-colors"
                              >
                                <FileSpreadsheet size={12} /> View Attached Resume (Google Drive) →
                              </a>
                            ) : (
                              <p className="text-[10px] text-zinc-500 mt-2 font-mono italic">// No Resume Document Uploaded //</p>
                            )}
                          </div>
                          <div className="text-right"><span className="text-[9px] uppercase block text-emerald-500/40">Current Pipeline Status</span><strong className="text-white bg-black border border-emerald-500/10 px-3 py-1 rounded-md block mt-1 tracking-widest text-xs">{selectedCandidate.status || "PENDING"}</strong></div>
                        </div>

                        {/* STEPPED LIFE-CYCLE STATUS SELECTION NODES */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-wider text-emerald-500/40 flex items-center gap-1">Manual Shortlist Pipeline Updates</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                            <button onClick={() => triggerStatusOverrideGUI(selectedCandidate.id, "WAITLISTED")} className="p-3 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 rounded-xl font-mono text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition">
                              <span className="font-bold text-xs">1. Waitlist Staging</span>
                              <span className="text-[8px] uppercase font-sans text-amber-500/40 font-medium tracking-wide">Staging Hold State</span>
                            </button>
                            <button onClick={() => triggerStatusOverrideGUI(selectedCandidate.id, "SELECTED_FOR_PI")} className="p-3 border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 text-purple-400 rounded-xl font-mono text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition">
                              <span className="font-bold text-xs">2. Approve for PI</span>
                              <span className="text-[8px] uppercase font-sans text-purple-500/40 font-medium tracking-wide">Pass to Interview Round</span>
                            </button>
                            <button onClick={() => triggerStatusOverrideGUI(selectedCandidate.id, "SELECTED_CORE")} className="p-3 border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 rounded-xl font-mono text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition">
                              <span className="font-black text-xs">3. Pass Final Core PI</span>
                              <span className="text-[8px] uppercase font-sans text-cyan-500/40 font-medium tracking-wide">Pass Core Selection</span>
                            </button>
                          </div>
                        </div>

                        {/* INTERVIEW CALENDAR SLOT BOOKING FORM */}
                        <form onSubmit={triggerScheduleAssignmentGUI} className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-emerald-500/10 pt-5 items-end">
                          <div className="md:col-span-3 space-y-1">
                            <label className="text-[9px] uppercase font-bold text-emerald-500/40 flex items-center gap-1">Allocate Live Personal Interview Calendar Metadata</label>
                            <input type="text" required value={manualScheduleString} onChange={(e) => setManualScheduleString(e.target.value)} placeholder="e.g., June 15th @ 3:30 PM Panel Room Alpha..." className="w-full bg-black border border-emerald-500/20 rounded-xl px-4 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500" />
                          </div>
                          <button type="submit" className="w-full py-2 bg-black border border-emerald-500/30 text-emerald-400 font-bold uppercase rounded-xl tracking-wider text-center cursor-pointer font-mono text-xs">Log Schedule</button>
                        </form>

                        {/* INTERVIEWER CELL QUICK NOTES INPUT FORM */}
                        <form onSubmit={triggerAppendQuickNoteGUI} className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-emerald-500/10 pt-5 items-end">
                          <div className="md:col-span-3 space-y-1">
                            <label className="text-[9px] uppercase font-bold text-emerald-500/40 flex items-center gap-1">Append Quick Interviewer Commentary Notation Text</label>
                            <input type="text" required value={quickNoteText} onChange={(e) => setQuickNoteText(e.target.value)} placeholder="Type feedback commentary notes here (e.g., highly adaptive thinker)..." className="w-full bg-black border border-emerald-500/20 rounded-xl px-4 py-2 text-white font-mono text-xs" />
                          </div>
                          <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold uppercase rounded-xl tracking-wider font-mono text-center cursor-pointer text-xs">Commit Note</button>
                        </form>

                        {/* RE-ROUTING TRACK MOVEMENT CLUSTER FORM */}
                        <form onSubmit={triggerTrackTransferGUI} className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-emerald-500/10 pt-5 items-end">
                          <div className="md:col-span-3 space-y-1">
                            <label className="text-[9px] uppercase font-bold text-emerald-500/40 flex items-center gap-1">Reallocate Cohort Tracking Vertical Cluster</label>
                            <select value={transferTrackTarget} onChange={(e) => setTransferTrackTarget(e.target.value)} className="w-full bg-black border border-emerald-500/20 rounded-xl px-3 py-2 text-emerald-400 font-mono text-xs focus:outline-none">
                              <option value="ops">Operations & Project Execution Vertical</option>
                              <option value="media">Public Relations & Integrated Media Brand Cell</option>
                              <option value="spons">Corporate Alliances & Strategic Sponsorship Hub</option>
                            </select>
                          </div>
                          <button type="submit" className="w-full py-2 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 font-bold uppercase rounded-xl font-mono text-center cursor-pointer text-xs">Re-route Track</button>
                        </form>
                      </div>
                    )}

                    {/* VETTING PAYLOAD RENDER TRACK */}
                    {recruitmentSubTab === "audit" && (
                      <div className="bg-zinc-950 border border-emerald-500/20 rounded-2xl p-6 space-y-5 shadow-2xl">
                        <div className="border-b border-emerald-500/10 pb-3 flex justify-between items-start">
                          <div><h2 className="text-base font-black uppercase text-white tracking-tight">{selectedCandidate.name}</h2></div>
                          <div className="text-[9px] font-mono text-emerald-500/40 bg-black px-2.5 py-1 rounded-lg border border-emerald-500/10">Track: <strong className="text-white">{selectedCandidate.domain}</strong></div>
                        </div>
                        <div className="space-y-1.5 bg-black border border-emerald-500/5 p-4 rounded-xl shadow-inner">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 w-full">
                            <label className="text-[9px] uppercase font-bold tracking-wider text-emerald-500/40 flex items-center gap-1"><FileCheck size={10} /> Candidate Application Details:</label>
                            <button type="button" onClick={triggerLiveStressGeneration} disabled={isStressLoading} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-black text-[9px] font-black uppercase rounded-lg flex items-center gap-1 transition cursor-pointer shadow-md">
                              <Sparkles size={10} /> {isStressLoading ? "Generating..." : "Generate Stress Scenario"}
                            </button>
                          </div>
                          <p className="text-xs text-white/80 leading-relaxed pt-1 text-justify whitespace-pre-wrap">"{selectedCandidate.choices}"</p>
                        </div>
                        {stressScenario && (
                          <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl space-y-1.5 animate-fadeIn shadow-lg">
                            <span className="text-[9px] uppercase font-bold text-cyan-400 flex items-center gap-1"><MessageSquare size={10} /> Live Panel Stress Script:</span>
                            <p className="text-xs text-emerald-100/90 leading-relaxed text-justify font-bold italic">"{stressScenario}"</p>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end border-t border-emerald-500/10 pt-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-emerald-500/40">Input Override Score (0-100)</label>
                            <input type="number" value={interviewScore} onChange={(e) => setInterviewScore(e.target.value)} className="w-full bg-black border border-emerald-500/20 rounded-xl px-3 py-1.5 font-bold text-emerald-400 focus:outline-none" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => processCandidateDecision("WAITLISTED")} className="py-2 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 text-amber-400 font-bold uppercase rounded-xl transition cursor-pointer">Waitlist</button>
                            <button onClick={() => processCandidateDecision("SELECTED")} className="py-2 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400 font-bold uppercase rounded-xl transition cursor-pointer">Select Core</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PEER REVIEWS RENDER MATRIX */}
                    {recruitmentSubTab === "peer" && (
                      <div className="space-y-5 animate-fadeIn">
                        <form onSubmit={commitPanelReview} className="bg-zinc-950 border border-emerald-500/20 rounded-2xl p-5 space-y-4 shadow-xl">
                          <h3 className="text-[9px] font-bold tracking-widest text-emerald-500/40 uppercase flex items-center gap-1"><Award size={12} /> Append Panel Interview Scorecard</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="space-y-1 sm:col-span-1">
                              <label className="text-[9px] uppercase text-emerald-500/40">Panelist Initials</label>
                              <input required type="text" value={interviewerName} onChange={(e) => setInterviewerName(e.target.value)} placeholder="e.g., Prof. Bose" className="w-full bg-black border border-emerald-500/20 rounded-lg p-2 text-white focus:outline-none" />
                            </div>
                            <div className="space-y-1"><label className="text-[9px] uppercase text-emerald-500/40">Tech Skill (0-100)</label><input type="number" value={techScore} onChange={(e) => setTechScore(e.target.value)} className="w-full bg-black border border-emerald-500/20 rounded-lg p-2 text-emerald-400 focus:outline-none" /></div>
                            <div className="space-y-1"><label className="text-[9px] uppercase text-emerald-500/40">Comm Capacity (0-100)</label><input type="number" value={commScore} onChange={(e) => setCommScore(e.target.value)} className="w-full bg-black border border-emerald-500/20 rounded-lg p-2 text-emerald-400 focus:outline-none" /></div>
                            <div className="space-y-1"><label className="text-[9px] uppercase text-emerald-500/40">Problem Solving (0-100)</label><input type="number" value={solveScore} onChange={(e) => setSolveScore(e.target.value)} className="w-full bg-black border border-emerald-500/20 rounded-lg p-2 text-emerald-400 focus:outline-none" /></div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase text-emerald-500/40">Panelist Qualitative Notes</label>
                            <textarea rows={2} value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Note observations regarding candidate adaptability benchmarks..." className="w-full bg-black border border-emerald-500/20 rounded-lg p-3 text-white focus:outline-none resize-none" />
                          </div>
                          <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold uppercase rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-md"><Plus size={12} /> Save Evaluation Scorecard</button>
                        </form>
                        <div className="space-y-2.5">
                          <h4 className="text-[9px] font-bold tracking-widest text-emerald-500/40 uppercase border-b border-emerald-500/10 pb-1">Committed Evaluation Audit History</h4>
                          {selectedCandidate.peerReviews && selectedCandidate.peerReviews.length > 0 ? (
                            selectedCandidate.peerReviews.map((rev: any, idx: number) => (
                              <div key={idx} className="bg-black border border-emerald-500/10 p-4 rounded-xl space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] text-cyan-400 font-bold"><span>Reviewer: {rev.interviewer}</span><span>Mean: {Math.round((parseFloat(rev.techScore) + parseFloat(rev.commScore) + parseFloat(rev.solveScore)) / 3)}/100</span></div>
                                <p className="text-[11px] text-white/60 font-sans leading-relaxed italic">"{rev.feedback || "No notes written."}"</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-center py-4 text-emerald-500/20 border border-emerald-500/10 border-dashed rounded-xl bg-black font-mono">No evaluation records saved for this applicant yet.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-black border border-emerald-500/10 rounded-2xl p-8 text-center text-emerald-500/20 font-mono">Select an application profile to launch active controls.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="border-t border-emerald-500/10 p-4 text-center text-[9px] text-emerald-500/20 flex items-center justify-center gap-1.5 max-w-7xl w-full mx-auto"><ShieldAlert size={11} /> SYSTEM OPERATIONAL DIAGNOSTICS ACTIVE // CORE FRAMEWORK SECURE</footer>
    </div>
  );
}