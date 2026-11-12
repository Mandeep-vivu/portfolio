import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "mandeep_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;

function secret() {
  return process.env.AUTH_SECRET || "";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

// Compare fixed-length digests so neither the content nor the length of the
// expected value leaks through timing.
function safeEqual(left: string, right: string) {
  const a = createHash("sha256").update(left).digest();
  const b = createHash("sha256").update(right).digest();
  return timingSafeEqual(a, b);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function adminAuthConfigured() {
  return Boolean(
    process.env.ADMIN_EMAIL &&
      process.env.ADMIN_PASSWORD &&
      secret().length >= 32,
  );
}

export function verifyAdminCredentials(email: string, password: string) {
  const configuredEmail = process.env.ADMIN_EMAIL ?? "";
  const configuredPassword = process.env.ADMIN_PASSWORD ?? "";
  return (
    adminAuthConfigured() &&
    safeEqual(normalizeEmail(email), normalizeEmail(configuredEmail)) &&
    safeEqual(password, configuredPassword)
  );
}

/** Builds the signed cookie value for an admin session. */
export function createSessionToken(email: string, now = Date.now()) {
  const expiresAt = Math.floor(now / 1000) + SESSION_SECONDS;
  const payload = Buffer.from(
    JSON.stringify({ email: normalizeEmail(email), expiresAt }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** Checks signature, owner and expiry of a session cookie value. */
export function verifySessionToken(value: string | undefined, now = Date.now()) {
  if (!adminAuthConfigured() || !value) return false;

  const [payload, signature, ...rest] = value.split(".");
  if (!payload || !signature || rest.length > 0) return false;
  if (!safeEqual(sign(payload), signature)) return false;

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { email?: unknown; expiresAt?: unknown };
    return (
      typeof session.email === "string" &&
      typeof session.expiresAt === "number" &&
      normalizeEmail(session.email) === normalizeEmail(process.env.ADMIN_EMAIL ?? "") &&
      session.expiresAt > Math.floor(now / 1000)
    );
  } catch {
    return false;
  }
}

export async function createAdminSession(email: string) {
  const value = createSessionToken(email);
  const store = await cookies();

  store.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function verifyAdminSession() {
  return verifySessionToken((await cookies()).get(COOKIE_NAME)?.value);
}

export async function requireAdmin() {
  if (!(await verifyAdminSession())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
