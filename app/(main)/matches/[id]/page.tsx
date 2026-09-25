import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function MatchCentrePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await prisma.fixture.findUnique({
    where: { id },
    include: {
      homeTeam: true,
      awayTeam: true,
      competition: true,
      events: {
        include: { player: true },
        orderBy: { minute: "asc" }
      }
    }
  });

  if (!match) return notFound();

  const isTraining = match.type === "TRAINING";
  const date = new Date(match.kickoffAt);

  return (
    <div className="bg-zinc-50 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-black text-white py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="text-sm font-bold tracking-widest text-white/50 uppercase mb-8">
            {isTraining ? "Training Session" : match.competition?.name || "Friendly Match"}
            <span className="mx-2">·</span>
            {date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            <span className="mx-2">·</span>
            {match.venue || "Venue TBD"}
          </div>

          <div className="flex items-center justify-center gap-6 md:gap-16">
            <div className="flex flex-col items-center gap-4 flex-1">
              {match.homeTeam.logoUrl ? (
                <div className="h-20 w-20 md:h-32 md:w-32 rounded-full bg-white flex items-center justify-center p-4">
                  <Image src={match.homeTeam.logoUrl} alt={match.homeTeam.name} width={100} height={100} className="object-contain" />
                </div>
              ) : (
                <div className="h-20 w-20 md:h-32 md:w-32 rounded-full bg-white/10" />
              )}
              <h2 className="text-xl md:text-3xl font-black">{match.homeTeam.name}</h2>
            </div>

            <div className="flex flex-col items-center gap-2">
              {match.status === "COMPLETED" ? (
                <div className="flex items-center gap-4 font-mono text-5xl md:text-7xl font-black bg-white/10 px-6 py-4 rounded-3xl">
                  <span>{match.homeScore}</span>
                  <span className="text-white/30 text-3xl">-</span>
                  <span>{match.awayScore}</span>
                </div>
              ) : (
                <div className="text-3xl md:text-5xl font-black bg-white/10 px-8 py-4 rounded-3xl font-mono">
                  {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              <div className="mt-2 text-sm font-bold uppercase tracking-wider text-white/50">
                {match.status}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 flex-1">
              {match.awayTeam.logoUrl ? (
                <div className="h-20 w-20 md:h-32 md:w-32 rounded-full bg-white flex items-center justify-center p-4">
                  <Image src={match.awayTeam.logoUrl} alt={match.awayTeam.name} width={100} height={100} className="object-contain" />
                </div>
              ) : (
                <div className="h-20 w-20 md:h-32 md:w-32 rounded-full bg-white/10" />
              )}
              <h2 className="text-xl md:text-3xl font-black">{match.awayTeam.name}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          
          <div className="md:col-span-2 space-y-8">
            {match.matchReport && (
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
                <h3 className="text-xl font-black uppercase mb-4 border-b pb-4">Match Report</h3>
                <div className="prose prose-sm md:prose-base max-w-none text-black/70">
                  {match.matchReport.split('\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}
            
            {match.events.length > 0 && (
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
                <h3 className="text-xl font-black uppercase mb-4 border-b pb-4">Match Events</h3>
                <div className="space-y-4">
                  {match.events.map((e, i) => (
                    <div key={i} className="flex items-center gap-4 border-b pb-4 last:border-0">
                      <div className="font-mono text-lg font-bold w-12 text-black/40">{e.minute}'</div>
                      <div className="flex-1">
                        <div className="font-bold">{e.type.replace('_', ' ')}</div>
                        <div className="text-sm text-black/60">
                          {e.player ? <Link href={`/team/${e.player.slug}`} className="hover:underline">{e.player.firstName} {e.player.lastName}</Link> : ""} {e.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3 className="font-black uppercase mb-4 border-b pb-4 text-sm text-black/50">Match Info</h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-black/50 font-bold">Competition</dt>
                  <dd className="font-medium mt-1">{match.competition?.name || "None"}</dd>
                </div>
                <div>
                  <dt className="text-black/50 font-bold">Date & Time</dt>
                  <dd className="font-medium mt-1">{date.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-black/50 font-bold">Venue</dt>
                  <dd className="font-medium mt-1">{match.venue || "TBD"}</dd>
                </div>
                {match.attendance !== null && (
                  <div>
                    <dt className="text-black/50 font-bold">Attendance</dt>
                    <dd className="font-medium mt-1">{match.attendance.toLocaleString()}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
