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
    const clubPast = pastMatches.filter(m => m.homeTeamId === clubTeam.id || m.awayTeamId === clubTeam.id).slice(0, 6).reverse();
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

  // Fetch recent media
  const recentGalleries = await prisma.gallery.findMany({
    where: { published: true },
    include: { images: true },
    orderBy: { createdAt: "desc" },
    take: 2
  });
  
  const recentVideos = await prisma.video.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 1
  });

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
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-black mb-6 text-center">Matches Summary</h3>
              
              {clubTeam && pastMatches.length > 0 ? (() => {
                const clubMatches = pastMatches.filter(m => m.homeTeamId === clubTeam.id || m.awayTeamId === clubTeam.id);
                const played = clubMatches.length;
                const won = clubMatches.filter(m => (m.homeTeamId === clubTeam.id && m.homeScore! > m.awayScore!) || (m.awayTeamId === clubTeam.id && m.awayScore! > m.homeScore!)).length;
                const lost = clubMatches.filter(m => (m.homeTeamId === clubTeam.id && m.homeScore! < m.awayScore!) || (m.awayTeamId === clubTeam.id && m.awayScore! < m.homeScore!)).length;
                const drawn = played - won - lost;
                const ppg = played > 0 ? ((won * 3 + drawn) / played).toFixed(1) : "0.0";
                
                return (
                  <>
                    <div className="flex justify-between text-center mb-6">
                      <div>
                        <div className="text-zinc-500 font-medium text-sm mb-1">Played</div>
                        <div className="text-3xl font-black">{played}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 font-medium text-sm mb-1">Won</div>
                        <div className="text-3xl font-black">{won}</div>
                        <div className="h-1 bg-[#10b981] mt-2 rounded"></div>
                      </div>
                      <div>
                        <div className="text-zinc-500 font-medium text-sm mb-1">Drawn</div>
                        <div className="text-3xl font-black">{drawn}</div>
                        <div className="h-1 bg-zinc-300 mt-2 rounded"></div>
                      </div>
                      <div>
                        <div className="text-zinc-500 font-medium text-sm mb-1">Lost</div>
                        <div className="text-3xl font-black">{lost}</div>
                        <div className="h-1 bg-[#f43f5e] mt-2 rounded"></div>
                      </div>
                    </div>
                    
                    <div className="h-3 w-full rounded-full flex overflow-hidden mb-8 bg-zinc-100">
                      <div style={{width: `${(won/played)*100}%`}} className="bg-[#10b981]"></div>
                      <div style={{width: `${(drawn/played)*100}%`}} className="bg-zinc-300"></div>
                      <div style={{width: `${(lost/played)*100}%`}} className="bg-[#f43f5e]"></div>
                    </div>

                    <h3 className="text-lg font-black mb-4 text-center">Form</h3>
                    <div className="flex justify-center gap-2 mb-6">
                      {form.length > 0 ? form.map((f, i) => (
                        <div key={i} className={`flex h-10 w-10 items-center justify-center rounded-lg font-black ${f==='W'?'bg-[#10b981] text-white':f==='L'?'bg-[#f43f5e] text-white':'bg-zinc-300 text-zinc-600'}`}>
                          {f}
                        </div>
                      )) : <span className="text-zinc-500 text-sm">Not enough data.</span>}
                    </div>
                    <div className="text-center text-zinc-600 font-medium">
                      Average PPG <span className="font-black text-black ml-1">{ppg}</span>
                    </div>
                  </>
                );
              })() : (
                <div className="text-center text-zinc-500 py-4">Not enough data available.</div>
              )}
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

      {/* MEDIA SECTION */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <SectionHeading eyebrow="Media" title="Photos & Videos" href="/media" linkLabel="View gallery" />
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {recentVideos.map(v => (
            <Link key={v.id} href={`/media/videos/${v.id}`} className="group block overflow-hidden rounded-3xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="aspect-[4/3] w-full bg-zinc-900 relative flex items-center justify-center">
                {v.thumbnailUrl && <Image src={v.thumbnailUrl} alt={v.title} fill className="object-contain p-2 opacity-80 transition-opacity duration-500 group-hover:opacity-100" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <div className="h-8 w-8 ml-1 rounded-sm bg-white" style={{ clipPath: "polygon(0 0, 0 100%, 100% 50%)" }} />
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-white">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span className="bg-red-600 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest">Video</span>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-black text-lg line-clamp-2 leading-tight">{v.title}</h3>
              </div>
            </Link>
          ))}
          {recentGalleries.map(g => (
            <Link key={g.id} href={`/media/albums/${g.slug}`} className="group block overflow-hidden rounded-3xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="aspect-[4/3] w-full bg-zinc-900 relative">
                {g.images.length > 0 && <Image src={g.images[0].url} alt={g.title} fill className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.02]" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span className="bg-black/50 backdrop-blur px-2 py-0.5 rounded text-[10px] uppercase tracking-widest">{g.images.length} Photos</span>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-black text-lg line-clamp-2 leading-tight">{g.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FKF AFFILIATION */}
      <section className="bg-zinc-100 py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 flex flex-col items-center text-center">
          <p className="text-sm font-black uppercase tracking-[.2em] text-zinc-500 mb-6">Affiliated with</p>
          <a href="https://footballkenya.org/" target="_blank" rel="noreferrer" className="group flex flex-col items-center hover:-translate-y-1 transition-transform">
            <div className="h-32 w-32 relative bg-white rounded-full p-4 shadow-sm border border-black/5 group-hover:shadow-md transition-shadow">
              <Image src="https://footballkenya.org/assets/fkf-logo-TK2nnrvJ.webp" alt="Football Kenya Federation" fill className="object-contain p-4" />
            </div>
            <p className="mt-4 font-black text-lg text-black">Football Kenya Federation</p>
            <p className="text-red-600 text-sm font-bold mt-1">Visit official website →</p>
          </a>
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
