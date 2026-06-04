import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, payload } = body;

    if (!type || !payload) {
      return NextResponse.json({ error: "Staging package fields missing parameters." }, { status: 400 });
    }

    const { startupTitle, problemStatement, selectedSector, selectedModel, selectedPricing } = payload;
    const problemTextClean = (problemStatement || "").trim().toLowerCase();
    const titleTextClean = (startupTitle || "").trim().toLowerCase();

    // 🔒 1. CORE COMPLIANCE & SAFETY FILTER
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

    // 📊 2. BACKGROUND DATA STAGING: SAVE TO GOOGLE SHEETS FIRST
    const targetUrl = process.env.SHEET_WEBHOOK_URL;
    if (!targetUrl) {
      return NextResponse.json({ error: "Sheets webhook token target not defined." }, { status: 500 });
    }

    // Fire-and-forget or await the Google Sheets log insertion 
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
      // We continue processing even if sheets fails so the user still gets their AI analysis
    }

    // ⚡ 3. LIVE INFERENCE ENGINE: CALL GROQ API FOR FREE LLM INTELLIGENCE
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
        model: "llama-3.1-8b-instant", // Fast, free-tier model optimized for layout json objects
        response_format: { type: "json_object" }, 
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: `You are an elite venture capitalist and incubation analyst at BIMTECH E-Cell.
            Analyze the user's venture parameters and return a strict JSON response.
            
            Provide deep, hyper-specific, non-generic business roadmap items tailored directly to their sector and problem statement.
            
            Return ONLY a raw JSON object with this exact structure (no markdown code blocks, backticks, or prose outside the object):
            {
              "viabilityScore": number (15 to 98),
              "marketFit": number (15 to 98),
              "executionComplexity": number (15 to 98),
              "riskIndex": number (15 to 98),
              "assessmentBrief": "A highly professional, cohesive paragraph assessing their commercial configuration margins.",
              "roadmapPhases": [
                { "t": "Phase 1: Validation & Architecture Setup", "d": "Deeply detailed, actionable operational steps matching this specific idea." },
                { "t": "Phase 2: Alpha Testing & Market Launch", "d": "Tailored go-to-market strategies matching their chosen pricing/monetization model." },
                { "t": "Phase 3: Scaling Economics & Market Moat", "d": "Specific scaling guidelines, unit economic focuses, and structural moats." }
              ],
              "hurdles": [
                { "h": "Specific Industry Vulnerability 1", "s": "Exact tactical counter-strategy recommendation." },
                { "h": "Specific Industry Vulnerability 2", "s": "Exact tactical counter-strategy recommendation." }
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

    // Parse the live output string from Llama 3 cleanly back into json tokens
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