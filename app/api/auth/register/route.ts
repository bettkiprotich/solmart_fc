import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/security/password";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { registerSchema } from "@/lib/validation/api";
import { assertSameOrigin, getClientKey } from "@/lib/http/request";
import { jsonError } from "@/lib/http/response";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const limit = checkRateLimit(`register:${getClientKey(request)}`, 5);
  if (!limit.allowed) return jsonError("Too many registration attempts. Try again later.", 429);

  try {
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Invalid registration details.", 422, parsed.error.flatten());

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) return jsonError("Unable to create account with those details.", 409);

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
      },
    });

    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } }, { status: 201 });
  } catch {
    return jsonError("Unable to create account.", 500);
  }
}
