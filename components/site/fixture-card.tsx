function TeamLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-white p-2.5 shadow-lg ring-1 ring-black/10 sm:size-28 sm:p-3">
      <img
        src={src}
        alt={alt}
        className="block h-full w-full object-contain"
      />
    </div>
  );
}

function TeamName({ name }: { name: string }) {
  return (
    <p className="mx-auto mt-4 min-h-[3rem] max-w-[12rem] text-center text-base font-black leading-6 sm:max-w-[14rem] sm:text-lg">
      {name}
    </p>
  );
}

export function FixtureCard({ match }: { match: any }) {
  const date = new Date(match.kickoffAt);
  const homeName = match.homeTeam?.name || "Home";
  const awayName = match.awayTeam?.name || "Away";

  return (
    <article className="rounded-[2rem] bg-black p-6 text-white shadow-xl sm:p-8">
      <div className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55 sm:text-xs sm:tracking-widest">
        <span className="min-w-0">{match.competition?.name ?? "Competition"}</span>
        <span className="shrink-0">
          {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 sm:gap-8">
        <div className="min-w-0 text-center">
          <TeamLogo
            src={match.homeTeam?.logoUrl || "/images/solmart-fc-logo.png"}
            alt={`${homeName} logo`}
          />
          <TeamName name={homeName} />
        </div>

        <div className="flex min-w-[4rem] flex-col items-center justify-center pt-8 text-center sm:min-w-[5rem] sm:pt-10">
          <p className="text-xs font-medium text-white/60 sm:text-sm">
            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
          <span className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">VS</span>
          <span className="mt-2 h-1 w-8 rounded-full bg-red-600 sm:w-10" />
        </div>

        <div className="min-w-0 text-center">
          <TeamLogo
            src={match.awayTeam?.logoUrl || "/images/solmart-fc-logo.png"}
            alt={`${awayName} logo`}
          />
          <TeamName name={awayName} />
        </div>
      </div>

      <p className="mt-7 border-t border-white/10 pt-4 text-center text-sm text-white/55">
        {match.venue || "Venue TBC"}
      </p>
    </article>
  );
}
