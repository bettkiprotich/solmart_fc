import { NextResponse } from "next/server";
import { listActivePlayers } from "@/lib/services/football";
import { requireRole } from "@/lib/auth/authorization";
import { playerSchema } from "@/lib/validation/api";
import { assertSameOrigin } from "@/lib/http/request";
import { jsonError } from "@/lib/http/response";
import { prisma } from "@/lib/db/prisma";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const teamId = url.searchParams.get("teamId") || undefined;
  const position = url.searchParams.get("position") as "GOALKEEPER" | "DEFENDER" | "MIDFIELDER" | "FORWARD" | null;
  const players = await listActivePlayers({ teamId, position: position || undefined });
  return NextResponse.json({ players });
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const admin = await requireRole("ADMIN");
  if (!admin) return jsonError("Administrator access required.", 403);
  const parsed = playerSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid player data.", 422, parsed.error.flatten());
  try {
    const player = await prisma.player.create({ data: parsed.data });
    return NextResponse.json({ player }, { status: 201 });
  } catch {
    return jsonError("Unable to create player. Check for duplicate slug or invalid references.", 409);
  }
}
