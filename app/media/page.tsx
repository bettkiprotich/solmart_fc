import { prisma } from "@/lib/db/prisma";
import { MediaGallery } from "@/components/site/media-gallery";
import { VideoEmbed } from "@/components/site/video-embed";

export const dynamic = "force-dynamic";
export const metadata = { title: "Media", description: "Solmart FC galleries and video content." };

export default async function MediaPage() {
  let galleries: any[] = [];
  let videos: any[] = [];
  try {
    [galleries, videos] = await Promise.all([
      prisma.gallery.findMany({ where: { published: true }, include: { images: { orderBy: { sortOrder: "asc" } } }, orderBy: { createdAt: "desc" } }),
      prisma.video.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } }),
    ]);
  } catch {}
  return (
    <div>
      <section className="relative overflow-hidden bg-black px-5 py-24 text-white lg:px-8">
        <div className="absolute -right-40 top-0 size-[28rem] rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl"><p className="text-xs font-black uppercase tracking-[.3em] text-red-500">Media centre</p><h1 className="mt-3 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">Inside Solmart FC.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">A growing collection of club photographs and video stories.</p></div>
      </section>
      <section className="mx-auto max-w-7xl space-y-20 px-5 py-16 lg:px-8">
        <div><div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.3em] text-red-600">Photography</p><h2 className="mt-2 text-4xl font-black">Gallery</h2></div></div><div className="grid gap-8 lg:grid-cols-2">{galleries.map(g => <MediaGallery key={g.id} gallery={g} />)}</div>{!galleries.length && <div className="rounded-3xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500">No published galleries yet.</div>}</div>
        <div><div className="mb-7"><p className="text-xs font-black uppercase tracking-[.3em] text-red-600">Video</p><h2 className="mt-2 text-4xl font-black">Watch</h2></div><div className="grid gap-8 md:grid-cols-2">{videos.map(v => <article key={v.id} className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm"><div className="aspect-video bg-black"><VideoEmbed video={v} /></div><div className="p-6"><h3 className="text-xl font-black">{v.title}</h3>{v.description && <p className="mt-2 text-sm leading-6 text-zinc-600">{v.description}</p>}</div></article>)}</div>{!videos.length && <div className="rounded-3xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500">No published videos yet.</div>}</div>
      </section>
    </div>
  );
}
