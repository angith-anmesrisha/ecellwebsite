export const runtime = "edge";

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

    if (!targetUrl)
      throw new Error("Google webhook destination variable is blank.");

    if (action === "check-student-result" && email) {
      const sheetFetch = await fetch(
        `${targetUrl}?action=get-all-registrations`,
        {
          method: "GET",
          next: { revalidate: 0 },
        },
      );
      const sheetData = await sheetFetch.json();

      if (sheetData.success && Array.isArray(sheetData.data)) {
        const studentMatch = sheetData.data.find(
          (row: any) => row.email.toLowerCase() === email.trim().toLowerCase(),
        );

        if (studentMatch) {
          return NextResponse.json({
            success: true,
            name: studentMatch.name,
            status: studentMatch.status || "PENDING",
            score: parseInt(studentMatch.rollNumber) || 0,
            choices: studentMatch.customAnswers || "",
          });
        }
      }
      return NextResponse.json(
        {
          error:
            "No active registration profile found matching that email address.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Invalid routing request parameter configuration." },
      { status: 400 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Data Studio handshake connection exception node fault." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetUrl = process.env.SHEET_WEBHOOK_URL;
    if (!targetUrl)
      throw new Error("Google webhook destination variable is blank.");

    if (body.action === "check-initial-eligibility") {
      const { email } = body;
      if (!email)
        return NextResponse.json(
          { error: "Missing identity parameter fields." },
          { status: 400 },
        );

      const sheetFetch = await fetch(
        `${targetUrl}?action=get-all-registrations`,
        {
          method: "GET",
          next: { revalidate: 0 },
        },
      );
      const sheetData = await sheetFetch.json();

      if (sheetData.success && Array.isArray(sheetData.data)) {
        const foundUser = sheetData.data.find(
          (row: any) => row.email.toLowerCase() === email.toLowerCase(),
        );

        if (foundUser) {
          const historicalScore = parseInt(foundUser.rollNumber) || 0;
          const hasCompletedRound2 =
            foundUser.customAnswers &&
            foundUser.customAnswers.trim() !== "" &&
            foundUser.customAnswers !== "No payload logged.";

          if (historicalScore < 40) {
            return NextResponse.json(
              {
                error:
                  "This email address has already completed an assessment attempt. Multiple retries are strictly restricted.",
              },
              { status: 403 },
            );
          }

          if (historicalScore >= 40 && hasCompletedRound2) {
            return NextResponse.json(
              {
                error:
                  "You have already completed and locked your Round 2 Case Simulation submission. Multiple attempts are not permitted.",
              },
              { status: 403 },
            );
          }

          if (historicalScore >= 40 && !hasCompletedRound2) {
            return NextResponse.json({
              success: true,
              isExistingSession: true,
              candidate: foundUser,
              progress: { score: historicalScore, passed: true },
            });
          }
        }
      }

      return NextResponse.json({ success: true, isExistingSession: false });
    }

    if (body.action === "bulk-waitlist") {
      const sheetFetch = await fetch(
        `${targetUrl}?action=get-all-registrations`,
        {
          method: "GET",
          next: { revalidate: 0 },
        },
      );
      const sheetData = await sheetFetch.json();

      if (sheetData.success && Array.isArray(sheetData.data)) {
        const pendingRows = sheetData.data.filter(
          (row: any) =>
            !row.status || row.status.toString().toUpperCase() === "PENDING",
        );

        for (const candidate of pendingRows) {
          await fetch(targetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "update-shortlist",
              candidateId: candidate.regId,
              score: parseInt(candidate.rollNumber) || 0,
              status: "WAITLISTED",
            }),
          });
        }
        return NextResponse.json({
          success: true,
          updatedCount: pendingRows.length,
        });
      }
      return NextResponse.json(
        { error: "Failed to read database configurations snapshot." },
        { status: 400 },
      );
    }

    if (body.action === "update-case") {
      const { name, email, caseAnswer } = body;
      if (!email || !caseAnswer) {
        return NextResponse.json(
          { error: "Missing required core answer parameters." },
          { status: 400 },
        );
      }

      const sheetHandshake = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-case",
          email: email.trim().toLowerCase(),
          caseAnswer: caseAnswer.trim(),
        }),
      });

      const result = await sheetHandshake.json();
      if (!result.success) {
        return NextResponse.json(
          {
            error:
              result.error ||
              "Failed to append case payload on data matrix rows.",
          },
          { status: 400 },
        );
      }

      try {
        await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "dispatch-email-notice",
            email: email.trim().toLowerCase(),
            name: name || "Candidate",
            status: "APPLICATION_RECEIVED",
          }),
        });
      } catch (emailErr) {}

      return NextResponse.json({ success: true });
    }

    const {
      name,
      email,
      dept,
      round1Choices,
      resumeFileBase64,
      resumeFileName,
    } = body;

    if (!name || !email || !dept || !Array.isArray(round1Choices)) {
      return NextResponse.json(
        { error: "Malformed request payload parameters." },
        { status: 400 },
      );
    }

    let finalizedScore = 0;
    const readableChoices: string[] = [];

    SERVER_ANSWER_KEY.forEach((keyNode, index) => {
      const selectedIdx = round1Choices[index];
      if (
        selectedIdx !== undefined &&
        selectedIdx >= 0 &&
        selectedIdx < keyNode.pointsMap.length
      ) {
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
        resumeFileBase64,
        resumeFileName,
      }),
    });

    const result = await sheetHandshake.json();
    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || "Duplicate entry detected on server database.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      score: finalizedScore,
      passedRound1: finalizedScore >= 40,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server verification timeout node failure." },
      { status: 500 },
    );
  }
}
