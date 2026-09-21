import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { assertSameOrigin } from "@/lib/http/request";
import { jsonError } from "@/lib/http/response";
import { cartAddSchema, cartUpdateSchema } from "@/lib/validation/ecommerce";
import { cartSubtotal, getOrCreateCart } from "@/lib/services/cart";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError("Please sign in to use your cart.", 401);
  const cart = await getOrCreateCart(user.id);
  return NextResponse.json({ cart, subtotal: cartSubtotal(cart), currency: "KES" });
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const user = await getSessionUser();
  if (!user) return jsonError("Please sign in to add items to your cart.", 401);
  const parsed = cartAddSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid cart item.", 422, parsed.error.flatten());

  const variant = await prisma.productVariant.findFirst({
    where: { id: parsed.data.variantId, product: { status: "ACTIVE" } },
  });
  if (!variant) return jsonError("Product variant not found.", 404);
  const cart = await getOrCreateCart(user.id);
  const existing = cart.items.find((item) => item.variantId === variant.id);
  const nextQuantity = (existing?.quantity ?? 0) + parsed.data.quantity;
  if (nextQuantity > variant.stock) return jsonError(`Only ${variant.stock} item(s) are available.`, 409);

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
    update: { quantity: nextQuantity },
    create: { cartId: cart.id, variantId: variant.id, quantity: parsed.data.quantity },
  });
  const updated = await getOrCreateCart(user.id);
  return NextResponse.json({ cart: updated, subtotal: cartSubtotal(updated), currency: "KES" });
}

export async function PATCH(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const user = await getSessionUser();
  if (!user) return jsonError("Please sign in to update your cart.", 401);
  const parsed = cartUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid cart update.", 422, parsed.error.flatten());

  const cart = await getOrCreateCart(user.id);
  const item = cart.items.find((candidate) => candidate.id === parsed.data.itemId);
  if (!item) return jsonError("Cart item not found.", 404);
  if (parsed.data.quantity > item.variant.stock) return jsonError(`Only ${item.variant.stock} item(s) are available.`, 409);

  if (parsed.data.quantity === 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: parsed.data.quantity } });
  }
  const updated = await getOrCreateCart(user.id);
  return NextResponse.json({ cart: updated, subtotal: cartSubtotal(updated), currency: "KES" });
}

export async function DELETE(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const user = await getSessionUser();
  if (!user) return jsonError("Please sign in to update your cart.", 401);
  const itemId = new URL(request.url).searchParams.get("itemId");
  if (!itemId) return jsonError("Cart item is required.", 422);
  const cart = await getOrCreateCart(user.id);
  await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
  const updated = await getOrCreateCart(user.id);
  return NextResponse.json({ cart: updated, subtotal: cartSubtotal(updated), currency: "KES" });
}
