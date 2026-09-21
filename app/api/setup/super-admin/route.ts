import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { assertSameOrigin } from "@/lib/http/request";
import { jsonError } from "@/lib/http/response";

const schema = z.object({
  demoPassword: z.string().min(1),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  confirmPassword: z.string().min(8).max(200),
}).refine((x) => x.password === x.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

export async function GET() {
  const realSuperAdmin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN", NOT: { email: "admin.demo@solmartfc.local" } }, select: { id: true } });
  return NextResponse.json({ available: !realSuperAdmin });
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const realSuperAdmin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN", NOT: { email: "admin.demo@solmartfc.local" } }, select: { id: true } });
  if (realSuperAdmin) return jsonError("Initial administrator setup is already complete.", 409);

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid administrator details.", 422, parsed.error.flatten());

  const demo = await prisma.user.findUnique({ where: { email: "admin.demo@solmartfc.local" } });
  if (!demo || !(await verifyPassword(parsed.data.demoPassword, demo.passwordHash))) {
    return jsonError("The demo administrator password is incorrect.", 401);
  }

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return jsonError("A user with that email already exists.", 409);

  const user = await prisma.user.create({
    data: {
      email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      passwordHash: await hashPassword(parsed.data.password),
      role: "SUPER_ADMIN",
    },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
