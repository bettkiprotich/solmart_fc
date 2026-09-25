"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Team, TeamOfficial, Player, Fixture, LeagueTable, PlayerSeasonStatistic } from "@prisma/client";

type TeamData = Team & {
  officials: TeamOfficial[];
  players: (Player & { statistics: PlayerSeasonStatistic[] })[];
  homeMatches: (Fixture & { awayTeam: Team; competition: any })[];
  awayMatches: (Fixture & { homeTeam: Team; competition: any })[];
  tableRows: (LeagueTable & { competition: any })[];
};

export function TeamHub({ team }: { team: TeamData }) {
  const [tab, setTab] = useState<"OVERVIEW" | "MATCHES" | "TABLE" | "SQUAD" | "STATS">("OVERVIEW");
  const [season, setSeason] = useState("2025/26");

  const tabs = ["OVERVIEW", "MATCHES", "TABLE", "SQUAD", "STATS"] as const;

  const matches = [...team.homeMatches, ...team.awayMatches]
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());
    
  const upcomingMatches = matches.filter(m => new Date(m.kickoffAt) >= new Date() && m.type !== "TRAINING").slice(0, 3);
  const recentMatches = matches.filter(m => new Date(m.kickoffAt) < new Date() && m.type !== "TRAINING").reverse().slice(0, 3);

  // Stats calculation for the chosen season
  const playerStats = team.players.map(p => ({
    player: p,
    stats: p.statistics.find(s => s.season === season) || {
      appearances: 0, subOn: 0, subOff: 0, goals: 0, penalties: 0, penaltiesMissed: 0,
      assists: 0, ownGoals: 0, yellowCards: 0, redCards: 0, cleanSheets: 0
    }
  })).sort((a, b) => b.stats.appearances - a.stats.appearances);
  
  const topScorers = [...playerStats].sort((a, b) => b.stats.goals - a.stats.goals).slice(0, 3);
  const topAssists = [...playerStats].sort((a, b) => b.stats.assists - a.stats.assists).slice(0, 3);

  return (
    <div>
      {/* Cover & Header */}
      <div className="relative h-64 md:h-96 w-full bg-zinc-900 overflow-hidden">
        {team.coverPhotoUrl && (
          <Image src={team.coverPhotoUrl} alt={team.name} fill className="object-cover opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 flex items-end gap-6">
            {team.logoUrl ? (
              <div className="h-24 w-24 md:h-40 md:w-40 rounded-full bg-white p-4 shadow-xl shrink-0">
                <Image src={team.logoUrl} alt={team.name} width={150} height={150} className="object-contain h-full w-full" />
              </div>
            ) : (
              <div className="h-24 w-24 md:h-40 md:w-40 rounded-full bg-white/20 shrink-0" />
            )}
            <div className="pb-2 md:pb-6">
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight shadow-black drop-shadow-md">{team.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 overflow-x-auto hide-scrollbar">
          <div className="flex gap-8">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-4 transition-colors ${tab === t ? "border-red-600 text-red-600" : "border-transparent text-black/60 hover:text-black"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        
        {/* OVERVIEW TAB */}
        {tab === "OVERVIEW" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {team.blurb && (
                <div className="prose prose-sm md:prose-base max-w-none text-black/70">
                  {team.blurb.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
              )}
              
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                <h3 className="text-xl font-black uppercase mb-4 border-b pb-4">Recent Results</h3>
                <div className="space-y-3">
                  {recentMatches.length === 0 ? <p className="text-sm text-black/50">No recent matches.</p> : recentMatches.map(m => (
                    <Link href={`/matches/${m.id}`} key={m.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-zinc-50 transition-colors">
                      <div className="flex-1 flex justify-end items-center gap-2 font-bold text-sm">
                        <span>{m.homeTeamId === team.id ? team.shortName || team.name : m.homeTeam.shortName || m.homeTeam.name}</span>
                        {m.homeTeamId === team.id ? (team.logoUrl && <Image src={team.logoUrl} alt="" width={20} height={20}/>) : (m.homeTeam.logoUrl && <Image src={m.homeTeam.logoUrl} alt="" width={20} height={20}/>)}
                      </div>
                      <div className="mx-4 font-mono font-black bg-black text-white px-3 py-1 rounded-lg text-lg">
                        {m.homeScore} - {m.awayScore}
                      </div>
                      <div className="flex-1 flex items-center gap-2 font-bold text-sm">
                        {m.awayTeamId === team.id ? (team.logoUrl && <Image src={team.logoUrl} alt="" width={20} height={20}/>) : (m.awayTeam.logoUrl && <Image src={m.awayTeam.logoUrl} alt="" width={20} height={20}/>)}
                        <span>{m.awayTeamId === team.id ? team.shortName || team.name : m.awayTeam.shortName || m.awayTeam.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {team.officials.length > 0 && (
                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                  <h3 className="text-sm text-black/50 font-black uppercase tracking-widest mb-4">Team Officials</h3>
                  <div className="space-y-4">
                    {team.officials.map(o => (
                      <div key={o.id} className="flex items-center gap-4">
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-zinc-100 flex items-center justify-center">
                           {o.photoUrl ? <Image src={o.photoUrl} alt={o.name} width={48} height={48} className="object-cover h-full w-full" /> : <span className="text-black/30 font-bold text-xl">{o.name[0]}</span>}
                        </div>
                        <div>
                          <div className="font-bold">{o.name}</div>
                          <div className="text-xs font-bold text-black/50 uppercase tracking-wider">{o.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                <h3 className="text-sm text-black/50 font-black uppercase tracking-widest mb-4">Upcoming Matches</h3>
                <div className="space-y-3">
                  {upcomingMatches.length === 0 ? <p className="text-sm text-black/50">No upcoming matches scheduled.</p> : upcomingMatches.map(m => (
                     <div key={m.id} className="text-sm border-b pb-3 last:border-0 last:pb-0">
                       <div className="font-bold">{m.homeTeamId === team.id ? team.name : m.homeTeam.name} vs {m.awayTeamId === team.id ? team.name : m.awayTeam.name}</div>
                       <div className="text-black/50 mt-1">{new Date(m.kickoffAt).toLocaleString()}</div>
                     </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATS TAB */}
        {tab === "STATS" && (
          <div className="space-y-8">
            <div className="flex justify-end">
              <select className="border border-black/10 rounded-lg px-4 py-2 font-bold bg-white" value={season} onChange={e => setSeason(e.target.value)}>
                <option value="2025/26">2025/26 season</option>
                <option value="2024/25">2024/25 season</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Appearances */}
               <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
                 <div className="p-4 text-center font-black uppercase tracking-widest text-sm border-b">Appearances</div>
                 {playerStats.slice(0, 3).map((ps, i) => (
                   <div key={ps.player.id} className={`flex items-center gap-4 p-4 border-b last:border-0 ${i === 0 ? 'bg-red-900 text-white' : ''}`}>
                     <div className="font-black text-xl w-6 opacity-50">{i + 1}</div>
                     {ps.player.photoUrl ? (
                       <Image src={ps.player.photoUrl} alt="" width={40} height={40} className="rounded-full bg-white/10" />
                     ) : <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />}
                     <div className="flex-1">
                       <div className="font-bold text-sm leading-tight">{ps.player.firstName} <br/>{ps.player.lastName}</div>
                       <div className="text-[10px] uppercase opacity-70 mt-1">{ps.player.position}</div>
                     </div>
                     <div className="font-black text-2xl">{ps.stats.appearances}</div>
                   </div>
                 ))}
               </div>

               {/* Top Scorers */}
               <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
                 <div className="p-4 text-center font-black uppercase tracking-widest text-sm border-b">Top Scorers</div>
                 {topScorers.map((ps, i) => (
                   <div key={ps.player.id} className={`flex items-center gap-4 p-4 border-b last:border-0 ${i === 0 ? 'bg-red-900 text-white' : ''}`}>
                     <div className="font-black text-xl w-6 opacity-50">{i + 1}</div>
                     {ps.player.photoUrl ? (
                       <Image src={ps.player.photoUrl} alt="" width={40} height={40} className="rounded-full bg-white/10" />
                     ) : <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />}
                     <div className="flex-1">
                       <div className="font-bold text-sm leading-tight">{ps.player.firstName} <br/>{ps.player.lastName}</div>
                       <div className="text-[10px] uppercase opacity-70 mt-1">{ps.player.position}</div>
                     </div>
                     <div className="font-black text-2xl">{ps.stats.goals}</div>
                   </div>
                 ))}
               </div>

               {/* Assists */}
               <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
                 <div className="p-4 text-center font-black uppercase tracking-widest text-sm border-b">Assists</div>
                 {topAssists.map((ps, i) => (
                   <div key={ps.player.id} className={`flex items-center gap-4 p-4 border-b last:border-0 ${i === 0 ? 'bg-red-900 text-white' : ''}`}>
                     <div className="font-black text-xl w-6 opacity-50">{i + 1}</div>
                     {ps.player.photoUrl ? (
                       <Image src={ps.player.photoUrl} alt="" width={40} height={40} className="rounded-full bg-white/10" />
                     ) : <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />}
                     <div className="flex-1">
                       <div className="font-bold text-sm leading-tight">{ps.player.firstName} <br/>{ps.player.lastName}</div>
                       <div className="text-[10px] uppercase opacity-70 mt-1">{ps.player.position}</div>
                     </div>
                     <div className="font-black text-2xl">{ps.stats.assists}</div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Full Stats Table */}
            <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden mt-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-zinc-50 border-b">
                    <tr className="text-black/50 text-[10px] uppercase tracking-widest font-black">
                      <th className="px-6 py-4">Player</th>
                      <th className="px-4 py-4 text-center">A</th>
                      <th className="px-4 py-4 text-center">ON</th>
                      <th className="px-4 py-4 text-center">Off</th>
                      <th className="px-4 py-4 text-center">G</th>
                      <th className="px-4 py-4 text-center">P</th>
                      <th className="px-4 py-4 text-center">PM</th>
                      <th className="px-4 py-4 text-center">Ass</th>
                      <th className="px-4 py-4 text-center">OG</th>
                      <th className="px-4 py-4 text-center">YC</th>
                      <th className="px-4 py-4 text-center">RC</th>
                      <th className="px-4 py-4 text-center">CS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {playerStats.map(({ player, stats }) => (
                      <tr key={player.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="font-bold">{player.firstName} {player.lastName}</div>
                          <div className="text-xs text-black/50">{player.position.replace('_', ' ')}</div>
                        </td>
                        <td className="px-4 py-3 text-center">{stats.appearances}</td>
                        <td className="px-4 py-3 text-center text-black/50">{stats.subOn}</td>
                        <td className="px-4 py-3 text-center text-black/50">{stats.subOff}</td>
                        <td className="px-4 py-3 text-center font-bold">{stats.goals}</td>
                        <td className="px-4 py-3 text-center text-black/50">{stats.penalties}</td>
                        <td className="px-4 py-3 text-center text-black/50">{stats.penaltiesMissed}</td>
                        <td className="px-4 py-3 text-center font-bold">{stats.assists}</td>
                        <td className="px-4 py-3 text-center text-black/50">{stats.ownGoals}</td>
                        <td className="px-4 py-3 text-center text-black/50">{stats.yellowCards}</td>
                        <td className="px-4 py-3 text-center text-black/50">{stats.redCards}</td>
                        <td className="px-4 py-3 text-center text-black/50">{stats.cleanSheets}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>


        {/* SQUAD TAB */}
        {tab === "SQUAD" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {team.players.map((p) => (
              <Link href={`/team/${p.slug}`} key={p.id} className="group relative block overflow-hidden rounded-3xl bg-zinc-100 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-[3/4] w-full bg-zinc-200">
                  {p.photoUrl && <Image src={p.photoUrl} alt="" fill className="object-cover object-top transition-transform duration-500 group-hover:scale-105" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 w-full p-4 md:p-6">
                  {p.squadNumber !== null && <div className="mb-2 text-2xl font-black text-white/50">{p.squadNumber}</div>}
                  <h3 className="text-lg md:text-xl font-black uppercase text-white tracking-tight leading-tight">{p.firstName} <br/>{p.lastName}</h3>
                  <div className="mt-1 text-xs font-bold uppercase tracking-widest text-red-400">{p.position.replace('_', ' ')}</div>
                </div>
              </Link>
            ))}
            {team.players.length === 0 && <p className="col-span-full text-black/50">No players assigned to this squad.</p>}
          </div>
        )}

        {/* MATCHES TAB */}
        {tab === "MATCHES" && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {matches.filter(m => m.type === "MATCH").length === 0 ? <p className="text-black/50">No matches scheduled.</p> : matches.filter(m => m.type === "MATCH").map(m => (
              <Link href={`/matches/${m.id}`} key={m.id} className="block rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 hover:bg-zinc-50 transition-colors">
                <div className="text-xs font-bold tracking-widest text-black/40 uppercase mb-4 text-center">
                  {new Date(m.kickoffAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  <span className="mx-2">·</span>
                  {m.competition?.name || "Friendly"}
                </div>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex-1 flex justify-end items-center gap-4 text-sm md:text-xl font-black">
                    <span className="hidden md:inline">{m.homeTeamId === team.id ? team.name : m.homeTeam.name}</span>
                    <span className="md:hidden">{m.homeTeamId === team.id ? team.shortName || team.name : m.homeTeam.shortName || m.homeTeam.name}</span>
                    {m.homeTeamId === team.id ? (team.logoUrl && <Image src={team.logoUrl} alt="" width={40} height={40}/>) : (m.homeTeam.logoUrl && <Image src={m.homeTeam.logoUrl} alt="" width={40} height={40}/>)}
                  </div>
                  
                  {m.status === "COMPLETED" ? (
                    <div className="font-mono font-black bg-black text-white px-4 py-2 rounded-xl text-2xl tracking-widest">
                      {m.homeScore}-{m.awayScore}
                    </div>
                  ) : (
                    <div className="font-mono font-black bg-black/5 text-black px-4 py-2 rounded-xl text-xl">
                      {new Date(m.kickoffAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}

                  <div className="flex-1 flex items-center gap-4 text-sm md:text-xl font-black">
                    {m.awayTeamId === team.id ? (team.logoUrl && <Image src={team.logoUrl} alt="" width={40} height={40}/>) : (m.awayTeam.logoUrl && <Image src={m.awayTeam.logoUrl} alt="" width={40} height={40}/>)}
                    <span className="hidden md:inline">{m.awayTeamId === team.id ? team.name : m.awayTeam.name}</span>
                    <span className="md:hidden">{m.awayTeamId === team.id ? team.shortName || team.name : m.awayTeam.shortName || m.awayTeam.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* TABLE TAB */}
        {tab === "TABLE" && (
          <div className="max-w-4xl mx-auto rounded-3xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
             {team.tableRows.length === 0 ? <div className="p-8 text-black/50">No table data available.</div> : (
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-zinc-50 border-b">
                      <tr className="text-black/50 text-xs uppercase tracking-widest font-black">
                        <th className="px-6 py-4 w-12">Pos</th>
                        <th className="px-4 py-4">Club</th>
                        <th className="px-4 py-4 text-center">Pl</th>
                        <th className="px-4 py-4 text-center">W</th>
                        <th className="px-4 py-4 text-center">D</th>
                        <th className="px-4 py-4 text-center">L</th>
                        <th className="px-4 py-4 text-center">GD</th>
                        <th className="px-4 py-4 text-center">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm font-medium">
                      {team.tableRows.map(r => (
                        <tr key={r.id} className="bg-red-50/50">
                          <td className="px-6 py-4 font-black">{r.position}</td>
                          <td className="px-4 py-4 font-bold">{team.name}</td>
                          <td className="px-4 py-4 text-center">{r.played}</td>
                          <td className="px-4 py-4 text-center">{r.wins}</td>
                          <td className="px-4 py-4 text-center">{r.draws}</td>
                          <td className="px-4 py-4 text-center">{r.losses}</td>
                          <td className="px-4 py-4 text-center">{r.goalsFor - r.goalsAgainst}</td>
                          <td className="px-4 py-4 text-center font-black text-lg">{r.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
}
