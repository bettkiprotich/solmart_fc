import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/security/password";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { loginSchema } from "@/lib/validation/api";
import { assertSameOrigin, getClientKey } from "@/lib/http/request";
import { jsonError } from "@/lib/http/response";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const limit = checkRateLimit(`login:${getClientKey(request)}`, 10);
  if (!limit.allowed) return jsonError("Too many login attempts. Try again later.", 429);

  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Invalid login details.", 422, parsed.error.flatten());

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
    if (!valid) return jsonError("Invalid email or password.", 401);

    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
  } catch {
    return jsonError("Unable to sign in.", 500);
  }
}
