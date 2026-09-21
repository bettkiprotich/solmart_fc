import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { assertSameOrigin } from "@/lib/http/request";
import { jsonError } from "@/lib/http/response";
import { checkoutSchema } from "@/lib/validation/ecommerce";

const SHIPPING_FEE = 300;

function orderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `SFC-${stamp}-${random}`;
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const user = await getSessionUser();
  if (!user) return jsonError("Please sign in before checkout.", 401);
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Please check your delivery details.", 422, parsed.error.flatten());

  try {
    const result = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId: user.id },
        include: { items: { include: { variant: { include: { product: true } } } } },
      });
      if (!cart || cart.items.length === 0) throw new Error("EMPTY_CART");

      const freshItems = [] as Array<{ itemId: string; variantId: string; productName: string; sku: string; size: string | null; quantity: number; unitPrice: number; lineTotal: number }>;
      let subtotal = 0;
      for (const item of cart.items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId }, include: { product: true } });
        if (!variant || variant.product.status !== "ACTIVE") throw new Error("PRODUCT_UNAVAILABLE");
        if (variant.stock < item.quantity) throw new Error(`STOCK:${variant.product.name}:${variant.stock}`);
        const unitPrice = Number(variant.salePrice ?? variant.price);
        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;
        freshItems.push({ itemId: item.id, variantId: variant.id, productName: variant.product.name, sku: variant.sku, size: variant.size, quantity: item.quantity, unitPrice, lineTotal });
      }

      for (const item of freshItems) {
        const updated = await tx.productVariant.updateMany({ where: { id: item.variantId, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
        if (updated.count !== 1) throw new Error("STOCK_CHANGED");
      }

      const shippingFee = SHIPPING_FEE;
      const total = subtotal + shippingFee;
      const order = await tx.order.create({
        data: {
          orderNumber: orderNumber(),
          userId: user.id,
          status: "PENDING_PAYMENT",
          currency: "KES",
          subtotal,
          shippingFee,
          total,
          ...parsed.data,
          items: {
            create: freshItems.map((item) => ({ variantId: item.variantId, productName: item.productName, sku: item.sku, size: item.size, quantity: item.quantity, unitPrice: item.unitPrice, lineTotal: item.lineTotal })),
          },
        },
        include: { items: true },
      });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return order;
    });

    return NextResponse.json({ order: result, message: "Order created and awaiting payment." }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "EMPTY_CART") return jsonError("Your cart is empty.", 400);
    if (message === "PRODUCT_UNAVAILABLE") return jsonError("One or more items are no longer available.", 409);
    if (message.startsWith("STOCK:")) return jsonError("Stock changed. Please review your cart.", 409);
    if (message === "STOCK_CHANGED") return jsonError("Stock changed while placing the order. Please try again.", 409);
    return jsonError("Unable to create your order.", 500);
  }
}
