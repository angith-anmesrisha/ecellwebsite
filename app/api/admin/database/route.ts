import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";
import { dbConfigured, ensureSchema, q } from "@/lib/db";
import { sheetConfigured } from "@/lib/sheetClient";
import { PUBLIC_TAGS, deleteListing, listSubmissions, reviewSubmission, setSource, usingDatabase } from "@/lib/store";
import { databaseCounts, importFromSheet, sheetCounts } from "@/lib/migrate";
import { cleanText } from "@/lib/security";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

async function status(compare: boolean) {
  const configured = dbConfigured();
  let tablesReady = false;
  let counts = null;
  let lastImport: string | null = null;
  if (configured) {
    try {
      counts = await databaseCounts();
      tablesReady = true;
      const [row] = await q<{ value: { at: string } }>("select value from app_state where key = 'last_import'");
      lastImport = row?.value?.at || null;
    } catch {
      tablesReady = false;
    }
  }
  let sheet = null;
  let sheetError = null;
  if (compare && sheetConfigured()) {
    try {
      sheet = await sheetCounts();
    } catch (error) {
      sheetError = String(error instanceof Error ? error.message : error);
    }
  }
  return {
    success: true,
    configured,
    sheetConfigured: sheetConfigured(),
    tablesReady,
    source: (await usingDatabase()) ? "database" : "sheet",
    counts,
    sheet,
    sheetError,
    lastImport,
    submissions: tablesReady ? await listSubmissions() : [],
  };
}

export async function GET(request: Request) {
  if (!(await isAdminRequest())) return unauthorizedResponse();
  try {
    return NextResponse.json(await status(new URL(request.url).searchParams.get("compare") === "1"));
  } catch (error) {
    console.error("Database status failed:", error);
    return fail("Couldn't read the database status.", 500);
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return unauthorizedResponse();
  if (!dbConfigured()) return fail("The database isn't connected yet. Add Neon in Vercel → Storage, then redeploy.");
  const body = await request.json().catch(() => ({}));

  try {
    switch (body.action) {
      case "setup":
        await ensureSchema();
        return NextResponse.json({ success: true });

      case "import": {
        if (!sheetConfigured()) return fail("SHEET_WEBHOOK_URL isn't set, so there's no Sheet to copy from.");
        if (await usingDatabase()) return fail("The site already runs on the database. Switch back to the Sheet before importing again, or new records would be overwritten.");
        const imported = await importFromSheet();
        return NextResponse.json({ success: true, imported });
      }

      case "switch": {
        const to = body.to === "database" ? "database" : "sheet";
        if (to === "database") {
          const counts = await databaseCounts().catch(() => null);
          if (!counts) return fail("Create the tables and import from the Sheet first.");
        }
        await setSource(to);
        PUBLIC_TAGS.forEach((tag) => revalidateTag(tag, { expire: 0 }));
        return NextResponse.json({ success: true, source: to });
      }

      case "review-submission": {
        const ok = await reviewSubmission(cleanText(body.id, 80), body.approve === true);
        if (!ok) return fail("That submission no longer exists.", 404);
        PUBLIC_TAGS.forEach((tag) => revalidateTag(tag, { expire: 0 }));
        return NextResponse.json({ success: true });
      }

      case "delete-listing": {
        const kind = body.kind === "alumni" ? "alumni" : body.kind === "graveyard" ? "graveyard" : null;
        if (!kind) return fail("Unknown list.");
        await deleteListing(kind, cleanText(body.id, 80));
        revalidateTag(kind === "alumni" ? "get-alumni" : "get-graveyard", { expire: 0 });
        return NextResponse.json({ success: true });
      }

      default:
        return fail("Unknown action.");
    }
  } catch (error) {
    console.error("Database action failed:", error);
    return fail(error instanceof Error ? error.message : "The database action failed.", 500);
  }
}
