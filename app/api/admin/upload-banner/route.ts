import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
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
        { success: false, error: "File exceeds 5MB limit. Please compress the image." },
        { status: 400 }
      );
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET?.trim();

    if (!cloudName || !uploadPreset) {
      return NextResponse.json(
        { success: false, error: "Cloudinary is not configured in environment variables." },
        { status: 500 }
      );
    }

    const cloudForm = new FormData();
    cloudForm.append("file", file);
    cloudForm.append("upload_preset", uploadPreset);

    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: cloudForm,
    });

    const cloudData = await cloudRes.json();
    if (!cloudRes.ok || !cloudData.secure_url) {
      console.error("Cloudinary upload failed:", cloudData);
      return NextResponse.json(
        { success: false, error: cloudData?.error?.message || "Cloudinary upload failed." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, url: cloudData.secure_url });
  } catch (err) {
    console.error("Banner upload error:", err);
    return NextResponse.json({ success: false, error: "Server failed to process image." }, { status: 500 });
  }
}