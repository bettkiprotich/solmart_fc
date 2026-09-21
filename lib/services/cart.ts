import { prisma } from "@/lib/db/prisma";

export async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        orderBy: { id: "asc" },
        include: { variant: { include: { product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } } } },
      },
    },
  });
}

export function cartSubtotal(cart: Awaited<ReturnType<typeof getOrCreateCart>>) {
  return cart.items.reduce((sum, item) => {
    const price = Number(item.variant.salePrice ?? item.variant.price);
    return sum + price * item.quantity;
  }, 0);
}
