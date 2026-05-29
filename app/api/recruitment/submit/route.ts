import { NextResponse } from "next/server";

const SERVER_ANSWER_KEY = [
  { pointsMap: [25, 10, 5] },
  { pointsMap: [25, 15, 5] },
  { pointsMap: [25, 10, 0] },
  { pointsMap: [25, 15, 5] }
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, dept, round1Choices } = body;

    if (!name || !email || !dept || !Array.isArray(round1Choices)) {
      return NextResponse.json({ error: "Malformed request payload parameters." }, { status: 400 });
    }

    let finalizedScore = 0;
    const readableChoices: string[] = [];

    SERVER_ANSWER_KEY.forEach((keyNode, index) => {
      const selectedIdx = round1Choices[index];
      if (selectedIdx !== undefined && selectedIdx >= 0 && selectedIdx < keyNode.pointsMap.length) {
        finalizedScore += keyNode.pointsMap[selectedIdx];
        readableChoices.push(`Q${index + 1}: Choice [${selectedIdx}]`);
      }
    });

    const targetUrl = process.env.SHEET_WEBHOOK_URL;
    if (!targetUrl) throw new Error("Google webhook destination variable is blank.");

    const sheetHandshake = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "submit-quiz",
        id: "cand_" + Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        dept,
        score: finalizedScore,
        round1Choices: readableChoices
      })
    });

    const result = await sheetHandshake.json();
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Duplicate entry detected on server." }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      score: finalizedScore,
      passedRound1: finalizedScore >= 40
    });
  } catch (error) {
    return NextResponse.json({ error: "Server verification timeout node failure." }, { status: 500 });
  }
}