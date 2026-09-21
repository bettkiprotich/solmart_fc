import { prisma } from "@/lib/db/prisma";

export function slugify(value: string) {
  return value.toLowerCase().trim().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180) || "item";
}

export async function uniqueSlug(base: string, kind: "player" | "product" | "article" | "gallery", excludeId?: string) {
  const slug = slugify(base);
  const find = async (candidate: string) => {
    if (kind === "player") return prisma.player.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (kind === "product") return prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (kind === "article") return prisma.newsArticle.findUnique({ where: { slug: candidate }, select: { id: true } });
    return prisma.gallery.findUnique({ where: { slug: candidate }, select: { id: true } });
  };
  const existing = await find(slug);
  if (!existing || existing.id === excludeId) return slug;
  for (let i = 2; i < 10000; i++) {
    const candidate = `${slug}-${i}`;
    const hit = await find(candidate);
    if (!hit || hit.id === excludeId) return candidate;
  }
  throw new Error("Unable to generate a unique slug.");
}
