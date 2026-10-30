import { checkStudentResult, findCandidateByEmail, listCandidates, recruitmentAction } from "@/lib/recruitmentStore";
import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";
import { readRecruitmentConfig } from "@/lib/content";
import { captchaFailed, limitByIp, verifyTurnstile } from "@/lib/security";

const ADMIN_ACTIONS = new Set([
  "dispatch-email-notice",
  "update-shortlist",
  "update-candidate-group",
  "assign-group-task",
  "generate-round2-groups",
  "generate-shortlist",
]);

const CORRECT_ANSWERS = [
  1, 2, 0, 2, 1, 3, 1, 0, 0, 1, 2, 1, 0, 0, 3, 0, 1, 1, 3, 1, 0, 2, 2, 1, 1, 1, 1, 2, 0, 1
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const email = searchParams.get("email");
    if (action === "get-all-registrations") {
      if (!(await isAdminRequest())) return unauthorizedResponse();
      return NextResponse.json({ success: true, data: await listCandidates() });
    }

    if (action === "check-student-result" && email) {
      return NextResponse.json(await checkStudentResult(email));
    }

    return NextResponse.json({ error: "Invalid routing request parameter configuration." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.toString() }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (ADMIN_ACTIONS.has(body.action) && !(await isAdminRequest())) return unauthorizedResponse();

    // Public actions are rate limited per visitor; new profiles also pass the bot check
    if (!ADMIN_ACTIONS.has(body.action)) {
      const limited = await limitByIp(request, "recruitment", 30, 600);
      if (limited) return limited;
      if (body.action === "register-new-profile" && !(await verifyTurnstile(body.captchaToken, request))) return captchaFailed();
    }

    // 1. UNIVERSAL PASSTHROUGH FOR EMAILS & STATUS/GROUP OVERRIDES
    if (
      body.action === "dispatch-email-notice" || 
      body.action === "update-shortlist" || 
      body.action === "update-candidate-group" || 
      body.action === "assign-group-task"
    ) {
      return NextResponse.json(await recruitmentAction(body));
    }

    // 2. CHECK INITIAL ELIGIBILITY (RESTORES RETURNING SESSION CHECK)
    if (body.action === "check-initial-eligibility") {
      const targetEmail = body.email ? body.email.trim().toLowerCase() : "";
      const existing = targetEmail ? await findCandidateByEmail(targetEmail) : null;
      if (existing) {
        return NextResponse.json({
          success: true,
          isExistingSession: true,
          // Only what the form needs to resume a session; never the full record
          candidate: { regId: existing.regId, id: existing.id, name: existing.name, email: existing.email, status: existing.status },
          progress: {
            passed: existing.status === "ROUND_2_APPROVED" || existing.status === "SELECTED_FOR_PI" || existing.status === "SELECTED_CORE"
          }
        });
      }
      return NextResponse.json({ success: true, isExistingSession: false });
    }

    // 3. HANDLE NEW PROFILE REGISTRATION WITH RESUME UPLOAD
    if (body.action === "register-new-profile") {
      const { id, name, email, dept, resumeFileBase64, resumeFileName } = body;
      const normalizedDept = dept === "ops" ? "OPS VERTICAL" : dept === "media" ? "PR & MEDIA CELL" : "CORPORATE ALLIANCES";

      return NextResponse.json(
        await recruitmentAction({
          action: "register-profile",
          id: id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          dept: normalizedDept,
          resumeFileBase64: resumeFileBase64 || "",
          resumeFileName: resumeFileName || "Candidate_Resume.pdf",
          score: 0,
        }),
      );
    }

    // 4. GENERATE ROUND 2 GROUPS (CONCURRENT OPTIMIZATION)
    if (body.action === "generate-round2-groups") {
      const sheetData = { data: (await listCandidates()) as any[] };

      const approvedCandidates = sheetData.data.filter((c: any) => c.status === "ROUND_2_APPROVED");

      const opsPool = approvedCandidates.filter((c: any) => c.eventTitle?.toUpperCase().includes("OPS"));
      const mediaPool = approvedCandidates.filter((c: any) => c.eventTitle?.toUpperCase().includes("MEDIA") || c.eventTitle?.toUpperCase().includes("PR"));
      const sponsPool = approvedCandidates.filter((c: any) => c.eventTitle?.toUpperCase().includes("SPONS") || c.eventTitle?.toUpperCase().includes("CORPORATE"));
      const remainingPool = approvedCandidates.filter((c: any) => !opsPool.includes(c) && !mediaPool.includes(c) && !sponsPool.includes(c));

      const groups: any[] = [];
      let groupCounter = 1;
      const concurrentTasks = [];

      while (opsPool.length > 0 || mediaPool.length > 0 || sponsPool.length > 0 || remainingPool.length > 0) {
        const currentGroupMembers: any[] = [];

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
            recruitmentAction({ action: "update-candidate-group", candidateId: member.regId, groupNumber: groupName })
          );

          concurrentTasks.push(
            recruitmentAction({ action: "dispatch-email-notice", email: member.email, name: member.name, status: "ROUND_2_APPROVED", groupNumber: groupName })
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
      const sheetData = { data: (await listCandidates()) as any[] };

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
          recruitmentAction({ action: "update-shortlist", candidateId: candidate.regId, score: candidate.numScore, status: finalStatus })
        );

        if (finalStatus === "ROUND_2_APPROVED") {
          shortlistTasks.push(
            recruitmentAction({ action: "dispatch-email-notice", email: candidate.email, name: candidate.name, status: "ROUND_2_APPROVED" })
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

    // 6. QUIZ SUBMISSION ROUTING (UPDATED WITH PROCTORING LOGIC)
    if (body.round1Choices) {
      // PROCTORING FIX: We added "tabSwitches" to the extraction here
      const { name, email, dept, round1Choices, tabSwitches } = body;
      const normalizedDept = dept === "ops" ? "OPS VERTICAL" : dept === "media" ? "PR & MEDIA CELL" : "CORPORATE ALLIANCES";
      
      let finalizedScore = 0;
      const readableChoices: string[] = [];

      // Custom questions from the admin console replace the built-in quiz and its answer key
      const config = await readRecruitmentConfig();
      const answerKey = config.questions.length > 0 ? config.questions.map((q) => q.answer) : CORRECT_ANSWERS;
      const marksCorrect = config.questions.length > 0 ? config.marksCorrect : 3;
      const marksWrong = config.questions.length > 0 ? config.marksWrong : -1;

      if (Array.isArray(round1Choices)) {
        answerKey.forEach((correctIdx, index) => {
          const selectedIdx = round1Choices[index];
          if (selectedIdx === correctIdx) {
            finalizedScore += marksCorrect;
          } else if (selectedIdx !== undefined && selectedIdx !== -1) {
            finalizedScore += marksWrong;
          }
          readableChoices.push(`Q${index + 1}: [${selectedIdx}]`);
        });
      }

      await recruitmentAction({
          action: "submit-quiz",
          id: "cand_" + Math.random().toString(36).substring(2, 9),
          name: name.trim(), email: email.trim().toLowerCase(), dept: normalizedDept,
          score: finalizedScore, round1Choices: readableChoices,
          tabSwitches: tabSwitches || 0 // PROCTORING FIX: This passes the number straight through to the record
      });

      return NextResponse.json({ success: true, score: finalizedScore, passedRound1: false });
    }

    return NextResponse.json({ error: "Invalid API routing parameters." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.toString() }, { status: 500 });
  }
}