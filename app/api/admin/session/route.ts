import { limitByIp } from "@/lib/security";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkAdminPassword,
  createSessionToken,
  isAdminConfigured,
  isAdminRequest,
  sessionCookieOptions,
} from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ authenticated: await isAdminRequest() });
}

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { success: false, error: "Admin login is not configured. Set ADMIN_PASSWORD in the hosting environment." },
      { status: 503 },
    );
  }

  // Slows down password guessing
  const limited = await limitByIp(request, "admin-login", 10, 900);
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  if (!checkAdminPassword(body.password)) {
    return NextResponse.json({ success: false, error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
