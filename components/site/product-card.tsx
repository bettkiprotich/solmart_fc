import Image from "next/image";
import Link from "next/link";

export function ProductCard({ product }: { product: any }) {
  const variant = product.variants?.[0];
  const image = product.images?.[0];
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-zinc-100">
          {image?.url ? <Image src={image.url} alt={image.altText || product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain p-6 transition duration-500 group-hover:scale-105 sm:p-10" /> : <div className="grid h-full place-items-center p-10"><Image src="/images/solmart-fc-logo.png" alt="Solmart FC crest" width={150} height={150} className="opacity-50" /></div>}
          {product.featured && <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">Featured</span>}
        </div>
        <div className="p-5 sm:p-6"><p className="text-[11px] font-black uppercase tracking-[.2em] text-red-600">{product.category}</p><h3 className="mt-2 text-xl font-black">{product.name}</h3><p className="mt-2 text-lg font-black">KES {Number(variant?.salePrice ?? variant?.price ?? 0).toLocaleString()}</p><span className="mt-5 inline-flex rounded-xl bg-black px-4 py-3 text-sm font-black text-white transition group-hover:bg-red-600">View product →</span></div>
      </Link>
    </article>
  );
}
