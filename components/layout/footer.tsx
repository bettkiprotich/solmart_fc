import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export async function Footer() {
  const sponsors = await prisma.sponsor.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" }
  });

  const clubSponsors = sponsors.filter(s => s.type === "CLUB");
  const teamSponsors = sponsors.filter(s => s.type === "TEAM");

  return (
    <footer className="bg-black text-white">
      {/* Sponsor Banner */}
      {(clubSponsors.length > 0 || teamSponsors.length > 0) && (
        <div className="border-b border-white/10 bg-zinc-950">
          <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
            {clubSponsors.length > 0 && (
              <div className="mb-10 text-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-6">Club Principal Partners</h3>
                <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
                  {clubSponsors.map(s => (
                    <a key={s.id} href={s.websiteUrl || "#"} target="_blank" rel="noreferrer" className="block opacity-70 hover:opacity-100 transition-opacity">
                      {s.logoUrl ? (
                        <Image src={s.logoUrl} alt={s.name} width={100} height={50} className="h-10 md:h-12 w-auto object-contain grayscale" />
                      ) : (
                        <span className="font-black text-xl">{s.name}</span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {teamSponsors.length > 0 && (
              <div className="text-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-6">Team Sponsors</h3>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                  {teamSponsors.map(s => (
                    <a key={s.id} href={s.websiteUrl || "#"} target="_blank" rel="noreferrer" className="block opacity-50 hover:opacity-100 transition-opacity">
                      {s.logoUrl ? (
                        <Image src={s.logoUrl} alt={s.name} width={80} height={40} className="h-8 w-auto object-contain grayscale" />
                      ) : (
                        <span className="font-bold text-lg">{s.name}</span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Footer Links */}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative size-11 overflow-hidden rounded-full bg-white">
              <Image src="/images/solmart-fc-logo.png" alt="Solmart FC crest" fill sizes="44px" className="object-cover" />
            </div>
            <p className="text-lg font-black uppercase">Solmart FC</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/55">Official digital home of Solmart FC, Nairobi, Kenya.</p>
        </div>
        
        <div>
          <h2 className="font-black uppercase tracking-widest text-white/50 text-xs">Club</h2>
          <div className="mt-4 space-y-2 text-sm font-bold">
            <Link className="block hover:text-white text-white/70" href="/club">Club Hub</Link>
            <Link className="block hover:text-white text-white/70" href="/teams">Teams</Link>
            <Link className="block hover:text-white text-white/70" href="/matches">Matches</Link>
          </div>
        </div>
        
        <div>
          <h2 className="font-black uppercase tracking-widest text-white/50 text-xs">Connect</h2>
          <div className="mt-4 space-y-2 text-sm font-bold">
            <Link className="block hover:text-white text-white/70" href="/news">News</Link>
            <Link className="block hover:text-white text-white/70" href="/media">Media</Link>
            <Link className="block hover:text-white text-white/70" href="/contact">Contact</Link>
          </div>
        </div>
        
        <div>
          <h2 className="font-black uppercase tracking-widest text-white/50 text-xs">Shop</h2>
          <p className="mt-4 text-sm leading-6 text-white/55">Support the club and wear the colours with pride.</p>
          <Link className="mt-4 inline-block text-sm font-black text-red-500 hover:text-red-400 uppercase tracking-widest" href="/shop">Visit Store →</Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            {/* FKF Affiliation Badge Placeholder */}
            <div className="h-8 px-3 rounded bg-white/10 flex items-center justify-center font-bold text-[10px] text-white/70">
              AFFILIATED WITH FKF
            </div>
            <span>© {new Date().getFullYear()} Solmart FC. All rights reserved.</span>
          </div>
          
          <div className="flex flex-wrap gap-4 font-bold">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/refund" className="hover:text-white">Returns & Refunds</Link>
            <a href="https://kode3solutions.co.ke" target="_blank" rel="noreferrer" className="hover:text-white">Website by Kode3 Solutions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
