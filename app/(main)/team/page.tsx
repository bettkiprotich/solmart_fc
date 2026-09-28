import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { TeamHub } from "@/components/teams/TeamHub";

export const metadata = {
  title: "Team | Solmart FC",
};

export default async function TeamPage() {
  let team = await prisma.team.findFirst({
    where: { isActive: true, name: { contains: "Solmart", mode: "insensitive" } },
    include: {
      officials: true,
      players: {
        where: { isActive: true },
        include: { statistics: true },
        orderBy: { squadNumber: "asc" }
      },
      homeMatches: {
        include: { awayTeam: true, competition: true },
      },
      awayMatches: {
        include: { homeTeam: true, competition: true },
      },
      tableRows: {
        where: { competition: { showOnTeamPage: true } },
        include: { competition: true }
      }
    }
  });

  if (!team) {
    team = await prisma.team.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        officials: true,
        players: {
          where: { isActive: true },
          include: { statistics: true },
          orderBy: { squadNumber: "asc" }
        },
        homeMatches: {
          include: { awayTeam: true, competition: true },
        },
        awayMatches: {
          include: { homeTeam: true, competition: true },
        },
        tableRows: {
          where: { competition: { showOnTeamPage: true } },
          include: { competition: true }
        }
      }
    });
  }

  if (!team) return notFound();

  let fullTable: any[] = [];
  
  // Find the competition that is meant to be shown on the team page
  const featuredComp = await prisma.competition.findFirst({
    where: { showOnTeamPage: true }
  });
  
  if (featuredComp) {
    fullTable = await prisma.leagueTable.findMany({
      where: { competitionId: featuredComp.id },
      include: { team: true, competition: true },
      orderBy: { position: "asc" }
    });
  } else if (team.tableRows.length > 0) {
    // Fallback if none explicitly marked but team has rows
    fullTable = await prisma.leagueTable.findMany({
      where: { competitionId: team.tableRows[0].competitionId },
      include: { team: true, competition: true },
      orderBy: { position: "asc" }
    });
  }

  const serverTime = Date.now();

  return <TeamHub team={team as any} fullTable={fullTable} serverTime={serverTime} />;
}
