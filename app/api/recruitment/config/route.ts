import { NextResponse } from "next/server";
import { readRecruitmentConfig } from "@/lib/content";

export const dynamic = "force-dynamic";

// What the candidate-facing portal needs: custom questions (without answers), marking and case rules.
// Null questions mean "use the built-in quiz".
export async function GET() {
  const config = await readRecruitmentConfig();
  return NextResponse.json(
    {
      success: true,
      questions: config.questions.length > 0 ? config.questions.map(({ q, options }) => ({ q, options })) : null,
      version: config.updatedAt || null,
      marksCorrect: config.marksCorrect,
      marksWrong: config.marksWrong,
      caseMinWords: config.caseMinWords,
      casePools: config.casePools,
      launchAt: config.launchAt || config.openAt || null,
    },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
  );
}
