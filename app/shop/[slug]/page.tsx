import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AddToCart } from "@/components/shop/add-to-cart";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({ where: { slug, status: "ACTIVE" }, include: { images: { orderBy: { sortOrder: "asc" } }, variants: { orderBy: { size: "asc" } } } });
  if (!product) notFound();
  const variants = product.variants.map(v => ({ id: v.id, size: v.size, stock: v.stock, price: v.price.toString(), salePrice: v.salePrice?.toString() ?? null }));
  const firstImage = product.images[0];
  return <div>
    <section className="bg-zinc-950 px-5 py-16 text-white lg:px-8"><div className="mx-auto max-w-7xl"><Link href="/shop" className="text-sm font-bold text-white/60 hover:text-white">← Back to shop</Link><p className="mt-8 text-xs font-black uppercase tracking-[.3em] text-red-500">{product.category}</p><h1 className="mt-3 text-5xl font-black sm:text-7xl">{product.name}</h1></div></section>
    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8">
      <div className="grid min-h-[500px] place-items-center rounded-3xl bg-zinc-100 p-12"><img src={firstImage?.url || "/images/solmart-fc-logo.png"} alt={firstImage?.altText || product.name} className="max-h-[500px] max-w-full object-contain" /></div>
      <div className="self-center"><p className="text-2xl font-black">Choose your size and quantity</p><p className="mt-5 whitespace-pre-line text-zinc-600">{product.description}</p><div className="my-8 h-px bg-zinc-200" /><AddToCart variants={variants} /><p className="mt-5 text-xs text-zinc-500">Demo catalogue item: replace this seed merchandise with approved product details before launch.</p></div>
    </section>
  </div>;
}
