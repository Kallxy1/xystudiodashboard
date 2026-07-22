import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createSessionToken, isAllowedEmail, setSessionCookie } from "@/lib/auth";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function hashPasscode(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || "";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { email, passcode } = await request.json();
    const normalized = String(email || "").trim().toLowerCase();
    const expected = process.env.ADMIN_LOGIN_PASSCODE || "";
    if (!isAllowedEmail(normalized)) return NextResponse.json({ error: "Email is not allowed" }, { status: 403 });
    if (!expected || expected.length < 12) return NextResponse.json({ error: "ADMIN_LOGIN_PASSCODE is not configured" }, { status: 500 });
    if (!passcode || !safeEqual(hashPasscode(String(passcode)), hashPasscode(expected))) return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
    await setSessionCookie(createSessionToken(normalized));
    return NextResponse.json({ ok: true, email: normalized });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Login failed" }, { status: 500 });
  }
}
