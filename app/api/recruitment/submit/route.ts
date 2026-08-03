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

    // 1. UNIVERSAL PASSTHROUGH FOR EMAILS & STATUS/GROUP OVERRIDES
    if (
      body.action === "dispatch-email-notice" || 
      body.action === "update-shortlist" || 
      body.action === "update-candidate-group" || 
      body.action === "assign-group-task"
    ) {
      const sheetRes = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await sheetRes.json();
      return NextResponse.json(data);
    }

    // 2. CHECK INITIAL ELIGIBILITY (RESTORES RETURNING SESSION CHECK)
    if (body.action === "check-initial-eligibility") {
      const targetEmail = body.email ? body.email.trim().toLowerCase() : "";
      const sheetFetch = await fetch(`${targetUrl}?action=get-all-registrations`, { method: "GET", next: { revalidate: 0 } });
      const sheetData = await sheetFetch.json();

      if (sheetData.success && Array.isArray(sheetData.data)) {
        const existing = sheetData.data.find((c: any) => c.email && c.email.toLowerCase() === targetEmail);
        if (existing) {
          return NextResponse.json({
            success: true,
            isExistingSession: true,
            candidate: existing,
            progress: {
              passed: existing.status === "ROUND_2_APPROVED" || existing.status === "SELECTED_FOR_PI" || existing.status === "SELECTED_CORE"
            }
          });
        }
      }
      return NextResponse.json({ success: true, isExistingSession: false });
    }

    // 3. HANDLE NEW PROFILE REGISTRATION WITH RESUME UPLOAD
    if (body.action === "register-new-profile") {
      const { id, name, email, dept, resumeFileBase64, resumeFileName } = body;
      console.log("CHECKING RESUME PAYLOAD -> Length:", resumeFileBase64 ? resumeFileBase64.length : "NO FILE", "Name:", resumeFileName);
      const normalizedDept = dept === "ops" ? "OPS VERTICAL" : dept === "media" ? "PR & MEDIA CELL" : "CORPORATE ALLIANCES";

      const sheetRes = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register-profile",
          id: id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          dept: normalizedDept,
          resumeFileBase64: resumeFileBase64 || "",
          resumeFileName: resumeFileName || "Candidate_Resume.pdf"
        }),
      });
      const sheetData = await sheetRes.json();
      return NextResponse.json(sheetData);
    }

    // 4. GENERATE ROUND 2 GROUPS (CONCURRENT OPTIMIZATION)
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
      const concurrentTasks = [];

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
          concurrentTasks.push(
            fetch(targetUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "update-candidate-group", candidateId: member.regId, groupNumber: groupName })
            })
          );

          concurrentTasks.push(
            fetch(targetUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "dispatch-email-notice", email: member.email, name: member.name, status: "ROUND_2_APPROVED", groupNumber: groupName })
            })
          );
        }

        groups.push({ groupNumber: groupName, members: currentGroupMembers.map(m => m.name) });
        groupCounter++;
      }

      const chunkSize = 15;
      for (let i = 0; i < concurrentTasks.length; i += chunkSize) {
        const chunk = concurrentTasks.slice(i, i + chunkSize);
        await Promise.all(chunk);
      }

      return NextResponse.json({ success: true, groupsCount: groups.length, groups });
    }

    // 5. AUTOMATED TOP 70 SHORTLIST GENERATOR
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
      const shortlistTasks = [];

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

        shortlistTasks.push(
          fetch(targetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "update-shortlist", candidateId: candidate.regId, score: candidate.numScore, status: finalStatus })
          })
        );

        if (finalStatus === "ROUND_2_APPROVED") {
          shortlistTasks.push(
            fetch(targetUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "dispatch-email-notice", email: candidate.email, name: candidate.name, status: "ROUND_2_APPROVED" })
            })
          );
        }
      }

      const chunkSize = 20;
      for (let i = 0; i < shortlistTasks.length; i += chunkSize) {
        const chunk = shortlistTasks.slice(i, i + chunkSize);
        await Promise.all(chunk);
      }

      return NextResponse.json({ 
        success: true, 
        message: `Processed. ${selectedCount} auto-approved for Round 2. ${borderlineCount} tied at cutoff (${cutoffScore} pts) marked as BORDERLINE.` 
      });
    }

    // 6. QUIZ SUBMISSION ROUTING
    if (body.round1Choices) {
      const { name, email, dept, round1Choices } = body;
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
          score: finalizedScore, round1Choices: readableChoices
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