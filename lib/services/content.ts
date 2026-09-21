import { prisma } from "@/lib/db/prisma";

export async function listPublishedNews(args: { category?: string; search?: string } = {}) {
  return prisma.newsArticle.findMany({
    where: {
      status: "PUBLISHED",
      ...(args.category ? { category: { slug: args.category } } : {}),
      ...(args.search ? { OR: [{ title: { contains: args.search, mode: "insensitive" } }, { excerpt: { contains: args.search, mode: "insensitive" } }] } : {}),
    },
    include: { category: true, author: { select: { firstName: true, lastName: true } } },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });
}
