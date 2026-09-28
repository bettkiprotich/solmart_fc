import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { MediaGallery } from "@/components/site/media-gallery";

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gallery = await prisma.gallery.findFirst({
    where: { slug, published: true },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!gallery) notFound();

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-10 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <Link href="/media" className="text-sm font-bold text-red-600 hover:text-red-700">← All media</Link>
        <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">{gallery.title}</h1>
        {gallery.description && <p className="mt-4 max-w-3xl leading-7 text-zinc-600">{gallery.description}</p>}
        <div className="mt-8"><MediaGallery gallery={gallery} /></div>
      </div>
    </main>
  );
}
