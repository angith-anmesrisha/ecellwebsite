import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB (keeps Neon row size fast and clean)
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

export async function POST(req: Request) {
  if (!(await isAdminRequest())) return unauthorizedResponse();

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No image file provided." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: "Unsupported format. Use PNG, JPG, or WEBP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: "File exceeds 2MB limit. Please compress the image." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

    return NextResponse.json({ success: true, url: dataUrl });
  } catch (err) {
    console.error("Banner upload error:", err);
    return NextResponse.json({ success: false, error: "Server failed to process image." }, { status: 500 });
  }
}