import { prisma } from "@/lib/db/prisma";
import { jsonError } from "@/lib/http/response";
import { assertSameOrigin } from "@/lib/http/request";
import { randomBytes, createHash } from "crypto";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const { email } = body;
  if (!email || typeof email !== "string") {
    return jsonError("Email is required.", 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // For security, don't reveal if user exists, just pretend it succeeded
    return Response.json({ message: "If that email exists, a password reset link has been sent." });
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${appUrl}/reset-password?token=${token}`;

  // Log to console for demo environments
  console.log("=========================================");
  console.log("PASSWORD RESET LINK FOR:", user.email);
  console.log(resetLink);
  console.log("=========================================");

  return Response.json({ message: "If that email exists, a password reset link has been sent." });
}
