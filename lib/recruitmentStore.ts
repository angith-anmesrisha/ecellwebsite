import { q } from "./db";
import { sheetGet, sheetPost } from "./sheetClient";
import { usingDatabase } from "./store";
import { noticeHtml, sendMail } from "./mailer";

// Recruitment candidates. Until the switch on /admin/database every call goes to the Apps Script
// as before; afterwards the same actions run against the candidates table. Rows keep the shape
// the admin screens already read: the vertical is in eventTitle, the quiz score in rollNumber and
// the quiz answers in customAnswers.

export interface Candidate {
  regId: string;
  name: string;
  email: string;
  eventTitle: string;
  rollNumber: string;
  customAnswers: string;
  status: string;
  tabSwitches: string;
  caseAnswer: string;
  resumeUrl: string;
  groupNumber: string;
  groupTask: string;
  peerReviews: unknown[];
  notes: string;
  timestamp: string;
  [key: string]: unknown;
}

type Result = { success: boolean; error?: string; [key: string]: unknown };

const PORTAL_URL = "https://ecellbimtech.in/results";

const toCandidate = (r: any): Candidate => ({
  ...(r.extra || {}),
  regId: r.reg_id,
  name: r.name,
  email: r.email,
  eventTitle: r.dept || "OPS VERTICAL",
  rollNumber: String(r.score ?? 0),
  customAnswers: r.choices,
  status: r.status || "PENDING",
  tabSwitches: String(r.tab_switches ?? 0),
  caseAnswer: r.case_answer,
  resumeUrl: r.resume_url,
  groupNumber: r.group_number,
  groupTask: r.group_task,
  peerReviews: Array.isArray(r.peer_reviews) ? r.peer_reviews : [],
  notes: r.notes,
  timestamp: new Date(r.created_at).toISOString(),
});

export async function listCandidates(): Promise<Candidate[]> {
  if (await usingDatabase()) {
    return (await q("select * from candidates order by created_at")).map(toCandidate);
  }
  const data = await sheetGet<{ success: boolean; data?: any[] }>("get-all-registrations", {}, { cache: "no-store" });
  if (!data.success || !Array.isArray(data.data)) throw new Error("Could not read candidates from the sheet.");
  return data.data.filter((r) => r && !r.eventId) as Candidate[];
}

export async function findCandidateByEmail(email: string): Promise<Candidate | null> {
  const target = email.trim().toLowerCase();
  if (await usingDatabase()) {
    const [row] = await q("select * from candidates where email = $1 order by created_at limit 1", [target]);
    return row ? toCandidate(row) : null;
  }
  return (await listCandidates()).find((c) => String(c.email || "").toLowerCase() === target) || null;
}

export async function checkStudentResult(email: string): Promise<Result> {
  if (!(await usingDatabase())) {
    return sheetGet<Result>("check-student-result", { email }, { cache: "no-store" });
  }
  const c = await findCandidateByEmail(email);
  if (!c) return { success: false, error: "No registration found for this email address." };
  return {
    success: true,
    name: c.name,
    status: c.status.toUpperCase(),
    score: Number(c.rollNumber) || 0,
    choices: c.customAnswers,
    groupNumber: c.groupNumber,
    groupTask: c.groupTask,
    tabSwitches: c.tabSwitches,
  };
}

// ---------- Status emails (were sent by the Apps Script with MailApp) ----------

function noticeFor(status: string, name: string, groupNumber: string) {
  const sign = "Best regards,\nBIMTECH E-Cell Team";
  switch (status) {
    case "ROUND_2_APPROVED":
      return [
        "Congratulations! You have successfully cleared the Round 1 Assessment.",
        `You have been officially APPROVED FOR ROUND 2.${groupNumber ? `\nYour assigned group number is: ${groupNumber}` : ""}`,
        "Please log back into your dashboard to check your assigned team and live case task objectives.",
        sign,
      ];
    case "SELECTED_FOR_PI":
      return [
        "Congratulations! Your performance across our Round 1 and Round 2 modules has passed our panel benchmarks.",
        "You have been officially SHORTLISTED FOR A LIVE PERSONAL INTERVIEW (PI).",
        "Please visit the dashboard to track your interview slot details.",
        sign,
      ];
    case "SELECTED_CORE":
      return [
        "Welcome to the core team! You have been SELECTED as an Executive Member of the BIMTECH E-Cell.",
        "Check your portal status for orientation details.",
        sign,
      ];
    case "REJECTED":
      return [
        "Thank you for taking the time to participate in the recruitment process for E-Cell BIMTECH and for your interest in joining the core team.",
        "We appreciate the effort you put into your application and assessment. However, after careful review of all candidates, we regret to inform you that we will not be moving forward with your application at this time.",
        "The candidate pool this year was exceptionally competitive, and our decision does not reflect your overall potential or capabilities.",
        "We wish you the very best in your academic journey and future endeavors.",
        "Best regards,\nThe Recruitment Team\nE-Cell BIMTECH",
      ];
    default:
      return [
        "Thank you for completing our recruitment assessment. Your profile status has been updated.",
        "Please log back into the results portal to check live status updates.",
        sign,
      ];
  }
}

async function sendNotice(email: string, name: string, status: string, groupNumber = "") {
  const paragraphs = noticeFor(status, name, groupNumber);
  await sendMail({
    to: email,
    subject: "BIMTECH E-Cell Cohort Assessment Update",
    fromName: "BIMTECH E-Cell",
    html: noticeHtml(`Dear ${name},`, paragraphs, status === "REJECTED" ? undefined : { href: PORTAL_URL, label: "Open the results portal" }),
    text: [`Dear ${name},`, ...paragraphs, status === "REJECTED" ? "" : PORTAL_URL].filter(Boolean).join("\n\n"),
  });
}

// ---------- Actions ----------

const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const formatChoices = (v: unknown) => (Array.isArray(v) ? v.join(" // ") : s(v));

async function rowByEmail(email: string) {
  const [row] = await q("select reg_id from candidates where email = $1 order by created_at limit 1", [email.trim().toLowerCase()]);
  return row?.reg_id as string | undefined;
}

async function saveResume(regId: string, base64: string, fileName: string) {
  const clean = base64.replace(/^data:[^,]*,/, "");
  if (!clean) return "NO_BASE64_RECEIVED";
  await q(
    `insert into resumes (reg_id, file_name, content) values ($1, $2, decode($3, 'base64'))
     on conflict (reg_id) do update set file_name = excluded.file_name, content = excluded.content, created_at = now()`,
    [regId, fileName.slice(0, 200) || "resume.pdf", clean],
  );
  return `/api/admin/resume/${encodeURIComponent(regId)}`;
}

async function databaseAction(p: Record<string, any>): Promise<Result> {
  switch (p.action) {
    case "register-profile":
    case "submit-quiz": {
      const email = s(p.email).trim().toLowerCase();
      const existing = await rowByEmail(email);
      if (existing) {
        if (p.action === "register-profile") return { success: false, error: "Duplicate entry blocked." };
        await q(`update candidates set score = $2, choices = $3, tab_switches = $4, updated_at = now() where reg_id = $1`, [
          existing,
          Number(p.score) || 0,
          formatChoices(p.round1Choices),
          Number(p.tabSwitches) || 0,
        ]);
        return { success: true, score: Number(p.score) || 0, passed: true };
      }
      const regId = s(p.id) || `CAN-${Math.floor(Math.random() * 9000 + 1000)}`;
      const resumeUrl = p.resumeFileBase64 ? await saveResume(regId, s(p.resumeFileBase64), s(p.resumeFileName)) : "NO_BASE64_RECEIVED";
      await q(
        `insert into candidates (reg_id, name, email, dept, score, choices, status, resume_url, tab_switches)
         values ($1, $2, $3, $4, $5, $6, 'PENDING', $7, $8)`,
        [regId, s(p.name), email, s(p.dept), Number(p.score) || 0, p.round1Choices ? formatChoices(p.round1Choices) : "Profile Initialized", resumeUrl, Number(p.tabSwitches) || 0],
      );
      return { success: true, score: Number(p.score) || 0, passed: true };
    }

    case "update-case": {
      const existing = await rowByEmail(s(p.email));
      if (!existing) return { success: false, error: "No application found for this email address." };
      await q("update candidates set case_answer = $2, updated_at = now() where reg_id = $1", [existing, s(p.caseAnswer)]);
      return { success: true };
    }

    case "update-shortlist": {
      const id = s(p.candidateId);
      const rows = await q(
        `update candidates set score = $2, status = $3, updated_at = now()
         where reg_id = (select reg_id from candidates where reg_id = $1 or lower(email) = lower($1) order by created_at limit 1)
         returning reg_id`,
        [id, Number(p.score) || 0, s(p.status).toUpperCase()],
      );
      return rows.length ? { success: true, message: "Candidate status saved." } : { success: false, error: "Candidate not found." };
    }

    case "update-candidate-group": {
      const rows = await q("update candidates set group_number = $2, updated_at = now() where reg_id = $1 returning reg_id", [s(p.candidateId), s(p.groupNumber)]);
      return rows.length ? { success: true, message: "Group assigned." } : { success: false, error: "Candidate not found for grouping." };
    }

    case "assign-group-task": {
      const rows = await q("update candidates set group_task = $2, updated_at = now() where group_number = $1 and group_number <> '' returning reg_id", [
        s(p.groupNumber),
        s(p.taskDescription),
      ]);
      return rows.length ? { success: true, message: "Task assigned to group." } : { success: false, error: "No candidates found in this group." };
    }

    case "submit-peer-review": {
      const review = {
        interviewer: s(p.interviewerName).slice(0, 100),
        techScore: Number(p.techScore) || 0,
        commScore: Number(p.commScore) || 0,
        solveScore: Number(p.solveScore) || 0,
        feedback: s(p.notes).slice(0, 4000),
        at: new Date().toISOString(),
      };
      const rows = await q(
        "update candidates set peer_reviews = peer_reviews || $2::jsonb, updated_at = now() where reg_id = $1 returning reg_id",
        [s(p.candidateId), JSON.stringify([review])],
      );
      return rows.length ? { success: true } : { success: false, error: "Candidate not found." };
    }

    case "append-quick-note": {
      const rows = await q(
        "update candidates set notes = trim(both from notes || E'\\n' || $2), updated_at = now() where reg_id = $1 returning reg_id",
        [s(p.candidateId), s(p.note ?? p.notes).slice(0, 2000)],
      );
      return rows.length ? { success: true } : { success: false, error: "Candidate not found." };
    }

    case "transfer-track": {
      const rows = await q("update candidates set dept = $2, updated_at = now() where reg_id = $1 returning reg_id", [s(p.candidateId), s(p.dept ?? p.track)]);
      return rows.length ? { success: true } : { success: false, error: "Candidate not found." };
    }

    case "dispatch-email-notice": {
      try {
        await sendNotice(s(p.email), s(p.name), s(p.status).toUpperCase(), s(p.groupNumber));
        return { success: true, message: `Email sent to ${s(p.email)}` };
      } catch (error) {
        console.error("Recruitment email failed:", error);
        return { success: false, error: `Couldn't email ${s(p.email)}.` };
      }
    }

    case "clear-all": {
      await q("delete from resumes");
      await q("delete from candidates");
      return { success: true };
    }

    default:
      return { success: false, error: "Invalid action." };
  }
}

// Runs one recruitment action wherever the records currently live
export async function recruitmentAction(payload: Record<string, any>): Promise<Result> {
  if (await usingDatabase()) return databaseAction(payload);
  return sheetPost<Result>(payload);
}
