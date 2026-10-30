import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";

// Resumes uploaded after the move to the database are stored in it; admins open them here
export async function GET(_request: Request, { params }: { params: Promise<{ regId: string }> }) {
  if (!(await isAdminRequest())) return unauthorizedResponse();
  const { regId } = await params;
  const [row] = await q<{ file_name: string; content: string }>(
    "select file_name, encode(content, 'base64') as content from resumes where reg_id = $1",
    [regId],
  );
  if (!row) return new Response("Resume not found.", { status: 404 });
  const fileName = (row.file_name || "resume.pdf").replace(/[^\w.-]+/g, "_");
  return new Response(Buffer.from(row.content, "base64"), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
