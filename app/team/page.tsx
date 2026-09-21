import { listActivePlayers } from "@/lib/services/football";
import { SectionHeading } from "@/components/site/section-heading";
import { PlayerCard } from "@/components/site/player-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Team", description: "Meet the Solmart FC squad." };

export default async function TeamPage() {
  let players: any[] = [];
  try { players = await listActivePlayers(); } catch {}
  const groups = ["GOALKEEPER", "DEFENDER", "MIDFIELDER", "FORWARD"];
  return <div>
    <section className="relative overflow-hidden bg-zinc-950 px-5 py-24 text-white lg:px-8"><div className="absolute -left-40 top-0 size-[30rem] rounded-full bg-red-600/15 blur-3xl"/><div className="relative mx-auto max-w-7xl"><p className="text-xs font-black uppercase tracking-[.3em] text-red-500">First team</p><h1 className="mt-3 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">Meet the squad.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">Player profiles are managed through the club CMS. Official records can be updated as the squad develops.</p></div></section>
    <section className="mx-auto max-w-7xl space-y-16 px-5 py-16 lg:px-8">{groups.map(pos => { const items = players.filter(p => p.position === pos); if (!items.length) return null; return <div key={pos}><SectionHeading eyebrow={pos.toLowerCase()} title={pos.charAt(0) + pos.slice(1).toLowerCase() + "s"}/><div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{items.map(p => <PlayerCard key={p.id} player={p}/>)}</div></div>; })}{!players.length && <div className="rounded-3xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500">No squad records are available yet.</div>}</section>
  </div>;
}
