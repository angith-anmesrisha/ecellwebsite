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
        model: "openai/gpt-oss-120b", 
        response_format: { type: "json_object" }, 
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: `You are a sharp, elite Venture Capitalist and Head of Incubation at BIMTECH E-Cell. You analyze early-stage startups with clinical accuracy. 

CRITICAL INPUT VALIDATION RULE:
Before performing any analysis, evaluate if the provided [CORE PROBLEM STATEMENT] is a legitimate, coherent, and ethical commercial business concept. If the input is pure gibberish, a joke, structurally violent, empty, or completely lacks a viable commercial foundation, you must flag it immediately.

Return ONLY a raw JSON object with this exact structure:
{
  "isValidBusiness": boolean (true if it is a legitimate startup concept, false if it is gibberish, an invalid joke, or completely unviable),
  "viabilityScore": number (15 to 98. If isValidBusiness is false, set this to 15),
  "marketFit": number (15 to 98. If isValidBusiness is false, set this to 15),
  "executionComplexity": number (15 to 98),
  "riskIndex": number (15 to 98),
  "assessmentBrief": "If isValidBusiness is true, provide a dense commercial evaluation. If isValidBusiness is false, use this space to bluntly state exactly why this input is completely invalid, nonsensical, or commercially non-existent as a venture pitch.",
  "roadmapPhases": [
    { "t": "Phase 1: Validation & Architecture Setup", "d": "If isValidBusiness is false, put 'N/A - Invalid Input'. Otherwise, provide hyper-specific operational steps." },
    { "t": "Phase 2: Alpha Testing & Market Launch", "d": "If isValidBusiness is false, put 'N/A - Invalid Input'. Otherwise, provide tailored go-to-market strategies." },
    { "t": "Phase 3: Scaling Economics & Market Moat", "d": "If isValidBusiness is false, put 'N/A - Invalid Input'. Otherwise, provide specific scaling guidelines." }
  ],
  "hurdles": [
    { "h": "If isValidBusiness is false, put 'N/A'. Otherwise, list specific industry vulnerability 1", "s": "Tactical counter-strategy." },
    { "h": "If isValidBusiness is false, put 'N/A'. Otherwise, list specific industry vulnerability 2", "s": "Tactical counter-strategy." }
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

    // INTEGRATED VALIDATION LOGIC
    // If the LLM marks the concept as completely unviable, empty, or gibberish
    if (!aiAnalysis.isValidBusiness) {
      return NextResponse.json({
        success: false,
        isInvalidBusiness: true,
        error: `Invalid Venture Profile: ${aiAnalysis.assessmentBrief}`,
        aiAnalysis // Still passing the structure in case your UI needs the fallback parameters
      }, { status: 422 }); // 422 Unprocessable Entity perfectly suits semantic valuation failures
    }

    // Valid business pathway: render the dashboard
    return NextResponse.json({ 
      success: true, 
      aiAnalysis 
    });

  } catch (error) {
    console.error("Submit Queue Internal Error:", error);
    return NextResponse.json({ error: "Handshake channel error on simulation middleware pipelines." }, { status: 500 });
  }
}