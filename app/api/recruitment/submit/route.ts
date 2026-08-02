import { NextResponse } from "next/server";

const CORRECT_ANSWERS = [
  1, 2, 1, 0, 2, 1, 1, 1, 2, 1, 1, 2, 2, 2, 2, 1, 1, 1, 0, 1, 2, 2, 0, 0, 2, 2, 2, 1, 1, 2
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const email = searchParams.get("email");
    const targetUrl = process.env.SHEET_WEBHOOK_URL;

    if (!targetUrl) throw new Error("Google webhook destination variable is blank.");

    if (action === "get-all-registrations") {
      const sheetFetch = await fetch(`${targetUrl}?action=get-all-registrations`, { method: "GET", next: { revalidate: 0 } });
      const sheetData = await sheetFetch.json();
      return NextResponse.json(sheetData);
    }

    if (action === "check-student-result" && email) {
      const sheetFetch = await fetch(`${targetUrl}?action=check-student-result&email=${encodeURIComponent(email)}`, { method: "GET", next: { revalidate: 0 } });
      const sheetData = await sheetFetch.json();
      return NextResponse.json(sheetData);
    }

    return NextResponse.json({ error: "Invalid routing request parameter configuration." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.toString() }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetUrl = process.env.SHEET_WEBHOOK_URL;

    if (!targetUrl) throw new Error("Google webhook destination variable is blank.");

    // GENERATE ROUND 2 GROUPS (GROUPS OF 5 WITH MIXED VERTICALS)
    if (body.action === "generate-round2-groups") {
      const sheetFetch = await fetch(`${targetUrl}?action=get-all-registrations`, { method: "GET", next: { revalidate: 0 } });
      const sheetData = await sheetFetch.json();

      if (!sheetData.success || !Array.isArray(sheetData.data)) {
        return NextResponse.json({ error: "Failed to read database state." }, { status: 500 });
      }

      const approvedCandidates = sheetData.data.filter((c: any) => c.status === "ROUND_2_APPROVED");

      const opsPool = approvedCandidates.filter((c: any) => c.eventTitle?.toUpperCase().includes("OPS"));
      const mediaPool = approvedCandidates.filter((c: any) => c.eventTitle?.toUpperCase().includes("MEDIA") || c.eventTitle?.toUpperCase().includes("PR"));
      const sponsPool = approvedCandidates.filter((c: any) => c.eventTitle?.toUpperCase().includes("SPONS") || c.eventTitle?.toUpperCase().includes("CORPORATE"));
      const remainingPool = approvedCandidates.filter((c: any) => !opsPool.includes(c) && !mediaPool.includes(c) && !sponsPool.includes(c));

      let groups: any[] = [];
      let groupCounter = 1;

      while (opsPool.length > 0 || mediaPool.length > 0 || sponsPool.length > 0 || remainingPool.length > 0) {
        let currentGroupMembers: any[] = [];

        if (opsPool.length > 0) currentGroupMembers.push(opsPool.shift());
        if (mediaPool.length > 0) currentGroupMembers.push(mediaPool.shift());
        if (sponsPool.length > 0) currentGroupMembers.push(sponsPool.shift());

        while (currentGroupMembers.length < 5) {
          if (opsPool.length > 0) currentGroupMembers.push(opsPool.shift());
          else if (mediaPool.length > 0) currentGroupMembers.push(mediaPool.shift());
          else if (sponsPool.length > 0) currentGroupMembers.push(sponsPool.shift());
          else if (remainingPool.length > 0) currentGroupMembers.push(remainingPool.shift());
          else break;
        }

        const groupName = `G-${groupCounter < 10 ? "0" + groupCounter : groupCounter}`;
        for (const member of currentGroupMembers) {
          await fetch(targetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              action: "update-candidate-group", 
              candidateId: member.regId, 
              groupNumber: groupName 
            })
          });

          await fetch(targetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              action: "dispatch-email-notice", 
              email: member.email, 
              name: member.name, 
              status: "ROUND_2_APPROVED",
              groupNumber: groupName
            })
          });
        }

        groups.push({ groupNumber: groupName, members: currentGroupMembers.map(m => m.name) });
        groupCounter++;
      }

      return NextResponse.json({ success: true, groupsCount: groups.length, groups });
    }

    // ASSIGN TASK TO A SPECIFIC GROUP
    if (body.action === "assign-group-task") {
      const { groupNumber, taskDescription } = body;
      const sheetRes = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-group-task", groupNumber, taskDescription })
      });
      const data = await sheetRes.json();
      return NextResponse.json(data);
    }

    // AUTOMATED TOP 70 SHORTLIST GENERATOR
    if (body.action === "generate-shortlist") {
      const sheetFetch = await fetch(`${targetUrl}?action=get-all-registrations`, { method: "GET", next: { revalidate: 0 } });
      const sheetData = await sheetFetch.json();

      if (!sheetData.success || !Array.isArray(sheetData.data)) {
        return NextResponse.json({ error: "Failed to read database state." }, { status: 500 });
      }

      const rankedCandidates = sheetData.data
        .filter((c: any) => c.status === "PENDING" || c.status === "BORDERLINE") 
        .map((c: any) => ({ ...c, numScore: parseInt(c.rollNumber) || 0 }))
        .sort((a: any, b: any) => b.numScore - a.numScore);

      if (rankedCandidates.length === 0) {
        return NextResponse.json({ success: true, message: "No pending candidates available for processing." });
      }

      const cutoffIndex = Math.min(69, rankedCandidates.length - 1);
      const cutoffScore = rankedCandidates[cutoffIndex].numScore;

      let selectedCount = 0;
      let borderlineCount = 0;

      for (const candidate of rankedCandidates) {
        let finalStatus = "WAITLISTED";

        if (rankedCandidates.length <= 70) {
            finalStatus = "ROUND_2_APPROVED";
            selectedCount++;
        } else {
            if (candidate.numScore > cutoffScore) {
              finalStatus = "ROUND_2_APPROVED";
              selectedCount++;
            } else if (candidate.numScore === cutoffScore) {
              finalStatus = "BORDERLINE";
              borderlineCount++;
            } else {
              finalStatus = "WAITLISTED";
            }
        }

        await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update-shortlist", candidateId: candidate.regId, score: candidate.numScore, status: finalStatus })
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: `Processed. ${selectedCount} auto-approved for Round 2. ${borderlineCount} tied at cutoff (${cutoffScore} pts) marked as BORDERLINE.` 
      });
    }

    if (body.action === "update-shortlist") {
      const sheetRes = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await sheetRes.json();
      return NextResponse.json(data);
    }

    if (body.action === "dispatch-email-notice") {
      const sheetRes = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await sheetRes.json();
      return NextResponse.json(data);
    }

    if (body.round1Choices) {
      const { name, email, dept, round1Choices, resumeFileBase64, resumeFileName } = body;
      const normalizedDept = dept === "ops" ? "OPS VERTICAL" : dept === "media" ? "PR & MEDIA CELL" : "CORPORATE ALLIANCES";
      
      let finalizedScore = 0;
      const readableChoices: string[] = [];

      if (Array.isArray(round1Choices)) {
        CORRECT_ANSWERS.forEach((correctIdx, index) => {
          const selectedIdx = round1Choices[index];
          if (selectedIdx === correctIdx) {
            finalizedScore += 3;
          } else if (selectedIdx !== undefined && selectedIdx !== -1) {
            finalizedScore -= 1;
          }
          readableChoices.push(`Q${index + 1}: [${selectedIdx}]`);
        });
      }

      const sheetRes = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit-quiz",
          id: "cand_" + Math.random().toString(36).substring(2, 9),
          name: name.trim(), email: email.trim().toLowerCase(), dept: normalizedDept,
          score: finalizedScore, round1Choices: readableChoices,
          resumeFileBase64: resumeFileBase64 || "", resumeFileName: resumeFileName || "Candidate_Resume.pdf"
        }),
      });
      await sheetRes.json();

      return NextResponse.json({ success: true, score: finalizedScore, passedRound1: false });
    }

    return NextResponse.json({ error: "Invalid API routing parameters." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.toString() }, { status: 500 });
  }
}