import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";
import { getRedis, KEYS } from "@/lib/redis";
import { listAlumni, listEventRegistrations, listEvents, listGraveyard } from "@/lib/store";
import { listCandidates } from "@/lib/recruitmentStore";
import { csvResponse, toCsv } from "@/lib/csv";
import type { SheetEvent } from "@/lib/content-types";

export const dynamic = "force-dynamic";

const stamp = () => new Date().toISOString().slice(0, 10);

// Any list of flat objects as CSV, columns in first-seen order
function objectsCsv(rows: Record<string, unknown>[]) {
  const headers = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  return toCsv(headers, rows.map((r) => headers.map((h) => r[h])));
}

export async function GET(request: Request) {
  if (!(await isAdminRequest())) return unauthorizedResponse();
  const params = new URL(request.url).searchParams;
  const what = params.get("what") || "registrations";

  try {
    if (what === "registrations") {
      const eventId = params.get("eventId") || undefined;
      const [rows, events] = await Promise.all([listEventRegistrations({ fresh: true, eventId }), listEvents<SheetEvent>({ fresh: true })]);
      const redis = getRedis();
      const eventIds = [...new Set(rows.map((r) => r.eventId))];
      const cancelled = new Map<string, Set<string>>();
      const attended = new Map<string, Set<string>>();
      if (redis) {
        await Promise.all(
          eventIds.map(async (id) => {
            cancelled.set(id, new Set((await redis.smembers(KEYS.cancelled(id))) as string[]));
            attended.set(id, new Set((await redis.smembers(KEYS.attended(id))) as string[]));
          }),
        );
      }
      const answerKeys = [...new Set(rows.flatMap((r) => Object.keys(r.customAnswers || {})))];
      const headers = ["Registration ID", "Event", "Event ID", "Name", "Email", "Roll number", "Registered at", ...answerKeys, "Cancelled", "Checked in"];
      const csv = toCsv(
        headers,
        rows.map((r) => [
          r.regId,
          r.eventTitle,
          r.eventId,
          r.name,
          r.email,
          r.rollNumber,
          r.timestamp || "",
          ...answerKeys.map((k) => r.customAnswers?.[k] ?? ""),
          cancelled.get(r.eventId)?.has(r.regId) ? "yes" : "",
          attended.get(r.eventId)?.has(r.email) ? "yes" : "",
        ]),
      );
      const title = eventId ? events.find((e) => e.id === eventId)?.title || eventId : "all-events";
      return csvResponse(`registrations-${title}-${stamp()}.csv`, csv);
    }

    if (what === "candidates") {
      const rows = await listCandidates();
      const csv = toCsv(
        ["ID", "Name", "Email", "Vertical", "Score", "Status", "Group", "Group task", "Tab switches", "Resume", "Case answer", "Peer reviews", "Notes", "Quiz answers", "Applied at"],
        rows.map((c) => [
          c.regId, c.name, c.email, c.eventTitle, c.rollNumber, c.status, c.groupNumber, c.groupTask, c.tabSwitches,
          c.resumeUrl, c.caseAnswer, c.peerReviews, c.notes, c.customAnswers, c.timestamp,
        ]),
      );
      return csvResponse(`recruitment-${stamp()}.csv`, csv);
    }

    if (what === "events") return csvResponse(`events-${stamp()}.csv`, objectsCsv((await listEvents({ fresh: true })) as any));
    if (what === "alumni") return csvResponse(`alumni-${stamp()}.csv`, objectsCsv(await listAlumni({ fresh: true })));
    if (what === "graveyard") return csvResponse(`graveyard-${stamp()}.csv`, objectsCsv(await listGraveyard({ fresh: true })));

    return new Response("Unknown export.", { status: 400 });
  } catch (error) {
    console.error("Export failed:", error);
    return new Response("The export failed. Please try again.", { status: 500 });
  }
}
