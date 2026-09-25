"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Fixture, Team, Competition } from "@prisma/client";

type FixtureWithRelations = Fixture & { homeTeam: Team; awayTeam: Team; competition: Competition | null };

export function MatchesCalendar({ initialFixtures }: { initialFixtures: FixtureWithRelations[] }) {
  const [currentDate, setCurrentDate] = useState(() => {
    // Default to the month of the first upcoming match, or today
    const upcoming = initialFixtures.find(f => new Date(f.kickoffAt) >= new Date());
    return upcoming ? new Date(upcoming.kickoffAt) : new Date();
  });
  
  const [filterType, setFilterType] = useState<"ALL" | "MATCH" | "TRAINING">("ALL");

  // Get days in current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Padding for the grid
  const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Start week on Monday
  const daysInMonth = lastDay.getDate();
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Filter fixtures for this month
  const monthFixtures = initialFixtures.filter(f => {
    const d = new Date(f.kickoffAt);
    return d.getMonth() === month && d.getFullYear() === year;
  }).filter(f => filterType === "ALL" || f.type === filterType);

  // Group by day
  const fixturesByDay: Record<number, FixtureWithRelations[]> = {};
  monthFixtures.forEach(f => {
    const d = new Date(f.kickoffAt).getDate();
    if (!fixturesByDay[d]) fixturesByDay[d] = [];
    fixturesByDay[d].push(f);
  });

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="rounded-full p-2 hover:bg-black/5">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="w-40 text-center text-xl font-black uppercase md:text-2xl">{monthNames[month]} {year}</h2>
          <button onClick={nextMonth} className="rounded-full p-2 hover:bg-black/5">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        
        <div className="flex rounded-lg bg-zinc-100 p-1">
          {["ALL", "MATCH", "TRAINING"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t as any)}
              className={`rounded-md px-4 py-2 text-xs font-bold transition-colors ${filterType === t ? "bg-white text-black shadow-sm" : "text-black/50 hover:text-black"}`}
            >
              {t === "ALL" ? "All" : t === "MATCH" ? "Matches" : "Training"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-7 gap-[1px] bg-zinc-200">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
          <div key={d} className="bg-white py-3 text-center text-xs font-bold uppercase tracking-wider text-black/50">{d}</div>
        ))}
        
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} className="min-h-[120px] bg-white/50" />
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayFixtures = fixturesByDay[day] || [];
          const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
          
          return (
            <div key={day} className={`min-h-[120px] bg-white p-2 transition-colors hover:bg-zinc-50 md:p-3 ${isToday ? "bg-red-50 hover:bg-red-50" : ""}`}>
              <div className={`mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${isToday ? "bg-red-600 text-white" : "text-black/70"}`}>
                {day}
              </div>
              <div className="space-y-2">
                {dayFixtures.map(f => (
                  <Link href={`/matches/${f.id}`} key={f.id} className={`block rounded-lg border p-2 text-xs transition-colors hover:border-black/20 ${f.type === 'TRAINING' ? 'bg-amber-50 border-amber-100' : ''}`}>
                    <div className="mb-1 font-bold text-[10px] text-black/40">
                      {new Date(f.kickoffAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {f.type === "TRAINING" ? " · Training" : ` · ${f.competition?.name || "Friendly"}`}
                    </div>
                    {f.type === "MATCH" ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-bold truncate">
                          {f.homeTeam.logoUrl && <Image src={f.homeTeam.logoUrl} alt="" width={16} height={16} className="h-4 w-4 object-contain" />}
                          <span className="truncate">{f.homeTeam.shortName || f.homeTeam.name}</span>
                        </div>
                        {f.status === "COMPLETED" ? <span className="font-mono bg-black text-white px-1.5 rounded">{f.homeScore}</span> : <span className="text-black/30 text-[10px]">vs</span>}
                        {f.status === "COMPLETED" ? <span className="font-mono bg-black text-white px-1.5 rounded">{f.awayScore}</span> : null}
                        <div className="flex items-center gap-1.5 font-bold truncate flex-row-reverse">
                          {f.awayTeam.logoUrl && <Image src={f.awayTeam.logoUrl} alt="" width={16} height={16} className="h-4 w-4 object-contain" />}
                          <span className="truncate">{f.awayTeam.shortName || f.awayTeam.name}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="font-bold">{f.venue || "Training Ground"}</div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
