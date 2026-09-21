"use client";

import Image from "next/image";
import { useState } from "react";

export function MediaGallery({ gallery }: { gallery: any }) {
  const images = gallery.images ?? [];
  const [active, setActive] = useState<number | null>(null);
  if (!images.length) return null;
  return (
    <article className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
      <div className="p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-[11px] font-black uppercase tracking-[.25em] text-red-600">Gallery</p><h3 className="mt-1 text-2xl font-black">{gallery.title}</h3></div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">{images.length} {images.length === 1 ? "photo" : "photos"}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-2 sm:grid-cols-4">
        {images.map((image: any, index: number) => (
          <button key={image.id} type="button" onClick={() => setActive(index)} className={`group relative overflow-hidden rounded-xl bg-zinc-200 text-left focus:outline-none ${index === 0 ? "col-span-2 row-span-2" : "aspect-square"}`} aria-label={`Open ${image.altText || gallery.title} photo ${index + 1}`}>
            <Image src={image.url} alt={image.altText || gallery.title} fill sizes={index === 0 ? "(max-width: 640px) 100vw, 50vw" : "25vw"} className="object-cover transition duration-500 group-hover:scale-105" />
            <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />
          </button>
        ))}
      </div>
      {active !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Gallery image viewer" onClick={() => setActive(null)}>
          <button type="button" onClick={() => setActive(null)} className="absolute right-5 top-5 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/20">Close</button>
          <div className="relative h-[80vh] w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <Image src={images[active].url} alt={images[active].altText || gallery.title} fill sizes="100vw" className="object-contain" priority />
          </div>
        </div>
      )}
    </article>
  );
}
