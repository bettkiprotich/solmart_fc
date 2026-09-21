import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/authorization";
import { assertSameOrigin } from "@/lib/http/request";
import { jsonError } from "@/lib/http/response";
import { z } from "zod";

const statusSchema = z.object({ status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "SPAM"]) });

export async function GET() {
  const admin = await requireRole("ADMIN");
  if (!admin) return jsonError("Administrator access required.", 403);
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ messages });
}

export async function PATCH(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const admin = await requireRole("ADMIN");
  if (!admin) return jsonError("Administrator access required.", 403);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return jsonError("Message id is required.", 422);
  const parsed = statusSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid message status.", 422);
  const message = await prisma.contactMessage.update({ where: { id }, data: { status: parsed.data.status } });
  return NextResponse.json({ message });
}
