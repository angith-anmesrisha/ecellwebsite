import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";
import { getRedis } from "@/lib/redis";
import { readRecruitmentConfig } from "@/lib/content";
import type { RecruitmentConfig } from "@/lib/content-types";

export const dynamic = "force-dynamic";

const PHASE_KEY = "ecell_recruitment_phase";
const PHASE_CHANGED_KEY = "ecell_recruitment_phase_changed_at";
const HOLD_KEY = "ecell_global_hold";

// The phase is whichever came last: the admin's manual change, or a scheduled switch whose time has passed
function effectivePhase(manualPhase: string, manualAt: number, config: RecruitmentConfig, now = Date.now()) {
  const scheduled = (
    [
      [config.openAt, "OPEN"],
      [config.standbyAt, "STANDBY"],
      [config.completedAt, "COMPLETED"],
    ] as const
  )
    .map(([at, phase]) => ({ at: at ? new Date(at).getTime() : NaN, phase }))
    .filter((s) => Number.isFinite(s.at) && s.at <= now && s.at > manualAt)
    .sort((a, b) => b.at - a.at);
  return scheduled[0]?.phase || manualPhase;
}

async function readState() {
  const redis = getRedis();
  if (!redis) throw new Error("Missing Redis environment variables.");
  const [phase, changedAt, rawHold, config] = await Promise.all([
    redis.get<string>(PHASE_KEY),
    redis.get<number>(PHASE_CHANGED_KEY),
    redis.get(HOLD_KEY),
    readRecruitmentConfig(),
  ]);
  return {
    phase: effectivePhase(String(phase || "LOCKED").toUpperCase(), Number(changedAt) || 0, config),
    holdReleased: rawHold === true || rawHold === "true",
    launchAt: config.launchAt || config.openAt || null,
  };
}

export async function GET() {
  try {
    return NextResponse.json({ success: true, ...(await readState()) });
  } catch (error: any) {
    console.error("Redis GET Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const redis = getRedis();
    if (!redis) throw new Error("Missing Redis environment variables.");

    const body = await request.json();

    if (body.action === "update-global-phase") {
      if (!(await isAdminRequest())) return unauthorizedResponse();
      if (body.phase !== undefined) {
        const current = await readState();
        // Only a real change counts as a manual override of the schedule
        if (String(body.phase).toUpperCase() !== current.phase) {
          await redis.set(PHASE_KEY, body.phase);
          await redis.set(PHASE_CHANGED_KEY, Date.now());
        }
      }
      if (body.holdReleased !== undefined) {
        await redis.set(HOLD_KEY, body.holdReleased === true);
      }

      return NextResponse.json({ success: true, ...(await readState()) });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Redis POST Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
