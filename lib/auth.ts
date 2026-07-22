import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export type AdminSession = { email: string; iat: number; exp: number };

const cookieName = "xys_admin_session";
const ttlMs = 12 * 60 * 60 * 1000;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 24) throw new Error("ADMIN_SESSION_SECRET must be set with at least 24 characters");
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function allowedEmails() {
  return (process.env.ADMIN_ALLOWED_EMAILS || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

export function isAllowedEmail(email: string) {
  return allowedEmails().includes(email.trim().toLowerCase());
}

export function createSessionToken(email: string) {
  const now = Date.now();
  const session: AdminSession = { email: email.trim().toLowerCase(), iat: now, exp: now + ttlMs };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  try {
    if (!safeEqual(signature, sign(payload))) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    if (Date.now() > session.exp) return null;
    if (!isAllowedEmail(session.email)) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getSession() {
  const store = await cookies();
  return verifySessionToken(store.get(cookieName)?.value);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(cookieName, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: Math.floor(ttlMs / 1000)
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(cookieName);
}
