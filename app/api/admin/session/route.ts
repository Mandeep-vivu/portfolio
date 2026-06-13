import { z } from "zod";
import {
  adminAuthConfigured,
  clearAdminSession,
  createAdminSession,
  verifyAdminCredentials,
  verifyAdminSession,
} from "@/lib/admin/auth";
import { rateLimit, requestIdentity } from "@/lib/security/rate-limit";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(200),
});

export async function GET() {
  return Response.json({
    authenticated: await verifyAdminSession(),
    configured: adminAuthConfigured(),
  });
}

export async function POST(request: Request) {
  const limit = rateLimit(`admin-login:${requestIdentity(request)}`, 5, 300_000);
  if (!limit.allowed) {
    return Response.json({ error: "Too many login attempts." }, { status: 429 });
  }

  const parsed = loginSchema.safeParse(await request.json());
  if (
    !parsed.success ||
    !verifyAdminCredentials(parsed.data.email, parsed.data.password)
  ) {
    return Response.json({ error: "Invalid credentials." }, { status: 401 });
  }

  await createAdminSession(parsed.data.email);
  return Response.json({ authenticated: true });
}

export async function DELETE() {
  await clearAdminSession();
  return Response.json({ authenticated: false });
}
