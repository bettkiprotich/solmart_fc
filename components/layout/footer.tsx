import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Facebook, Instagram, Youtube } from "lucide-react";

function TiktokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="currentColor">
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.24-2.61.86-5.26 2.86-6.93 1.25-1.06 2.88-1.7 4.54-1.76V8.92c-.8.03-1.58.26-2.27.65-1.55.85-2.67 2.45-2.86 4.23-.2 1.76.51 3.58 1.83 4.74 1.29 1.15 3.16 1.48 4.79 1.05 1.54-.4 2.78-1.54 3.32-3.03.28-.79.37-1.63.36-2.47V.02z"/>
    </svg>
  );
}

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
                    <Link key={s.id} href={`/sponsors/${s.id}`} className="block opacity-70 hover:opacity-100 transition-opacity">
                      {s.logoUrl ? (
                        <Image src={s.logoUrl} alt={s.name} width={100} height={50} className="h-10 md:h-12 w-auto object-contain grayscale" />
                      ) : (
                        <span className="font-black text-xl">{s.name}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {teamSponsors.length > 0 && (
              <div className="text-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-6">Team Sponsors</h3>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                  {teamSponsors.map(s => (
                    <Link key={s.id} href={`/sponsors/${s.id}`} className="block opacity-50 hover:opacity-100 transition-opacity">
                      {s.logoUrl ? (
                        <Image src={s.logoUrl} alt={s.name} width={80} height={40} className="h-8 w-auto object-contain grayscale" />
                      ) : (
                        <span className="font-bold text-lg">{s.name}</span>
                      )}
                    </Link>
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
          <div className="mt-6 flex items-center gap-4 text-white/50">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Facebook size={20} /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Instagram size={20} /></a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><TiktokIcon /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Youtube size={20} /></a>
          </div>
        </div>
        
        <div>
          <h2 className="font-black uppercase tracking-widest text-white/50 text-xs">Club</h2>
          <div className="mt-4 space-y-2 text-sm font-bold">
            <Link className="block hover:text-white text-white/70" href="/club">Club Hub</Link>
            <Link className="block hover:text-white text-white/70" href="/team">Team</Link>
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
