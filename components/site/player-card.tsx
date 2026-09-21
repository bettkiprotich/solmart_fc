import Image from "next/image";
import Link from "next/link";

export function PlayerCard({ player }: { player: any }) {
  const name = `${player.firstName} ${player.lastName}`;
  const href = player.slug ? `/team/${player.slug}` : "/team";
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <Link href={href} className="block" aria-label={`View ${name}`}>
        <div className="relative aspect-[4/4.7] overflow-hidden bg-gradient-to-b from-zinc-100 to-zinc-200">
          <div className="absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute right-4 top-4 z-20 rounded-full bg-black/80 px-3 py-1.5 text-xs font-black text-white backdrop-blur">#{player.squadNumber ?? "—"}</div>
          {player.photoUrl ? (
            <Image src={player.photoUrl} alt={name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover object-top transition duration-500 group-hover:scale-[1.03]" />
          ) : (
            <div className="absolute inset-0 grid place-items-center p-10">
              <div className="grid size-32 place-items-center rounded-full bg-white/80 p-5 shadow-inner">
                <Image src="/images/solmart-fc-logo.png" alt="Solmart FC crest placeholder" width={96} height={96} className="object-contain opacity-70" />
              </div>
              <span className="absolute bottom-5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-600">Photo coming soon</span>
            </div>
          )}
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-black uppercase tracking-[.2em] text-red-600">{player.position}</span>
            <span className="text-xs font-bold text-zinc-400">View profile →</span>
          </div>
          <h3 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">{name}</h3>

        </div>
      </Link>
    </article>
  );
}
