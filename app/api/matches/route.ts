import { NextResponse } from "next/server";
import { z } from "zod";
import { listMatches } from "@/lib/services/football";
import { requireRole } from "@/lib/auth/authorization";
import { assertSameOrigin } from "@/lib/http/request";
import { jsonError } from "@/lib/http/response";

const matchSchema = z.object({
  competitionId: z.string().cuid().nullable().optional(),
  homeTeamId: z.string().cuid(),
  awayTeamId: z.string().cuid(),
  kickoffAt: z.coerce.date(),
  venue: z.string().max(200).nullable().optional(),
  status: z.enum(["SCHEDULED", "POSTPONED", "CANCELLED", "COMPLETED"]).optional(),
  homeScore: z.number().int().min(0).nullable().optional(),
  awayScore: z.number().int().min(0).nullable().optional(),
  attendance: z.number().int().min(0).nullable().optional(),
  matchReport: z.string().max(10000).nullable().optional(),
  isDemoData: z.boolean().optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") as "SCHEDULED" | "POSTPONED" | "CANCELLED" | "COMPLETED" | null;
  const matches = await listMatches(status || undefined);
  return NextResponse.json({ matches });
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const admin = await requireRole("ADMIN");
  if (!admin) return jsonError("Administrator access required.", 403);
  const parsed = matchSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid match data.", 422, parsed.error.flatten());
  if (parsed.data.homeTeamId === parsed.data.awayTeamId) return jsonError("Home and away teams must be different.", 422);
  try {
    const match = await prisma.fixture.create({ data: parsed.data, include: { homeTeam: true, awayTeam: true, competition: true } });
    return NextResponse.json({ match }, { status: 201 });
  } catch {
    return jsonError("Unable to create match.", 409);
  }
}
