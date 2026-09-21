import { prisma } from "@/lib/db/prisma";

export async function listActiveProducts(featured?: boolean) {
  return prisma.product.findMany({
    where: { status: "ACTIVE", ...(featured === true ? { featured: true } : {}) },
    include: { images: { orderBy: { sortOrder: "asc" } }, variants: { orderBy: { size: "asc" } } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
}
