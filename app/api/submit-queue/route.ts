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
        model: "openai/gpt-oss-20b", 
        response_format: { type: "json_object" }, 
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: `You are an elite, sharp-witted Venture Capitalist and Chief Incubation Officer at BIMTECH E-Cell. You do not give generic corporate fluff. You critically dissect early-stage business ideas based entirely on the specific operational mechanics of their problem statement.

CRITICAL COMPLIANCE RULES:
1. ZERO BOILERPLATE: You are strictly forbidden from using generic, catch-all business advice. Do not mention "social media listening," "create customer personas," "UGC marketing," "build a community," "setup email automation," or "implement data analytics" unless it is explicitly and uniquely tied to the technical execution of the problem.
2. VARIABLE BINDING: Every single insight inside "assessmentBrief", "roadmapPhases", and "hurdles" must directly reference and solve the specific real-world mechanics mentioned in the user's [CORE PROBLEM STATEMENT]. If the problem statement involves logistics, your roadmap must talk about supply chains. If it involves deep-tech, talk about compute/data pipelines. 
3. CONTEXTUAL REALISM: Match your terminology to the industry cluster. Do not use generic retail advice if the problem statement describes a specialized domain.

Return ONLY a raw JSON object matching this exact structure:
{
  "viabilityScore": number (15 to 98),
  "marketFit": number (15 to 98),
  "executionComplexity": number (15 to 98),
  "riskIndex": number (15 to 98),
  "assessmentBrief": "A highly critical, professional paragraph evaluating the commercial viability of solving this EXACT problem statement using the selected monetization framework and pricing strategy. You must name specific operational trade-offs.",
  "roadmapPhases": [
    { "t": "Phase 1: Validation & Architecture Setup", "d": "The precise operational steps required to validate the core assumption of the [CORE PROBLEM STATEMENT]. Specify the exact target beachhead user and the technical or operational metric they need to validate first." },
    { "t": "Phase 2: Alpha Testing & Market Launch", "d": "A highly specific go-to-market execution strategy engineered entirely around how the selected monetization model interacts with this specific problem statement." },
    { "t": "Phase 3: Scaling Economics & Market Moat", "d": "The exact structural moat (e.g., proprietary data loops, high switching costs) required to defend this specific solution from fast-followers." }
  ],
  "hurdles": [
    { "h": "Fatal Industry Flaw 1: A highly specific, non-obvious operational, regulatory, or market risk intrinsic to solving this exact problem statement.", "s": "A concrete, tactical defensive counter-measure." },
    { "h": "Fatal Industry Flaw 2: An adoption or execution friction risk specific to this exact problem domain.", "s": "A concrete, tactical defensive counter-measure." }
  ]
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