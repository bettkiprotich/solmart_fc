import { prisma } from "@/lib/db/prisma";
import Image from "next/image";
import Link from "next/link";
import { PlayCircleIcon, PhotoIcon } from "@heroicons/react/24/outline";

export const metadata = {
  title: "Media Gallery | Solmart FC",
};

export default async function MediaPage() {
  const galleries = await prisma.gallery.findMany({
    where: { published: true },
    include: { images: true },
    orderBy: { createdAt: "desc" }
  });

  const videos = await prisma.video.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" }
  });

  // Combine and sort
  const mediaItems = [
    ...galleries.map(g => ({ ...g, type: "GALLERY" as const, date: g.createdAt })),
    ...videos.map(v => ({ ...v, type: "VIDEO" as const, date: v.createdAt }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="bg-zinc-50 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">Media Gallery</h1>
        <p className="mt-4 text-lg text-black/60 max-w-2xl mb-12">
          Photos and videos from our latest matches, training sessions, and club events.
        </p>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {mediaItems.length === 0 ? (
            <p className="text-black/50">No media available yet.</p>
          ) : (
            mediaItems.map(item => (
              <div key={`${item.type}-${item.id}`} className="break-inside-avoid">
                {item.type === "GALLERY" ? (
                  <Link href={`/media/albums/${(item as any).slug}`} className="group block overflow-hidden rounded-3xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                    <div className="aspect-[4/3] w-full bg-zinc-200 relative">
                      {/* Using the first image as cover */}
                      {(item as any).images.length > 0 ? (
                        <Image src={(item as any).images[0].url} alt={(item as any).title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-200 text-zinc-400">
                           <PhotoIcon className="h-12 w-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2 font-bold text-sm">
                           <PhotoIcon className="h-5 w-5" />
                           {(item as any).images.length} Photos
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-white/70">
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-black text-lg line-clamp-2 leading-tight">{(item as any).title}</h3>
                    </div>
                  </Link>
                ) : (
                  <Link href={`/media/videos/${(item as any).id}`} className="group block overflow-hidden rounded-3xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                    <div className="aspect-video w-full bg-zinc-200 relative flex items-center justify-center">
                      {(item as any).thumbnailUrl ? (
                         <Image src={(item as any).thumbnailUrl} alt={(item as any).title} fill className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-700">
                           <PlayCircleIcon className="h-16 w-16" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <PlayCircleIcon className="absolute h-16 w-16 text-white/80 drop-shadow-md transition-transform group-hover:scale-110" />
                      
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-white">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <span className="bg-red-600 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest">Video</span>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-white/70">
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-black text-lg line-clamp-2 leading-tight">{(item as any).title}</h3>
                    </div>
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
