import { NextResponse } from "next/server";
const STRATEGIC_MARKET_KEYWORDS = [
  { words: ["void", "voids", "gap", "friction", "inefficiency"], weight: 15 },
  { words: ["marketing", "b2b", "acquisition", "conversion", "branding"], weight: 15 },
  { words: ["tech", "infrastructure", "saas", "automation", "ops"], weight: 15 },
  { words: ["consulting", "enterprise", "strategy", "scale"], weight: 10 }
];
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brandName, problemStatement, domainSector, monetizationEngine, pricingMatrix } = body;
    if (!brandName || !problemStatement) {
      return NextResponse.json({ error: "Startup parameters incomplete." }, { status: 400 });
    }
    let baseViabilityScore = 45;
    const cleanText = problemStatement.toLowerCase();
    STRATEGIC_MARKET_KEYWORDS.forEach((cluster) => {
      const matched = cluster.words.some(term => cleanText.includes(term));
      if (matched) baseViabilityScore += cluster.weight;
    });
    if (pricingMatrix?.toLowerCase().includes("premium")) baseViabilityScore += 10;
    if (baseViabilityScore > 98) baseViabilityScore = 98;
    const sectorAlerts: Record<string, string> = {
      "B2B SaaS Infrastructure Tools": "Market scalability potential is exceptionally high. Your focus should prioritize insulating initial enterprise contract nodes against churn overhead risks.",
      "default": "Solid unit economics roadmap framework configuration. Validate early customer acquisition costs before aggressively scaling outbound growth engines."
    };
    const sectorReport = sectorAlerts[domainSector] || sectorAlerts["default"];
    return NextResponse.json({
      success: true,
      score: baseViabilityScore,
      brandName: brandName.toUpperCase(),
      assessmentReport: `VENTURE METRIC REPORT FOR ${brandName.toUpperCase()}:\n\n• Analysis: A viable value proposition targeting clear enterprise bottlenecks. ${sectorReport}\n\n• Recommended Execution Path: Launch focused validation pilots matching your ${monetizationEngine} layout while deploying your ${pricingMatrix} matrix model.`
    });
  } catch (error) {
    return NextResponse.json({ error: "Venture sandbox simulation computation engine crash." }, { status: 500 });
  }
}