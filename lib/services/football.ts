import { prisma } from "@/lib/db/prisma";

export async function listActivePlayers(args: { teamId?: string; position?: "GOALKEEPER" | "DEFENDER" | "MIDFIELDER" | "FORWARD" } = {}) {
  return prisma.player.findMany({
    where: { isActive: true, ...(args.teamId ? { teamId: args.teamId } : {}), ...(args.position ? { position: args.position } : {}) },
    include: { team: true, statistics: { orderBy: { season: "desc" }, take: 1 } },
    orderBy: [{ position: "asc" }, { squadNumber: "asc" }, { lastName: "asc" }],
  });
}

export async function listMatches(status?: "SCHEDULED" | "POSTPONED" | "CANCELLED" | "COMPLETED") {
  return prisma.fixture.findMany({
    where: status ? { status } : undefined,
    include: { homeTeam: true, awayTeam: true, competition: true, events: { include: { player: true }, orderBy: { minute: "asc" } } },
    orderBy: { kickoffAt: "asc" },
    take: 100,
  });
}
