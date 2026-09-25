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
        include: { competition: true }
      }
    }
  });

  if (!team) return notFound();

  return <TeamHub team={team as any} />;
}
