import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const table = await prisma.leagueTable.findMany({
    include: { team: true, competition: true },
    orderBy: { position: "asc" }
  });
  const competitions = await prisma.competition.findMany({ include: { teams: true } });
  const teams = await prisma.team.findMany();
  
  return NextResponse.json({ table, competitions, teams });
}

export async function POST(request: Request) {
  try {
    const { rows } = await request.json();
    
    const updates = rows.map((r: any) => {
      const data = {
        position: r.position,
        played: r.played,
        wins: r.wins,
        draws: r.draws,
        losses: r.losses,
        goalsFor: r.goalsFor,
        goalsAgainst: r.goalsAgainst,
        points: r.points
      };
      
      if (r.id && !r.id.startsWith("new-")) {
        return prisma.leagueTable.update({ where: { id: r.id }, data });
      } else {
        return prisma.leagueTable.create({
          data: {
            ...data,
            competitionId: r.competitionId,
            teamId: r.teamId
          }
        });
      }
    });
    
    await prisma.$transaction(updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 });
  }
}
