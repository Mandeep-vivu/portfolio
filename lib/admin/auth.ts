import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "mandeep_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;

function secret() {
  return process.env.AUTH_SECRET || "";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
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
    safeEqual(email.toLowerCase(), configuredEmail.toLowerCase()) &&
    safeEqual(password, configuredPassword)
  );
}

export async function createAdminSession(email: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = Buffer.from(
    JSON.stringify({ email, expiresAt }),
  ).toString("base64url");
  const value = `${payload}.${sign(payload)}`;
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
  if (!adminAuthConfigured()) return false;
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return false;

  const [payload, signature] = value.split(".");
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return false;

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { email?: string; expiresAt?: number };
    return Boolean(
      session.email === process.env.ADMIN_EMAIL &&
        session.expiresAt &&
        session.expiresAt > Math.floor(Date.now() / 1000),
    );
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  if (!(await verifyAdminSession())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
