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
    
    await prisma.competition.create({
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
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create tournament" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, season, isLeague, showOnHomepage, showOnTeamPage, teamIds } = await request.json();
    
    // First, disconnect all teams, then connect the new ones
    // Or just use set
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
