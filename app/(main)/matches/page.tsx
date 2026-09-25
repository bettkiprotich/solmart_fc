import { prisma } from "@/lib/db/prisma";
import { MatchesCalendar } from "@/components/matches/MatchesCalendar";

export const metadata = {
  title: "Matches & Fixtures | Solmart FC",
};

export default async function MatchesPage() {
  const fixtures = await prisma.fixture.findMany({
    include: {
      homeTeam: true,
      awayTeam: true,
      competition: true,
    },
    orderBy: { kickoffAt: "asc" },
  });

  return (
    <div className="bg-zinc-50 min-h-screen py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">Fixtures & Results</h1>
        <p className="mt-4 text-lg text-black/60 max-w-2xl">
          View our upcoming schedule, training sessions, and past match results. Click on any match to view the full match centre.
        </p>
        
        <div className="mt-8">
          <MatchesCalendar initialFixtures={fixtures} />
        </div>
      </div>
    </div>
  );
}
