import { NextResponse } from "next/server";

const SERVER_ANSWER_KEY = [
  { pointsMap: [25, 10, 5] },
  { pointsMap: [25, 15, 5] },
  { pointsMap: [25, 10, 0] },
  { pointsMap: [25, 15, 5] },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const email = searchParams.get("email");
    const targetUrl = process.env.SHEET_WEBHOOK_URL;

    if (!targetUrl) throw new Error("Google webhook destination variable is blank.");

    if (action === "get-all-registrations") {
      const sheetFetch = await fetch(`${targetUrl}?action=get-all-registrations`, {
        method: "GET",
        next: { revalidate: 0 },
      });
      const sheetData = await sheetFetch.json();
      return NextResponse.json(sheetData);
    }

    if (action === "check-student-result" && email) {
      const sheetFetch = await fetch(`${targetUrl}?action=get-all-registrations`, {
        method: "GET",
        next: { revalidate: 0 },
      });
      const sheetData = await sheetFetch.json();

      if (sheetData.success && Array.isArray(sheetData.data)) {
        const studentMatch = sheetData.data.find(
          (row: any) => row && row.email && row.email.toLowerCase() === email.trim().toLowerCase()
        );

        if (studentMatch) {
          return NextResponse.json({
            success: true,
            name: studentMatch.name,
            status: "PENDING",
            score: parseInt(studentMatch.rollNumber) || 0,
            choices: studentMatch.customAnswers || "",
          });
        }
      }

      return NextResponse.json({
        success: true,
        name: "Candidate",
        status: "PENDING",
        score: 0,
        choices: "Profile Initialized Staging Stored",
      });
    }

    return NextResponse.json(
      { error: "Invalid routing request parameter configuration." },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.toString() },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetUrl = process.env.SHEET_WEBHOOK_URL;

    if (!targetUrl) throw new Error("Google webhook destination variable is blank.");

    if (body.action === "check-initial-eligibility") {
      const { email } = body;
      if (!email) return NextResponse.json({ error: "Missing identity parameters." }, { status: 400 });

      const sheetFetch = await fetch(`${targetUrl}?action=get-all-registrations`, {
        method: "GET",
        next: { revalidate: 0 },
      });
      const sheetData = await sheetFetch.json();

      if (sheetData.success && Array.isArray(sheetData.data)) {
        const foundUser = sheetData.data.find(
          (row: any) => row && row.email && row.email.toLowerCase() === email.toLowerCase()
        );

        if (foundUser) {
          const historicalScore = parseInt(foundUser.rollNumber) || 0;
          const hasCompletedRound2 = foundUser.customAnswers && foundUser.customAnswers.trim() !== "" && foundUser.customAnswers !== "No payload logged.";

          if (historicalScore < 40) {
            return NextResponse.json({ error: "Attempt restrictions active." }, { status: 403 });
          }
          if (historicalScore >= 40 && hasCompletedRound2) {
            return NextResponse.json({ error: "Submission already sealed." }, { status: 403 });
          }
          if (historicalScore >= 40 && !hasCompletedRound2) {
            return NextResponse.json({
              success: true,
              isExistingSession: true,
              candidate: {
                id: foundUser.regId,
                name: foundUser.name,
                email: foundUser.email,
                dept: foundUser.eventTitle || "OPS VERTICAL",
                status: "PENDING",
              },
              progress: { score: historicalScore, passed: true },
            });
          }
        }
      }
      return NextResponse.json({ success: true, isExistingSession: false });
    }

    if (body.action === "register-new-profile") {
      const { id, name, email, dept, resumeFileBase64, resumeFileName } = body;
      const normalizedDept = dept === "ops" ? "OPS VERTICAL" : dept === "media" ? "PR & MEDIA CELL" : "CORPORATE ALLIANCES";
      
      const sheetRes = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit-quiz",
          id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          dept: normalizedDept,
          score: 0,
          round1Choices: ["Profile Initialized Staging Stored"],
          resumeFileBase64: resumeFileBase64 || "",
          resumeFileName: resumeFileName || "Candidate_Resume.pdf"
        }),
      });
      await sheetRes.json();

      return NextResponse.json({ success: true, status: "PENDING" });
    }

    if (body.action === "update-case") {
      const { email, caseAnswer } = body;
      
      const sheetRes = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-case",
          email: email.trim().toLowerCase(),
          caseAnswer: caseAnswer.trim(),
        }),
      });
      await sheetRes.json();

      return NextResponse.json({ success: true });
    }

    const { name, email, dept, round1Choices, resumeFileBase64, resumeFileName } = body;
    const normalizedDept = dept === "ops" ? "OPS VERTICAL" : dept === "media" ? "PR & MEDIA CELL" : "CORPORATE ALLIANCES";
    let finalizedScore = 0;
    const readableChoices: string[] = [];

    if (Array.isArray(round1Choices)) {
      SERVER_ANSWER_KEY.forEach((keyNode, index) => {
        const selectedIdx = round1Choices[index];
        if (selectedIdx !== undefined && selectedIdx >= 0 && selectedIdx < keyNode.pointsMap.length) {
          finalizedScore += keyNode.pointsMap[selectedIdx];
          readableChoices.push(`Q${index + 1}: Choice [${selectedIdx}]`);
        }
      });
    }

    const sheetRes = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "submit-quiz",
        id: "cand_" + Math.random().toString(36).substring(2, 9),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        dept: normalizedDept,
        score: finalizedScore,
        round1Choices: readableChoices,
        resumeFileBase64: resumeFileBase64 || "",
        resumeFileName: resumeFileName || "Candidate_Resume.pdf"
      }),
    });
    await sheetRes.json();

    return NextResponse.json({
      success: true,
      score: finalizedScore,
      passedRound1: finalizedScore >= 40,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.toString() },
      { status: 500 }
    );
  }
}