import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = await prisma.player.findFirst({ where: { slug, isActive: true }, include: { team: true, statistics: { orderBy: { season: "desc" }, take: 1 } } });
  if (!player) notFound();
  const name = `${player.firstName} ${player.lastName}`;
  const stat = player.statistics[0];
  const facts = [["Nationality", player.nationality || "—"], ["Date of birth", player.dateOfBirth ? new Date(player.dateOfBirth).toLocaleDateString("en-GB") : "—"], ["Appearances", stat?.appearances ?? "—"], ["Goals", stat?.goals ?? "—"]];
  return <div><section className="bg-black px-5 py-10 text-white lg:px-8"><div className="mx-auto max-w-7xl"><Link href="/team" className="text-sm font-bold text-white/60 hover:text-white">← Back to squad</Link></div></section><section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[.85fr_1.15fr] lg:px-8 lg:py-16"><div className="relative aspect-[4/4.7] overflow-hidden rounded-[2rem] bg-zinc-100">{player.photoUrl ? <Image src={player.photoUrl} alt={name} fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover object-top"/> : <div className="grid h-full place-items-center"><Image src="/images/solmart-fc-logo.png" alt="Solmart FC crest" width={180} height={180} className="opacity-50"/></div>}</div><div className="self-center"><p className="text-xs font-black uppercase tracking-[.3em] text-red-600">{player.position} {player.squadNumber ? `· #${player.squadNumber}` : ""}</p><h1 className="mt-3 text-5xl font-black tracking-tight sm:text-7xl">{name}</h1>{player.bio && <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">{player.bio}</p>}<div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">{facts.map(([label, value]) => <div key={label} className="rounded-2xl bg-zinc-100 p-4"><p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</p><p className="mt-2 font-black">{value}</p></div>)}</div>{stat?.isDemoData && <p className="mt-5 text-xs font-bold text-zinc-400">Statistics shown are demo data.</p>}</div></section></div>;
}
