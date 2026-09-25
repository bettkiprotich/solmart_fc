import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { TeamHub } from "@/components/teams/TeamHub";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = await prisma.team.findUnique({ where: { slug } });
  return { title: team ? `${team.name} | Solmart FC` : "Team Not Found" };
}

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const team = await prisma.team.findUnique({
    where: { slug },
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

  if (!team) return notFound();

  let fullTable: any[] = [];
  if (team.tableRows.length > 0) {
    fullTable = await prisma.leagueTable.findMany({
      where: { competitionId: team.tableRows[0].competitionId },
      include: { team: true, competition: true },
      orderBy: { position: "asc" }
    });
  }

  return <TeamHub team={team as any} fullTable={fullTable} />;
}
