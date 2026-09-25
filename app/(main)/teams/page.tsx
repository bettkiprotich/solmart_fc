import { prisma } from "@/lib/db/prisma";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Teams | Solmart FC",
};

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="bg-zinc-50 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">Our Teams</h1>
        <p className="mt-4 text-lg text-black/60 max-w-2xl mb-12">
          Select a team to view their squad, fixtures, latest results, and statistics.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map(t => (
            <Link href={`/teams/${t.slug}`} key={t.id} className="group relative block overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="aspect-video w-full bg-zinc-900 relative">
                {t.coverPhotoUrl && (
                  <Image src={t.coverPhotoUrl} alt="" fill className="object-cover opacity-50 transition-transform duration-500 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
                  {t.logoUrl ? (
                    <Image src={t.logoUrl} alt={t.name} width={64} height={64} className="rounded-full bg-white p-1" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-white/20" />
                  )}
                  <h2 className="text-2xl font-black uppercase text-white shadow-black drop-shadow-md">{t.shortName || t.name}</h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
