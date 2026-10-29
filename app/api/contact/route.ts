import { NextResponse } from "next/server";
import { sendContactMessage } from "@/lib/mailer";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    // Hidden field that people never fill in; bots usually do
    if (body.website) return NextResponse.json({ success: true });

    if (!name || name.length > 100 || !EMAIL_PATTERN.test(email) || message.length < 5 || message.length > 5000) {
      return NextResponse.json(
        { success: false, error: "Please add your name, a valid email and a message." },
        { status: 400 },
      );
    }

    await sendContactMessage({ name, email, message });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { success: false, error: "We couldn't send your message right now. Please email us instead." },
      { status: 500 },
    );
  }
}
