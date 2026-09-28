import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { VideoEmbed } from "@/components/site/video-embed";

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = await prisma.video.findFirst({ where: { id, published: true } });
  if (!video) notFound();

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-10 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <Link href="/media" className="text-sm font-bold text-red-600 hover:text-red-700">← All media</Link>
        <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">{video.title}</h1>
        <div className="mt-8 aspect-video overflow-hidden rounded-2xl bg-black shadow-xl"><VideoEmbed video={video} /></div>
        {video.description && <p className="mt-6 max-w-3xl leading-7 text-zinc-600">{video.description}</p>}
      </div>
    </main>
  );
}
