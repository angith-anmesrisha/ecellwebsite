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
    const targetUrl = process.env.SHEET_WEBHOOK_URL;
    if (!targetUrl) throw new Error("Google webhook destination variable is blank.");

    // ==========================================================
    // ACTION 1: PRE-QUIZ SECURITY ELIGIBILITY CHECK
    // ==========================================================
    if (body.action === "check-initial-eligibility") {
      const { email } = body;
      if (!email) return NextResponse.json({ error: "Missing identity parameter fields." }, { status: 400 });

      const sheetFetch = await fetch(`${targetUrl}?action=get-all-registrations`);
      const sheetData = await sheetFetch.json();

      if (sheetData.success && Array.isArray(sheetData.data)) {
        const foundUser = sheetData.data.find((row: any) => row.email.toLowerCase() === email.toLowerCase());

        if (foundUser) {
          const historicalScore = parseInt(foundUser.rollNumber) || 0;
          const hasCompletedRound2 = foundUser.customAnswers && 
                                     foundUser.customAnswers.trim() !== "" && 
                                     foundUser.customAnswers !== "No payload logged.";

          // Condition A: If they failed Round 1 previously, hard lock them
          if (historicalScore < 40) {
            return NextResponse.json({ 
              error: "This email address has already completed an assessment attempt. Multiple retries are strictly restricted." 
            }, { status: 403 });
          }

          // 🌟 NEW SAFETY CHECK: If they passed Round 1 BUT already submitted Round 2 case study
          if (historicalScore >= 40 && hasCompletedRound2) {
            return NextResponse.json({
              error: "You have already completed and locked your Round 2 Case Simulation submission. Multiple attempts are not permitted."
            }, { status: 403 });
          }

          // Condition C: Passed Round 1 but Round 2 is empty -> Safe to restore session mid-quiz
          if (historicalScore >= 40 && !hasCompletedRound2) {
            return NextResponse.json({
              success: true,
              isExistingSession: true,
              candidate: foundUser,
              progress: { score: historicalScore, passed: true }
            });
          }
        }
      }

      return NextResponse.json({ success: true, isExistingSession: false });
    }

    // ==========================================================
    // ACTION 2: STANDARD ROUND 1 SCORE CALCULATION & RESUME SUBMISSION
    // ==========================================================
    // Destructure resume parameters from incoming payload data stream
    const { name, email, dept, round1Choices, resumeFileBase64, resumeFileName } = body;

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
        round1Choices: readableChoices,
        resumeFileBase64, // Forward base64 binary string downstream
        resumeFileName    // Forward file matching text extension tags
      })
    });

    const result = await sheetHandshake.json();
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Duplicate entry detected on server database." }, { status: 403 });
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