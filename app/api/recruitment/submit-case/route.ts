import { recruitmentAction } from "@/lib/recruitmentStore";
import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";
import { readRecruitmentConfig } from "@/lib/content";
import { limitByIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Full wipe of recruitment candidates, used by the recruitment admin dashboard. Admin session required.
    if (body.action === "clear-all") {
      if (!(await isAdminRequest())) return unauthorizedResponse();
      const resetRes = await recruitmentAction({ action: "clear-all" });
      return NextResponse.json({ success: resetRes.success });
    }

    const { email, caseAnswer } = body;

    if (!email || !caseAnswer) {
      return NextResponse.json({ error: "Malformed request keys." }, { status: 400 });
    }

    const limited = await limitByIp(request, "recruitment-case", 10, 600);
    if (limited) return limited;

    const { caseMinWords } = await readRecruitmentConfig();
    if (caseAnswer.trim().split(/\s+/).length < caseMinWords) {
      return NextResponse.json({ error: "Substantive strategy text required." }, { status: 400 });
    }

    const result = await recruitmentAction({
      action: "update-case",
      email: email.trim().toLowerCase(),
      caseAnswer: caseAnswer.trim(),
    });
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save your case answer." }, { status: 500 });
  }
}