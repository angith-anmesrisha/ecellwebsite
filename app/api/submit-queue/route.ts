import { NextResponse } from "next/server";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const email = searchParams.get("email");

    if (!action) {
      return NextResponse.json({ error: "Missing action route parameter." }, { status: 400 });
    }

    const targetUrl = process.env.SHEET_WEBHOOK_URL;
    if (!targetUrl) {
      return NextResponse.json({ error: "Database backend key not configured." }, { status: 500 });
    }

    
    if (action === "check-student-result") {
      if (!email) {
        return NextResponse.json({ error: "Email query parameter missing." }, { status: 400 });
      }
      
      
      const res = await fetch(`${targetUrl}?action=get-all-registrations`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store"
      });
      const candidateJson = await res.json();
      
      if (candidateJson.success && candidateJson.data) {
        const match = candidateJson.data.find(
          (row: any) => row.email?.toLowerCase() === email.trim().toLowerCase()
        );
        
        if (match) {
          return NextResponse.json({
            success: true,
            name: match.name,
            status: match.status ? match.status.toString().toUpperCase() : "PENDING",
            score: parseInt(match.rollNumber) || 0
          });
        }
      }
      return NextResponse.json({ success: false, error: "Profile node credentials not found in registry." });
    }

    
    const res = await fetch(`${targetUrl}?action=${action}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store" 
    });

    if (!res.ok) throw new Error("Google Sheets network drop.");
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin API Read Error:", error);
    return NextResponse.json({ success: false, error: "Database link synchronization failure." }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetUrl = process.env.SHEET_WEBHOOK_URL;
    
    if (!targetUrl) {
      return NextResponse.json({ error: "Sheets webhook token target not defined." }, { status: 500 });
    }

    
    if (
      body.action === "update-shortlist" || 
      body.action === "submit-peer-review" ||
      body.action === "bulk-waitlist" ||
      body.action === "transfer-track" ||
      body.action === "append-quick-note"
    ) {
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Spreadsheet row write failure.");
      return NextResponse.json({ success: true, message: "Admin updates saved to spreadsheet cells." });
    }

    
    const { type, payload } = body;
    if (!type || !payload) {
      return NextResponse.json({ error: "Staging package fields missing parameters." }, { status: 400 });
    }

    const { startupTitle, problemStatement, selectedSector, selectedModel, selectedPricing } = payload;
    const problemTextClean = (problemStatement || "").trim().toLowerCase();
    const titleTextClean = (startupTitle || "").trim().toLowerCase();

    
    const complianceBlockTerms = ["scam", "exploit", "illegal", "hack", "bypass", "fraud", "slavery", "slave"];
    const hasComplianceViolation = complianceBlockTerms.some(
      term => problemTextClean.includes(term) || titleTextClean.includes(term)
    );

    if (hasComplianceViolation) {
      return NextResponse.json({ 
        success: false, 
        isViolation: true,
        error: "CRITICAL COMPLIANCE REFUSAL: This concept triggers automatic regulatory filters. The E-Cell algorithmic sandbox completely blocks architectures promoting illegal frameworks, human rights violations, or unethical business models." 
      }, { status: 403 });
    }

    
    try {
      await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "stage-submission",
          type,
          payload
        })
      });
    } catch (sheetError) {
      console.error("Sheets Ledger Sync Warning:", sheetError);
    }

    
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq API system token configuration missing." }, { status: 500 });
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", 
        response_format: { type: "json_object" }, 
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: `You are an elite, brutally honest Venture Capitalist and Head of Incubation at BIMTECH E-Cell. Your job is to critically dissect user venture profiles, expose structural flaws, and provide highly tailored, non-generic operational frameworks.

CRITICAL INSTRUCTION: You must avoid boilerplate advice (e.g., "do marketing", "build an MVP"). Every phrase must be hyper-specific to the sector, problem statement, monetization framework, and pricing strategy provided.

Return ONLY a raw JSON object with this exact structure:
{
  "investorInternalAnalysis": "A deep, 3-4 sentence critical breakdown of the venture. Analyze the hidden unit economic flaws, the specific operational friction of their chosen monetization model, and the defensibility/moat challenges inherent to this exact sector. This must be filled first.",
  "viabilityScore": number (15 to 98 based on capital efficiency and market entry barriers),
  "marketFit": number (15 to 98 based on problem urgency and pricing alignment),
  "executionComplexity": number (15 to 98 based on operational and regulatory hurdles),
  "riskIndex": number (15 to 98 based on market competition and churn risk),
  "assessmentBrief": "A highly professional, macro-level synthesis of their commercial configuration, specifically evaluating if their pricing strategy matches their monetization framework's customer acquisition cost (CAC). Do not repeat user inputs.",
  "roadmapPhases": [
    { "t": "Phase 1: Validation & Architecture Setup", "d": "Exclusively actionable, sector-specific validation steps. Name actual technical stacks, distinct user discovery strategies, or niche beachhead markets relevant to this exact problem." },
    { "t": "Phase 2: Alpha Testing & Market Launch", "d": "A highly tailored go-to-market strategy that directly leverages their chosen pricing/monetization model to lower friction." },
    { "t": "Phase 3: Scaling Economics & Market Moat", "d": "Specific structural moats (e.g., data network effects, high switching costs) and unit economic targets (LTV/CAC ratios) tailored to this domain." }
  ],
  "hurdles": [
    { "h": "Niche Industry Vulnerability 1 (e.g., specific regulatory, platform dependency, or churn risks)", "s": "Exact tactical counter-strategy recommendation." },
    { "h": "Niche Industry Vulnerability 2", "s": "Exact tactical counter-strategy recommendation." }
  ]
}
            }`
          },
          {
            role: "user",
            content: `Venture Profile to Evaluate:
            - Brand Name: ${startupTitle}
            - Domain Cluster: ${selectedSector}
            - Problem Statement: ${problemStatement}
            - Monetization Framework: ${selectedModel}
            - Pricing Strategy: ${selectedPricing}`
          }
        ]
      })
    });

    const groqData = await groqResponse.json();
    if (!groqResponse.ok) {
      return NextResponse.json({ success: false, error: groqData.error?.message || "Groq Inference Failure" }, { status: groqResponse.status });
    }

    const rawContent = groqData.choices[0].message.content.trim();
    const aiAnalysis = JSON.parse(rawContent);

    return NextResponse.json({ 
      success: true, 
      aiAnalysis 
    });

  } catch (error) {
    console.error("Submit Queue Internal Error:", error);
    return NextResponse.json({ error: "Handshake channel error on simulation middleware pipelines." }, { status: 500 });
  }
}