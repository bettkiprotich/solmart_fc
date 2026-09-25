import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const competitions = await prisma.competition.findMany({
    include: { teams: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ competitions });
}

export async function POST(request: Request) {
  try {
    const { name, season, isLeague, showOnHomepage, showOnTeamPage, teamIds } = await request.json();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    
    const comp = await prisma.competition.create({
      data: {
        name,
        slug,
        season,
        isLeague,
        showOnHomepage,
        showOnTeamPage,
        teams: {
          connect: teamIds.map((id: string) => ({ id }))
        }
      }
    });

    if (teamIds && teamIds.length > 0) {
      await prisma.leagueTable.createMany({
        data: teamIds.map((tid: string, i: number) => ({
          competitionId: comp.id,
          teamId: tid,
          position: i + 1,
          isDemoData: false
        }))
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create tournament" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, season, isLeague, showOnHomepage, showOnTeamPage, teamIds } = await request.json();
    
    await prisma.competition.update({
      where: { id },
      data: {
        name,
        season,
        isLeague,
        showOnHomepage,
        showOnTeamPage,
        teams: {
          set: teamIds.map((tid: string) => ({ id: tid }))
        }
      }
    });

    // Clean up removed teams from the league table
    await prisma.leagueTable.deleteMany({
      where: {
        competitionId: id,
        teamId: { notIn: teamIds }
      }
    });

    // Auto-create league table entries for new teams
    for (const tid of teamIds) {
      const existing = await prisma.leagueTable.findUnique({
        where: { competitionId_teamId: { competitionId: id, teamId: tid } }
      });
      if (!existing) {
        const maxPos = await prisma.leagueTable.aggregate({
          where: { competitionId: id },
          _max: { position: true }
        });
        await prisma.leagueTable.create({
          data: {
            competitionId: id,
            teamId: tid,
            position: (maxPos._max.position || 0) + 1,
            isDemoData: false
          }
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update tournament" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.competition.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete tournament" }, { status: 500 });
  }
}
