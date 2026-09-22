import { prisma } from "@/lib/db/prisma";
import { jsonError } from "@/lib/http/response";
import { assertSameOrigin } from "@/lib/http/request";
import { createHash } from "crypto";
import { hashPassword } from "@/lib/security/password";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const { token, password } = body;
  if (!token || typeof token !== "string") {
    return jsonError("Token is required.", 400);
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return jsonError("Password must be at least 8 characters long.", 400);
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return jsonError("Invalid or expired password reset token.", 400);
  }

  const passwordHash = await hashPassword(password);

  // Update password and delete all reset tokens for this user
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    }),
    // Optionally delete all active sessions to force re-login everywhere
    prisma.session.deleteMany({
      where: { userId: resetToken.userId },
    }),
  ]);

  return Response.json({ message: "Password has been successfully reset." });
}
