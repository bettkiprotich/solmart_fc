import Image from "next/image";
import Link from "next/link";
import { listMatches, listActivePlayers } from "@/lib/services/football";
import { listPublishedNews } from "@/lib/services/content";
import { listActiveProducts } from "@/lib/services/catalog";
import { FixtureCard } from "@/components/site/fixture-card";
import { PlayerCard } from "@/components/site/player-card";
import { NewsCard } from "@/components/site/news-card";
import { ProductCard } from "@/components/site/product-card";
import { SectionHeading } from "@/components/site/section-heading";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let matches: any[] = [], players: any[] = [], news: any[] = [], products: any[] = [];
  try {
    [matches, players, news, products] = await Promise.all([
      listMatches(),
      listActivePlayers(),
      listPublishedNews(),
      listActiveProducts(true)
    ]);
  } catch {}

  const next = matches.find(m => m.status === "SCHEDULED" && m.type !== "TRAINING");
  const pastMatches = matches.filter(m => m.status === "COMPLETED" && m.type !== "TRAINING").sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime());
  const recentMatch = pastMatches[0];
  
  // Get home competition
  const homeCompetition = await prisma.competition.findFirst({
    where: { showOnHomepage: true },
    include: {
      tableRows: {
        include: { team: true },
        orderBy: { position: "asc" },
        take: 5
      }
    }
  });

  // Calculate form (Last 6 games)
  // We'll calculate it from the club's perspective (assuming Solmart FC is the club team).
  // First, find the club team
  const clubTeam = await prisma.team.findFirst({ where: { isClub: true } });
  
  let form: string[] = [];
  if (clubTeam) {
    const clubPast = pastMatches.filter(m => m.homeTeamId === clubTeam.id || m.awayTeamId === clubTeam.id).slice(0, 6).reverse(); // Reverse so oldest is first, or keep newest first? Form is usually Left=Old, Right=New
    form = clubPast.map(m => {
      const isHome = m.homeTeamId === clubTeam.id;
      const ourScore = isHome ? m.homeScore : m.awayScore;
      const theirScore = isHome ? m.awayScore : m.homeScore;
      if (ourScore === null || theirScore === null) return "D";
      if (ourScore > theirScore) return "W";
      if (ourScore < theirScore) return "L";
      return "D";
    });
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute -right-32 -top-32 size-[32rem] rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.15fr_.85fr] lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[.35em] text-red-500">Nairobi · Kenya · Est. 2024</p>
            <h1 className="mt-5 max-w-5xl text-6xl font-black uppercase leading-[.88] tracking-[-.04em] sm:text-7xl lg:text-8xl">
              Play.<br />Unite.<br /><span className="text-red-500">Win.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/65">
              The official digital home of Solmart FC — the identity born from KasaCity FC, originally established in 2022 and rebranded in 2024.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/club" className="rounded-xl bg-red-600 px-6 py-3 font-black hover:bg-red-700">Discover the club</Link>
              <Link href="/shop" className="rounded-xl border border-white/20 px-6 py-3 font-black hover:bg-white hover:text-black">Shop jerseys</Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="aspect-square rounded-[3rem] border border-white/10 bg-white/[.04] p-5 shadow-2xl">
              <div className="relative h-full overflow-hidden rounded-[2.4rem] bg-white">
                <Image src="/images/solmart-fc-logo.png" alt="Solmart FC official club crest" fill sizes="(max-width: 1024px) 80vw, 35vw" className="object-contain p-10" priority />
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-2xl bg-red-600 px-5 py-4 shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-widest">Club identity</p>
              <p className="mt-1 text-lg font-black">Solmart FC</p>
            </div>
          </div>
        </div>
      </section>

      {/* MATCH CENTRE & LEAGUE TABLE WIDGET */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <SectionHeading eyebrow="Match centre" title="Action & Stats" href="/matches" linkLabel="All matches" />
        
        <div className="mt-7 grid lg:grid-cols-[1fr_350px] gap-8 items-start">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-black mb-4">Most Recent</h3>
              {recentMatch ? <FixtureCard match={recentMatch} /> : <p className="text-zinc-500">No recent match found.</p>}
            </div>
            <div>
              <h3 className="text-xl font-black mb-4">Next Up</h3>
              {next ? <FixtureCard match={next} /> : <p className="text-zinc-500">No upcoming match scheduled.</p>}
            </div>
          </div>

          <div className="space-y-6">
            {/* Form Widget */}
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-black/40 mb-4">Current Form</h3>
              <div className="flex gap-2">
                {form.length > 0 ? form.map((f, i) => (
                  <div key={i} className={`flex size-10 items-center justify-center rounded-lg font-black text-white ${f === 'W' ? 'bg-green-500' : f === 'L' ? 'bg-red-500' : 'bg-zinc-400'}`}>
                    {f}
                  </div>
                )) : <span className="text-zinc-500 text-sm">Not enough data.</span>}
              </div>
            </div>

            {/* League Table Widget */}
            {homeCompetition && (
              <div className="rounded-[2rem] border border-zinc-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-black text-white p-4 text-center text-sm font-bold uppercase tracking-widest">
                  {homeCompetition.name}
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 text-black/50 text-left border-b">
                      <th className="py-2 pl-4">Pos</th>
                      <th className="py-2">Team</th>
                      <th className="py-2 text-center">P</th>
                      <th className="py-2 pr-4 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {homeCompetition.tableRows.map((row) => (
                      <tr key={row.id}>
                        <td className="py-3 pl-4 font-bold text-black/50">{row.position}</td>
                        <td className="py-3 font-bold truncate max-w-[120px]" title={row.team.name}>{row.team.name}</td>
                        <td className="py-3 text-center">{row.played}</td>
                        <td className="py-3 pr-4 text-right font-black">{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-3 bg-zinc-50 text-center border-t">
                  <Link href="/team" className="text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-700">Full Table →</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-zinc-100">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <SectionHeading eyebrow="Newsroom" title="Latest from the club" href="/news" linkLabel="View all news" />
          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {news.slice(0, 3).map(a => <NewsCard key={a.id} article={a} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <SectionHeading eyebrow="The squad" title="Meet the team" description="Squad records are database-driven and replaceable through the CMS." href="/team" linkLabel="View squad" />
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {players.slice(0, 4).map(p => <PlayerCard key={p.id} player={p} />)}
        </div>
      </section>

      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[.3em] text-red-500">Official store</p>
            <h2 className="mt-3 text-4xl font-black">Wear the crest.</h2>
            <p className="mt-4 max-w-md text-white/60">Jerseys are the first merchandise focus. Full cart, checkout and Secure Paystack M-PESA checkout is available for merchandise orders.</p>
            <Link href="/shop" className="mt-7 inline-block rounded-xl bg-red-600 px-6 py-3 font-black hover:bg-red-700">Visit the shop</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {products.slice(0, 2).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.3em] text-red-600">Our story</p>
              <h2 className="mt-3 text-3xl font-black">From KasaCity FC to Solmart FC</h2>
              <p className="mt-3 max-w-2xl text-zinc-600">Originally established in 2022, the club was rebranded as Solmart FC in 2024. The website keeps this history visible while official competition information remains TBD.</p>
            </div>
            <Link href="/club" className="shrink-0 rounded-xl bg-black px-6 py-3 text-center font-black text-white hover:bg-red-600">Club history →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
