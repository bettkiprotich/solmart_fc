import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/authorization";
import { assertSameOrigin } from "@/lib/http/request";
import { jsonError } from "@/lib/http/response";
import { hashPassword } from "@/lib/security/password";

const schema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8),
  role: z.enum(["CUSTOMER", "ADMIN", "SUPER_ADMIN"]).default("CUSTOMER"),
});

export async function GET(request: Request) {
  const a = await requireRole("ADMIN");
  if (!a) return jsonError("Administrator access required.", 403);

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "100");
  const skip = (page - 1) * limit;

  const users = await prisma.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true, role: true, _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip,
  });

  const total = await prisma.user.count();

  return NextResponse.json({ users, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
}

export async function POST(request: Request) {
  const e = assertSameOrigin(request);
  if (e) return e;

  const a = await requireRole("SUPER_ADMIN");
  if (!a) return jsonError("Super administrator access required.", 403);

  const p = schema.safeParse(await request.json());
  if (!p.success) return jsonError("Invalid user data.", 422, p.error.flatten());

  const existing = await prisma.user.findUnique({ where: { email: p.data.email } });
  if (existing) return jsonError("Email is already registered.", 409);

  try {
    const passwordHash = await hashPassword(p.data.password);
    const user = await prisma.user.create({
      data: {
        firstName: p.data.firstName,
        lastName: p.data.lastName,
        email: p.data.email,
        passwordHash,
        role: p.data.role,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return jsonError("Unable to create user.", 409);
  }
}

export async function PATCH(request: Request) {
  const e = assertSameOrigin(request);
  if (e) return e;

  const a = await requireRole("SUPER_ADMIN");
  if (!a) return jsonError("Super administrator access required.", 403);

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return jsonError("User id is required.", 422);
  if (a.id === id) return jsonError("You cannot modify your own role.", 422);

  const body = await request.json();
  if (body.role && !["CUSTOMER", "ADMIN", "SUPER_ADMIN"].includes(body.role)) return jsonError("Invalid role.", 422);

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role: body.role },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    return NextResponse.json({ user });
  } catch {
    return jsonError("Unable to update user.", 409);
  }
}

export async function DELETE(request: Request) {
  const e = assertSameOrigin(request);
  if (e) return e;

  const a = await requireRole("SUPER_ADMIN");
  if (!a) return jsonError("Super administrator access required.", 403);

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return jsonError("User id is required.", 422);
  if (a.id === id) return jsonError("You cannot delete your own account.", 422);

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "User deleted." });
  } catch {
    return jsonError("Unable to delete user.", 409);
  }
}
